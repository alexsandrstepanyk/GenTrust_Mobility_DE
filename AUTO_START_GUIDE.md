# 🚀 GENTRUST MOBILITY - АВТОЗАПУСК СИСТЕМИ

## 📋 ОПИС

Цей скрипт автоматично запускає ВСІ сервіси GenTrust Mobility після перезавантаження macOS.

## 🔧 ВСТАНОВЛЕННЯ

### 1. Створіть LaunchAgent

```bash
# Створіть директорію якщо не існує
mkdir -p ~/Library/LaunchAgents

# Скопіюйте plist файл
cp /Users/apple/Desktop/GenTrust_Mobility_DE/com.gentrust.autostart.plist ~/Library/LaunchAgents/

# Завантажте агент
launchctl load ~/Library/LaunchAgents/com.gentrust.autostart.plist
```

### 2. Перевірте статус

```bash
launchctl list | grep gentrust
```

### 3. Вимкнення автозапуску

```bash
launchctl unload ~/Library/LaunchAgents/com.gentrust.autostart.plist
rm ~/Library/LaunchAgents/com.gentrust.autostart.plist
```

---

## 📊 ЩО ЗАПУСКАЄТЬСЯ

### **1️⃣ Monitor Dashboard (ПЕРШИМ!)**
- **Порт:** 9000
- **URL:** http://localhost:9000
- **Призначення:** Моніторинг всіх сервісів

### **2️⃣ Backend API + Telegram Botи**
- **Порт:** 3000
- **URL:** http://localhost:3000/api
- **Боти:** Master, Scout, City Hall, Quest Provider, Municipal

### **3️⃣ Core Dashboards**
| Дашборд | Порт | URL |
|---------|------|-----|
| City-Hall | 5173 | http://localhost:5173 |
| Admin Panel | 5174 | http://localhost:5174 |
| Staff Panel | 5176 | http://localhost:5176 |

### **4️⃣ Департаменти (8 дашбордів)**
| Департамент | Порт | URL |
|-------------|------|-----|
| 🛣️ Дороги | 5180 | http://localhost:5180 |
| 💡 Освітлення | 5181 | http://localhost:5181 |
| 🗑️ Сміття | 5182 | http://localhost:5182 |
| 🌳 Парки | 5183 | http://localhost:5183 |
| 🚰 Вода | 5184 | http://localhost:5184 |
| 🚌 Транспорт | 5185 | http://localhost:5185 |
| 🌿 Екологія | 5186 | http://localhost:5186 |
| 🎨 Вандалізм | 5187 | http://localhost:5187 |

### **5️⃣ Mobile Apps (Expo)**
| Додаток | Порт | URL |
|---------|------|-----|
| Mobile School | 8082 | exp://localhost:8082 |
| Mobile Parent | 8083 | exp://localhost:8083 |
| Mobile Client | 8081 | exp://localhost:8081 |

---

## 🎮 УПРАВЛІННЯ ЧЕРЕЗ MONITOR (9000)

Після запуску відкрийте **http://localhost:9000** і використовуйте кнопки:

| Кнопка | Дія |
|--------|-----|
| 🤖 **Запустити ВСІ Telegram боти** | Backend + 5 ботів |
| 🖥️ **Запустити ВСІ Dashboards** | 11 дашбордів (3 Core + 8 департаментів) |
| 📱 **Запустити ВСІ Expo Apps** | 3 мобільні додатки |
| 🛑 **Зупинити ВСІ процеси** | Повна зупинка системи |

---

## 📋 ЛОГИ ВСІХ СЕРВІСІВ

