#!/bin/bash

################################################################################
#  GENTRUST MOBILITY - ГЕНЕРАТОР ДАШБОРДІВ ДЕПАРТАМЕНТІВ                       #
#                                                                              #
#  Використання: ./create_departments.sh                                       #
################################################################################

DEPARTMENTS_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE/departments"
TEMPLATE_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE/departments/roads"

# Департаменти для створення
declare -A DEPARTMENTS=(
    ["roads"]="Дороги:5180:🛣️:#F59E0B"
    ["lighting"]="Освітлення:5181:💡:#60A5FA"
    ["waste"]="Сміття:5182:🗑️:#10B981"
    ["parks"]="Парки:5183:🌳:#34D399"
    ["water"]="Вода:5184:🚰:#60A5FA"
    ["transport"]="Транспорт:5185:🚌:#F59E0B"
    ["ecology"]="Екологія:5186:🌿:#10B981"
    ["vandalism"]="Вандалізм:5187:🎨:#EC4899"
)

echo "╔════════════════════════════════════════════════════════╗"
echo "║   🏢 GENTRUST - Генерація дашбордів департаментів      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

for dept_id in "${!DEPARTMENTS[@]}"; do
    IFS=':' read -r name port emoji color <<< "${DEPARTMENTS[$dept_id]}"
    
    DEPT_DIR="$DEPARTMENTS_DIR/$dept_id"
    
    echo "📁 Створення: $emoji $name (порт $port)"
    
    # Створюємо директорію
    mkdir -p "$DEPT_DIR"
    
    # Копіюємо шаблон з roads
    if [ "$dept_id" != "roads" ]; then
        cp -r "$TEMPLATE_DIR"/* "$DEPT_DIR/" 2>/dev/null || true
    fi
    
    # Оновлюємо vite.config.ts
    cat > "$DEPT_DIR/vite.config.ts" << EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ФІКСОВАНИЙ ПОРТ для $name Dashboard
// Ніхто інший не має права займати цей порт!
const PORT = $port
const deptId = '$dept_id'
const deptName = '$name'
const deptEmoji = '$emoji'

console.log(\`Starting \${deptEmoji} \${deptName} Dashboard on FIXED port: \${PORT}\`)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __DEPT_ID__: JSON.stringify(deptId),
    __DEPT_PORT__: PORT,
    __DEPT_NAME__: JSON.stringify(deptName),
    __DEPT_EMOJI__: JSON.stringify(deptEmoji),
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
EOF

    # Оновлюємо package.json
    cat > "$DEPT_DIR/package.json" << EOF
{
  "name": "$dept_id-department-dashboard",
  "version": "1.0.0",
  "type": "module",
  "description": "$name Department Dashboard - GenTrust Mobility",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@types/leaflet": "^1.9.21",
    "axios": "^1.6.0",
    "clsx": "^2.1.1",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^5.0.0",
    "react-router-dom": "^6.22.0",
    "recharts": "^2.10.0",
    "socket.io-client": "^4.8.3",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
EOF

    # Оновлюємо App.tsx
    cat > "$DEPT_DIR/src/App.tsx" << EOF
// $name Department Dashboard
// ФІКСОВАНИЙ ПОРТ: $port
// Emoji: $emoji

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Layout from './components/Layout'

interface Department {
  id: string
  name: string
  emoji: string
  port: number
  color: string
}

import { createContext, useContext } from 'react'

export const DepartmentContext = createContext<Department | null>(null)

export const useDepartment = () => {
  const context = useContext(DepartmentContext)
  if (!context) {
    throw new Error('useDepartment must be used within DepartmentProvider')
  }
  return context
}

function App() {
  const [department, setDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Фіксовані значення для $name Department
    setDepartment({
      id: '$dept_id',
      name: '$name',
      emoji: '$emoji',
      port: $port,
      color: '$color',
    })
    setLoading(false)
  }, [])

  if (loading || !department) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '$color' }}></div>
      </div>
    )
  }

  return (
    <DepartmentContext.Provider value={department}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DepartmentContext.Provider>
  )
}

export default App
EOF

    # Встановлюємо dependencies
    echo "   📦 Встановлення dependencies..."
    cd "$DEPT_DIR" && npm install --silent
    
    echo "   ✅ $name Dashboard готовий на порті $port"
    echo ""
done

echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✅ ВСІ ДАШБОРДИ ДЕПАРТАМЕНТІВ СТВОРЕНО!              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Доступні дашборди:"
echo "   🛣️  Дороги:        http://localhost:5180"
echo "   💡  Освітлення:    http://localhost:5181"
echo "   🗑️  Сміття:        http://localhost:5182"
echo "   🌳  Парки:         http://localhost:5183"
echo "   🚰  Вода:          http://localhost:5184"
echo "   🚌  Транспорт:     http://localhost:5185"
echo "   🌿  Екологія:      http://localhost:5186"
echo "   🎨  Вандалізм:     http://localhost:5187"
echo ""
echo "🚀 Запуск:"
echo "   cd departments/{dept-name} && npm run dev"
echo ""
