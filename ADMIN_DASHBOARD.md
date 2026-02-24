# GenTrust - Core Admin Dashboard & Error Logging

## 📊 Admin Panel (`admin-panel/`)

Інтерфейс для ядра (штабу) для моніторингу всієї системи.

### 🔐 Features

**Автентифікація:**
- Password-based access з Admin Token
- Токен зберігається в localStorage
- Безпечні запити з Bearer Token до API

**📈 Dashboard:**
- **Users:** Total, Active, Scouts, Clients
- **Quests:** Total, Completed, Completion Rate %
- **Task Orders:** Total, Approved, Approval Rate %
- **Finances:** Total Earned, Average per Quest
- **Reports:** Total, Verified, Verification Rate %

**🐛 Error Monitor:**
- Список всіх помилок з деталями
- Фільтр по рівню (ERROR, WARNING, INFO)
- Можливість позначити як вирішену
- Статистика помилок по модулям
- Реал-тайм оновлення

**📊 Activity Chart:**
- Активні користувачі за останню годину
- Нові користувачі сьогодні
- Розподіл по ролям
- Графік завдань за 30 днів

**⚠️ Pending Tasks:**
- Замовлення, що потребують модерації
- Проблемні звіти про інфраструктуру
- Статус та детальна інформація

**💰 Finance Report:**
- Загальна сума виплачена
- Очікування платежу
- Заробитки за сьогодні
- Топ-10 завдань по бюджету

### 🚀 Запуск

```bash
cd admin-panel
npm install
npm run dev
# Доступна на http://localhost:5174
```

**Логін:**
- Default token: `admin_secret_token` (з `.env`)
- Встановіть `ADMIN_TOKEN` у середовищі

---

## 🐛 Error Logger (`src/services/error_logger.ts`)

Система логування всіх помилок у системі з PEP8-совместимым кодом.

### API Методи

```typescript
// Логувати помилку
error_logger.log_error(
  module: string,
  message: string,
  error?: Error,
  metadata?: Record<string, any>
);

// Логувати попередження
error_logger.log_warning(
  module: string,
  message: string,
  metadata?: Record<string, any>
);

// Логувати інформацію
error_logger.log_info(
  module: string,
  message: string,
  metadata?: Record<string, any>
);

// Отримати недавні помилки
error_logger.get_recent_errors(limit: number = 50);

// Отримати всі логи
error_logger.get_all_logs(limit: number = 100);

// Позначити як вирішену
error_logger.mark_resolved(log_id: string);

// Отримати статистику
error_logger.get_statistics();
```

### Файли логів

```
logs/
  ├── errors-2026-02-22.json   # Логи за день
  ├── errors-2026-02-21.json
  └── ...
```

**Формат логу:**
```json
{
  "id": "1708600000000-abc123def",
  "timestamp": "2026-02-22T12:34:56.789Z",
  "level": "ERROR",
  "module": "Auth API",
  "message": "Failed to authenticate user",
  "stack": "Error: ...",
  "userId": "user-123",
  "metadata": { "email": "test@example.com" },
  "resolved": false
}
```

### Використання у коді

```typescript
import { error_logger } from '../services/error_logger';

try {
  // Щось робимо
  await doSomething();
} catch (error) {
  error_logger.log_error(
    'MyModule',
    'Failed to process request',
    error,
    { userId: user.id, action: 'create' }
  );
}
```

---

## 📝 Admin API Routes (`src/api/routes/admin.ts`)

### Protected Routes (потребує Bearer Token з `ADMIN_TOKEN`)

**`GET /api/admin/stats`**
```json
{
  "users": { "total": 150, "active": 45, "scouts": 100, "clients": 50 },
  "quests": { "total": 500, "completed": 250, "completion_rate": "50.00" },
  "task_orders": { "total": 100, "approved": 75, "approval_rate": "75.00" },
  "finances": { "total_earned": 25000, "average_per_quest": "100" },
  "reports": { "total": 200, "verified": 150, "verification_rate": "75.00" },
  "timestamp": "2026-02-22T12:00:00Z"
}
```

**`GET /api/admin/errors?limit=50`**
```json
{
  "total": 12,
  "errors": [...]
}
```

