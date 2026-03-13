# 🚀 GENTRUST MOBILITY - ЧИСТИЙ ЗАПУСК

**Статус:** ✅ СИСТЕМА ГОТОВА ДО ЧИСТОГО ЗАПУСКУ

---

## ✅ ЩО ЗРОБЛЕНО:

### 1. Зупинка всіх сервісів:
- ✅ Backend API зупинено
- ✅ Expo зупинено
- ✅ Vite дев-сервери зупинено
- ✅ Monitor Dashboard зупинено

### 2. Глибоке очищення кешу:
- ✅ `node_modules/.cache` - видалено
- ✅ `.expo` - видалено
- ✅ `.vite` (всі дашборди) - видалено
- ✅ `/tmp/*.log` - видалено

### 3. Перевірка портів:
- ✅ Всі 14 портів вільні (3000, 5173-5187, 8081, 9000)

---

## 🎯 ЯК ЗАПУСТИТИ З ЧИСТОГО АРКУША:

### Варіант 1: Все автоматично (рекомендовано)
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
bash start-v6-full.sh
```

### Варіант 2: По черзі
```bash
# 1. Backend API
cd /Users/apple/Desktop/GenTrust_Mobility_DE
npx ts-node src/api-server.ts

# 2. Expo School (в новому терміналі)
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-school
npx expo start --go

# 3. Monitor Dashboard (в новому терміналі)
cd /Users/apple/Desktop/GenTrust_Mobility_DE/monitor
node server.js
```

---

## 📋 ПЕРЕВІРКА ПІСЛЯ ЗАПУСКУ:

### Перевірити Backend:
```bash
curl http://localhost:3000/health
```

### Перевірити порти:
```bash
lsof -i :3000,8081,5173,9000 | grep LISTEN
```

### Перевірити процеси:
```bash
ps aux | grep -E "ts-node|expo|vite" | grep -v grep
```

---

## 🧹 ЯК ПОВНІСТЮ ОЧИСТИТИ СИСТЕМУ:

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE

# Зупинити все
pkill -f "ts-node"
pkill -f "expo"
pkill -f "vite"
pkill -f "node.*monitor"

# Очистити кеш
rm -rf node_modules/.cache
rm -rf .expo
rm -rf */.vite
rm -rf departments/*/.vite
rm -f /tmp/*.log

# Перевірити
lsof -i :3000,5173,5174,5175,5180-5187,8081,9000 | grep LISTEN
# Має бути пусто
```

---

## 📊 ПОТОЧНИЙ СТАН:

```
✅ Всі сервіси зупинено
✅ Всі порти вільні
✅ Кеш очищено
✅ Логи видалено
✅ Система готова до чистого запуску
```

---

## ⚠️ ВАЖЛИВО:

**Наступного разу:**
1. Виконайте `bash start-v6-full.sh`
2. Зачекайте 30-60 секунд
3. Перевірте `lsof -i :3000,8081 | grep LISTEN`
4. Підключіть Expo з телефону

**Якщо щось не працює:**
- Перевірте логи: `tail -f /tmp/BackendAPIv6.log`
- Перевірте порти: `lsof -i :3000`
- Перезапустіть: `bash stop_all.sh && bash start-v6-full.sh`

---

**СИСТЕМА ГОТОВА! 🚀**
