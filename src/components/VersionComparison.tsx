import type { ReportData, VersionChange } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface VersionComparisonProps {
  data: ReportData;
}

export function VersionComparison({ data }: VersionComparisonProps) {
  if (data.versionChanges.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-2 text-sm font-medium text-slate-900">版本优化与回退项</h3>
        <p className="text-sm text-slate-500">仅有一个版本数据，无法计算版本间优化/回退项。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {data.versionChanges.map((change) => (
        <VersionChangeCard key={change.version} change={change} />
      ))}
    </div>
  );
}

function VersionChangeCard({ change }: { change: VersionChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-medium text-slate-900">
        {change.previousVersion} → {change.version}
      </h3>

      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-700">
          <TrendingUp size={16} />
          优化项
        </div>
        {change.improvements.length > 0 ? (
          <ul className="space-y-1.5 text-sm">
            {change.improvements.map((item, index) => (
              <li key={index} className="text-slate-600">
                {item.stationName ? `【${item.stationName}】` : ''}
                {item.testType} 成功率 {item.previousRate}% → {item.currentRate}%（+{item.change}%）
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">无</p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-700">
          <TrendingDown size={16} />
          回退项
        </div>
        {change.regressions.length > 0 ? (
          <ul className="space-y-1.5 text-sm">
            {change.regressions.map((item, index) => (
              <li key={index} className="text-slate-600">
                {item.stationName ? `【${item.stationName}】` : ''}
                {item.testType} 成功率 {item.previousRate}% → {item.currentRate}%（{item.change}%）
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">无</p>
        )}
      </div>
    </div>
  );
}
