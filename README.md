# GenTrust Mobility - Full Working System

Ukrainian edtech platform connecting students with earning opportunities through AI-powered urban guardianship and logistics quests.

## 🎯 System Overview

**GenTrust Mobility** is a complete ecosystem featuring:
- **Client Mobile App**: Students create task orders and manage submissions
- **School Mobile App**: Educational institutions view and approve student contributions
- **Admin Panel**: Manage task approvals, users, and system operations
- **Staff Panel**: Monitor operations and user activities
- **City-Hall Dashboard**: Municipal monitoring with AI recommendations
- **Monitor Dashboard**: Real-time system health & process control
- **Telegram Bots**: Notification system and admin commands
- **Backend API**: Express.js with PostgreSQL (Prisma ORM)

## 🎛️ DASHBOARD SYSTEM - Real-Time Control Center

### **Monitor Dashboard** (Port 9000) ⭐ NEW!
**Centralized System Health Monitoring & Process Control**

- ✅ **Real-time Status** of all 7 services (3-second refresh)
- ✅ **Live Logs** for each service (last 10 lines)
- ✅ **One-Click Launch Commands** - copy-paste ready terminal commands
- ✅ **Port Management** - detect & kill stuck processes
- ✅ **Database Status** - user count & connection health
- ✅ **Telegram Bots Status** - all 5 bots monitoring

**Features:**
- 📊 Visual status cards (Online/Offline/Warning)
- 💻 Built-in terminal commands for each service
- 🚀 Quick start: `cd` + `start` + `kill` commands
- 📋 Logs viewer with error highlighting
- 🔗 Health check endpoints for all services

**Access:** http://localhost:9000

---

### **City-Hall Dashboard** (Port 5173) 🏛️ UPDATED!
**Municipal Control Center with AI-Powered Report Management**

- ✅ **AI Recommendations Display** - Gemini analysis results
  - `is_issue`: Problem detection (✅ Yes / ❌ No)
  - `confidence`: Confidence score (0-100%)
  - `category`: Auto-suggested category (Roads, Waste, Lighting, etc.)
- ✅ **Moderator Actions** - Approve/Reject buttons
  - ✅ **Approve Modal** - 8 department selection
  - ❌ **Reject Modal** - Reason input textarea
- ✅ **Real-time Status Updates** - instant UI refresh
- ✅ **Interactive Map** - Leaflet with custom markers
- ✅ **Photo Zoom** - enlarged view modal
- ✅ **Smart Filters** - by status, category, priority

**AI Integration:**
- 🤖 Google Gemini 1.5 Flash analysis
- 🎯 Auto-categorization with confidence scoring
- 🎨 Color-coded confidence (Green/Yellow/Red)
- ⚡ One-click "Apply AI Recommendation" button

**Access:** http://localhost:5173/reports

---

### **Admin Panel** (Port 5174) 🔐
**Core Administration Dashboard**

- User management & moderation
- Task order approvals
- System configuration
- Analytics & reporting

**Access:** http://localhost:5174

---
- **Staff Panel** (Port 5173, Vite): Dashboard, statistics, user monitoring
- Role-based access control
- Real-time data updates

## 🚀 Quick Start

### Prerequisites
- Node.js 20.18.x
- PostgreSQL database (або SQLite для розробки)
- Expo Go app на телефоні
- Mac і телефон в одній Wi-Fi мережі

### ⚡ One-Command Startup (Новий спосіб - РЕКОМЕНДОВАНО)

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start_mobile_school.sh
```

**Цей скрипт автоматично:**
1. ✅ Визначає поточну IP адресу Mac
2. ✅ Оновлює `mobile-school/config.ts` з актуальною IP
3. ✅ Перевіряє що Backend слухає на `0.0.0.0` (доступний з мережі)
4. ✅ Вбиває всі старі процеси (ts-node, expo)
5. ✅ Видаляє папку `dist/` для уникнення конфліктів Metro bundler
6. ✅ Запускає Backend API на порту 3000 (БЕЗ Telegram ботів для швидкості)
7. ✅ Чекає поки Backend запуститься (до 15 секунд)
8. ✅ Перевіряє що Backend доступний з мережі (`*:3000`)
9. ✅ Тестує health endpoint з поточної IP
10. ✅ Запускає Expo Metro Bundler на порту 8082 в LAN режимі
11. ✅ Показує QR код для підключення з телефону

**Час запуску: ~20-30 секунд** ⚡

**Після запуску:**
- Backend: `http://192.168.178.34:3000/api/health`
- Expo: `exp://192.168.178.34:8082`
- Відскануйте QR код в Expo Go на телефоні

