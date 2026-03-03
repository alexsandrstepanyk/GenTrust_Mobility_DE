import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Badge } from './ui/Badge';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Report {
  id: string;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FORWARDED';
  location?: { lat: number; lng: number };
  category: string;
  createdBy: { name: string };
}

interface ReportMapProps {
  reports: Report[];
  onMarkerClick?: (report: Report) => void;
}

export default function ReportMap({ reports, onMarkerClick }: ReportMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reportsWithLocation = reports.filter(r => r.location);

  // Default center (можна змінити на ваше місто)
  const center: [number, number] = reportsWithLocation.length > 0
    ? [reportsWithLocation[0].location!.lat, reportsWithLocation[0].location!.lng]
    : [50.4501, 30.5234]; // Київ за замовчуванням

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'APPROVED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      case 'FORWARDED': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const createColoredIcon = (status: string) => {
    const color = getMarkerColor(status);
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'destructive';
      case 'FORWARDED': return 'default';
      default: return 'secondary';
    }
  };

  if (!mounted) {
    return <div className="h-full flex items-center justify-center">Завантаження карти...</div>;
  }

  if (reportsWithLocation.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Немає звітів з геолокацією
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full rounded-lg"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reportsWithLocation.map((report) => (
        <Marker
          key={report.id}
          position={[report.location!.lat, report.location!.lng]}
          icon={createColoredIcon(report.status)}
          eventHandlers={{
            click: () => onMarkerClick?.(report),
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold mb-2">{report.title}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Статус:</span>
                  <Badge variant={getStatusBadgeVariant(report.status) as any}>
                    {report.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Категорія:</span>{' '}
                  {report.category}
                </div>
                <div>
                  <span className="text-muted-foreground">Автор:</span>{' '}
                  {report.createdBy.name}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
