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

const COLORS = ['#00F0FF', '#FF5F57', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

export function ChartsSection({ data }: ChartsSectionProps) {
  const capabilityData = [
    { name: '进站', rate: data.entryStats.rate },
    { name: '停泊', rate: data.parkingStats.rate },
    { name: '出站', rate: data.exitStats.rate },
  ];

  const overallData = [
    { name: '单次测试通过率', rate: data.singleTestStats.rate },
    { name: '站点整体通过率', rate: data.stationOverallStats.rate },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded border border-card bg-card/50 p-5">
        <h3 className="mb-4 text-sm font-medium text-white">单项能力成功率</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={capabilityData} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" width={60} stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#151B2B', color: '#e2e8f0' }}
                formatter={(value: number) => [`${value}%`, '成功率']}
              />
              <Bar dataKey="rate" fill="#00F0FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded border border-card bg-card/50 p-5">
        <h3 className="mb-4 text-sm font-medium text-white">通过率对比</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overallData} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#151B2B', color: '#e2e8f0' }}
                formatter={(value: number) => [`${value}%`, '通过率']}
              />
              <Bar dataKey="rate" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded border border-card bg-card/50 p-5">
        <h3 className="mb-4 text-sm font-medium text-white">问题分类占比</h3>
        <div className="h-64">
          {data.issueStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.issueStats}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {data.issueStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#151B2B', color: '#e2e8f0' }}
                  formatter={(value: number, name: string, props: { payload?: { percentage?: number } }) => [`${value} 次 (${props?.payload?.percentage ?? 0}%)`, name]}
                />
                <Legend verticalAlign="bottom" height={24} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">暂无问题数据</div>
          )}
        </div>
      </div>
    </div>
  );
}
