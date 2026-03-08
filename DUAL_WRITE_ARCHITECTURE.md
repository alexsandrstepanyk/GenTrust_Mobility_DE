# 🔄 DUAL-WRITE ARCHITECTURE (ПОДВІЙНИЙ ЗАПИС)

**Версія:** v5.1.0  
**Дата:** 2026-03-06  
**Статус:** ✅ Implemented

---

## 📋 АРХІТЕКТУРА ПОДВІЙНОГО ЗАПИСУ

### **Принцип роботи:**

```
ШКОЛЯР надсилає фото сміття
         │
         ▼
┌─────────────────────────┐
│   BACKEND API (3000)    │
│   + AI Gemini аналіз    │
│   Визначає: "waste"     │
└──────────┬──────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐   ┌──────────────┐
│ ГОЛОВНА │   │ БД           │
│ БД      │   │ ДЕПАРТАМЕНТУ │
│         │   │              │
│ Report  │   │ Department   │
│ (ВСІ)   │   │ Report       │
│         │   │ (тільки      │
│ City-   │   │ waste)       │
│ Hall    │   │              │
│ бачить  │   │ Waste        │
│ ВСІ     │   │ Dashboard    │
│ звіти   │   │ бачить       │
│         │   │ тільки       │
│         │   │ waste        │
└─────────┘   └──────────────┘
```

---

## ✅ ПЕРЕВАГИ

### **1. City-Hall бачить ВСІ звіти**
- ✅ Загальна статистика по всіх департаментах
- ✅ Моніторинг продуктивності кожного департаменту
- ✅ Аналітика та звіти для мера

### **2. Департаменти працюють незалежно**
- ✅ Кожен бачить тільки свої звіти
- ✅ Ізоляція на рівні БД
- ✅ Якщо одна БД впала → інші працюють

### **3. Стійкість до помилок**
```
Сценарій: БД Waste "впала"

✅ Головна БД працює → City-Hall бачить всі звіти
⚠️ Waste Dashboard не працює → але інші 7 працюють
✅ Roads, Parks, Lighting → працюють нормально
```

---

## 🔧 ЯК ЦЕ ПРАЦЮЄ (Код)

### **1. Створення звіту (Dual-Write)**

```typescript
// src/api/routes/reports.ts

router.post('/', authenticateToken, async (req, res) => {
  const { category, photoBase64, latitude, longitude } = req.body;
  
  // Визначаємо департамент
  const departmentId = departmentMap[category] || 'roads';
  
  // 1️⃣ ЗАПИС В ГОЛОВНУ БД (для City-Hall)
  const report = await prisma.report.create({
    data: {
      authorId: userId,
      photoId: `data:image/jpeg;base64,${photoBase64}`,
      category,
      latitude,
      longitude,
      forwardedTo: departmentId,
      status: 'PENDING',
    }
  });
  
  // 2️⃣ ЗАПИС В БД ДЕПАРТАМЕНТУ (для обробки)
  try {
    const deptPrisma = getDepartmentPrisma(departmentId);
    
    await deptPrisma.departmentReport.create({
      data: {
        userId,
        photoId: `data:image/jpeg;base64,${photoBase64}`,
        latitude,
        longitude,
        aiCategory: category,
        status: 'PENDING',
      },
    });
    
    console.log(`✅ Report ${report.id} duplicated to ${departmentId} DB`);
  } catch (deptError) {
    // Не блокуємо основний потік
    console.error(`⚠️ Failed to write to department DB`);
  }
  
  res.json({ success: true, report, department: departmentId });
});
```

---

### **2. Оновлення статусу (Синхронізація)**

```typescript
// PATCH /api/reports/:id/status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // 1️⃣ Оновлюємо в ГОЛОВНІЙ БД
  const mainReport = await prisma.report.update({
    where: { id },
    data: { status, updatedAt: new Date() }
  });
  
  // 2️⃣ Оновлюємо в БД ДЕПАРТАМЕНТУ
  const departmentId = mainReport.forwardedTo;
  if (departmentId) {
    try {
      const deptPrisma = getDepartmentPrisma(departmentId);
      
      await deptPrisma.departmentReport.updateMany({
        where: { /* matching criteria */ },
        data: { status, updatedAt: new Date() }
      });
      
      console.log(`✅ Report ${id} status synced to ${departmentId} DB`);
    } catch (deptError) {
      console.error(`⚠️ Failed to sync status`);
    }
  }
  
  res.json({ success: true, report: mainReport });
});
```

---

## 📊 СИНХРОНІЗАЦІЯ ДАНИХ

### **Автоматична синхронізація:**

| Подія | Головна БД | БД Департаменту |
|-------|------------|-----------------|
| **Створення звіту** | ✅ Запис | ✅ Запис |
| **Approve** | ✅ Update | ✅ Update |
| **Reject** | ✅ Update | ✅ Update |
| **Зміна статусу** | ✅ Update | ✅ Update |

### **Якщо департамент БД недоступна:**

```typescript
try {
  await deptPrisma.departmentReport.create({...});
  console.log('✅ Duplicated to department DB');
} catch (deptError) {
  console.error('⚠️ Department DB unavailable');
  // Звіт все одно створено в головній БД!
  // City-Hall бачить звіт
  // Спробуємо синхронізувати пізніше
}
```

---

## 🎯 CITY-HALL DASHBOARD (Статистика)