| Сервіс | Лог файл |
|--------|----------|
| Backend API | `/tmp/backend.log` |
| Monitor | `/tmp/monitor.log` |
| Admin Panel | `/tmp/admin-panel.log` |
| City-Hall | `/tmp/city-hall.log` |
| Staff Panel | `/tmp/staff-panel.log` |
| Roads Dept | `/tmp/dept-roads.log` |
| Lighting Dept | `/tmp/dept-lighting.log` |
| Waste Dept | `/tmp/dept-waste.log` |
| Parks Dept | `/tmp/dept-parks.log` |
| Water Dept | `/tmp/dept-water.log` |
| Transport Dept | `/tmp/dept-transport.log` |
| Ecology Dept | `/tmp/dept-ecology.log` |
| Vandalism Dept | `/tmp/dept-vandalism.log` |
| Expo School | `/tmp/expo-school.log` |
| Expo Parent | `/tmp/expo-parent.log` |

### Перегляд логів:

```bash
# Останні 50 рядків
tail -50 /tmp/backend.log

# В реальному часі
tail -f /tmp/backend.log

# Всі логи одночасно
tail -f /tmp/{backend,admin-panel,city-hall}.log
```

---

## 🔍 ПЕРЕВІРКА СТАТУСУ

### Перевірка портів:

```bash
# Всі порти GenTrust
lsof -i :3000,5173,5174,5176,5180,5181,5182,5183,5184,5185,5186,5187,8081,8082,8083,9000
```

### Перевірка через API:

```bash
# Статус всіх сервісів
curl http://localhost:9000/api/status | python3 -m json.tool

# Тільки Backend
curl http://localhost:3000/api/health
```

---

## 🛠️ ВИРІШЕННЯ ПРОБЛЕМ

### Сервіс не запускається:

1. **Перевірте логи:**
   ```bash
   tail -100 /tmp/backend.log
   ```

2. **Звільніть порти:**
   ```bash
   killall -9 node npm vite expo 2>/dev/null || true
   ```

3. **Запустіть через Monitor:**
   - Відкрийте http://localhost:9000
   - Натисніть потрібну кнопку запуску

### Помилки npm:

```bash
# Очистити кеш
npm cache clean --force

# Перевстановити залежності
cd /Users/apple/Desktop/GenTrust_Mobility_DE
npm install
```

---

## 📍 ШЛЯХИ ДО ФАЙЛІВ

```
/Users/apple/Desktop/GenTrust_Mobility_DE/
├── com.gentrust.autostart.plist    # LaunchAgent для автозапуску
├── start.sh                        # Ручний запуск всіх сервісів
├── monitor/
│   ├── server.js                   # Monitor Dashboard
│   └── public/
│       ├── index.html              # UI моніторингу
│       └── style.css               # Стилі
├── departments/
│   ├── roads/                      # Дороги (5180)
│   ├── lighting/                   # Освітлення (5181)
│   ├── waste/                      # Сміття (5182)
│   ├── parks/                      # Парки (5183)
│   ├── water/                      # Вода (5184)
│   ├── transport/                  # Транспорт (5185)
│   ├── ecology/                    # Екологія (5186)
│   └── vandalism/                  # Вандалізм (5187)
├── admin-panel/                    # Admin Panel (5174)
├── city-hall-dashboard/            # City-Hall (5173)
├── staff-panel/                    # Staff Panel (5176)
├── mobile-school/                  # Mobile School (8082)
├── mobile-parent/                  # Mobile Parent (8083)
└── src/                            # Backend API + Botи (3000)
```

---

## 🆕 ОНОВЛЕННЯ (2026-03-03)

### Додано:

1. **8 Департаментів** з повним функціоналом City-Hall
2. **Monitor Dashboard** з кнопками масового запуску
3. **Автозапуск** через LaunchAgent
4. **Фіксовані порти** для всіх сервісів
5. **API для департаментів** (`/api/reports/department/:deptId`)

### Логіка роботи:

- **Боти інтегровані в Backend** → запускаються разом
- **Департаменти бачать ТІЛЬКИ свої звіти** → фільтрація по `forwardedTo`
- **Monitor перевіряє статус** → через порти (не логи)
- **Кожний сервіс має фіксований порт** → ніхто не займає чужі

---

**Останнє оновлення:** 2026-03-03  
**Статус:** ✅ ГОТОВО ДО ВИКОРИСТАННЯ
