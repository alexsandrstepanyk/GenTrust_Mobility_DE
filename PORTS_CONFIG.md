# 📡 GENTRUST MOBILITY - ФІКСОВАНІ ПОРТИ

## 🎯 **ПРИНЦИП:**
**КОЖЕН СЕРВІС МАЄ СВІЙ ВЛАСНИЙ ФІКСОВАНИЙ ПОРТ - НІХТО ІНШИЙ НЕ МАЄ ПРАВА ЙОГО ЗАЙМАТИ!**

---

## 📊 **ТАБЛИЦЯ ВСІХ ПОРТІВ**

### **1️⃣ BACKEND API**
| Сервіс | Порт | URL | Лог |
|--------|------|-----|-----|
| Backend API | **3000** | http://localhost:3000/api | `/tmp/backend.log` |

---

### **2️⃣ TELEGRAM БОТИ (5 ботів)**
| Бот | Порт | ID | Лог | Опис |
|-----|------|----|-----|------|
| Master Core Bot | **3001** | `master` | `/tmp/bot-master.log` | Головний бот модерації |
| Scout Bot | **3002** | `scout` | `/tmp/bot-scout.log` | Бот для студентів |
| City Hall Bot | **3003** | `cityhall` | `/tmp/bot-cityhall.log` | Бот мерії |
| Quest Provider Bot | **3004** | `quest-provider` | `/tmp/bot-quest.log` | Бот для створення квестів |
| Municipal Services Bot | **3005** | `municipal` | `/tmp/bot-municipal.log` | Бот комунальних служб |

---

### **3️⃣ WEB ДАШБОРДИ (Core)**
| Дашборд | Порт | URL | Лог | Опис |
|---------|------|-----|-----|------|
| Monitor Dashboard | **9000** | http://localhost:9000 | `/tmp/monitor.log` | **Система моніторингу** |
| Admin Panel | **5174** | http://localhost:5174 | `/tmp/admin-panel.log` | Core адмінка |
| City-Hall Dashboard | **5173** | http://localhost:5173 | `/tmp/city-hall.log` | Дашборд мерії |
| Staff Panel | **5176** | http://localhost:5176 | `/tmp/staff-panel.log` | Панель штабу |

---

### **4️⃣ ДЕПАРТАМЕНТИ (8 дашбордів)**
| № | Департамент | Порт | URL | Лог | Emoji |
|---|-------------|------|-----|-----|-------|
| 1 | **Roads** (Дороги) | **5180** | http://localhost:5180 | `/tmp/dept-roads.log` | 🛣️ |
| 2 | **Lighting** (Освітлення) | **5181** | http://localhost:5181 | `/tmp/dept-lighting.log` | 💡 |
| 3 | **Waste** (Сміття) | **5182** | http://localhost:5182 | `/tmp/dept-waste.log` | 🗑️ |
| 4 | **Parks** (Парки) | **5183** | http://localhost:5183 | `/tmp/dept-parks.log` | 🌳 |
| 5 | **Water** (Вода) | **5184** | http://localhost:5184 | `/tmp/dept-water.log` | 🚰 |
| 6 | **Transport** (Транспорт) | **5185** | http://localhost:5185 | `/tmp/dept-transport.log` | 🚌 |
| 7 | **Ecology** (Екологія) | **5186** | http://localhost:5186 | `/tmp/dept-ecology.log` | 🌿 |
| 8 | **Vandalism** (Вандалізм) | **5187** | http://localhost:5187 | `/tmp/dept-vandalism.log` | 🎨 |

---

### **5️⃣ МОБІЛЬНІ ДОДАТКИ (Expo)**
| Додаток | Порт | URL | Лог | Опис |
|---------|------|-----|-----|------|
| Mobile School | **8082** | exp://localhost:8082 | `/tmp/expo-school.log` | Для школярів |
| Mobile Parent | **8083** | exp://localhost:8083 | `/tmp/expo-parent.log` | Для батьків |
| Mobile Client | **8081** | exp://localhost:8081 | `/tmp/expo-client.log` | Для клієнтів (майбутнє) |

---

### **6️⃣ МАЙБУТНІ РОЗШИРЕННЯ**
| Сервіс | Порт | Призначення |
|--------|------|-------------|
| Department Dashboard #9 | **5188** | Резерв для нового департаменту |
| Department Dashboard #10 | **5189** | Резерв для нового департаменту |
| Mobile Department Apps | **8090-8097** | Мобільні додатки для департаментів |
| Analytics Dashboard | **5190** | Аналітичний дашборд |
| Investor Dashboard | **5191** | Дашборд для інвесторів |

---

## 📁 **СТРУКТУРА ПРОЕКТУ**

