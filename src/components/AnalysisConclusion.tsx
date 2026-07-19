import { Lightbulb, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import type { ReportData } from '../types';
import { analyzeReport } from '../utils/analyzeReport';

interface AnalysisConclusionProps {
  data: ReportData;
}

export function AnalysisConclusion({ data }: AnalysisConclusionProps) {
  const analysis = analyzeReport(data);

  return (
    <div className="rounded-xl border border-slate-300 bg-slate-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-900">
        <Lightbulb size={14} className="text-amber-600" />
        分析结论
      </div>

      <div className="rounded-lg bg-white p-4 text-xs leading-relaxed text-slate-800 shadow-sm">
        <p className="font-medium text-slate-900">{analysis.summary}</p>

        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnalysisSection
            icon={<AlertCircle size={14} className="text-rose-600" />}
            title="薄弱环节"
            items={analysis.weakPoints}
          />
          <AnalysisSection
            icon={<TrendingUp size={14} className="text-blue-600" />}
            title="主要问题"
            items={analysis.topIssues}
          />
        </div>

        {analysis.versionSummary && (
          <div className="mt-3 rounded-md bg-slate-50 p-2.5 text-slate-700">
            <span className="font-medium text-slate-900">版本对比：</span>
            {analysis.versionSummary}
          </div>
        )}

        <AnalysisSection
          icon={<CheckCircle size={14} className="text-emerald-600" />}
          title="优化建议"
          items={analysis.recommendations}
          className="mt-3"
        />
      </div>
    </div>
  );
}

interface AnalysisSectionProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
  className?: string;
}

function AnalysisSection({ icon, title, items, className }: AnalysisSectionProps) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center gap-1.5 font-medium text-slate-900">
        {icon}
        {title}
      </div>
      <ul className="space-y-1 text-slate-700">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-1.5">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
