import { describe, it, expect } from 'vitest';
import { calculateReport } from './calculator';
import type { TestRecord } from '../types';

const records: TestRecord[] = [
  { sessionId: '1', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '进站', result: '通过' },
  { sessionId: '2', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '进站', result: '失败', issueCategory: '定位异常', impact: '安全' },
  { sessionId: '3', stationId: 'A', stationName: '站点 A', version: 'v1.0.0', testType: '出站', result: '通过' },
  { sessionId: '4', stationId: 'B', stationName: '站点 B', version: 'v1.0.0', testType: '进站', result: '失败', issueCategory: '站点标识不清', impact: '效率' },
  { sessionId: '5', stationId: 'B', stationName: '站点 B', version: 'v1.1.0', testType: '进站', result: '通过' },
  { sessionId: '6', stationId: 'B', stationName: '站点 B', version: 'v1.1.0', testType: '进站', result: '通过' },
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
    expect(report.stationCount).toBe(2);
    expect(report.versions).toEqual(['v1.0.0', 'v1.1.0']);
  });

  it('calculates entry and exit stats', () => {
    const report = calculateReport(records);
    expect(report.entryStats.total).toBe(5);
    expect(report.entryStats.passed).toBe(3);
    expect(report.entryStats.rate).toBe(60);
    expect(report.exitStats.total).toBe(1);
    expect(report.exitStats.passed).toBe(1);
    expect(report.exitStats.rate).toBe(100);
  });

  it('identifies top issues', () => {
    const report = calculateReport(records);
    expect(report.topIssues.length).toBe(2);
    expect(report.topIssues[0].category).toBe('定位异常');
  });

  it('detects version improvements', () => {
    const report = calculateReport(records);
    expect(report.versionChanges.length).toBe(1);
    const change = report.versionChanges[0];
    expect(change.improvements.length).toBeGreaterThan(0);
    expect(change.improvements[0].testType).toBe('进站');
    expect(change.improvements[0].stationName).toBe('站点 B');
  });
});
