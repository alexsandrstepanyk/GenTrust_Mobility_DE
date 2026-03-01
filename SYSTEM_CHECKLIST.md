# 🔍 SYSTEM VALIDATION CHECKLIST

**Автоматична перевірка системи перед кожним запуском**

---

## ✅ ОБОВ'ЯЗКОВІ ПЕРЕВІРКИ

### 1. МЕРЕЖЕВІ НАЛАШТУВАННЯ

**Backend API:**
- [ ] Порт: `3000`
- [ ] Слухає на: `0.0.0.0` (ВСІ інтерфейси, НЕ localhost!)
- [ ] Перевірка: `lsof -nP -iTCP:3000 -sTCP:LISTEN | grep "*:3000"`
- [ ] Health endpoint: `curl http://192.168.178.34:3000/api/health`
- [ ] Має повернути: `{"status":"ok"...}`

**Expo Metro Bundler:**
- [ ] Порт: `8082`
- [ ] Режим: `--lan` (НЕ localhost!)
- [ ] IP: `192.168.178.34` (динамічний, перевіряти: `ifconfig en0 | grep "inet "`)
- [ ] Перевірка: QR код показує `exp://192.168.178.34:8082`

**Admin Panel:**
- [ ] Порт: `5173`
- [ ] Слухає: `localhost:5173`

**Staff Panel:**
- [ ] Порт: `5174`
- [ ] Слухає: `localhost:5174`

---

### 2. КОНФІГУРАЦІЙНІ ФАЙЛИ

**mobile-school/config.ts:**
```typescript
const API_HOST = '192.168.178.34';  // АКТУАЛЬНА IP адреса Mac
const API_PORT = '3000';
export const API_URL = `http://${API_HOST}:${API_PORT}/api`;
```
- [ ] API_HOST === поточна IP Mac (ifconfig en0)
- [ ] НЕ localhost, НЕ 127.0.0.1!

**src/api/server.ts:**
```typescript
app.listen(portNumber, '0.0.0.0', () => {  // ВАЖЛИВО: '0.0.0.0'
    console.log(`🚀 GenTrust API Server running on port ${portNumber} (0.0.0.0)`);
});
```
- [ ] Другий параметр: `'0.0.0.0'`
- [ ] НЕ пусто, НЕ localhost!

**mobile-school/metro.config.js:**
```javascript
config.resolver.blockList = [
    new RegExp(path.resolve(__dirname, '../dist') + '/.*'),
    new RegExp(path.resolve(__dirname, '../src') + '/.*'),
    // ... інші backend папки
];
```
- [ ] Виключає: dist, src, prisma, scripts, backups
- [ ] Axios налаштований на browser build

---

### 3. ПРОЦЕСИ ТА ЇХ ПОРЯДОК ЗАПУСКУ

**Крок 1: Очистка старих процесів**
```bash
pkill -9 -f "ts-node|expo|metro|vite"
sleep 3
```

**Крок 2: Очистка кешів (якщо були проблеми)**
```bash
rm -rf mobile-school/.expo
rm -rf node_modules/.cache
rm -rf /tmp/metro-* /tmp/haste-map-*
```

**Крок 3: Backend API (БЕЗ ботів для швидкості)**
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
npx ts-node src/api-only.ts > server.log 2>&1 &
sleep 3
# Перевірка: lsof -nP -iTCP:3000 -sTCP:LISTEN
```

**Крок 4: Expo Metro Bundler**
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-school
npx expo start --port 8082 --lan
# Чекати QR код з exp://192.168.178.34:8082
```

**Крок 5: Admin/Staff панелі (опціонально)**
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/admin-panel && npm run dev &
cd /Users/apple/Desktop/GenTrust_Mobility_DE/staff-panel && npm run dev &
```

---

### 4. ТИПОВІ ПРОБЛЕМИ ТА АВТОФІКСИ

#### ❌ ПРОБЛЕМА: "java.io.IOException" на телефоні

**Причина:** Телефон не може підключитись до backend

**Діагностика:**
1. Backend слухає тільки localhost → ФІКС: змінити на `0.0.0.0`
2. Телефон в іншій Wi-Fi мережі → ФІКС: підключити до тієї ж мережі
3. IP адреса Mac змінилась → ФІКС: оновити config.ts