```
GenTrust_Mobility_DE/
├── src/                          # Backend + Telegram Botи
│   ├── api/                      # API Server (порт 3000)
│   ├── bot.ts                    # Scout Bot (порт 3002)
│   ├── master_bot.ts             # Master Bot (порт 3001)
│   ├── city_hall_bot.ts          # City Hall Bot (порт 3003)
│   ├── quest_provider_bot.ts     # Quest Provider Bot (порт 3004)
│   └── municipal_bot.ts          # Municipal Bot (порт 3005)
│
├── monitor/                      # Monitor Dashboard (порт 9000)
│   ├── server.js
│   └── public/
│
├── admin-panel/                  # Admin Panel (порт 5174)
├── city-hall-dashboard/          # City-Hall (порт 5173)
├── staff-panel/                  # Staff Panel (порт 5176)
├── department-dashboard/         # Шаблон для департаментів
│
├── departments/                  # 🆕 Дашборди департаментів
│   ├── roads/                    # Дороги (порт 5180)
│   ├── lighting/                 # Освітлення (порт 5181)
│   ├── waste/                    # Сміття (порт 5182)
│   ├── parks/                    # Парки (порт 5183)
│   ├── water/                    # Вода (порт 5184)
│   ├── transport/                # Транспорт (порт 5185)
│   ├── ecology/                  # Екологія (порт 5186)
│   └── vandalism/                # Вандалізм (порт 5187)
│
├── mobile-school/                # Mobile School (порт 8082)
├── mobile-parent/                # Mobile Parent (порт 8083)
└── mobile-client/                # Mobile Client (порт 8081)
```

---

## 🔧 **ЯК ЗАПУСКАТИ**

### **Запуск всіх сервісів:**
```bash
bash start.sh
```

### **Запуск окремого департаменту:**
```bash
cd departments/roads
npm run dev  # Запустить на порті 5180
```

### **Запуск Monitor Dashboard:**
```bash
cd monitor
node server.js  # Запустить на порті 9000
```

### **Перевірка портів:**
```bash
lsof -i :3000,5173,5174,5176,5180,5181,5182,5183,5184,5185,5186,5187,8081,8082,8083,9000
```

### **Зупинка конкретного сервісу:**
```bash
lsof -ti:5180 | xargs kill -9  # Зупинити Roads Department
lsof -ti:3001 | xargs kill -9  # Зупинити Master Bot
```

---

## 🎨 **СТИЛЬ ДАШБОРДІВ ДЕПАРТАМЕНТІВ**

Кожен департамент має дашборд в стилі **City-Hall Dashboard**:

### **Структура:**
```
departments/{dept-name}/
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── ReportMap.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── api.ts
│   │   └── socket.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts       # Фіксований порт
├── package.json
└── index.html
```

### **Функціонал:**
- ✅ Статистика департаменту
- ✅ Список звітів (фільтрація по департаменту)
- ✅ Затвердження/відхилення звітів
- ✅ Real-time оновлення через Socket.IO
- ✅ Карта звітності
- ✅ Аналітика та графіки

---

## 📝 **ПРИКЛАД vite.config.ts для департаменту**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ФІКСОВАНИЙ ПОРТ для {DEPT_NAME} Dashboard
// Ніхто інший не має права займати цей порт!
const PORT = 5180  // Змінювати для кожного департаменту!

console.log(`Starting {DEPT_NAME} Dashboard on FIXED port: ${PORT}`)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: PORT,
    strictPort: true,  // ПОМІЛКА якщо порт зайнятий (не змінювати!)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
})
```

---

## 🚨 **ВАЖЛИВО!**

1. **Ніколи не змінюйте порти** в цьому файлі без узгодження
2. **Кожен новий сервіс** має отримати вільний порт з діапазону
3. **Перед запуском** перевіряйте чи порт вільний: `lsof -i :PORT`
4. **Для зупинки** використовуйте тільки `lsof -ti:PORT | xargs kill -9`
5. **Monitor Dashboard (9000)** завжди запускається першим

---

## 📊 **ДІАПАЗОНИ ПОРТІВ**

| Діапазон | Призначення |
|----------|-------------|
| **3000-3009** | Backend API + Telegram Botи |
| **5173-5179** | Core Web Dashboards |
| **5180-5189** | Департаменти (8 портів) |
| **5190-5199** | Резерв для майбутніх дашбордів |
| **8081-8089** | Мобільні додатки (Expo) |
| **8090-8099** | Резерв для мобільних додатків |
| **9000-9009** | Monitor + System Services |

---

**Останнє оновлення:** 2026-03-03
**Статус:** ✅ ЗАТВЕРДЖЕНО
