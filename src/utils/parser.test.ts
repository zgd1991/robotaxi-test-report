import { describe, it, expect } from 'vitest';
import { parseText } from './parser';

describe('parseText', () => {
  it('parses comma-separated text with Chinese headers', () => {
    const text = `站点名称,版本,测试类型,测试结果,问题类别,影响方向,VIN,智驾版本,日期,单次测试结果,站点结论
站点 A,v1.0.0,进站,通过,,,,,,OK,通过
站点 A,v1.0.0,出站,失败,感知漏检,安全,VIN001,v1.0.0,2026-07-01,NO OK,通过`;
    const records = parseText(text);
    expect(records.length).toBe(2);
    expect(records[0].stationName).toBe('站点 A');
    expect(records[0].result).toBe('通过');
    expect(records[0].singleResult).toBe('OK');
    expect(records[0].stationConclusion).toBe('通过');
    expect(records[1].issueCategory).toBe('感知漏检');
    expect(records[1].vin).toBe('VIN001');
    expect(records[1].adVersion).toBe('v1.0.0');
    expect(records[1].testDate).toBe('2026-07-01');
  });

  it('returns empty array for invalid text', () => {
    const records = parseText('hello world');
    expect(records.length).toBe(0);
  });

  it('produces sessionId per record', () => {
    const text = `站点名称,版本,测试类型,测试结果
站点 A,v1.0.0,进站,通过
站点 B,v1.0.0,出站,失败`;
    const records = parseText(text);
    expect(records.length).toBe(2);
    expect(records[0].sessionId).toBe('record-0');
    expect(records[1].sessionId).toBe('record-1');
  });
});