### **API Endpoints:**

```bash
# Отримати ВСІ звіти (для City-Hall)
GET /api/reports

# Отримати статистику по всіх департаментах
GET /api/stats/dashboard

# Отримати звіти конкретного департаменту
GET /api/reports?department=waste
```

### **Dashboard показує:**

```
┌─────────────────────────────────────────┐
│  🏛️ City-Hall Dashboard                 │
│                                         │
│  📊 ЗАГАЛЬНА СТАТИСТИКА:                │
│  • Всього звітів: 150                   │
│  • Очікують: 25                         │
│  • Схвалено: 100                        │
│  • Виконано: 25                         │
│                                         │
│  📊 ПО ДЕПАРТАМЕНТАХ:                   │
│  • 🛣️ Roads: 20 (5 pending)             │
│  • 💡 Lighting: 15 (3 pending)          │
│  • 🗑️ Waste: 30 (8 pending)  ←           │
│  • 🌳 Parks: 25 (4 pending)             │
│  • 🚰 Water: 20 (2 pending)             │
│  • 🚌 Transport: 15 (1 pending)         │
│  • 🌿 Ecology: 15 (2 pending)           │
│  • 🎨 Vandalism: 10 (0 pending)         │
└─────────────────────────────────────────┘
```

---

## 🗑️ WASTE DEPARTMENT (Приклад)

### **Сценарій: Школяр бачить сміття**

```
1️⃣ Школяр надсилає фото
   └─> Mobile App → Backend API

2️⃣ Backend обробляє (ПОДВІЙНИЙ ЗАПИС)
   └─> Головна БД: Report { category: 'waste', ... }
   └─> Waste DB: DepartmentReport { ... }

3️⃣ City-Hall бачить звіт
   └─> Статистика оновлюється: +1 waste report

4️⃣ Waste Dashboard бачить звіт
   └─> Тільки Waste бачить цей звіт
   └─> Модератор натискає "Approve"

5️⃣ Статус синхронізується
   └─> Головна БД: status = APPROVED
   └─> Waste DB: status = APPROVED

6️⃣ City-Hall бачить оновлення
   └─> Waste: +1 approved
```

---

## 🛡️ СТІЙКІСТЬ ДО ПОМИЛОК

### **Таблиця стійкості:**

| Компонент впав | City-Hall | Waste | Roads | Parks |
|----------------|-----------|-------|-------|-------|
| **Waste DB**   | ✅ Бачить | ❌ Ні | ✅ | ✅ |
| **Roads DB**   | ✅ Бачить | ✅ | ❌ Ні | ✅ |
| **Головна БД** | ❌ Ні | ✅ Бачить | ✅ | ✅ |
| **Backend**    | ❌ Ні | ❌ Ні | ❌ Ні | ❌ Ні |

**Висновок:** Навіть якщо БД департаменту впала, City-Hall все одно бачить всі звіти!

---

## 📝 МОНІТОРИНГ

### **Перевірка синхронізації:**

```bash
# Перевірити головну БД
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Report WHERE forwardedTo='waste';"

# Перевірити Waste DB
sqlite3 databases/waste_dept.db "SELECT COUNT(*) FROM DepartmentReport;"

# Повинно бути однаково!
```

### **API для перевірки:**

```bash
# Статистика City-Hall
curl http://localhost:3000/api/stats/dashboard

# Статистика Waste
curl http://localhost:3000/api/departments/waste/stats

# Порівняйте цифри!
```

---

## ⚠️ ОБМЕЖЕННЯ

### **Відомі проблеми:**

1. **Якщо департамент БД недоступна:**
   - ✅ Звіт створено в головній БД
   - ⚠️ Департамент не бачить звіт
   - ✅ City-Hall бачить звіт
   - 🔧 Треба вручну синхронізувати

2. **Різниця в часах:**
   - Може бути різниця в кілька секунд
   - Нормально для асинхронного запису

3. **Дублікати:**
   - Теоретично можливі при retry
   - Практично не відбувається через unique constraints

---

## 🔧 ВИРІШЕННЯ ПРОБЛЕМ

### **Проблема: Різні цифри в City-Hall і Waste**

```bash
# City-Hall показує 30 waste reports
# Waste Dashboard показує 28

# Рішення: Перевірити логи
tail -f /tmp/BackendAPI.log | grep "duplicated to"

# Перевірити помилки
tail -f /tmp/BackendAPI.log | grep "Failed to write"
```

### **Проблема: Waste DB не записує**

```bash
# Перевірити наявність БД
ls -lh databases/waste_dept.db

# Перевірити підключення
sqlite3 databases/waste_dept.db ".tables"

# Якщо помилка - перестворити БД
bash scripts/init_department_dbs.sh
```

---

## ✅ ВИСНОВКИ

### **Реалізовано:**

- ✅ Подвійний запис (Headline + Department)
- ✅ City-Hall бачить ВСІ звіти
- ✅ Департаменти бачать тільки свої
- ✅ Синхронізація статусів
- ✅ Стійкість до помилок БД

### **Переваги:**

- ✅ City-Hall має повну статистику
- ✅ Ізоляція департаментів
- ✅ Стійкість до падіння БД
- ✅ Продуктивність (менше таблиць в кожній БД)

---

**Generated:** 2026-03-06  
**Version:** v5.1.0  
**Status:** ✅ Production Ready
