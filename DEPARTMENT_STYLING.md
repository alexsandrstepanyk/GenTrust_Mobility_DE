# 🎨 DEPARTMENT STYLING GUIDE

**Версія:** 1.0  
**Дата:** 2026-03-07  
**Статус:** ✅ Dynamic Department Theming

---

## 📋 ОГЛЯД

Кожен департамент має **власний колір** та **стилізацію** для кращої візуальної ідентифікації.

---

## 🌈 КОЛЬОРИ ДЕПАРТАМЕНТІВ

| Департамент | Емодзі | Колір | Hex Code | Tailwind |
|-------------|--------|-------|----------|----------|
| **🛣️ Дороги** | 🛣️ | Blue | `#3B82F6` | `blue-500` |
| **💡 Освітлення** | 💡 | Amber | `#F59E0B` | `amber-500` |
| **🗑️ Сміття** | 🗑️ | Emerald | `#10B981` | `emerald-500` |
| **🌳 Парки** | 🌳 | Green | `#22C55E` | `green-500` |
| **🚰 Вода** | 🚰 | Cyan | `#06B6D4` | `cyan-500` |
| **🚌 Транспорт** | 🚌 | Pink | `#EC4899` | `pink-500` |
| **🌿 Екологія** | 🌿 | Lime | `#84CC16` | `lime-500` |
| **🎨 Вандалізм** | 🎨 | Purple | `#A855F7` | `purple-500` |

---

## 🎨 ЗАСТОСУВАННЯ КОЛЬОРУ

### **1. Header (Заголовок)**

```tsx
// Department Dashboard Layout
<h1 className="text-xl font-bold" style={{ color: deptColor }}>
  {deptEmoji} {deptName}
</h1>

// Dashboard Page
<h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
  {department.emoji} {department.name}
</h1>
```

**Приклад для Roads (🛣️):**
```
🛣️ Дороги  ← Синій колір (#3B82F6)
```

**Приклад для Lighting (💡):**
```
💡 Освітлення  ← Жовтий колір (#F59E0B)
```

---

### **2. Navigation (Активні елементи)**

```tsx
<Link
  to={item.href}
  className={cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 mb-1',
    isActive ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
  )}
  style={isActive ? { backgroundColor: deptColor } : {}}
>
  <Icon className="h-5 w-5" />
  {item.name}
</Link>
```

**Приклад для Waste (🗑️):**
```
Dashboard     ← Зелений фон (#10B981) + білий текст
Звіти
Користувачі
```

---

### **3. Charts (Графіки)**

```tsx
// Area Chart
<Area
  type="monotone"
  dataKey="count"
  stroke={primaryColor}
  fill="url(#colorReports)"
/>

<defs>
  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8}/>
    <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
  </linearGradient>
</defs>

// Bar Chart
<Bar dataKey="count" fill={primaryColor} radius={[8, 8, 0, 0]} />
```

