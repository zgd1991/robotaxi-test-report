import type { ChangeItem, DirectionStat, IssueStat, ReportData, ReportMetadata, StationConclusion, StationConclusionItem, StationConclusionStats, StationDetailStats, TestRecord, TestType, VersionChange, VersionStat } from '../types';

export function calculateReport(records: TestRecord[]): ReportData {
  const sessions = groupBySession(records);
  validateStationSessionCounts(sessions);
  const singleTestStats = buildSingleTestStats(sessions);
  const stationConclusionStats = buildStationConclusionStats(sessions);
  const stationConclusions = buildStationConclusions(sessions);
  const stationDetails = buildStationDetails(sessions);
  const metadata = buildMetadata(records, sessions);

  const entryStats = buildDirectionStats(records, '进站');
  const exitStats = buildDirectionStats(records, '出站');
  const parkingStats = buildDirectionStats(records, '停泊');

  const issueStats = buildIssueStats(records);
  const issueStatsByType = buildIssueStatsByType(records);
  const topIssues = [...issueStats].sort((a, b) => b.count - a.count).slice(0, 3);

  const versionStats = buildVersionStats(records);
  const versionChanges = buildVersionChanges(versionStats, records);

  return {
    totalTests: singleTestStats.total,
    passedTests: singleTestStats.passed,
    failedTests: singleTestStats.failed,
    overallPassRate: singleTestStats.rate,
    singleTestStats,
    completedStations: stationConclusionStats.total,
    stationConclusionStats,
    stationConclusions,
    stationDetails,
    metadata,
    entryStats,
    exitStats,
    parkingStats,
    issueStats,
    issueStatsByType,
    topIssues,
    versionStats,
    versionChanges,
  };
}

function groupBySession(records: TestRecord[]): Map<string, TestRecord[]> {
  const sessions = new Map<string, TestRecord[]>();
  for (const record of records) {
    const existing = sessions.get(record.sessionId) || [];
    existing.push(record);
    sessions.set(record.sessionId, existing);
  }
  return sessions;
}

function validateStationSessionCounts(sessions: Map<string, TestRecord[]>) {
  const stationSessions = new Map<string, TestRecord[][]>();

  for (const sessionRecords of sessions.values()) {
    const stationName = sessionRecords[0]?.stationName || 'unknown';
    const existing = stationSessions.get(stationName) || [];
    existing.push(sessionRecords);
    stationSessions.set(stationName, existing);
  }

  const overTestedStations: string[] = [];
  for (const [stationName, stationSessionList] of stationSessions.entries()) {
    if (stationSessionList.length > 4) {
      overTestedStations.push(`${stationName}（${stationSessionList.length}次）`);
    }
  }

  if (overTestedStations.length > 0) {
    throw new Error(`以下站点测试次数超过4次，请整理数据后重新生成报告：\n${overTestedStations.join('\n')}`);
  }
}

function buildSingleTestStats(sessions: Map<string, TestRecord[]>): DirectionStat {
  const total = sessions.size;
  let passed = 0;

  for (const sessionRecords of sessions.values()) {
    if (isSingleTestPassed(sessionRecords)) passed++;
  }

  const failed = total - passed;
  const rate = total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0;

  return { total, passed, failed, rate };
}

function isSingleTestPassed(sessionRecords: TestRecord[]): boolean {
  const firstRecord = sessionRecords[0];
  if (firstRecord?.singleResult && firstRecord.singleResult.trim() !== '') {
    const normalized = firstRecord.singleResult.trim().toLowerCase();
    return normalized === 'ok' || normalized === '通过' || normalized === 'pass' || normalized === '成功';
  }
  const entry = sessionRecords.find((r) => r.testType === '进站');
  const parking = sessionRecords.find((r) => r.testType === '停泊');
  return entry?.result === '通过' && parking?.result === '通过';
}

