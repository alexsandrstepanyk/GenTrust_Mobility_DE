# 🎨 DESIGN SYSTEM - GenTrust Mobility

**Версія:** 1.0  
**Дата:** 2026-03-06  
**Статус:** ✅ Unified Design System

---

## 📋 ОГЛЯД

Всі дашборди GenTrust Mobility використовують **єдину дизайн-систему** для забезпечення консистентності користувальницького досвіду.

---

## 🏗️ АРХІТЕКТУРА

### **Спільні компоненти:**

```
city-hall-dashboard/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Card.tsx          ✅ Спільний
│   │   │   ├── Badge.tsx         ✅ Спільний
│   │   │   ├── Button.tsx        ✅ Спільний
│   │   │   └── ...
│   │   └── Layout.tsx            ✅ Спільний
│   └── pages/
│       ├── Dashboard.tsx         ✅ Спільний стиль
│       ├── Reports.tsx           ✅ Спільний стиль
│       └── Settings.tsx          ✅ Спільний стиль

department-dashboard/
├── src/
│   ├── components/
│   │   ├── ui/                   ✅ Ті ж самі компоненти
│   │   └── Layout.tsx            ✅ Адаптований Layout
│   └── pages/
│       ├── Dashboard.tsx         ✅ Той самий стиль
│       ├── Reports.tsx           ✅ Той самий стиль
│       └── Settings.tsx          ✅ Той самий стиль
```

---

## 🎨 DESIGN TOKENS

### **Кольори:**

```typescript
// Primary Colors
primary: '#3B82F6'        // Blue-500
primary-foreground: '#FFFFFF'

// Semantic Colors
success: '#10B981'        // Emerald-500
warning: '#F59E0B'        // Amber-500
danger: '#EF4444'         // Red-500
info: '#3B82F6'           // Blue-500

// Background Colors
bg-primary: '#FFFFFF'     // White
bg-secondary: '#F9FAFB'   // Gray-50
bg-tertiary: '#F3F4F6'    // Gray-100

// Dark Mode
dark-bg-primary: '#1F2937'   // Gray-800
dark-bg-secondary: '#111827' // Gray-900
```

### **Типографія:**

```typescript
// Font Sizes
text-xs: '0.75rem'      // 12px
text-sm: '0.875rem'     // 14px
text-base: '1rem'       // 16px
text-lg: '1.125rem'     // 18px
text-xl: '1.25rem'      // 20px
text-2xl: '1.5rem'      // 24px
text-3xl: '1.875rem'    // 30px

// Font Weights
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

### **Відступи:**

```typescript
// Spacing Scale
spacing-1: '0.25rem'   // 4px
spacing-2: '0.5rem'    // 8px
spacing-3: '0.75rem'   // 12px
spacing-4: '1rem'      // 16px
spacing-6: '1.5rem'    // 24px
spacing-8: '2rem'      // 32px
```

---

## 🧩 КОМПОНЕНТИ

### **1. Card Component**

**Використання:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Опис</CardDescription>
  </CardHeader>
  <CardContent>
    Контент картки
  </CardContent>
</Card>
```

**Стилі:**
- Background: `bg-white dark:bg-gray-800`
- Border: `border border-gray-200 dark:border-gray-700`
- Border Radius: `rounded-lg`
- Shadow: `shadow-sm`

---

### **2. Badge Component**

**Варіанти:**
```tsx
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Danger</Badge>
```

**Кольори:**
- Default: `bg-blue-100 text-blue-800`
- Success: `bg-green-100 text-green-800`
- Warning: `bg-yellow-100 text-yellow-800`
- Destructive: `bg-red-100 text-red-800`

---

### **3. Button Component**

**Варіанти:**
```tsx
<Button>Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Danger</Button>
```

**Стилі:**
- Primary: `bg-primary text-primary-foreground hover:bg-primary/90`
- Outline: `border border-input hover:bg-accent`
- Ghost: `hover:bg-accent hover:text-accent-foreground`
- Destructive: `bg-destructive text-destructive-foreground`

---

## 📊 CHARTS (Графіки)

### **Area Chart (Reports Over Time)**

```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey="date" stroke="#6b7280" />
    <YAxis stroke="#6b7280" />
    <Tooltip />
    <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorReports)" />
  </AreaChart>
</ResponsiveContainer>
```

### **Bar Chart (Department Comparison)**

```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="total" fill="#3b82f6" name="Всього" />
    <Bar dataKey="pending" fill="#f59e0b" name="Очікують" />
    <Bar dataKey="completed" fill="#10b981" name="Виконано" />
  </BarChart>
</ResponsiveContainer>
```

### **Pie Chart (Status Distribution)**

```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, value }) => `${name}: ${value}`}
      outerRadius={100}
      fill="#8884d8"
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

---

## 🎯 LAYOUT STRUCTURE

### **Sidebar Navigation**

```tsx
<aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
  {/* Header */}
  <div className="flex h-16 items-center justify-between px-6 border-b">
    <h1 className="text-xl font-bold text-primary">
      🏛️ City Hall / 🏢 Department
    </h1>
  </div>
  
  {/* Navigation */}
  <nav className="mt-6 px-3">
    <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2">
      <LayoutDashboard className="h-5 w-5" />
      Dashboard
    </Link>
    {/* ... other links */}
  </nav>
