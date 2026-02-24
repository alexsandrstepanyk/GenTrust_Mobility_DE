# GenTrust - Complete Architecture Overview

## 🏗️ Architecture

### 1. **Mobile Apps**

#### **Client App** (`mobile/`)
Для людей, які замовляють завдання (домашня робота, тощо).

**Структура:**
- 🧾 **Orders** - Список створених замовлень та їх статуси
- ➕ **Create** - Форма для створення нового замовлення
- 👤 **Profile** - Профіль користувача

**Функції:**
- Створення замовлення (title, description, budget, location, subject)
- Слідкування за статусом (PENDING_MODERATION → APPROVED → PUBLISHED)
- Push-повідомлення при схвалені
- Можливість платити за виконання завдання

**Стек:** React Native, Expo SDK 54, axios, expo-notifications

---

#### **School App** (`mobile-school/`)
Для студентів, які виконують завдання та допомагають своєму місту.

**Структура:**
- 📊 **Dashboard** - Статистика та мотиваційне привітання
- 🎒 **Tasks** - Доступні завдання для виконання
- 📸 **Report** - Звіти про пошкодження інфраструктури міста
- 👤 **Profile** - Профіль студента

**Dashboard показує:**
- ✅ Виконано завдань
- ⏳ Незавершених завдань
- 💰 Заробленої суми
- ⭐ Очко добропорядності

**Функції:**
- Прийняття завдань зі списку
- Фотофіксація при завершенні
- Звіти про пошкодження міста (потім модеруються штабом)
- Отримання платежу за виконання
- Отримання push при новому завданні

**Стек:** React Native, Expo SDK 54, axios, expo-notifications

---

### 2. **Backend API** (`src/api/`)

#### **Routes:**

**`POST /api/task-orders`** - Створити замовлення
```json
{
  "title": "Help with math homework",
  "description": "Need help solving algebra problems",
  "subject": "Mathematics",
  "grade": "9",
  "budget": 500,
  "city": "Kyiv",
  "district": "Pecherskyi",
  "location": "School #5"
}
```
→ Замовлення з PENDING_MODERATION відправляється в Master Bot

**`GET /api/task-orders/my`** - Список своїх замовлень
→ Отримує: id, title, status, budget, createdAt

**`GET /api/task-orders/:id`** - Деталі замовлення

**`POST /api/users/push-token`** - Реєстрація push token
```json
{
  "token": "ExponentPushToken[1234...]"
}
```

**`GET /api/users/stats`** - Статистика для dashboard
→ Повертає: completedQuests, incompleteQuests, totalEarned, integrity

---

### 3. **Master Bot Moderation** (`src/master_bot.ts`)

Телеграм бот, який:
1. Отримує нові замовлення від клієнтів
2. Показує ✅ Approve / ❌ Reject кнопки
3. При Approve:
   - Змінює статус замовлення на PUBLISHED
   - Автоматично створює Quest з деталями замовлення
   - Надсилає push-повідомлення студентам про нове завдання
4. При Reject:
   - Змінює статус на REJECTED
   - Сповіщає клієнта

---

### 4. **Staff Panel** (`staff-panel/`)

Web-панель для штабу (модератори, які перевіряють виконані завдання).

**Функції:**
- 📋 Список завдань на перевірку (PENDING_VERIFICATION, SUBMITTED)
- ✅ Схвалити виконання (пройшла перевірка, студент отримує гроші)
- ❌ Відхилити з причиною (потрібно перезробити)
- 📊 Статистика: скільки на перевірці, скільки схвалено, скільки відхилено

**Стек:** React, Vite, axios, Express.js

**Запуск:**
```bash
cd staff-panel
npm install
npm run dev  # Vite на портці 5173
node server.js  # Express на портці 3001
```

---

### 5. **Push Notifications** 🔔

#### **Setup:**
- Мобільні додатки автоматично запитують дозвіл на push при запуску
- Отримують Expo Push Token
- Реєструють token на бекенді (POST /api/users/push-token)

#### **Коли надсилаються push:**
1. ✅ **Замовлення схвалено** → push для клієнта "Your order approved!"
2. 🎯 **Нове завдання** → push для студента "New quest available!"
3. 📝 **Нове замовлення** → push для модераторів (Master Bot)
4. 📸 **Новий звіт** → push для штабу

**Сервіс:** `src/services/pushService.ts`
```typescript
await notifyTaskOrderApproved(userId, "Math homework");
await notifyQuestAvailable(studentId, "Math homework", 500);
await notifyNewTaskOrder(taskOrderId);
```

