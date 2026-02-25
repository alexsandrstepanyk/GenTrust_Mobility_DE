# 🚀 GENTRUST MOBILITY - ЗАПУСК ВСІХ СЕРВІСІВ

## ✅ Поточний статус

| Сервіс | Порт | Статус |
|--------|------|--------|
| **Backend API** | 3000 | ✅ Працює |
| **Staff Panel** | 5173 | ✅ Працює |
| **Admin Panel** | 5174 | ✅ Працює |
| **Mobile Client** | 8081 | ✅ Працює |
| **Mobile School** | 8082 | ✅ Працює |

---

## 🎯 Швидкий запуск

### 1️⃣ Запуск всіх сервісів

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start_all.sh
```

### 2️⃣ Перевірка статусу

```bash
# Backend
curl http://localhost:3000/health

# Staff Panel
curl http://localhost:5173

# Admin Panel
curl http://localhost:5174

# Mobile (Expo)
curl http://localhost:8081
curl http://localhost:8082
```

---

## 📱 Тестові дані

```
Email:    admin
Password: admin
```

---

## 🔧 Виправлені помилки

### ✅ Quests Screen (School App)
- **Було:** Помилка "failed to load quests"
- **Стало:** Використовує `/api/quests/available` з токеном
- **Додано:** Кнопка "Активне завдання" (зелений блок)
- **Додано:** Кнопка "Complete" для завершення

### ✅ API Endpoints
- **Додано:** `GET /api/quests/available` - список доступних квестів
- **Додано:** `POST /api/quests/:id/take` - прийняти квест
- **Додано:** `GET /api/users/active-quest` - активне завдання користувача

### ✅ Config
- **Виправлено:** API URL з `192.168.178.34` на `localhost` (для симулятора)
- **Додано:** SecureStore для токенів

### ✅ Login Screen
- **Виправлено:** Перенаправлення з `'Impact'` на `'Home'`
- **Додано:** Збереження токену в SecureStore

---

## 📊 База даних

### Квести:
- ✅ 5 квестів доступні (OPEN)
- ✅ 3 квести в роботі (IN_PROGRESS)

### Користувачі:
- ✅ Admin: `admin` / `admin`

---

## 🎮 Як тестувати

### School App (iPhone 16):
1. Відкрийте: `exp://192.168.178.34:8082`
2. Увійдіть: `admin` / `admin`
3. Вкладка **Tasks (🎒)**
4. Бачите:
   - 🟢 **Active Quest** (зелений блок) - якщо є активне завдання
   - 📦 **Available Quests** - список доступних
5. Натисніть **Get order** для прийняття
6. Натисніть **Complete** для завершення

### Client App (iPhone 16 Pro):
1. Відкрийте: `exp://192.168.178.34:8081`
2. Створіть замовлення
3. Відстежуйте статус

### Staff Panel:
1. Відкрийте: http://localhost:5173
2. Увійдіть: `admin` / `admin`
3. Підтверджуйте виконані роботи

### Admin Panel:
1. Відкрийте: http://localhost:5174
2. Увійдіть: `admin` / `admin`
3. Керуйте містом, реєстрацією, статистикою

---

## 🔗 Посилання

| Сервіс | URL |
|--------|-----|
| **School App** | `exp://192.168.178.34:8082` |
| **Client App** | `exp://192.168.178.34:8081` |
| **Staff Panel** | http://localhost:5173 |
| **Admin Panel** | http://localhost:5174 |
| **Backend API** | http://localhost:3000/api |
| **Health Check** | http://localhost:3000/health |

---

## 📝 Наступні кроки

1. ✅ Всі сервіси запущені
2. ✅ Квести працюють
3. ✅ Кнопка "Get order" доступна
4. ✅ Кнопка "Активне завдання" додана
5. ⏳ Тестування на симуляторах
6. ⏳ Реєстрація нових користувачів
7. ⏳ Створення нових квестів через Admin Panel

---

**Останнє оновлення:** February 25, 2026
**Версія:** 4.0.0 - Full Working System