**`GET /api/admin/errors/stats`**
```json
{
  "total_logs": 1000,
  "errors": 45,
  "warnings": 120,
  "resolved": 38,
  "unresolved": 7,
  "by_module": {
    "Auth API": 23,
    "Quest API": 15,
    "Reports": 7
  },
  "last_error": {...}
}
```

**`POST /api/admin/errors/:id/resolve`**
```json
{ "success": true }
```

**`GET /api/admin/users/activity`**
```json
{
  "active_last_hour": 34,
  "new_users_today": 8,
  "by_role": [
    { "role": "SCOUT", "_count": 100 },
    { "role": "CLIENT", "_count": 50 }
  ]
}
```

**`GET /api/admin/quests/top`**
```json
[
  { "id": "...", "title": "...", "reward": 500, "status": "COMPLETED", "createdAt": "..." },
  ...
]
```

**`GET /api/admin/task-orders/pending`**
```json
[
  { "id": "...", "title": "...", "status": "PENDING_MODERATION", "budget": 300, ... }
]
```

**`GET /api/admin/reports/problematic`**
```json
[
  { "id": "...", "description": "...", "status": "PENDING", ... }
]
```

**`GET /api/admin/activity/timeline`**
```json
{
  "2026-02-22": 45,
  "2026-02-21": 38,
  ...
}
```

**`GET /api/admin/finance/report`**
```json
{
  "total_paid": 25000,
  "pending_payment": 3500,
  "today_earnings": 1200
}
```

---

## 🔧 Налаштування

### `.env` для Admin Token

```env
ADMIN_TOKEN=your_secure_admin_token_here
```

### Admin Panel Login

1. Відкрийте http://localhost:5174
2. Введіть Admin Token з `.env`
3. Click Login

---

## 📊 Моніторинг через панель

### Dashboard Tabs

| Tab | Функція |
|-----|---------|
| 📈 Dashboard | Загальна статистика системи |
| 🐛 Errors | Перелік помилок + статистика |
| 📊 Activity | Активність користувачів + графік |
| ⚠️ Pending | Замовлення й звіти на модерацію |
| 💰 Finance | Фінансові метрики й топ завдання |

---

## 🔍 Приклад: Як відстежити баг

### 1. Баг сталася у додатку

```typescript
// У backend коді
try {
  await processQuest(questId);
} catch (error) {
  error_logger.log_error(
    'QuestProcessor',
    'Failed to process quest',
    error,
    { questId }
  );
}
```

### 2. Баг автоматично логується

- Записується до `logs/errors-{дата}.json`
- Доступна в Admin Panel → Errors tab
- Показує всі деталі: час, модуль, стек, metadata

### 3. Адміністратор розглядає помилку

- Відкриває Admin Panel
- Йде на вкладку "Errors"
- Бачить помилку з контекстом
- Натискає "Mark as Resolved"

### 4. Помилка позначена як вирішена

- Статус змінюється в логі
- Видаляється з активного списку
- Залишається в архіві для аналізу

---

## 📈 Код відповідає PEP8-подібним стандартам

✅ **snake_case** для функцій та змінних
✅ **camelCase** для React компонентів (JavaScript стиль)
✅ **Коментарі** перед критичними функціями
✅ **Type hints** для TypeScript параметрів
✅ **Правильне форматування** та структура

```typescript
// Приклад PEP8-подібної функції
private ensure_logs_directory() {  // snake_case
  if (!fs.existsSync(this.logs_dir)) {  // читаємість
    fs.mkdirSync(this.logs_dir, { recursive: true });
  }
}
```

---

## 🚀 Запуск всього разом

```bash
# 1. Backend
npm run build && npm start

# 2. Admin Panel (окремий термінал)
cd admin-panel && npm run dev

# 3. Client App (для тестування)
cd mobile && npx expo start --ios

# 4. School App (для тестування)
cd mobile-school && npx expo start --android
```

---

## 📝 Лог помилок у реальному часі

```bash
tail -f logs/errors-$(date +%Y-%m-%d).json | jq .
```

Показує останні помилки в JSON форматі.

---

Готово до боєвого використання! 🚀
