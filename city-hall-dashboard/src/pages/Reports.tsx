import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { useSocket, useSocketEvent } from '@/lib/socket';
import ReportMap from '@/components/ReportMap';
import { 
  CheckCircle, XCircle, Eye, MapPin,
  Calendar, User, Image as ImageIcon, Filter,
  BarChart3, AlertCircle, Map, List, Maximize2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { 
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FORWARDED';
  category: string;
  location?: { lat: number; lng: number };
  photoUrl?: string;
  createdBy: { name: string; email: string };
  createdAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  aiVerdict?: any;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  forwarded: number;
  byCategory: Array<{ category: string; count: number }>;
  dailyReports: Array<{ date: string; count: number }>;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'stats'>('list');
  const { socket } = useSocket();

  useEffect(() => {
    loadReports();
    loadStats();
  }, []);

  const loadReports = async () => {
    try {
      const { data } = await api.get('/reports');
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get('/reports/stats/overview');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Real-time updates
  useSocketEvent(socket, 'report:new', (report: Report) => {
    setReports(prev => [report, ...prev]);
    loadStats();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Новий звіт', {
        body: report.title,
      });
    }
  });

  useSocketEvent(socket, 'report:updated', (updatedReport: Report) => {
    setReports(prev => prev.map(r => 
      r.id === updatedReport.id ? updatedReport : r
    ));
    loadStats();
  });

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/reports/${id}/approve`);
      loadReports();
      loadStats();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Помилка при підтвердженні звіту');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Причина відхилення:');
    if (!reason) return;
    
    try {
      await api.post(`/reports/${id}/reject`, { reason });
      loadReports();
      loadStats();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Помилка при відхиленні звіту');
    }
  };

  const handleForward = async (id: string, dept: string) => {
    try {
      await api.post(`/reports/${id}/forward`, { to: dept });
      loadReports();
      loadStats();
    } catch (error) {
      console.error('Failed to forward:', error);
      alert('Помилка при переадресації звіту');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'PENDING': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'destructive',
      'FORWARDED': 'default'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      'LOW': 'text-gray-600',
      'MEDIUM': 'text-blue-600',
      'HIGH': 'text-orange-600',
      'URGENT': 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.status === filter);

  const getGoogleMapsEmbedUrl = (lat: number, lng: number) =>
    `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Завантаження...</div>;
  }

  const statusData = stats ? [
    { name: 'Очікує', value: stats.pending, color: '#f59e0b' },
    { name: 'Підтверджено', value: stats.approved, color: '#10b981' },
    { name: 'Відхилено', value: stats.rejected, color: '#ef4444' },
    { name: 'Переадресовано', value: stats.forwarded, color: '#3b82f6' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Звіти громадян</h1>
          <p className="text-muted-foreground">Управління вхідними звітами від мешканців</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Список
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
          >
            <Map className="h-4 w-4 mr-2" />
            Карта
          </Button>
          <Button
            variant={viewMode === 'stats' ? 'default' : 'outline'}
            onClick={() => setViewMode('stats')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Статистика
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Всього звітів
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Очікують
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Підтверджено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Відхилено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Переадресовано
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.forwarded}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistics View */}
      {viewMode === 'stats' && stats && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Розподіл за статусом</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>За категоріями</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Звіти за останні 30 днів</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.dailyReports}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle>Карта звітів</CardTitle>
            <CardDescription>
              {filteredReports.filter(r => r.location).length} звітів з геолокацією
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px]">
              <ReportMap 
                reports={filteredReports} 
                onMarkerClick={(report) => {
                  const fullReport = reports.find((r) => r.id === report.id);
                  if (fullReport) setSelectedReport(fullReport);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Фільтри
                </CardTitle>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Всі звіти ({reports.length})</option>
                  <option value="PENDING">Очікують ({stats?.pending || 0})</option>
                  <option value="APPROVED">Підтверджені ({stats?.approved || 0})</option>
                  <option value="REJECTED">Відхилені ({stats?.rejected || 0})</option>
                  <option value="FORWARDED">Переадресовані ({stats?.forwarded || 0})</option>
                </select>
              </div>
            </CardHeader>
          </Card>

          {/* Reports Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {report.photoUrl ? (
                    <img 
                      src={report.photoUrl} 
                      alt={report.title}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setPreviewImageUrl(report.photoUrl || null)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    {report.photoUrl && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7"
                        onClick={() => setPreviewImageUrl(report.photoUrl || null)}
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {getStatusBadge(report.status)}
                  </div>
                </div>

                {report.location && (
                  <div className="px-4 pt-4">
                    <iframe
                      title={`map-${report.id}`}
                      src={getGoogleMapsEmbedUrl(report.location.lat, report.location.lng)}
                      className="w-full h-32 rounded-md border"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg flex items-start justify-between gap-2">
                    <span>{report.title}</span>
                    <AlertCircle className={`h-5 w-5 flex-shrink-0 ${getPriorityColor(report.priority)}`} />
                  </CardTitle>
                  <CardDescription>{report.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{report.createdBy.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                    {report.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                          {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>

                  {report.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        onClick={() => handleApprove(report.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Підтвердити
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(report.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {report.status === 'APPROVED' && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs text-muted-foreground">Переадресувати до:</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleForward(report.id, 'utilities')}
                        >
                          Комунальні
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleForward(report.id, 'transport')}
                        >
                          Транспорт
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleForward(report.id, 'ecology')}
                        >
                          Екологія
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setSelectedReport(report)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Детальніше
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Немає звітів за обраним фільтром</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <Card 
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>{selectedReport.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {getStatusBadge(selectedReport.status)}
                <span>•</span>
                <span>{selectedReport.category}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedReport.photoUrl && (
                <div className="relative group">
                  <img 
                    src={selectedReport.photoUrl} 
                    alt={selectedReport.title}
                    className="w-full rounded-lg cursor-zoom-in"
                    onClick={() => setPreviewImageUrl(selectedReport.photoUrl || null)}
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setPreviewImageUrl(selectedReport.photoUrl || null)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {selectedReport.location && (
                <div>
                  <h4 className="font-semibold mb-2">Локація на Google Maps:</h4>
                  <iframe
                    title={`map-detail-${selectedReport.id}`}
                    src={getGoogleMapsEmbedUrl(selectedReport.location.lat, selectedReport.location.lng)}
                    className="w-full h-64 rounded-lg border"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Опис:</h4>
                <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Автор:</span> {selectedReport.createdBy.name}
                </div>
                <div>
                  <span className="font-semibold">Дата:</span> {formatDate(selectedReport.createdAt)}
                </div>
                <div>
                  <span className="font-semibold">Пріоритет:</span> {selectedReport.priority}
                </div>
                {selectedReport.location && (
                  <div>
                    <span className="font-semibold">Локація:</span> {selectedReport.location.lat.toFixed(4)}, {selectedReport.location.lng.toFixed(4)}
                  </div>
                )}
              </div>
              {selectedReport.aiVerdict && (
                <div>
                  <h4 className="font-semibold mb-2">AI Аналіз:</h4>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedReport.aiVerdict, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setSelectedReport(null)} className="flex-1">
                  Закрити
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fullscreen image preview */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          <img
            src={previewImageUrl}
            alt="Preview"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
