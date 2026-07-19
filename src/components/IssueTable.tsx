import type { ReportData } from '../types';
import { AlertTriangle } from 'lucide-react';

interface IssueTableProps {
  data: ReportData;
}

export function IssueTable({ data }: IssueTableProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-slate-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-900">
        <AlertTriangle size={14} className="text-slate-600" />
        问题分类明细
      </div>
      <div className="overflow-x-auto rounded-lg bg-slate-100 p-3">
        <table className="w-full text-xs">
          <thead className="border-b border-slate-300 text-left text-slate-600">
            <tr>
              <th className="pb-1.5 font-medium">问题类别</th>
              <th className="pb-1.5 font-medium">次数</th>
              <th className="pb-1.5 font-medium">占比</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.issueStats.length > 0 ? (
              data.issueStats.map((issue) => (
                <tr key={issue.category}>
                  <td className="py-2 text-slate-900">{issue.category}</td>
                  <td className="py-2 font-mono-data text-slate-700">{issue.count}</td>
                  <td className="py-2 font-mono-data text-slate-700">{issue.percentage}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-3 text-center text-slate-500">暂无问题数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
