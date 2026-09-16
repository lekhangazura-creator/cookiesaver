import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, Bell, ShieldCheck, Check, X, AlertTriangle, 
  Play, Download, Copy, CheckCheck, RefreshCw, Zap, Sliders,
  Laptop, Apple, HardDrive, Sparkles, Power, Layers
} from 'lucide-react';
import { BackupSchedulerConfig, SchedulerFrequency } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: BackupSchedulerConfig;
  onSaveConfig: (newConfig: BackupSchedulerConfig) => void;
  onTriggerTestRun: () => void;
  backupPath: string;
}

export const BackupSchedulerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTriggerTestRun,
  backupPath
}) => {
  const [currentConfig, setCurrentConfig] = useState<BackupSchedulerConfig>(config);
  const [activeTab, setActiveTab] = useState<'settings' | 'os_integration'>('settings');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCron, setCopiedCron] = useState(false);

  useEffect(() => {
    setCurrentConfig(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleToggle = () => {
    const updated = { ...currentConfig, enabled: !currentConfig.enabled };
    setCurrentConfig(updated);
    onSaveConfig(updated);
  };

  const handleFrequencyChange = (freq: SchedulerFrequency) => {
    const updated = { ...currentConfig, frequency: freq };
    setCurrentConfig(updated);
    onSaveConfig(updated);
  };

  // Generate Windows Task Scheduler Command (schtasks)
  const getWindowsSchtasksCommand = () => {
    const timeParts = currentConfig.time.split(':');
    const hh = timeParts[0] || '20';
    const mm = timeParts[1] || '00';

    let freqParam = '/sc DAILY';
    if (currentConfig.frequency === 'weekly') {
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayStr = days[currentConfig.dayOfWeek] || 'FRI';
      freqParam = `/sc WEEKLY /d ${dayStr}`;
    } else if (currentConfig.frequency === 'hourly') {
      freqParam = `/sc HOURLY /mo ${currentConfig.intervalHours || 4}`;
    } else if (currentConfig.frequency === 'on_startup') {
      freqParam = '/sc ONSTART';
    }

    return `schtasks /create /tn "ChromeAutoBackupService" /tr "\\"${backupPath}\\\\backup_chrome.bat\\" --silent" ${freqParam} /st ${hh}:${mm} /f /rl HIGHEST`;
  };

  // Generate macOS / Linux Crontab line
  const getCrontabLine = () => {
    const [hh, mm] = currentConfig.time.split(':');
    const m = parseInt(mm || '0', 10);
    const h = parseInt(hh || '20', 10);

    if (currentConfig.frequency === 'weekly') {
      return `${m} ${h} * * ${currentConfig.dayOfWeek} ~/Documents/Chrome_Backups/backup_chrome_unix.sh --silent`;
    }
    if (currentConfig.frequency === 'hourly') {
      return `0 */${currentConfig.intervalHours || 4} * * * ~/Documents/Chrome_Backups/backup_chrome_unix.sh --silent`;
    }
    // Daily
    return `${m} ${h} * * * ~/Documents/Chrome_Backups/backup_chrome_unix.sh --silent`;
  };

  const downloadWindowsTaskBat = () => {
    const batContent = `@echo off
chcp 65001 >nul
title CÀI ĐẶT LẬP LỊCH SAO LƯU TỰ ĐỘNG CHROME
echo ======================================================================
echo    THIẾT LẬP LỊCH SAO LƯU CHROME TỰ ĐỘNG VÀO WINDOWS TASK SCHEDULER
echo ======================================================================
echo.
echo [*] Thư mục sao lưu: "${backupPath}"
echo [*] Tần suất: ${currentConfig.frequency} (Lúc ${currentConfig.time})
echo [*] Tự động đóng Chrome an toàn: ${currentConfig.autoCloseChrome ? 'CÓ' : 'KHÔNG'}
echo.
echo Đang đăng ký tác vụ tự động ngầm vào Windows...
${getWindowsSchtasksCommand()}
echo.
if %errorlevel% equ 0 (
    echo [✓ THÀNH CÔNG] Đã kích hoạt lịch sao lưu tự động thành công!
    echo Máy tính sẽ tự động sao lưu Chrome profiles theo lịch đã đặt.
) else (
    echo [!] Vui lòng chạy tệp này với quyền Administrator (Run as Administrator) để tạo Task!
)
echo.
pause
`;
    const blob = new Blob([batContent], { type: 'application/x-bat;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CAI_DAT_LICH_TU_DONG_WINDOWS.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, type: 'script' | 'cron') => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedCron(true);
      setTimeout(() => setCopiedCron(false), 2000);
    }
  };

  const daysOfWeekNames = [
    'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
  ];

  return (
    <div 
      id="scheduler-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="scheduler-modal-card"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border transition-all ${
              currentConfig.enabled 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-950' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Bộ Lập Lịch Sao Lưu Tự Động (Auto Backup Scheduler)
                </h2>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold border ${
                  currentConfig.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {currentConfig.enabled ? 'Đang Bật (Active)' : 'Đang Tắt'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tự động sao lưu định kỳ để bảo vệ dữ liệu profiles & cookies mà không lo quên thao tác
              </p>
            </div>
          </div>

          <button 
            id="btn-close-scheduler-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs: Cấu hình nhanh vs Xuất Task Windows/Mac */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cài Đặt Tần Suất & Thời Gian</span>
            </button>
            <button
              onClick={() => setActiveTab('os_integration')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'os_integration'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>Cài Vào Windows Task / Cron Script</span>
            </button>
          </div>

          {/* Công tắc Bật/Tắt to rõ ràng */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              Trạng thái:
            </span>
            <button
              id="btn-toggle-scheduler-power"
              onClick={handleToggle}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
                currentConfig.enabled
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{currentConfig.enabled ? 'BẬT TỰ ĐỘNG' : 'TẮT TỰ ĐỘNG'}</span>
            </button>
          </div>
        </div>

        {/* Nội dung Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'settings' ? (
            <div className="space-y-5">
              {/* Banner trạng thái lần chạy tiếp theo */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                currentConfig.enabled
                  ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-500/40'
                  : 'bg-slate-950/60 border-slate-800 opacity-75'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    currentConfig.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>LẦN SAO LƯU TIẾP THEO:</span>
                      {currentConfig.enabled && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Hẹn giờ: {currentConfig.time}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentConfig.enabled 
                        ? `Lịch định kỳ: ${currentConfig.frequency === 'daily' ? 'Hàng ngày' : currentConfig.frequency === 'weekly' ? `${daysOfWeekNames[currentConfig.dayOfWeek]} hàng tuần` : currentConfig.frequency === 'hourly' ? `Mỗi ${currentConfig.intervalHours} giờ` : 'Khi khởi động'} vào lúc ${currentConfig.time}.`
                        : 'Lịch tự động hiện đang Tắt. Hãy bật công tắc bên trên để kích hoạt.'}
                    </p>
                  </div>
                </div>

                {/* Nút thử nghiệm chạy ngay */}
                <button
                  id="btn-test-trigger-scheduler"
                  onClick={() => {
                    onClose();
                    onTriggerTestRun();
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950 cursor-pointer shrink-0"
                  title="Thử nghiệm chạy một phiên sao lưu theo lịch ngay lập tức"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Thử nghiệm chạy ngay</span>
                </button>
              </div>

              {/* 1. CHỌN TẦN SUẤT SAO LƯU (FREQUENCY) */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>1. Chọn Tần Suất Sao Lưu Tự Động:</span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Khuyên dùng: Hàng ngày vào cuối ngày
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {([
                    { id: 'daily', name: 'Hàng ngày', desc: 'Mỗi ngày vào giờ cố định' },
                    { id: 'weekly', name: 'Hàng tuần', desc: '1 lần / tuần vào thứ cụ thể' },
                    { id: 'hourly', name: 'Mỗi X giờ', desc: 'Định kỳ 4h - 12h một lần' },
                    { id: 'on_startup', name: 'Khi mở máy', desc: 'Khi hệ thống khởi động' }
                  ] as const).map((item) => {
                    const isSel = currentConfig.frequency === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`btn-freq-${item.id}`}
                        onClick={() => handleFrequencyChange(item.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSel
                            ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs">{item.name}</span>
                          {isSel && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal leading-tight">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. CHỌN THỜI GIAN CỤ THỂ (TIME & DAYS) */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-white block">
                  2. Khung Giờ & Ngày Chạy Định Kỳ:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ô nhập giờ */}
                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Thời gian chạy (Giờ:Phút):</span>
                      <span className="text-[10px] text-slate-400">Định dạng 24h (ví dụ 20:00 hoặc 12:30)</span>
                    </div>
                    <input
                      id="input-scheduler-time"
                      type="time"
                      value={currentConfig.time}
                      onChange={(e) => {
                        const updated = { ...currentConfig, time: e.target.value };
                        setCurrentConfig(updated);
                        onSaveConfig(updated);
                      }}
                      className="bg-slate-950 border border-slate-700 text-emerald-400 text-sm font-mono font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Lựa chọn theo tuần nếu chọn Weekly */}
                  {currentConfig.frequency === 'weekly' ? (
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">Ngày trong tuần:</span>
                        <span className="text-[10px] text-slate-400">Chọn ngày sao lưu định kỳ</span>
                      </div>
                      <select
                        value={currentConfig.dayOfWeek}
                        onChange={(e) => {
                          const updated = { ...currentConfig, dayOfWeek: parseInt(e.target.value, 10) };
                          setCurrentConfig(updated);
                          onSaveConfig(updated);
                        }}
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {daysOfWeekNames.map((name, idx) => (
                          <option key={idx} value={idx}>{name}</option>
                        ))}
                      </select>
                    </div>
                  ) : currentConfig.frequency === 'hourly' ? (
                    /* Lựa chọn khoảng cách giờ */
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">Khoảng cách lặp lại:</span>
                        <span className="text-[10px] text-slate-400">Sau mỗi chu kỳ giờ</span>
                      </div>
                      <select
                        value={currentConfig.intervalHours}
                        onChange={(e) => {
                          const updated = { ...currentConfig, intervalHours: parseInt(e.target.value, 10) };
                          setCurrentConfig(updated);
                          onSaveConfig(updated);
                        }}
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value={2}>Mỗi 2 giờ</option>
                        <option value={4}>Mỗi 4 giờ (Khuyên dùng)</option>
                        <option value={8}>Mỗi 8 giờ</option>
                        <option value={12}>Mỗi 12 giờ</option>
                      </select>
                    </div>
                  ) : (
                    /* Mặc định cho Daily */
                    <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-slate-400">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Hệ thống sẽ chạy tự động mỗi ngày vào <strong>{currentConfig.time}</strong> mà không cần mở lại cài đặt này.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. CÁC TÙY CHỌN BẢO VỆ THÔNG MINH */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-white block">
                  3. Tùy Chọn An Toàn & Tối Ưu Tự Động:
                </label>

                <div className="space-y-2.5 text-xs">
                  {/* Tự động tắt Chrome */}
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-white block">Tự động đóng Chrome an toàn trước khi sao lưu</span>
                        <span className="text-[11px] text-slate-400">Giải phóng 100% khóa file SQLite (Network/Cookies, Login Data) chống lỗi tệp</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentConfig.autoCloseChrome}
                      onChange={(e) => {
                        const updated = { ...currentConfig, autoCloseChrome: e.target.checked };
                        setCurrentConfig(updated);
                        onSaveConfig(updated);
                      }}
                      className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-950 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  {/* Nhắc nhở trước 5 phút */}
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                    <div className="flex items-start gap-2.5">
                      <Bell className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-white block">Hiển thị thông báo nhắc nhở trước 5 phút</span>
                        <span className="text-[11px] text-slate-400">Gửi thông báo trên màn hình để bạn chuẩn bị lưu các tab công việc</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentConfig.notifyBeforeMinutes > 0}
                      onChange={(e) => {
                        const updated = { ...currentConfig, notifyBeforeMinutes: e.target.checked ? 5 : 0 };
                        setCurrentConfig(updated);
                        onSaveConfig(updated);
                      }}
                      className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-950 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  {/* Tự động dọn dẹp giữ lại N bản */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-start gap-2.5">
                      <HardDrive className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-white block">Giới hạn số bản sao lưu lưu trữ (Retention)</span>
                        <span className="text-[11px] text-slate-400">Tự động xóa bản cũ nhất khi vượt quá số lượng để không đầy ổ cứng</span>
                      </div>
                    </div>
                    <select
                      value={currentConfig.maxRetentionBackups}
                      onChange={(e) => {
                        const updated = { ...currentConfig, maxRetentionBackups: parseInt(e.target.value, 10) };
                        setCurrentConfig(updated);
                        onSaveConfig(updated);
                      }}
                      className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value={3}>Giữ 3 bản gần nhất</option>
                      <option value={5}>Giữ 5 bản gần nhất (Khuyên dùng)</option>
                      <option value={10}>Giữ 10 bản gần nhất</option>
                      <option value={0}>Giữ tất cả (Không giới hạn)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ==========================================================
               TAB 2: CÀI VÀO WINDOWS TASK SCHEDULER / CRONTAB (THỰC TẾ)
               ========================================================== */
            <div className="space-y-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-blue-500/40 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <Laptop className="w-4 h-4" />
                  <span>KÍCH HOẠT CHẠY NGẦM THỰC TẾ TRÊN MÁY TÍNH (WINDOWS / MACOS / LINUX)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Để quá trình sao lưu tự động chạy <strong>kể cả khi bạn đã đóng trình duyệt</strong>, bạn có thể tạo một tác vụ ngầm (Background Task) trong hệ điều hành bằng công cụ 1-Click dưới đây:
                </p>
              </div>

              {/* Windows Task Scheduler */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span>🪟 Windows Task Scheduler (Khuyên dùng cho Windows 10/11)</span>
                  </span>
                  <button
                    onClick={downloadWindowsTaskBat}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Tải tệp .bat để tạo Task tự động với 1 cú click"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File .BAT Tạo Lịch</span>
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                    {getWindowsSchtasksCommand()}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(getWindowsSchtasksCommand(), 'script')}
                    className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    {copiedScript ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Đã sao chép' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  💡 Mở Command Prompt (cmd) với quyền <em>Run as Administrator</em> và dán lệnh trên để kích hoạt.
                </p>
              </div>

              {/* macOS / Linux Crontab */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span>🍎 macOS & 🐧 Linux Crontab</span>
                  </span>
                </div>

                <div className="relative">
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                    {getCrontabLine()}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(getCrontabLine(), 'cron')}
                    className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    {copiedCron ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCron ? 'Đã sao chép' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  💡 Chạy <code className="text-amber-300 font-mono">crontab -e</code> trong Terminal và dán dòng trên vào cuối file.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cấu hình tự động đồng bộ vào localStorage & config.json</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Đóng
            </button>
            <button
              id="btn-save-scheduler-config"
              onClick={() => {
                onSaveConfig(currentConfig);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Lưu Cấu Hình Lịch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
