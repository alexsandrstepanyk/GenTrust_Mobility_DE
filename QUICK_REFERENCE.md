# GenTrust - Component Reference & Quick Guide

## 📁 Project Structure

```
GenTrust_Mobility/
├── src/                          # Backend source
│   ├── api/
│   │   ├── routes/
│   │   │   ├── admin.ts         # 🔴 Admin API endpoints
│   │   │   ├── auth.ts
│   │   │   ├── quests.ts
│   │   │   ├── task_orders.ts
│   │   │   ├── reports.ts
│   │   │   ├── users.ts
│   │   │   └── leaderboard.ts
│   │   ├── middleware/
│   │   │   └── error.ts
│   │   ├── server.ts           # 🔴 Main Express server
│   │   └── routes.ts
│   ├── services/
│   │   ├── error_logger.ts     # 🔴 Error logging system
│   │   ├── pushService.ts      # Push notifications
│   │   ├── prismaClient.ts
│   │   └── ...
│   ├── bots/                    # Telegram bots
│   └── middleware/
│
├── mobile/                       # Client App
│   ├── src/
│   │   ├── screens/
│   │   │   ├── TaskOrdersScreen.tsx
│   │   │   ├── CreateTaskOrderScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── services/
│   │   │   └── pushNotifications.ts
│   │   ├── config.ts
│   │   ├── App.tsx
│   │   └── ...
│   ├── app.json
│   └── package.json
│
├── mobile-school/               # School App
│   ├── src/
│   │   ├── screens/
│   │   │   ├── DashboardScreen.tsx     # 🔴 Stats + Motivation
│   │   │   ├── QuestsScreen.tsx
│   │   │   ├── ReportScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── services/
│   │   │   └── pushNotifications.ts
│   │   └── ...
│   ├── app.json
│   └── package.json
│
├── staff-panel/                 # Staff Web Panel
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuestCard.jsx
│   │   │   ├── DashboardStats.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── admin-panel/                 # Admin Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Statistics.jsx       # 📊 Main dashboard
│   │   │   ├── ErrorMonitor.jsx     # 🐛 Error tracking
│   │   │   ├── ActivityChart.jsx    # 📈 Activity graphs
│   │   │   ├── PendingTasks.jsx     # ⚠️ Moderation
│   │   │   ├── FinanceReport.jsx    # 💰 Financial stats
│   │   │   └── *.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── dev.db                   # SQLite database
│
├── logs/                         # Error logs
│   ├── errors-2026-02-22.json
│   └── ...
│
├── docs/
├── ARCHITECTURE.md              # System architecture
├── ADMIN_DASHBOARD.md           # Admin guide
├── COMPLETE_SYSTEM.md           # Complete overview
├── VERIFY.sh                    # Verification script
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔴 Key Components (Red - Most Important)

### 1. Error Logger (`src/services/error_logger.ts`)
```typescript
// Log an error
error_logger.log_error('ModuleName', 'Error message', error, metadata);

// Get statistics
const stats = error_logger.get_statistics();
// Returns: { total_logs, errors, warnings, resolved, by_module, last_error }

// Mark as resolved
error_logger.mark_resolved(error_id);
```

### 2. Admin API (`src/api/routes/admin.ts`)
```typescript
// Protected routes with Bearer token auth
GET  /api/admin/stats              → System statistics
GET  /api/admin/errors             → Error list
GET  /api/admin/errors/stats       → Error statistics
POST /api/admin/errors/:id/resolve → Mark as resolved
GET  /api/admin/users/activity     → User activity
GET  /api/admin/quests/top         → Top quests
GET  /api/admin/task-orders/pending → Pending orders
GET  /api/admin/reports/problematic → Problematic reports
GET  /api/admin/activity/timeline  → 30-day graph
GET  /api/admin/finance/report     → Finance report
```

### 3. Admin Dashboard (`admin-panel/src/App.jsx`)
```typescript
// Login with ADMIN_TOKEN from .env
// 5 tabs: Dashboard, Errors, Activity, Pending, Finance
// Real-time updates every 30-60 seconds
```

### 4. Dashboard Screen (`mobile-school/screens/DashboardScreen.tsx`)
```typescript
// Shows student motivation + statistics
// Statistics from GET /api/users/stats
// Display: completed, pending, earned, integrity
```

### 5. Error Monitoring Setup
```
Error occurs → error_logger.log_error() → saved to logs/errors-{date}.json
            ↓
Admin Panel → Errors tab → Shows list
            ↓
Admin clicks "Resolve" → error_logger.mark_resolved()
            ↓
Removed from active list, marked as resolved
```

---

## 🔌 API Integration Points

### Mobile Apps → Backend
```
Client/School App
    ↓
[axios requests with Bearer token]
    ↓
API Server (3000)
    ↓
Database (Prisma)
    ↓
