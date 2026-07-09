import type { ReportData } from '../types';
import { AlertTriangle } from 'lucide-react';

interface IssueTableProps {
  data: ReportData;
}

export function IssueTable({ data }: IssueTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-900">
        <AlertTriangle size={16} className="text-danger" />
        问题分类明细
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-muted">
            <tr>
              <th className="pb-2 font-medium">问题类别</th>
              <th className="pb-2 font-medium">次数</th>
              <th className="pb-2 font-medium">占比</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.issueStats.length > 0 ? (
              data.issueStats.map((issue) => (
                <tr key={issue.category}>
                  <td className="py-2.5 text-slate-900">{issue.category}</td>
                  <td className="py-2.5 font-mono-data text-slate-600">{issue.count}</td>
                  <td className="py-2.5 font-mono-data text-accent">{issue.percentage}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-center text-muted">暂无问题数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
