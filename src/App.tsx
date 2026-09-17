/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { Header, AppTab } from './components/Header';
import { ChromeFullBackup } from './components/ChromeFullBackup';
import { DownloadCenter } from './components/DownloadCenter';
import { ChromeExtensionCenter } from './components/ChromeExtensionCenter';
import { ThemeStudioModal } from './components/ThemeStudioModal';
import { VersionUpdateChecker } from './components/VersionUpdateChecker';
import { LoadingOverlay } from './components/LoadingOverlay';
import { AppTutorialModal } from './components/AppTutorialModal';
import { BackupSchedulerModal } from './components/BackupSchedulerModal';
import { ThemePreset, CustomThemeSettings, BackupSchedulerConfig } from './types';
import { 
  PYTHON_SCRIPT_CODE, 
  BUILD_BAT_CODE, 
  REQUIREMENTS_TXT, 
  POWERSHELL_SCRIPT,
  RUN_POWERSHELL_BAT,
  RUN_PYTHON_BAT,
  UNINSTALL_BAT_CODE,
  RUN_MACOS_COMMAND,
  RUN_LINUX_SH,
  BACKUP_CHROME_UNIX_SH,
  UNINSTALL_UNIX_SH,
  RUN_SILENT_VBS,
  TAO_SHORTCUT_DESKTOP_BAT
} from './data/pythonScript';
import { EXTENSION_MANIFEST, EXTENSION_POPUP_HTML, EXTENSION_POPUP_JS, EXTENSION_BACKGROUND_JS, EXTENSION_STYLE_CSS } from './data/extensionFiles';
import { ShieldCheck, HardDrive, Download, Puzzle, CheckCircle2, Zap } from 'lucide-react';

