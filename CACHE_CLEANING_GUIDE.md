# 🧹 CACHE CLEANING GUIDE

**Дата:** 2026-03-07  
**Час:** 02:00 - 02:30  
**Версія:** v5.1.6  
**Тип:** Troubleshooting Guide

---

## 🎯 ПРОБЛЕМА

Користувач повідомив:
> "тобто в них одакова html стилі і все інше якщо так то сому я бачу старий дизайн"

**Причина:** Кеш браузера зберігає старі CSS/JS файли

---

## ✅ РІШЕННЯ

### **Спосіб 1: Hard Refresh (Найшвидший)**

#### **macOS / Chrome:**
```
Cmd + Shift + R
```

#### **Windows / Chrome:**
```
Ctrl + Shift + R
```

#### **macOS / Firefox:**
```
Cmd + Shift + R
```

#### **Windows / Firefox:**
```
Ctrl + F5
```

#### **Safari:**
```
Cmd + Option + R
```

---

### **Спосіб 2: Очистити кеш вручну**

#### **Chrome:**
1. Відкрийте DevTools (F12 або Cmd+Option+I)
2. Натисніть **правою кнопкою** на кнопку Refresh
3. Оберіть **"Empty Cache and Hard Reload"**

#### **Firefox:**
1. Відкрийте DevTools (F12)
2. Натисніть **правою кнопкою** на кнопку Refresh
3. Оберіть **"Reload Skipping Cache"**

#### **Safari:**
1. Safari → Preferences → Advanced
2. Увімкніть "Show Develop menu"
3. Develop → Empty Caches (Cmd+Option+E)

---

### **Спосіб 3: Очистити весь кеш**

#### **Chrome:**
1. `Cmd + Shift + Delete` (macOS) або `Ctrl + Shift + Delete` (Windows)
2. Оберіть "Cached images and files"
3. Натисніть "Clear data"

#### **Firefox:**
1. `Cmd + Shift + Delete` (macOS) або `Ctrl + Shift + Delete` (Windows)
2. Оберіть "Cache"
3. Натисніть "Clear Now"

#### **Safari:**
1. Safari → Clear History
2. Оберіть "all history"
3. Натисніть "Clear History"

---

### **Спосіб 4: Incognito / Private Mode**

Відкрийте в режимі інкогніто:
- **Chrome:** `Cmd + Shift + N` (macOS) або `Ctrl + Shift + N` (Windows)
- **Firefox:** `Cmd + Shift + P` (macOS) або `Ctrl + Shift + P` (Windows)
- **Safari:** `Cmd + Shift + N`

**Перевага:** Немає кешу взагалі!

---

## 🔧 ДЛЯ РОЗРОБНИКІВ

### **Вимкнути кеш в DevTools:**

1. Відкрийте DevTools (F12)
2. Перейдіть в **Network** tab
3. Увімкніть **"Disable cache"**
4. Тримайте DevTools відкритими

**Результат:** Кеш не використовується поки DevTools відкриті

---

### **Додати version query string:**

```html
<!-- ДОДАВШИ version query string -->
<link rel="stylesheet" href="/assets/index.css?v=5.1.6">
<script src="/assets/index.js?v=5.1.6"></script>
```

Або в `vite.config.ts`:

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  }
})
```

---

## 📊 ПЕРЕВІРКА

### **Як перевірити що кеш очистився:**

1. Відкрийте DevTools (F12)
2. Перейдіть в **Network** tab
3. Оновіть сторінку (Cmd+R або Ctrl+R)
4. Перевірте що CSS/JS файли мають статус **200** (не 304!)

**200** = Завантажено з сервера ✅  
**304** = Завантажено з кешу ❌

---

### **Перевірка версії:**

```bash
# Відкрийте консоль і введіть:
console.log('Version check');

# Або перевірте в HTML:
curl http://localhost:5182 | grep -o "v[0-9.]*"
```

---

## 🎯 ПОРІВНЯННЯ ДО/ПІСЛЯ

### **До очищення кешу:**

```
http://localhost:5182 (Waste Department)

Заголовок: 🏛️ City Hall ❌
Колір: Синій (#3B82F6) ❌
Графіки: Сині ❌
Меню: Синє ❌
```

### **Після очищення кешу:**

```
http://localhost:5182 (Waste Department)

Заголовок: 🗑️ Сміття ✅
Колір: Зелений (#10B981) ✅
Графіки: Зелені ✅
Меню: Зелене ✅
```

---

## 📝 ІНСТРУКЦІЯ ДЛЯ КОРИСТУВАЧІВ

### **Українська:**

```
🧹 ЯК ОЧИСТИТИ КЕШ:

1. Натисніть Cmd + Shift + R (macOS) або Ctrl + Shift + R (Windows)
2. Сторінка перезавантажиться з новим дизайном
3. Готово!

Якщо не допомогло:
1. Відкрийте Chrome
2. Натисніть F12
3. Натисніть правою кнопкою на кнопку Refresh
4. Оберіть "Empty Cache and Hard Reload"
```

### **Англійська:**

```
🧹 HOW TO CLEAR CACHE:

1. Press Cmd + Shift + R (macOS) or Ctrl + Shift + R (Windows)
2. Page will reload with new design
3. Done!

If it doesn't help:
1. Open Chrome
2. Press F12
3. Right-click on Refresh button
4. Select "Empty Cache and Hard Reload"
```

---

## 🚀 ШВИДКА ПЕРЕВІРКА

### **Відкрийте і порівняйте:**

```
City-Hall:     http://localhost:5173
Waste Dept:    http://localhost:5182
```

**Очікуйте:**
- ✅ Однаковий layout
- ✅ Однакові компоненти
- ✅ Однакові графіки
- ⚠️ Різні кольори (синій vs зелений)
- ⚠️ Різні заголовки (City Hall vs Waste)

---

## ⚠️ ЧАСТІ ПРОБЛЕМИ

### **1. Кеш не очищується**

**Рішення:**
```bash
# Закрийте браузер повністю
killall Chrome  # macOS
taskkill /F /IM chrome.exe  # Windows

# Видаліть кеш вручну
rm -rf ~/Library/Caches/Google/Chrome/Default/Cache  # macOS
```

### **2. Service Worker кешує**

**Рішення:**
1. Відкрийте DevTools
2. Перейдіть в **Application** tab
3. Service Workers → Unregister
4. Clear storage → Clear site data

### **3. CDN кешує**

**Рішення:**
```bash
# Додайте timestamp до URL
curl http://localhost:5182?t=$(date +%s)
```

---

## ✅ CHECKLIST

- [ ] Hard Refresh (Cmd+Shift+R)
- [ ] Перевірте Network tab (200 не 304)
- [ ] Перевірте заголовок (🗑️ Сміття не 🏛️ City Hall)
- [ ] Перевірте колір (зелений не синій)
- [ ] Перевірте графіки (зелені не сині)

---

## 📞 ПІДТРИМКА

Якщо нічого не допомогло:

1. Спробуйте інший браузер
2. Спробуйте Incognito/Private mode
3. Перезапустіть сервер: `bash start.sh`
4. Зв'яжіться з support@gentrust.mobility

---

**Last Updated:** 2026-03-07  
**Version:** 1.0  
**Status:** ✅ Production Ready
