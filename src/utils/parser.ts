import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { TestRecord, TestType, ResultType } from '../types';

const FIELD_MAP: Record<string, keyof TestRecord> = {
  'stationId': 'stationId',
  '站点ID': 'stationId',
  '站点id': 'stationId',
  'stationName': 'stationName',
  '站点名称': 'stationName',
  'version': 'version',
  '版本号': 'version',
  '版本': 'version',
  'testType': 'testType',
  '测试类型': 'testType',
  'result': 'result',
  '测试结果': 'result',
  '是否通过': 'result',
  'issueCategory': 'issueCategory',
  '问题类别': 'issueCategory',
  'issueDescription': 'issueDescription',
  '问题描述': 'issueDescription',
  'impact': 'impact',
  '影响方向': 'impact',
  'testTime': 'testTime',
  '测试时间': 'testTime',
};

const TEST_TYPES: TestType[] = ['进站', '出站', '完整站点测试', '停泊'];

const IMPACT_MAP: Record<string, string> = {
  '车身姿态异常': '安全',
  '停车危险驾驶': '安全',
  '压线停车': '安全',
  '危险交互': '安全',
  '未进入机动车道': '安全',
  '停车位置不合理': '体验',
  '停车未靠边': '体验',
  '提前停车': '体验',
  '站点不合理分类': '体验',
  '站点紧邻路口': '体验',
  '站点位于内部道路': '体验',
  '通信中断': '稳定性',
};

export function parseCSV(file: File): Promise<TestRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const records = normalizeRecords(results.data);
          resolve(records);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}

export function parseExcel(file: File): Promise<TestRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
        const records = normalizeRecords(json);
        if (records.length > 0) {
          resolve(records);
          return;
        }

        const complexRecords = parseComplexExcelFormat(workbook);
        resolve(complexRecords);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseComplexExcelFormat(workbook: XLSX.WorkBook): TestRecord[] {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });

  if (rows.length < 3) return [];

  const firstRow = rows[0];
  if (!firstRow || String(firstRow[1] || '') !== '站点信息') return [];

  const records: TestRecord[] = [];
  let currentStationName = '';
  let currentVersion = '';
  let sessionIndex = 0;

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 19) continue;

    const stationName = String(row[1] || '').trim();
    if (stationName) {
      currentStationName = stationName;
    }

    const version = String(row[4] || '').trim();
    if (version) {
      currentVersion = version;
    }

    if (!currentStationName) continue;

    const entryResult = normalizeComplexResult(String(row[8] || ''));
    const parkingResult = normalizeComplexResult(String(row[9] || ''));
    const departureResult = normalizeComplexResult(String(row[18] || ''));

    const parkingIssue = String(row[10] || '').trim();
    const siteIssue = String(row[13] || '').trim();
    const departureIssue = String(row[19] || '').trim();
    const parkingRemark = String(row[12] || '').trim();
    const departureRemark = String(row[20] || '').trim();

    const hasAnyResult = entryResult || parkingResult || departureResult;
    if (!hasAnyResult) continue;

    sessionIndex++;
    const sessionId = `session-${sessionIndex}`;

    if (entryResult) {
      records.push(createRecord(sessionId, currentStationName, currentVersion, '进站', entryResult, parkingIssue || siteIssue, parkingRemark));
    }

    if (parkingResult) {
      records.push(createRecord(sessionId, currentStationName, currentVersion, '停泊', parkingResult, parkingIssue || siteIssue, parkingRemark));
    }

    if (departureResult) {
      records.push(createRecord(sessionId, currentStationName, currentVersion, '出站', departureResult, departureIssue || siteIssue, departureRemark));
    }
  }

  return records;
}

function createRecord(
  sessionId: string,
  stationName: string,
  version: string,
  testType: TestType,
  result: ResultType,
  issueCategory: string,
  issueDescription: string
): TestRecord {
  const category = issueCategory || undefined;
  const description = issueDescription || undefined;
  const impact = category ? (IMPACT_MAP[category] || '未分类') : undefined;

  return {
    sessionId,
    stationId: stationName,
    stationName,
    version: version || 'unknown',
    testType,
    result,
    issueCategory: category,
    issueDescription: description,
    impact,
  };
}

function normalizeComplexResult(value: string): ResultType | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === '成功' || normalized === '通过' || normalized === 'ok' || normalized === 'pass') {
    return '通过';
  }
  if (normalized === '失败' || normalized === '不通过' || normalized === 'no ok' || normalized === 'nook' || normalized === 'fail' || normalized === '站点不合理') {
    return '失败';
  }
  return null;
}

export function parseJSON(file: File): Promise<TestRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const records = Array.isArray(parsed) ? normalizeRecords(parsed) : [];
        resolve(records);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function parseText(text: string): TestRecord[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split(delimiter).map((cell) => cell.trim()));

  const objects = rows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  return normalizeRecords(objects);
}

function detectDelimiter(line: string): string {
  if (line.includes('\t')) return '\t';
  if (line.includes(',')) return ',';
  if (line.includes('|')) return '|';
  if (line.includes(';')) return ';';
  return ' ';
}

function normalizeRecords(rows: Record<string, unknown>[]): TestRecord[] {
  const records: TestRecord[] = [];

  rows.forEach((row, index) => {
    const normalized: Partial<Record<keyof TestRecord, unknown>> = {};

    for (const [key, value] of Object.entries(row)) {
      const mappedKey = FIELD_MAP[key.trim()];
      if (mappedKey) {
        normalized[mappedKey] = value;
      }
    }

    const testType = normalizeTestType(String(normalized.testType || ''));
    const result = normalizeResult(String(normalized.result || ''));

    if (!testType || !result) return;

    const issueCategory = normalized.issueCategory ? String(normalized.issueCategory) : undefined;
    const impact = issueCategory ? (IMPACT_MAP[issueCategory] || '未分类') : undefined;

    records.push({
      sessionId: `record-${index}`,
      stationId: String(normalized.stationId || normalized.stationName || 'unknown'),
      stationName: String(normalized.stationName || normalized.stationId || 'unknown'),
      version: String(normalized.version || 'unknown'),
      testType,
      result,
      issueCategory,
      issueDescription: normalized.issueDescription ? String(normalized.issueDescription) : undefined,
      impact,
      testTime: normalized.testTime ? String(normalized.testTime) : undefined,
    });
  });

  return records;
}

function normalizeTestType(value: string): TestType | null {
  const normalized = value.trim();
  for (const type of TEST_TYPES) {
    if (normalized.includes(type)) return type;
  }
  return null;
}

function normalizeResult(value: string): ResultType | null {
  const normalized = value.trim();
  if (normalized === '通过' || normalized === 'pass' || normalized === 'Pass' || normalized === 'true') {
    return '通过';
  }
  if (normalized === '失败' || normalized === 'fail' || normalized === 'Fail' || normalized === 'false') {
    return '失败';
  }
  return null;
}

export function parseFile(file: File): Promise<TestRecord[]> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'csv') return parseCSV(file);
  if (extension === 'xlsx' || extension === 'xls') return parseExcel(file);
  if (extension === 'json') return parseJSON(file);

  throw new Error(`不支持的文件格式: .${extension}`);
}
