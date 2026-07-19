import type { ReportData } from '../types';

export interface ReportAnalysis {
  summary: string;
  weakPoints: string[];
  topIssues: string[];
  versionSummary: string | null;
  recommendations: string[];
}

export function analyzeReport(data: ReportData): ReportAnalysis {
  const summary = buildSummary(data);
  const weakPoints = buildWeakPoints(data);
  const topIssues = buildTopIssues(data);
  const versionSummary = buildVersionSummary(data);
  const recommendations = buildRecommendations(data);

  return { summary, weakPoints, topIssues, versionSummary, recommendations };
}

function buildSummary(data: ReportData): string {
  const totalStations = data.metadata.stationCount;
  const passed = data.stationConclusionStats.passed;
  const failed = data.stationConclusionStats.failed;
  const unreasonable = data.stationConclusionStats.unreasonable;
  const unfinished = data.stationConclusionStats.unfinished;

  let overall = '';
  if (data.stationConclusionStats.passRate >= 80) {
    overall = '整体表现良好';
  } else if (data.stationConclusionStats.passRate >= 50) {
    overall = '整体表现一般，存在明显问题';
  } else {
    overall = '整体表现较差，需重点整改';
  }

  return `本次测试覆盖 ${totalStations} 个站点，完成单次测试 ${data.totalTests} 次，单次通过率 ${data.overallPassRate}%。站点整体通过率 ${data.stationConclusionStats.passRate}%（通过 ${passed} / 不通过 ${failed} / 不合理 ${unreasonable} / 未完成 ${unfinished}），${overall}。`;
}

function buildWeakPoints(data: ReportData): string[] {
  const points: string[] = [];

  const directions = [
    { name: '进站', stats: data.entryStats },
    { name: '停泊', stats: data.parkingStats },
    { name: '出站', stats: data.exitStats },
  ].sort((a, b) => a.stats.rate - b.stats.rate);

  const worst = directions[0];
  if (worst.stats.rate < 80) {
    points.push(`${worst.name}成功率最低（${worst.stats.rate}%），是本次测试的薄弱环节。`);
  }

  const second = directions[1];
  if (second.stats.rate < 80 && worst.name !== second.name) {
    points.push(`${second.name}成功率（${second.stats.rate}%）同样偏低，需一并关注。`);
  }

  if (data.stationConclusionStats.failed > 0) {
    points.push(`有 ${data.stationConclusionStats.failed} 个站点判定为不通过，建议逐个排查失败原因。`);
  }

  if (data.stationConclusionStats.unreasonable > 0) {
    points.push(`有 ${data.stationConclusionStats.unreasonable} 个站点存在不合理情况，建议运营侧复核站点位置。`);
  }

  if (points.length === 0) {
    points.push('各方向成功率均达到 80% 以上，无明显薄弱环节。');
  }

  return points;
}

function buildTopIssues(data: ReportData): string[] {
  if (data.topIssues.length === 0) {
    return ['本次测试未记录到问题类别。'];
  }

  return data.topIssues.slice(0, 3).map((issue) => {
    return `${issue.category}：${issue.count} 次，占问题总数的 ${issue.percentage}%`;
  });
}

function buildVersionSummary(data: ReportData): string | null {
  if (data.versionChanges.length === 0) {
    return null;
  }

  const change = data.versionChanges[0];
  const { previousVersion, version } = change;

  if (change.improvements.length > 0 && change.regressions.length === 0) {
    return `相比 ${previousVersion}，${version} 在 ${change.improvements.length} 个维度有提升，未出现回退项。`;
  }

  if (change.improvements.length === 0 && change.regressions.length > 0) {
    return `相比 ${previousVersion}，${version} 出现 ${change.regressions.length} 个回退项，需重点排查。`;
  }

  if (change.improvements.length > 0 && change.regressions.length > 0) {
    return `相比 ${previousVersion}，${version} 有 ${change.improvements.length} 个提升项和 ${change.regressions.length} 个回退项。`;
  }

  return `相比 ${previousVersion}，${version} 整体表现基本持平。`;
}

function buildRecommendations(data: ReportData): string[] {
  const recommendations: string[] = [];

  const directions = [
    { name: '进站', stats: data.entryStats },
    { name: '停泊', stats: data.parkingStats },
    { name: '出站', stats: data.exitStats },
  ].sort((a, b) => a.stats.rate - b.stats.rate);

  const worst = directions[0];
  if (worst.stats.rate < 80) {
    recommendations.push(`优先针对「${worst.name}」场景开展算法优化和场景覆盖补充。`);
  }

  if (data.topIssues.length > 0) {
    recommendations.push(`聚焦 TOP 问题「${data.topIssues[0].category}」进行根因分析和专项修复。`);
  }

  if (data.stationConclusionStats.unreasonable > 0) {
    recommendations.push('对站点不合理的情况，建议运营与算法联合评审，调整或取消不合理站点。');
  }

  if (data.stationConclusionStats.failed > 0) {
    recommendations.push('对不通过站点进行复测，确认问题复现后再制定修复方案。');
  }

  if (recommendations.length === 0) {
    recommendations.push('整体表现良好，建议保持当前版本能力，继续扩大站点覆盖。');
  }

  return recommendations;
}

export function analysisToMarkdownText(data: ReportData): string {
  const analysis = analyzeReport(data);
  const lines: string[] = [];

  lines.push('## 测试分析结论');
  lines.push('');
  lines.push(analysis.summary);
  lines.push('');

  if (analysis.weakPoints.length > 0) {
    lines.push('### 薄弱环节');
    analysis.weakPoints.forEach((p) => lines.push(`- ${p}`));
    lines.push('');
  }

  if (analysis.topIssues.length > 0) {
    lines.push('### 主要问题');
    analysis.topIssues.forEach((p) => lines.push(`- ${p}`));
    lines.push('');
  }

  if (analysis.versionSummary) {
    lines.push('### 版本对比');
    lines.push(`- ${analysis.versionSummary}`);
    lines.push('');
  }

  if (analysis.recommendations.length > 0) {
    lines.push('### 优化建议');
    analysis.recommendations.forEach((p) => lines.push(`- ${p}`));
  }

  return lines.join('\n');
}
