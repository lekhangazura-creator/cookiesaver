import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, Download, Puzzle, HardDrive, Sparkles, 
  Sun, Moon, Palette, ChevronDown, Check, Sliders, Zap,
  HelpCircle, Clock, BookOpen, Calendar
} from 'lucide-react';
import { ThemePreset } from '../types';

export type AppTab = 'app' | 'extension' | 'download';

export interface Props {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onDownloadZip: () => void;
  currentTheme: ThemePreset;
  onToggleQuickTheme: () => void;
  onSelectTheme?: (theme: ThemePreset) => void;
  onOpenThemeStudio: () => void;
  onOpenTutorial: () => void;
  onOpenScheduler?: () => void;
  schedulerEnabled?: boolean;
  schedulerNextTime?: string;
  appVersion?: string;
}

export const Header: React.FC<Props> = ({ 
  activeTab, 
  setActiveTab,
  currentTheme,
  onToggleQuickTheme,
  onSelectTheme,
  onOpenThemeStudio,
  onOpenTutorial,
  onOpenScheduler,
  schedulerEnabled = false,
  schedulerNextTime,
  appVersion = 'v5.3.0'
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLightMode = currentTheme === 'light-titanium' || currentTheme === 'light-nordic';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions: { id: ThemePreset; name: string; type: 'dark' | 'light'; color: string; tag?: string }[] = [
    { id: 'dark-slate', name: 'Dark Slate (Mặc định)', type: 'dark', color: '#10b981', tag: 'Chuẩn' },
    { id: 'light-titanium', name: 'Light Titanium Clean', type: 'light', color: '#059669', tag: 'Sáng' },
    { id: 'light-nordic', name: 'Light Nordic Frost', type: 'light', color: '#0284c7', tag: 'Mát dịu' },
    { id: 'cyber-oled', name: 'Cyber OLED (Đen Thuần)', type: 'dark', color: '#06b6d4', tag: 'OLED' },
    { id: 'emerald', name: 'Emerald Cyber Matrix', type: 'dark', color: '#10b981', tag: 'Hacker' },
    { id: 'royal-amethyst', name: 'Royal Amethyst (Tím)', type: 'dark', color: '#a855f7', tag: 'Gaming' },
    { id: 'sepia', name: 'Warm Sunset Coffee', type: 'dark', color: '#f59e0b', tag: 'Đêm' },
    { id: 'custom', name: 'Tự Edit Giao Diện (Studio)', type: 'dark', color: '#ec4899', tag: 'Custom' },
  ];

  const currentThemeInfo = themeOptions.find(t => t.id === currentTheme) || themeOptions[0];

  return (
    <header 
      id="main-app-header" 
      className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 transition-all duration-250 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Tiêu đề chính */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-950/60 shrink-0 transition-transform group-hover:scale-105">
                <ShieldCheck className="w-6 h-6 text-white stroke-[2.2]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Chrome Full Backup & 1-Click Restore
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Zap className="w-2.5 h-2.5" />
                  {appVersion} • Auto Memory
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden lg:block">
                Tự động ghi nhớ vị trí • Thanh Progress Bar % • Cảnh báo an toàn thông minh
              </p>
            </div>
          </div>

          {/* Quick theme & tutorial actions on small mobile */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              id="btn-open-tutorial-mobile"
              onClick={onOpenTutorial}
              className="p-2 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer shadow-sm"
              title="Hướng dẫn nhanh"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {onOpenScheduler && (
              <button
                id="btn-open-scheduler-mobile"
                onClick={onOpenScheduler}
                className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
                  schedulerEnabled 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={schedulerEnabled ? "Lập lịch: Đang BẬT" : "Cài đặt lập lịch"}
              >
                <Clock className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-quick-theme-toggle-mobile"
              onClick={onToggleQuickTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
                isLightMode 
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                  : 'bg-slate-800 text-emerald-400 border-slate-700'
              }`}
              title={isLightMode ? "Chuyển sang Chế độ Tối" : "Chuyển sang Chế độ Sáng"}
            >
              {isLightMode ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              id="btn-open-theme-studio-mobile"
              onClick={onOpenThemeStudio}
              className="p-2 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 transition-all cursor-pointer shadow-sm"
              title="Mở Theme Studio"
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cụm Điều Hướng 2 Ngăn (Bản App & Bản Extension) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
            {/* Ngăn 1: Bản App (.EXE / Desktop) */}
            <button
              id="nav-tab-app"
              onClick={() => setActiveTab('app')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'app' || activeTab === 'download'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Sao lưu đầy đủ cả Mật khẩu, Lịch sử, Dấu trang và Dữ liệu vào máy tính"
            >
              <Download className={`w-4 h-4 ${activeTab === 'app' || activeTab === 'download' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>💻 Bản Máy Tính (.EXE)</span>
            </button>

            {/* Ngăn 2: Bản Extension */}
            <button
              id="nav-tab-extension"
              onClick={() => setActiveTab('extension')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'extension'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Cài đặt tiện ích trực tiếp vào trình duyệt Google Chrome trong 10 giây"
            >
              <Puzzle className={`w-4 h-4 ${activeTab === 'extension' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>🧩 Bản Tiện Ích (Extension)</span>
            </button>
          </nav>

          {/* ==========================================================
              CỤM NÚT CHUYỂN ĐỔI GIAO DIỆN (THEME TOGGLE SWITCH & MENU)
              ========================================================== */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs relative" ref={menuRef}>
            {/* NÚT CHUYỂN ĐỔI GIAO DIỆN (THEME TOGGLE SWITCH SÁNG / TỐI) */}
            <div 
              id="theme-toggle-segmented"
              className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800"
              title="Chuyển nhanh giữa Chế độ Sáng và Tối"
            >
              <button
                id="btn-switch-to-light"
                onClick={() => {
                  if (!isLightMode) onToggleQuickTheme();
                }}
                className={`px-2.5 py-1.5 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isLightMode
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className={`w-3.5 h-3.5 ${isLightMode ? 'text-slate-950 fill-slate-950' : 'text-amber-400'}`} />
                <span>Sáng</span>
              </button>

              <button
                id="btn-switch-to-dark"
                onClick={() => {
                  if (isLightMode) onToggleQuickTheme();
                }}
                className={`px-2.5 py-1.5 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  !isLightMode
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className={`w-3.5 h-3.5 ${!isLightMode ? 'text-slate-950 fill-slate-950' : 'text-emerald-400'}`} />
                <span>Tối</span>
              </button>
            </div>

            {/* NÚT MENU CHỌN NHANH CÁC GIAO DIỆN (QUICK PRESET DROPDOWN) */}
            <button
              id="btn-quick-theme-dropdown"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
              title="Chọn nhanh trong danh sách các giao diện hoặc mở Theme Studio"
            >
              <span 
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20 shadow-sm"
                style={{ backgroundColor: currentThemeInfo.color }}
              />
              <span className="hidden xl:inline max-w-[100px] truncate font-medium">
                {currentThemeInfo.name.split(' (')[0]}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* NÚT MỞ THEME STUDIO ĐẦY ĐỦ */}
            <button
              id="btn-open-theme-studio"
              onClick={onOpenThemeStudio}
              className="px-3 py-1.5 rounded-lg font-bold text-xs bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 hover:from-emerald-500/20 hover:to-cyan-500/20 text-emerald-300 hover:text-white border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Theme Studio: Tự do chỉnh màu, bo góc, xuất nhập JSON"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Theme Studio</span>
            </button>

            {/* NÚT TRẠNG THÁI LẬP LỊCH SAO LƯU (SCHEDULER QUICK ACCESS) */}
            {onOpenScheduler && (
              <button
                id="btn-open-scheduler-header"
                onClick={onOpenScheduler}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  schedulerEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Lập Lịch Sao Lưu Tự Động: Tần suất hàng ngày / hàng tuần"
              >
                <Clock className={`w-3.5 h-3.5 ${schedulerEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <span>{schedulerEnabled ? (schedulerNextTime ? `Lịch: ${schedulerNextTime}` : 'Lịch: BẬT') : 'Lập Lịch'}</span>
                {schedulerEnabled && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            )}

            {/* NÚT 'HƯỚNG DẪN NHANH' (HELP/TUTORIAL) KÈM TOOLTIP HOVER & MODAL TRIGGER */}
            <div className="relative">
              <button
                id="btn-header-quick-guide"
                onClick={onOpenTutorial}
                onMouseEnter={() => setShowHelpTooltip(true)}
                onMouseLeave={() => setShowHelpTooltip(false)}
                className="px-3.5 py-1.5 rounded-lg font-extrabold text-xs bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-cyan-950/50 group"
                title="Xem Hướng dẫn nhanh chi tiết tất cả các thành phần trong app"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Hướng dẫn nhanh</span>
                <span className="text-[10px] bg-cyan-500/30 text-cyan-200 px-1 rounded font-mono font-bold">
                  (?)
                </span>
              </button>

              {/* Tooltip Giải Thích Nhanh Khi Hover */}
              {showHelpTooltip && (
                <div 
                  id="tooltip-quick-guide"
                  className="absolute top-full right-0 mt-2 w-72 bg-slate-950 border border-cyan-500/60 rounded-xl shadow-2xl p-3 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 text-left"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1 border-b border-slate-800 pb-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>HƯỚNG DẪN NHANH & GIẢI THÍCH APP</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Nhấp vào để mở <strong>Modal Hướng Dẫn Chi Tiết</strong> giải thích toàn bộ thành phần: Sao lưu 1-Click, Khôi phục, Lập lịch tự động (Scheduler), Tải bản .EXE, Chrome Extension và mẹo sửa lỗi Normal Exit.
                  </p>
                  <div className="mt-2 text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                    <span>💡 Nhấp chuột để mở hướng dẫn chi tiết</span>
                  </div>
                </div>
              )}
            </div>

            {/* DROPDOWN MENU CHỌN NHANH THEME */}
            {showThemeMenu && (
              <div 
                id="dropdown-theme-list"
                className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 text-[11px] font-bold text-slate-400 border-b border-slate-800">
                  <span>DANH SÁCH GIAO DIỆN</span>
                  <span className="text-emerald-400 font-mono">{themeOptions.length} chủ đề</span>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {themeOptions.map((opt) => {
                    const isSelected = currentTheme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (onSelectTheme) onSelectTheme(opt.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full border border-white/20 shadow-sm shrink-0" 
                            style={{ backgroundColor: opt.color }}
                          />
                          <span className="truncate">{opt.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {opt.tag && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                              {opt.tag}
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 mt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setShowThemeMenu(false);
                      onOpenThemeStudio();
                    }}
                    className="w-full py-2 px-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mở Studio Tự Edit Màu Sắc</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
