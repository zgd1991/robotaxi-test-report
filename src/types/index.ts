export type TestType = '进站' | '出站' | '完整站点测试' | '停泊';
export type ResultType = '通过' | '失败';

export interface TestRecord {
  sessionId: string;
  stationId: string;
  stationName: string;
  version: string;
  testType: TestType;
  result: ResultType;
  issueCategory?: string;
  issueDescription?: string;
  impact?: string;
  testTime?: string;
}

export interface TestTypeStat {
  testType: TestType;
  total: number;
  passed: number;
  failed: number;
  rate: number;
}

export interface DirectionStat {
  total: number;
  passed: number;
  failed: number;
  rate: number;
}

export interface IssueStat {
  category: string;
  impact: string;
  count: number;
  percentage: number;
}

export interface ImpactStat {
  impact: string;
  count: number;
  percentage: number;
}

export interface VersionStat {
  version: string;
  total: number;
  passed: number;
  failed: number;
  rate: number;
}

export interface VersionChange {
  version: string;
  previousVersion: string;
  improvements: ChangeItem[];
  regressions: ChangeItem[];
}

export interface ChangeItem {
  stationName?: string;
  testType: TestType;
  previousRate: number;
  currentRate: number;
  change: number;
}

export interface ReportData {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallPassRate: number;
  singleTestStats: DirectionStat;
  stationOverallStats: DirectionStat;
  stationCount: number;
  versions: string[];
  testTypeStats: TestTypeStat[];
  entryStats: DirectionStat;
  exitStats: DirectionStat;
  parkingStats: DirectionStat;
  issueStats: IssueStat[];
  impactStats: ImpactStat[];
  topIssues: IssueStat[];
  versionStats: VersionStat[];
  versionChanges: VersionChange[];
}
