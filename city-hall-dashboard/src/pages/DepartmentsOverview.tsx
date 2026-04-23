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
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
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
    { name: t('pending'), value: totalPending, color: '#f59e0b' },
    { name: t('approved'), value: totalApproved, color: '#10b981' },
    { name: t('completed'), value: totalCompleted, color: '#3b82f6' },
    { name: t('rejected'), value: departments.reduce((sum, dept) => sum + (dept.stats?.rejectedReports || 0), 0), color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('departments_overview')}</h2>
          <p className="text-gray-500">{t('departments_stats')}</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_reports')}</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-gray-500">{t('across_departments')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pending')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-gray-500">{t('needs_attention')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('approved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApproved}</div>
            <p className="text-xs text-gray-500">{t('approved_by_moderators')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('completed')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <p className="text-xs text-gray-500">{t('completed_successfully')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Reports by Department */}
        <Card>
          <CardHeader>
            <CardTitle>{t('reports_by_department')}</CardTitle>
            <CardDescription>{t('reports_comparison')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" name={t('total_reports')} />
                <Bar dataKey="pending" fill="#f59e0b" name={t('pending')} />
                <Bar dataKey="completed" fill="#10b981" name={t('completed')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('status_distribution')}</CardTitle>
            <CardDescription>{t('all_departments_combined')}</CardDescription>
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
                <span>{i18n.language === 'de' ? dept.name : dept.nameUa}</span>
                <Badge variant={dept.dbExists ? 'success' : 'destructive'}>
                  {dept.dbExists ? t('active') : t('offline')}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                {dept.dbExists ? t('db_connected') : t('db_not_found')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dept.stats ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">{t('total_reports')}:</span>
                      <span className="ml-2 font-semibold">{dept.stats.totalReports}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('pending')}:</span>
                      <span className="ml-2 font-semibold text-yellow-600">{dept.stats.pendingReports}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('approved')}:</span>
                      <span className="ml-2 font-semibold text-green-600">{dept.stats.approvedReports}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('completed')}:</span>
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
                    {t('open_dashboard')}
                  </Button>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p>{t('no_data')}</p>
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
