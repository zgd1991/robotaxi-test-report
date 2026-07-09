import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { TestRecord, TestType, ResultType, StationConclusion } from '../types';

const FIELD_MAP: Record<string, keyof TestRecord> = {
  'stationId': 'stationId',
  '站点ID': 'stationId',
  '站点id': 'stationId',
  'stationName': 'stationName',
  '站点名称': 'stationName',
  '站点信息': 'stationName',
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
  '问题分类': 'issueCategory',
  'issueDescription': 'issueDescription',
  '问题描述': 'issueDescription',
  'impact': 'impact',
  '影响方向': 'impact',
  'testTime': 'testTime',
  '测试时间': 'testTime',
  'stationConclusion': 'stationConclusion',
  '站点结论': 'stationConclusion',
  '每个站点测试结果': 'stationConclusion',
  'vin': 'vin',
  'VIN': 'vin',
  'adVersion': 'adVersion',
  '智驾版本': 'adVersion',
  'testDate': 'testDate',
  '日期': 'testDate',
  '测试日期': 'testDate',
  'singleResult': 'singleResult',
  '单次测试结果': 'singleResult',
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
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });

        if (rows.length > 0) {
          const firstRow = rows[0];
          const firstCell = String(firstRow?.[0] || '');
          const secondCell = String(firstRow?.[1] || '');
          if (firstCell === '车辆vin' || secondCell === '站点名称') {
            resolve(parseNewExcelFormat(rows));
            return;
          }
        }

        const complexRecords = parseComplexExcelFormat(rows);
        if (complexRecords.length > 0) {
          resolve(complexRecords);
          return;
        }

        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
        const records = normalizeRecords(json);
        resolve(records);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseComplexExcelFormat(rows: unknown[][]): TestRecord[] {
  if (rows.length < 3) return [];

  const firstRow = rows[0];
  if (!firstRow || String(firstRow[1] || '') !== '站点信息') return [];

  const records: TestRecord[] = [];
  let stationIndex = 0;
  let rowOffset = -1;

  let currentStationName = '';
  let currentStationConclusion: StationConclusion | undefined;
  let currentVin = '';
  let currentAdVersion = '';
  let currentTestDate = '';

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 19) continue;

    const stationName = String(row[1] || '').trim();
    if (stationName) {
      stationIndex++;
      rowOffset = 0;
      currentStationName = stationName;
      currentStationConclusion = normalizeStationConclusion(String(row[2] || ''));
      currentVin = String(row[3] || '').trim();
      currentAdVersion = String(row[4] || '').trim();
      currentTestDate = normalizeDateValue(row[6]);
    } else {
      rowOffset++;
    }

    if (!currentStationName) continue;
    if (rowOffset < 0 || rowOffset > 3) continue;

    const sessionId = `station-${stationIndex}-test-${rowOffset}`;
    const version = currentAdVersion || 'unknown';

    const entryResult = normalizeComplexResult(String(row[8] || ''));
    const parkingResult = normalizeComplexResult(String(row[9] || ''));
    const departureResult = normalizeComplexResult(String(row[18] || ''));

    const singleResult = String(row[5] || '').trim() || undefined;
    const testDate = currentTestDate || undefined;
    const parkingIssue = String(row[10] || '').trim();
    const siteIssue = String(row[13] || '').trim();
    const departureIssue = String(row[19] || '').trim();
    const parkingRemark = String(row[12] || '').trim();
    const departureRemark = String(row[20] || '').trim();

    const hasAnyResult = entryResult || parkingResult || departureResult;
    if (!hasAnyResult) continue;

    if (entryResult) {
      records.push(
        createRecord(sessionId, currentStationName, version, '进站', entryResult, parkingIssue || siteIssue, parkingRemark, {
          stationConclusion: currentStationConclusion,
          vin: currentVin,
          adVersion: currentAdVersion,
          testDate,
          singleResult,
        })
      );
    }

    if (parkingResult) {
      records.push(
        createRecord(sessionId, currentStationName, version, '停泊', parkingResult, parkingIssue || siteIssue, parkingRemark, {
          stationConclusion: currentStationConclusion,
          vin: currentVin,
          adVersion: currentAdVersion,
          testDate,
          singleResult,
        })
      );
    }

    if (departureResult) {
      records.push(
        createRecord(sessionId, currentStationName, version, '出站', departureResult, departureIssue || siteIssue, departureRemark, {
          stationConclusion: currentStationConclusion,
          vin: currentVin,
          adVersion: currentAdVersion,
          testDate,
          singleResult,
        })
      );
    }
  }

  return records;
}