---

## 🚀 Запуск

### **Бекенд**
```bash
# Компіляція
npm run build

# Запуск
npm start
# API слухає на http://localhost:3000
```

### **Мобільний клієнт** (замовлення)
```bash
cd mobile
npm install
npx expo start --ios  # Або --android
```

### **Мобільний школяра** (виконання)
```bash
cd mobile-school
npm install
npx expo start --ios  # Або --android
```

### **Staff Panel** (модерація)
```bash
cd staff-panel

# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
# Доступний на http://localhost:5173
```

---

## 📱 Flow Користувача

### **Клієнт (Замовляє завдання):**
1. Логін → Вкладка "Create" → Заповнює форму → Submit
2. Бачить замовлення в "Orders" з статусом PENDING_MODERATION
3. Master Bot в Telegram показує замовлення модератору
4. При Approve: отримує push ✅, статус → PUBLISHED
5. Студенти бачать завдання в своєму додатку

### **Студент (Виконує завдання):**
1. Логін → Dashboard (мотивація + статистика)
2. Вкладка "Tasks" → Список доступних завдань
3. Обирає завдання → Фотографує виконання → Submit
4. Статус → SUBMITTED (чекає moderation)
5. Staff Panel показує завдання модератору
6. При Approve: отримує push ✅ + гроші на рахунок

### **Модератор/Штаб:**
1. Master Bot (Telegram) або Staff Panel (Web)
2. Бачить новорядні замовлення/звіти
3. Натискає ✅ або ❌
4. Система автоматично надсилає push всім задіяним

---

## 📊 База Даних

### **User**
```prisma
id, email, telegramId, firstName, lastName
role (SCOUT, CLIENT, ADMIN, MODERATOR)
status (PENDING, ACTIVE, PROBATION)
balance, dignityScore
pushToken  // ← для push-повідомлень
```

### **TaskOrder** (нові замовлення)
```prisma
id, title, description, subject, grade, budget
city, district, location
status (PENDING_MODERATION, APPROVED, REJECTED, PUBLISHED)
requesterId
questId  // Посилання на Quest після Approve
```

### **Quest** (завдання)
```prisma
id, title, description, type, budget
createdAt, status
requester (Client)
scout (Student who accepted)
```

---

## 🔄 Workflow Complete

```
CLIENT                          MASTER BOT              STUDENT                STAFF
   │                                 │                      │                    │
   ├─ Create Order ──────────→ New Order ────────→         │                    │
   │  (PENDING_MODERATION)     [✅ Approve]              │                    │
   │                                │                      │                    │
   │                           ✅ Create Quest ──────→ New Task (push)          │
   │◀─ ✅ Notify (push) ───────────│                      │                    │
   │                                │                  ✅ Accept               │
   │                                │                  📸 Submit ─────────→ Review
   │                                │                  (SUBMITTED)         [✅/❌]
   │                                │                      │                    │
   │                                │                      │◀─────────────── ✅ Approve
   │                                │                      │ (push) + payment    │
```

---

## ⚙️ Налаштування

### **.env**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3000
TELEGRAM_BOT_TOKEN="..."
GEMINI_API_KEY="..."
```

### **app.json** (мобільні)
```json
{
  "expo": {
    "name": "GenTrust - Client",
    "slug": "gentrust-client",
    "android": { "package": "com.gentrust.client" },
    "ios": { "bundleIdentifier": "com.gentrust.client" }
  }
}
```

---

## 🎯 Key Features

✅ **Two-app architecture** - Клієнт і школяр в окремих додатках  
✅ **Push notifications** - Миттєві сповіщення про зміни  
✅ **Master Bot moderation** - Telegram-based approval process  
✅ **Staff web panel** - Modern UI для перевірки завдань  
✅ **Complete stats** - Dashboard з мотивацією для студентів  
✅ **Automatic quest creation** - При approve замовлення автоматично створюється quest  

---

## 📝 Next Steps

1. ✅ Протестувати login/registration на обох додатках
2. ✅ Протестувати створення замовлення (mobile/) 
3. ✅ Перевірити, що Master Bot отримує замовлення
4. ✅ При Approve перевірити що:
   - Quest з'являється в mobile-school
   - Надсилається push студентам
   - Клієнт отримує повідомлення
5. ✅ Студент приймає завдання та робить звіт
6. ✅ Штаб перевіряє в Staff Panel та схвалює
7. ✅ Студент отримує гроші + push про успіх

---

Готово! 🚀
