import { Car, FileBarChart } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 text-slate-600">
            <Car size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Robotaxi 站点测试报告</h1>
            <p className="text-xs text-slate-500">上传测试数据 · 自动生成报告</p>
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-500">
          <FileBarChart size={18} />
        </div>
      </div>
    </nav>
  );
}
