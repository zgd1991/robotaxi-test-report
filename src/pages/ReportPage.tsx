import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Car, Gauge, MapPin, Hash, BookOpen, X, RefreshCw } from 'lucide-react';
import { useReportStore } from '../store/useReportStore';
import { IssueTable } from '../components/IssueTable';
import { VersionComparison } from '../components/VersionComparison';
import { ReportExporter } from '../components/ReportExporter';
import { AnalysisConclusion } from '../components/AnalysisConclusion';

export function ReportPage() {
  const navigate = useNavigate();
  const { report, reset } = useReportStore();
  const [showRules, setShowRules] = useState(false);
  const [version, setVersion] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    if (!report) {
      navigate('/');
    }
  }, [report, navigate]);

  useEffect(() => {
    if (!window.electron) return;

    window.electron.getAppVersion().then((v) => setVersion(v));

    const handleAvailable = () => setUpdateStatus('发现新版本，正在下载...');
    const handleNotAvailable = () => setUpdateStatus('当前已是最新版本');
    const handleDownloaded = () => setUpdateStatus('新版本已下载，请重启安装');
    const handleError = (_event: Event, message: string) => setUpdateStatus('检查失败：' + message);

    window.electron.onUpdateAvailable(handleAvailable);
    window.electron.onUpdateNotAvailable(handleNotAvailable);
    window.electron.onUpdateDownloaded(handleDownloaded);
    window.electron.onUpdateError(handleError);

    return () => {
      window.electron?.removeAllListeners('update-available');
      window.electron?.removeAllListeners('update-not-available');
      window.electron?.removeAllListeners('update-downloaded');
      window.electron?.removeAllListeners('update-error');
    };
  }, []);

  const handleCheckUpdate = () => {
    if (!window.electron) {
      setUpdateStatus('开发模式下不支持检查更新');
      return;
    }
    setUpdateStatus('检查中...');
    window.electron.checkForUpdates().catch((err) => {
      setUpdateStatus('检查失败：' + (err instanceof Error ? err.message : String(err)));
    });
  };

  if (!report) return null;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              reset();
              navigate('/');
            }}
            className="flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft size={14} />
            返回上传
          </button>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              {version && (
                <span className="text-xs text-slate-500">v{version}</span>
              )}
              <button
                type="button"
                onClick={() => setShowRules(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-50 hover:text-slate-900"
              >
                <BookOpen size={14} />
                计算规则
              </button>
              <button
                type="button"
                onClick={handleCheckUpdate}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-50 hover:text-slate-900"
              >
                <RefreshCw size={14} />
                检查更新
              </button>
              <ReportExporter data={report} />
            </div>
            {updateStatus && (
              <span className="text-xs text-slate-500">{updateStatus}</span>
            )}
          </div>
        </div>

        {showRules && <RulesModal onClose={() => setShowRules(false)} />}

        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">测试报告</h2>
          <p className="mt-1 text-xs text-slate-500">
            测试版本：{report.metadata.versions.join('、') || '暂无数据'} · 站点数：{report.metadata.stationCount}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <AnalysisConclusion data={report} />

          <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
            <div className="bg-slate-200 px-4 py-3">
              <h3 className="text-xs font-semibold text-slate-900">测试基本信息</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-5">
              <InfoItem label="测试日期" value={report.metadata.testDate || '—'} icon={<Calendar size={14} />} />
              <InfoItem label="VIN" value={report.metadata.vin || '—'} icon={<Car size={14} />} />
              <InfoItem label="智驾版本号" value={report.metadata.adVersion || '—'} icon={<Gauge size={14} />} />
              <InfoItem label="站点数量" value={String(report.metadata.stationCount)} icon={<MapPin size={14} />} />
              <InfoItem label="单次测试总次数" value={String(report.metadata.totalSessions)} icon={<Hash size={14} />} />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
              <div className="bg-slate-200 px-4 py-3">
                <h3 className="text-xs font-semibold text-slate-900">站点整体通过性</h3>
                <p className="mt-0.5 text-xs text-slate-600">站点整体通过率仅统计已完成4次测试法的站点</p>
              </div>
              <table className="w-full text-left text-xs text-slate-900">
                <thead className="bg-slate-200 text-slate-700">
                  <tr>
                    <th className="px-4 py-2 font-medium">指标</th>
                    <th className="px-4 py-2 font-medium">数值</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-2">完成站点数</td>
                    <td className="px-4 py-2 font-mono-data font-semibold">{report.completedStations}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">通过</td>
                    <td className="px-4 py-2 font-mono-data font-semibold text-emerald-600">{report.stationConclusionStats.passed}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">不通过</td>
                    <td className="px-4 py-2 font-mono-data font-semibold text-rose-600">{report.stationConclusionStats.failed}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">站点不合理</td>
                    <td className="px-4 py-2 font-mono-data font-semibold text-amber-600">{report.stationConclusionStats.unreasonable}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">未完成4次测试法</td>
                    <td className="px-4 py-2 font-mono-data font-semibold">{report.stationConclusionStats.unfinished}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">站点整体通过率</td>
                    <td className="px-4 py-2 font-mono-data font-semibold text-blue-600">{report.stationConclusionStats.passRate}%</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
              <div className="bg-slate-200 px-4 py-3">
                <h3 className="text-xs font-semibold text-slate-900">单次测试统计</h3>
              </div>
              <table className="w-full text-left text-xs text-slate-900">
                <thead className="bg-slate-200 text-slate-700">
                  <tr>
                    <th className="px-4 py-2 font-medium">指标</th>
                    <th className="px-4 py-2 font-medium">数值</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-2">单次测试次数</td>
                    <td className="px-4 py-2 font-mono-data font-semibold">{report.singleTestStats.total}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">通过次数</td>
                    <td className="px-4 py-2 font-mono-data font-semibold text-emerald-600">{report.singleTestStats.passed}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">失败次数</td>
                    <td className="px-4 py-2 font-mono-data font-semibold text-rose-600">{report.singleTestStats.failed}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">单次通过率</td>
                    <td className="px-4 py-2 font-mono-data font-semibold text-blue-600">{report.singleTestStats.rate}%</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
            <div className="bg-slate-200 px-4 py-3">
              <h3 className="text-xs font-semibold text-slate-900">单项能力统计</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
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
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-mono-data text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function CapabilityCard({ title, stats }: { title: string; stats: { total: number; passed: number; failed: number; rate: number } }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800">{title}</span>
        <span className="font-mono-data text-xl font-bold text-slate-900">{stats.rate}%</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-slate-100 p-1.5">
          <div className="text-xs text-slate-600">次数</div>
          <div className="font-mono-data text-sm font-semibold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded-md bg-slate-100 p-1.5">
          <div className="text-xs text-emerald-700">通过</div>
          <div className="font-mono-data text-sm font-semibold text-emerald-700">{stats.passed}</div>
        </div>
        <div className="rounded-md bg-slate-100 p-1.5">
          <div className="text-xs text-rose-700">失败</div>
          <div className="font-mono-data text-sm font-semibold text-rose-700">{stats.failed}</div>
        </div>
      </div>
    </div>
  );
}

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">计算规则说明</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 text-sm text-slate-700">
          <div className="space-y-4">
            <section>
              <h4 className="mb-2 font-semibold text-slate-900">1. 单次测试通过判定</h4>
              <ul className="list-disc space-y-1 pl-5">
                <li>优先读取 singleResult 字段：OK / 通过 / Pass / 成功 → 通过</li>
                <li>singleResult 为空时：进站通过 且 停泊通过 → 通过，否则 → 失败</li>
              </ul>
            </section>

            <section>
              <h4 className="mb-2 font-semibold text-slate-900">2. 站点结论判定（4次测试法）</h4>
              <p className="mb-1">按站点聚合所有会话，优先级如下：</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>任意会话被标记为「站点不合理」→ 站点不合理（优先级最高）</li>
                <li>通过会话数 ≥ 3 → 通过</li>
                <li>失败会话数 ≥ 2 → 不通过</li>
                <li>以上都不满足 → 未完成4次测试法</li>
              </ul>
            </section>

            <section>
              <h4 className="mb-2 font-semibold text-slate-900">3. 站点整体通过率</h4>
              <p className="font-mono text-xs text-slate-600">整体通过率 = 通过站点数 / (通过站点数 + 不通过站点数) × 100%</p>
              <p className="mt-1">站点不合理和未完成4次测试法的站点不计入分母。</p>
            </section>

            <section>
              <h4 className="mb-2 font-semibold text-slate-900">4. 问题统计规则</h4>
              <ul className="list-disc space-y-1 pl-5">
                <li>只统计 result = 失败 且 issueCategory 不为空的记录</li>
                <li>「站点不合理」不纳入问题统计</li>
                <li>进站/停泊/出站标签中，类别为「其他」时，用对应问题描述作为类别</li>
              </ul>
            </section>

            <section>
              <h4 className="mb-2 font-semibold text-slate-900">5. 数据校验</h4>
              <p>单个站点测试次数超过 4 次时，会报错并提示具体站点，需要整理数据后重新生成报告。</p>
            </section>
          </div>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
