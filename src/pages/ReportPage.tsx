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

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          返回上传
        </button>
        <ReportExporter data={report} />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">测试报告</h2>
        <p className="mt-1 text-sm text-slate-500">
          测试版本：{report.metadata.versions.join('、') || '暂无数据'} · 站点数：{report.metadata.stationCount}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-50 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-900">测试基本信息</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3 lg:grid-cols-5">
            <InfoItem label="测试日期" value={report.metadata.testDate || '—'} icon={<Calendar size={16} />} />
            <InfoItem label="VIN" value={report.metadata.vin || '—'} icon={<Car size={16} />} />
            <InfoItem label="智驾版本号" value={report.metadata.adVersion || '—'} icon={<Gauge size={16} />} />
            <InfoItem label="站点数量" value={String(report.metadata.stationCount)} icon={<MapPin size={16} />} />
            <InfoItem label="单次测试总次数" value={String(report.metadata.totalSessions)} icon={<Hash size={16} />} />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-50 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-900">站点整体通过性</h3>
            <p className="mt-1 text-xs text-slate-500">站点整体通过率仅统计已完成4次测试法的站点</p>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 lg:grid-cols-6">
            <StatItem label="完成站点数" value={report.completedStations} suffix="" />
            <StatItem label="通过" value={report.stationConclusionStats.passed} suffix="" valueColor="emerald" />
            <StatItem label="不通过" value={report.stationConclusionStats.failed} suffix="" valueColor="rose" />
            <StatItem label="站点不合理" value={report.stationConclusionStats.unreasonable} suffix="" valueColor="amber" />
            <StatItem label="未完成4次测试法" value={report.stationConclusionStats.unfinished} suffix="" />
            <StatItem label="站点整体通过率" value={report.stationConclusionStats.passRate} suffix="%" valueColor="blue" />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-50 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-900">单次测试统计</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 lg:grid-cols-4">
            <StatItem label="单次测试次数" value={report.singleTestStats.total} suffix="" />
            <StatItem label="通过次数" value={report.singleTestStats.passed} suffix="" valueColor="emerald" />
            <StatItem label="失败次数" value={report.singleTestStats.failed} suffix="" valueColor="rose" />
            <StatItem label="单次通过率" value={report.singleTestStats.rate} suffix="%" valueColor="blue" />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-50 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-900">单项能力统计</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
            <CapabilityCard title="进站" stats={report.entryStats} />
            <CapabilityCard title="停泊" stats={report.parkingStats} />
            <CapabilityCard title="出站" stats={report.exitStats} />
          </div>
        </section>

        <ChartsSection data={report} />
        <IssueTable data={report} />
        <VersionComparison data={report} />
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-mono-data text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function StatItem({ label, value, suffix, valueColor = 'slate' }: { label: string; value: number; suffix: string; valueColor?: 'slate' | 'emerald' | 'rose' | 'amber' | 'blue' }) {
  const valueColors = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className={`mt-2 font-mono-data text-2xl font-semibold ${valueColors[valueColor]}`}>
        {value}
        <span className="ml-1 text-lg opacity-80">{suffix}</span>
      </div>
    </div>
  );
}

function CapabilityCard({ title, stats }: { title: string; stats: { total: number; passed: number; failed: number; rate: number } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        <span className="font-mono-data text-2xl font-bold text-slate-900">{stats.rate}%</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white p-2">
          <div className="text-xs text-slate-500">次数</div>
          <div className="font-mono-data font-semibold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded-lg bg-white p-2">
          <div className="text-xs text-emerald-600">通过</div>
          <div className="font-mono-data font-semibold text-emerald-600">{stats.passed}</div>
        </div>
        <div className="rounded-lg bg-white p-2">
          <div className="text-xs text-rose-600">失败</div>
          <div className="font-mono-data font-semibold text-rose-600">{stats.failed}</div>
        </div>
      </div>
    </div>
  );
}