**Автоматична перевірка:**
```bash
# 1. Перевірити що backend слухає на всіх інтерфейсах
lsof -nP -iTCP:3000 | grep "TCP \*:3000" || echo "ПОМИЛКА: Backend не на 0.0.0.0!"

# 2. Отримати поточну IP
CURRENT_IP=$(ifconfig en0 | grep "inet " | awk '{print $2}')

# 3. Перевірити що config.ts має правильну IP
grep "API_HOST = '$CURRENT_IP'" mobile-school/config.ts || echo "ПОМИЛКА: config.ts має неправильну IP!"

# 4. Тест з телефону через браузер
echo "Відкрийте на телефоні: http://$CURRENT_IP:3000/api/health"
```

**Автофікс backend binding:**
```bash
# Якщо в src/api/server.ts немає '0.0.0.0'
sed -i '' "s/app.listen(portNumber, () => {/app.listen(portNumber, '0.0.0.0', () => {/" src/api/server.ts
```

---

#### ❌ ПРОБЛЕМА: "Attempted to import dist/index.js" або Node modules в React Native

**Причина:** Metro bundler знаходить backend код

**Діагностика:**
```bash
# Перевірити чи існує dist/
ls -d dist/ 2>/dev/null && echo "ПОПЕРЕДЖЕННЯ: dist/ існує!"

# Перевірити metro.config.js
grep "blockList" mobile-school/metro.config.js || echo "ПОМИЛКА: metro.config.js не виключає backend!"
```

**Автофікс:**
```bash
# Видалити dist якщо існує
rm -rf dist/

# Перезапустити Expo з --clear
pkill -9 -f "expo"
cd mobile-school && npx expo start --port 8082 --lan --clear
```

---

#### ❌ ПРОБЛЕМА: Expo показує тільки "y y y y..." або зависає

**Причина:** Безкінечний цикл в React компоненті або Metro bundler запитує підтвердження

**Діагностика:**
```bash
# Перевірити логи Expo
tail -50 /tmp/expo_output.log | grep -E "Error|error|Warning"
```

**Автофікс:**
```bash
pkill -9 -f "expo"
sleep 3
cd mobile-school && npx expo start --port 8082 --lan --clear --non-interactive
```

---

#### ❌ ПРОБЛЕМА: "Quest not found" або помилки в questNotifications.ts

**Причина:** Неправильні поля в Prisma моделях

**Перевірка коду:**
- PersonalTask має `assignedChildId` (НЕ `childId`!)
- Quest має `assigneeId` (НЕ `userId`!)
- Всі notification функції обгорнуті в try-catch

**Автофікс:**
Перевірити src/services/questNotifications.ts:
```typescript
// ПРАВИЛЬНО:
const task = await prisma.personalTask.findUnique({
    where: { id: taskId },
    include: { assignedChild: true }  // НЕ child!
});
if (!task?.assignedChildId) return;  // НЕ childId!
```

---

#### ❌ ПРОБЛЕМА: "Port 8082 is already in use"

**Діагностика:**
```bash
lsof -nP -iTCP:8082 -sTCP:LISTEN
```

**Автофікс:**
```bash
pkill -9 -f "expo.*8082"
# або
kill -9 $(lsof -t -i:8082)
sleep 2
```

---

### 5. БАЗА ДАНИХ

**Перевірка Prisma:**
```bash
# Застосувати всі міграції
npx prisma migrate deploy

# Згенерувати клієнт
npx prisma generate

# Перевірити стан
npx prisma migrate status
```

**Критичні поля User:**
- phone: String?
- address: String?
- birthDate: DateTime?
- school: String?
- grade: String?
- language: String (default: "uk")
- pushToken: String?

**Критичні поля Quest:**
- assigneeId: String?
- status: QuestStatus

**Критичні поля PersonalTask:**
- assignedChildId: String
- createdById: String

---

### 6. ШВИДКИЙ СТАРТ (1 команда)

