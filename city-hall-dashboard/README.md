# 🏛️ City Hall Dashboard - Документація

## Огляд

**City Hall Dashboard** - це сучасна адміністративна панель для міської адміністрації Німеччини, що дозволяє керувати зверненнями громадян, підтверджувати реєстрацію користувачів та відстежувати статистику в режимі реального часу.

## 🎯 Ключові можливості

### 1. **Real-time оновлення**
- ✅ WebSocket підключення через Socket.IO
- ✅ Миттєве отримання нових звітів
- ✅ Push-сповіщення про важливі події
- ✅ Статус підключення в real-time

### 2. **Управління звітами (Reports)**
- 📊 Перегляд усіх звернень громадян
- ✅ Підтвердження звітів
- ❌ Відхилення з вказанням причини
- ↗️ Автоматичне перенаправлення до:
  - Комунальні служби (utilities)
  - Транспортний відділ (transport)
  - Екологічний відділ (ecology)
- 📸 Перегляд фото-доказів
- 🗺️ Геолокація проблем
- 🚨 Пріоритизація (LOW, MEDIUM, HIGH, URGENT)

### 3. **Управління користувачами (Users)**
- 👥 Перегляд всіх зареєстрованих користувачів
- ✅ Підтвердження реєстрації
- ❌ Відхилення реєстрації
- 📊 Статистика по користувачам
- 🏷️ Ролі: STUDENT, PARENT, STAFF, ADMIN
- 📞 Контактна інформація

### 4. **Аналітика та статистика (Dashboard)**
- 📈 Графіки в режимі реального часу (Recharts)
- 📊 Area charts - звіти за часом
- 🥧 Pie charts - розподіл за статусами
- 📊 Bar charts - звіти за категоріями
- 🔢 KPI метрики:
  - Всього звітів
  - Активні користувачі
  - Підтверджені звіти
  - Звіти в очікуванні
- 🕐 Історія активності

## 🛠️ Технічний стек

### Frontend
- ⚛️ **React 18** + **TypeScript**
- ⚡ **Vite** - швидкий dev server
- 🎨 **TailwindCSS** - сучасний UI
- 📊 **Recharts** - професійні графіки
- 🔌 **Socket.IO Client** - real-time комунікація
- 🧭 **React Router DOM** - навігація
- 📅 **date-fns** - робота з датами
- 🎭 **Lucide React** - іконки

### Backend Integration
- 🔐 **JWT Authentication** - безпечна автентифікація
- 🔌 **Socket.IO Server** - WebSocket сервер
- 🗄️ **Prisma ORM** - база даних
- 🚀 **Express.js** - REST API

## 📁 Структура проєкту

```
city-hall-dashboard/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Головний layout з sidebar
│   │   └── ui/
│   │       ├── Card.tsx        # Card компонент
│   │       ├── Button.tsx      # Button компонент
│   │       └── Badge.tsx       # Badge компонент
│   ├── pages/
│   │   ├── Dashboard.tsx       # Головна сторінка з графіками
│   │   ├── Reports.tsx         # Управління звітами
│   │   ├── Users.tsx           # Управління користувачами
│   │   └── Settings.tsx        # Налаштування
│   ├── lib/
│   │   ├── api.ts              # API клієнт (axios)
│   │   ├── socket.ts           # Socket.IO hooks
│   │   └── utils.ts            # Утиліти
│   ├── App.tsx                 # Головний App компонент
│   ├── main.tsx                # Entry point
│   └── index.css               # Глобальні стилі
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 Швидкий старт

### 1. Встановлення

```bash
cd city-hall-dashboard
npm install
```

### 2. Налаштування

Створіть файл `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 3. Запуск

```bash
npm run dev
```

Dashboard буде доступний на: **http://localhost:5173**

## 🔐 Автентифікація

### Login
Dashboard використовує JWT токени для автентифікації:

```typescript
// Токен зберігається в localStorage
localStorage.setItem('auth_token', token);

// Автоматично додається до всіх API запитів
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Тестові облікові записи

```
Email: admin@cityhall.de
Password: admin123

Email: manager@cityhall.de  
Password: manager123
```

## 🔌 Socket.IO Events

### Клієнт слухає:

```typescript
// Новий звіт
socket.on('report:new', (report) => {
  // Додати до списку
  // Показати notification
});

