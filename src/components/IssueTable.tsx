import type { ReportData } from '../types';
import { AlertTriangle } from 'lucide-react';

interface IssueTableProps {
  data: ReportData;
}

export function IssueTable({ data }: IssueTableProps) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-slate-200 p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-900">
        <AlertTriangle size={16} className="text-slate-600" />
        问题分类明细
      </div>
      <div className="overflow-x-auto rounded-xl bg-slate-100 p-4">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-300 text-left text-slate-600">
            <tr>
              <th className="pb-2 font-medium">问题类别</th>
              <th className="pb-2 font-medium">次数</th>
              <th className="pb-2 font-medium">占比</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.issueStats.length > 0 ? (
              data.issueStats.map((issue) => (
                <tr key={issue.category}>
                  <td className="py-2.5 text-slate-900">{issue.category}</td>
                  <td className="py-2.5 font-mono-data text-slate-700">{issue.count}</td>
                  <td className="py-2.5 font-mono-data text-slate-700">{issue.percentage}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-center text-slate-500">暂无问题数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
