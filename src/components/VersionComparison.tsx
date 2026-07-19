import type { ReportData, VersionChange } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface VersionComparisonProps {
  data: ReportData;
}

export function VersionComparison({ data }: VersionComparisonProps) {
  if (data.versionChanges.length === 0) {
    return (
      <div className="rounded-xl border border-slate-300 bg-slate-200 p-4">
        <h3 className="mb-2 text-xs font-medium text-slate-900">版本优化与回退项</h3>
        <p className="text-xs text-slate-700">仅有一个版本数据，无法计算版本间优化/回退项。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {data.versionChanges.map((change) => (
        <VersionChangeCard key={change.version} change={change} />
      ))}
    </div>
  );
}

function VersionChangeCard({ change }: { change: VersionChange }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-slate-200 p-4">
      <h3 className="mb-3 text-xs font-medium text-slate-900">
        {change.previousVersion} → {change.version}
      </h3>

      <div className="mb-3 rounded-lg bg-slate-100 p-3">
        <div className="mb-1.5 flex items-center gap-2 text-xs text-slate-800">
          <TrendingUp size={14} />
          优化项
        </div>
        {change.improvements.length > 0 ? (
          <ul className="space-y-1 text-xs">
            {change.improvements.map((item, index) => (
              <li key={index} className="text-slate-700">
                {item.stationName ? `【${item.stationName}】` : ''}
                {item.testType} 成功率 {item.previousRate}% → {item.currentRate}%（+{item.change}%）
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-600">无</p>
        )}
      </div>

      <div className="rounded-lg bg-slate-100 p-3">
        <div className="mb-1.5 flex items-center gap-2 text-xs text-slate-800">
          <TrendingDown size={14} />
          回退项
        </div>
        {change.regressions.length > 0 ? (
          <ul className="space-y-1 text-xs">
            {change.regressions.map((item, index) => (
              <li key={index} className="text-slate-700">
                {item.stationName ? `【${item.stationName}】` : ''}
                {item.testType} 成功率 {item.previousRate}% → {item.currentRate}%（{item.change}%）
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-600">无</p>
        )}
      </div>
    </div>
  );
}
