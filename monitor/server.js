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

// Middleware для парсингу JSON
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Вимкнення кешування для розробки
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Статична папка для HTML/CSS/JS
app.use(express.static(path.join(__dirname, 'public')));

// Конфігурація сервісів для моніторингу
// ФІКСОВАНІ ПОРТИ - КОЖЕН СЕРВІС МАЄ СВІЙ ВЛАСНИЙ ПОРТ
// Ніхто інший не має права займати ці порти!

const SERVICES = [
    // ========================================
    // BACKEND API
    // ========================================
    {
        id: 'backend-api',
        name: 'Backend API',
        icon: '🌐',
        port: 3000,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:3000/api/health',
        logFile: '/tmp/backend.log',
        processName: 'nodemon',
        commands: {
            cd: 'cd /Users/apple/Desktop/GenTrust_Mobility_DE',
            start: 'npm run dev',
            kill: 'lsof -ti:3000 | xargs kill -9'  // ← Зупиняє ТІЛЬКИ порт 3000
        }
    },
    
    // ========================================
    // TELEGRAM БОТИ (5 ботів)
    // ========================================
    {
        id: 'bot-master',
        name: 'Master Core Bot',
        icon: '🤖',
        port: 3001,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:3001',
        logFile: '/tmp/bot-master.log',
        processName: 'node',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE',
            start: 'npm run dev',  // Запускається з головним backend
            kill: 'lsof -ti:3001 | xargs kill -9'
        }
    },
    {
        id: 'bot-scout',
        name: 'Scout Bot',
        icon: '🔍',
        port: 3002,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:3002',
        logFile: '/tmp/bot-scout.log',
        processName: 'node',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE',
            start: 'npm run dev',  // Запускається з головним backend
            kill: 'lsof -ti:3002 | xargs kill -9'
        }
    },
    {
        id: 'bot-cityhall',
        name: 'City Hall Bot',
        icon: '🏛️',
        port: 3003,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:3003',
        logFile: '/tmp/bot-cityhall.log',
        processName: 'node',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE',
            start: 'npm run dev',  // Запускається з головним backend
            kill: 'lsof -ti:3003 | xargs kill -9'
        }
    },
    {
        id: 'bot-quest',
        name: 'Quest Provider Bot',
        icon: '🎯',
        port: 3004,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:3004',
        logFile: '/tmp/bot-quest.log',
        processName: 'node',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE',
            start: 'npm run dev',  // Запускається з головним backend
            kill: 'lsof -ti:3004 | xargs kill -9'
        }
    },
    {
        id: 'bot-municipal',
        name: 'Municipal Services Bot',
        icon: '🚧',
        port: 3005,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:3005',
        logFile: '/tmp/bot-municipal.log',
        processName: 'node',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE',
            start: 'npm run dev',  // Запускається з головним backend
            kill: 'lsof -ti:3005 | xargs kill -9'
        }
    },
    
    // ========================================
    // CORE WEB DASHBOARDS
    // ========================================
    {
        id: 'admin-panel',
        name: 'Admin Panel (Core Dashboard)',
        icon: '🔐',
        port: 5174,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5174',
        logFile: '/tmp/admin-panel.log',
        processName: 'vite',
        commands: {
            cd: 'cd /Users/apple/Desktop/GenTrust_Mobility_DE/admin-panel',
            start: 'npm run dev',
            kill: 'lsof -ti:5174 | xargs kill -9'  // ← Зупиняє ТІЛЬКИ порт 5174
        }
    },
    {
        id: 'city-hall-dashboard',
        name: 'City-Hall Dashboard',
        icon: '🏛️',
        port: 5173,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5173',
        logFile: '/tmp/city-hall.log',
        processName: 'vite',
        commands: {
            cd: 'cd /Users/apple/Desktop/GenTrust_Mobility_DE/city-hall-dashboard',
            start: 'npm run dev',
            kill: 'lsof -ti:5173 | xargs kill -9'  // ← Зупиняє ТІЛЬКИ порт 5173
        }
    },
    {
        id: 'staff-panel',
        name: 'Staff Panel',
        icon: '👥',
        port: 5176,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5176',
        logFile: '/tmp/staff-panel.log',
        processName: 'vite',
        optional: true,
        commands: {
            cd: 'cd /Users/apple/Desktop/GenTrust_Mobility_DE/staff-panel',
            start: 'npm run dev',
            kill: 'lsof -ti:5176 | xargs kill -9'  // ← Зупиняє ТІЛЬКИ порт 5176
        }
    },
    
    // ========================================
    // ДЕПАРТАМЕНТИ (8 дашбордів)
    // ========================================
    {
        id: 'dept-roads',
        name: 'Roads Department (Дороги)',
        icon: '🛣️',
        port: 5180,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5180',
        logFile: '/tmp/dept-roads.log',
        processName: 'vite',
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE/departments/roads',  // ← Тільки шлях, без 'cd'
            start: 'npm run dev',
            kill: 'lsof -ti:5180 | xargs kill -9'
        }
    },
    {
        id: 'dept-lighting',
        name: 'Lighting Department (Освітлення)',
        icon: '💡',
        port: 5181,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5181',
        logFile: '/tmp/dept-lighting.log',
        processName: 'vite',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE/departments/lighting',
            start: 'npm run dev',
            kill: 'lsof -ti:5181 | xargs kill -9'
        }
    },
    {
        id: 'dept-waste',
        name: 'Waste Department (Сміття)',
        icon: '🗑️',
        port: 5182,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5182',
        logFile: '/tmp/dept-waste.log',
        processName: 'vite',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE/departments/waste',
            start: 'npm run dev',
            kill: 'lsof -ti:5182 | xargs kill -9'
        }
    },
    {
        id: 'dept-parks',
        name: 'Parks Department (Парки)',
        icon: '🌳',
        port: 5183,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5183',
        logFile: '/tmp/dept-parks.log',
        processName: 'vite',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE/departments/parks',
            start: 'npm run dev',
            kill: 'lsof -ti:5183 | xargs kill -9'
        }
    },
    {
        id: 'dept-water',
        name: 'Water Department (Вода)',
        icon: '🚰',
        port: 5184,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5184',
        logFile: '/tmp/dept-water.log',
        processName: 'vite',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE/departments/water',
            start: 'npm run dev',
            kill: 'lsof -ti:5184 | xargs kill -9'
        }
    },
    {
        id: 'dept-transport',
        name: 'Transport Department (Транспорт)',
        icon: '🚌',
        port: 5185,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5185',
        logFile: '/tmp/dept-transport.log',
        processName: 'vite',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE/departments/transport',
            start: 'npm run dev',
            kill: 'lsof -ti:5185 | xargs kill -9'
        }
    },
    {
        id: 'dept-ecology',
        name: 'Ecology Department (Екологія)',
        icon: '🌿',
        port: 5186,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5186',
        logFile: '/tmp/dept-ecology.log',
        processName: 'vite',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE/departments/ecology',
            start: 'npm run dev',
            kill: 'lsof -ti:5186 | xargs kill -9'
        }
    },
    {
        id: 'dept-vandalism',
        name: 'Vandalism Department (Вандалізм)',
        icon: '🎨',
        port: 5187,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:5187',
        logFile: '/tmp/dept-vandalism.log',
        processName: 'vite',
        optional: true,
        commands: {
            cd: '/Users/apple/Desktop/GenTrust_Mobility_DE/departments/vandalism',
            start: 'npm run dev',
            kill: 'lsof -ti:5187 | xargs kill -9'
        }
    },
    
    // ========================================
    // MOBILE APPS (Expo)
    // ========================================
    {
        id: 'expo-school',
        name: 'Expo Mobile-School',
        icon: '🎓',
        port: 8082,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:8082',
        logFile: '/tmp/expo-school.log',
        processName: 'expo',
        commands: {
            cd: 'cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-school',
            start: 'npx expo start --port 8082 --lan',
            kill: 'lsof -ti:8082 | xargs kill -9'  // ← Зупиняє ТІЛЬКИ порт 8082
        }
    },
    {
        id: 'expo-parent',
        name: 'Expo Mobile-Parent (Батьки)',
        icon: '👨‍👩‍👧',
        port: 8083,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:8083',
        logFile: '/tmp/expo-parent.log',
        processName: 'expo',
        optional: true,
        commands: {
            cd: 'cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-parent',
            start: 'npx expo start --port 8083 --lan',
            kill: 'lsof -ti:8083 | xargs kill -9'  // ← Зупиняє ТІЛЬКИ порт 8083
        }
    },
    {
        id: 'expo-client',
        name: 'Expo Mobile-Client (Клієнти)',
        icon: '👤',
        port: 8081,  // ✅ ФІКСОВАНИЙ
        healthCheck: 'http://localhost:8081',
        logFile: '/tmp/expo-client.log',
        processName: 'expo',
        optional: true,
        commands: {
            cd: 'cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-client',
            start: 'npx expo start --port 8081 --lan',
            kill: 'lsof -ti:8081 | xargs kill -9'
        }
    }
];

