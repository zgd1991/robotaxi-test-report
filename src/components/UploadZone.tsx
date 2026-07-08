import { useCallback } from 'react';
import { Upload, FileSpreadsheet, FileJson, FileText } from 'lucide-react';
import { parseFile } from '../utils/parser';
import { calculateReport } from '../utils/calculator';
import { useReportStore } from '../store/useReportStore';

export function UploadZone() {
  const { setRecords, setReport, setError, setLoading } = useReportStore();

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const records = await parseFile(file);
      if (records.length === 0) {
        setError('未解析到有效测试记录，请检查文件格式和字段。');
        return;
      }
      setRecords(records);
      setReport(calculateReport(records));
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件解析失败');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="group relative flex flex-col items-center justify-center gap-6 rounded border-2 border-dashed border-card bg-card/50 p-12 text-center transition-colors hover:border-accent hover:bg-card"
    >
      <div className="flex h-16 w-16 items-center justify-center border border-accent text-accent transition-transform group-hover:scale-105">
        <Upload size={28} />
      </div>
      <div>
        <p className="text-base font-medium text-white">拖拽文件到此处，或点击上传</p>
        <p className="mt-2 text-sm text-muted">支持 CSV、Excel（.xlsx / .xls）、JSON</p>
      </div>
      <label className="cursor-pointer border border-accent px-6 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg">
        选择文件
        <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={onInputChange} className="hidden" />
      </label>
      <div className="flex gap-6 text-muted">
        <FileText size={20} />
        <FileSpreadsheet size={20} />
        <FileJson size={20} />
      </div>
    </div>
  );
}
