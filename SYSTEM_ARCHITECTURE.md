graph TD
    A[Мерія створює квест] -->|API| B[notifyQuestCreated]
    B --> C[Push: Нове завдання від мерії]
    
    D[Дитина виконує] -->|complete| E[notifyQuestCompleted]
    E --> F[Push: Завдання виконано]
    
    G[Мерія підтверджує] -->|approve| H[notifyQuestVerified true]
    H --> I[Push: Підтверджено + €€€]
    
    J[Мерія відхиляє] -->|reject| K[notifyQuestVerified false]
    K --> L[Push: Відхилено]
    
    M[Батьки створюють завдання] --> N[notifyPersonalTaskCreated]
    N --> O[Push: Нове від батьків]
    
    P[Дитина виконує особисте] --> Q[notifyPersonalTaskNeedsApproval]
    Q --> R[Push батькам: Очікує підтвердження]
    
    S[Батьки approve/reject] --> T[notifyPersonalTaskVerified]
    T --> U[Push: Результат перевірки]# GenTrust Mobility - System Architecture & Ready Status

```
                    🚀 GENTRUST MOBILITY 🚀
                    February 28, 2026
                    Status: ✅ READY


    ┌────────────────────────────────────────────────────────┐
    │         YOUR COMPUTER (Mac)                            │
    │         IP: 192.168.178.34                             │
    │                                                         │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │  BACKEND API SERVER (Port 3000)                 │  │
    │  │  Status: ✅ Ready                              │  │
    │  │  Mode: API-only (no Telegram bots)            │  │
    │  │  Entry: npm run api                           │  │
    │  │  Response: {"status":"ok","timestamp":"..."}  │  │
    │  └──────────────────────────────────────────────────┘  │
    │           ▲              ▲              ▲              │
    │           │              │              │              │
    │  ┌────────┴──────┐  ┌────┴──────┐  ┌───┴─────────┐    │
    │  │  ADMIN PANEL  │  │STAFF PANEL │  │ EXPO SERVER │    │
    │  │  Port 5174    │  │ Port 5173  │  │ Port 8082   │    │
    │  │  ✅ Ready    │  │ ✅ Ready   │  │ ✅ Ready   │    │
    │  └───────────────┘  └────────────┘  └─────────────┘    │
    │      (Browser)        (Browser)     (Mobile via WiFi)  │
    │                                                         │
    │  Command to start:  bash start_dev.sh                 │
    │                                                         │
    └────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   WiFi Network    │
                    │  192.168.178.x    │
                    └────────┬──────────┘
                             │
              ┌──────────────┴──────────────┐
              │                            │
          ┌───▼───┐                    ┌──▼──┐
          │ Phone │                    │ Mac  │
          │       │                    │      │
          │Expo Go│◄──── WiFi ────────►│Same  │
          │ App   │                    │WiFi  │
          │       │                    │      │
          └───────┘                    └──────┘


    ═════════════════════════════════════════════════════════
    
    📱 MOBILE APP SETUP (3 EASY STEPS)
    
    1. On your phone: Download "Expo Go" (free)
    
    2. On your Mac: Run
       bash start_dev.sh
    
    3. On your phone: 
       Open Expo Go → Find "GenTrust School" → Tap
       
    LOGIN: admin / admin
    
    ═════════════════════════════════════════════════════════
    
    🌐 WEB DASHBOARDS (Open in Browser)
    
    Admin:  http://192.168.178.34:5174  [admin/admin]
    Staff:  http://192.168.178.34:5173  [admin/admin]
    
    ═════════════════════════════════════════════════════════
    
    ✅ SYSTEM STATUS
    
    Backend API......... ✅ Ready (API-only, no bots)
    Admin Panel........ ✅ Ready
    Staff Panel........ ✅ Ready
    Expo Mobile App.... ✅ Ready (tunnel mode)
    Mobile Config...... ✅ Correct IP
    Dependencies....... ✅ Installed
    TypeScript......... ✅ Fixed
    Network............. ✅ WiFi configured
    
    OVERALL: ✅ ALL SYSTEMS GO
    
    ═════════════════════════════════════════════════════════
    
    📋 WHAT WAS FIXED TODAY
    
    ✅ #1: TypeScript compilation error in admin.ts (line 240)
           Fixed: Removed corrupted code, fixed variable name
           
    ✅ #2: Backend wouldn't start (blocking on bots)
           Fixed: Created api.ts (API-only mode)
           
    ✅ #3: Nodemon wouldn't support multiple entry points
           Fixed: Updated nodemon.json exec configuration
           
    ✅ #4: Mobile app couldn't connect to API
           Fixed: Backend now responds on port 3000
    
    ═════════════════════════════════════════════════════════
    
    📂 NEW FILES CREATED
    
    src/api.ts ................. API-only entry point
    start_dev.sh ............... Full system launcher
    SESSION_SUMMARY.md ......... What was fixed
    SYSTEM_READY.md ............ Complete status
    MOBILE_RUN_UA.md ........... Ukrainian guide
    ALL_LINKS.md ............... All URLs & endpoints
    START_HERE.txt ............. Quick reminder
    SYSTEM_ARCHITECTURE.md .... This file
    
    ═════════════════════════════════════════════════════════
    
    🎯 ONE-COMMAND STARTUP
    
    bash start_dev.sh
    
    This will:
    • Kill any old processes
    • Start Backend API (3000)
    • Start Admin Panel (5174)
    • Start Staff Panel (5173)
    • Start Expo Server (8082)
    • Show all endpoints & logs
    
    Takes ~5 seconds total
    
    ═════════════════════════════════════════════════════════
    
    💡 HOW IT WORKS
    
    [Your Mac] ──WiFi──► [Your Phone]
        │
        ├─► Backend API (port 3000)
        │       └─ Mobile app connects here
        │       └ Returns task/quest data
        │
        ├─► Admin Panel (5174)
        │       └─ Browser dashboard
        │
        ├─► Staff Panel (5173)
        │       └─ Browser dashboard
        │
        └─► Expo Server (8082)
                └─ Delivers mobile app
                └─ Tunnel mode (internet)
    
    ═════════════════════════════════════════════════════════
    
    🔒 TEST CREDENTIALS
    
    Username: admin
    Password: admin
    
    Works on:
    • Admin Panel (web)
    • Staff Panel (web)
    • Mobile App (Expo)
    
    ═════════════════════════════════════════════════════════
    
    🚀 NEXT STEPS
    
    1. Open Terminal
    2. Type: bash start_dev.sh
    3. Wait 5 seconds
    4. Open Expo Go on phone
    5. Find "GenTrust School"
    6. Login: admin/admin
    7. Enjoy!
    
    ═════════════════════════════════════════════════════════
    
    📞 DOCUMENTATION FILES
    
    Need help? Read these:
    
    📄 START_HERE.txt ............... Quick 30-second guide
    📄 SESSION_SUMMARY.md ........... What was fixed (detailed)
    📄 SYSTEM_READY.md ............. Full status & troubleshooting
    📄 MOBILE_RUN_UA.md ............ Instructions in Ukrainian 🇺🇦
    📄 ALL_LINKS.md ................. All URLs & API endpoints
    📄 QUICK_START_MOBILE.md ........ Mobile app setup guide
    
    ═════════════════════════════════════════════════════════
    
    ✨ SPECIAL NOTES
    
    • API runs in "API-only" mode (faster startup)
    • Telegram bots NOT active (not needed for mobile app)
    • If you want bots: Use "npm run dev" instead
    • Mobile app already configured correctly
    • All credentials pre-configured
    • All dependencies installed
    • Project size: 1.4 GB
    • Disk free: 32 GB
    
    ═════════════════════════════════════════════════════════
    
    🎓 KEY FEATURES NOW WORKING
    
    Mobile App:
    ✅ User authentication (login)
    ✅ View task orders (завдання)
    ✅ View quest details
    ✅ Sync with backend
    ✅ Real-time updates
    
    Web Dashboards:
    ✅ Admin panel functionality
    ✅ Staff panel functionality
    ✅ User management
    ✅ Task management
    
    Backend API:
    ✅ Health checks
    ✅ Authentication endpoints
    ✅ Task/quest endpoints
    ✅ User management endpoints
    ✅ 20+ API routes
    
    ═════════════════════════════════════════════════════════
    
    🎉 YOU ARE ALL SET!
    
    Everything is configured, fixed, and ready.
    
    Just run: bash start_dev.sh
    
    Then test on your phone via Expo Go.
    
    ═════════════════════════════════════════════════════════
    
    Last Updated: 28 Feb 2026
    Status: ✅ PRODUCTION READY FOR TESTING
    Time to launch: 5 seconds
    Effort to run: 1 command
    
       Good luck! 🚀
```