**Приклад для Parks (🌳):**
- Графік зелений (#22C55E)
- Градієнт зелений

---

### **4. Badges (Бейджі)**

```tsx
<Badge style={{ backgroundColor: deptColor, color: 'white' }}>
  {department.name}
</Badge>
```

**Приклад для Transport (🚌):**
```
🚌 Транспорт  ← Рожевий фон (#EC4899) + білий текст
```

---

## 📊 ВІЗУАЛЬНІ ПРИКЛАДИ

### **Roads Department (🛣️ 5180)**

```
╔════════════════════════════════════════╗
║  🛣️ Дороги                  [Refresh]  ║ ← Синій заголовок
╠════════════════════════════════════════╣
║  [📊 Dashboard] ← Синій активний      ║
║  [📄 Звіти]                            ║
║  [👥 Користувачі]                      ║
║  [⚙️ Налаштування]                     ║
╠════════════════════════════════════════╣
║  📈 Графік (синій)                     ║
║  🥧 Pie Chart (стандартний)            ║
╚════════════════════════════════════════╝
```

### **Lighting Department (💡 5181)**

```
╔════════════════════════════════════════╗
║  💡 Освітлення              [Refresh]  ║ ← Жовтий заголовок
╠════════════════════════════════════════╣
║  [📊 Dashboard] ← Жовтий активний     ║
║  [📄 Звіти]                            ║
║  [👥 Користувачі]                      ║
║  [⚙️ Налаштування]                     ║
╠════════════════════════════════════════╣
║  📈 Графік (жовтий)                    ║
║  🥧 Pie Chart (стандартний)            ║
╚════════════════════════════════════════╝
```

### **Waste Department (🗑️ 5182)**

```
╔════════════════════════════════════════╗
║  🗑️ Сміття                  [Refresh]  ║ ← Зелений заголовок
╠════════════════════════════════════════╣
║  [📊 Dashboard] ← Зелений активний    ║
║  [📄 Звіти]                            ║
║  [👥 Користувачі]                      ║
║  [⚙️ Налаштування]                     ║
╠════════════════════════════════════════╣
║  📈 Графік (зелений)                   ║
║  🥧 Pie Chart (стандартний)            ║
╚════════════════════════════════════════╝
```

---

## 🔧 КОНФІГУРАЦІЯ

### **departments.config.json**

```json
{
  "departments": [
    {
      "id": "roads",
      "name": "Дороги",
      "emoji": "🛣️",
      "color": "#3B82F6",
      "port": 5180
    },
    {
      "id": "lighting",
      "name": "Освітлення",
      "emoji": "💡",
      "color": "#F59E0B",
      "port": 5181
    }
    // ... інші департаменти
  ]
}
```

### **Завантаження в App.tsx**

```tsx
useEffect(() => {
  const loadDepartment = async () => {
    const deptId = import.meta.env.VITE_DEPT_ID || 'roads';
    const response = await fetch('../../departments.config.json');
    const config = await response.json();
    const dept = config.departments.find((d) => d.id === deptId);
    
    if (dept) {
      setDepartment(dept);
    }
  };
  loadDepartment();
}, []);
```

---

## 📱 ПОРТИ ДЕПАРТАМЕНТІВ

| Департамент | Порт | URL | Колір |
|-------------|------|-----|-------|
| 🛣️ Roads | 5180 | http://localhost:5180 | Blue |
| 💡 Lighting | 5181 | http://localhost:5181 | Amber |
| 🗑️ Waste | 5182 | http://localhost:5182 | Emerald |
| 🌳 Parks | 5183 | http://localhost:5183 | Green |
| 🚰 Water | 5184 | http://localhost:5184 | Cyan |
| 🚌 Transport | 5185 | http://localhost:5185 | Pink |
| 🌿 Ecology | 5186 | http://localhost:5186 | Lime |
| 🎨 Vandalism | 5187 | http://localhost:5187 | Purple |

---

## 🎯 BEST PRACTICES

### **1. Використання кольору**

✅ **Правильно:**
```tsx
const primaryColor = department?.color || '#3B82F6';
<h1 style={{ color: primaryColor }}>{department.emoji} {department.name}</h1>
```

❌ **Неправильно:**
```tsx
<h1 className="text-primary">{department.name}</h1>
// Всі департаменти будуть одного кольору!
```

### **2. Градієнти**

✅ **Правильно:**
```tsx
<linearGradient id="colorReports">
  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8}/>
  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
</linearGradient>
```

❌ **Неправильно:**
```tsx
<linearGradient id="colorReports">
  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
  // Hardcoded blue for all departments!
</linearGradient>
```

### **3. Accessibility**

✅ **Правильно:**
- Контраст тексту ≥ 4.5:1
- Білий текст на кольоровому фоні
- Не покладатися тільки на колір

---

## 🧪 ТЕСТУВАННЯ

### **Перевірка кольорів:**

```bash
# Відкрийте кожен департамент
http://localhost:5180  # 🛣️ Roads - Синій
http://localhost:5181  # 💡 Lighting - Жовтий
http://localhost:5182  # 🗑️ Waste - Зелений
http://localhost:5183  # 🌳 Parks - Зелений
http://localhost:5184  # 🚰 Water - Блакитний
http://localhost:5185  # 🚌 Transport - Рожевий
http://localhost:5186  # 🌿 Ecology - Салатовий
http://localhost:5187  # 🎨 Vandalism - Фіолетовий
```

### **Очікуваний результат:**

Кожен департамент має **свій унікальний колір**:
- Заголовок кольоровий
- Активні елементи меню кольорові
- Графіки кольорові

---

## 📝 ФАЙЛИ

| Файл | Призначення |
|------|-------------|
| `departments.config.json` | Конфігурація кольорів |
| `department-dashboard/src/App.tsx` | Завантаження конфігурації |
| `department-dashboard/src/components/Layout.tsx` | Стилізація Layout |
| `department-dashboard/src/pages/Dashboard.tsx` | Стилізація Dashboard |

---

## 🎨 VISUAL IDENTITY

### **Чому різні кольори?**

1. **Швидка ідентифікація** - користувач миттєво розпізнає свій департамент
2. **Кращий UX** - легше навігувати між відкритими вкладками
3. **Брендинг** - кожен департамент має свою ідентичність
4. **Accessibility** - кольорова диференціація для кращої доступності

---

**Last Updated:** 2026-03-07  
**Version:** 1.0  
**Status:** ✅ Production Ready
