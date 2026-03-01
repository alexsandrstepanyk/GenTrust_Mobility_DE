#!/usr/bin/env node

/**
 * GENTRUST MOBILITY - СИСТЕМА МОНІТОРИНГУ ПРОЦЕСІВ
 * 
 * Веб-дашборд для відстеження статусу всіх сервісів у реальному часі
 * Запуск: node monitor/server.js
 * URL: http://localhost:9000
 */

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 9000;
const PROJECT_DIR = '/Users/apple/Desktop/GenTrust_Mobility_DE';

// Статична папка для HTML/CSS/JS
app.use(express.static(path.join(__dirname, 'public')));

// Конфігурація сервісів для моніторингу
const SERVICES = [
    {
        id: 'backend-api',
        name: 'Backend API',
        icon: '🌐',
        port: 3000,
        healthCheck: 'http://localhost:3000/api/health',
        logFile: '/tmp/backend.log',
        processName: 'nodemon'
    },
    {
        id: 'admin-panel',
        name: 'Admin Panel (Core Dashboard)',
        icon: '🔐',
        port: 5174,
        healthCheck: 'http://localhost:5174',
        logFile: '/tmp/admin-panel.log',
        processName: 'vite'
    },
    {
        id: 'city-hall-dashboard',
        name: 'City-Hall Dashboard',
        icon: '🏛️',
        port: 5173,
        healthCheck: 'http://localhost:5173',
        logFile: '/tmp/city-hall.log',
        processName: 'vite'
    },
    {
        id: 'staff-panel',
        name: 'Staff Panel',
        icon: '👥',
        port: 5175,
        healthCheck: 'http://localhost:5175',
        logFile: '/tmp/staff-panel.log',
        processName: 'vite',
        optional: true
    },
    {
        id: 'expo-school',
        name: 'Expo Mobile-School',
        icon: '🎓',
        port: 8082,
        healthCheck: 'http://localhost:8082',
        logFile: '/tmp/expo-school.log',
        processName: 'expo'
    },
    {
        id: 'expo-parent',
        name: 'Expo Mobile-Parent (Батьки)',
        icon: '👨‍👩‍👧',
        port: 8083,
        healthCheck: 'http://localhost:8083',
        logFile: '/tmp/expo-parent.log',
        processName: 'expo'
    },
    {
        id: 'expo-client',
        name: 'Expo Mobile-Client',
        icon: '📲',
        port: 8081,
        healthCheck: 'http://localhost:8081',
        logFile: '/tmp/expo-client.log',
        processName: 'expo',
        optional: true
    }
];

// Telegram боти (перевіряємо чи вони запущені через логи backend)
const TELEGRAM_BOTS = [
    { id: 'master-bot', name: 'Master Core Bot', icon: '🤖' },
    { id: 'scout-bot', name: 'Scout Bot', icon: '🔍' },
    { id: 'city-hall-bot', name: 'City Hall Bot', icon: '🏛️' },
    { id: 'quest-provider-bot', name: 'Quest Provider Bot', icon: '🎯' },
    { id: 'municipal-services-bot', name: 'Municipal Services Bot', icon: '🚧' }
];

/**
 * Перевірка чи порт слухається
 */
function checkPort(port) {
    return new Promise((resolve) => {
        exec(`lsof -i :${port} 2>/dev/null | grep LISTEN`, (error, stdout) => {
            resolve(!!stdout.trim());
        });
    });
}

/**
 * HTTP health check
 */
function checkHealth(url) {
    return new Promise((resolve) => {
        exec(`curl -s -o /dev/null -w "%{http_code}" ${url} 2>/dev/null`, (error, stdout) => {
            const status = stdout.trim();
            resolve(status === '200' || status === '000');
        });
    });
}

/**
 * Отримати останні N рядків логу
 */
function getLastLogLines(logFile, lines = 20) {
    return new Promise((resolve) => {
        if (!fs.existsSync(logFile)) {
            resolve('⚠️ Лог-файл не знайдено');
            return;
        }

        try {
            const data = fs.readFileSync(logFile, 'utf8');
            const linesArray = data.split('\n');
            const lastLines = linesArray.slice(-lines).join('\n');
            resolve(lastLines || '(Лог порожній)');
        } catch (err) {
            resolve(`❌ Помилка читання логу: ${err.message}`);
        }
    });
}

/**
 * Перевірка чи Telegram боти запущені (через логи backend)
 */
