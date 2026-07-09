import type { ReportData } from '../types';
import { CheckCircle, Gauge, MapPin, LayoutGrid, Calendar, Car } from 'lucide-react';

interface StatCardsProps {
  data: ReportData;
}

export function StatCards({ data }: StatCardsProps) {
  const items = [
    { label: '测试日期', value: data.metadata.testDate || '—', icon: Calendar, suffix: '' },
    { label: 'VIN', value: data.metadata.vin || '—', icon: Car, suffix: '' },
    { label: '单次测试次数', value: data.singleTestStats.total, icon: Gauge, suffix: '' },
    { label: '单次测试通过率', value: data.singleTestStats.rate, icon: CheckCircle, suffix: '%' },
    { label: '完成站点数', value: data.completedStations, icon: LayoutGrid, suffix: '' },
    { label: '站点数量', value: data.metadata.stationCount, icon: MapPin, suffix: '' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-center gap-2 text-sm text-muted">
            <item.icon size={16} />
            {item.label}
          </div>
          <div className="font-mono-data text-2xl font-semibold text-slate-900">
            {item.value}
            <span className="ml-1 text-lg text-accent">{item.suffix}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
