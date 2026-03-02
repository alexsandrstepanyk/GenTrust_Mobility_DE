import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, X, ZoomIn, CheckCircle, XCircle, BrainCircuit } from 'lucide-react';
// 02.03.2025: Змінено з динамічного на статичний імпорт leaflet для фіксу Vite помилки
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  location: { lat: number; lng: number } | null;
  photoUrl?: string;
  createdBy: { name: string; email: string };
  createdAt: string;
  priority: string;
  aiVerdict?: {
    is_issue: boolean;
    confidence: number;
    category: string;
  };
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  status: string;
  title: string;
}

function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('general');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<any>(null);

  const canModerateReport = (status?: string) => {
    const normalized = (status || '').toUpperCase().trim();
    return ['PENDING', 'NEW', 'IN_REVIEW'].includes(normalized);
  };
  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    setTriageResult(null);
  }, [selectedReport?.id]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports');
      const data = Array.isArray(response) ? response : response.data || [];
      setReports(data || []);
      filterReports(data, 'ALL');
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = (data: Report[], status: string) => {
    if (status === 'ALL') {
      setFilteredReports(data);
    } else {
      setFilteredReports(data.filter(r => r.status === status));
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterReports(reports, status);
  };

  const handleApprove = async () => {
    if (!selectedReport) return;
    setProcessing(true);
    try {
      await api.post(`/reports/${selectedReport.id}/approve`, {
        department: selectedDepartment
      });
      // Оновити локальний стан
      const updated = reports.map(r =>
        r.id === selectedReport.id ? { ...r, status: 'APPROVED', forwardedTo: selectedDepartment } : r
      );
      setReports(updated);
      filterReports(updated, statusFilter);
      setApproveModalOpen(false);
      setSelectedReport(null);
      fetchReports(); // Перезавантажити дані
    } catch (error) {
      console.error('Approve error:', error);
      alert('Помилка при підтвердженні звіту');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReport) return;
    setProcessing(true);
    try {
      await api.post(`/reports/${selectedReport.id}/reject`, {
        reason: rejectionReason
      });
      // Оновити локальний стан
      const updated = reports.map(r =>
        r.id === selectedReport.id ? { ...r, status: 'REJECTED', rejectionReason } : r
      );
      setReports(updated);
      filterReports(updated, statusFilter);
      setRejectModalOpen(false);
      setSelectedReport(null);
      fetchReports(); // Перезавантажити дані
    } catch (error) {
      console.error('Reject error:', error);
      alert('Помилка при відхиленні звіту');
    } finally {
      setProcessing(false);
    }
  };

  const getAIConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAIConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return '✅ Висока';
    if (confidence >= 0.5) return '⚠️ Середня';
    return '❌ Низька';
  };

  const applyAIRecommendation = () => {
    if (!selectedReport?.aiVerdict) return;
    const aiCategory = selectedReport.aiVerdict.category;
    const aiConfidence = Number(selectedReport.aiVerdict.confidence || 0);
    const invalidCategories = ['error', 'invalid_ai_response', 'missing_api_key'];
    if (invalidCategories.includes(aiCategory) || aiConfidence <= 0) {
      alert('Рекомендація ШІ недоступна або невалідна. Оберіть департамент вручну.');
      return;
    }

    // Автоматично вибрати департамент на основі AI категорії
    const categoryToDepartment: Record<string, string> = {
      'Roads': 'roads',
      'Lighting': 'lighting',
      'Waste': 'waste',
      'Parks': 'parks',
      'Water': 'water',
      'Transport': 'transport',
      'Graffiti': 'graffiti',
      'Other': 'general'
    };
    const dept = categoryToDepartment[selectedReport.aiVerdict.category] || 'general';
    setSelectedDepartment(dept);
  };

  const runCityHallTriage = async () => {
    if (!selectedReport) return;
    try {
      setTriageLoading(true);
      const { data } = await api.post(`/reports/${selectedReport.id}/triage`, {});
      setTriageResult(data?.recommendation || null);
    } catch (e) {
      console.error('Triage error:', e);
      alert('Не вдалося виконати повторний AI-аналіз мерії');
    } finally {
      setTriageLoading(false);
    }
  };

  const applyCityHallTriage = () => {
    if (!triageResult) return;
    if (triageResult.action === 'REJECT') {
      setRejectionReason(triageResult.reason || 'Відхилено за рекомендацією AI мерії');
      setRejectModalOpen(true);
      return;
    }
    if (triageResult.recommendedDepartment) {
      setSelectedDepartment(triageResult.recommendedDepartment);
      setApproveModalOpen(true);
    }
  };

  const getMarkers = (): MapMarker[] => {
    return filteredReports
      .filter(r => r.location)
      .map(r => ({
        id: r.id,
        lat: r.location!.lat,
        lng: r.location!.lng,
        status: r.status,
        title: r.title
      }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      RESOLVED: '✓ Вирішено',
      IN_PROGRESS: '⟳ В процесі',
      PENDING: '⏳ На розгляді',
      REJECTED: '✗ Відхилено'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Звіти про проблеми</h1>
        <Button
          onClick={() => setMapOpen(true)}
          className="flex items-center gap-2"
        >
          <MapPin size={18} />
          На карті ({getMarkers().length})
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleStatusFilter('ALL')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Всі ({reports.length})
        </button>
        <button
          onClick={() => handleStatusFilter('PENDING')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'PENDING'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          На розгляді ({reports.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          onClick={() => handleStatusFilter('IN_PROGRESS')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          В процесі ({reports.filter(r => r.status === 'IN_PROGRESS').length})
        </button>
        <button
          onClick={() => handleStatusFilter('RESOLVED')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'RESOLVED'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Вирішено ({reports.filter(r => r.status === 'RESOLVED').length})
        </button>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Завантаження звітів...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">Немає звітів за обраним фільтром</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map(report => (
            <Card
              key={report.id}
              className="hover:shadow-lg transition cursor-pointer overflow-hidden"
              onClick={() => setSelectedReport(report)}
            >
              {/* Photo Thumbnail */}
              {report.photoUrl && (
                <div className="relative h-40 bg-gray-200 overflow-hidden group">
                  <img
                    src={report.photoUrl}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEnlargedPhoto(report.photoUrl || null);
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition shadow-lg"
                  >
                    <ZoomIn size={18} className="text-gray-800" />
                  </button>
                </div>
              )}

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 flex-1 line-clamp-2">
                    {report.title}
                  </h3>
                  <Badge className={getStatusColor(report.status)}>
                    {getStatusLabel(report.status)}
                  </Badge>
                </div>

                {report.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {report.description}
                  </p>
                )}

                {report.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={14} />
                    {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-600 pt-2 border-t">
                  <span>{report.createdBy.name}</span>
                  <span>
                    {new Date(report.createdAt).toLocaleDateString('uk-UA')}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Map Modal */}
      {mapOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Карта проблем</h2>
              <button
                onClick={() => setMapOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 relative">
              <GoogleMap markers={getMarkers()} />
            </div>

            {/* Legend */}
            <div className="border-t p-4 flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm">Активні проблеми ({getMarkers().filter(m => m.status !== 'RESOLVED').length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm">Вирішені ({getMarkers().filter(m => m.status === 'RESOLVED').length})</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">{selectedReport.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedReport.photoUrl && (
                <img
                  src={selectedReport.photoUrl}
                  alt={selectedReport.title}
                  className="w-full rounded-lg max-h-96 object-cover"
                />
              )}

              <div className="flex gap-4 flex-wrap">
                <Badge className={getStatusColor(selectedReport.status)}>
                  {getStatusLabel(selectedReport.status)}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {selectedReport.category}
                </Badge>
                {selectedReport.priority && (
                  <Badge className="bg-orange-100 text-orange-800">
                    {selectedReport.priority === 'HIGH'
                      ? '⚠️ Висока'
                      : selectedReport.priority === 'LOW'
                      ? '→ Низька'
                      : '→ Середня'}
                  </Badge>
                )}
              </div>

              {/* AI Recommendations */}
              {selectedReport.aiVerdict && (
                <Card className="border-2 border-purple-200 bg-purple-50">
                  <div className="flex items-center gap-2 mb-3">
                    <BrainCircuit className="h-5 w-5 text-purple-600" />
                    <h3 className="font-bold text-purple-900">🤖 Рекомендація ШІ</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">Чи є проблемою:</span>
                      <span className={`font-bold ${selectedReport.aiVerdict.is_issue ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedReport.aiVerdict.is_issue ? '✅ Так' : '❌ Ні'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">Впевненість:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getAIConfidenceColor(selectedReport.aiVerdict.confidence)}`}>
                        {getAIConfidenceLabel(selectedReport.aiVerdict.confidence)} ({(selectedReport.aiVerdict.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">Категорія:</span>
                      <Badge className="bg-purple-100 text-purple-800">
                        {selectedReport.aiVerdict.category}
                      </Badge>
                    </div>
                    <Button
                      onClick={applyAIRecommendation}
                      disabled={
                        ['error', 'invalid_ai_response', 'missing_api_key'].includes(selectedReport.aiVerdict.category) ||
                        Number(selectedReport.aiVerdict.confidence || 0) <= 0
                      }
                      className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      🤖 Застосувати рекомендацію ШІ
                    </Button>
                  </div>
                </Card>
              )}

              {/* City-Hall AI second pass */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-bold text-blue-900">🏛️ Другий AI-аналіз мерії</h3>
                  <Button size="sm" onClick={runCityHallTriage} disabled={triageLoading}>
                    {triageLoading ? '⏳ Аналіз...' : 'Запустити AI triage'}
                  </Button>
                </div>
                {triageResult ? (
                  <div className="space-y-2 text-sm">
                    <div><b>Рішення:</b> {triageResult.action === 'REJECT' ? '❌ Відхилити' : '✅ Відправити у відділ'}</div>
                    <div><b>Відділ:</b> {triageResult.recommendedDepartment || '—'}</div>
                    <div><b>Категорія:</b> {triageResult.category || '—'}</div>
                    <div><b>Впевненість:</b> {Math.round((Number(triageResult.confidence || 0)) * 100)}%</div>
                    <div><b>Пояснення:</b> {triageResult.reason || '—'}</div>
                    <Button size="sm" className="mt-2" onClick={applyCityHallTriage}>
                      Застосувати рекомендацію мерії
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-blue-800">AI triage враховує фото, текст і історію автора (частку відхилених звітів).</p>
                )}
              </Card>

              {selectedReport.description && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Опис</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              {selectedReport.location && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Локація</h3>
                  <div className="space-y-3">
                    <iframe
                      title="Локація проблеми на Google Maps"
                      src={`https://www.google.com/maps?q=${selectedReport.location.lat},${selectedReport.location.lng}&z=17&output=embed`}
                      className="w-full h-56 rounded-lg border"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg text-sm">
                      <span className="font-mono">
                        {selectedReport.location.lat.toFixed(6)}, {selectedReport.location.lng.toFixed(6)}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.location.lat},${selectedReport.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Відкрити в Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-600">Автор</p>
                  <p className="font-bold text-gray-900">
                    {selectedReport.createdBy.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedReport.createdBy.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Дата створення</p>
                  <p className="font-bold text-gray-900">
                    {new Date(selectedReport.createdAt).toLocaleDateString(
                      'uk-UA',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedReport.createdAt).toLocaleTimeString(
                      'uk-UA',
                      { hour: '2-digit', minute: '2-digit' }
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t space-y-3">
                <h3 className="font-bold text-gray-900">Дії модератора</h3>
                {canModerateReport(selectedReport.status) ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setApproveModalOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      ✅ Підтвердити
                    </Button>
                    <Button
                      onClick={() => setRejectModalOpen(true)}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <XCircle size={18} />
                      ❌ Відхилити
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-100 text-gray-700 text-sm p-3">
                    Для цього статусу ({selectedReport.status}) кнопки модерації недоступні.
                    Вони доступні для звітів у статусі PENDING/NEW/IN_REVIEW.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900">✅ Підтвердити звіт</h3>
              <p className="text-sm text-gray-600">
                Оберіть департамент для відповідального виконання:
              </p>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="general">📋 Загальний відділ</option>
                <option value="roads">🛣️ Дороги та тротуари</option>
                <option value="lighting">💡 Освітлення</option>
                <option value="waste">🗑️ Сміття та переробка</option>
                <option value="parks">🌳 Парки та зони відпочинку</option>
                <option value="water">💧 Водопостачання</option>
                <option value="transport">🚌 Транспорт</option>
                <option value="graffiti">🎨 Графіті</option>
              </select>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {processing ? '⏳ Обробка...' : '✅ Підтвердити'}
                </Button>
                <Button
                  onClick={() => setApproveModalOpen(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={processing}
                >
                  Скасувати
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-red-600">❌ Відхилити звіт</h3>
              <p className="text-sm text-gray-600">
                Вкажіть причину відхилення:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Наприклад: недостатньо інформації, фейкове фото, не відповідна категорія..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 min-h-[100px]"
              />
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleReject}
                  disabled={processing || !rejectionReason}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {processing ? '⏳ Обробка...' : '❌ Відхилити'}
                </Button>
                <Button
                  onClick={() => setRejectModalOpen(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={processing}
                >
                  Скасувати
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {enlargedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setEnlargedPhoto(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10"
            >
              <X size={24} className="text-gray-800" />
            </button>
            <img
              src={enlargedPhoto}
              alt="Enlarged"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Leaflet Map Component
function GoogleMap({ markers }: { markers: MapMarker[] }) {
  const mapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!mapRef.current) return;

    // 02.03.2025: Змінено з динамічного на статичне використання Leaflet
    // БУЛО: import('leaflet').then(L => { ... })
    // Очистка попередньої карти
    const existingMap = (window as any)._leafletMap;
    if (existingMap) {
      existingMap.remove();
    }

    // Центр Вюрцбурга за дефолтом
    const wurzburgCenter: [number, number] = [49.7913, 9.9534];
    
    // Якщо маркери є, центруємо на них, інакше на Вюрцбург
    const center = markers.length > 0
      ? [
          markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
          markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
        ] as [number, number]
      : wurzburgCenter;

    if (!mapRef.current) return;
    const map = L.map(mapRef.current).setView(center, markers.length > 0 ? 13 : 12);

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Додати маркери
    markers.forEach(marker => {
      const isResolved = marker.status === 'RESOLVED';
      const color = isResolved ? '#22c55e' : '#ef4444'; // green : red

      const customIcon = L.divIcon({
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
          " class="marker-icon">
            <span style="color: white; font-size: 16px; font-weight: bold;">
              ${isResolved ? '✓' : '!'}
            </span>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });

      const popup = L.popup()
        .setContent(`
          <div style="font-family: Arial, sans-serif; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px;">${marker.title}</h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
              <strong>Статус:</strong> ${isResolved ? '✓ Вирішено' : '⏳ Активна'}
            </p>
            <p style="margin: 0; font-size: 12px; color: #999;">
              ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}
            </p>
          </div>
        `);

      L.marker([marker.lat, marker.lng], { icon: customIcon })
        .bindPopup(popup)
        .addTo(map);
    });

    // Автоматично вписати все на екран
    if (markers.length > 1) {
      const group = L.featureGroup(
        markers.map(m => L.marker([m.lat, m.lng]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }

    (window as any)._leafletMap = map;

    return () => {
      const existingMap = (window as any)._leafletMap;
      if (existingMap) {
        existingMap.remove();
        (window as any)._leafletMap = null;
      }
    };
  }, [markers]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '500px' }}
    />
  );
}

export default Reports;
