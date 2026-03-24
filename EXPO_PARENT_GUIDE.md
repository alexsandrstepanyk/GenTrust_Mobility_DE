# 🚀 Expo Parent App - Швидкий Запуск

## 📋 Опис

**Expo Parent App** - мобільний додаток для батьків для управління завданнями дітей та підтвердження виконання квестів.

**Порт:** 8083  
**URL:** `exp://ВАША_IP:8083`

---

## ⚡ Швидкий Старт

### 1️⃣ Запуск

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start_parent.sh
```

### 2️⃣ Підключення

**Варіант A: Expo Go на телефоні**
1. Відкрийте **Expo Go** на телефоні
2. Відскануйте QR код з терміналу
3. Або введіть URL: `exp://192.168.X.X:8083`

**Варіант B: iOS Simulator**
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-parent
node node_modules/@expo/cli/build/bin/cli run:ios
```

### 3️⃣ Вхід

```
Email: admin@parent.com
Password: admin
```

---

## 🛑 Зупинка

```bash
./stop_parent.sh
```

---

## 🔍 Перевірка Статусу

```bash
# Перевірка порту
lsof -ti:8083 && echo "✅ Працює" || echo "❌ Зупинено"

# Перегляд логів
tail -f /tmp/expo-parent.log

# Перевірка процесів
ps aux | grep expo | grep 8083
```

---

## 🧹 Очищення Кешу

### Тільки Expo Parent кеш (рекомендовано):

```bash
./start_parent.sh  # Автоматично очистить кеш
```

### Повне перевстановлення залежностей:

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-parent
rm -rf node_modules package-lock.json .expo
npm install
```

---

## 🐛 Вирішення Проблем

### Помилка: "Cannot find module '@expo/cli'"

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-parent
npm install @expo/cli --save-dev
```

### Помилка: "Port 8083 already in use"

```bash
# Звільнити порт
lsof -ti:8083 | xargs kill -9

# Запустити знову
./start_parent.sh
```

### Помилка: "Metro bundler error"

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-parent
rm -rf node_modules/.cache/metro
rm -rf .expo
./start_parent.sh
```

### Додаток не підключається до Backend

1. Перевірте що Backend працює:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Оновіть IP в `mobile-parent/config.ts`:
   ```typescript
   const API_HOST = '192.168.178.34';  // Ваша IP Mac
   ```

3. Перезапустіть Expo Parent:
   ```bash
   ./stop_parent.sh
   ./start_parent.sh
   ```

---

## 📊 Моніторинг через Dashboard

Відкрийте **Monitor Dashboard**: http://localhost:9000

Знайдіть картку **"Expo Mobile-Parent (Батьки)"**:
- ✅ **Статус:** Online/Offline
- 📋 **Логи:** Останні 10 рядків
- 🎮 **Кнопки:** Старт/Стоп/Рестарт

---

## 📁 Структура Файлів

```
mobile-parent/
├── app.json                 # Expo конфігурація
├── config.ts                # API конфігурація (IP адреса!)
├── package.json             # Залежності
├── App.tsx                  # Головний компонент
├── screens/                 # Екрани додатку
│   ├── HomeScreen.tsx
│   ├── TasksScreen.tsx
│   ├── ProfileScreen.tsx
│   └── ...
├── services/                # Сервіси
│   ├── api.ts
│   ├── i18n.ts
│   └── pushNotifications.ts
└── assets/                  # Ресурси
```

---

## 🔧 Конфігурація

### `config.ts` - API Налаштування

```typescript
const API_HOST = '192.168.178.34';  // IP вашого Mac
const API_PORT = '3000';

export const API_URL = `http://${API_HOST}:${API_PORT}/api`;
```

**Як дізнатися IP Mac:**
```bash
ifconfig en0 | grep inet
```

---

## 📝 Логи

| Лог Файл | Шлях | Перегляд |
|----------|------|----------|
| Expo Parent | `/tmp/expo-parent.log` | `tail -f /tmp/expo-parent.log` |

---

## 🎯 Корисні Команди

```bash
# Запуск з очищенням кешу
./start_parent.sh

# Запуск без очищення кешу
cd mobile-parent
node node_modules/@expo/cli/build/bin/cli start --port 8083 --lan

# Запуск на конкретному IP
cd mobile-parent
node node_modules/@expo/cli/build/bin/cli start --host 192.168.178.34 --port 8083

# Зупинка
./stop_parent.sh

# Перевірка статусу
lsof -ti:8083

# Перегляд логів в реальному часі
tail -f /tmp/expo-parent.log
```

---

## 🆘 Якщо Нічого Не Допомагає

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-parent

# Повне скидання
killall -9 node expo
lsof -ti:8083 | xargs kill -9
rm -rf node_modules .expo node_modules/.cache

# Перевстановлення
npm install

# Запуск
./start_parent.sh
```

---

**Останнє оновлення:** 2026-03-23  
**Версія:** v6.0.2  
**Статус:** ✅ Працює