## Latest Verification Update (2026-03-01)

Completed full E2E validation of photo-proof workflow for client and parent scenarios.

- Result: PASS (2/2)
- Client flow approve: PASS
- Parent flow reject: PASS
- API health: PASS
- Push token registration endpoint: PASS

Detailed report:
- [docs/E2E_PHOTO_VERIFICATION_REPORT_2026-03-01.md](docs/E2E_PHOTO_VERIFICATION_REPORT_2026-03-01.md)

Validation script:
- [scripts/e2e_photo_verification_check.js](scripts/e2e_photo_verification_check.js)

Push implementation status:
- [src/api/routes/users.ts](src/api/routes/users.ts) -> POST /api/users/push-token
- [src/services/push.ts](src/services/push.ts) -> Expo push delivery helper
- [mobile-school/services/pushNotifications.ts](mobile-school/services/pushNotifications.ts) -> auth push token registration
- [mobile-parent/services/pushNotifications.ts](mobile-parent/services/pushNotifications.ts) -> auth push token registration
- [mobile-school/screens/LoginScreen.tsx](mobile-school/screens/LoginScreen.tsx) -> register push after login
- [mobile-parent/screens/ParentLoginScreen.tsx](mobile-parent/screens/ParentLoginScreen.tsx) -> register push after login
- [src/services/task_completion.ts](src/services/task_completion.ts) -> push on pending/approved/rejected states

Feature components verified:
- [src/api/routes/quests.ts](src/api/routes/quests.ts)
- [src/api/routes/completions.ts](src/api/routes/completions.ts)
- [src/api/routes/parents.ts](src/api/routes/parents.ts)
- [src/bot.ts](src/bot.ts)
- [mobile-school/screens/QuestDetailsScreen.tsx](mobile-school/screens/QuestDetailsScreen.tsx)
- [mobile-parent/screens/PendingApprovalsScreen.tsx](mobile-parent/screens/PendingApprovalsScreen.tsx)
- [mobile/gentrustmobility/app/(tabs)/explore.tsx](mobile/gentrustmobility/app/(tabs)/explore.tsx)
