# 🔄 GENTRUST MOBILITY - АРХІТЕКТУРА СИНХРОНІЗАЦІЇ

## 📋 Резюме

**Проблема:** Завдання, створені клієнтом в додатку, не з'являлись в додатку школяра.

**Причина:** Два різних типи завдань в базі:
- **TaskOrder** (замовлення від клієнтів) 
- **Quest** (завдання для школярів)

Школяр отримував тільки **Quest**, але **TaskOrder** не був синхронізований.

**Рішення:** Автоматична конвертація `TaskOrder → Quest` при затвердженні адміном.

---

## 🏗️ Архітектура

### Таблиці в БД

```
┌─────────────────────────────────────────────────────────────┐
│                    USER                                     │
│  (Школярі, клієнти, адміни)                                 │
└─────────────────────────────────────────────────────────────┘
         ↑                                      ↑
         │ requesterId                          │ assigneeId
         │                                      │
    ┌────┴─────────────────────────┐      ┌────┴──────────────────┐
    │      TASKORDER               │      │      QUEST            │
    ├──────────────────────────────┤      ├───────────────────────┤
    │ • id (UUID)                  │      │ • id (UUID)           │
    │ • title, description         │      │ • title, description  │
    │ • budget (₹)                 │      │ • reward (₹)          │
    │ • subject, grade             │      │ • status              │
    │ • city, district, location   │      │ • city, district      │
    │ • status:                    │      │ • location            │
    │   ├─ PENDING_MODERATION      │      │ • taskOrderId ← LINK! │
    │   ├─ PUBLISHED               │      │ • assigneeId (хто     │
    │   ├─ REJECTED                │      │   виконує)            │
    │   └─ APPROVED                │      │ • pickupCode          │
    │ • requesterId (клієнт)       │      │ • deliveryCode        │
    │ • createdAt, updatedAt       │      │ • createdAt           │
    └────────────────────────────────┘     └───────────────────────┘
```

---

## 🔄 Потік Синхронізації

### 1️⃣ Клієнт Створює Замовлення

```
📱 Mobile App (Клієнт)
  ↓
  CreateTaskOrderScreen
    ↓
    axios.post('/api/task-orders', {
      title: "Помочь с домашним заданием",
      budget: 20,
      city: "Würzburg",
      ...
    })
    ↓
DATABASE: TaskOrder { 
  status: 'PENDING_MODERATION',
  requesterId: 'client-123'
}
    ↓
📨 TELEGRAM: Повідомлення Админу
   "🆕 Нове замовлення завдання"
   [✅ Підтвердити] [❌ Відхилити]
```

**API Endpoint:**
```bash
POST /api/task-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Назва завдання",
  "description": "Детальний опис",
  "subject": "Математика",
  "grade": "10-A",
  "budget": 20,
  "city": "Würzburg",
  "district": "Zellerau",
  "location": "Hauptstraße 5"
}
```

---

### 2️⃣ Адмін Затверджує Замовлення

```
👨‍💼 ADMIN (Telegram або Admin Panel)
  ↓
  Натискає [✅ Підтвердити] або
  API: POST /admin/task-orders/{id}/approve
    ↓
    ✨ MAGIC ✨
    
    TaskOrder { status: 'PENDING_MODERATION' }
         ↓ (конвертація)
    Quest { status: 'OPEN', taskOrderId: 'task-123' }
         ↓
    TaskOrder { status: 'PUBLISHED' }
    ↓
📨 TELEGRAM: Повідомлення Школярам
   "✅ Нове завдання від клієнта!"
   "📝 Назва завдання"
   "💰 Винагорода: 20€"
```

**API Endpoint:**
```bash
POST /admin/task-orders/{id}/approve
Authorization: Bearer {admin_token}

✅ Результат:
{
  "message": "Task order approved and published as quest",
  "quest": { ... },
  "taskOrder": { status: 'PUBLISHED', ... }
}
```

---

### 3️⃣ Школяр Отримує Завдання

