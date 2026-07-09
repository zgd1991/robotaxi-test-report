import * as XLSX from 'xlsx';
import type { ReportData } from '../types';

export function generateExcelReport(data: ReportData): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const sheetData: (string | number)[][] = [];
  const merges: XLSX.Range[] = [];

  sheetData.push(['Robotaxi 无人车站点测试报告']);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } });
  sheetData.push(['']);

  // 1. 测试基本信息
  sheetData.push(['测试基本信息']);
  sheetData.push(['指标', '数值']);
  sheetData.push(['测试日期', data.metadata.testDate || '—']);
  sheetData.push(['VIN', data.metadata.vin || '—']);
  sheetData.push(['智驾版本号', data.metadata.adVersion || '—']);
  sheetData.push(['站点数量', data.metadata.stationCount]);
  sheetData.push(['单次测试总次数', data.metadata.totalSessions]);
  sheetData.push(['']);

  // 2. 站点整体通过性
  sheetData.push(['站点整体通过性']);
  sheetData.push(['指标', '数值']);
  sheetData.push(['完成站点数', data.completedStations]);
  sheetData.push(['通过', data.stationConclusionStats.passed]);
  sheetData.push(['不通过', data.stationConclusionStats.failed]);
  sheetData.push(['站点不合理', data.stationConclusionStats.unreasonable]);
  sheetData.push(['未完成', data.stationConclusionStats.unfinished]);
  sheetData.push(['站点整体通过率', `${data.stationConclusionStats.passRate}%`]);
  sheetData.push(['']);

  // 3. 单次测试统计
  sheetData.push(['单次测试统计']);
  sheetData.push(['指标', '数值']);
  sheetData.push(['单次测试次数', data.totalTests]);
  sheetData.push(['通过次数', data.passedTests]);
  sheetData.push(['失败次数', data.failedTests]);
  sheetData.push(['单次测试通过率', `${data.overallPassRate}%`]);
  sheetData.push(['']);

  // 4. 单项能力统计
  sheetData.push(['单项能力统计']);
  sheetData.push(['能力项', '测试次数', '通过次数', '失败次数', '成功率']);
  sheetData.push(['进站', data.entryStats.total, data.entryStats.passed, data.entryStats.failed, `${data.entryStats.rate}%`]);
  sheetData.push(['停泊', data.parkingStats.total, data.parkingStats.passed, data.parkingStats.failed, `${data.parkingStats.rate}%`]);
  sheetData.push(['出站', data.exitStats.total, data.exitStats.passed, data.exitStats.failed, `${data.exitStats.rate}%`]);
  sheetData.push(['']);

  // 5. 问题统计
  sheetData.push(['问题统计']);
  sheetData.push(['问题类别', '出现次数', '占比']);
  if (data.issueStats.length > 0) {
    for (const issue of data.issueStats) {
      sheetData.push([issue.category, issue.count, `${issue.percentage}%`]);
    }
  } else {
    sheetData.push(['暂无问题数据', '', '']);
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

  // 6. 版本信息
  sheetData.push(['版本信息']);
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

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
  ];

  // Merge title cell
  worksheet['!merges'] = merges;

  // Apply basic light theme styling
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellRef];
      if (!cell) continue;
      if (!cell.s) cell.s = {};
      cell.s.font = { name: 'Arial', sz: 11, color: { rgb: '1E293B' } };
      cell.s.alignment = { vertical: 'center' };
    }
  }

  // Style section headers and table headers
  const sectionHeaderRows = [2, 10, 18, 25, 33, 43];
  for (const row of sectionHeaderRows) {
    for (let C = 0; C <= 4; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: C });
      const cell = worksheet[cellRef];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: '0EA5E9' }, sz: 13, name: 'Arial' },
          fill: { fgColor: { rgb: 'E0F2FE' }, patternType: 'solid' },
          alignment: { vertical: 'center' },
        };
      }
    }
  }

  // Style table header rows
  const tableHeaderRows = [3, 11, 19, 26, 34, 44];
  for (const row of tableHeaderRows) {
    for (let C = 0; C <= 4; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: C });
      const cell = worksheet[cellRef];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: '1E293B' }, sz: 11, name: 'Arial' },
          fill: { fgColor: { rgb: 'F1F5F9' }, patternType: 'solid' },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }
    }
  }

  // Style title row
  for (let C = 0; C <= 4; C++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    const cell = worksheet[cellRef];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: '0F172A' }, sz: 16, name: 'Arial' },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }
  }

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
