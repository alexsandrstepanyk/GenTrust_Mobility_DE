# GenTrust Mobility - Full Working System

Ukrainian edtech platform connecting students with earning opportunities through AI-powered urban guardianship and logistics quests.

## 🎯 System Overview

**GenTrust Mobility** is a complete ecosystem featuring:
- **Client Mobile App**: Students create task orders and manage submissions
- **School Mobile App**: Educational institutions view and approve student contributions  
- **Admin Panel**: Manage task approvals, users, and system operations
- **Staff Panel**: Monitor operations and user activities
- **Telegram Bots**: Notification system and admin commands
- **Backend API**: Express.js with PostgreSQL (Prisma ORM)

## ✨ Key Features

### Mobile Applications
- **Client App** (Port 8081): Task order creation, progress tracking, earning history
- **School App** (Port 8082): Quest discovery, task completion, reputation tracking
- Real-time quest synchronization (30-second refresh interval)
- User authentication and authorization
- Leaderboard and rating system

### Backend Services
- **Express.js API** (Port 3000): RESTful endpoints for all operations
- **Task Order Management**: TaskOrder → Quest synchronization
- **Admin Approval Workflow**: Auto-creates Quests when approving TaskOrders
- **Telegram Integration**: Instant notifications to students and admins
- **Database**: PostgreSQL with Prisma ORM for type-safe data access

### Admin & Staff Panels
- **Admin Panel** (Port 5174, Vite): Task order approvals, user management
- **Staff Panel** (Port 5173, Vite): Dashboard, statistics, user monitoring
- Role-based access control
- Real-time data updates

## 🚀 Quick Start

### Prerequisites
- Node.js 20.18.x
- PostgreSQL database
- iOS simulators (iPhone 16e & iPhone 16 Pro)
- Environment variables (.env file)

### One-Command Startup
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
- **Quest**: Student tasks (OPEN, IN_PROGRESS, COMPLETED)
- **TaskCompletion**: Completion records with evidence
- **Report**: Infrastructure issue reports (CV-powered)
- **LeaderboardSnapshot**: Historical rankings
- **MunicipalService**: City services for Urban Guardian

### Relationships
```
TaskOrder (1) ──→ (1) Quest [via taskOrderId]
User (1) ──→ (∞) TaskOrder
User (1) ──→ (∞) TaskCompletion
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
**Last Updated**: February 23, 2026
**Dual Emulator**: iPhone 16e & iPhone 16 Pro (simultaneous testing)
