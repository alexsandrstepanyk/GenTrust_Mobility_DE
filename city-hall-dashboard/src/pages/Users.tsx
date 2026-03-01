import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usersAPI } from '@/lib/api';
import { useSocket, useSocketEvent } from '@/lib/socket';
import { CheckCircle, XCircle, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'STUDENT' | 'PARENT' | 'STAFF' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastActive?: string;
  stats?: {
    reportsSubmitted: number;
    questsCompleted: number;
  };
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useSocketEvent(socket, 'user:registered', (user: User) => {
    setUsers(prev => [user, ...prev]);
  });

  const handleApprove = async (id: string) => {
    try {
      await usersAPI.approve(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await usersAPI.reject(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to reject user:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: any = {
      'STUDENT': 'default',
      'PARENT': 'secondary',
      'STAFF': 'success',
      'ADMIN': 'destructive'
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'PENDING': 'warning',
      'ACTIVE': 'success',
      'SUSPENDED': 'destructive'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Користувачі
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Управління користувачами системи
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'PENDING').length}
            </div>
            <p className="text-sm text-gray-600">Очікують підтвердження</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'ACTIVE').length}
            </div>
            <p className="text-sm text-gray-600">Активні</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'STUDENT').length}
            </div>
            <p className="text-sm text-gray-600">Учні</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'PARENT').length}
            </div>
            <p className="text-sm text-gray-600">Батьки</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список користувачів</CardTitle>
          <CardDescription>
            Всі зареєстровані користувачі
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Користувач</th>
                  <th className="pb-3 font-medium">Контакти</th>
                  <th className="pb-3 font-medium">Роль</th>
                  <th className="pb-3 font-medium">Статус</th>
                  <th className="pb-3 font-medium">Реєстрація</th>
                  <th className="pb-3 font-medium text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="text-sm">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          {user.stats && (
                            <div className="text-xs text-gray-500 mt-1">
                              {user.stats.questsCompleted} квестів • {user.stats.reportsSubmitted} звітів
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-4 text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4 text-right">
                      {user.status === 'PENDING' ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(user.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Підтвердити
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(user.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Відхилити
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline">
                          Деталі
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
