import ExcelJS from 'exceljs';
import type { ReportData } from '../types';

const YELLOW_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFC000' },
};

const LIGHT_BLUE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFD6EAF8' },
};

const CENTER_ALIGNMENT: Partial<ExcelJS.Alignment> = {
  horizontal: 'center',
  vertical: 'middle',
  wrapText: true,
};

const LEFT_ALIGNMENT: Partial<ExcelJS.Alignment> = {
  horizontal: 'left',
  vertical: 'middle',
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
    { width: 18 },
    { width: 28 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
  ];

  const completed = data.stationConclusionStats.total;
  const passedStations = data.stationConclusionStats.passed;
  const failedStations = data.stationConclusionStats.failed;
  const passRate = data.stationConclusionStats.passRate;
  const single = data.singleTestStats;
  const entry = data.entryStats;
  const parking = data.parkingStats;
  const exit = data.exitStats;
  const { testDate, vin, adVersion } = data.metadata;

  const typeStats = data.issueStatsByType;

  // Row 1: 标题
  ws.mergeCells('A1:F1');
  const titleCell = ws.getCell('A1');
  titleCell.value = `Robotaxi站点验收报告——智驾版本：${adVersion || '—'}\r\n${testDate || '—'}/车辆vin：${vin || '—'}`;
  titleCell.font = { name: '宋体', size: 22, bold: true };
  titleCell.fill = YELLOW_FILL;
  titleCell.alignment = CENTER_ALIGNMENT;
  ws.getRow(1).height = 48;

  // Row 2-3: 测试结论内容区域
  ws.mergeCells('A2:A3');
  ws.getCell('A2').value = '测试结论';
  ws.getCell('A2').font = { name: '等线', size: 18, bold: true };
  ws.getCell('A2').fill = LIGHT_BLUE_FILL;
  ws.getCell('A2').alignment = CENTER_ALIGNMENT;
  ws.mergeCells('B2:F3');
  ws.getRow(2).height = 28;
  ws.getRow(3).height = 28;

  // Row 4: 测试结果表头
  ws.mergeCells('A4:A9');
  ws.getCell('A4').value = '测试结果';
  ws.getCell('A4').font = { name: '等线', size: 18, bold: true };
  ws.getCell('A4').fill = LIGHT_BLUE_FILL;
  ws.getCell('A4').alignment = CENTER_ALIGNMENT;

  const resultHeaders = ['测试范围', '测试次数', '成功', '失败', '成功率'];
  for (let i = 0; i < resultHeaders.length; i++) {
    const cell = ws.getCell(4, i + 2);
    cell.value = resultHeaders[i];
    cell.font = { name: '等线', size: 16 };
    cell.alignment = CENTER_ALIGNMENT;
    cell.fill = LIGHT_BLUE_FILL;
  }
  ws.getRow(4).height = 28;

  // Rows 5-9: 测试结果数据
  const resultRows = [
    ['整体通过率(4次测试法)', completed, passedStations, failedStations, `${passRate}%`],
    ['单次通过率', single.total, single.passed, single.failed, `${single.rate}%`],
    ['进站成功率', entry.total, entry.passed, entry.failed, `${entry.rate}%`],
    ['停泊成功率', parking.total, parking.passed, parking.failed, `${parking.rate}%`],
    ['出站成功率', exit.total, exit.passed, exit.failed, `${exit.rate}%`],
  ];

  for (let i = 0; i < resultRows.length; i++) {
    const row = resultRows[i];
    for (let j = 0; j < row.length; j++) {
      const cell = ws.getCell(5 + i, j + 2);
      cell.value = row[j];
      cell.font = { name: '等线', size: 14 };
      cell.alignment = CENTER_ALIGNMENT;
    }
    ws.getRow(5 + i).height = 26;
  }

  // Row 10: 问题分布表头
  ws.mergeCells('B10:E10');
  ws.getCell('A10').value = '问题分布';
  ws.getCell('A10').font = { name: '等线', size: 18 };
  ws.getCell('A10').fill = LIGHT_BLUE_FILL;
  ws.getCell('A10').alignment = CENTER_ALIGNMENT;
  ws.getCell('B10').value = '问题描述';
  ws.getCell('B10').font = { name: '等线', size: 16 };
  ws.getCell('B10').alignment = CENTER_ALIGNMENT;
  ws.getCell('B10').fill = LIGHT_BLUE_FILL;
  ws.getCell('F10').value = '次数/占比';
  ws.getCell('F10').font = { name: '等线', size: 16 };
  ws.getCell('F10').alignment = CENTER_ALIGNMENT;
  ws.getCell('F10').fill = LIGHT_BLUE_FILL;
  ws.getRow(10).height = 28;

  // Rows 11-15: 问题分布数据
  // 模板结构：进站 2 行（11-12），停泊 2 行（13-14），出站 1 行（15）
  const issueLayout: { type: '进站' | '停泊' | '出站'; rows: number }[] = [
    { type: '进站', rows: 2 },
    { type: '停泊', rows: 2 },
    { type: '出站', rows: 1 },
  ];

  let currentRow = 11;
  for (const section of issueLayout) {
    const issues = typeStats[section.type] || [];
    const sectionStartRow = currentRow;
    const sectionEndRow = currentRow + section.rows - 1;

    ws.mergeCells(sectionStartRow, 1, sectionEndRow, 1);
    ws.getCell(sectionStartRow, 1).value = section.type;
    ws.getCell(sectionStartRow, 1).font = { name: '等线', size: 16, bold: true };
    ws.getCell(sectionStartRow, 1).fill = LIGHT_BLUE_FILL;
    ws.getCell(sectionStartRow, 1).alignment = CENTER_ALIGNMENT;

    for (let i = 0; i < section.rows; i++) {
      const row = currentRow + i;
      ws.mergeCells(row, 2, row, 5);
      const issue = issues[i];
      if (issue) {
        ws.getCell(row, 2).value = issue.category;
        ws.getCell(row, 6).value = `${issue.count}次/${issue.percentage}%`;
      } else {
        ws.getCell(row, 2).value = '';
        ws.getCell(row, 6).value = '';
      }
      ws.getCell(row, 2).alignment = LEFT_ALIGNMENT;
      ws.getCell(row, 6).alignment = CENTER_ALIGNMENT;
      ws.getRow(row).height = 24;
    }

    currentRow = sectionEndRow + 1;
  }

  // Row 16: 验收标准
  ws.mergeCells('A16:F20');
  const acceptanceText = `验收标准\n1.单个站点验收标准\n  不合理次数       ≥1次       不通过(反馈运营修改站点位置或取消)\n  停车失败次数     ≥2次       不通过(算法优化复测)\n  车成功次数       ≥3次       通  过(具备营运上线条件)`;
  ws.getCell('A16').value = acceptanceText;
  ws.getCell('A16').font = { name: '等线', size: 12 };
  ws.getCell('A16').alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
  ws.getRow(16).height = 110;

  // Apply borders to used range
  for (let row = 1; row <= 20; row++) {
    for (let col = 1; col <= 6; col++) {
      const cell = ws.getCell(row, col);
      cell.border = THIN_BORDER;
    }
  }

  // Sheet 2: 结论清单
  const ws2 = workbook.addWorksheet('结论清单');
  ws2.columns = [
    { width: 14 },
    { width: 28 },
    { width: 14 },
  ];

  // Row 1: 表头
  ws2.getCell('A1').value = '站点序号';
  ws2.getCell('B1').value = '站点名称';
  ws2.getCell('C1').value = '测试结论';
  for (let col = 1; col <= 3; col++) {
    const cell = ws2.getCell(1, col);
    cell.font = { name: '等线', size: 14, bold: true };
    cell.alignment = CENTER_ALIGNMENT;
  }
  ws2.getRow(1).height = 28;

  // Rows 2+: 数据
  data.stationConclusions.forEach((item, index) => {
    const row = index + 2;
    ws2.getCell(row, 1).value = index + 1;
    ws2.getCell(row, 2).value = item.stationName;
    ws2.getCell(row, 3).value = item.conclusion;
    ws2.getCell(row, 1).alignment = CENTER_ALIGNMENT;
    ws2.getCell(row, 2).alignment = CENTER_ALIGNMENT;
    ws2.getCell(row, 3).alignment = CENTER_ALIGNMENT;
    ws2.getRow(row).height = 24;
  });

  // Apply borders to 结论清单
  const lastRow = Math.max(data.stationConclusions.length + 1, 1);
  for (let row = 1; row <= lastRow; row++) {
    for (let col = 1; col <= 3; col++) {
      ws2.getCell(row, col).border = THIN_BORDER;
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