Push Notifications (expo-notifications)
```

### Admin Dashboard → Backend
```
Admin Panel (5174)
    ↓
[axios requests with Bearer token]
    ↓
API Server (3000) /api/admin/*
    ↓
Database (Prisma)
    ↓
Error Logger
```

---

## ⚙️ Configuration Files

### `.env`
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"
PORT=3000
ADMIN_TOKEN="your_admin_token"
TELEGRAM_BOT_TOKEN="..."
```

### `mobile/config.ts`
```typescript
const API_URL = 'http://192.168.178.34:3000/api';
```

### `mobile-school/config.ts`
```typescript
const API_URL = 'http://192.168.178.34:3000/api';
```

---

## 🚀 Running Everything

### Terminal 1: Backend
```bash
npm run build
npm start
# Listen on http://localhost:3000
```

### Terminal 2: Client App
```bash
cd mobile
npx expo start --ios
# QR code appears
# Scan with iPhone camera
```

### Terminal 3: School App
```bash
cd mobile-school
npx expo start --ios
# Different port or simulator
```

### Terminal 4: Staff Panel
```bash
cd staff-panel
npm install
npm run dev
# http://localhost:5173
```

### Terminal 5: Admin Panel
```bash
cd admin-panel
npm install
npm run dev
# http://localhost:5174
# Login: ADMIN_TOKEN from .env
```

---

## 🧪 Testing Flows

### Test 1: Complete Task Flow
1. **Client App** → Create Order (title, budget, location)
2. **Master Bot** → Approve in Telegram
3. **School App** → New quest appears in Tasks
4. **Admin Panel** → Statistics updated
5. **Error Logger** → Track any issues

### Test 2: Error Handling
1. Break something in code
2. Error should be logged automatically
3. Check **Admin Panel → Errors tab**
4. Click "Mark as Resolved"
5. Verify in `logs/errors-{date}.json`

### Test 3: Push Notifications
1. Client creates order
2. Student should receive push: "New quest available!"
3. Check **Admin Panel → Activity**
4. Verify in push logs

---

## 📊 Metrics Dashboard

**Admin Panel shows:**

| Metric | Source | Update |
|--------|--------|--------|
| Total Users | Database count | Real-time |
| Active Users | Last hour activity | Real-time |
| Quests Completed | Count by status | Real-time |
| Total Earned | Sum of rewards | Real-time |
| Error Count | Error logger | Real-time |
| Activity Graph | Timeline aggregation | Real-time |

---

## 🔐 Security Checklist

- [ ] JWT secret in `.env`
- [ ] Admin token secure
- [ ] HTTPS in production
- [ ] Database backups
- [ ] API rate limiting
- [ ] Input validation
- [ ] Error details not exposed
- [ ] Tokens expire (7 days JWT)

---

## 📝 Code Standards (PEP8-like)

✅ **Use snake_case for functions/variables** (TypeScript/JavaScript adapted)
```typescript
const get_user_stats = () => { ... }  // ✅
const getUserStats = () => { ... }    // Also OK in JS
```

✅ **Use camelCase for React components**
```typescript
export function DashboardScreen() { ... }  // ✅
```

✅ **Add comments for complex logic**
```typescript
// Aggregate total earnings from completed quests
const total_earned = await prisma.quest.aggregate(...);
```

✅ **Type everything in TypeScript**
```typescript
interface Stats {
  total: number;
  completed: number;
}
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is taken
lsof -i :3000
# Kill process if needed
kill -9 <PID>
```

### Database issues
```bash
# Reset database
rm prisma/dev.db
npx prisma db push
```

### Mobile app errors
```bash
# Clear cache
cd mobile
rm -rf node_modules
npm install

# Check Expo version
npx expo --version  # Should be 54+
```

### Admin panel not loading
```bash
# Check token
echo $ADMIN_TOKEN
# Make sure backend is running
curl http://localhost:3000/api/health
```

### Errors not appearing
```bash
# Check logs directory
ls logs/
# Read latest log
tail -f logs/errors-$(date +%Y-%m-%d).json
```

---

## 📚 Documentation Links

- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete system architecture
- [ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md) - Admin panel features
- [COMPLETE_SYSTEM.md](COMPLETE_SYSTEM.md) - Full system overview
- [SETUP.sh](SETUP.sh) - Setup script
- [VERIFY.sh](VERIFY.sh) - Verification script

---

## 🎯 Next Development Tasks

- [ ] Add database backups
- [ ] Setup Sentry for error tracking
- [ ] Create CI/CD pipeline
- [ ] Add unit tests
- [ ] Setup payment system
- [ ] Add social features
- [ ] Mobile offline support
- [ ] Performance optimization

---

**Last Updated:** 2026-02-22
**Version:** 1.0.0
**Status:** Production Ready 🚀
