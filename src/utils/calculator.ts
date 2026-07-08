import type { ChangeItem, DirectionStat, ImpactStat, IssueStat, ReportData, TestRecord, TestType, TestTypeStat, VersionChange, VersionStat } from '../types';

export function calculateReport(records: TestRecord[]): ReportData {
  const sessions = groupBySession(records);
  const singleTestStats = buildSingleTestStats(sessions);
  const stationOverallStats = buildStationOverallStats(sessions);
  const stationCount = new Set(records.map((r) => r.stationName)).size;
  const versions = Array.from(new Set(records.map((r) => r.version))).sort();

  const testTypeStats = buildTestTypeStats(records);
  const entryStats = buildDirectionStats(records, '进站');
  const exitStats = buildDirectionStats(records, '出站');
  const parkingStats = buildDirectionStats(records, '停泊');

  const issueStats = buildIssueStats(records);
  const impactStats = buildImpactStats(records);
  const topIssues = [...issueStats].sort((a, b) => b.count - a.count).slice(0, 3);

  const versionStats = buildVersionStats(records);
  const versionChanges = buildVersionChanges(versionStats, records);

  return {
    totalTests: singleTestStats.total,
    passedTests: singleTestStats.passed,
    failedTests: singleTestStats.failed,
    overallPassRate: singleTestStats.rate,
    singleTestStats,
    stationOverallStats,
    stationCount,
    versions,
    testTypeStats,
    entryStats,
    exitStats,
    parkingStats,
    issueStats,
    impactStats,
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
    if (sessionRecords.length === 1) {
      if (sessionRecords[0].result === '通过') passed++;
    } else {
      const entry = sessionRecords.find((r) => r.testType === '进站');
      const parking = sessionRecords.find((r) => r.testType === '停泊');
      if (entry?.result === '通过' && parking?.result === '通过') {
        passed++;
      }
    }
  }

  const failed = total - passed;
  const rate = total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0;

  return { total, passed, failed, rate };
}

function buildStationOverallStats(sessions: Map<string, TestRecord[]>): DirectionStat {
  const stationSinglePasses = new Map<string, number>();
  const stationTotalSessions = new Map<string, number>();

  for (const sessionRecords of sessions.values()) {
    const stationName = sessionRecords[0]?.stationName || 'unknown';
    stationTotalSessions.set(stationName, (stationTotalSessions.get(stationName) || 0) + 1);

    let singlePass = false;
    if (sessionRecords.length === 1) {
      singlePass = sessionRecords[0].result === '通过';
    } else {
      const entry = sessionRecords.find((r) => r.testType === '进站');
      const parking = sessionRecords.find((r) => r.testType === '停泊');
      singlePass = entry?.result === '通过' && parking?.result === '通过';
    }

    if (singlePass) {
      stationSinglePasses.set(stationName, (stationSinglePasses.get(stationName) || 0) + 1);
    }
  }

  const totalStations = stationTotalSessions.size;
  let passedStations = 0;

  for (const stationName of stationTotalSessions.keys()) {
    const singlePasses = stationSinglePasses.get(stationName) || 0;
    if (singlePasses >= 3) {
      passedStations++;
    }
  }

  const failedStations = totalStations - passedStations;
  const rate = totalStations > 0 ? parseFloat(((passedStations / totalStations) * 100).toFixed(1)) : 0;

  return { total: totalStations, passed: passedStations, failed: failedStations, rate };
}

function buildTestTypeStats(records: TestRecord[]): TestTypeStat[] {
  const types: TestType[] = ['完整站点测试', '进站', '出站', '停泊'];

  return types.map((type) => {
    const filtered = records.filter((r) => r.testType === type);
    const total = filtered.length;
    const passed = filtered.filter((r) => r.result === '通过').length;
    const failed = total - passed;
    const rate = total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0;
    return { testType: type, total, passed, failed, rate };
  });
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
  const impactCounts = new Map<string, Map<string, number>>();

  for (const record of failedRecords) {
    const category = record.issueCategory || '未分类';
    counts.set(category, (counts.get(category) || 0) + 1);

    const impact = record.impact || '未分类';
    if (!impactCounts.has(category)) {
      impactCounts.set(category, new Map());
    }
    const categoryImpacts = impactCounts.get(category)!;
    categoryImpacts.set(impact, (categoryImpacts.get(impact) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => {
      const categoryImpacts = impactCounts.get(category) || new Map();
      let mostCommonImpact = '未分类';
      let maxImpactCount = 0;
      for (const [impact, impactCount] of categoryImpacts.entries()) {
        if (impactCount > maxImpactCount) {
          maxImpactCount = impactCount;
          mostCommonImpact = impact;
        }
      }
      return {
        category,
        impact: mostCommonImpact,
        count,
        percentage: totalIssues > 0 ? parseFloat(((count / totalIssues) * 100).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => b.count - a.count);
}

function buildImpactStats(records: TestRecord[]): ImpactStat[] {
  const failedRecords = records.filter((r) => r.result === '失败' && r.impact);
  const total = failedRecords.length;
  const counts = new Map<string, number>();

  for (const record of failedRecords) {
    const impact = record.impact || '未分类';
    counts.set(impact, (counts.get(impact) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([impact, count]) => ({
      impact,
      count,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
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
