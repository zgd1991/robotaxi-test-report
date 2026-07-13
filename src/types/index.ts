export type TestType = '进站' | '出站' | '完整站点测试' | '停泊';
export type ResultType = '通过' | '失败';
export type StationConclusion = '通过' | '不通过' | '站点不合理';

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
  stationConclusion?: StationConclusion;
  vin?: string;
  adVersion?: string;
  testDate?: string;
  singleResult?: string;
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

export interface StationConclusionStats {
  total: number;
  passed: number;
  failed: number;
  unreasonable: number;
  unfinished: number;
  passRate: number;
  failRate: number;
  unreasonableRate: number;
  unfinishedRate: number;
}

export interface IssueStat {
  category: string;
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

export interface ReportMetadata {
  testDate?: string;
  vin?: string;
  adVersion?: string;
  versions: string[];
  stationCount: number;
  totalSessions: number;
}

export interface StationConclusionItem {
  stationName: string;
  conclusion: StationConclusion;
}

export interface ReportData {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallPassRate: number;
  singleTestStats: DirectionStat;
  completedStations: number;
  stationConclusionStats: StationConclusionStats;
  stationConclusions: StationConclusionItem[];
  metadata: ReportMetadata;
  entryStats: DirectionStat;
  exitStats: DirectionStat;
  parkingStats: DirectionStat;
  issueStats: IssueStat[];
  issueStatsByType: Record<'进站' | '停泊' | '出站', IssueStat[]>;
  topIssues: IssueStat[];
  versionStats: VersionStat[];
  versionChanges: VersionChange[];
}
