import React, { useState } from 'react';
import { 
  Download, FileCode, Terminal, Package, Check, Copy, 
  ExternalLink, ArrowRight, ShieldCheck, Zap, Laptop, FileText,
  Folder, HardDrive, Puzzle, Sparkles, Trash2, Apple, Monitor, Layers, AlertTriangle
} from 'lucide-react';
import JSZip from 'jszip';
import { 
  PYTHON_SCRIPT_CODE, 
  BUILD_BAT_CODE, 
  REQUIREMENTS_TXT, 
  POWERSHELL_SCRIPT,
  RUN_PYTHON_BAT,
  RUN_POWERSHELL_BAT,
  UNINSTALL_BAT_CODE,
  RUN_MACOS_COMMAND,
  RUN_LINUX_SH,
  BACKUP_CHROME_UNIX_SH,
  UNINSTALL_UNIX_SH
} from '../data/pythonScript';
import { downloadExtensionZipPackage } from '../utils/extensionPackage';
import { APP_VERSION } from '../App';
import { LoadingOverlay } from './LoadingOverlay';
import { QuickGuideButton } from './QuickGuideModal';
import { TargetOS } from '../types';

interface Props {
  onDownloadScript: () => void;
  onDownloadZip: () => void;
}

export const DownloadCenter: React.FC<Props> = ({ onDownloadScript, onDownloadZip }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [selectedOS, setSelectedOS] = useState<TargetOS>('all');

  // Loading Overlay state
  const [loadingState, setLoadingOverlay] = useState<{
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

  const [uninstallSuccessNotice, setUninstallSuccessNotice] = useState<boolean>(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createAndDownloadZip = async (targetOS: TargetOS = 'all') => {
    const osTitles: Record<TargetOS, string> = {
      all: 'Đa Nền Tảng (Windows + macOS + Linux)',
      windows: 'Windows (.EXE / .BAT / .PS1)',
      macos: 'macOS (Apple Silicon & Intel .command)',
      linux: 'Linux (.sh / Python GUI)'
    };

    setLoadingOverlay({
      isOpen: true,
      title: `Đang Đóng Gói Tải Xuống ${osTitles[targetOS]}...`,
      subtitle: 'Đang xác thực các tệp tin và nén lưu trữ JSZip...',
      type: 'zip',
      progress: 20
    });

    try {
      const readmeContent = `=============================================================================
HƯỚNG DẪN SỬ DỤNG VÀ ĐÓNG GÓI CHROME 100% FULL BACKUP & 1-CLICK AUTO RESTORE
Phiên bản: ${APP_VERSION} (Hỗ trợ Đa Hệ Điều Hành: Windows • macOS • Linux)
=============================================================================

1. CÁC TẬP TIN DÀNH CHO TỪNG HỆ ĐIỀU HÀNH:

➤ DÀNH CHO WINDOWS:
   - CHAY_NGAY_POWERSHELL.bat : Mở chạy ngay lập tức KHÔNG CẦN CÀI PYTHON (PowerShell Native)
   - CHAY_NGAY_PYTHON.bat     : Mở chạy trực tiếp bằng Python
   - build_exe.bat            : Đóng gói thành file ChromeBackupRestore.exe độc lập
   - backup_chrome.ps1        : Script PowerShell độc lập
   - UNINSTALL.bat            : Gỡ cài đặt 1-Click sạch sẽ

➤ DÀNH CHO MACOS (MacBook Apple Silicon M1/M2/M3 & Intel):
   - CHAY_NGAY_MACOS.command  : Double-click để chạy ngay trên Finder macOS
   - backup_chrome_unix.sh    : Shell script native tương thích bash/zsh
   - UNINSTALL_MACOS.command  : Dọn dẹp cấu hình trên macOS

➤ DÀNH CHO LINUX (Ubuntu, Debian, Fedora, Arch, CentOS):
   - CHAY_NGAY_LINUX.sh       : Tập lệnh chạy GUI Python trên Linux
   - backup_chrome_unix.sh    : Shell script native tương thích mọi bản phân phối Linux
   - UNINSTALL_LINUX.sh       : Script gỡ cài đặt sạch sẽ trên Linux

➤ DÙNG CHUNG CHO MỌI HỆ ĐIỀU HÀNH:
   - chrome_backup_tool.py    : Mã nguồn Python GUI hoàn chỉnh đa nền tảng
   - requirements.txt         : Khai báo thư viện (customtkinter, pyinstaller, psutil)
   - HUONG_DAN_SU_DUNG.txt    : Tài liệu này

2. HƯỚNG DẪN CHẠY TRÊN TỪNG HĐH:
   • Windows: Double click vào "CHAY_NGAY_POWERSHELL.bat" hoặc "build_exe.bat" để tạo .exe.
   • macOS  : Mở Terminal, cấp quyền thực thi: "chmod +x CHAY_NGAY_MACOS.command" rồi double click chạy.
   • Linux  : Chạy terminal: "chmod +x CHAY_NGAY_LINUX.sh && ./CHAY_NGAY_LINUX.sh".

3. GỠ CÀI ĐẶT AN TOÀN (UNINSTALL):
   • Chạy file UNINSTALL tương ứng với hệ điều hành của bạn.
   • Toàn bộ file cấu hình và cache sẽ bị xóa, nhưng các bản sao lưu (.zip) vẫn được bảo toàn nguyên vẹn 100%!
`;

      // ── BƯỚC XÁC THỰC BẮT BUỘC: Kiểm tra sự tồn tại và tính hợp lệ của tất cả các tệp TRƯỚC KHI tạo JSZip ──
      const allFiles = [
        // Windows
        { name: "CHAY_NGAY_POWERSHELL.bat", content: RUN_POWERSHELL_BAT, desc: "Script chạy nhanh PowerShell Windows", os: ['all', 'windows'] },
        { name: "CHAY_NGAY_PYTHON.bat", content: RUN_PYTHON_BAT, desc: "Script chạy nhanh Python Windows", os: ['all', 'windows'] },
        { name: "build_exe.bat", content: BUILD_BAT_CODE, desc: "Tập lệnh build EXE độc lập Windows", os: ['all', 'windows'] },
        { name: "UNINSTALL.bat", content: UNINSTALL_BAT_CODE, desc: "Tập lệnh gỡ cài đặt Windows", os: ['all', 'windows'] },
        { name: "backup_chrome.ps1", content: POWERSHELL_SCRIPT, desc: "Script PowerShell native", os: ['all', 'windows'] },
        // macOS
        { name: "CHAY_NGAY_MACOS.command", content: RUN_MACOS_COMMAND, desc: "Script chạy Finder macOS", os: ['all', 'macos'] },
        { name: "UNINSTALL_MACOS.command", content: UNINSTALL_UNIX_SH, desc: "Script gỡ cài đặt macOS", os: ['all', 'macos'] },
        // Linux
        { name: "CHAY_NGAY_LINUX.sh", content: RUN_LINUX_SH, desc: "Script chạy Linux bash", os: ['all', 'linux'] },
        { name: "UNINSTALL_LINUX.sh", content: UNINSTALL_UNIX_SH, desc: "Script gỡ cài đặt Linux", os: ['all', 'linux'] },
        // Unix shared
        { name: "backup_chrome_unix.sh", content: BACKUP_CHROME_UNIX_SH, desc: "Script shell POSIX native", os: ['all', 'macos', 'linux'] },
        // Universal
        { name: "chrome_backup_tool.py", content: PYTHON_SCRIPT_CODE, desc: "Mã nguồn Python GUI đa nền tảng", os: ['all', 'windows', 'macos', 'linux'] },
        { name: "requirements.txt", content: REQUIREMENTS_TXT, desc: "Tệp khai báo thư viện", os: ['all', 'windows', 'macos', 'linux'] },
        { name: "HUONG_DAN_SU_DUNG.txt", content: readmeContent, desc: "Hướng dẫn sử dụng", os: ['all', 'windows', 'macos', 'linux'] }
      ];

      const requiredFiles = allFiles.filter(f => f.os.includes(targetOS));

      setLoadingOverlay(prev => ({ ...prev, progress: 45, subtitle: 'Đang xác thực các tệp bắt buộc...' }));

      const invalidFiles = requiredFiles.filter(
        (f) => !f.content || typeof f.content !== 'string' || f.content.trim().length === 0
      );

      if (invalidFiles.length > 0) {
        const errorDetail = invalidFiles.map((f) => `• ${f.name} (${f.desc})`).join('\n');
        const errorMsg = `Xác thực bản dựng thất bại! Thiếu hoặc nội dung rỗng ở các tệp bắt buộc:\n${errorDetail}`;
        console.error(errorMsg);
        alert(errorMsg);
        throw new Error(errorMsg);
      }

      setLoadingOverlay(prev => ({ ...prev, progress: 75, subtitle: 'Đang nén các tệp vào định dạng JSZip...' }));

      // Chỉ khởi tạo JSZip sau khi đã xác thực 100% tất cả các tệp bắt buộc
      const zip = new JSZip();
      for (const file of requiredFiles) {
        zip.file(file.name, file.content);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      setLoadingOverlay(prev => ({ ...prev, progress: 95, subtitle: 'Hoàn tất tạo file ZIP, đang gửi về máy...' }));

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const downloadNames: Record<TargetOS, string> = {
        all: "Chrome_Backup_Restore_All_Platforms.zip",
        windows: "Chrome_Backup_Restore_Windows_Package.zip",
        macos: "Chrome_Backup_Restore_macOS_Package.zip",
        linux: "Chrome_Backup_Restore_Linux_Package.zip"
      };
      a.download = downloadNames[targetOS];
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLoadingOverlay(prev => ({ ...prev, progress: 100, subtitle: 'Tải xuống thành công!' }));
      setTimeout(() => {
        setLoadingOverlay({ isOpen: false, title: '' });
      }, 600);
    } catch (err) {
      console.error("Lỗi khi nén zip:", err);
      setLoadingOverlay({ isOpen: false, title: '' });
    }
  };

  const handleDownloadDesktopZip = () => createAndDownloadZip('all');
  const handleDownloadFullDesktopBundle = handleDownloadDesktopZip;

  // Xử lý gỡ cài đặt (Uninstall 1-Click) có hiển thị Loading Overlay
  const handleExecuteUninstall = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn thực hiện gỡ cài đặt cấu hình ứng dụng? Toàn bộ file cấu hình tạm sẽ được dọn sạch. (Các bản sao lưu .ZIP của bạn vẫn được bảo toàn nguyên vẹn 100%)")) {
      return;
    }

    setLoadingOverlay({
      isOpen: true,
      title: "Đang Thực Hiện Gỡ Cài Đặt (Uninstall)...",
      subtitle: "Đang dọn dẹp các tệp cấu hình config.json, cache tạm và thiết lập...",
      type: 'uninstall',
      progress: 25
    });

    setTimeout(() => {
      setLoadingOverlay(prev => ({ ...prev, progress: 60, subtitle: "Đang xóa bộ nhớ đệm và thiết lập vị trí lưu..." }));
      
      // Xóa cấu hình tạm trong localStorage
      localStorage.removeItem('chrome_backup_saved_location');

      setTimeout(() => {
        setLoadingOverlay(prev => ({ ...prev, progress: 90, subtitle: "Bảo toàn nguyên vẹn các bản sao lưu .ZIP của người dùng..." }));

        setTimeout(() => {
          setLoadingOverlay(prev => ({ ...prev, progress: 100, subtitle: "Gỡ cài đặt hoàn tất 100%!" }));
          setTimeout(() => {
            setLoadingOverlay({ isOpen: false, title: '' });
            setUninstallSuccessNotice(true);
            setTimeout(() => setUninstallSuccessNotice(false), 7000);
          }, 600);
        }, 500);
      }, 600);
    }, 600);
  };

  const handleDownloadExtensionZip = async () => {
    try {
      await downloadExtensionZipPackage("Chrome_Full_Backup_Extension_v5.zip");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Loading Overlay toàn màn hình khi nén JSZip hoặc gỡ cài đặt */}
      <LoadingOverlay 
        isOpen={loadingState.isOpen}
        title={loadingState.title}
        subtitle={loadingState.subtitle}
        type={loadingState.type}
        progress={loadingState.progress}
      />

      {/* Thông báo sau khi gỡ cài đặt thành công */}
      {uninstallSuccessNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-200 animate-in fade-in shadow-xl">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Đã gỡ cài đặt sạch sẽ 100%!</strong> Toàn bộ cấu hình config.json và bộ nhớ tạm đã được dọn dẹp. Bản sao lưu .ZIP của bạn vẫn được bảo toàn nguyên vẹn trong thư mục sao lưu.
            </span>
          </div>
          <button 
            onClick={() => setUninstallSuccessNotice(false)}
            className="text-emerald-400 hover:text-white text-[11px] underline ml-3 shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Banner tải trọn gói nổi bật */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/70 border border-blue-500/40 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col gap-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold w-fit">
            <Package className="w-3.5 h-3.5" />
            Bản Desktop Pro v6.0 (Tích hợp Auto Scheduler & Chạy Ngầm System Tray)
          </div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tải Trọn Gói Chrome Backup Desktop (.EXE / Shell)
            </h2>
            <QuickGuideButton topicId="download_package" />
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Ứng dụng độc lập lưu trữ 100% dữ liệu vật lý của Google Chrome. Trang bị <strong>lập lịch sao lưu tự động (Auto Scheduler)</strong>, <strong>chạy ngầm trong khay hệ thống (System Tray)</strong>, <strong>tùy chọn sao lưu từng Profile riêng lẻ</strong>, <strong>tự động ghi nhớ vị trí</strong> và <strong>thanh tiến trình %</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              ✓ Lập lịch tự động & Chạy ngầm (Tray)
            </span>
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              ✓ Chọn lọc từng Profile Chrome
            </span>
            <span className="text-blue-400 font-semibold flex items-center gap-1">
              ✓ Nhớ vị trí & Thanh % tiến trình
            </span>
            <span className="text-purple-400 font-semibold flex items-center gap-1">
              ✓ 1-Click Tự động đóng & mở lại Chrome
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full lg:w-auto">
          <button
            id="btn-download-full-bundle"
            onClick={() => createAndDownloadZip('all')}
            disabled={loadingState.isOpen}
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg shadow-blue-950 transition-all cursor-pointer whitespace-nowrap border border-blue-400/30"
          >
            <Download className="w-5 h-5" />
            <span>Tải Trọn Gói Tất Cả HĐH (.ZIP Universal)</span>
          </button>
        </div>
      </div>

      {/* BỘ CHỌN HỆ ĐIỀU HÀNH (OS SELECTOR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Chọn Gói Tải Xuống Tối Ưu Cho Hệ Điều Hành Của Bạn
            </h3>
            <QuickGuideButton topicId="multi_os" label="Đa HĐH (?)" />
          </div>
          <span className="text-xs text-slate-400">
            Đầy đủ script tự động chạy & cấu trúc đường dẫn chuẩn cho từng OS
          </span>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'all', label: 'Tất Cả HĐH (Universal)', icon: Layers, color: 'text-cyan-400' },
            { id: 'windows', label: 'Windows (EXE / BAT)', icon: Monitor, color: 'text-blue-400' },
            { id: 'macos', label: 'macOS (Finder .command)', icon: Apple, color: 'text-amber-400' },
            { id: 'linux', label: 'Linux (Ubuntu / Fedora)', icon: Terminal, color: 'text-emerald-400' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedOS === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedOS(tab.id as TargetOS)}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-xs font-semibold ${
                  isSelected 
                    ? 'bg-slate-800 border-blue-500 text-white shadow-md' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Khối hiển thị chi tiết theo từng HĐH đã chọn */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span>
                {selectedOS === 'all' && '📦 Gói Universal: Đầy đủ file cho cả Windows, macOS & Linux'}
                {selectedOS === 'windows' && '🪟 Gói Windows: Sẵn sàng CHAY_NGAY_POWERSHELL.bat, build_exe.bat & .ps1'}
                {selectedOS === 'macos' && '🍎 Gói macOS: Tương thích MacBook M1/M2/M3 & Intel, sẵn CHAY_NGAY_MACOS.command'}
                {selectedOS === 'linux' && '🐧 Gói Linux: Tương thích Ubuntu, Debian, Fedora, Arch qua bash native'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {selectedOS === 'all' && 'Chứa trọn bộ mã nguồn Python GUI đa nền tảng, tập lệnh tự nhận diện đường dẫn hệ thống.'}
              {selectedOS === 'windows' && 'Đường dẫn chuẩn: %LOCALAPPDATA%\\Google\\Chrome\\User Data. Hỗ trợ tạo file ChromeBackupRestore.exe.'}
              {selectedOS === 'macos' && 'Đường dẫn chuẩn: ~/Library/Application Support/Google/Chrome. Chạy trực tiếp qua double-click Finder.'}
              {selectedOS === 'linux' && 'Đường dẫn chuẩn: ~/.config/google-chrome. Hỗ trợ lệnh chmod +x và khởi chạy terminal nhanh.'}
            </p>
          </div>

          <button
            onClick={() => createAndDownloadZip(selectedOS)}
            disabled={loadingState.isOpen}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shrink-0 transition-colors shadow-md shadow-emerald-950 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>
              {selectedOS === 'all' && 'Tải Gói Universal (.ZIP)'}
              {selectedOS === 'windows' && 'Tải Gói Windows (.ZIP)'}
              {selectedOS === 'macos' && 'Tải Gói macOS (.ZIP)'}
              {selectedOS === 'linux' && 'Tải Gói Linux (.ZIP)'}
            </span>
          </button>
        </div>
      </div>

      {/* Danh sách các tập tin có thể tải lẻ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-400" />
            Các Tập Tin Trong Bộ Script ({selectedOS.toUpperCase()})
          </h3>
          <span className="text-xs text-slate-400">
            Có thể tải lẻ từng file hoặc tải trọn gói ZIP ở trên
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Python Script GUI (Đa HĐH) */}
          {(selectedOS === 'all' || selectedOS === 'windows' || selectedOS === 'macos' || selectedOS === 'linux') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">chrome_backup_tool.py</h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20">All OS</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ứng dụng Python GUI chính hoàn chỉnh. Tự động nhận diện HĐH (Windows, macOS, Linux) để xác định đường dẫn Chrome.
                </p>
              </div>
              <button
                onClick={() => downloadFile("chrome_backup_tool.py", PYTHON_SCRIPT_CODE)}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải file .py (19 KB)
              </button>
            </div>
          )}

          {/* Card 2: build_exe.bat (Windows) */}
          {(selectedOS === 'all' || selectedOS === 'windows') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">build_exe.bat</h4>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded border border-blue-500/20">Windows</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Script Windows 1-Click tự động tải thư viện và biên dịch ứng dụng thành file <code className="text-blue-300">.exe</code> độc lập.
                </p>
              </div>
              <button
                onClick={() => downloadFile("build_exe.bat", BUILD_BAT_CODE, "application/x-bat")}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải build_exe.bat (2 KB)
              </button>
            </div>
          )}

          {/* Card 3: CHAY_NGAY_MACOS.command (macOS) */}
          {(selectedOS === 'all' || selectedOS === 'macos') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-amber-500/50 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Apple className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">CHAY_NGAY_MACOS.command</h4>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20">macOS</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tập lệnh khởi chạy Finder trên macOS (MacBook M1/M2/Intel). Nhấp đúp là chạy ngay với môi trường Python của Mac.
                </p>
              </div>
              <button
                onClick={() => downloadFile("CHAY_NGAY_MACOS.command", RUN_MACOS_COMMAND, "application/x-sh")}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải file .command (Mac)
              </button>
            </div>
          )}

          {/* Card 4: CHAY_NGAY_LINUX.sh (Linux) */}
          {(selectedOS === 'all' || selectedOS === 'linux') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">CHAY_NGAY_LINUX.sh</h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20">Linux</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tập lệnh shell chuẩn POSIX tương thích Ubuntu, Debian, Fedora, Arch. Tự động kiểm tra Python3 và khởi động GUI.
                </p>
              </div>
              <button
                onClick={() => downloadFile("CHAY_NGAY_LINUX.sh", RUN_LINUX_SH, "application/x-sh")}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải file .sh (Linux)
              </button>
            </div>
          )}

          {/* Card 5: backup_chrome.ps1 */}
          {(selectedOS === 'all' || selectedOS === 'windows') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-purple-500/50 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">backup_chrome.ps1</h4>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.2 rounded border border-purple-500/20">PowerShell</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tập lệnh PowerShell gốc của Windows, tự động nhớ vị trí và chạy trực tiếp mà không cần cài đặt Python.
                </p>
              </div>
              <button
                onClick={() => downloadFile("backup_chrome.ps1", POWERSHELL_SCRIPT, "text/plain")}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải file .ps1 (3 KB)
              </button>
            </div>
          )}

          {/* Card 6: backup_chrome_unix.sh (Unix) */}
          {(selectedOS === 'all' || selectedOS === 'macos' || selectedOS === 'linux') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-cyan-500/50 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">backup_chrome_unix.sh</h4>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-500/20">Mac/Linux</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Shell script sao lưu khôi phục thuần POSIX cho macOS và Linux, tự đóng Chrome và nén zip không cần Python.
                </p>
              </div>
              <button
                onClick={() => downloadFile("backup_chrome_unix.sh", BACKUP_CHROME_UNIX_SH, "application/x-sh")}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải file .sh (Unix)
              </button>
            </div>
          )}

          {/* Card 7: UNINSTALL script */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-red-500/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">UNINSTALL scripts</h4>
                <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.2 rounded border border-red-500/20">Cleanup</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tập lệnh gỡ cài đặt sạch sẽ 100%: dọn sạch config.json, cache và dist mà không làm ảnh hưởng đến bản backup.
              </p>
            </div>
            <button
              onClick={() => downloadFile(selectedOS === 'macos' ? "UNINSTALL_MACOS.command" : selectedOS === 'linux' ? "UNINSTALL_LINUX.sh" : "UNINSTALL.bat", selectedOS === 'macos' || selectedOS === 'linux' ? UNINSTALL_UNIX_SH : UNINSTALL_BAT_CODE)}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Tải Script Gỡ Cài Đặt
            </button>
          </div>
        </div>
      </div>

      {/* Hướng dẫn 3 bước đóng gói thành file .exe */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">
              Hướng Dẫn Tạo File .EXE Độc Lập Trong 3 Bước (Chạy Không Cần Cài Python)
            </h3>
            <QuickGuideButton topicId="build_exe" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sau khi đóng gói, bạn có một file <code className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">ChromeBackupRestore.exe</code> duy nhất để copy sang máy tính khác hoặc lưu vào USB.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bước 1 */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                1
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Thời gian: 10 giây</span>
            </div>
            <h4 className="font-semibold text-white text-sm">Tải gói về máy tính</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nhấn nút <strong>"Tải Trọn Gói Bản Desktop (.ZIP)"</strong> ở trên và giải nén ra một thư mục bất kỳ trên máy tính của bạn (Ví dụ: <code className="text-slate-300">C:\ChromeBackupTool</code>).
            </p>
          </div>

          {/* Bước 2 */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                2
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Thời gian: 30 giây</span>
            </div>
            <h4 className="font-semibold text-white text-sm">Chạy build_exe.bat</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nhấp đúp chuột vào file <strong>build_exe.bat</strong>. Cửa sổ Command Prompt sẽ tự động cài PyInstaller và biên dịch ứng dụng thành file <code className="text-blue-300 font-mono">.exe</code>.
            </p>
          </div>

          {/* Bước 3 */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                3
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Hoàn tất</span>
            </div>
            <h4 className="font-semibold text-white text-sm">Sử dụng file .EXE</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cửa sổ thư mục <code className="text-purple-300 font-mono">dist\ChromeBackupRestore</code> sẽ tự động bật lên. File <code className="text-white font-mono font-bold">ChromeBackupRestore.exe</code> đã sẵn sàng hoạt động!
            </p>
          </div>
        </div>

        {/* Lệnh chạy thủ công nếu người dùng muốn gõ command */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hoặc lệnh thủ công qua terminal (Windows / Mac / Linux):</span>
            <button
              onClick={() => copyToClipboard('pip install customtkinter pyinstaller psutil && pyinstaller --onedir --windowed --collect-all customtkinter --name "ChromeBackupRestore" chrome_backup_tool.py', 'manual-cmd')}
              className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              {copiedCmd === 'manual-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedCmd === 'manual-cmd' ? 'Đã copy' : 'Sao chép lệnh'}
            </button>
          </div>
          <code className="text-xs font-mono text-emerald-400 bg-black/40 p-2.5 rounded border border-slate-800 overflow-x-auto">
            pip install customtkinter pyinstaller psutil && pyinstaller --onedir --windowed --collect-all customtkinter --name "ChromeBackupRestore" chrome_backup_tool.py
          </code>
        </div>
      </div>

      {/* Hướng dẫn Gỡ Cài Đặt (Uninstall) 100% Sạch Sẽ với Nút Kích Hoạt Interactive */}
      <div className="bg-slate-900/60 border border-red-500/30 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-red-400 font-semibold text-base">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <span>Hướng Dẫn Gỡ Cài Đặt (Uninstall) 1-Click Sạch Sẽ 100%</span>
            <QuickGuideButton topicId="uninstall_guide" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteUninstall}
              disabled={loadingState.isOpen}
              className="px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950 transition-colors cursor-pointer border border-red-500/40"
            >
              <Trash2 className="w-4 h-4" />
              <span>Gỡ Cài Đặt Ngay (1-Click)</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Ứng dụng được thiết kế hoàn toàn theo mô hình <strong>Portable (không chôn sâu file rác vào Windows Registry hay System32)</strong>. Khi bạn không còn nhu cầu sử dụng, bạn có thể gỡ cài đặt sạch sẽ 100% bất kỳ lúc nào bằng 1 trong 2 cách:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
            <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
              <span>Cách 1: Bấm nút Gỡ Cài Đặt Ngay ở trên hoặc trong app desktop</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bấm nút màu đỏ <strong className="text-red-300 font-mono">🗑️ Gỡ Cài Đặt Ngay</strong>. Hệ thống sẽ tự động dọn sạch file cấu hình <code className="text-slate-300">config.json</code> và cache tạm.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>Cách 2: Chạy file UNINSTALL đi kèm trong thư mục</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chạy <strong className="text-amber-300 font-mono">UNINSTALL.bat</strong> (trên Windows) hoặc <strong className="text-amber-300 font-mono">UNINSTALL_MACOS.command / UNINSTALL_LINUX.sh</strong> (trên Mac/Linux) để dọn dẹp sạch toàn bộ thư mục <code className="text-slate-300">dist</code>, <code className="text-slate-300">build</code> và cache.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 p-3 rounded-lg">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Bảo vệ dữ liệu:</strong> Quá trình gỡ cài đặt chỉ xóa sạch app và cấu hình tạm. <strong>Tất cả các bản sao lưu Chrome (.zip) của bạn trong thư mục sao lưu VẪN ĐƯỢC BẢO TOÀN NGUYÊN VẸN 100%.</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
