# 🚀 GenTrust Mobility - Quick Start Guide

## ✅ System Status

All services have been fixed and are ready to run!

### What Changed:
1. ✅ Fixed TypeScript error in `admin.ts` (line 240)
2. ✅ Created API-only mode (`src/api.ts`) without Telegram bots
3. ✅ Updated `nodemon.json` config
4. ✅ Added `npm run api` script for API-only startup
5. ✅ Created `start_dev.sh` script for full system startup

## 🎯 Quick Start (Choose One)

### Option 1: Start Everything at Once
```bash
bash start_dev.sh
```

This will start:
- Backend API (port 3000) - API-only mode
- Admin Panel (port 5174)
- Staff Panel (port 5173) 
- Expo School App (port 8082 - tunnel mode)

### Option 2: Start Services Individually
```bash
# Terminal 1 - Backend API
cd /Users/apple/Desktop/GenTrust_Mobility_DE
npm run api

# Terminal 2 - Admin Panel
cd admin-panel
npm run dev

# Terminal 3 - Staff Panel
cd staff-panel
npm run dev

# Terminal 4 - Expo School App
cd mobile-school
npx expo start --tunnel
```

## 📱 Mobile App Setup

### On Your Phone:
1. Install **Expo Go** app from App Store or Play Store
2. Open Expo Go
3. Look for "GenTrust School" in the list OR scan the QR code shown when `npx expo start --tunnel` runs
4. App will load and connect to API at `http://192.168.178.34:3000/api`

### Expo Link (Tunnel Mode):
The link will appear in terminal when running:
```
npx expo start --tunnel
```

Look for: `exp://...`

## 🧪 Test Credentials

**Admin/Staff Login:**
- Username: `admin`
- Password: `admin`

**Test API Endpoint:**
```bash
curl http://192.168.178.34:3000/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-28T..."}
```

## 📊 Service Endpoints

| Service | URL | Status |
|---------|-----|--------|
| Backend API | http://192.168.178.34:3000/api | API-only (no Telegram bots yet) |
| Admin Panel | http://192.168.178.34:5174 | Frontend dashboard |
| Staff Panel | http://192.168.178.34:5173 | Staff management |
| Expo School | Tunnel Mode | Mobile app (via Expo Go) |

## 🔗 Project Structure

```
/Users/apple/Desktop/GenTrust_Mobility_DE/
├── src/
│   ├── api.ts          (NEW) - API-only entry point
│   ├── index.ts        - Full system with bots
│   └── api/
│       └── server.ts   - Express server
├── mobile-school/      - React Native Expo app
├── admin-panel/        - Vite + React admin dashboard
├── staff-panel/        - Vite + React staff dashboard
├── start_dev.sh        (NEW) - Full startup script
└── nodemon.json        (FIXED) - Auto-reload config
```

## 📝 Important Notes

### API-Only Mode
Currently running in **API-only mode** (no Telegram bots). This allows:
- ✅ Fast API server startup
- ✅ Mobile app authentication and testing
- ✅ Admin/Staff panel testing

### Future: Full Mode with Bots
To run with all 5 Telegram bots in the future:
```bash
npm run dev
```
This will start `src/index.ts` with full bot integration (slower startup, requires internet for Telegram).

## 🛠️ Troubleshooting

### "Port already in use"
```bash
# Kill all Node/npm processes
killall -9 npm node

# Then restart
bash start_dev.sh
```

### "Cannot connect to API"
1. Verify IP: `ping 192.168.178.34`
2. Check Backend logs: `tail -f /tmp/backend.log`
3. Restart Backend: `npm run api`

### "Mobile app login fails"
1. Ensure Backend API is running
2. Check: `curl http://192.168.178.34:3000/api/health`
3. Verify phone is on same WiFi as computer
4. Try force reload in Expo Go (shake phone, select "Reload")

## 📚 Additional Commands

```bash
# View Backend logs
tail -f /tmp/backend.log

# View Admin Panel logs
tail -f /tmp/admin.log

# View Staff Panel logs
tail -f /tmp/staff.log

# View Expo logs
tail -f /tmp/expo.log

# Check if ports are listening
lsof -i :3000
lsof -i :5173
lsof -i :5174
lsof -i :8082
```

## ✨ Next Steps

1. **Run all services**: `bash start_dev.sh`
2. **Open Admin Panel**: http://192.168.178.34:5174
3. **Open Expo on phone**: Scan QR code or use exp:// link
4. **Test mobile login**: Use admin/admin credentials
5. **Explore features**: Check task orders ↔ quests sync

---

**Created:** Feb 28, 2026  
**Last Updated:** Feb 28, 2026
