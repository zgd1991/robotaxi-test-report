import type { ChangeItem, DirectionStat, IssueStat, ReportData, ReportMetadata, StationConclusion, StationConclusionStats, TestRecord, TestType, VersionChange, VersionStat } from '../types';

export function calculateReport(records: TestRecord[]): ReportData {
  const sessions = groupBySession(records);
  const singleTestStats = buildSingleTestStats(sessions);
  const stationConclusionStats = buildStationConclusionStats(sessions);
  const metadata = buildMetadata(records, sessions);

  const entryStats = buildDirectionStats(records, '进站');
  const exitStats = buildDirectionStats(records, '出站');
  const parkingStats = buildDirectionStats(records, '停泊');

  const issueStats = buildIssueStats(records);
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
    metadata,
    entryStats,
    exitStats,
    parkingStats,
    issueStats,
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
  const stationConclusions = new Map<string, StationConclusion | undefined>();

  for (const sessionRecords of sessions.values()) {
    const stationName = sessionRecords[0]?.stationName || 'unknown';
    const conclusion = sessionRecords.find((r) => r.stationConclusion)?.stationConclusion;
    if (conclusion) {
      const existing = stationConclusions.get(stationName);
      stationConclusions.set(stationName, mergeStationConclusion(existing, conclusion));
    } else if (!stationConclusions.has(stationName)) {
      stationConclusions.set(stationName, undefined);
    }
  }

  let passed = 0;
  let failed = 0;
  let unreasonable = 0;
  let unfinished = 0;

  for (const conclusion of stationConclusions.values()) {
    if (conclusion === '通过') passed++;
    else if (conclusion === '不通过') failed++;
    else if (conclusion === '站点不合理') unreasonable++;
    else unfinished++;
  }

  const total = passed + failed + unreasonable;
  const allStations = total + unfinished;
  const passRate = total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0;
  const failRate = total > 0 ? parseFloat(((failed / total) * 100).toFixed(1)) : 0;
  const unreasonableRate = total > 0 ? parseFloat(((unreasonable / total) * 100).toFixed(1)) : 0;
  const unfinishedRate = allStations > 0 ? parseFloat(((unfinished / allStations) * 100).toFixed(1)) : 0;

  return { total, passed, failed, unreasonable, unfinished, passRate, failRate, unreasonableRate, unfinishedRate };
}

function mergeStationConclusion(a: StationConclusion | undefined, b: StationConclusion): StationConclusion {
  const priority: Record<StationConclusion, number> = { '站点不合理': 3, '不通过': 2, '通过': 1 };
  const pa = a ? priority[a] : 0;
  const pb = priority[b];
  return pa >= pb ? (a as StationConclusion) : b;
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

function buildIssueStats(records: TestRecord[]): IssueStat[] {
  const failedRecords = records.filter((r) => r.result === '失败' && r.issueCategory);
  const totalIssues = failedRecords.length;
  const counts = new Map<string, number>();

  for (const record of failedRecords) {
    const category = record.issueCategory || '未分类';
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