function buildStationConclusionStats(sessions: Map<string, TestRecord[]>): StationConclusionStats {
  const stationSessions = new Map<string, TestRecord[][]>();

  for (const sessionRecords of sessions.values()) {
    const stationName = sessionRecords[0]?.stationName || 'unknown';
    const existing = stationSessions.get(stationName) || [];
    existing.push(sessionRecords);
    stationSessions.set(stationName, existing);
  }

  let passed = 0;
  let failed = 0;
  let unreasonable = 0;
  let unfinished = 0;

  for (const stationSessionList of stationSessions.values()) {
    const conclusion = determineStationConclusion(stationSessionList);
    if (conclusion === '通过') passed++;
    else if (conclusion === '不通过') failed++;
    else if (conclusion === '站点不合理') unreasonable++;
    else unfinished++;
  }

  const total = passed + failed;
  const allStations = passed + failed + unreasonable + unfinished;
  const passRate = total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0;
  const failRate = total > 0 ? parseFloat(((failed / total) * 100).toFixed(1)) : 0;
  const unreasonableRate = allStations > 0 ? parseFloat(((unreasonable / allStations) * 100).toFixed(1)) : 0;
  const unfinishedRate = allStations > 0 ? parseFloat(((unfinished / allStations) * 100).toFixed(1)) : 0;

  return { total, passed, failed, unreasonable, unfinished, passRate, failRate, unreasonableRate, unfinishedRate };
}

function buildStationConclusions(sessions: Map<string, TestRecord[]>): StationConclusionItem[] {
  const stationSessions = new Map<string, TestRecord[][]>();

  for (const sessionRecords of sessions.values()) {
    const stationName = sessionRecords[0]?.stationName || 'unknown';
    const existing = stationSessions.get(stationName) || [];
    existing.push(sessionRecords);
    stationSessions.set(stationName, existing);
  }

  const results: StationConclusionItem[] = [];
  for (const [stationName, stationSessionList] of stationSessions.entries()) {
    const conclusion = determineStationConclusion(stationSessionList);
    if (conclusion) {
      results.push({ stationName, conclusion });
    }
  }
  return results;
}

function buildStationDetails(sessions: Map<string, TestRecord[]>): StationDetailStats {
  const stationSessions = new Map<string, TestRecord[][]>();

  for (const sessionRecords of sessions.values()) {
    const stationName = sessionRecords[0]?.stationName || 'unknown';
    const existing = stationSessions.get(stationName) || [];
    existing.push(sessionRecords);
    stationSessions.set(stationName, existing);
  }

  const result: StationDetailStats = { passed: [], failed: [], unreasonable: [] };

  for (const [stationName, stationSessionList] of stationSessions.entries()) {
    const conclusion = determineStationConclusion(stationSessionList);
    if (!conclusion) continue;

    const reason = getStationReason(stationSessionList, conclusion);

    if (conclusion === '通过') {
      result.passed.push({ stationName, reason });
    } else if (conclusion === '不通过') {
      result.failed.push({ stationName, reason });
    } else if (conclusion === '站点不合理') {
      result.unreasonable.push({ stationName, reason });
    }
  }

  return result;
}

function getStationReason(stationSessionList: TestRecord[][], conclusion: StationConclusion): string {
  if (conclusion === '站点不合理') {
    for (const sessionRecords of stationSessionList) {
      if (sessionRecords.some((r) => r.stationConclusion === '站点不合理')) {
        const reasonRecord = sessionRecords.find((r) => r.issueDescription || r.issueCategory);
        return reasonRecord?.issueDescription || reasonRecord?.issueCategory || '站点不合理';
      }
    }
  } else if (conclusion === '不通过') {
    for (const sessionRecords of stationSessionList) {
      if (!isSingleTestPassed(sessionRecords)) {
        const reasonRecord = sessionRecords.find((r) => r.result === '失败' && (r.issueDescription || r.issueCategory));
        return reasonRecord?.issueDescription || reasonRecord?.issueCategory || '不通过';
      }
    }
  }
  return '';
}

function determineStationConclusion(stationSessionList: TestRecord[][]): StationConclusion | undefined {
  // 站点不合理优先级最高：只要任意一次会话被标记为站点不合理，整个站点即为站点不合理
  for (const sessionRecords of stationSessionList) {
    if (sessionRecords.some((r) => r.stationConclusion === '站点不合理')) {
      return '站点不合理';
    }
  }

  let passCount = 0;
  let failCount = 0;

  for (const sessionRecords of stationSessionList) {
    if (isSingleTestPassed(sessionRecords)) {
      passCount++;
    } else {
      failCount++;
    }
  }

  if (passCount >= 3) return '通过';
  if (failCount >= 2) return '不通过';
  return undefined;
}


function buildMetadata(records: TestRecord[], sessions: Map<string, TestRecord[]>): ReportMetadata {
  const firstRecord = records[0];
  const versions = Array.from(new Set(records.map((r) => r.version))).sort();
  const stationCount = new Set(records.map((r) => r.stationName)).size;
  const totalSessions = sessions.size;

  return {
    testDate: firstRecord?.testDate || undefined,
    vin: firstRecord?.vin || undefined,
    adVersion: firstRecord?.adVersion || undefined,
    versions,
    stationCount,
    totalSessions,
  };
}

