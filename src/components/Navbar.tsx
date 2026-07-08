import { Car, FileBarChart } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-card bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-accent text-accent">
            <Car size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Robotaxi 站点测试报告</h1>
            <p className="text-xs text-muted">上传测试数据 · 自动生成报告</p>
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center border border-card text-muted">
          <FileBarChart size={18} />
        </div>
      </div>
    </nav>
  );
}
