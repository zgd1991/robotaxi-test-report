import ExcelJS from 'exceljs';
import type { ReportData } from '../types';

const YELLOW_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFC000' },
};

const CENTER_ALIGNMENT: Partial<ExcelJS.Alignment> = {
  horizontal: 'center',
  vertical: 'center',
  wrapText: true,
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } },
};

export async function generateExcelReport(data: ReportData): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('测试报告');

  ws.columns = [
    { width: 14 },
    { width: 28 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ];

  // Row 1: empty
  ws.mergeCells('A1:E1');
  ws.getRow(1).height = 10;

  // Row 2: title
  ws.mergeCells('A2:F2');
  const titleCell = ws.getCell('A2');
  titleCell.value = 'Robotaxi站点验收报告——智驾版本号';
  titleCell.font = { name: '宋体', size: 24, bold: true };
  titleCell.fill = YELLOW_FILL;
  titleCell.alignment = CENTER_ALIGNMENT;
  ws.getRow(2).height = 36;

  // Row 3: metadata
  ws.mergeCells('A3:F3');
  const metaCell = ws.getCell('A3');
  const { testDate, vin, adVersion } = data.metadata;
  metaCell.value = `时间：${testDate || '—'}/车辆vin：${vin || '—'}/智驾版本：${adVersion || '—'}/测试人员：`;
  metaCell.font = { name: '宋体', size: 22, bold: true };
  metaCell.fill = YELLOW_FILL;
  metaCell.alignment = CENTER_ALIGNMENT;
  ws.getRow(3).height = 32;

  // Row 4-5: 测试结论
  ws.mergeCells('A4:A5');
  const conclusionCell = ws.getCell('A4');
  conclusionCell.value = '测试结论';
  conclusionCell.font = { name: '等线', size: 20, bold: true };
  conclusionCell.alignment = CENTER_ALIGNMENT;
  ws.mergeCells('B4:F5');
  ws.getRow(4).height = 28;
  ws.getRow(5).height = 28;

  // Row 6-8: 测试结果
  ws.mergeCells('A6:A8');
  const resultHeaderCell = ws.getCell('A6');
  resultHeaderCell.value = '测试结果';
  resultHeaderCell.font = { name: '等线', size: 20, bold: true };
  resultHeaderCell.alignment = CENTER_ALIGNMENT;

  const headers = ['整体通过率(4次测试法)', '单次通过率', '进站成功率', '停泊成功率', '出站成功率'];
  for (let i = 0; i < headers.length; i++) {
    const cell = ws.getCell(6, 2 + i);
    cell.value = headers[i];
    cell.font = { name: '等线', size: 16, bold: true };
    cell.alignment = CENTER_ALIGNMENT;
  }

  for (let i = 0; i < 5; i++) {
    const countCell = ws.getCell(7, 2 + i);
    countCell.value = '次数/成功率';
    countCell.font = { name: '宋体', size: 16 };
    countCell.alignment = CENTER_ALIGNMENT;

    const detailCell = ws.getCell(8, 2 + i);
    detailCell.value = '成功次数/失败次数';
    detailCell.font = { name: '等线', size: 16 };
    detailCell.alignment = CENTER_ALIGNMENT;
  }
  ws.getRow(6).height = 26;
  ws.getRow(7).height = 24;
  ws.getRow(8).height = 24;

  // Fill data
  const completed = data.stationConclusionStats.total;
  const passedStations = data.stationConclusionStats.passed;
  const failedStations = data.stationConclusionStats.failed;
  const single = data.singleTestStats;
  const entry = data.entryStats;
  const parking = data.parkingStats;
  const exit = data.exitStats;

  // B: 整体通过率
  ws.getCell('B7').value = `${completed}次/${data.stationConclusionStats.passRate}%`;
  ws.getCell('B8').value = `${passedStations}次/${failedStations}次`;

  // C: 单次通过率
  ws.getCell('C7').value = `${single.total}次/${single.rate}%`;
  ws.getCell('C8').value = `${single.passed}次/${single.failed}次`;

  // D: 进站成功率
  ws.getCell('D7').value = `${entry.total}次/${entry.rate}%`;
  ws.getCell('D8').value = `${entry.passed}次/${entry.failed}次`;

  // E: 停泊成功率
  ws.getCell('E7').value = `${parking.total}次/${parking.rate}%`;
  ws.getCell('E8').value = `${parking.passed}次/${parking.failed}次`;

  // F: 出站成功率
  ws.getCell('F7').value = `${exit.total}次/${exit.rate}%`;
  ws.getCell('F8').value = `${exit.passed}次/${exit.failed}次`;

  for (let row = 7; row <= 8; row++) {
    for (let col = 2; col <= 6; col++) {
      const cell = ws.getCell(row, col);
      cell.alignment = CENTER_ALIGNMENT;
    }
  }

  // Row 9: 问题分布 header
  ws.getCell('A9').value = '问题分布';
  ws.getCell('A9').font = { name: '等线', size: 22, bold: true };
  ws.getCell('A9').alignment = CENTER_ALIGNMENT;
  ws.mergeCells('B9:D9');
  ws.getCell('B9').value = '问题描述';
  ws.getCell('B9').font = { name: '等线', size: 22, bold: true };
  ws.getCell('B9').alignment = CENTER_ALIGNMENT;
  ws.getCell('E9').value = '次数/占比';
  ws.getCell('E9').font = { name: '等线', size: 22, bold: true };
  ws.getCell('E9').alignment = CENTER_ALIGNMENT;
  ws.getCell('F9').value = '影响方向';
  ws.getCell('F9').font = { name: '等线', size: 22, bold: true };
  ws.getCell('F9').alignment = CENTER_ALIGNMENT;
  ws.getRow(9).height = 30;

  // Rows 10+: issues by type
  let currentRow = 10;
  const types: ('进站' | '停泊' | '出站')[] = ['进站', '停泊', '出站'];
  const typeStats = data.issueStatsByType;

  for (const type of types) {
    const issues = typeStats[type] || [];
    const sectionRows = Math.max(issues.length, 1);
    const startRow = currentRow;
    const endRow = currentRow + sectionRows - 1;

    ws.mergeCells(startRow, 1, endRow, 1);
    ws.getCell(startRow, 1).value = type;
    ws.getCell(startRow, 1).font = { name: '等线', size: 22, bold: true };
    ws.getCell(startRow, 1).alignment = CENTER_ALIGNMENT;

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      const row = currentRow + i;
      ws.mergeCells(row, 2, row, 4);
      ws.getCell(row, 2).value = issue.category;
      ws.getCell(row, 2).alignment = { horizontal: 'left', vertical: 'center' };
      ws.getCell(row, 5).value = `${issue.count}次/${issue.percentage}%`;
      ws.getCell(row, 5).alignment = CENTER_ALIGNMENT;
      ws.getCell(row, 6).value = '—';
      ws.getCell(row, 6).alignment = CENTER_ALIGNMENT;
      ws.getRow(row).height = 24;
    }

    if (issues.length === 0) {
      ws.mergeCells(currentRow, 2, currentRow, 4);
      ws.getCell(currentRow, 2).value = '暂无问题';
      ws.getCell(currentRow, 2).alignment = { horizontal: 'left', vertical: 'center' };
      ws.getCell(currentRow, 5).value = '—';
      ws.getCell(currentRow, 5).alignment = CENTER_ALIGNMENT;
      ws.getCell(currentRow, 6).value = '—';
      ws.getCell(currentRow, 6).alignment = CENTER_ALIGNMENT;
      ws.getRow(currentRow).height = 24;
    }

    currentRow = endRow + 1;
  }

  // 验收标准 row
  ws.mergeCells(currentRow, 2, currentRow, 6);
  ws.getCell(currentRow, 2).value = '验收标准/';
  ws.getCell(currentRow, 2).font = { name: '等线', size: 20, bold: true };
  ws.getCell(currentRow, 2).alignment = CENTER_ALIGNMENT;
  ws.getRow(currentRow).height = 28;

  // Apply borders to used range
  const lastRow = currentRow;
  for (let row = 1; row <= lastRow; row++) {
    for (let col = 1; col <= 6; col++) {
      const cell = ws.getCell(row, col);
      cell.border = THIN_BORDER;
    }
  }

  const buf = await workbook.xlsx.writeBuffer();
  return buf as ArrayBuffer;
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

export function generateReportFilename(data: ReportData): string {
  const date = data.metadata.testDate || new Date().toISOString().split('T')[0];
  const version = data.metadata.adVersion || data.metadata.versions[0] || 'unknown';
  return `robotaxi-station-report-${date}-${version}.xlsx`.replace(/[\\/:*?"<>|]/g, '_');
}
