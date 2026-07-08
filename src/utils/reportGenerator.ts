import * as XLSX from 'xlsx';
import type { ReportData } from '../types';

export function generateExcelReport(data: ReportData): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const sheetData: (string | number)[][] = [];

  sheetData.push(['Robotaxi 无人车站点测试报告']);
  sheetData.push(['']);

  sheetData.push(['测试概览']);
  sheetData.push(['指标', '数值']);
  sheetData.push(['测试站点数量', data.stationCount]);
  sheetData.push(['单次测试次数', data.totalTests]);
  sheetData.push(['单次测试通过', data.passedTests]);
  sheetData.push(['单次测试失败', data.failedTests]);
  sheetData.push(['单次测试通过率', `${data.overallPassRate}%`]);
  sheetData.push(['站点整体通过', `${data.stationOverallStats.passed}/${data.stationOverallStats.total}`]);
  sheetData.push(['站点整体通过率', `${data.stationOverallStats.rate}%`]);
  sheetData.push(['测试版本', data.versions.join('、') || '暂无数据']);
  sheetData.push(['']);

  sheetData.push(['单项能力成功率和次数']);
  sheetData.push(['能力项', '测试次数', '通过次数', '失败次数', '成功率']);
  sheetData.push(['进站', data.entryStats.total, data.entryStats.passed, data.entryStats.failed, `${data.entryStats.rate}%`]);
  sheetData.push(['停泊', data.parkingStats.total, data.parkingStats.passed, data.parkingStats.failed, `${data.parkingStats.rate}%`]);
  sheetData.push(['出站', data.exitStats.total, data.exitStats.passed, data.exitStats.failed, `${data.exitStats.rate}%`]);
  sheetData.push(['']);

  sheetData.push(['问题分类统计']);
  sheetData.push(['问题类别', '影响方向', '出现次数', '占比']);
  if (data.issueStats.length > 0) {
    for (const issue of data.issueStats) {
      sheetData.push([issue.category, issue.impact, issue.count, `${issue.percentage}%`]);
    }
  } else {
    sheetData.push(['暂无问题数据', '', '', '']);
  }
  sheetData.push(['']);

  sheetData.push(['高频问题 TOP3']);
  sheetData.push(['排名', '问题类别', '出现次数', '占比']);
  if (data.topIssues.length > 0) {
    data.topIssues.forEach((issue, index) => {
      sheetData.push([index + 1, issue.category, issue.count, `${issue.percentage}%`]);
    });
  } else {
    sheetData.push(['暂无问题数据', '', '', '']);
  }
  sheetData.push(['']);

  sheetData.push(['版本优化与回退项']);
  if (data.versionChanges.length > 0) {
    for (const change of data.versionChanges) {
      sheetData.push([`${change.previousVersion} → ${change.version}`]);
      sheetData.push(['优化项']);
      sheetData.push(['站点', '测试类型', '之前成功率', '当前成功率', '变化']);
      if (change.improvements.length > 0) {
        for (const item of change.improvements) {
          sheetData.push([item.stationName || '-', item.testType, `${item.previousRate}%`, `${item.currentRate}%`, `+${item.change}%`]);
        }
      } else {
        sheetData.push(['无', '', '', '', '']);
      }
      sheetData.push(['回退项']);
      sheetData.push(['站点', '测试类型', '之前成功率', '当前成功率', '变化']);
      if (change.regressions.length > 0) {
        for (const item of change.regressions) {
          sheetData.push([item.stationName || '-', item.testType, `${item.previousRate}%`, `${item.currentRate}%`, `${item.change}%`]);
        }
      } else {
        sheetData.push(['无', '', '', '', '']);
      }
      sheetData.push(['']);
    }
  } else {
    sheetData.push(['仅有一个版本数据，无法计算版本间优化/回退项。']);
  }
  sheetData.push(['']);

  sheetData.push(['结论与建议']);
  const status = data.overallPassRate >= 80 ? '表现良好' : data.overallPassRate >= 60 ? '仍有优化空间' : '需重点关注';
  sheetData.push(['单次测试通过率', `${data.overallPassRate}%`]);
  sheetData.push(['站点整体通过率', `${data.stationOverallStats.rate}%`]);
  sheetData.push(['评估', status]);
  if (data.topIssues.length > 0) {
    sheetData.push(['优先修复方向', data.topIssues.map((i) => i.category).join('、')]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, '测试报告');

  const buf = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
  return buf;
}

export function downloadExcel(content: ArrayBuffer, filename: string): void {
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