</aside>
```

### **Header**

```tsx
<header className="sticky top-0 z-40 h-16 bg-white dark:bg-gray-800 border-b">
  <div className="flex h-full items-center justify-between px-6">
    {/* Menu Toggle */}
    <button onClick={() => setSidebarOpen(!sidebarOpen)}>
      <Menu className="h-6 w-6" />
    </button>
    
    {/* Right Side Actions */}
    <div className="flex items-center gap-4">
      {/* Notifications, Profile, etc. */}
    </div>
  </div>
</header>
```

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints:**

```typescript
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large
```

### **Grid Layouts:**

```tsx
// Stats Cards
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  {/* 4 cards in a row on large screens */}
</div>

// Charts
<div className="grid gap-6 md:grid-cols-2">
  {/* 2 charts side by side on medium+ screens */}
</div>

// Department Cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 4 department cards per row on large screens */}
</div>
```

---

## 🌗 DARK MODE

### **Implementation:**

```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div className="bg-white dark:bg-gray-800">
    <h1 className="text-gray-900 dark:text-white">Title</h1>
    <p className="text-gray-600 dark:text-gray-400">Description</p>
  </div>
</div>
```

### **Color Mappings:**

| Light Mode | Dark Mode |
|------------|-----------|
| `bg-white` | `bg-gray-800` |
| `bg-gray-50` | `bg-gray-900` |
| `text-gray-900` | `text-white` |
| `text-gray-600` | `text-gray-400` |
| `border-gray-200` | `border-gray-700` |

---

## ✅ CONSISTENCY CHECKLIST

### **City-Hall Dashboard:**
- ✅ Layout з sidebar навігацією
- ✅ Header з menu toggle
- ✅ Stats cards (4 картки)
- ✅ Area chart (Reports over time)
- ✅ Pie chart (Status distribution)
- ✅ Pending reports section
- ✅ Dark mode support

### **Department Dashboards (8):**
- ✅ Layout з sidebar навігацією
- ✅ Header з menu toggle + назва департаменту
- ✅ Stats cards (4 картки)
- ✅ Area chart (Reports over time)
- ✅ Pie chart (Status distribution)
- ✅ Pending reports section (тільки свій департамент)
- ✅ Dark mode support
- ✅ Кнопка Refresh

### **Admin Panel:**
- ✅ Layout з sidebar навігацією
- ✅ Header з menu toggle
- ✅ Consistent color scheme
- ✅ Dark mode support

---

## 🎨 BRAND ELEMENTS

### **Емодзі для департаментів:**

```typescript
const departmentEmojis = {
  roads: '🛣️',
  lighting: '💡',
  waste: '🗑️',
  parks: '🌳',
  water: '🚰',
  transport: '🚌',
  ecology: '🌿',
  vandalism: '🎨',
};
```

### **Кольори департаментів:**

```typescript
const departmentColors = [
  '#3b82f6', // Roads - Blue
  '#10b981', // Lighting - Emerald
  '#f59e0b', // Waste - Amber
  '#8b5cf6', // Parks - Purple
  '#06b6d4', // Water - Cyan
  '#ec4899', // Transport - Pink
  '#22c55e', // Ecology - Green
  '#f97316', // Vandalism - Orange
];
```

---

## 📝 BEST PRACTICES

### **1. Компоненти:**
- ✅ Використовуй спільні UI компоненти
- ✅ Дотримуйся дизайн токенів
- ✅ Підтримуй dark mode

### **2. Відступи:**
- ✅ Використовуй spacing scale (1-8)
- ✅ Consistent padding/margin
- ✅ Grid layouts для карток

### **3. Кольори:**
- ✅ Використовуй семантичні кольори
- ✅ Contrast ratio ≥ 4.5:1
- ✅ Dark mode варіанти

### **4. Графіки:**
- ✅ Висота 300px для всіх chart
- ✅ Consistent colors
- ✅ Responsive containers

---

## 🔧 UTILITIES

### **CN (ClassNames):**

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  className
)} />
```

### **Responsive Helpers:**

```typescript
hidden md:block  // Hide on mobile, show on tablet+
md:grid-cols-2   // 2 columns on tablet+
lg:grid-cols-4   // 4 columns on desktop
```

---

## 📞 SUPPORT

**Документація:**
- `city-hall-dashboard/src/components/ui/` - UI компоненти
- `department-dashboard/src/components/ui/` - UI компоненти
- `tailwind.config.js` - Tailwind конфігурація

**Контакти:**
- Design Team: design@gentrust.mobility
- Dev Team: dev@gentrust.mobility

---

**Last Updated:** 2026-03-06  
**Version:** 1.0  
**Status:** ✅ Production Ready
