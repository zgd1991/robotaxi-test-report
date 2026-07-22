import ExcelJS from 'exceljs';
import type { ReportData } from '../types';
import { analyzeReport } from './analyzeReport';

const DARK_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };
const SECTION_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F0FA' } };
const SUBTITLE_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
const EVEN_ROW_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
const WHITE_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

const WHITE_FONT: Partial<ExcelJS.Font> = { name: '微软雅黑', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
const SUBTITLE_FONT: Partial<ExcelJS.Font> = { name: '微软雅黑', size: 11, color: { argb: 'FF666666' } };
const DARK_FONT: Partial<ExcelJS.Font> = { name: '微软雅黑', size: 11, color: { argb: 'FF333333' } };
const BLUE_FONT: Partial<ExcelJS.Font> = { name: '微软雅黑', size: 11, color: { argb: 'FF0066CC' } };
const HEADER_FONT: Partial<ExcelJS.Font> = { name: '微软雅黑', size: 12, bold: true, color: { argb: 'FF333333' } };

const CENTER: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle', wrapText: true };
const LEFT: Partial<ExcelJS.Alignment> = { horizontal: 'left', vertical: 'middle', wrapText: true };

const NO_BORDER: Partial<ExcelJS.Borders> = {};

export async function generateExcelReport(data: ReportData): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const analysis = analyzeReport(data);

  const ws = workbook.addWorksheet('测试报告');
  ws.columns = [
    { width: 3 },   // A
    { width: 18 },  // B
    { width: 14 },  // C
    { width: 22 },  // D
    { width: 14 },  // E
    { width: 14 },  // F
    { width: 14 },  // G
    { width: 14 },  // H
  ];

  let currentRow = 2;

  // ===== Title =====
  ws.mergeCells(currentRow, 2, currentRow, 7);
  const titleCell = ws.getCell(currentRow, 2);
  titleCell.value = 'Robotaxi 站点验收报告';
  titleCell.font = WHITE_FONT;
  titleCell.fill = DARK_FILL;
  titleCell.alignment = CENTER;
  ws.getRow(currentRow).height = 40;
  currentRow++;

  // ===== Subtitle =====
  ws.mergeCells(currentRow, 2, currentRow, 7);
  const subtitleCell = ws.getCell(currentRow, 2);
  subtitleCell.value = `智驾版本：${data.metadata.adVersion || '—'}　｜　验收日期：${data.metadata.testDate || '—'}　｜　车辆 VIN：${data.metadata.vin || '—'}`;
  subtitleCell.font = SUBTITLE_FONT;
  subtitleCell.fill = SUBTITLE_FILL;
  subtitleCell.alignment = CENTER;
  ws.getRow(currentRow).height = 24;
  currentRow += 2; // blank row separator

  // ===== 测试结论 =====
  const conclusionStart = currentRow;
  const conclusionEnd = currentRow + 2;
  ws.mergeCells(conclusionStart, 2, conclusionEnd, 2);
  ws.getCell(conclusionStart, 2).value = '测试结论';
  ws.getCell(conclusionStart, 2).font = HEADER_FONT;
  ws.getCell(conclusionStart, 2).fill = SECTION_FILL;
  ws.getCell(conclusionStart, 2).alignment = CENTER;

  ws.mergeCells(conclusionStart, 3, conclusionEnd, 7);
  const conclusionText = [
    analysis.summary,
    '薄弱环节：' + analysis.weakPoints.join('；'),
    '主要问题：' + analysis.topIssues.join('；'),
    analysis.versionSummary ? '版本对比：' + analysis.versionSummary : '',
    '优化建议：' + analysis.recommendations.join('；'),
  ]
    .filter(Boolean)
    .join('\n');
  ws.getCell(conclusionStart, 3).value = conclusionText;
  ws.getCell(conclusionStart, 3).font = DARK_FONT;
  ws.getCell(conclusionStart, 3).alignment = LEFT;
  ws.getRow(conclusionStart).height = 40;
  ws.getRow(conclusionStart + 1).height = 40;
  ws.getRow(conclusionEnd).height = 40;
  currentRow = conclusionEnd + 2; // blank row separator

  // ===== 测试结果 =====
  const resultHeaderRow = currentRow;
  const resultStartRow = currentRow + 1;
  const resultEndRow = resultStartRow + 5;
  ws.mergeCells(resultHeaderRow, 2, resultEndRow, 2);
  ws.getCell(resultHeaderRow, 2).value = '测试结果';
  ws.getCell(resultHeaderRow, 2).font = HEADER_FONT;
  ws.getCell(resultHeaderRow, 2).fill = SECTION_FILL;
  ws.getCell(resultHeaderRow, 2).alignment = CENTER;

  const resultHeaders = ['测试范围', '测试次数', '成功', '失败', '成功率'];
  resultHeaders.forEach((h, i) => {
    const cell = ws.getCell(resultHeaderRow, i + 3);
    cell.value = h;
    cell.font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = DARK_FILL;
    cell.alignment = CENTER;
  });
  ws.getRow(resultHeaderRow).height = 28;

  const resultRows = [
    ['整体通过率（4次测试法）', data.stationConclusionStats.total, data.stationConclusionStats.passed, data.stationConclusionStats.failed],
    ['单次通过率', data.singleTestStats.total, data.singleTestStats.passed, data.singleTestStats.failed],
    ['进站成功率', data.entryStats.total, data.entryStats.passed, data.entryStats.failed],
    ['停泊成功率', data.parkingStats.total, data.parkingStats.passed, data.parkingStats.failed],
    ['出站成功率', data.exitStats.total, data.exitStats.passed, data.exitStats.failed],
    ['站点不合理', data.stationConclusionStats.unreasonable, '-', '-', '-'],
  ];
  resultRows.forEach((row, i) => {
    const rowNum = resultStartRow + i;
    const isEven = i % 2 === 0;
    const fill = isEven ? WHITE_FILL : EVEN_ROW_FILL;

    ws.getCell(rowNum, 3).value = row[0];
    ws.getCell(rowNum, 3).font = BLUE_FONT;
    ws.getCell(rowNum, 3).alignment = LEFT;
    ws.getCell(rowNum, 3).fill = fill;

    for (let j = 1; j <= 3; j++) {
      const cell = ws.getCell(rowNum, j + 3);
      cell.value = row[j];
      cell.font = BLUE_FONT;
      cell.alignment = CENTER;
      cell.fill = fill;
    }

    const rateCell = ws.getCell(rowNum, 7);
    if (row[0] === '站点不合理') {
      rateCell.value = '-';
      rateCell.font = { name: '微软雅黑', size: 11, color: { argb: 'FF666666' } };
      rateCell.alignment = CENTER;
      rateCell.fill = fill;
    } else {
      rateCell.value = { formula: `E${rowNum}/D${rowNum}` };
      rateCell.numFmt = '0.0%';
      rateCell.font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FF000000' } };
      rateCell.alignment = CENTER;
      rateCell.fill = fill;
    }

    ws.getRow(rowNum).height = 24;
  });
  currentRow = resultEndRow + 2; // blank row separator

  // ===== 问题分布 =====
  const issueHeaderRow = currentRow;
  const issueStartRow = currentRow + 1;
  const directions: ('进站' | '停泊' | '出站')[] = ['进站', '停泊', '出站'];
  const totalIssueCount = directions.reduce(
    (sum, dir) => sum + (data.issueStatsByType[dir]?.length || 0),
    0
  );
  const issueTotalRow = issueStartRow + totalIssueCount;

  let issueRowNum = issueStartRow;
  directions.forEach((dir) => {
    const issues = data.issueStatsByType[dir] || [];
    issues.forEach((issue, index) => {
      const isEven = (issueRowNum - issueStartRow) % 2 === 0;
      const rowFill = isEven ? WHITE_FILL : EVEN_ROW_FILL;

      // Direction label (only first row of each direction), with light background
      ws.getCell(issueRowNum, 3).value = index === 0 ? dir : '';
      ws.getCell(issueRowNum, 3).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FF333333' } };
      ws.getCell(issueRowNum, 3).alignment = CENTER;
      ws.getCell(issueRowNum, 3).fill = index === 0 ? SECTION_FILL : rowFill;

      // Issue description merged across D-E
      ws.mergeCells(issueRowNum, 4, issueRowNum, 5);
      ws.getCell(issueRowNum, 4).value = issue.category;
      ws.getCell(issueRowNum, 4).font = BLUE_FONT;
      ws.getCell(issueRowNum, 4).alignment = LEFT;
      ws.getCell(issueRowNum, 4).fill = rowFill;
      ws.getCell(issueRowNum, 5).fill = rowFill;

      // Count
      ws.getCell(issueRowNum, 6).value = issue.count;
      ws.getCell(issueRowNum, 6).font = BLUE_FONT;
      ws.getCell(issueRowNum, 6).alignment = CENTER;
      ws.getCell(issueRowNum, 6).fill = rowFill;

      // Percentage
      const pctCell = ws.getCell(issueRowNum, 7);
      pctCell.value = { formula: `F${issueRowNum}/$F$${issueTotalRow}` };
      pctCell.numFmt = '0.0%';
      pctCell.font = { name: '微软雅黑', size: 11, color: { argb: 'FF000000' } };
      pctCell.alignment = CENTER;
      pctCell.fill = rowFill;

      ws.getRow(issueRowNum).height = 22;
      issueRowNum++;
    });
  });

  const totalFill = (issueTotalRow - issueStartRow) % 2 === 0 ? WHITE_FILL : EVEN_ROW_FILL;
  ws.getCell(issueTotalRow, 3).value = '';
  ws.getCell(issueTotalRow, 3).fill = totalFill;

  ws.mergeCells(issueTotalRow, 4, issueTotalRow, 5);
  ws.getCell(issueTotalRow, 4).value = '合计';
  ws.getCell(issueTotalRow, 4).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FF333333' } };
  ws.getCell(issueTotalRow, 4).alignment = CENTER;
  ws.getCell(issueTotalRow, 4).fill = totalFill;
  ws.getCell(issueTotalRow, 5).fill = totalFill;

  ws.getCell(issueTotalRow, 6).value = { formula: `SUM(F${issueStartRow}:F${issueTotalRow - 1})` };
  ws.getCell(issueTotalRow, 6).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FF000000' } };
  ws.getCell(issueTotalRow, 6).alignment = CENTER;
  ws.getCell(issueTotalRow, 6).fill = totalFill;

  ws.getCell(issueTotalRow, 7).value = { formula: `F${issueTotalRow}/$F$${issueTotalRow}` };
  ws.getCell(issueTotalRow, 7).numFmt = '0.0%';
  ws.getCell(issueTotalRow, 7).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FF000000' } };
  ws.getCell(issueTotalRow, 7).alignment = CENTER;
  ws.getCell(issueTotalRow, 7).fill = totalFill;

  ws.getRow(issueTotalRow).height = 22;

  // Section header vertical merge
  ws.mergeCells(issueHeaderRow, 2, issueTotalRow - 1, 2);
  ws.getCell(issueHeaderRow, 2).value = '问题分布';
  ws.getCell(issueHeaderRow, 2).font = HEADER_FONT;
  ws.getCell(issueHeaderRow, 2).fill = SECTION_FILL;
  ws.getCell(issueHeaderRow, 2).alignment = CENTER;

  // Issue table headers
  ws.getCell(issueHeaderRow, 3).value = '分类';
  ws.getCell(issueHeaderRow, 3).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(issueHeaderRow, 3).fill = DARK_FILL;
  ws.getCell(issueHeaderRow, 3).alignment = CENTER;

  ws.mergeCells(issueHeaderRow, 4, issueHeaderRow, 5);
  ws.getCell(issueHeaderRow, 4).value = '问题描述';
  ws.getCell(issueHeaderRow, 4).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(issueHeaderRow, 4).fill = DARK_FILL;
  ws.getCell(issueHeaderRow, 4).alignment = CENTER;
  ws.getCell(issueHeaderRow, 5).fill = DARK_FILL;

  ws.getCell(issueHeaderRow, 6).value = '次数（次）';
  ws.getCell(issueHeaderRow, 6).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(issueHeaderRow, 6).fill = DARK_FILL;
  ws.getCell(issueHeaderRow, 6).alignment = CENTER;

  ws.getCell(issueHeaderRow, 7).value = '占比';
  ws.getCell(issueHeaderRow, 7).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(issueHeaderRow, 7).fill = DARK_FILL;
  ws.getCell(issueHeaderRow, 7).alignment = CENTER;
  ws.getRow(issueHeaderRow).height = 28;

  currentRow = issueTotalRow + 2; // blank row separator

  // ===== 验收标准 =====
  const stdHeaderRow = currentRow;
  const stdBodyEnd = stdHeaderRow + 4;
  ws.mergeCells(stdHeaderRow, 2, stdBodyEnd, 2);
  ws.getCell(stdHeaderRow, 2).value = '验收标准';
  ws.getCell(stdHeaderRow, 2).font = HEADER_FONT;
  ws.getCell(stdHeaderRow, 2).fill = SECTION_FILL;
  ws.getCell(stdHeaderRow, 2).alignment = CENTER;

  const acceptanceText = `单个站点验收标准：
· 不合理次数 ≥ 1 次 → 不通过（反馈运营修改站点位置或取消）
· 失败次数 ≥ 2 次 → 不通过
· 成功次数 ≥ 3 次 → 通过
· 其他情况 → 未完成（需补充测试）`;
  ws.mergeCells(stdHeaderRow, 3, stdBodyEnd, 7);
  ws.getCell(stdHeaderRow, 3).value = acceptanceText;
  ws.getCell(stdHeaderRow, 3).font = DARK_FONT;
  ws.getCell(stdHeaderRow, 3).alignment = LEFT;
  ws.getRow(stdHeaderRow).height = 22;
  ws.getRow(stdHeaderRow + 1).height = 22;
  ws.getRow(stdHeaderRow + 2).height = 22;
  ws.getRow(stdHeaderRow + 3).height = 22;
  ws.getRow(stdHeaderRow + 4).height = 22;

  const lastRow = stdBodyEnd;

  // Clear borders for all cells
  for (let row = 1; row <= lastRow; row++) {
    for (let col = 1; col <= 8; col++) {
      ws.getCell(row, col).border = NO_BORDER;
    }
  }

  // ===== Conditional formatting: data bars =====
  // Success rate bars in 测试结果 (column G)
  ws.addConditionalFormatting({
    ref: `G${resultStartRow}:G${resultEndRow}`,
    rules: [
      {
        type: 'dataBar',
        color: { argb: 'FF5DADE2' },
        cfvo: [
          { type: 'num', value: 0 },
          { type: 'num', value: 1 },
        ],
      } as any,
    ],
  });

  // Count bars in 问题分布 (column F)
  ws.addConditionalFormatting({
    ref: `F${issueStartRow}:F${issueTotalRow - 1}`,
    rules: [
      {
        type: 'dataBar',
        color: { argb: 'FF5DADE2' },
        cfvo: [
          { type: 'min' },
          { type: 'max' },
        ],
      } as any,
    ],
  });

  ws.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  // ===== Station Stats Sheet =====
  buildStationStatsSheet(workbook, data);

  const buf = await workbook.xlsx.writeBuffer();
  return buf as ArrayBuffer;
}

