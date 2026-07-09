import { useCallback } from 'react';
import { Upload, FileSpreadsheet, FileJson, FileText } from 'lucide-react';
import { parseFile } from '../utils/parser';
import { calculateReport } from '../utils/calculator';
import { useReportStore } from '../store/useReportStore';

export function UploadZone() {
  const { setRecords, setReport, setError, setLoading } = useReportStore();

  const handleFile = useCallback(async (file: File) => {
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
  }, [setLoading, setError, setRecords, setReport]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="group relative flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center transition-colors hover:border-accent hover:bg-slate-50"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-accent text-accent transition-transform group-hover:scale-105">
        <Upload size={28} />
      </div>
      <div>
        <p className="text-base font-medium text-slate-900">拖拽文件到此处，或点击上传</p>
        <p className="mt-2 text-sm text-muted">支持 CSV、Excel（.xlsx / .xls）、JSON</p>
      </div>
      <label className="cursor-pointer rounded-lg border border-accent bg-white px-6 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white">
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
