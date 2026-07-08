import { useState } from 'react';
import { Download, Check, Copy } from 'lucide-react';
import { generateExcelReport, downloadExcel } from '../utils/reportGenerator';
import type { ReportData } from '../types';

interface ReportExporterProps {
  data: ReportData;
}

export function ReportExporter({ data }: ReportExporterProps) {
  const [copied, setCopied] = useState(false);

  const handleDownloadExcel = () => {
    const content = generateExcelReport(data);
    const filename = `robotaxi-station-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    downloadExcel(content, filename);
  };

  const handleCopy = async () => {
    const tableText = buildCopyText(data);
    await navigator.clipboard.writeText(tableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleDownloadExcel}
        className="flex items-center gap-2 border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
      >
        <Download size={16} />
        导出 Excel
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-2 border border-card px-5 py-2.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} />}
        {copied ? '已复制' : '复制表格'}
      </button>
    </div>
  );
}

function buildCopyText(data: ReportData): string {
  const lines: string[] = [];
  lines.push('Robotaxi 无人车站点测试报告');
  lines.push('');
  lines.push('测试概览');
  lines.push('指标\t数值');
  lines.push(`测试站点数量\t${data.stationCount}`);
  lines.push(`单次测试次数\t${data.totalTests}`);
  lines.push(`单次测试通过\t${data.passedTests}`);
  lines.push(`单次测试失败\t${data.failedTests}`);
  lines.push(`单次测试通过率\t${data.overallPassRate}%`);
  lines.push(`站点整体通过\t${data.stationOverallStats.passed}/${data.stationOverallStats.total}`);
  lines.push(`站点整体通过率\t${data.stationOverallStats.rate}%`);
  lines.push('');
  lines.push('单项能力成功率和次数');
  lines.push('能力项\t测试次数\t通过次数\t失败次数\t成功率');
  lines.push(`进站\t${data.entryStats.total}\t${data.entryStats.passed}\t${data.entryStats.failed}\t${data.entryStats.rate}%`);
  lines.push(`停泊\t${data.parkingStats.total}\t${data.parkingStats.passed}\t${data.parkingStats.failed}\t${data.parkingStats.rate}%`);
  lines.push(`出站\t${data.exitStats.total}\t${data.exitStats.passed}\t${data.exitStats.failed}\t${data.exitStats.rate}%`);
  lines.push('');
  lines.push('问题分类统计');
  lines.push('问题类别\t影响方向\t出现次数\t占比');
  for (const issue of data.issueStats) {
    lines.push(`${issue.category}\t${issue.impact}\t${issue.count}\t${issue.percentage}%`);
  }
  return lines.join('\n');
}