```
📱 Mobile App (Школяр)
  ↓
  QuestsScreenClean.js
    ↓
    GET /api/quests/available
    Authorization: Bearer {token}
    ↓
DATABASE QUERY:
  SELECT * FROM Quest 
  WHERE status = 'OPEN' 
  AND city = 'Würzburg'
    ↓
    ✅ ЗНАХОДИТЬ НОВИЙ QUEST
    (який був створений з TaskOrder)
    ↓
📋 展示 на екрані:
  ┌─────────────────────────┐
  │ 🎯 Помочь с домашним... │
  │ 💰 Винагорода: 20€      │
  │ 📍 Würzburg, Zellerau   │
  │ [ВЗЯТИ ЗАВДАННЯ]        │
  └─────────────────────────┘
```

**API Endpoint:**
```bash
GET /api/quests/available
Authorization: Bearer {token}

✅ Результат: массив Quest об'єктів
[
  {
    "id": "quest-456",
    "title": "Помочь с домашным заданием",
    "reward": 20,
    "city": "Würzburg",
    "district": "Zellerau",
    "status": "OPEN",
    "taskOrderId": "task-123"  ← Зв'язок з TaskOrder
  },
  ...
]
```

---

## 🔗 Синхронізація Компонентів

### Система Ботів

```
┌─────────────────────────────────────────────────────────┐
│                 TELEGRAM BOTS                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  bot.ts (Основний бот)                                  │
│  ├─ Слухає команди від школярів                         │
│  ├─ Розповідає про нові завдання                        │
│  └─ Запитує коди доставки                               │
│                                                         │
│  city_hall_bot.ts (Муніципальний бот)                   │
│  ├─ Отримує звіти про поломки (Report)                  │
│  ├─ Показує категорії проблем                           │
│  └─ Призначає комунальникам                             │
│                                                         │
│  master_bot.ts (Адмін бот)                              │
│  ├─ Модерує TaskOrder                                   │
│  ├─ [✅ Затвердити] → AUTO CREATE Quest                │
│  ├─ [❌ Відхилити] → status: REJECTED                   │
│  └─ Показує статистику                                  │
│                                                         │
│  quest_provider_bot.ts (Провайдер бот)                  │
│  ├─ Дозволяє провайдерам створювати Quest               │
│  └─ Управління наявними завданнями                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
         ↓                               ↓
    DATABASE              MOBILE APPS
```

---

## 📱 Мобільні Додатки

### Client App (`mobile/`)
```
📱 /screens
├─ LoginScreen.tsx          → Вхід клієнта
├─ CreateTaskOrderScreen.tsx → Клієнт створює завдання
├─ TaskOrdersScreen.tsx      → Перегляд своїх замовлень
├─ HomeScreen.tsx
└─ ...
```

### School App (`mobile-school/`)
```
📱 /screens
├─ LoginScreen.tsx           → Вхід школяра
├─ QuestsScreenClean.js      → Перегляд доступних Quest
├─ TakeQuestScreen.tsx       → Прийняти завдання
├─ ReportScreen.tsx          → Звітувати про поломки
└─ ...
```

---

## 🧪 Тестування Синхронізації

### 1. Запустити тест

```bash
cd /Users/apple/Desktop/GenTrust_Mobility

# Тест синхронізації
npx ts-node scripts/test_sync.ts

# Міграція старих завдань
npx ts-node scripts/migrate_taskorders.ts

# Перевірка статусу
./check_sync.sh
```

### 2. Результати

```
✨ ТЕСТ ЗАВЕРШЕНО

📋 Резюме синхронізації:
   ✅ Клієнт → TaskOrder (PENDING_MODERATION)
   ✅ Адмін затверджує → TaskOrder (PUBLISHED)
   ✅ AUTO: TaskOrder → Quest (OPEN)
   ✅ Школяр → GET /api/quests/available → бачить Quest
```

---

## 🛡️ Статуси і Переходи

### TaskOrder Статуси

```
PENDING_MODERATION
    ↓ [Адмін затвердив]
PUBLISHED ──────→ REJECTED
    ↓
    └─ AUTO CREATE Quest
       (status: OPEN)
```

### Quest Статуси

