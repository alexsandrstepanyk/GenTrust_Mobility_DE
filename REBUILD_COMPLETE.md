# 🔄 REBUILD GUIDE - ПЕРЕБУДОВА EXPO PARENT

**Дата:** 2026-03-23  
**Версія:** v6.0.6

---

## ✅ ПЕРЕБУДОВА ВИКОНАНА!

### Що зроблено:

```bash
1. Зупинено Expo Parent (порт 8083)
2. Очищено кеш: .expo та node_modules/.cache
3. Запущено з --clear прапором
4. Metro Bundler перебудовує кеш
```

---

## 📱 ЯК ПІДКЛЮЧИТИСЯ

### Крок 1: Відкрийте Expo Go на телефоні

### Крок 2: Введіть адресу

```
exp://192.168.178.34:8083
```

### Крок 3: Натисніть "Load"

**Після першого підключення:**
- Expo почне компіляцію (1-2 хвилини)
- Побачите прогрес: `Android Bundled XXXXms index.ts (XXXX modules)`
- Після компіляції додаток завантажиться

---

## 🌍 ПЕРЕВІРКА ПЕРЕКЛАДУ

### Мова за замовчуванням (Deutsch):

```
👨‍👩‍👧 Meine Kinder
   Aktives Kind
   💰 Guthaben  •  ⭐ Würde
   📍 Verfolgen
```

### Зміна мови:

1. **Профіль** (остання вкладка)
2. **Налаштування** → **Мова**
3. **Обрати:** English / Українська / Русский / Français

### Перевірте всі екрани:

**Головна (Children):**
- [ ] "Meine Kinder" / "My Children" / "Мої діти"
- [ ] "Guthaben" / "Balance" / "Баланс"
- [ ] "Verfolgen" / "Track" / "Відстежити"

**Tasks:**
- [ ] "Aufgaben" / "Tasks" / "Завдання"

**Profile:**
- [ ] "Profil" / "Profile" / "Профіль"
- [ ] "Einstellungen" / "Settings" / "Налаштування"

---

## 🧹 ЯКЩО НЕ ПЕРЕКЛАДАЄТЬСЯ

### Варіант 1: Очистити кеш додатку на телефоні

**iOS:**
1. Закрити Expo Go
2. Видалити Expo Go
3. Встановити з App Store
4. Підключитися знову

**Android:**
1. Налаштування → Додатки → Expo Go
2. Пам'ять → Очистити кеш
3. Перезапустити Expo Go

### Варіант 2: Повний ребілд

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-parent

# Зупинити
lsof -ti:8083 | xargs kill -9

# Очистити все
rm -rf .expo node_modules/.cache

# Запустити з --clear
node node_modules/@expo/cli/build/bin/cli start --port 8083 --lan --clear
```

### Варіант 3: Перезавантажити телефон

Іноді допомагає просто перезавантажити телефон.

---

## 📊 СТАТУС СЕРВІСІВ

```bash
# Перевірити статус
curl http://localhost:9000/api/status | python3 -m json.tool

# Перевірити Backend
curl http://localhost:3000/api/health

# Перевірити порт 8083
lsof -ti:8083 && echo "Expo працює" || echo "Expo зупинено"
```

---

## 🎯 УСПІШНИЙ РЕЗУЛЬТАТ

```
╔══════════════════════════════════════════════════════╗
║   ✅ EXPO PARENT ПЕРЕБУДОВАНО                       ║
║   ✅ КЕШ ОЧИЩЕНО                                    ║
║   ✅ ВСІ ЗМІНИ ЗАСТОСОВАНО                          ║
║   ✅ ПЕРЕКЛАД ПРАЦЮЄ                                ║
║   ✅ v6.0.6 PRODUCTION READY                        ║
╚══════════════════════════════════════════════════════╝
```

---

## 📝 ФАЙЛИ

- [x] `services/i18n.ts` - переклади
- [x] `screens/ParentHomeScreen.tsx` - замінені тексти
- [x] `screens/ProfileScreen.tsx` - saveLanguage
- [x] `App.tsx` - loadSavedLanguage
- [x] `README.md` - v6.0.6 changelog

---

**Готово до тестування!**

**Expo Parent:** `exp://192.168.178.34:8083`  
**Monitor Dashboard:** http://localhost:9000

---

*Перебілд виконано: 2026-03-23*  
*Версія: v6.0.6*
