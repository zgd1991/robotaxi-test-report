import { describe, it, expect } from 'vitest';
import { parseText, parseNewExcelFormat } from './parser';
import * as XLSX from 'xlsx';

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

describe('parseNewExcelFormat', () => {
  it('parses inline rows with new format', () => {
    const rows = [
      ['车辆vin', '软件版本', '站点名称', '测试状态', '站点状态', '问题打点时间', '进站问题描述', '出站问题描述', '问题归属', '问题等级', '进站标签', '停泊标签', '出站标签', '测试人员', '智驾数据链接', '经纬度(问题地点)'],
      ['VIN001', 'v1.0.0', '站点 A', 'ok', '通过', '2026-06-26 11:45:42', '进站成功', '', '智驾', '', '进站成功 / 有障碍物，未进停车位', '停泊成功 / 车辆进入停车区，满足泊车要求', '', 'Tester', '', ''],
      ['VIN002', 'v1.0.0', '站点 B', 'nok', '未通过', '2026-06-27 10:00:00', '进站失败', '', '智驾', '', '进站失败 / 停车危险驾驶', '停泊失败 / 车身姿态异常', '出站成功 / 解除刹车出站', 'Tester', '', ''],
      ['VIN003', 'v1.1.0', '站点 C', 'nok', '不合理', '2026-06-28 09:00:00', '进站失败', '', '智驾', '', '进站失败 / 站点不合理 / 站点紧邻路口', '停泊失败 / 停车未靠边', '', 'Tester', '', ''],
    ];

    const records = parseNewExcelFormat(rows);
    // 站点 A: 进站+停泊 (2)；站点 B: 进站+出站 (停泊因进站失败被跳过)；站点 C: 进站 (停泊因进站失败被跳过)
    expect(records.length).toBe(5);

    const aEntry = records.find((r) => r.sessionId === 'new-1' && r.testType === '进站');
    expect(aEntry?.result).toBe('通过');
    expect(aEntry?.issueCategory).toBe('有障碍物，未进停车位');

    // 站点 B 进站失败，停泊记录应被跳过
    const bParking = records.find((r) => r.sessionId === 'new-2' && r.testType === '停泊');
    expect(bParking).toBeUndefined();

    const bEntry = records.find((r) => r.sessionId === 'new-2' && r.testType === '进站');
    expect(bEntry?.result).toBe('失败');
    expect(bEntry?.issueCategory).toBe('停车危险驾驶');

    const bDeparture = records.find((r) => r.sessionId === 'new-2' && r.testType === '出站');
    expect(bDeparture?.result).toBe('通过');

    const cEntry = records.find((r) => r.sessionId === 'new-3' && r.testType === '进站');
    expect(cEntry?.result).toBe('失败');
    expect(cEntry?.issueCategory).toBe('站点不合理');
    expect(cEntry?.stationConclusion).toBe('站点不合理');
    expect(cEntry?.testDate).toBe('2026-06-28');
  });

  it('parses the new Excel file and counts sessions/stations', () => {
    const filePath = '/Users/zhangguangdong/Downloads/站点测试_1783592280408.xlsx';
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const records = parseNewExcelFormat(rows as unknown[][]);

    const sessions = new Set(records.map((r) => r.sessionId));
    const stations = new Set(records.map((r) => r.stationName));
    const versions = new Set(records.map((r) => r.version));
    const vins = new Set(records.map((r) => r.vin).filter(Boolean));

    expect(sessions.size).toBe(29);
    expect(stations.size).toBe(14);
    expect(records.length).toBeGreaterThan(29);
    expect(versions.size).toBeGreaterThan(0);
    expect(vins.size).toBeGreaterThan(0);
  });
});