---

### 📋 System Validation Checklist

Перед кожним запуском перевіряйте: [SYSTEM_CHECKLIST.md](SYSTEM_CHECKLIST.md)

**Критичні налаштування:**
- ✅ Backend ЗАВЖДИ слухає на `0.0.0.0` (НЕ localhost!)
- ✅ `mobile-school/config.ts` має актуальну IP Mac
- ✅ Expo запускається з `--lan` прапором
- ✅ Metro bundler виключає папки: `dist/`, `src/`, `prisma/`
- ✅ Mac і телефон в одній Wi-Fi мережі

**Якщо щось не працює:**
1. Перевірте логи: `tail -50 server.log`
2. Перевірте IP: `ifconfig en0 | grep inet`
3. Тест з телефону: відкрийте в браузері `http://192.168.178.34:3000/api/health`
4. Якщо не працює - Mac і телефон в різних мережах!

---

### 🔧 Manual Startup (Старий спосіб)

```bash
./start_all.sh
```

This script automatically:
1. Kills existing processes on all ports
2. Validates PostgreSQL connection
3. Runs database migrations
4. Launches backend API (port 3000)
5. Starts admin panel (port 5174)
6. Starts staff panel (port 5173)
7. Boots client mobile app (port 8081)
8. Boots school mobile app (port 8082)
9. Auto-migrates existing TaskOrders to Quests

### Parent App Startup
```bash
cd mobile-parent
npx expo start --port 8082 --clear
```

**Expo Server**: exp://192.168.178.34:8082  
**Test Login**: admin@parent.com / admin

**Recent Fixes (Лютий 2026)**:
- ✅ Виправлено TypeError: Cannot read property 'charAt' of null
- ✅ Додано optional chaining (?.) до всіх charAt() викликів
- ✅ Повністю переписано ProfileScreen з трьома секціями
- ✅ Додано error handling для 404 API endpoints
- ✅ Реалізовано logout з підтвердженням
- ✅ **Додано Privacy Policy (DSGVO)** - відповідність німецькому законодавству
- ✅ **Додано вибір мови** - 5 мов (DE, EN, UK, RU, FR) з react-i18next
- ✅ **Повний переклад інтерфейсу на німецьку мову**
- ✅ **i18n інтегровано** - динамічна зміна мови в реальному часі
- ✅ **School App** - вже має i18n підтримку
- ✅ **Telegram Bot** - розширений профіль з налаштуваннями та мовами
- ✅ **Safe Area виправлено** - контент не залазить на статус бар та home indicator
- ✅ **react-native-safe-area-context** - інтегровано у всі екрани Parent App
- ✅ **NEW: Photo Verification System** - система підтвердження завдань з фото-звітами
  - Студент надсилає фото після виконання
  - Батьки/клієнти отримують сповіщення в Telegram
  - Approve/Reject через додаток або Telegram бота
  - Винагорода зараховується тільки після підтвердження

### 📱 iOS Simulator Setup

**IMPORTANT**: Clean old simulators before first run to save disk space!

#### Step 1: Delete Old Simulators (Optional - frees ~6GB)
```bash
# Delete all unavailable simulators
xcrun simctl delete unavailable

# Or delete all simulators
xcrun simctl erase all
```

#### Step 2: Boot New Simulators
When you run `./start_all.sh` or `npm run school:dev`, Xcode will:
1. Auto-detect need for iOS 18 simulator
2. Download iOS runtime (~2GB)
3. Create fresh iPhone 16 simulator
4. Boot and install your app automatically

**First time**: Takes 3-5 minutes ⏳
**Subsequent runs**: 30 seconds ⚡

#### Manual Simulator Control
```bash
# List all simulators
xcrun simctl list devices

# Boot iPhone 16
xcrun simctl boot "iPhone 16"

# Shutdown
xcrun simctl shutdown "iPhone 16"

# Delete specific simulator
xcrun simctl delete "iPhone 16"
```

#### Troubleshooting
If simulators fail to start:
```bash
# Kill simulator processes
killall "Simulator"
killall "SimulatorBridge"

# Reset simulator
xcrun simctl erase all

# Restart Xcode services
killall -9 com.apple.CoreSimulator.CoreSimulatorService
```

### Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma migrate dev

# 3. Seed initial data
npx ts-node scripts/seed_quests.ts
npx ts-node scripts/seed_task_orders.ts
npx ts-node scripts/seed_admin.ts

