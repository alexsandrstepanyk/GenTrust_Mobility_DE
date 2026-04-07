# 🏢 DYNAMIC DEPARTMENT MANAGEMENT SYSTEM

## 📅 Дата створення: 2026-03-30
## 🏷️ Версія: v6.1.0 - Dynamic Departments

---

## 🎯 ОГЛЯД

Система дозволяє **City Hall** створювати нові департаменти динамічно через веб-інтерфейс, без необхідності ручного копіювання файлів та зміни коду.

---

## 🔧 ЯК ЦЕ ПРАЦЮЄ

### **1. Створення департаменту (City-Hall Dashboard)**

```
City-Hall → Департаменти → "Створити департамент" → Заповнити форму → ✅
```

### **2. Автоматичні процеси**

Backend автоматично:
1. ✅ Створює запис в БД (`Department` model)
2. ✅ Генерує папку департаменту (`departments/{slug}`)
3. ✅ Копіює шаблон з існуючого департаменту
4. ✅ Оновлює конфігураційні файли
5. ✅ Реєструє в системі

---

## 📋 ФОРМА СТВОРЕННЯ ДЕПАРТАМЕНТУ

### **Основна інформація:**
- 🏷️ **Назва (укр)** - обов'язково
- 🏷️ **Назва (англ)** - обов'язково
- 🎭 **Іконка (Emoji)** - вибір з 16 пресетів
- 🎨 **Колір** - вибір з палітри або custom hex

### **Опис діяльності:**
- 📄 **Детальний опис** - чим займається департамент
- 📋 **Обов'язки** - список напрямків роботи
- 📍 **Регіони** - де діє департамент

### **Контакти:**
- 📧 **Email**
- 📞 **Телефон**
- 💰 **Бюджет** (опціонально)

### **Налаштування:**
- ⚙️ **Авто-затвердження звітів** (так/ні)
- ⚙️ **Вимагати фото для звітів** (так/ні)

---

## 🔨 ТЕХНІЧНА РЕАЛІЗАЦІЯ

### **Backend API**

#### **POST `/api/departments-manager/create`**

Створення нового департаменту.

**Request Body:**
```json
{
  "nameUa": "Департамент доріг",
  "nameEn": "Department of Roads",
  "color": "#3B82F6",
  "icon": "🛣️",
  "description": "Відповідає за стан доріг...",
  "responsibilities": ["Ремонт доріг", "Ями", "Розмітка"],
  "regions": ["Центр", "Зелена зона"],
  "contactEmail": "roads@example.com",
  "contactPhone": "+380123456789",
  "budget": 1000000,
  "autoApproveReports": false,
  "requiresPhotoForReports": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Департамент \"Департамент доріг\" успішно створено!",
  "department": {
    "id": "dept_1234567890_abc",
    "slug": "departament-dorig",
    "nameUa": "Департамент доріг",
    "nameEn": "Department of Roads",
    "color": "#3B82F6",
    "icon": "🛣️",
    "folder": "/departments/departament-dorig",
    "nextStep": "Запустіть: cd departments/departament-dorig && npm install && npm run dev"
  }
}
```

### **Prisma Schema**

```prisma
model Department {
  id              String   @id @default(uuid())
  slug            String   @unique
  
  nameUa          String
  nameEn          String
  color           String   @default("#3B82F6")
  icon            String   @default("🏢")
  
  description     String
  responsibilities String?
  regions         String?
  
  contactEmail    String?
  contactPhone    String?
  budget          Float    @default(0)
  
  autoApproveReports Boolean @default(false)
  requiresPhotoForReports Boolean @default(true)
  
  status          String   @default("ACTIVE")
  
  users           User[]
  reports         Report[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 📁 СТРУКТУРА ФАЙЛІВ

```
GenTrust_Mobility_DE/
├── src/
│   └── api/
│       ├── routes/
│       │   └── departments-manager.ts  ← ✅ НОВИЙ
│       └── server.ts                   ← ✅ ОНОВЛЕНО
├── prisma/
│   └── schema.prisma                   ← ✅ ОНОВЛЕНО (Department model)
├── city-hall-dashboard/
│   └── src/
│       └── screens/
│           └── CreateDepartmentScreen.tsx  ← ✅ НОВИЙ
└── departments/
    ├── roads/                    ← Шаблон для копіювання
    ├── lighting/
    ├── ...
    └── {new-department}/         ← ✅ СТВОРЮЄТЬСЯ АВТОМАТИЧНО
        ├── src/
        ├── public/
        ├── package.json
        └── vite.config.ts
