import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Bell, Shield, Database, Webhook } from 'lucide-react';

function Settings() {
  const { t, i18n } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Налаштування
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Конфігурація системи City Hall Dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{t("notifications")}</CardTitle>
                <CardDescription>{t("notifications_desc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">{t("new_reports")}</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">{t("user_registration")}</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">{t("email_notifications")}</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{t("security")}</CardTitle>
                <CardDescription>{t("access_settings")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("session_time")}</label>
                <input 
                  type="number" 
                  defaultValue={60}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <Button variant="outline" className="w-full">
                Змінити пароль
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{t("database")}</CardTitle>
                <CardDescription>{t("sync_backup")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                Створити backup
              </Button>
              <Button variant="outline" className="w-full">
                Синхронізувати з Telegram Bot
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <Webhook className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{t("integrations")}</CardTitle>
                <CardDescription>{t("connect_services")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <div className="font-medium text-sm">Telegram Bot</div>
                  <div className="text-xs text-gray-600">{t("connected")}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <div className="font-medium text-sm">Mobile App</div>
                  <div className="text-xs text-gray-600">{t("connected")}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <div className="font-medium text-sm">Staff Panel</div>
                  <div className="text-xs text-gray-600">{t("connected")}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Settings;