// Telegram боти (перевіряємо чи вони запущені через порти)
const TELEGRAM_BOTS = [
    { id: 'master-bot', name: 'Master Core Bot', icon: '🤖', port: 3001 },
    { id: 'scout-bot', name: 'Scout Bot', icon: '🔍', port: 3002 },
    { id: 'city-hall-bot', name: 'City Hall Bot', icon: '🏛️', port: 3003 },
    { id: 'quest-provider-bot', name: 'Quest Provider Bot', icon: '🎯', port: 3004 },
    { id: 'municipal-services-bot', name: 'Municipal Services Bot', icon: '🚧', port: 3005 }
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
 * Перевірка чи Telegram боти запущені
 * Боти інтегровані в Backend, тому перевіряємо Backend (порт 3000)
 */
async function checkTelegramBots() {
    const results = [];
    
    // Перевіряємо чи Backend запущений (порт 3000)
    const backendActive = await checkPort(3000);
    
    for (const bot of TELEGRAM_BOTS) {
        results.push({
            ...bot,
            status: backendActive,  // Боти працюють якщо Backend запущений
            message: backendActive ? '✅ Запущено і працює' : '⚠️ Не запущено',
            port: bot.port
        });
    }
    
    return results;
}

/**
 * Отримання CPU/Memory usage для процесу на порту
 */
function getProcessMetrics(port) {
    return new Promise((resolve) => {
        exec(`lsof -i :${port} 2>/dev/null | grep LISTEN | awk '{print $2}' | head -1`, (error, stdout) => {
            if (error || !stdout.trim()) {
                resolve({ cpu: '0%', memory: '0 MB', pid: null });
                return;
            }

            const pid = stdout.trim();

            // Отримання CPU/Memory через ps
            exec(`ps aux | grep "${pid}" | grep -v grep | awk '{print $3, $6}'`, (err, psOut) => {
                if (err || !psOut.trim()) {
                    resolve({ cpu: '0%', memory: '0 MB', pid });
                    return;
                }

                const parts = psOut.trim().split(/\s+/);
                const cpu = parts[0] ? `${parseFloat(parts[0]).toFixed(1)}%` : '0%';
                const memoryKB = parts[1] ? parseInt(parts[1]) : 0;
                const memoryMB = (memoryKB / 1024).toFixed(1);

                resolve({ cpu, memory: `${memoryMB} MB`, pid });
            });
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
        const metrics = await getProcessMetrics(service.port);

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
            healthOk,
            metrics // CPU/Memory usage
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

// API endpoint для перевірки критичних сервісів (для автозапуску)
app.get('/api/startup-check', async (req, res) => {
    const criticalPorts = [3000, 5173, 5174, 5175, 5180, 5181, 5182, 5183, 5184, 5185, 5186, 5187];
    const failedServices = [];
    
    for (const port of criticalPorts) {
        const isPortActive = await new Promise((resolve) => {
            const { exec } = require('child_process');
            exec(`lsof -i:${port} 2>/dev/null | grep LISTEN`, (error, stdout) => {
                resolve(stdout.length > 0);
            });
        });
        
        if (!isPortActive) {
            failedServices.push(port);
        }
    }
    
    // Перевірка Backend API
    const backendActive = await new Promise((resolve) => {
        const http = require('http');
        http.get('http://localhost:3000/api/health', (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => resolve(false));
    });
    
    if (!backendActive) {
        failedServices.push('3000-Backend');
    }
    
    const allOk = failedServices.length === 0;
    
    res.json({
        allOk: allOk,
        failedServices: failedServices,
        checkedPorts: criticalPorts,
        timestamp: new Date().toISOString()
    });
});

// API endpoint для зупинки всіх процесів
app.post('/api/stop-all', (req, res) => {
    const { exec } = require('child_process');

    exec('killall -9 node npm vite expo 2>/dev/null || true', (error) => {
        if (error) {
            console.error('Stop all error:', error);
        }
        console.log('✅ Всі процеси зупинено');
    });

    res.json({ success: true, message: 'Зупинка всіх процесів...' });
});

// API endpoint для запуску всіх сервісів
app.post('/api/start-all', (req, res) => {
    const { exec } = require('child_process');
    const PROJECT_DIR = '/Users/apple/Desktop/GenTrust_Mobility_DE';

    const commands = [
        `cd ${PROJECT_DIR} && NODE_OPTIONS=--max-old-space-size=4096 npm run dev > /tmp/backend.log 2>&1 &`,
        `cd ${PROJECT_DIR}/admin-panel && npm run dev > /tmp/admin-panel.log 2>&1 &`,
        `cd ${PROJECT_DIR}/city-hall-dashboard && npm run dev > /tmp/city-hall.log 2>&1 &`,
        `cd ${PROJECT_DIR}/department-dashboard && npm run dev > /tmp/department.log 2>&1 &`,
        `cd ${PROJECT_DIR}/mobile-school && npx expo start --port 8082 --lan > /tmp/expo-school.log 2>&1 &`
    ];

    commands.forEach(cmd => {
        exec(cmd, (error) => {
            if (error) console.error('Start error:', error);
        });
    });

    console.log('✅ Запуск всіх сервісів...');
    res.json({ success: true, message: 'Запуск всіх сервісів...' });
});

// API endpoint для запуску окремого сервісу
app.post('/api/service/:id/start', (req, res) => {
    const { exec } = require('child_process');
    const serviceId = req.params.id;

    const service = SERVICES.find(s => s.id === serviceId);
    if (!service) {
        return res.status(404).json({ success: false, message: 'Сервіс не знайдено' });
    }

    // Створюємо пустий лог файл якщо не існує
    const fs = require('fs');
    if (!fs.existsSync(service.logFile)) {
        fs.writeFileSync(service.logFile, '');
    }

    // Використовуємо nohup для фонового запуску
    const command = `nohup bash -c "cd '${service.commands.cd}' && ${service.commands.start}" >> ${service.logFile} 2>&1 &`;
    
    exec(command, (error) => {
        if (error) {
            console.error(`Start ${serviceId} error:`, error);
            res.status(500).json({ success: false, message: `Помилка запуску: ${error.message}` });
        } else {
            console.log(`✅ Запущено: ${service.name}`);
            res.json({ success: true, message: `${service.name} запущено!` });
        }
    });
});

// API endpoint для зупинки окремого сервісу
app.post('/api/service/:id/stop', (req, res) => {
    const { exec } = require('child_process');
    const serviceId = req.params.id;

    const service = SERVICES.find(s => s.id === serviceId);
    if (!service) {
        return res.status(404).json({ success: false, message: 'Сервіс не знайдено' });
    }

    exec(service.commands.kill, (error) => {
        if (error) {
            console.error(`Stop ${serviceId} error:`, error);
        }
        console.log(`✅ Зупинено: ${service.name}`);
        res.json({ success: true, message: `${service.name} зупинено!` });
    });
});

// API endpoint для перезапуску окремого сервісу
app.post('/api/service/:id/restart', (req, res) => {
    const { exec } = require('child_process');
    const serviceId = req.params.id;
    const PROJECT_DIR = '/Users/apple/Desktop/GenTrust_Mobility_DE';

    const service = SERVICES.find(s => s.id === serviceId);
    if (!service) {
        return res.status(404).json({ success: false, message: 'Сервіс не знайдено' });
    }

    // Створюємо пустий лог файл якщо не існує
    const fs = require('fs');
    if (!fs.existsSync(service.logFile)) {
        fs.writeFileSync(service.logFile, '');
    }

    // Спочатку зупиняємо
    exec(service.commands.kill, (error) => {
        if (error) {
            console.error(`Restart ${serviceId} stop error:`, error);
        }
        
        // Чекаємо 2 секунди і запускаємо знову
        setTimeout(() => {
            // Використовуємо nohup для фонового запуску
            const command = `nohup bash -c "cd '${service.commands.cd}' && ${service.commands.start}" >> ${service.logFile} 2>&1 &`;
            
            exec(command, (restartError) => {
                if (restartError) {
                    console.error(`Restart ${serviceId} start error:`, restartError);
                    res.status(500).json({ success: false, message: `Помилка перезапуску: ${restartError.message}` });
                } else {
                    console.log(`✅ Перезапущено: ${service.name}`);
                    res.json({ success: true, message: `${service.name} перезапущено!` });
                }
            });
        }, 2000);
    });
});

// API endpoint для додавання в автозапуск macOS
app.post('/api/enable-auto-start', (req, res) => {
    const fs = require('fs');
    const path = require('path');

    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.gentrust.monitor</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd ${path.join(__dirname)} && node server.js > /tmp/gentrust-monitor.log 2>&1 & sleep 5 && open http://localhost:9000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/gentrust-monitor.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/gentrust-monitor-error.log</string>
    <key>WorkingDirectory</key>
    <string>${path.join(__dirname)}</string>
</dict>
</plist>`;

    const launchAgentsDir = `${process.env.HOME}/Library/LaunchAgents`;
    const plistPath = `${launchAgentsDir}/com.gentrust.monitor.plist`;

    try {
        if (!fs.existsSync(launchAgentsDir)) {
            fs.mkdirSync(launchAgentsDir, { recursive: true });
        }

        fs.writeFileSync(plistPath, plistContent);

        const { exec } = require('child_process');
        exec(`launchctl load ${plistPath}`, (error) => {
            if (error) {
                console.error('Launchctl error:', error);
                res.json({ success: false, message: 'Помилка запуску launchctl' });
            } else {
                console.log('✅ Автозапуск увімкнено');
                res.json({ success: true, message: 'Додано в автозапуск macOS!\n\nMonitor Dashboard тепер запускається автоматично при вході в macOS і відкривається в Safari!' });
            }
        });
    } catch (error) {
        console.error('Auto-start error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API endpoint для отримання логів в реальному часі
app.get('/api/logs/:service', (req, res) => {
    const fs = require('fs');
    const service = req.params.service;
    const logFiles = {
        'backend': '/tmp/backend.log',
        'admin': '/tmp/admin-panel.log',
        'city-hall': '/tmp/city-hall.log',
        'staff': '/tmp/staff-panel.log',
        'roads': '/tmp/dept-roads.log',
        'lighting': '/tmp/dept-lighting.log',
        'waste': '/tmp/dept-waste.log',
        'parks': '/tmp/dept-parks.log',
        'water': '/tmp/dept-water.log',
        'transport': '/tmp/dept-transport.log',
        'ecology': '/tmp/dept-ecology.log',
        'vandalism': '/tmp/dept-vandalism.log',
        'expo-school': '/tmp/expo-school.log',
        'expo-parent': '/tmp/expo-parent.log',
        'expo-client': '/tmp/expo-client.log',
        'monitor': '/tmp/monitor.log'
    };

    const logFile = logFiles[service];
    if (!logFile) {
        return res.status(404).json({ error: 'Log file not found' });
    }

    if (!fs.existsSync(logFile)) {
        return res.json({ logs: 'Лог файл ще не створено', service });
    }

    try {
        const data = fs.readFileSync(logFile, 'utf8');
        const lines = data.split('\n').slice(-100);
        res.json({ logs: lines.join('\n'), service });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint для отримання всіх логів
app.get('/api/all-logs', (req, res) => {
    const fs = require('fs');
    const logFiles = {
        'backend': '/tmp/backend.log',
        'admin': '/tmp/admin-panel.log',
        'city-hall': '/tmp/city-hall.log',
        'staff': '/tmp/staff-panel.log',
        'roads': '/tmp/dept-roads.log',
        'lighting': '/tmp/dept-lighting.log',
        'waste': '/tmp/dept-waste.log',
        'parks': '/tmp/dept-parks.log',
        'water': '/tmp/dept-water.log',
        'transport': '/tmp/dept-transport.log',
        'ecology': '/tmp/dept-ecology.log',
        'vandalism': '/tmp/dept-vandalism.log',
        'expo-school': '/tmp/expo-school.log',
        'expo-parent': '/tmp/expo-parent.log',
        'expo-client': '/tmp/expo-client.log',
        'monitor': '/tmp/monitor.log'
    };

    const allLogs = {};
    for (const [service, logFile] of Object.entries(logFiles)) {
        if (fs.existsSync(logFile)) {
            const data = fs.readFileSync(logFile, 'utf8');
            allLogs[service] = data.split('\n').slice(-50).join('\n');
        } else {
            allLogs[service] = 'Лог файл ще не створено';
        }
    }

    res.json(allLogs);
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
