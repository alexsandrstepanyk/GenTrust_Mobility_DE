#!/usr/bin/env node

/**
 * GENTRUST MOBILITY - macOS PUSH NOTIFICATION SERVICE
 * 
 * Перевіряє всі сервіси кожні 30 секунд і показує
 * macOS push-повідомлення якщо щось не працює.
 * 
 * Використання:
 *   node push_notification_service.js
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');

// Конфігурація
const CONFIG = {
    monitorUrl: 'http://localhost:9000/api/status',
    checkInterval: 30000, // 30 секунд
    logFile: '/tmp/PushNotificationService.log'
};

// Стан сервісів (щоб не спамити однаковими повідомленнями)
let previousState = {
    services: {},
    lastAlert: {}
};

// Логірування
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    // Додаємо в лог-файл
    fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
}

// Відправка macOS push-повідомлення
function sendMacOSNotification(title, message, urgency = 'normal') {
    const sound = urgency === 'critical' ? 'Sosumi' : 'Glass';
    
    const script = `
        display notification "${message}" with title "${title}" sound name "${sound}"
    `;
    
    exec(`osascript -e '${script}'`, (error) => {
        if (error) {
            log('❌ Помилка відправки notification: ' + error.message);
        } else {
            log('✅ Notification відправлено');
        }
    });
}

// Перевірка статусу сервісів
async function checkServices() {
    try {
        log('🔍 Перевірка статусу сервісів...');
        
        const response = await new Promise((resolve, reject) => {
            http.get(CONFIG.monitorUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });

        const services = response.services || [];
        const alerts = [];

        // Перевірка кожного сервісу
        for (const service of services) {
            const isOnline = service.status === 'online' || 
                            service.status === 'ok' || 
                            service.healthOk === true;
            
            const serviceName = `${service.icon} ${service.name}`;
            const previousStatus = previousState.services[service.id];

            // Якщо сервіс не працює і це нова помилка
            if (!isOnline && previousStatus !== 'offline') {
                log(`❌ ${serviceName} - OFFLINE`);
                
                const alertTitle = `🚨 ${service.name} не працює!`;
                const alertMessage = `${service.icon} Порт ${service.port}\nСтатус: ${service.status || 'error'}`;
                
                alerts.push({
                    service: serviceName,
                    title: alertTitle,
                    message: alertMessage,
                    urgency: 'critical'
                });
            }

            // Якщо сервіс відновився
            if (isOnline && previousStatus === 'offline') {
                log(`✅ ${serviceName} - відновив роботу!`);
                sendMacOSNotification(
                    `✅ ${service.name} відновив роботу!`,
                    `${service.icon} Порт ${service.port}\nВсі системи працюють нормально`,
                    'normal'
                );
            }

            previousState.services[service.id] = isOnline ? 'online' : 'offline';
        }

        // Відправка всіх警报
        for (const alert of alerts) {
            // Не спамити - не частіше ніж раз на 5 хвилин для кожного сервісу
            const now = Date.now();
            const lastAlert = previousState.lastAlert[alert.service] || 0;
            
            if (now - lastAlert > 300000) { // 5 хвилин
                sendMacOSNotification(alert.title, alert.message, alert.urgency);
                previousState.lastAlert[alert.service] = now;
            }
        }

        log(`✅ Перевірку завершено. Знайдено проблем: ${alerts.length}`);
        
    } catch (error) {
        log('❌ Помилка перевірки: ' + error.message);
    }
}

// Головна функція
async function main() {
    log('╔═══════════════════════════════════════════════════════════╗');
    log('║    🚀 PUSH NOTIFICATION SERVICE ЗАПУЩЕНО                 ║');
    log('╚═══════════════════════════════════════════════════════════╝');
    log('');
    log(`📊 Monitor URL: ${CONFIG.monitorUrl}`);
    log(`⏱️  Інтервал перевірки: ${CONFIG.checkInterval / 1000} секунд`);
    log(`📱 Telegram: ${CONFIG.telegramBotToken ? '✅ Налаштовано' : '❌ Не налаштовано'}`);
    log('');
    log('Натисніть Ctrl+C для зупинки');
    log('');

    // Перша перевірка одразу
    await checkServices();

    // Подальші перевірки по інтервалу
    setInterval(checkServices, CONFIG.checkInterval);
}

// Обробка зупинки
process.on('SIGINT', () => {
    log('');
    log('🛑 Зупинка сервісу...');
    process.exit(0);
});

// Запуск
main().catch(console.error);
