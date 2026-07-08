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
    <div className="flex flex-col gap-4 rounded border border-card bg-card/50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">粘贴文本数据</h3>
        <span className="text-xs text-muted">支持逗号 / 制表符分隔</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="站点名称,版本,测试类型,测试结果,问题类别,影响方向..."
        rows={5}
        className="resize-none rounded border border-card bg-bg p-4 text-sm text-white placeholder-muted focus:border-accent focus:outline-none"
      />
      <button
        type="button"
        onClick={handleParse}
        disabled={!text.trim()}
        className="self-start border border-accent px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-40"
      >
        解析文本
      </button>
    </div>
  );
}