// Оновлення звіту
socket.on('report:updated', (report) => {
  // Оновити в списку
});

// Новий користувач
socket.on('user:registered', (user) => {
  // Додати до списку
});

// Оновлення статистики
socket.on('stats:update', (data) => {
  // Оновити dashboard metrics
});
```

### Сервер емітить:

```typescript
// При новому звіті з Telegram Bot
io.emit('report:new', reportData);

// При зміні статусу звіту
io.emit('report:updated', reportData);

// При реєстрації користувача
io.emit('user:registered', userData);

// При зміні статистики
io.emit('stats:update', statsData);
```

## 📊 API Endpoints

### Reports
```typescript
GET    /api/reports              # Отримати всі звіти
GET    /api/reports/:id          # Отримати звіт по ID
POST   /api/reports/:id/approve  # Підтвердити звіт
POST   /api/reports/:id/reject   # Відхилити звіт
POST   /api/reports/:id/forward  # Переслати звіт
```

### Users
```typescript
GET    /api/users                # Отримати всіх користувачів
GET    /api/users/:id            # Отримати користувача
POST   /api/users/:id/approve    # Підтвердити реєстрацію
POST   /api/users/:id/reject     # Відхилити реєстрацію
```

### Stats
```typescript
GET    /api/stats/dashboard      # Статистика для dashboard
GET    /api/stats/reports        # Статистика звітів
```

## 🎨 UI Компоненти

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Опис</CardDescription>
  </CardHeader>
  <CardContent>
    Контент карточки
  </CardContent>
  <CardFooter>
    <Button>Дія</Button>
  </CardFooter>
</Card>
```

### Button
```tsx
<Button variant="default" size="sm">
  Кнопка
</Button>

// Variants: default | destructive | outline | secondary | ghost | link
// Sizes: default | sm | lg | icon
```

### Badge
```tsx
<Badge variant="success">Активний</Badge>

// Variants: default | secondary | destructive | success | warning
```

## 📈 Графіки (Recharts)

### Area Chart (Звіти за часом)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Area type="monotone" dataKey="count" fill="url(#colorReports)" />
  </AreaChart>
</ResponsiveContainer>
```

### Pie Chart (Розподіл статусів)
```tsx
<PieChart>
  <Pie
    data={data}
    cx="50%"
    cy="50%"
    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
    outerRadius={80}
    dataKey="value"
  >
    {data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
</PieChart>
```

## 🌐 Інтеграція з іншими системами

### Telegram Bot
- ✅ Отримання звітів від користувачів
- ✅ Підтвердження/відхилення через Dashboard
- ✅ Автоматичні сповіщення до бота

### Mobile App (GenTrust School)
- ✅ Синхронізація даних користувачів
- ✅ Quest completion approvals
- ✅ Real-time статус оновлення

### Staff Panel
- ✅ Перегляд призначених звітів
- ✅ Виконання завдань
- ✅ Звітність

## 🔒 Безпека

### HTTPS
```typescript
// Production deployment - завжди використовуйте HTTPS
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://cityhall.gentrust.de'
  : 'http://localhost:3000';
```

### CORS
```typescript
// Backend налаштування
app.use(cors({
  origin: ['http://localhost:5173', 'https://cityhall.gentrust.de'],
  credentials: true
}));
```

### JWT Tokens
```typescript
// Токени експірують через 24 години
const token = jwt.sign(payload, SECRET, { expiresIn: '24h' });
```

## 📱 Responsive Design

Dashboard повністю responsive і працює на:
- 🖥️ Desktop (1920x1080+)
- 💻 Laptop (1366x768+)
- 📱 Tablet (768x1024+)
- 📱 Mobile (375x667+)

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Deploy

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 📊 Моніторинг

### Sentry Integration
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

### Analytics
```typescript
import ReactGA from 'react-ga4';

ReactGA.initialize('YOUR_GA4_ID');
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Ліцензія

MIT License - GenTrust Mobility System

## 👥 Команда

- **Backend:** Express.js + TypeScript + Prisma
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Real-time:** Socket.IO
- **Design:** Modern Admin Dashboard 2026

## 🔗 Корисні посилання

- [React Documentation](https://react.dev)
- [Recharts Documentation](https://recharts.org)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

---

**Розроблено для GenTrust Mobility System - 2026**
