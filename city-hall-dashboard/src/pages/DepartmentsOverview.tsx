import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Building2, CheckCircle, Clock, AlertTriangle, 
  ArrowRight, RefreshCw, ExternalLink, FileText
} from 'lucide-react';
import { api } from '@/lib/api';

const DEPARTMENT_PORTS: Record<string, number> = {
  roads: 5180,
  lighting: 5181,
  waste: 5182,
  parks: 5183,
  water: 5184,
  transport: 5185,
  ecology: 5186,
  vandalism: 5187,
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

interface DepartmentStats {
  id: string;
  name: string;
  nameUa: string;
  dbExists: boolean;
  stats: {
    totalReports: number;
    pendingReports: number;
    approvedReports: number;
    rejectedReports: number;
    inProgressReports: number;
    completedReports: number;
  } | null;
  error?: string;
}

export default function DepartmentsOverview() {
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await api.get('/departments');
      const data = Array.isArray(response) ? response : response.data || response.departments || [];
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDepartments();
    setRefreshing(false);
  };

  const openDepartment = (deptId: string) => {
    const port = DEPARTMENT_PORTS[deptId];
    if (port) {
      window.open(`http://localhost:${port}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate totals
  const totalReports = departments.reduce((sum, dept) => sum + (dept.stats?.totalReports || 0), 0);
  const totalPending = departments.reduce((sum, dept) => sum + (dept.stats?.pendingReports || 0), 0);
  const totalApproved = departments.reduce((sum, dept) => sum + (dept.stats?.approvedReports || 0), 0);
  const totalCompleted = departments.reduce((sum, dept) => sum + (dept.stats?.completedReports || 0), 0);

  // Prepare chart data
  const departmentChartData = departments.map((dept, index) => ({
    name: dept.nameUa.split(' ')[1] || dept.name,
    total: dept.stats?.totalReports || 0,
    pending: dept.stats?.pendingReports || 0,
    completed: dept.stats?.completedReports || 0,
    fill: COLORS[index % COLORS.length],
  }));

  const statusDistribution = [
    { name: 'Очікують', value: totalPending, color: '#f59e0b' },
    { name: 'Підтверджено', value: totalApproved, color: '#10b981' },
    { name: 'Виконано', value: totalCompleted, color: '#3b82f6' },
    { name: 'Відхилено', value: departments.reduce((sum, dept) => sum + (dept.stats?.rejectedReports || 0), 0), color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Огляд департаментів</h2>
          <p className="text-gray-500">Статистика по всіх 8 департаментах</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Оновити
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього звітів</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-gray-500">По всіх департаментах</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Очікують</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-gray-500">Потребують уваги</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Підтверджено</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApproved}</div>
            <p className="text-xs text-gray-500">Схвалено модераторами</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Виконано</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <p className="text-xs text-gray-500">Завершено успішно</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Reports by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Звіти по департаментах</CardTitle>
            <CardDescription>Порівняння кількості звітів</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChartData}>
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
          </CardContent>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Розподіл по статусах</CardTitle>
            <CardDescription>Всі департаменти разом</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((dept, index) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{dept.nameUa}</span>
                <Badge variant={dept.dbExists ? 'success' : 'destructive'}>
                  {dept.dbExists ? 'Active' : 'Offline'}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                {dept.dbExists ? 'База даних підключена' : 'База даних не знайдена'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dept.stats ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Всього:</span>
                      <span className="ml-2 font-semibold">{dept.stats.totalReports}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Очікують:</span>
                      <span className="ml-2 font-semibold text-yellow-600">{dept.stats.pendingReports}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Схвалено:</span>
                      <span className="ml-2 font-semibold text-green-600">{dept.stats.approvedReports}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Виконано:</span>
                      <span className="ml-2 font-semibold text-blue-600">{dept.stats.completedReports}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-2" 
                    variant="outline"
                    onClick={() => openDepartment(dept.id)}
                    disabled={!dept.dbExists}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Відкрити дашборд
                  </Button>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p>Немає даних</p>
                  {dept.error && <p className="text-xs text-red-500 mt-1">{dept.error}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
