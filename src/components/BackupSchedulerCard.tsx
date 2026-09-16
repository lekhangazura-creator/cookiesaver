import React from 'react';
import { 
  Clock, Calendar, Check, Bell, ShieldCheck, 
  ChevronRight, Power, Play, Sliders, Laptop, Sparkles 
} from 'lucide-react';
import { BackupSchedulerConfig } from '../types';
import { QuickGuideButton } from './QuickGuideModal';

interface Props {
  config: BackupSchedulerConfig;
  onToggle: () => void;
  onOpenModal: () => void;
  onTriggerTest: () => void;
}

export const BackupSchedulerCard: React.FC<Props> = ({
  config,
  onToggle,
  onOpenModal,
  onTriggerTest
}) => {
  const daysOfWeekNames = [
    'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
  ];

  const getFrequencyLabel = () => {
    switch (config.frequency) {
      case 'daily':
        return `Hàng ngày vào lúc ${config.time}`;
      case 'weekly':
        return `${daysOfWeekNames[config.dayOfWeek]} hàng tuần vào ${config.time}`;
      case 'hourly':
        return `Mỗi ${config.intervalHours || 4} giờ một lần`;
      case 'on_startup':
        return 'Tự động khi khởi động máy tính';
      default:
        return `Định kỳ vào lúc ${config.time}`;
    }
  };

  return (
    <section 
      id="section-backup-scheduler"
      className={`rounded-xl border p-4 sm:p-5 transition-all duration-300 relative overflow-hidden ${
        config.enabled
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
          : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      {/* Background glow when active */}
      {config.enabled && (
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header bar of Scheduler Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
            config.enabled
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-950'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                ⏰ Lập Lịch Sao Lưu Tự Động (Auto Scheduler)
              </h3>
              <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                config.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {config.enabled ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Đang Chạy Ngầm
                  </>
                ) : 'Đang Tắt'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tự động lưu trữ định kỳ các Profiles & Cookies để bạn không bao giờ phải lo quên sao lưu
            </p>
          </div>
        </div>

        {/* Action buttons on header */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <QuickGuideButton topicId="scheduler" label="Hướng dẫn Lập Lịch (?)" />

          {/* Quick Toggle switch */}
          <button
            id="btn-scheduler-card-toggle"
            type="button"
            onClick={onToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
              config.enabled
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{config.enabled ? 'ĐANG BẬT' : 'BẬT LỊCH'}</span>
          </button>
        </div>
      </div>

      {/* Scheduler details & quick config grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-4">
        {/* Box 1: Tần suất & Thời gian */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tần Suất Sao Lưu
            </span>
            <div className="font-bold text-white text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{getFrequencyLabel()}</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Tự động kích hoạt không làm gián đoạn</span>
          </div>
        </div>

        {/* Box 2: Tùy chọn bảo vệ */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tự Động Bảo Vệ
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-200">
                <Check className={`w-3.5 h-3.5 ${config.autoCloseChrome ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Tự đóng Chrome (tránh khóa SQLite)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-200">
                <Bell className={`w-3.5 h-3.5 ${config.notifyBeforeMinutes > 0 ? 'text-amber-400' : 'text-slate-600'}`} />
                <span>Nhắc trước 5 phút qua thông báo</span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Lưu tối đa {config.maxRetentionBackups > 0 ? `${config.maxRetentionBackups} bản gần nhất` : 'vô hạn'}
          </div>
        </div>

        {/* Box 3: Thao tác cấu hình & Test Run */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Hành Động Scheduler
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              <button
                id="btn-open-scheduler-modal"
                onClick={onOpenModal}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tùy Chỉnh Lịch</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>

              <button
                id="btn-test-scheduler-now"
                onClick={onTriggerTest}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Chạy thử nghiệm một tiến trình sao lưu theo lịch ngay lập tức"
              >
                <Play className="w-3 h-3 fill-emerald-400" />
                <span>Chạy Thử Ngay</span>
              </button>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-emerald-400/90 flex items-center gap-1 font-medium">
            <Laptop className="w-3 h-3 text-emerald-400" />
            <span>Đã tích hợp trong Desktop App: Chạy ngầm trong khay hệ thống (System Tray)</span>
          </div>
        </div>
      </div>
      
      {/* Desktop App Background Notice */}
      <div className="mt-2 pt-2.5 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Đồng bộ Desktop App:</strong> Mọi cài đặt lịch & lựa chọn Profiles này đều có trong ứng dụng Desktop. Khi bạn mở app Desktop, nó có thể thu nhỏ chạy ngầm dưới khay hệ thống (System Tray) để sao lưu đúng hẹn.
          </span>
        </div>
      </div>
    </section>
  );
};
