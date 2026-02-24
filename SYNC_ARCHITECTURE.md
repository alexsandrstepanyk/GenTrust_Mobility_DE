# 🔄 Архітектура Синхронізації GenTrust Mobility

## 📊 Поточна Структура

### Таблиці в БД:
```
User (учасники)
├── Role: SCOUT, ADMIN, MODERATOR
├── school, grade, city, district

Provider (постачальники)
├── type: BUSINESS, SCHOOL, GOV

Quest (завдання з провайдерів)
├── title, description, reward
├── status: OPEN, IN_PROGRESS, COMPLETED
├── city, district, location
├── providerId (хто створив)
├── assigneeId (хто виконує)
├── pickupCode, deliveryCode

TaskOrder (замовлення від клієнтів)
├── title, description, budget
├── status: PENDING_MODERATION, APPROVED, REJECTED, PUBLISHED
├── subject, grade (для школи)
├── city, district, location
├── requesterId (клієнт)
├── questId (можливо пов'язаний Quest)
```

## ❌ ПРОБЛЕМА: TaskOrder не синхронізується з Quest

### Потік Даних:
```
КЛІЄНТ (мобільний додаток)
  ↓
  CREATE: POST /api/task-orders
    ↓
    SAVED: TaskOrder { status: PENDING_MODERATION }
    ↓
    SENT TO TELEGRAM BOT: Повідомлення админу на модерацію
    
    
ШКОЛЯР (мобільний додаток)
  ↓
  GET: /api/quests/available
    ↓
    SHOWS: Quest records (ЛИШЕ старі тестові завдання!)
    ✗ НЕ ВИДИТ: Нові TaskOrder завдання
```

## ✅ РІШЕННЯ: Синхронізація TaskOrder → Quest

### Варіант 1: Автоматична конвертація при затвердженні
1. Адмін затверджує TaskOrder в телеграм боті
2. Ендпоінт `/task-orders/:id/approve` конвертує в Quest
3. Quest стає видимим для школярів

### Варіант 2: Дублювання в GET /quests/available
Ендпоінт повинен повертати:
- Звичайні Quest записи
- + TaskOrder з status: PUBLISHED/APPROVED

## 🔌 API Ендпоінти (Потребують Фіксу)

### Backend:
- ✅ `POST /api/task-orders` - створення (працює)
- ✅ `GET /api/task-orders/my` - список свої замовлення (працює)
- ❌ `GET /api/quests/available` - НЕ включає TaskOrder!
- ❌ `POST /api/task-orders/:id/approve` - немає ендпоінту!

### Мобільний Клієнт:
- ✅ `mobile/screens/CreateTaskOrderScreen.tsx` - створює замовлення
- ✅ `mobile/screens/TaskOrdersScreen.tsx` - переглядає свої

### Мобільна Школа:
- ✅ `mobile-school/screens/QuestsScreenClean.js` - отримує з `/quests/available`
- ❌ НЕ БАЧИТЬ нові TaskOrder тому що вони не в таблиці Quest!

## 💬 Телеграм Боти (Синхронізація)

### `bot.ts` - Основний бот
- Слухає команди від школярів
- Може призначати завдання

### `city_hall_bot.ts` - Бот міської ради
- Отримує звіти про поломки
- Призначає комунальникам

### `master_bot.ts` - Адмін бот
- Модерує замовлення (callback: `approve_taskorder_${id}`)
- Має затверджувати/відхиляти TaskOrder

## 📝 Алгоритм Синхронізації (ЯКУ ПОТРІБНО РЕАЛІЗУВАТИ)

```typescript
// 1. Коли клієнт створює замовлення:
POST /api/task-orders
  → TaskOrder { status: 'PENDING_MODERATION' }
  → Телеграм повідомлення админу

// 2. Коли адмін затверджує в телеграмі:
Callback: approve_taskorder_${id}
  → TaskOrder { status: 'APPROVED' }
  → Одночасно CREATE Quest з того самого TaskOrder
  → Quest { title, description, reward, location, city, district }
  → Телеграм повідомлення школярам у чаті

// 3. Коли школяр запитує завдання:
GET /api/quests/available
  → Повертає: Quest records
  → + TaskOrder з status PUBLISHED (опційно)

// 4. Синхронізація через WebSocket (в майбутньому):
Школяр отримує real-time оновлення нових завдань
```

## 🛠️ Ручна Перевірка в Базі

```bash
# Перевірити TaskOrder:
npx ts-node -e "
import prisma from './src/services/prisma';
(async () => {
  const orders = await (prisma as any).taskOrder.findMany();
  console.log('TaskOrders:', JSON.stringify(orders, null, 2));
})();
"

# Перевірити Quest:
npx ts-node -e "
import prisma from './src/services/prisma';
(async () => {
  const quests = await (prisma as any).quest.findMany();
  console.log('Quests:', JSON.stringify(quests, null, 2));
})();
"

# Затвердити задачу вручну:
npx ts-node -e "
import prisma from './src/services/prisma';
(async () => {
  const order = await (prisma as any).taskOrder.findFirst();
  const quest = await (prisma as any).quest.create({
    data: {
      title: order.title,
      description: order.description,
      budget: order.budget,
      city: order.city,
      district: order.district,
      location: order.location,
      type: 'WORK',
      reward: order.budget,
      status: 'OPEN'
    }
  });
  console.log('Created Quest:', quest);
})();
"
```

## 🚀 ЩО ПОТРІБНО ЗРОБИТИ

### Негайно:
1. ✅ Створити ендпоінт `POST /api/task-orders/:id/approve` в admin.ts
2. ✅ При затвердженні TaskOrder → AUTO CREATE Quest
3. ✅ Тестування: Клієнт створює → Школяр бачить

### Майбутньо:
1. WebSocket синхронізація для real-time
2. Notification push коли нове завдання
3. Admin panel для управління завданнями
