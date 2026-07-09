import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadZone } from '../components/UploadZone';
import { TextInput } from '../components/TextInput';
import { sampleData } from '../utils/sampleData';
import { calculateReport } from '../utils/calculator';
import { useReportStore } from '../store/useReportStore';
import { Database } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { report, error, setRecords, setReport, setError, setLoading } = useReportStore();

  useEffect(() => {
    if (report) {
      navigate('/report');
    }
  }, [report, navigate]);

  const loadSampleData = () => {
    setLoading(true);
    setError(null);
    try {
      const records = sampleData;
      setRecords(records);
      setReport(calculateReport(records));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载示例数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">生成测试报告</h2>
        <p className="mt-3 text-muted">上传 CSV / Excel / JSON 文件，或粘贴文本数据，自动生成 Robotaxi 无人车站点测试报告。</p>
      </div>

      <UploadZone />

      <TextInput />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={loadSampleData}
          className="flex items-center gap-2 rounded border border-slate-200 bg-white px-5 py-2.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Database size={16} />
          加载示例数据
        </button>
      </div>

      {error && (
        <div className="rounded border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      )}
    </div>
  );
}