# 4. Start services (in separate terminals)
npm run dev                    # Backend
npm run admin:dev             # Admin panel
npm run staff:dev             # Staff panel
npm run mobile:dev            # Client app
npm run school:dev            # School app
```

### 💾 Disk Space Optimization

If your SSD is full, clean up development caches:

```bash
# Clean iOS simulators and caches (saves ~12GB)
xcrun simctl delete unavailable     # Delete unused simulators
rm -rf ~/Library/Caches/com.microsoft.VSCode.ShipIt  # VS Code cache: 675MB
rm -rf ~/Library/Caches/CloudKit    # CloudKit cache: 647MB
rm -rf ~/Library/Caches/ms-playwright-go  # Playwright: 120MB

# Clean npm and Expo
npm cache clean --force             # NPM cache: 2.8GB
rm -rf ~/.expo                      # Expo cache: 1.3GB

# Clean Xcode
rm -rf ~/Library/Developer/Xcode/DerivedData/*  # 250MB

# Result: Frees ~18GB of space!
```

## 🔄 Task Order ↔ Quest Synchronization

### Problem Solved
Two separate task systems weren't communicating:
- **TaskOrder**: Submitted by clients, stored in database
- **Quest**: Visible to students in school app

### Solution Implemented
- **Auto-Conversion**: When admin approves TaskOrder → Auto-creates linked Quest
- **Status Flow**: 
  ```
  TaskOrder(PENDING_MODERATION) 
    ↓ admin approves
  → Quest(OPEN) + TaskOrder(PUBLISHED)
    ↓ students complete
  → TaskCompletition records
  ```
- **Real-time Sync**: Telegram notifications when Quest appears
- **Migration**: Existing APPROVED orders auto-converted to Quest records

### API Endpoints
```bash
# Approve TaskOrder (creates Quest)
POST /api/task-orders/:id/approve
Header: admin_token=<token>

# Reject TaskOrder
POST /api/task-orders/:id/reject
Body: { reason?: string }

# Get pending approvals (Admin only)
GET /api/admin/task-orders/pending
Header: admin_token=<token>
```

---

## 📸 Photo Verification System

### Overview
Quality control system where students submit photo evidence of completed tasks, and parents/clients approve before payment.

### Workflow
```
1. Student completes task → uploads photo + description
   ↓
2. Quest status: COMPLETED → PENDING_VERIFICATION
   ↓
3. Notification sent to:
   - Parent (if PersonalTask)
   - Client (if TaskOrder)
   ↓
4. Parent/Client reviews photo:
   → APPROVE: Reward paid + Dignity Score +5
   → REJECT: No payment, student can retry
   ↓
5. Student receives notification
```

### Features
- **Photo Upload**: Camera or gallery (React Native)
- **GPS Tracking**: Location captured at completion
- **Telegram Integration**: Approve/reject directly from bot
- **Auto-approve**: Optional for trusted students/low-value tasks
- **24-hour timeout**: Auto-approve if no response

### API Endpoints
```bash
# Complete quest with photo
POST /api/quests/:questId/complete
Headers: Authorization: Bearer <student_token>
Body: FormData { photo: File, description?: string }

# Get pending approvals (Parent/Client)
GET /api/completions/pending
Headers: Authorization: Bearer <token>

# Approve completion
POST /api/completions/:completionId/approve
Headers: Authorization: Bearer <parent_or_client_token>

# Reject completion
POST /api/completions/:completionId/reject
Headers: Authorization: Bearer <parent_or_client_token>
Body: { reason: string }
```

### Telegram Bot Commands
```bash
# For Students
/complete - Show my active quests → upload photo

# For Parents/Clients (via inline keyboard)
✅ Підтвердити - Approve task
❌ Відхилити - Reject task
```

### Database Schema
```prisma
model TaskCompletion {
  id              String   @id @default(uuid())
  quest           Quest    @relation(...)
  student         User     @relation("completedBy", ...)
  photoUrl        String?  // Cloudinary URL
  photoTelegramId String?  // Telegram file_id
  status          String   @default("PENDING") // PENDING, APPROVED, REJECTED
  verifiedBy      User?    @relation("verifiedBy", ...)
  rewardAmount    Float?
  rewardPaid      Boolean  @default(false)
}
```

---

## 📁 Project Structure

```
GenTrust_Mobility/
├── src/                          # Backend source code
│   ├── api/
│   │   ├── routes/
│   │   │   ├── task_orders.ts   # TaskOrder management + sync
│   │   │   ├── admin.ts         # Admin endpoints
│   │   │   ├── quests.ts        # Quest endpoints
│   │   │   ├── auth.ts          # Authentication
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── error.ts
│   │   └── server.ts            # Express app setup
│   ├── services/
│   │   ├── prisma.ts            # Database client
│   │   ├── messenger.ts         # Telegram notifications
│   │   ├── reputation.ts        # User ratings
│   │   └── ...
│   ├── bot.ts                   # Telegram bot handlers
│   ├── index.ts                 # Entry point
│   └── keyboards.ts             # Telegram keyboards
│
├── mobile/                       # Client React Native app
│   ├── screens/
│   │   ├── CreateTaskOrderScreen.tsx
│   │   ├── TaskOrdersScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   └── ...
│   ├── services/
│   │   ├── i18n.ts             # Internationalization (Ukrainian)
│   │   └── pushNotifications.ts
│   ├── app.json                # Expo config
│   └── package.json
│
├── mobile-school/               # School React Native app
│   ├── screens/
│   │   ├── QuestsScreenClean.js # Fixed infinite loading
│   │   ├── QuestDetailsScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   └── ...
│   └── services/
│       └── pushNotifications.ts
│
├── admin-panel/                 # Admin dashboard (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── staff-panel/                 # Staff dashboard (Vite + React)
│   └── (similar structure)
│
├── prisma/
│   ├── schema.prisma            # Database schema (Prisma)
│   └── migrations/              # Database migration history
│
├── scripts/
│   ├── test_sync.ts             # Validates sync mechanism
│   ├── migrate_taskorders.ts    # Convert old orders to Quests
│   ├── seed_*.ts                # Database seeders
│   └── check_db.ts
│
├── tests/
│   ├── test_bot.ts
│   ├── integration_test.ts
│   └── check_user.ts
│
├── backups/                     # Versioned backups
│   ├── WORKING_STATE_2026-02-23/
│   ├── ETALON_2026-02-09T11-03-56Z/
│   └── ...
│
├── docs/
│   ├── SYNCHRONIZATION_GUIDE.md (Architecture & implementation)
│   ├── SYNC_ARCHITECTURE.md     (Quick reference)
│   └── Investor_Overview.md
│
├── start_all.sh                 # One-command startup (with migration)
├── check_sync.sh                # System validation
├── package.json                 # Root dependencies
├── tsconfig.json                # TypeScript config
├── nodemon.json                 # Dev server watch config
├── eas.json                     # Expo Application Services config
└── .env                         # Environment variables
```

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Express.js, TypeScript, Node.js 20.18.x |
| **Mobile** | React Native, Expo SDK ~54.0.33 |
| **Admin/Staff** | React, Vite, TypeScript |
| **Database** | PostgreSQL (dev: SQLite), Prisma ORM |
| **Notifications** | Telegram Bot API |
| **Deployment** | EAS Build & Submit |
| **Language** | Ukrainian (i18n support) |

## 📊 Database Schema Highlights

### Key Tables
- **Users**: Student profiles, auth, stats
- **TaskOrder**: Client submissions (PENDING_MODERATION, PUBLISHED, REJECTED)
- **Quest**: Student tasks (OPEN, IN_PROGRESS, COMPLETED, PENDING_VERIFICATION)
- **TaskCompletion**: Photo verification records (PENDING, APPROVED, REJECTED)
  - Stores photo evidence, GPS coordinates
  - Links to student (executor) and verifier (parent/client)
  - Tracks reward status and payment
- **Report**: Infrastructure issue reports (CV-powered)
- **LeaderboardSnapshot**: Historical rankings
- **MunicipalService**: City services for Urban Guardian
- **PersonalTask**: Parent-created tasks for children

### Relationships
```
TaskOrder (1) ──→ (1) Quest [via taskOrderId]
Quest (1) ──→ (∞) TaskCompletion [via questId]
User (1) ──→ (∞) TaskOrder
User (1) ──→ (∞) TaskCompletion [as student]
User (1) ──→ (∞) TaskCompletion [as verifier]
Quest (1) ──→ (∞) TaskCompletion
```

## ✅ Testing & Validation

### Run Sync Test
Validates complete TaskOrder → Quest → Student visibility flow:
```bash
npx ts-node scripts/test_sync.ts
```

### Check System Health
Validates all services are running and accessible:
```bash
./check_sync.sh
```

### Generate Test Data
```bash
# Create 5 sample quests
npx ts-node scripts/seed_quests.ts

# Create 5 sample task orders
npx ts-node scripts/seed_task_orders.ts

# Create admin user
npx ts-node scripts/seed_admin.ts
```

## 🔐 Environment Variables

Create `.env` in root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gentrust"

# Telegram
BOT_TOKEN="your_telegram_bot_token"
ADMIN_CHAT_ID="your_admin_chat_id"

# API
API_PORT=3000
API_BASE_URL="http://localhost:3000"

# JWT
JWT_SECRET="your_jwt_secret_key"

# AI/Gemini
GEMINI_API_KEY="your_gemini_api_key"

# Admin Tokens
ADMIN_TOKEN="your_admin_token"
```

## 🚢 Deployment

### Mobile Apps
Uses Expo Application Services (EAS):
```bash
npm run eas:build
npm run eas:submit
```

### Backend API
Docker-ready (example):
```bash
docker build -t gentrust-api .
docker run -p 3000:3000 gentrust-api
```

### Admin/Staff Panels
Deploy built artifacts to static hosting:
```bash
npm run admin:build
npm run staff:build
# Output in admin-panel/dist and staff-panel/dist
```

## 📚 Documentation

- [SYNCHRONIZATION_GUIDE.md](./SYNCHRONIZATION_GUIDE.md) - Comprehensive architecture & debugging
- [SYNC_ARCHITECTURE.md](./SYNC_ARCHITECTURE.md) - Quick reference guide
- [Investor_Overview.md](./docs/Investor_Overview.md) - Business overview

## 🐛 Known Issues & Fixes

### ✅ Infinite Loading in School App
**Fixed in**: [mobile-school/screens/QuestsScreenClean.js](./mobile-school/screens/QuestsScreenClean.js)

**Solution**: Used `useRef` pattern to prevent concurrent requests:
```javascript
const isFetchingRef = useRef(false);
const [loading, setLoading] = useState(false);

useFocusEffect(
  useCallback(() => {
    if (!isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchQuests().finally(() => {
        isFetchingRef.current = false;
      });
    }
  }, [])
);
```

### ✅ FileSystem API Updates
Updated to modern Expo filesystem APIs in both mobile apps.

### ✅ Expo SDK Synchronization
All apps use Expo SDK ~54.0.33 with React Native 0.81.

## 🎓 For Developers

### Code Style
- TypeScript throughout
- ESLint configured
- Prettier formatting

### Running Tests
```bash
npm test
npm run test:integration
npm run test:sync
```

### Building
```bash
npm run build        # Backend
npm run admin:build  # Admin panel
npm run staff:build  # Staff panel
```

### Git Workflow
```bash
git checkout -b feature/your-feature
git commit -m "feat: description"
git push origin feature/your-feature
# Create Pull Request
```

## 📞 Support & Contact

For issues or questions:
1. Check [SYNCHRONIZATION_GUIDE.md](./SYNCHRONIZATION_GUIDE.md)
2. Run `./check_sync.sh` to validate system
3. Review logs in `server_logs.txt`

## 📄 License

© 2026 GenTrust Mobility. All rights reserved.

---

**Status**: ✅ Full working system ready for investor presentation
**Last Updated**: March 1, 2026
**System Status**: 
  - ✅ Backend API (port 3000) - Running
  - ✅ Staff Panel (port 5173) - Running  
  - ✅ Admin Panel (port 5174) - Running
  - ✅ School Mobile App (port 8082) - Running
  - ✅ Parent Mobile App - Safe Area Fixed
  - ✅ Telegram Bots (5 bots) - Running
  - ✅ Database (PostgreSQL) - Connected
  - ✅ **Photo Verification System** - Implemented and E2E-validated
  - ✅ **Push Notifications** - Implemented (apps + backend + completion lifecycle)
**Dual Emulator**: iPhone 16 & iPhone 16 Pro (simulators auto-created on demand)
**Disk Space**: Optimized - cleaned 19GB of old caches and simulators
**New Features (Mar 1)**:
  - 📸 Photo Verification for task completion
  - ✅ Approve/Reject workflow for parents and clients
  - 💰 Reward payment only after approval
  - 📱 Telegram integration for photo approvals
  - 🔔 Push notifications from mobile apps (Expo token registration + lifecycle events)
  - 🧪 E2E validation passed for client approve + parent reject flows

**Verification Report**:
  - [docs/E2E_PHOTO_VERIFICATION_REPORT_2026-03-01.md](docs/E2E_PHOTO_VERIFICATION_REPORT_2026-03-01.md)
