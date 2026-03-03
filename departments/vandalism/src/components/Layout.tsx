import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  Bell,
  LogOut,
  Menu
} from 'lucide-react';
import { useState } from 'react';
import { useSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Звіти', href: '/reports', icon: FileText },
  { name: 'Користувачі', href: '/users', icon: Users },
  { name: 'Налаштування', href: '/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { connected } = useSocket();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary">
            🏛️ City Hall
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 mb-1 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              connected ? 'bg-green-500' : 'bg-red-500'
            )} />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {connected ? 'Підключено' : 'Відключено'}
            </span>
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            Вихід
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        'transition-all duration-200',
        sidebarOpen ? 'md:pl-64' : 'pl-0'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-full items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  AD
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
