import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { ReportData } from '../types';

interface ChartsSectionProps {
  data: ReportData;
}

const GRAY_COLORS = ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

export function ChartsSection({ data }: ChartsSectionProps) {
  const capabilityData = [
    { name: '进站', rate: data.entryStats.rate },
    { name: '停泊', rate: data.parkingStats.rate },
    { name: '出站', rate: data.exitStats.rate },
  ];

  const singleTestData = [
    { name: '单次测试通过', rate: data.singleTestStats.rate },
    { name: '单次测试失败', rate: data.singleTestStats.total > 0 ? 100 - data.singleTestStats.rate : 0 },
  ];

  const conclusionData = [
    { name: '通过', value: data.stationConclusionStats.passed },
    { name: '不通过', value: data.stationConclusionStats.failed },
    { name: '站点不合理', value: data.stationConclusionStats.unreasonable },
    { name: '未完成4次测试法', value: data.stationConclusionStats.unfinished },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-300 bg-slate-200 p-5">
        <h3 className="mb-4 text-sm font-medium text-slate-900">单项能力成功率</h3>
        <div className="h-64 rounded-xl bg-slate-100 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={capabilityData} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" width={60} stroke="#475569" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: '#1e293b' }}
                formatter={(value: number) => [`${value}%`, '成功率']}
              />
              <Bar dataKey="rate" fill="#475569" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-slate-200 p-5">
        <h3 className="mb-4 text-sm font-medium text-slate-900">单次测试通过</h3>
        <div className="h-64 rounded-xl bg-slate-100 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={singleTestData} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" width={80} stroke="#475569" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: '#1e293b' }}
                formatter={(value: number) => [`${value}%`, '占比']}
              />
              <Bar dataKey="rate" fill="#475569" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-slate-200 p-5">
        <h3 className="mb-4 text-sm font-medium text-slate-900">站点结论分布</h3>
        <div className="h-64 rounded-xl bg-slate-100 p-2">
          {conclusionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conclusionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {conclusionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={GRAY_COLORS[index % GRAY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: '#1e293b' }}
                  formatter={(value: number, name: string) => [`${value} 站`, name]}
                />
                <Legend verticalAlign="bottom" height={24} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">暂无站点结论数据</div>
          )}
        </div>
      </div>
    </div>
  );
}