function checkTelegramBots() {
    return new Promise((resolve) => {
        const backendLog = '/tmp/backend.log';

        if (!fs.existsSync(backendLog)) {
            resolve(TELEGRAM_BOTS.map(bot => ({ ...bot, status: false, message: 'Backend не запущено' })));
            return;
        }

        fs.readFile(backendLog, 'utf8', (err, data) => {
            if (err) {
                resolve(TELEGRAM_BOTS.map(bot => ({ ...bot, status: false, message: 'Помилка читання логу' })));
                return;
            }

            const results = TELEGRAM_BOTS.map(bot => {
                const botRunning = data.includes(`${bot.name} started`) ||
                                   data.includes(`${bot.name} launched`) ||
                                   data.includes('Bot initialized') ||
                                   data.includes('[Bot]') ||
                                   data.includes('[Master Bot]') ||
                                   data.includes('[Scout Bot]') ||
                                   data.includes('[City Hall Bot]') ||
                                   data.includes('[Quest Provider Bot]') ||
                                   data.includes('[Municipal Bot]');

                return {
                    ...bot,
                    status: botRunning,
                    message: botRunning ? '✅ Запущено і працює' : '⚠️ Не знайдено в логах'
                };
            });

            resolve(results);
        });
    });
}

/**
 * Збір статусу всіх сервісів
 */
async function collectServicesStatus() {
    const statuses = [];
    
    for (const service of SERVICES) {
        const portActive = await checkPort(service.port);
        const healthOk = portActive ? await checkHealth(service.healthCheck) : false;
        const logs = await getLastLogLines(service.logFile, 15);
        
        // Аналіз логів на помилки
        const hasErrors = logs.includes('ERROR') || 
                         logs.includes('Error') || 
                         logs.includes('EADDRINUSE') ||
                         logs.includes('failed') ||
                         logs.includes('Failed');
        
        let status = 'offline';
        let message = 'Не запущено';
        
        if (portActive && healthOk) {
            status = 'online';
            message = hasErrors ? '⚠️ Працює, але є помилки' : '✅ Працює без проблем';
        } else if (portActive && !healthOk) {
            status = 'error';
            message = '⚠️ Порт зайнятий, але не відповідає';
        } else if (hasErrors) {
            status = 'error';
            message = '❌ Помилка запуску';
        }
        
        statuses.push({
            ...service,
            status,
            message,
            logs: logs.split('\n').slice(-10).join('\n'), // Останні 10 рядків
            port: service.port,
            portActive,
            healthOk
        });
    }
    
    // Додаємо статус Telegram ботів
    const botsStatus = await checkTelegramBots();
    
    return {
        services: statuses,
        bots: botsStatus,
        timestamp: new Date().toISOString()
    };
}

/**
 * Перевірка статусу бази даних
 */
async function checkDatabase() {
    return new Promise((resolve) => {
        const dbPath = `${PROJECT_DIR}/prisma/dev.db`;
        
        if (!fs.existsSync(dbPath)) {
            resolve({ status: 'error', message: '❌ База даних не знайдена', users: 0 });
            return;
        }
        
        exec(`sqlite3 "${dbPath}" "SELECT COUNT(*) FROM User;" 2>/dev/null`, (error, stdout) => {
            if (error) {
                resolve({ status: 'error', message: '❌ Помилка запиту до БД', users: 0 });
                return;
            }
            
            const userCount = parseInt(stdout.trim()) || 0;
            resolve({
                status: userCount > 0 ? 'online' : 'warning',
                message: userCount > 0 ? `✅ ${userCount} користувачів` : '⚠️ База порожня',
                users: userCount
            });
        });
    });
}

// Socket.IO для real-time оновлення
io.on('connection', (socket) => {
    console.log('✅ Клієнт підключився до моніторингу');
    
    // Відправка статусу кожні 3 секунди
    const interval = setInterval(async () => {
        const status = await collectServicesStatus();
        const dbStatus = await checkDatabase();
        
        socket.emit('status-update', {
            ...status,
            database: dbStatus
        });
    }, 3000);
    
    // Відправка першого статусу одразу
    (async () => {
        const status = await collectServicesStatus();
        const dbStatus = await checkDatabase();
        socket.emit('status-update', {
            ...status,
            database: dbStatus
        });
    })();
    
    socket.on('disconnect', () => {
        console.log('❌ Клієнт від\'єднався');
        clearInterval(interval);
    });
});

// API endpoint для перевірки статусу
app.get('/api/status', async (req, res) => {
    const status = await collectServicesStatus();
    const dbStatus = await checkDatabase();
    
    res.json({
        ...status,
        database: dbStatus
    });
});

// Головна сторінка
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
server.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   🎯 GENTRUST MOBILITY - СИСТЕМА МОНІТОРИНГУ          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`✅ Сервер моніторингу запущено на: http://localhost:${PORT}`);
    console.log(`📊 Відкрийте в браузері: http://localhost:${PORT}`);
    console.log(`🔄 Автоматичне оновлення кожні 3 секунди\n`);
    console.log('Для зупинки: Ctrl+C\n');
});