function buildStationStatsSheet(workbook: ExcelJS.Workbook, data: ReportData) {
  const ws = workbook.addWorksheet('站点统计');
  ws.columns = [
    { width: 3 },   // A
    { width: 18 },  // B
    { width: 50 },  // C
    { width: 60 },  // D
  ];

  let currentRow = 2;

  // Title
  ws.mergeCells(currentRow, 2, currentRow, 4);
  const titleCell = ws.getCell(currentRow, 2);
  titleCell.value = '站点统计';
  titleCell.font = WHITE_FONT;
  titleCell.fill = DARK_FILL;
  titleCell.alignment = CENTER;
  ws.getRow(currentRow).height = 40;
  currentRow += 2;

  // ===== 通过站点 =====
  const passed = data.stationDetails.passed;
  ws.mergeCells(currentRow, 2, currentRow, 4);
  ws.getCell(currentRow, 2).value = `通过站点（${passed.length}个）`;
  ws.getCell(currentRow, 2).font = HEADER_FONT;
  ws.getCell(currentRow, 2).fill = SECTION_FILL;
  ws.getCell(currentRow, 2).alignment = CENTER;
  ws.getRow(currentRow).height = 28;
  currentRow++;

  ws.getCell(currentRow, 2).value = '序号';
  ws.getCell(currentRow, 3).value = '站点名称';
  ws.getCell(currentRow, 2).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 3).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 2).fill = DARK_FILL;
  ws.getCell(currentRow, 3).fill = DARK_FILL;
  ws.getCell(currentRow, 2).alignment = CENTER;
  ws.getCell(currentRow, 3).alignment = CENTER;
  ws.getRow(currentRow).height = 24;
  currentRow++;

  passed.forEach((item, index) => {
    const rowNum = currentRow + index;
    const fill = index % 2 === 0 ? WHITE_FILL : EVEN_ROW_FILL;
    ws.getCell(rowNum, 2).value = index + 1;
    ws.getCell(rowNum, 3).value = item.stationName;
    ws.getCell(rowNum, 2).font = DARK_FONT;
    ws.getCell(rowNum, 3).font = DARK_FONT;
    ws.getCell(rowNum, 2).alignment = CENTER;
    ws.getCell(rowNum, 3).alignment = LEFT;
    ws.getCell(rowNum, 2).fill = fill;
    ws.getCell(rowNum, 3).fill = fill;
    ws.getRow(rowNum).height = 22;
  });
  currentRow += passed.length + 1;

  // ===== 不通过站点 =====
  const failed = data.stationDetails.failed;
  ws.mergeCells(currentRow, 2, currentRow, 4);
  ws.getCell(currentRow, 2).value = `不通过站点（${failed.length}个）`;
  ws.getCell(currentRow, 2).font = HEADER_FONT;
  ws.getCell(currentRow, 2).fill = SECTION_FILL;
  ws.getCell(currentRow, 2).alignment = CENTER;
  ws.getRow(currentRow).height = 28;
  currentRow++;

  ws.getCell(currentRow, 2).value = '序号';
  ws.getCell(currentRow, 3).value = '站点名称';
  ws.getCell(currentRow, 4).value = '失败原因';
  ws.getCell(currentRow, 2).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 3).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 4).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 2).fill = DARK_FILL;
  ws.getCell(currentRow, 3).fill = DARK_FILL;
  ws.getCell(currentRow, 4).fill = DARK_FILL;
  ws.getCell(currentRow, 2).alignment = CENTER;
  ws.getCell(currentRow, 3).alignment = CENTER;
  ws.getCell(currentRow, 4).alignment = CENTER;
  ws.getRow(currentRow).height = 24;
  currentRow++;

  failed.forEach((item, index) => {
    const rowNum = currentRow + index;
    const fill = index % 2 === 0 ? WHITE_FILL : EVEN_ROW_FILL;
    ws.getCell(rowNum, 2).value = index + 1;
    ws.getCell(rowNum, 3).value = item.stationName;
    ws.getCell(rowNum, 4).value = item.reason;
    ws.getCell(rowNum, 2).font = DARK_FONT;
    ws.getCell(rowNum, 3).font = DARK_FONT;
    ws.getCell(rowNum, 4).font = DARK_FONT;
    ws.getCell(rowNum, 2).alignment = CENTER;
    ws.getCell(rowNum, 3).alignment = LEFT;
    ws.getCell(rowNum, 4).alignment = LEFT;
    ws.getCell(rowNum, 2).fill = fill;
    ws.getCell(rowNum, 3).fill = fill;
    ws.getCell(rowNum, 4).fill = fill;
    ws.getRow(rowNum).height = 22;
  });
  currentRow += failed.length + 1;

  // ===== 站点不合理 =====
  const unreasonable = data.stationDetails.unreasonable;
  ws.mergeCells(currentRow, 2, currentRow, 4);
  ws.getCell(currentRow, 2).value = `站点不合理（${unreasonable.length}个）`;
  ws.getCell(currentRow, 2).font = HEADER_FONT;
  ws.getCell(currentRow, 2).fill = SECTION_FILL;
  ws.getCell(currentRow, 2).alignment = CENTER;
  ws.getRow(currentRow).height = 28;
  currentRow++;

  ws.getCell(currentRow, 2).value = '序号';
  ws.getCell(currentRow, 3).value = '站点名称';
  ws.getCell(currentRow, 4).value = '不合理原因';
  ws.getCell(currentRow, 2).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 3).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 4).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 2).fill = DARK_FILL;
  ws.getCell(currentRow, 3).fill = DARK_FILL;
  ws.getCell(currentRow, 4).fill = DARK_FILL;
  ws.getCell(currentRow, 2).alignment = CENTER;
  ws.getCell(currentRow, 3).alignment = CENTER;
  ws.getCell(currentRow, 4).alignment = CENTER;
  ws.getRow(currentRow).height = 24;
  currentRow++;

  unreasonable.forEach((item, index) => {
    const rowNum = currentRow + index;
    const fill = index % 2 === 0 ? WHITE_FILL : EVEN_ROW_FILL;
    ws.getCell(rowNum, 2).value = index + 1;
    ws.getCell(rowNum, 3).value = item.stationName;
    ws.getCell(rowNum, 4).value = item.reason;
    ws.getCell(rowNum, 2).font = DARK_FONT;
    ws.getCell(rowNum, 3).font = DARK_FONT;
    ws.getCell(rowNum, 4).font = DARK_FONT;
    ws.getCell(rowNum, 2).alignment = CENTER;
    ws.getCell(rowNum, 3).alignment = LEFT;
    ws.getCell(rowNum, 4).alignment = LEFT;
    ws.getCell(rowNum, 2).fill = fill;
    ws.getCell(rowNum, 3).fill = fill;
    ws.getCell(rowNum, 4).fill = fill;
    ws.getRow(rowNum).height = 22;
  });
  currentRow += unreasonable.length + 1;

  // ===== 未完成4次测试法站点 =====
  const unfinished = data.stationDetails.unfinished;
  ws.mergeCells(currentRow, 2, currentRow, 4);
  ws.getCell(currentRow, 2).value = `未完成4次测试法站点（${unfinished.length}个）`;
  ws.getCell(currentRow, 2).font = HEADER_FONT;
  ws.getCell(currentRow, 2).fill = SECTION_FILL;
  ws.getCell(currentRow, 2).alignment = CENTER;
  ws.getRow(currentRow).height = 28;
  currentRow++;

  ws.getCell(currentRow, 2).value = '序号';
  ws.getCell(currentRow, 3).value = '站点名称';
  ws.getCell(currentRow, 4).value = '说明';
  ws.getCell(currentRow, 2).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 3).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 4).font = { name: '微软雅黑', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(currentRow, 2).fill = DARK_FILL;
  ws.getCell(currentRow, 3).fill = DARK_FILL;
  ws.getCell(currentRow, 4).fill = DARK_FILL;
  ws.getCell(currentRow, 2).alignment = CENTER;
  ws.getCell(currentRow, 3).alignment = CENTER;
  ws.getCell(currentRow, 4).alignment = CENTER;
  ws.getRow(currentRow).height = 24;
  currentRow++;

  unfinished.forEach((item, index) => {
    const rowNum = currentRow + index;
    const fill = index % 2 === 0 ? WHITE_FILL : EVEN_ROW_FILL;
    ws.getCell(rowNum, 2).value = index + 1;
    ws.getCell(rowNum, 3).value = item.stationName;
    ws.getCell(rowNum, 4).value = item.reason;
    ws.getCell(rowNum, 2).font = DARK_FONT;
    ws.getCell(rowNum, 3).font = DARK_FONT;
    ws.getCell(rowNum, 4).font = DARK_FONT;
    ws.getCell(rowNum, 2).alignment = CENTER;
    ws.getCell(rowNum, 3).alignment = LEFT;
    ws.getCell(rowNum, 4).alignment = LEFT;
    ws.getCell(rowNum, 2).fill = fill;
    ws.getCell(rowNum, 3).fill = fill;
    ws.getCell(rowNum, 4).fill = fill;
    ws.getRow(rowNum).height = 22;
  });
  currentRow += unfinished.length;

  // Clear borders
  const lastRow = currentRow;
  for (let row = 1; row <= lastRow; row++) {
    for (let col = 1; col <= 4; col++) {
      ws.getCell(row, col).border = NO_BORDER;
    }
  }
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
