import { useState } from 'react';
import { parseText } from '../utils/parser';
import { calculateReport } from '../utils/calculator';
import { useReportStore } from '../store/useReportStore';

export function TextInput() {
  const [text, setText] = useState('');
  const { setRecords, setReport, setError, setLoading } = useReportStore();

  const handleParse = () => {
    setLoading(true);
    setError(null);
    try {
      const records = parseText(text);
      if (records.length === 0) {
        setError('未解析到有效测试记录，请检查文本格式。');
        return;
      }
      setRecords(records);
      setReport(calculateReport(records));
    } catch (err) {
      setError(err instanceof Error ? err.message : '文本解析失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">粘贴文本数据</h3>
        <span className="text-xs text-slate-500">支持逗号 / 制表符分隔</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="站点名称,版本,测试类型,测试结果,问题类别,影响方向..."
        rows={5}
        className="resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={handleParse}
        disabled={!text.trim()}
        className="self-start rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
      >
        解析文本
      </button>
    </div>
  );
}
