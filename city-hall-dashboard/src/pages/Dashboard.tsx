import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Users, FileText, CheckCircle, XCircle,
  Clock, AlertCircle, ThumbsUp, Trash2, Building2
} from 'lucide-react';
import { statsAPI } from '@/lib/api';
import { useSocket, useSocketEvent } from '@/lib/socket';
import { api } from '@/lib/api';
import DepartmentsOverview from './DepartmentsOverview';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Record<string, string>>({});
  const [approving, setApproving] = useState<Record<string, boolean>>({});
  const [showDepartments, setShowDepartments] = useState(false);
  const { socket } = useSocket();

  const departments = [
    { id: 'roads', name: '🛣️ Дороги' },
    { id: 'lighting', name: '💡 Освітлення' },
    { id: 'waste', name: '🗑️ Сміття' },
    { id: 'parks', name: '🌳 Парки' },
    { id: 'water', name: '🚰 Водопровід' },
    { id: 'transport', name: '🚗 Транспорт' },
    { id: 'other', name: '❓ Інше' },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await statsAPI.getDashboard();
      setStats(data);
      
      // Load pending reports
      const reportsRes = await api.get('/reports?status=PENDING&limit=10');
      const reports = Array.isArray(reportsRes) ? reportsRes : reportsRes.data || [];
      setPendingReports(reports);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId: string) => {
    setApproving(prev => ({ ...prev, [reportId]: true }));
    try {
      const department = selectedDepartment[reportId];
      if (!department) {
        alert('Виберіть відділ');
        return;
      }
      
      await api.post(`/reports/${reportId}/approve`, { department });
      setPendingReports(prev => prev.filter(r => r.id !== reportId));
      setSelectedDepartment(prev => {
        const updated = { ...prev };
        delete updated[reportId];
        return updated;
      });
      loadStats();
    } catch (error) {
      console.error('Failed to approve report:', error);
      alert('Помилка при підтвердженні звіту');
    } finally {
      setApproving(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleReject = async (reportId: string) => {
    setApproving(prev => ({ ...prev, [reportId]: true }));
    try {
      await api.post(`/reports/${reportId}/reject`, {});
      setPendingReports(prev => prev.filter(r => r.id !== reportId));
      loadStats();
    } catch (error) {
      console.error('Failed to reject report:', error);
      alert('Помилка при відхиленні звіту');
    } finally {
      setApproving(prev => ({ ...prev, [reportId]: false }));
    }
  };

  // Real-time updates
  useSocketEvent(socket, 'stats:update', (data: any) => {
    setStats((prev: any) => ({ ...prev, ...data }));
  });

  useSocketEvent(socket, 'report:new', () => {
    loadStats(); // Reload stats when new report arrives
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show Departments Overview
  if (showDepartments) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={() => setShowDepartments(false)} variant="outline">
            ← Назад до головної
          </Button>
        </div>
        <DepartmentsOverview />
      </div>
    );
  }

  const reportsData = stats?.reportsOverTime || [];
  const statusDistribution = stats?.statusDistribution || [];
  const categoryData = stats?.categoryBreakdown || [];

  const statCards = [
    {
      title: 'Всього звітів',
      value: stats?.totalReports || 0,
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Активні користувачі',
      value: stats?.activeUsers || 0,
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Підтверджено',
      value: stats?.approvedReports || 0,
      change: '+23%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Очікують',
      value: stats?.pendingReports || 0,
      change: '-5%',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Огляд системи GenTrust City Hall
          </p>
        </div>
        <Button onClick={() => setShowDepartments(true)} variant="outline">
          <Building2 className="w-4 h-4 mr-2" />
          Департаменти
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value.toLocaleString()}
                    </h3>
                    <p className={`text-sm mt-2 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="inline h-4 w-4 mr-1" />
                      {stat.change} за місяць
                    </p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Reports Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Звіти за часом</CardTitle>
            <CardDescription>Останні 30 днів</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportsData}>
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
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorReports)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Розподіл за статусами</CardTitle>
            <CardDescription>Поточний стан</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Звіти за категоріями</CardTitle>
            <CardDescription>Розподіл за типами проблем</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports Management */}
      {pendingReports.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-900">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              ⏳ Звіти на розгляді ({pendingReports.length})
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Затвердіть звіти та направте до відповідного відділу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <div 
                  key={report.id} 
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {report.title}
                        </h4>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {report.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {report.description}
                      </p>
                      {report.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                          📍 {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                        </p>
                      )}
                      
                      {/* Department Selection */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {departments.map(dept => (
                          <button
                            key={dept.id}
                            onClick={() => setSelectedDepartment(prev => ({
                              ...prev,
                              [report.id]: dept.id
                            }))}
                            className={`px-3 py-1 rounded-full text-sm transition ${
                              selectedDepartment[report.id] === dept.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300'
                            }`}
                          >
                            {dept.name}
                          </button>
                        ))}
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Від: {report.createdBy?.name} | {new Date(report.createdAt).toLocaleDateString('uk-UA')}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(report.id)}
                        disabled={!selectedDepartment[report.id] || approving[report.id]}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition flex items-center gap-2 text-sm font-medium"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Підтвердити
                      </button>
                      <button
                        onClick={() => handleReject(report.id)}
                        disabled={approving[report.id]}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition flex items-center gap-2 text-sm font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                        Відхилити
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Недавня активність</CardTitle>
          <CardDescription>Останні дії в системі</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className={`${
                  activity.type === 'approved' ? 'bg-green-100 text-green-600' :
                  activity.type === 'rejected' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                } p-2 rounded-lg`}>
                  {activity.type === 'approved' ? <CheckCircle className="h-5 w-5" /> :
                   activity.type === 'rejected' ? <XCircle className="h-5 w-5" /> :
                   <AlertCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
                <Badge variant={
                  activity.type === 'approved' ? 'success' :
                  activity.type === 'rejected' ? 'destructive' :
                  'default'
                }>
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
