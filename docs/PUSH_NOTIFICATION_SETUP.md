# 📱 macOS PUSH NOTIFICATIONS

## 📋 Опис

Сервіс автоматично перевіряє всі сервіси GenTrust кожні **30 секунд** і показує **macOS push-повідомлення** на екран якщо щось не працює.

---

## 🚀 Запуск

### Крок 1: Переконайтеся що Notification Center працює

```bash
# Перевірте що NotificationCenter не заблоковано
System Preferences → Notifications → Terminal → Allow Notifications
```

### Крок 2: Запустіть сервіс

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/monitor
node push_notification_service.js
```

**Все!** Більше нічого налаштовувати не потрібно!

---

## 📊 Що ви будете бачити:

### ❌ Коли сервіс не працює:

```
┌─────────────────────────────────────┐
│  🚨 Backend API не працює!         │
│                                     │
│  🌐 Порт 3000                       │
│  Статус: error                      │
└─────────────────────────────────────┘
```

Звук: **Sosumi** (гучний)

### ✅ Коли сервіс відновився:

```
┌─────────────────────────────────────┐
│  ✅ Backend API відновив роботу!   │
│                                     │
│  🌐 Порт 3000                       │
│  Всі системи працюють нормально     │
└─────────────────────────────────────┘
```

Звук: **Glass** (приємний)

---

## ⚙️ Налаштування

### Змінити інтервал перевірки

Відкрийте `monitor/push_notification_service.js` і змініть:

```javascript
const CONFIG = {
    checkInterval: 60000, // 60 секунд (замість 30)
    // ...
};
```

### Змінити звуки

Відкрийте `monitor/push_notification_service.js`:

```javascript
const sound = urgency === 'critical' ? 'Sosumi' : 'Glass';
// Можливі звуки: Sosumi, Glass, Submarine, Funk, etc.
```

---

## 🛑 Зупинка сервісу

Натисніть `Ctrl+C` в терміналі.

---

## 🔄 Автозапуск разом з системою

### macOS (LaunchAgent)

Створіть файл `~/Library/LaunchAgents/com.gentrust.pushnotify.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.gentrust.pushnotify</string>
    <key>ProgramArguments</key>
    <array>
        <string>node</string>
        <string>/Users/apple/Desktop/GenTrust_Mobility_DE/monitor/push_notification_service.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/apple/Desktop/GenTrust_Mobility_DE/monitor</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/PushNotificationService.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/PushNotificationService.err</string>
</dict>
</plist>
```

Завантажте:
```bash
launchctl load ~/Library/LaunchAgents/com.gentrust.pushnotify.plist
```

---

## 📝 Логи

Логи сервісу зберігаються в:
```
/tmp/PushNotificationService.log
```

Перегляд:
```bash
tail -f /tmp/PushNotificationService.log
```

---

## 🎯 Приклади повідомлень

### Backend API впав:
```
🚨 Backend API не працює!
🌐 Порт 3000
Статус: error
```

### City-Hall Dashboard не відповідає:
```
🚨 City-Hall Dashboard не працює!
🏛️ Порт 5173
Статус: offline
```

### Сервіс відновився:
```
✅ City-Hall Dashboard відновив роботу!
🏛️ Порт 5173
Всі системи працюють нормально
```

---

## ✅ Готово!

Тепер ви будете бачити всі проблеми прямо на екрані MacBook!

---

**Last Updated:** 2026-03-19  
**Version:** v2.0.0 (macOS Native)