function buildDirectionStats(records: TestRecord[], direction: TestType): DirectionStat {
  const filtered = records.filter((r) => r.testType === direction);
  const total = filtered.length;
  const passed = filtered.filter((r) => r.result === '通过').length;
  const failed = total - passed;
  const rate = total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0;
  return { total, passed, failed, rate };
}

function getIssueCategory(record: TestRecord): string {
  // 当问题类别为“其他”时，用对应问题描述替换，避免大量问题被归类为模糊的“其他”
  if (record.issueCategory === '其他' && record.issueDescription) {
    return record.issueDescription.trim();
  }
  return record.issueCategory || '未分类';
}

function isValidIssue(record: TestRecord): boolean {
  return record.result === '失败' && !!record.issueCategory && record.issueCategory !== '站点不合理';
}

function buildIssueStats(records: TestRecord[]): IssueStat[] {
  const failedRecords = records.filter(isValidIssue);
  const totalIssues = failedRecords.length;
  const counts = new Map<string, number>();

  for (const record of failedRecords) {
    const category = getIssueCategory(record);
    counts.set(category, (counts.get(category) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalIssues > 0 ? parseFloat(((count / totalIssues) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function buildIssueStatsByType(records: TestRecord[]): Record<'进站' | '停泊' | '出站', IssueStat[]> {
  const types: ('进站' | '停泊' | '出站')[] = ['进站', '停泊', '出站'];
  const result: Record<'进站' | '停泊' | '出站', IssueStat[]> = {
    进站: [],
    停泊: [],
    出站: [],
  };

  // 使用全局问题总数作为分母计算占比
  const totalIssues = records.filter(isValidIssue).length;

  for (const type of types) {
    const failedRecords = records.filter((r) => r.testType === type && isValidIssue(r));
    const counts = new Map<string, number>();

    for (const record of failedRecords) {
      const category = getIssueCategory(record);
      counts.set(category, (counts.get(category) || 0) + 1);
    }

    result[type] = Array.from(counts.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalIssues > 0 ? parseFloat(((count / totalIssues) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  return result;
}

function buildVersionStats(records: TestRecord[]): VersionStat[] {
  const versions = Array.from(new Set(records.map((r) => r.version))).sort();

  return versions.map((version) => {
    const filtered = records.filter((r) => r.version === version);
    const total = filtered.length;
    const passed = filtered.filter((r) => r.result === '通过').length;
    const failed = total - passed;
    const rate = total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0;
    return { version, total, passed, failed, rate };
  });
}

function buildVersionChanges(versionStats: VersionStat[], records: TestRecord[]): VersionChange[] {
  if (versionStats.length < 2) return [];

  const changes: VersionChange[] = [];
  const versions = versionStats.map((v) => v.version);

  for (let i = 1; i < versions.length; i++) {
    const currentVersion = versions[i];
    const previousVersion = versions[i - 1];
    const currentRecords = records.filter((r) => r.version === currentVersion);
    const previousRecords = records.filter((r) => r.version === previousVersion);

    const improvements: ChangeItem[] = [];
    const regressions: ChangeItem[] = [];

    const stationNames = Array.from(new Set(records.map((r) => r.stationName)));
    const testTypes: TestType[] = ['进站', '出站', '完整站点测试', '停泊'];

    for (const stationName of stationNames) {
      for (const testType of testTypes) {
        const currentRate = calculateRate(currentRecords, stationName, testType);
        const previousRate = calculateRate(previousRecords, stationName, testType);

        if (currentRate === null || previousRate === null) continue;

        const change = parseFloat((currentRate - previousRate).toFixed(1));
        if (change > 0) {
          improvements.push({ stationName, testType, previousRate, currentRate, change });
        } else if (change < 0) {
          regressions.push({ stationName, testType, previousRate, currentRate, change });
        }
      }
    }

    changes.push({ version: currentVersion, previousVersion, improvements, regressions });
  }

  return changes;
}

function calculateRate(records: TestRecord[], stationName: string, testType: TestType): number | null {
  const filtered = records.filter((r) => r.stationName === stationName && r.testType === testType);
  if (filtered.length === 0) return null;
  const passed = filtered.filter((r) => r.result === '通过').length;
  return parseFloat(((passed / filtered.length) * 100).toFixed(1));
}
