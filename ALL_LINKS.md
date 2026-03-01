# 🔗 GenTrust Mobility - All URLs & Links

## 📱 MOBILE APP LINKS (For Expo)

### Primary Way to Run Mobile App
1. Run on Mac: `bash start_dev.sh`
2. On your phone, open **Expo Go** app
3. Look for **"GenTrust School"** project in the list
4. Tap to open

### If QR Code Appears
Scan the QR code shown in the terminal when you run:
```bash
cd mobile-school && npx expo start --tunnel
```

### Manual Link (appears in terminal)
```
exp://your-tunnel-id@us1.tunnels.expo.io:443/--/
```

---

## 🌐 WEB SERVICES (Open in Browser)

### Backend API
```
http://192.168.178.34:3000/api/health
```
**Test:** Should return `{"status":"ok",...}`

### Admin Dashboard
```
http://192.168.178.34:5174
```
- Login: **admin** / **admin**
- Full admin panel for managing users, tasks, etc.

### Staff Dashboard
```
http://192.168.178.34:5173
```
- Login: **admin** / **admin**
- Staff panel for managing assignments

---

## 🔌 API ENDPOINTS (For Testing)

### Health Check
```
GET http://192.168.178.34:3000/api/health
```

### Login
```
POST http://192.168.178.34:3000/api/auth/login
Headers: Content-Type: application/json
Body: {"login":"admin","password":"admin"}
```

### Get Tasks
```
GET http://192.168.178.34:3000/api/tasks
Headers: Authorization: Bearer {token}
```

### Get User Profile
```
GET http://192.168.178.34:3000/api/users/me
Headers: Authorization: Bearer {token}
```

---

## 📍 NETWORK INFORMATION

**Your Mac IP:** `192.168.178.34`  
**Subnet Mask:** 255.255.255.0  
**Gateway:** 192.168.178.1  

**Services Binding:**
- All services bind to `192.168.178.34` (your Mac's IP)
- Phone can reach all services over WiFi
- Same WiFi network required

---

## 🚀 STARTUP COMMANDS

### Quick Start (All Services)
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
bash start_dev.sh
```

### Individual Service Startup

**Backend API (API-only mode)**
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
npm run api
```

**Backend with Telegram Bots**
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
npm run dev
```

**Admin Panel**
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/admin-panel
npm run dev
```

**Staff Panel**
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/staff-panel
npm run dev
```

**Expo Mobile App**
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-school
npx expo start --tunnel
```

---

## 📊 SERVICE MAP

```
┌─ LOCALHOST (127.0.0.1) ──────────────────────────┐
│                                                   │
│  Your Computer (192.168.178.34)                  │
│  ├─ Backend API     :3000   ✅                   │
│  ├─ Admin Panel     :5174   ✅                   │
│  ├─ Staff Panel     :5173   ✅                   │
│  └─ Metro Server    :8081   ✅ (Expo)           │
│                                                   │
└─── WiFi (192.168.178.x) ─────────────────────────┘
                   │
        Your Phone (192.168.x.x)
        ├─ Expo Go App
        └─ Connects to 192.168.178.34:3000
```

---

## 🎯 QUICK REFERENCE

| What | URL | Username | Password |
|------|-----|----------|----------|
| **API Health** | http://192.168.178.34:3000/api/health | - | - |
| **Admin Panel** | http://192.168.178.34:5174 | admin | admin |
| **Staff Panel** | http://192.168.178.34:5173 | admin | admin |
| **Mobile App** | Expo Go → GenTrust School | admin | admin |

---

## 🛠️ DEBUGGING LINKS

### View Logs
```bash
# Backend logs
tail -f /tmp/backend.log

# Admin Panel logs
tail -f /tmp/admin.log

# Staff Panel logs
tail -f /tmp/staff.log

# Expo/Mobile logs
tail -f /tmp/expo.log
```

### Check Services
```bash
# Check if ports are listening
lsof -i :3000    # Backend
lsof -i :5174    # Admin
lsof -i :5173    # Staff
lsof -i :8082    # Expo

# Check running processes
ps aux | grep -E "(npm|node)"

# Test API connectivity
curl http://192.168.178.34:3000/api/health
```

---

## 🚪 PROJECT DIRECTORY

```
/Users/apple/Desktop/GenTrust_Mobility_DE/

📁 src/
   ├── api.ts              ← API-only entry point (NEW)
   ├── index.ts            ← Full entry with bots
   └── api/
       ├── server.ts       ← Express app
       ├── routes/
       └── middleware/

📁 mobile-school/
   ├── config.ts           ← API configuration
   ├── app.json            ← Expo config
   ├── App.tsx             ← Main app component
   └── screens/
       └── LoginScreen.tsx

📁 admin-panel/
   ├── src/
   │   ├── App.tsx
   │   └── components/
   └── vite.config.js

📁 staff-panel/
   └── (similar structure)

📄 package.json            ← Scripts: dev, api, build
📄 start_dev.sh            ← Start all services (NEW)
📄 SYSTEM_READY.md         ← Status report (NEW)
📄 QUICK_START_MOBILE.md   ← Mobile setup guide (NEW)
```

---

## 📞 SUPPORT

### Common Issues & Solutions

**"Cannot connect to API"**
→ Check: `curl http://192.168.178.34:3000/api/health`

**"Port 3000 already in use"**
→ Run: `killall -9 npm node` then `bash start_dev.sh`

**"Expo can't find GenTrust School"**
→ Restart: `cd mobile-school && npx expo start --tunnel`

**"Network Error on mobile login"**
→ Ensure phone & Mac on same WiFi, then try: Shake phone → Reload

---

## 🎬 NEXT ACTIONS

1. ✅ Everything is ready
2. Run: `bash start_dev.sh`
3. Open Expo Go on phone
4. Find "GenTrust School"
5. Login: admin / admin
6. Test features!

---

**Last Updated:** 28 Feb 2026  
**System Status:** ✅ READY  
**All URLs Valid:** ✅ YES  
**Mobile Ready:** ✅ YES
