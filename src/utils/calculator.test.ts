import { describe, it, expect } from 'vitest';
import { calculateReport } from './calculator';
import type { TestRecord } from '../types';

const records: TestRecord[] = [
  // 站点 A - v1.0.0 - session A-1: 通过
  { sessionId: 'A-1', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '进站', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  { sessionId: 'A-1', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '停泊', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  { sessionId: 'A-1', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '出站', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  // 站点 A - v1.0.0 - session A-2: 通过
  { sessionId: 'A-2', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '进站', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  { sessionId: 'A-2', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '停泊', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  { sessionId: 'A-2', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '出站', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  // 站点 A - v1.0.0 - session A-3: 通过（站点 A 累计 3 次通过，结论为通过）
  { sessionId: 'A-3', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '进站', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  { sessionId: 'A-3', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '停泊', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  { sessionId: 'A-3', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '出站', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  // 站点 A - v1.1.0 - session A-4: 不通过
  { sessionId: 'A-4', stationId: 'A', stationName: '站点 A', version: 'v1.1.0', testType: '进站', result: '失败', issueCategory: '定位异常', singleResult: 'NO OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.1.0', testDate: '2026-07-02' },
  { sessionId: 'A-4', stationId: 'A', stationName: '站点 A', version: 'v1.1.0', testType: '停泊', result: '失败', issueCategory: '定位异常', singleResult: 'NO OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.1.0', testDate: '2026-07-02' },
  { sessionId: 'A-4', stationId: 'A', stationName: '站点 A', version: 'v1.1.0', testType: '出站', result: '通过', singleResult: 'NO OK', stationConclusion: '通过', vin: 'VIN001', adVersion: 'v1.1.0', testDate: '2026-07-02' },
  // 站点 B - v1.0.0 - session B-1: 不通过
  { sessionId: 'B-1', stationId: 'B', stationName: '站点 B', version: 'v1.0.0', testType: '进站', result: '失败', issueCategory: '站点标识不清', singleResult: 'NO OK', stationConclusion: '不通过', vin: 'VIN002', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  { sessionId: 'B-1', stationId: 'B', stationName: '站点 B', version: 'v1.0.0', testType: '停泊', result: '通过', singleResult: 'NO OK', stationConclusion: '不通过', vin: 'VIN002', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  { sessionId: 'B-1', stationId: 'B', stationName: '站点 B', version: 'v1.0.0', testType: '出站', result: '通过', singleResult: 'NO OK', stationConclusion: '不通过', vin: 'VIN002', adVersion: 'v1.0.0', testDate: '2026-07-01' },
  // 站点 B - v1.1.0 - session B-2: 通过（版本对比中站点 B 进站会体现提升）
  { sessionId: 'B-2', stationId: 'B', stationName: '站点 B', version: 'v1.1.0', testType: '进站', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN002', adVersion: 'v1.1.0', testDate: '2026-07-02' },
  { sessionId: 'B-2', stationId: 'B', stationName: '站点 B', version: 'v1.1.0', testType: '停泊', result: '通过', singleResult: 'OK', stationConclusion: '通过', vin: 'VIN002', adVersion: 'v1.1.0', testDate: '2026-07-02' },
  { sessionId: 'B-2', stationId: 'B', stationName: '站点 B', version: 'v1.1.0', testType: '出站', result: '失败', issueCategory: '感知漏检', singleResult: 'NO OK', stationConclusion: '通过', vin: 'VIN002', adVersion: 'v1.1.0', testDate: '2026-07-02' },
];

describe('calculateReport', () => {
  it('calculates single test pass rate', () => {
    const report = calculateReport(records);
    expect(report.totalTests).toBe(6);
    expect(report.passedTests).toBe(4);
    expect(report.failedTests).toBe(2);
    expect(report.overallPassRate).toBeCloseTo(66.7, 1);
  });

  it('counts stations and versions', () => {
    const report = calculateReport(records);
    expect(report.metadata.stationCount).toBe(2);
    expect(report.completedStations).toBe(1);
    expect(report.metadata.versions).toEqual(['v1.0.0', 'v1.1.0']);
  });

  it('calculates station conclusion stats', () => {
    const report = calculateReport(records);
    expect(report.stationConclusionStats.passed).toBe(1);
    expect(report.stationConclusionStats.failed).toBe(0);
    expect(report.stationConclusionStats.unreasonable).toBe(0);
    expect(report.stationConclusionStats.unfinished).toBe(1);
    expect(report.stationConclusionStats.total).toBe(1);
  });

  it('calculates entry and exit stats', () => {
    const report = calculateReport(records);
    expect(report.entryStats.total).toBe(6);
    expect(report.entryStats.passed).toBe(4);
    expect(report.entryStats.rate).toBeCloseTo(66.7, 1);
    expect(report.exitStats.total).toBe(6);
    expect(report.exitStats.passed).toBe(5);
    expect(report.exitStats.rate).toBeCloseTo(83.3, 1);
  });

  it('identifies top issues', () => {
    const report = calculateReport(records);
    expect(report.topIssues.length).toBe(3);
    expect(report.topIssues[0].category).toBe('定位异常');
  });

  it('detects version improvements', () => {
    const report = calculateReport(records);
    expect(report.versionChanges.length).toBe(1);
    const change = report.versionChanges[0];
    expect(change.improvements.length).toBeGreaterThan(0);
    expect(change.improvements[0].testType).toBe('进站');
  });

  it('includes metadata', () => {
    const report = calculateReport(records);
    expect(report.metadata.testDate).toBe('2026-07-01');
    expect(report.metadata.vin).toBe('VIN001');
    expect(report.metadata.adVersion).toBe('v1.0.0');
    expect(report.metadata.totalSessions).toBe(6);
  });

  it('uses 3-pass/2-fail rule and handles unreasonable', () => {
    const mixedRecords: TestRecord[] = [
      // 站点 S: 2 次失败 → 不通过
      { sessionId: 'S-1', stationId: 'S', stationName: '站点 S', version: 'v1.0.0', testType: '进站', result: '失败', singleResult: 'NO OK', stationConclusion: '不通过' },
      { sessionId: 'S-1', stationId: 'S', stationName: '站点 S', version: 'v1.0.0', testType: '停泊', result: '失败', singleResult: 'NO OK', stationConclusion: '不通过' },
      { sessionId: 'S-2', stationId: 'S', stationName: '站点 S', version: 'v1.0.0', testType: '进站', result: '通过', singleResult: 'OK', stationConclusion: '不通过' },
      { sessionId: 'S-2', stationId: 'S', stationName: '站点 S', version: 'v1.0.0', testType: '停泊', result: '通过', singleResult: 'OK', stationConclusion: '不通过' },
      // 站点 T: 站点不合理
      { sessionId: 'T-1', stationId: 'T', stationName: '站点 T', version: 'v1.0.0', testType: '进站', result: '失败', issueCategory: '站点不合理', stationConclusion: '站点不合理' },
      { sessionId: 'T-1', stationId: 'T', stationName: '站点 T', version: 'v1.0.0', testType: '停泊', result: '失败', issueCategory: '站点不合理', stationConclusion: '站点不合理' },
      { sessionId: 'T-2', stationId: 'T', stationName: '站点 T', version: 'v1.0.0', testType: '进站', result: '通过', singleResult: 'OK', stationConclusion: '通过' },
      { sessionId: 'T-2', stationId: 'T', stationName: '站点 T', version: 'v1.0.0', testType: '停泊', result: '通过', singleResult: 'OK', stationConclusion: '通过' },
    ];

    const report = calculateReport(mixedRecords);
    expect(report.stationConclusionStats.total).toBe(0); // 4次测试法完成数只含通过/不通过，不含站点不合理
    expect(report.stationConclusionStats.passed).toBe(0);
    expect(report.stationConclusionStats.failed).toBe(0);
    expect(report.stationConclusionStats.unreasonable).toBe(1);
    expect(report.stationConclusionStats.unfinished).toBe(1);
  });
});