export const APP_VERSION = 'v5.3.0';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('backup');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Full-screen Loading Overlay State
  const [loadingOverlay, setLoadingOverlay] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    type?: 'zip' | 'uninstall' | 'general';
    progress?: number;
  }>({
    isOpen: false,
    title: '',
    type: 'general'
  });

  // Theme Management
  const [theme, setTheme] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem('chrome_backup_theme_preset');
    return (saved as ThemePreset) || 'dark-slate';
  });

  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState<boolean>(false);

  // Backup Scheduler Configuration State (Tự động ghi nhớ qua localStorage)
  const defaultSchedulerConfig: BackupSchedulerConfig = {
    enabled: true,
    frequency: 'daily',
    time: '20:00',
    dayOfWeek: 5,
    intervalHours: 4,
    intervalDays: 1,
    autoCloseChrome: true,
    notifyBeforeMinutes: 5,
    maxRetentionBackups: 5,
    smartSpeed: true
  };

  const [schedulerConfig, setSchedulerConfig] = useState<BackupSchedulerConfig>(() => {
    const saved = localStorage.getItem('chrome_backup_scheduler_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultSchedulerConfig;
  });

  const handleSaveSchedulerConfig = (newConfig: BackupSchedulerConfig) => {
    setSchedulerConfig(newConfig);
    localStorage.setItem('chrome_backup_scheduler_config', JSON.stringify(newConfig));
    const freqLabels: Record<string, string> = {
      daily: 'Hàng ngày',
      weekly: 'Hàng tuần',
      hourly: 'Mỗi giờ',
      days: 'Định kỳ ngày'
    };
    const freqName = freqLabels[newConfig.frequency] || newConfig.frequency;
    showToast(newConfig.enabled 
      ? `Đã lưu lịch sao lưu: ${freqName} lúc ${newConfig.time}` 
      : 'Đã tạm tắt chế độ sao lưu định kỳ'
    );
  };

  const defaultCustomSettings: CustomThemeSettings = {
    mode: 'dark',
    accentColor: '#10b981',
    bgColor: '#020617',
    cardColor: '#0f172a',
    borderColor: '#1e293b',
    textColor: '#f8fafc',
    borderRadius: '14px',
    contrast: 'normal',
  };

  const [customSettings, setCustomSettings] = useState<CustomThemeSettings>(() => {
    const saved = localStorage.getItem('chrome_backup_custom_theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultCustomSettings;
  });

  // Apply theme dynamically to documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chrome_backup_theme_preset', theme);

    const root = document.documentElement;
    if (theme === 'custom') {
      root.style.setProperty('--custom-bg', customSettings.bgColor);
      root.style.setProperty('--custom-card', customSettings.cardColor);
      root.style.setProperty('--custom-border', customSettings.borderColor);
      root.style.setProperty('--custom-text', customSettings.textColor);
      root.style.setProperty('--custom-accent', customSettings.accentColor);
      root.style.setProperty('--custom-radius', customSettings.borderRadius);
    }
  }, [theme, customSettings]);

  const handleUpdateCustomSettings = (newSettings: CustomThemeSettings) => {
    setCustomSettings(newSettings);
    localStorage.setItem('chrome_backup_custom_theme', JSON.stringify(newSettings));
    if (theme !== 'custom') {
      setTheme('custom');
    }
  };

  const handleResetDefaultTheme = () => {
    setTheme('dark-slate');
    setCustomSettings(defaultCustomSettings);
    localStorage.removeItem('chrome_backup_custom_theme');
    localStorage.setItem('chrome_backup_theme_preset', 'dark-slate');
    showToast('Đã khôi phục giao diện mặc định Dark Slate!');
  };

  const handleToggleQuickTheme = () => {
    const isCurrentLight = theme === 'light-titanium' || theme === 'light-nordic';
    if (isCurrentLight) {
      setTheme('dark-slate');
      showToast('Đã chuyển sang Chế độ Tối (Dark Slate)');
    } else {
      setTheme('light-titanium');
      showToast('Đã chuyển sang Chế độ Sáng (Light Titanium Clean)');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([PYTHON_SCRIPT_CODE], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chrome_backup_tool.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file chrome_backup_tool.py thành công!');
  };

  const handleDownloadDesktopZip = async () => {
    setLoadingOverlay({
      isOpen: true,
      title: 'Đang Tạo Gói .EXE & Cross-Platform Package...',
      subtitle: 'Đang kiểm tra và xác thực các tệp tin bắt buộc...',
      type: 'zip',
      progress: 25
    });

    try {
      showToast('Đang kiểm tra và xác thực các tệp bắt buộc...');

      const readmeContent = `=============================================================================
HƯỚNG DẪN SỬ DỤNG VÀ ĐÓNG GÓI CHROME 100% FULL BACKUP & 1-CLICK AUTO RESTORE
Phiên bản: ${APP_VERSION} (Hỗ trợ Đa Hệ Điều Hành: Windows • macOS • Linux)
=============================================================================

1. CÁC TẬP TIN TRONG GÓI NÀY:
   - CHAY_NGAY_POWERSHELL.bat: Mở chạy ngay lập tức KHÔNG CẦN CÀI PYTHON (PowerShell Windows)
   - CHAY_NGAY_PYTHON.bat    : Mở chạy trực tiếp bằng Python trên máy tính
   - build_exe.bat           : Đóng gói sang file ChromeBackupRestore.exe (đã kèm đầy đủ theme & assets)
   - UNINSTALL.bat           : GỠ CÀI ĐẶT 1-CLICK - Xóa sạch config và dọn dẹp thư mục an toàn
   - CHAY_NGAY_MACOS.command : Tập lệnh chạy ngay trên macOS (MacBook M1/M2/Intel)
   - CHAY_NGAY_LINUX.sh      : Tập lệnh chạy ngay trên Linux (Ubuntu/Debian/Fedora/Arch)
   - backup_chrome_unix.sh   : Shell script thuần POSIX backup Chrome cho Mac & Linux
   - UNINSTALL_MACOS.command : Gỡ cài đặt dọn dẹp sạch sẽ trên macOS
   - UNINSTALL_LINUX.sh      : Gỡ cài đặt dọn dẹp sạch sẽ trên Linux
   - chrome_backup_tool.py   : Mã nguồn Python GUI hoàn chỉnh đa nền tảng
   - backup_chrome.ps1       : Script sao lưu khôi phục PowerShell thuần Windows
   - requirements.txt        : Danh sách thư viện (customtkinter, pyinstaller, psutil)
   - HUONG_DAN_SU_DUNG.txt   : Hướng dẫn này

2. CÁCH SỬ DỤNG NHANH NHẤT THEO TỪNG HỆ ĐIỀU HÀNH:
   ➤ Windows:
     - Cách 1: Double click "CHAY_NGAY_POWERSHELL.bat" -> Chạy ngay không cần cài đặt gì.
     - Cách 2: Double click "build_exe.bat" -> Tạo file ChromeBackupRestore.exe độc lập.
   
   ➤ macOS (MacBook M1/M2/Intel):
     - Mở Terminal: chmod +x CHAY_NGAY_MACOS.command rồi double click trong Finder.
   
   ➤ Linux (Ubuntu/Debian/Fedora):
     - Chạy terminal: chmod +x CHAY_NGAY_LINUX.sh && ./CHAY_NGAY_LINUX.sh.

3. CÁCH GỠ CÀI ĐẶT (UNINSTALL) SẠCH SẼ KHI KHÔNG CÒN NHU CẦU:
   ➤ Windows: Chạy file "UNINSTALL.bat"
   ➤ macOS  : Chạy file "UNINSTALL_MACOS.command"
   ➤ Linux  : Chạy file "UNINSTALL_LINUX.sh"
   ✓ Toàn bộ file cấu hình (config.json), cache, dist sẽ được xóa sạch 100%.
   ✓ Các file sao lưu .zip trong thư mục sao lưu của bạn vẫn được giữ nguyên an toàn!
`;

      // ── BƯỚC XÁC THỰC BẮT BUỘC: Kiểm tra sự tồn tại và tính hợp lệ của tất cả các tệp TRƯỚC KHI tạo JSZip ──
      const requiredFiles = [
        { name: 'chrome_backup_tool.py', content: PYTHON_SCRIPT_CODE, desc: 'Mã nguồn Python GUI' },
        { name: 'CHAY_APP.vbs', content: RUN_SILENT_VBS, desc: 'Chạy app không hiện console' },
        { name: 'TAO_SHORTCUT_DESKTOP.bat', content: TAO_SHORTCUT_DESKTOP_BAT, desc: 'Tạo shortcut Desktop' },
        { name: 'build_exe.bat', content: BUILD_BAT_CODE, desc: 'Tập lệnh đóng gói .EXE' },
        { name: 'CHAY_NGAY_POWERSHELL.bat', content: RUN_POWERSHELL_BAT, desc: 'Khởi chạy PowerShell Native' },
        { name: 'CHAY_NGAY_PYTHON.bat', content: RUN_PYTHON_BAT, desc: 'Khởi chạy Python Native' },
        { name: 'UNINSTALL.bat', content: UNINSTALL_BAT_CODE, desc: 'Tập lệnh gỡ cài đặt sạch sẽ' },
        { name: 'CHAY_NGAY_MACOS.command', content: RUN_MACOS_COMMAND, desc: 'Tập lệnh khởi chạy macOS' },
        { name: 'CHAY_NGAY_LINUX.sh', content: RUN_LINUX_SH, desc: 'Tập lệnh khởi chạy Linux' },
        { name: 'backup_chrome_unix.sh', content: BACKUP_CHROME_UNIX_SH, desc: 'Shell script backup POSIX' },
        { name: 'UNINSTALL_MACOS.command', content: UNINSTALL_UNIX_SH, desc: 'Tập lệnh gỡ cài đặt macOS' },
        { name: 'UNINSTALL_LINUX.sh', content: UNINSTALL_UNIX_SH, desc: 'Tập lệnh gỡ cài đặt Linux' },
        { name: 'backup_chrome.ps1', content: POWERSHELL_SCRIPT, desc: 'Script PowerShell backup' },
        { name: 'requirements.txt', content: REQUIREMENTS_TXT, desc: 'Danh sách thư viện phụ thuộc' },
        { name: 'HUONG_DAN_SU_DUNG.txt', content: readmeContent, desc: 'Tài liệu hướng dẫn sử dụng' }
      ];

      setLoadingOverlay(prev => ({ ...prev, progress: 50, subtitle: 'Đang nén các tệp đa nền tảng vào file JSZip...' }));

      // Kiểm tra từng tệp bắt buộc: không được undefined, null, rỗng hoặc sai kiểu dữ liệu
      const invalidFiles = requiredFiles.filter(
        (f) => !f.content || typeof f.content !== 'string' || f.content.trim().length === 0
      );

      if (invalidFiles.length > 0) {
        const errorDetail = invalidFiles.map((f) => `• ${f.name} (${f.desc})`).join('\n');
        const errorMsg = `Xác thực bản dựng thất bại: Thiếu hoặc nội dung rỗng ở các tệp bắt buộc:\n${errorDetail}`;
        console.error(errorMsg);
        showToast('Lỗi bản dựng: Thiếu các tệp bắt buộc. Vui lòng kiểm tra console.');
        setLoadingOverlay({ isOpen: false, title: '', type: 'general' });
        throw new Error(errorMsg);
      }

      // Chỉ khi xác thực thành công 100% mới khởi tạo JSZip để tránh lỗi bản dựng hỏng
      const zip = new JSZip();
      for (const file of requiredFiles) {
        zip.file(file.name, file.content);
      }

      setLoadingOverlay(prev => ({ ...prev, progress: 85, subtitle: 'Đang tạo tệp nén hoàn chỉnh...' }));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Chrome_Backup_Restore_Tool_Package.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLoadingOverlay(prev => ({ ...prev, progress: 100, subtitle: 'Đã hoàn tất tải xuống!' }));
      setTimeout(() => {
        setLoadingOverlay({ isOpen: false, title: '', type: 'general' });
      }, 500);

      showToast('Đã xác thực 100% và tải xuống gói Chrome_Backup_Restore_Tool_Package.zip!');
    } catch (err) {
      console.error(err);
      setLoadingOverlay({ isOpen: false, title: '', type: 'general' });
      showToast('Lỗi khi xác thực hoặc đóng gói zip.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Fullscreen Loading Overlay */}
      <LoadingOverlay 
        isOpen={loadingOverlay.isOpen}
        title={loadingOverlay.title}
        subtitle={loadingOverlay.subtitle}
        type={loadingOverlay.type}
        progress={loadingOverlay.progress}
      />

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-emerald-400/40">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header với 3 ngăn duy nhất & Theme Switcher */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onDownloadZip={handleDownloadDesktopZip}
        currentTheme={theme}
        onToggleQuickTheme={handleToggleQuickTheme}
        onSelectTheme={(newTheme) => {
          setTheme(newTheme);
          showToast(`Đã chuyển sang giao diện: ${newTheme}`);
        }}
        onOpenThemeStudio={() => setIsThemeStudioOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenScheduler={() => setIsSchedulerModalOpen(true)}
        schedulerEnabled={schedulerConfig.enabled}
        schedulerNextTime={schedulerConfig.enabled ? schedulerConfig.time : undefined}
        appVersion={APP_VERSION}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Quick Highlights Info Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              Đầy Đủ Cả 2 Bản: .EXE Desktop & Chrome Extension
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <HardDrive className="w-4 h-4" />
              Tự động ghi nhớ vị trí đã tải (Không cần chọn lại sau khi đóng app)
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Zap className="w-4 h-4" />
              Có thanh Bar % và hệ thống cảnh báo thông minh
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {activeTab !== 'backup' && (
              <button
                onClick={() => setActiveTab('backup')}
                className="text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-950 cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Mở Chrome Full Backup</span>
              </button>
            )}
            {activeTab !== 'extension' && (
              <button
                onClick={() => setActiveTab('extension')}
                className="text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-950 cursor-pointer"
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>Mở Bản Extension</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Ngăn Giao Diện Trực Quan */}
        {activeTab === 'backup' && (
          <ChromeFullBackup 
            onDownloadScript={handleDownloadScript}
            onDownloadZip={handleDownloadDesktopZip}
            onSwitchToDownload={() => setActiveTab('download')}
            onSwitchToExtension={() => setActiveTab('extension')}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            schedulerConfig={schedulerConfig}
            onUpdateSchedulerConfig={handleSaveSchedulerConfig}
            onOpenSchedulerModal={() => setIsSchedulerModalOpen(true)}
          />
        )}

        {activeTab === 'download' && (
          <DownloadCenter 
            onDownloadScript={handleDownloadScript}
            onDownloadZip={handleDownloadDesktopZip}
          />
        )}

        {activeTab === 'extension' && (
          <ChromeExtensionCenter 
            onNotify={showToast}
          />
        )}
      </main>

      {/* Footer Chuyên Nghiệp */}
      <footer id="app-footer" className="w-full bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span>
              Chrome Full Backup & 1-Click Restore • Hỗ trợ cả bản .EXE (Desktop) và bản Chrome Extension
            </span>
            <span 
              id="footer-current-version" 
              className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 tracking-tight"
            >
              {APP_VERSION}
            </span>
          </div>

          {/* Thành phần UI kiểm tra phiên bản mới định kỳ */}
          <div className="flex items-center justify-center">
            <VersionUpdateChecker 
              currentVersion={APP_VERSION}
              onDownloadZip={handleDownloadDesktopZip}
            />
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Tự Động Ghi Nhớ Vị Trí</span>
            <span>•</span>
            <span>Thanh Progress Bar %</span>
            <span>•</span>
            <span>Cảnh Báo An Toàn</span>
          </div>
        </div>
      </footer>

      {/* Theme Studio & Custom Theme Modal */}
      <ThemeStudioModal 
        isOpen={isThemeStudioOpen}
        onClose={() => setIsThemeStudioOpen(false)}
        currentTheme={theme}
        onSelectTheme={(newTheme) => {
          setTheme(newTheme);
          showToast(`Đã chuyển sang giao diện: ${newTheme}`);
        }}
        customSettings={customSettings}
        onUpdateCustomSettings={handleUpdateCustomSettings}
        onResetDefault={handleResetDefaultTheme}
      />

      {/* App Tutorial & Help Walkthrough Modal */}
      <AppTutorialModal 
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsTutorialOpen(false);
        }}
        onOpenScheduler={() => {
          setIsTutorialOpen(false);
          setIsSchedulerModalOpen(true);
        }}
        onOpenThemeStudio={() => {
          setIsTutorialOpen(false);
          setIsThemeStudioOpen(true);
        }}
      />

      {/* Backup Scheduler Configuration Modal */}
      <BackupSchedulerModal 
        isOpen={isSchedulerModalOpen}
        onClose={() => setIsSchedulerModalOpen(false)}
        config={schedulerConfig}
        onSave={handleSaveSchedulerConfig}
        backupPath={localStorage.getItem('chrome_backup_saved_location') || 'C:\\Users\\Administrator\\Documents\\Chrome_Backups'}
        onTriggerTest={() => {
          setActiveTab('backup');
          showToast('Đang khởi chạy phiên sao lưu theo lịch...');
        }}
      />
    </div>
  );
}