```

---

## 🚀 ІНСТРУКЦІЯ З ВИКОРИСТАННЯ

### **Для City Hall:**

1. **Увійдіть в City-Hall Dashboard**
   ```
   http://localhost:5173
   ```

2. **Перейдіть в розділ "Департаменти"**

3. **Натисніть "Створити департамент"**

4. **Заповніть форму:**
   - Вкажіть назву українською та англійською
   - Оберіть іконку та колір
   - Опишіть діяльність
   - Додайте обов'язки
   - Вкажіть регіони
   - Заповніть контакти

5. **Натисніть "Створити департамент"**

6. **Запустіть департамент:**
   ```bash
   cd departments/{slug}
   npm install
   npm run dev
   ```

### **Для розробників:**

1. **Додайте маршрут в App.tsx:**
   ```tsx
   import CreateDepartmentScreen from './screens/CreateDepartmentScreen';
   
   <Route path="/departments/create" element={<CreateDepartmentScreen />} />
   ```

2. **Оновіть Prisma:**
   ```bash
   npx prisma migrate dev --name add_department_model
   npx prisma generate
   ```

3. **Перезапустіть Backend:**
   ```bash
   npm run dev
   ```

---

## 🔐 БЕЗПЕКА

- ✅ Тільки **CITY_HALL** роль може створювати департаменти
- ✅ Перевірка унікальності назви
- ✅ Валідація всіх полів
- ✅ Автоматична генерація slug
- ✅ Обробка помилок

---

## 📊 ПРИКЛАДИ ВИКОРИСТАННЯ

### **Приклад 1: Створення департаменту енергетики**

```json
{
  "nameUa": "Департамент енергетики",
  "nameEn": "Department of Energy",
  "color": "#F59E0B",
  "icon": "⚡",
  "description": "Відповідає за електропостачання міста",
  "responsibilities": [
    "Ремонт ліхтарів",
    "Електромережі",
    "Аварійні відключення"
  ],
  "regions": ["Все місто"],
  "contactEmail": "energy@city.gov",
  "contactPhone": "+380123456789",
  "budget": 5000000,
  "autoApproveReports": false,
  "requiresPhotoForReports": true
}
```

### **Приклад 2: Створення департаменту надзвичайних ситуацій**

```json
{
  "nameUa": "Департамент НС",
  "nameEn": "Emergency Department",
  "color": "#EF4444",
  "icon": "🔥",
  "description": "Ліквідація надзвичайних ситуацій",
  "responsibilities": [
    "Пожежі",
    "Повені",
    "Евакуація"
  ],
  "regions": ["Все місто"],
  "contactEmail": "emergency@city.gov",
  "contactPhone": "101",
  "budget": 10000000,
  "autoApproveReports": true,
  "requiresPhotoForReports": false
}
```

---

## 🎯 МОЖЛИВОСТІ

### **Переваги:**
- ✅ **Швидке створення** - 2-3 хвилини на департамент
- ✅ **Без коду** - не потрібно знати програмування
- ✅ **Автоматизація** - всі файли створюються самі
- ✅ **Гнучкість** - будь-які налаштування
- ✅ **Масштабованість** - необмежена кількість департаментів

### **Можливі розширення:**
- 📌 Додавання співробітників до департаменту
- 📌 Статистика по департаменту
- 📌 Інтеграція з Telegram ботом
- 📌 Експорт/Імпорт департаментів
- 📌 Шаблони департаментів

---

## 🐛 ВИРІШЕННЯ ПРОБЛЕМ

### **Помилка: "Департамент з такою назвою вже існує"**
- Змініть назву на унікальну
- Або видаліть існуючий департамент

### **Помилка: "Тільки City Hall може створювати департаменти"**
- Увійдіть під обліковим записом City Hall
- Перевірте роль користувача

### **Помилка: "Не вдалося створити папку"**
- Перевірте права доступу до папки `departments/`
- Запустіть від імені адміністратора

---

## 📝 ІСТОРІЯ ЗМІН

### **v6.1.0 (2026-03-30)**
- ✅ Додано модель `Department` в Prisma
- ✅ Створено API `/departments-manager/*`
- ✅ Додано UI для створення департаментів
- ✅ Автоматична генерація файлів
- ✅ Зв'язок з Report model

---

## 🔗 ПОВ'ЯЗАНІ ДОКУМЕНТИ

- `src/api/routes/departments-manager.ts` - Backend API
- `prisma/schema.prisma` - Database Schema
- `city-hall-dashboard/src/screens/CreateDepartmentScreen.tsx` - UI Component

---

**🎯 ВСЕ ПРАЦЮЄ! МОЖНА СТВОРЮВАТИ ДЕПАРТАМЕНТИ!** 🚀
