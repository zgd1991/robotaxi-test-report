import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Car, Gauge, MapPin, Hash } from 'lucide-react';
import { useReportStore } from '../store/useReportStore';
import { ChartsSection } from '../components/ChartsSection';
import { IssueTable } from '../components/IssueTable';
import { VersionComparison } from '../components/VersionComparison';
import { ReportExporter } from '../components/ReportExporter';

export function ReportPage() {
  const navigate = useNavigate();
  const { report } = useReportStore();

  useEffect(() => {
    if (!report) {
      navigate('/');
    }
  }, [report, navigate]);

  if (!report) return null;

  const overallStatus =
    report.stationConclusionStats.passRate >= 80
      ? 'good'
      : report.stationConclusionStats.passRate >= 60
        ? 'warning'
        : 'danger';

  const statusColor = {
    good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  }[overallStatus];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:border-blue-500 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          返回上传
        </button>
        <ReportExporter data={report} />
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">测试报告</h2>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}>
            站点整体通过率 {report.stationConclusionStats.passRate}%
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          测试版本：{report.metadata.versions.join('、') || '暂无数据'} · 站点数：{report.metadata.stationCount}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Gauge size={14} />
              </span>
              测试基本信息
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3 lg:grid-cols-5">
            <InfoItem label="测试日期" value={report.metadata.testDate || '—'} icon={<Calendar size={16} />} color="blue" />
            <InfoItem label="VIN" value={report.metadata.vin || '—'} icon={<Car size={16} />} color="indigo" />
            <InfoItem label="智驾版本号" value={report.metadata.adVersion || '—'} icon={<Gauge size={16} />} color="violet" />
            <InfoItem label="站点数量" value={String(report.metadata.stationCount)} icon={<MapPin size={16} />} color="cyan" />
            <InfoItem label="单次测试总次数" value={String(report.metadata.totalSessions)} icon={<Hash size={16} />} color="teal" />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-50 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-900">站点整体通过性</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 lg:grid-cols-6">
            <StatItem label="完成站点数" value={report.completedStations} suffix="" color="blue" />
            <StatItem label="通过" value={report.stationConclusionStats.passed} suffix="" color="emerald" />
            <StatItem label="不通过" value={report.stationConclusionStats.failed} suffix="" color="rose" />
            <StatItem label="站点不合理" value={report.stationConclusionStats.unreasonable} suffix="" color="amber" />
            <StatItem label="未完成" value={report.stationConclusionStats.unfinished} suffix="" color="slate" />
            <StatItem label="站点整体通过率" value={report.stationConclusionStats.passRate} suffix="%" color="blue" />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-50 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-900">单次测试统计</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 lg:grid-cols-4">
            <StatItem label="单次测试次数" value={report.singleTestStats.total} suffix="" color="blue" />
            <StatItem label="通过次数" value={report.singleTestStats.passed} suffix="" color="emerald" />
            <StatItem label="失败次数" value={report.singleTestStats.failed} suffix="" color="rose" />
            <StatItem label="单次通过率" value={report.singleTestStats.rate} suffix="%" color="blue" />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-50 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-900">单项能力统计</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
            <CapabilityCard title="进站" stats={report.entryStats} color="emerald" />
            <CapabilityCard title="停泊" stats={report.parkingStats} color="blue" />
            <CapabilityCard title="出站" stats={report.exitStats} color="violet" />
          </div>
        </section>

        <ChartsSection data={report} />
        <IssueTable data={report} />
        <VersionComparison data={report} />
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: 'blue' | 'indigo' | 'violet' | 'cyan' | 'teal' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 text-xs font-medium opacity-80">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-mono-data text-lg font-semibold">{value}</div>
    </div>
  );
}

function StatItem({ label, value, suffix, color }: { label: string; value: number; suffix: string; color: 'blue' | 'emerald' | 'rose' | 'amber' | 'slate' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="mt-2 font-mono-data text-2xl font-semibold">
        {value}
        <span className="ml-1 text-lg opacity-80">{suffix}</span>
      </div>
    </div>
  );
}

function CapabilityCard({ title, stats, color }: { title: string; stats: { total: number; passed: number; failed: number; rate: number }; color: 'emerald' | 'blue' | 'violet' }) {
  const colors = {
    emerald: 'border-emerald-200 bg-emerald-50/50',
    blue: 'border-blue-200 bg-blue-50/50',
    violet: 'border-violet-200 bg-violet-50/50',
  };

  const titleColors = {
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    violet: 'text-violet-700',
  };

  return (
    <div className={`rounded-xl border ${colors[color]} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <span className={`text-sm font-semibold ${titleColors[color]}`}>{title}</span>
        <span className="font-mono-data text-2xl font-bold text-slate-900">{stats.rate}%</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white/60 p-2">
          <div className="text-xs text-slate-500">次数</div>
          <div className="font-mono-data font-semibold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded-lg bg-white/60 p-2">
          <div className="text-xs text-emerald-600">通过</div>
          <div className="font-mono-data font-semibold text-emerald-700">{stats.passed}</div>
        </div>
        <div className="rounded-lg bg-white/60 p-2">
          <div className="text-xs text-rose-600">失败</div>
          <div className="font-mono-data font-semibold text-rose-700">{stats.failed}</div>
        </div>
      </div>
    </div>
  );
}
