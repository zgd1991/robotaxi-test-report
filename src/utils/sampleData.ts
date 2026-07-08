import type { TestRecord } from '../types';

export const sampleData: TestRecord[] = [
  // 站点 A - v1.0.0
  { sessionId: '1', stationId: 'A01', stationName: '站点 A', version: 'v1.0.0', testType: '进站', result: '通过' },
  { sessionId: '2', stationId: 'A01', stationName: '站点 A', version: 'v1.0.0', testType: '进站', result: '通过' },
  { sessionId: '3', stationId: 'A01', stationName: '站点 A', version: 'v1.0.0', testType: '进站', result: '失败', issueCategory: '定位异常', issueDescription: '进站口定位偏差 1.2 米', impact: '安全' },
  { sessionId: '4', stationId: 'A01', stationName: '站点 A', version: 'v1.0.0', testType: '出站', result: '通过' },
  { sessionId: '5', stationId: 'A01', stationName: '站点 A', version: 'v1.0.0', testType: '出站', result: '失败', issueCategory: '感知漏检', issueDescription: '出口行人识别延迟', impact: '效率' },
  { sessionId: '6', stationId: 'A01', stationName: '站点 A', version: 'v1.0.0', testType: '出站', result: '通过' },
  { sessionId: '7', stationId: 'A01', stationName: '站点 A', version: 'v1.0.0', testType: '完整站点测试', result: '通过' },
  { sessionId: '8', stationId: 'A01', stationName: '站点 A', version: 'v1.0.0', testType: '完整站点测试', result: '失败', issueCategory: '通信中断', issueDescription: '站点 5G 信号短暂丢失', impact: '稳定性' },

  // 站点 A - v1.1.0
  { sessionId: '9', stationId: 'A01', stationName: '站点 A', version: 'v1.1.0', testType: '进站', result: '通过' },
  { sessionId: '10', stationId: 'A01', stationName: '站点 A', version: 'v1.1.0', testType: '进站', result: '通过' },
  { sessionId: '11', stationId: 'A01', stationName: '站点 A', version: 'v1.1.0', testType: '进站', result: '通过' },
  { sessionId: '12', stationId: 'A01', stationName: '站点 A', version: 'v1.1.0', testType: '出站', result: '通过' },
  { sessionId: '13', stationId: 'A01', stationName: '站点 A', version: 'v1.1.0', testType: '出站', result: '通过' },
  { sessionId: '14', stationId: 'A01', stationName: '站点 A', version: 'v1.1.0', testType: '出站', result: '失败', issueCategory: '规控失败', issueDescription: '出站汇入车道速度规划保守', impact: '体验' },
  { sessionId: '15', stationId: 'A01', stationName: '站点 A', version: 'v1.1.0', testType: '完整站点测试', result: '通过' },
  { sessionId: '16', stationId: 'A01', stationName: '站点 A', version: 'v1.1.0', testType: '完整站点测试', result: '通过' },

  // 站点 B - v1.0.0
  { sessionId: '17', stationId: 'B02', stationName: '站点 B', version: 'v1.0.0', testType: '进站', result: '通过' },
  { sessionId: '18', stationId: 'B02', stationName: '站点 B', version: 'v1.0.0', testType: '进站', result: '失败', issueCategory: '站点标识不清', issueDescription: '进站引导线磨损', impact: '效率' },
  { sessionId: '19', stationId: 'B02', stationName: '站点 B', version: 'v1.0.0', testType: '出站', result: '通过' },
  { sessionId: '20', stationId: 'B02', stationName: '站点 B', version: 'v1.0.0', testType: '出站', result: '通过' },
  { sessionId: '21', stationId: 'B02', stationName: '站点 B', version: 'v1.0.0', testType: '完整站点测试', result: '通过' },

  // 站点 B - v1.1.0
  { sessionId: '22', stationId: 'B02', stationName: '站点 B', version: 'v1.1.0', testType: '进站', result: '通过' },
  { sessionId: '23', stationId: 'B02', stationName: '站点 B', version: 'v1.1.0', testType: '进站', result: '通过' },
  { sessionId: '24', stationId: 'B02', stationName: '站点 B', version: 'v1.1.0', testType: '出站', result: '失败', issueCategory: '感知漏检', issueDescription: '夜间光照不足导致漏检', impact: '安全' },
  { sessionId: '25', stationId: 'B02', stationName: '站点 B', version: 'v1.1.0', testType: '出站', result: '通过' },
  { sessionId: '26', stationId: 'B02', stationName: '站点 B', version: 'v1.1.0', testType: '完整站点测试', result: '失败', issueCategory: '通信中断', issueDescription: '与站点 V2X 设备握手失败', impact: '稳定性' },
];
