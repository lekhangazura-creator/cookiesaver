import React from 'react';
import { ShieldCheck, Download, Zap, Laptop, FileCode, HelpCircle, HardDrive } from 'lucide-react';

interface Props {
  activeTab: 'simulator' | 'download' | 'code' | 'guide' | 'editor';
  setActiveTab: (tab: 'simulator' | 'download' | 'code' | 'guide' | 'editor') => void;
  onDownloadZip: () => void;
}

export const Header: React.FC<Props> = ({ activeTab, setActiveTab, onDownloadZip }) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-950">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Chrome Full Backup & 1-Click Restore
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                1-Click Auto .EXE
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Lưu trọn vẹn 100% mọi Profiles, Cookies, Mật khẩu & Tabs — Tự động khôi phục 1-click
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            id="nav-tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span className="hidden md:inline">Giao diện</span> Desktop GUI
          </button>

          <button
            id="nav-tab-download"
            onClick={() => setActiveTab('download')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'download'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Tải .EXE & Script</span>
          </button>

          <button
            id="nav-tab-code"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span className="hidden md:inline">Mã nguồn</span> Python
          </button>

          <button
            id="nav-tab-editor"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-bold">Edit File & AI Mod</span>
          </button>

          <button
            id="nav-tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Cơ chế chống Crash</span>
          </button>
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            id="header-btn-download-zip"
            onClick={onDownloadZip}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Tải Trọn Gói .ZIP
          </button>
        </div>
      </div>
    </header>
  );
};
