import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReportStore } from '../store/useReportStore';
import { StatCards } from '../components/StatCards';
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
          className="flex w-fit items-center gap-2 border border-card px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <ArrowLeft size={16} />
          返回上传
        </button>
        <ReportExporter data={report} />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white">测试报告</h2>
        <p className="mt-1 text-sm text-muted">
          测试版本：{report.versions.join('、') || '暂无数据'} · 站点数：{report.stationCount}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <StatCards data={report} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded border border-card bg-card/50 p-5">
            <h3 className="mb-4 text-sm font-medium text-white">单次测试 vs 站点整体</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-card p-4">
                <div className="text-xs text-muted">单次测试通过</div>
                <div className="mt-2 font-mono-data text-2xl font-semibold text-white">
                  {report.singleTestStats.rate}%
                </div>
                <div className="mt-1 text-xs text-muted">
                  {report.singleTestStats.passed}/{report.singleTestStats.total}
                </div>
              </div>
              <div className="border border-card p-4">
                <div className="text-xs text-muted">站点整体通过</div>
                <div className="mt-2 font-mono-data text-2xl font-semibold text-white">
                  {report.stationOverallStats.rate}%
                </div>
                <div className="mt-1 text-xs text-muted">
                  {report.stationOverallStats.passed}/{report.stationOverallStats.total}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded border border-card bg-card/50 p-5">
            <h3 className="mb-4 text-sm font-medium text-white">高频问题 TOP3</h3>
            {report.topIssues.length > 0 ? (
              <ol className="list-decimal space-y-2 pl-4 text-sm text-muted">
                {report.topIssues.map((issue) => (
                  <li key={issue.category}>
                    <span className="text-white">{issue.category}</span>
                    <span className="ml-2 font-mono-data text-accent">{issue.count} 次</span>
                    <span className="ml-2 font-mono-data text-muted">({issue.percentage}%)</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">暂无问题数据</p>
            )}
          </div>
        </div>

        <ChartsSection data={report} />
        <IssueTable data={report} />
        <VersionComparison data={report} />
      </div>
    </div>
  );
}
