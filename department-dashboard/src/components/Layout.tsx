import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  Building2,
  Bell,
  LogOut,
  Menu
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSocket, useSocketEvent } from '@/lib/socket';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Звіти', href: '/reports', icon: FileText },
  { name: 'Департаменти', href: '/departments', icon: Building2 },
  { name: 'Користувачі', href: '/users', icon: Users },
  { name: 'Налаштування', href: '/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { socket, connected } = useSocket();

  // Слухаємо нові повідомлення через Socket.IO
  useSocketEvent(socket, 'report:new', (data) => {
    console.log('📬 Нове повідомлення:', data);
    setNotifications(prev => [data, ...prev]);
    setNotificationCount(prev => prev + 1);
    
    // Звуковий сигнал (опціонально)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj==');
      audio.play().catch(() => {});
    } catch (e) {}
  });

  // Слухаємо видалення сповіщень
  useSocketEvent(socket, 'notification:clear', () => {
    setNotificationCount(0);
    setNotifications([]);
  });

  // Закриваємо dropdown при клику вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };
    
    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotifications]);

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
            const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
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
              {/* Notification Bell */}
              <div className="relative group notification-dropdown">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {/* Notification Badge */}
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Сповіщення</h3>
                      {notificationCount > 0 && (
                        <button
                          onClick={() => {
                            setNotificationCount(0);
                            setNotifications([]);
                            socket?.emit('notification:mark-read', { all: true });
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          Позначити як прочитано
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Немає нових сповіщень</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {notifications.map((notification, idx) => (
                            <div
                              key={idx}
                              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                                    {notification.category || 'Новий звіт'} 
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {notification.description || notification.location || 'Нова інфраструктурна проблема'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                    {new Date(notification.timestamp || Date.now()).toLocaleString('uk-UA')}
                                  </p>
                                </div>
                                <div className="ml-2 flex-shrink-0">
                                  <span className={cn(
                                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                    notification.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    notification.severity === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                    notification.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  )}>
                                    {notification.severity || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
