import { describe, it, expect } from 'vitest';
import { parseText } from './parser';

describe('parseText', () => {
  it('parses comma-separated text with Chinese headers', () => {
    const text = `站点名称,版本,测试类型,测试结果,问题类别,影响方向
站点 A,v1.0.0,进站,通过,,
站点 A,v1.0.0,出站,失败,感知漏检,安全`;
    const records = parseText(text);
    expect(records.length).toBe(2);
    expect(records[0].stationName).toBe('站点 A');
    expect(records[0].result).toBe('通过');
    expect(records[1].issueCategory).toBe('感知漏检');
  });

  it('returns empty array for invalid text', () => {
    const records = parseText('hello world');
    expect(records.length).toBe(0);
  });
});