```
OPEN
  ↓ [Школяр взяв завдання]
IN_PROGRESS
  ↓ [Школяр завершив]
COMPLETED
  ↓
Нараховується винагорода
```

---

## 🔌 API Ендпоінти

### TaskOrder Management

```
# Клієнт створює замовлення
POST   /api/task-orders
GET    /api/task-orders/my
GET    /api/task-orders/:id
POST   /api/task-orders/:id/approve    (User-level)
POST   /api/task-orders/:id/reject     (User-level)

# Адмін керує затвердженнями
GET    /admin/task-orders/pending
POST   /admin/task-orders/:id/approve
POST   /admin/task-orders/:id/reject
```

### Quest Management

```
# Школяр отримує завдання
GET    /api/quests/available
GET    /api/quests/:id
POST   /api/quests/:id/take            → покладає pickupCode
POST   /api/quests/:id/complete        → перевіряє deliveryCode
```

---

## 💻 Code Examples

### Create TaskOrder (Client)

```typescript
// mobile/screens/CreateTaskOrderScreen.tsx
const submit = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  
  await axios.post(`${API_URL}/task-orders`, {
    title: "Помочь с домашним заданием",
    budget: 20,
    city: "Würzburg",
    // ...
  }, { 
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

### Approve TaskOrder (Admin)

```typescript
// src/api/routes/admin.ts
router.post('/task-orders/:id/approve', auth_admin, async (req, res) => {
  const order = await taskOrder.findUnique({ where: { id: orderId } });
  
  // 1. Create Quest from TaskOrder
  const quest = await quest.create({
    title: order.title,
    reward: order.budget,
    city: order.city,
    taskOrderId: order.id  // Зв'язок!
  });
  
  // 2. Update TaskOrder status
  await taskOrder.update({ 
    where: { id: orderId },
    data: { status: 'PUBLISHED' }
  });
  
  // 3. Notify via Telegram
  await messenger.sendToStudents(`✅ Нове завдання!`);
});
```

### Get Available Quests (School)

```typescript
// mobile-school/screens/QuestsScreenClean.js
const fetchQuests = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  
  const res = await axios.get(
    `${API_URL}/quests/available`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  // Отримує Quest записи (включаючи ті що були створені з TaskOrder)
  setQuests(res.data);
};
```

---

## 🚀 Запуск Системи

### Автоматичний запуск всього

```bash
./start_all.sh

# Включає:
# 1. Backend API (port 3000)
# 2. Staff Panel (port 5173)
# 3. Admin Panel (port 5174)
# 4. Mobile Client (port 8081)
# 5. Mobile School (port 8082)
# 6. Синхронізація завдань (migrate_taskorders.ts)
```

### Перевірка синхронізації

```bash
./check_sync.sh
```

---

## 📊 Моніторинг

### Запити до БД

```sql
-- Скільки завдань від клієнтів
SELECT COUNT(*), status FROM TaskOrder GROUP BY status;

-- Скільки завдань для школярів
SELECT COUNT(*), status FROM Quest GROUP BY status;

-- Завдання з зв'язком TaskOrder ↔ Quest
SELECT q.* FROM Quest q 
WHERE q.taskOrderId IS NOT NULL;
```

### Логи

```bash
# Backend логи
tail -f server_logs.txt

# Ошибки
grep -i "error\|sync\|taskorder" server_logs.txt
```

---

## ✅ Чек-лист для Використання

- [ ] Backend запущено: `npm start`
- [ ] Перевірено синхронізацію: `./check_sync.sh`
- [ ] Клієнт створив замовлення
- [ ] Адмін затвердив в телеграмі
- [ ] Школяр бачить завдання в додатку
- [ ] Школяр взяв завдання
- [ ] Школяр виконав завдання
- [ ] Винагорода нараховується

---

## 🎯 Висновки

✅ **Синхронізація працює!**

**TaskOrder** (від клієнтів) → **Quest** (для школярів) → **Completed** (винагорода)

Автоматична конвертація при затвердженні адміном.

Школяри бачать завдання в режимі реального часу.

Система повністю синхронізована! 🎉
