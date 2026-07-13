import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Car, Gauge, MapPin, Hash } from 'lucide-react';
import { useReportStore } from '../store/useReportStore';
import { IssueTable } from '../components/IssueTable';
import { VersionComparison } from '../components/VersionComparison';
import { ReportExporter } from '../components/ReportExporter';

export function ReportPage() {
  const navigate = useNavigate();
  const { report, reset } = useReportStore();

  useEffect(() => {
    if (!report) {
      navigate('/');
    }
  }, [report, navigate]);

  if (!report) return null;

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              reset();
              navigate('/');
            }}
            className="flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-50 hover:text-slate-900"
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
          <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
            <div className="bg-slate-200 px-6 py-4">
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
              <div className="bg-slate-200 px-6 py-4">
                <h3 className="text-sm font-semibold text-slate-900">站点整体通过性</h3>
                <p className="mt-1 text-xs text-slate-600">站点整体通过率仅统计已完成4次测试法的站点</p>
              </div>
              <table className="w-full text-left text-sm text-slate-900">
                <thead className="bg-slate-200 text-slate-700">
                  <tr>
                    <th className="px-6 py-3 font-medium">指标</th>
                    <th className="px-6 py-3 font-medium">数值</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-6 py-3">完成站点数</td>
                    <td className="px-6 py-3 font-mono-data font-semibold">{report.completedStations}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3">通过</td>
                    <td className="px-6 py-3 font-mono-data font-semibold text-emerald-600">{report.stationConclusionStats.passed}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3">不通过</td>
                    <td className="px-6 py-3 font-mono-data font-semibold text-rose-600">{report.stationConclusionStats.failed}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3">站点不合理</td>
                    <td className="px-6 py-3 font-mono-data font-semibold text-amber-600">{report.stationConclusionStats.unreasonable}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3">未完成4次测试法</td>
                    <td className="px-6 py-3 font-mono-data font-semibold">{report.stationConclusionStats.unfinished}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3">站点整体通过率</td>
                    <td className="px-6 py-3 font-mono-data font-semibold text-blue-600">{report.stationConclusionStats.passRate}%</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
              <div className="bg-slate-200 px-6 py-4">
                <h3 className="text-sm font-semibold text-slate-900">单次测试统计</h3>
              </div>
              <table className="w-full text-left text-sm text-slate-900">
                <thead className="bg-slate-200 text-slate-700">
                  <tr>
                    <th className="px-6 py-3 font-medium">指标</th>
                    <th className="px-6 py-3 font-medium">数值</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-6 py-3">单次测试次数</td>
                    <td className="px-6 py-3 font-mono-data font-semibold">{report.singleTestStats.total}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3">通过次数</td>
                    <td className="px-6 py-3 font-mono-data font-semibold text-emerald-600">{report.singleTestStats.passed}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3">失败次数</td>
                    <td className="px-6 py-3 font-mono-data font-semibold text-rose-600">{report.singleTestStats.failed}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3">单次通过率</td>
                    <td className="px-6 py-3 font-mono-data font-semibold text-blue-600">{report.singleTestStats.rate}%</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
            <div className="bg-slate-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-900">单项能力统计</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              <CapabilityCard title="进站" stats={report.entryStats} />
              <CapabilityCard title="停泊" stats={report.parkingStats} />
              <CapabilityCard title="出站" stats={report.exitStats} />
            </div>
          </section>

          <IssueTable data={report} />
          <VersionComparison data={report} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-mono-data text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function CapabilityCard({ title, stats }: { title: string; stats: { total: number; passed: number; failed: number; rate: number } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        <span className="font-mono-data text-2xl font-bold text-slate-900">{stats.rate}%</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-slate-100 p-2">
          <div className="text-xs text-slate-600">次数</div>
          <div className="font-mono-data font-semibold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-2">
          <div className="text-xs text-emerald-700">通过</div>
          <div className="font-mono-data font-semibold text-emerald-700">{stats.passed}</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-2">
          <div className="text-xs text-rose-700">失败</div>
          <div className="font-mono-data font-semibold text-rose-700">{stats.failed}</div>
        </div>
      </div>
    </div>
  );
}
