// ⚠️ 2.3.2026 - ПЕРЕПИСАНО (СТАРИЙ КОД ВИДАЛЕН):
// БУЛО: Простий компонент що тільки показував інформацію департаменту
// ПРИЧИНА: Потрібна была повна функціональність як у City-Hall Dashboard
// ЗМІНЕНО: Переписано на повну структуру з роутерами, сторінками, компонентами
// ЧИМ КРАЩЕ: Департамент дашборди тепер мають:
//   - Однаковий стиль та layout як City-Hall
//   - Фільтрацію завдань/звітів за своїм департаментом
//   - Аналізацію статистики по департаменту
//   - Реал-тайм оновлення через Socket.IO
//   - Управління звітами в своєму департаменті

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

// Контекст для пропагування інформації про департамент
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
    const loadDepartment = async () => {
      try {
        // Читаємо VITE_DEPT_ID з env (встановлюється при запуску)
        const deptId = import.meta.env.VITE_DEPT_ID || 'roads'
        
        // Завантажуємо конфіг департаментів
        const response = await fetch('../../departments.config.json')
        const config = await response.json()
        const dept = config.departments.find((d: Department) => d.id === deptId)
        
        if (dept) {
          setDepartment(dept)
        } else {
          // Fallback
          setDepartment({
            id: deptId,
            name: 'Департамент',
            emoji: '🏢',
            port: 5176,
            color: '#3B82F6',
          })
        }
      } catch (error) {
        console.error('Error loading department config:', error)
        setDepartment({
          id: 'roads',
          name: 'Дороги',
          emoji: '🛣️',
          port: 5176,
          color: '#3B82F6',
        })
      } finally {
        setLoading(false)
      }
    }

    loadDepartment()
  }, [])

  if (loading || !department) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
