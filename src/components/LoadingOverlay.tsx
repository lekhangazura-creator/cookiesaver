import React from 'react';
import { Loader2, Package, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  type?: 'zip' | 'uninstall' | 'general';
  progress?: number;
}

export const LoadingOverlay: React.FC<Props> = ({
  isOpen,
  title,
  subtitle = 'Vui lòng chờ trong giây lát, tiến trình đang được xử lý an toàn...',
  type = 'general',
  progress
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="fullscreen-loading-overlay"
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow backdrop accent */}
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
          type === 'uninstall' ? 'bg-red-500/20' : 'bg-blue-500/20'
        }`} />

        {/* Spinner & Center Icon */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center">
            {/* Outer spinning ring */}
            <div className={`w-20 h-20 rounded-full border-4 border-transparent animate-spin absolute ${
              type === 'uninstall' 
                ? 'border-t-red-500 border-r-rose-400' 
                : 'border-t-blue-500 border-r-cyan-400'
            }`} />
            
            {/* Center icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
              type === 'uninstall' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {type === 'uninstall' ? (
                <Trash2 className="w-6 h-6 animate-pulse" />
              ) : type === 'zip' ? (
                <Package className="w-6 h-6 animate-bounce" />
              ) : (
                <Loader2 className="w-6 h-6 animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mb-2">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed mb-4">
          {subtitle}
        </p>

        {/* Optional Progress bar */}
        {typeof progress === 'number' && (
          <div className="w-full mb-4">
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">
              Đang xử lý: {progress}%
            </span>
          </div>
        )}

        {/* Notice badge */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Vui lòng không đóng trình duyệt trong khi xử lý</span>
        </div>
      </div>
    </div>
  );
};