export function parseNewExcelFormat(rows: unknown[][]): TestRecord[] {
  const records: TestRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 12) continue;

    const stationName = String(row[2] || '').trim();
    if (!stationName) continue;

    const sessionId = `new-${i}`;
    const vin = String(row[0] || '').trim();
    const adVersion = String(row[1] || '').trim();
    const version = adVersion || 'unknown';
    const testDate = normalizeDateValue(row[5]);
    const stationConclusion = normalizeStationConclusion(String(row[4] || ''));
    const singleResult = String(row[3] || '').trim() || undefined;

    const entryResult = normalizeTagResult(String(row[10] || ''), '进站');
    const parkingResult = normalizeTagResult(String(row[11] || ''), '停泊');
    const departureResult = normalizeTagResult(String(row[12] || ''), '出站');

    const entryDesc = String(row[6] || '').trim();
    const departureDesc = String(row[7] || '').trim();
    const entryTag = String(row[10] || '').trim();
    const parkingTag = String(row[11] || '').trim();
    const departureTag = String(row[12] || '').trim();

    const issueDescription = entryDesc || departureDesc || entryTag || parkingTag || departureTag || undefined;

    const hasDirectionResult = entryResult || parkingResult || departureResult;

    if (hasDirectionResult) {
      if (entryResult) {
        const issueCategory = extractTagCategory(entryTag) || entryDesc || undefined;
        records.push(
          createRecord(sessionId, stationName, version, '进站', entryResult, issueCategory || '', issueDescription || '', {
            stationConclusion,
            vin,
            adVersion,
            testDate,
            singleResult,
          })
        );
      }

      if (parkingResult) {
        const issueCategory = extractTagCategory(parkingTag) || entryDesc || undefined;
        records.push(
          createRecord(sessionId, stationName, version, '停泊', parkingResult, issueCategory || '', issueDescription || '', {
            stationConclusion,
            vin,
            adVersion,
            testDate,
            singleResult,
          })
        );
      }

      if (departureResult) {
        const issueCategory = extractTagCategory(entryTag) || extractTagCategory(parkingTag) || departureDesc || entryDesc || undefined;
        records.push(
          createRecord(sessionId, stationName, version, '出站', departureResult, issueCategory || '', issueDescription || '', {
            stationConclusion,
            vin,
            adVersion,
            testDate,
            singleResult,
          })
        );
      }
    } else if (singleResult) {
      const overallResult: ResultType = singleResult.trim().toLowerCase() === 'ok' ? '通过' : '失败';
      const issueCategory = extractTagCategory(entryTag) || extractTagCategory(parkingTag) || entryDesc || departureDesc || undefined;
      records.push(
        createRecord(sessionId, stationName, version, '完整站点测试', overallResult, issueCategory || '', issueDescription || '', {
          stationConclusion,
          vin,
          adVersion,
          testDate,
          singleResult,
        })
      );
    }
  }

  return records;
}

function normalizeTagResult(value: string, type: '进站' | '停泊' | '出站'): ResultType | null {
  const prefix = type === '进站' ? '进站成功' : type === '停泊' ? '停泊成功' : '出站成功';
  const failPrefix = type === '进站' ? '进站失败' : type === '停泊' ? '停泊失败' : '出站失败';
  const trimmed = value.trim();
  if (trimmed.startsWith(prefix)) return '通过';
  if (trimmed.startsWith(failPrefix)) return '失败';
  return null;
}

function extractTagCategory(tag: string): string | undefined {
  const trimmed = tag.trim();
  if (!trimmed.includes('/')) return undefined;
  const parts = trimmed.split('/');
  if (parts.length < 2) return undefined;
  const category = parts[1].trim();
  return category || undefined;
}

interface RecordExtras {
  stationConclusion?: StationConclusion;
  vin?: string;
  adVersion?: string;
  testDate?: string;
  singleResult?: string;
}

function createRecord(
  sessionId: string,
  stationName: string,
  version: string,
  testType: TestType,
  result: ResultType,
  issueCategory: string,
  issueDescription: string,
  extras?: RecordExtras
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
    stationConclusion: extras?.stationConclusion,
    vin: extras?.vin || undefined,
    adVersion: extras?.adVersion || undefined,
    testDate: extras?.testDate || undefined,
    singleResult: extras?.singleResult,
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

function normalizeStationConclusion(value: string): StationConclusion | undefined {
  const normalized = value.trim();
  if (normalized === '通过') return '通过';
  if (normalized === '不通过' || normalized === '未通过') return '不通过';
  if (normalized === '站点不合理' || normalized === '不合理') return '站点不合理';
  return undefined;
}

function normalizeDateValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    if (y < 1901) return '';
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date && date.y > 1900) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
  }
  const str = String(value).trim();
  if (str.includes(' ')) return str.split(' ')[0];
  return str;
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
      sessionId: normalized.sessionId ? String(normalized.sessionId) : `record-${index}`,
      stationId: String(normalized.stationId || normalized.stationName || 'unknown'),
      stationName: String(normalized.stationName || normalized.stationId || 'unknown'),
      version: String(normalized.version || 'unknown'),
      testType,
      result,
      issueCategory,
      issueDescription: normalized.issueDescription ? String(normalized.issueDescription) : undefined,
      impact,
      testTime: normalized.testTime ? String(normalized.testTime) : undefined,
      stationConclusion: normalizeStationConclusion(String(normalized.stationConclusion || '')),
      vin: normalized.vin ? String(normalized.vin) : undefined,
      adVersion: normalized.adVersion ? String(normalized.adVersion) : undefined,
      testDate: normalized.testDate ? String(normalized.testDate) : undefined,
      singleResult: normalized.singleResult ? String(normalized.singleResult) : undefined,
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