**Створити скрипт start_mobile_school.sh:**
```bash
#!/bin/bash
set -e

echo "🔍 SYSTEM VALIDATION STARTED"

# 1. Отримати поточну IP
CURRENT_IP=$(ifconfig en0 | grep "inet " | awk '{print $2}')
echo "✓ Current IP: $CURRENT_IP"

# 2. Оновити config.ts якщо потрібно
sed -i '' "s/const API_HOST = '.*';/const API_HOST = '$CURRENT_IP';/" mobile-school/config.ts
echo "✓ Config updated"

# 3. Зупинити старі процеси
pkill -9 -f "ts-node|expo" 2>/dev/null || true
sleep 2
echo "✓ Old processes killed"

# 4. Запустити Backend
npx ts-node src/api-only.ts > server.log 2>&1 &
sleep 3
echo "✓ Backend started on *:3000"

# 5. Перевірити Backend
if lsof -nP -iTCP:3000 | grep -q "\*:3000"; then
    echo "✓ Backend listening on all interfaces"
else
    echo "✗ Backend NOT on 0.0.0.0! Fix src/api/server.ts"
    exit 1
fi

# 6. Запустити Expo
cd mobile-school
npx expo start --port 8082 --lan

echo "🎉 SYSTEM READY!"
echo "Backend: http://$CURRENT_IP:3000/api/health"
echo "Expo: exp://$CURRENT_IP:8082"
```

---

### 7. ФІНАЛЬНА ПЕРЕВІРКА ПЕРЕД ДЕМО/ІНВЕСТОРОМ

**1 хвилина до готовності:**

```bash
# Виконати всі перевірки
./start_mobile_school.sh

# Після запуску перевірити:
✓ Backend health: curl http://192.168.178.34:3000/api/health
✓ QR код показує: exp://192.168.178.34:8082
✓ Телефон може відкрити в браузері: http://192.168.178.34:3000/api/health
✓ Expo Go підключається без помилок
✓ Login працює
✓ Quests завантажуються
✓ Quest completion працює з фото
```

**Якщо щось не працює:**
1. Перевірити логи: `tail -50 server.log`
2. Перевірити Metro: дивитись термінал Expo на помилки
3. Перевірити мережу: `ifconfig en0 | grep inet`
4. Перезапустити: `./start_mobile_school.sh`

---

## 📋 ЧЕКЛИСТ ДЛЯ КОЖНОГО ЗАПУСКУ

- [ ] Отримати поточну IP Mac: `ifconfig en0 | grep inet`
- [ ] Оновити mobile-school/config.ts з новою IP
- [ ] Перевірити src/api/server.ts має `'0.0.0.0'`
- [ ] Вбити всі старі процеси: `pkill -9 -f "ts-node|expo"`
- [ ] Видалити dist якщо є: `rm -rf dist`
- [ ] Запустити Backend: `npx ts-node src/api-only.ts &`
- [ ] Перевірити Backend: `lsof -nP -iTCP:3000 | grep "\*:3000"`
- [ ] Запустити Expo: `cd mobile-school && npx expo start --port 8082 --lan`
- [ ] Перевірити QR: має бути `exp://192.168.178.34:8082`
- [ ] Тест з телефону: відкрити в браузері `http://192.168.178.34:3000/api/health`
- [ ] Якщо працює - сканувати QR в Expo Go

---

## 🚨 КРИТИЧНІ НАЛАШТУВАННЯ (НЕ ЗМІНЮВАТИ БЕЗ ПРИЧИНИ)

1. **Backend ЗАВЖДИ на 0.0.0.0** (не localhost!)
2. **Expo ЗАВЖДИ з --lan** (не tunnel, не localhost!)
3. **config.ts ЗАВЖДИ з актуальною IP Mac**
4. **Metro bundler виключає dist, src, prisma папки**
5. **Запускати api-only.ts** (не index.ts з ботами!)

---

**Останнє оновлення:** 1 березня 2026 р.  
**Поточна IP:** 192.168.178.34  
**Статус:** ✅ Працює  

**Останні виправлення:**
- Backend запуск: збільшено час очікування до 15 секунд
- Expo: автоматично proceed anonymously (не запитує логін)
- config.ts: автоматично оновлюється поточною IP
- Перевірка 0.0.0.0 binding для доступу з телефону

**Швидкий запуск:**
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start_mobile_school.sh
```

Все буде готово за ~20 секунд!
