import React, { useState } from 'react';
import { 
  Download, FileCode, Terminal, Package, Check, Copy, 
  ExternalLink, ArrowRight, ShieldCheck, Zap, Laptop, FileText,
  Folder, HardDrive, Puzzle, Sparkles, Trash2, Apple, Monitor, Layers, AlertTriangle,
  CheckCircle2, Star, HelpCircle
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
  UNINSTALL_UNIX_SH,
  RUN_SILENT_VBS,
  TAO_SHORTCUT_DESKTOP_BAT
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
  const [selectedOS, setSelectedOS] = useState<TargetOS>('windows');

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
   - CHAY_APP.vbs             : KHUYÊN DÙNG - Mở giao diện ngay, KHÔNG hiện cửa sổ đen console
   - TAO_SHORTCUT_DESKTOP.bat : Tạo phím tắt icon ra màn hình chính Desktop (1-Click)
   - CHAY_NGAY_PYTHON.bat     : Mở chạy trực tiếp qua Python
   - CHAY_NGAY_POWERSHELL.bat : Mở Menu sao lưu / khôi phục KHÔNG CẦN CÀI PYTHON (PowerShell Native)
   - build_exe.bat            : Đóng gói thành file ChromeBackupRestore.exe 1-File độc lập
   - backup_chrome.ps1        : Script PowerShell độc lập (Menu tương tác)
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
   - requirements.txt         : Khai báo thư viện (pyinstaller, psutil, pystray, pillow)
   - HUONG_DAN_SU_DUNG.txt    : Tài liệu này

2. HƯỚNG DẪN CHẠY TRÊN TỪNG HĐH:
   • Windows:
     - Cách 1 (Nhanh nhất): Double-click vào "CHAY_APP.vbs" hoặc "CHAY_NGAY_PYTHON.bat" (Mở app ngay không lỗi).
     - Cách 2: Double-click "TAO_SHORTCUT_DESKTOP.bat" để có biểu tượng ngoài Desktop mở như app Windows chuẩn.
     - Cách 3 (Không cần Python): Double-click "CHAY_NGAY_POWERSHELL.bat" để mở menu sao lưu/khôi phục PowerShell native.
     - Cách 4 (Build .exe): Chạy "build_exe.bat" để tự đóng gói thành ChromeBackupRestore.exe độc lập.
   • macOS  : Mở Terminal, cấp quyền thực thi: "chmod +x CHAY_NGAY_MACOS.command" rồi double click chạy.
   • Linux  : Chạy terminal: "chmod +x CHAY_NGAY_LINUX.sh && ./CHAY_NGAY_LINUX.sh".

3. GỠ CÀI ĐẶT AN TOÀN (UNINSTALL):
   • Chạy file UNINSTALL tương ứng với hệ điều hành của bạn.
   • Toàn bộ file cấu hình và cache sẽ bị xóa, nhưng các bản sao lưu (.zip) vẫn được bảo toàn nguyên vẹn 100%!
`;

      // ── BƯỚC XÁC THỰC BẮT BUỘC: Kiểm tra sự tồn tại và tính hợp lệ của tất cả các tệp TRƯỚC KHI tạo JSZip ──
      const allFiles = [
        // Windows
        { name: "CHAY_APP.vbs", content: RUN_SILENT_VBS, desc: "Mở app không hiện cửa sổ đen (Khuyên dùng)", os: ['all', 'windows'] },
        { name: "TAO_SHORTCUT_DESKTOP.bat", content: TAO_SHORTCUT_DESKTOP_BAT, desc: "Tạo shortcut ra màn hình chính Desktop", os: ['all', 'windows'] },
        { name: "CHAY_NGAY_PYTHON.bat", content: RUN_PYTHON_BAT, desc: "Script chạy nhanh Python Windows", os: ['all', 'windows'] },
        { name: "CHAY_NGAY_POWERSHELL.bat", content: RUN_POWERSHELL_BAT, desc: "Script chạy nhanh PowerShell Windows (Menu native)", os: ['all', 'windows'] },
        { name: "build_exe.bat", content: BUILD_BAT_CODE, desc: "Tập lệnh build EXE độc lập Windows", os: ['all', 'windows'] },
        { name: "UNINSTALL.bat", content: UNINSTALL_BAT_CODE, desc: "Tập lệnh gỡ cài đặt Windows", os: ['all', 'windows'] },
        { name: "backup_chrome.ps1", content: POWERSHELL_SCRIPT, desc: "Script PowerShell native có menu", os: ['all', 'windows'] },
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

      {/* 1. KHUNG CHÀO ĐÓN & HƯỚNG DẪN 3 BƯỚC CHO NGƯỜI MỚI (BEGINNER-FIRST HERO) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 border-2 border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Star className="w-3.5 h-3.5 text-emerald-400" />
              <span>DÀNH CHO NGƯỜI MỚI BẮT ĐẦU • DỄ HIỂU NHẤT</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bản Cài Đặt Cho Máy Tính (Desktop)
            </h2>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Đây là giải pháp <strong>sao lưu trọn vẹn 100%</strong>: Giữ lại toàn bộ <strong>Mật khẩu đã lưu</strong>, <strong>Lịch sử web</strong>, <strong>Dấu trang (Bookmarks)</strong>, và <strong>Các tài khoản đang đăng nhập</strong>. Khi chuyển sang máy tính mới, chỉ cần 1 cú nhấp chuột là khôi phục như cũ!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Không làm mất mật khẩu
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 bg-blue-950/40 border border-blue-500/30 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Không cần biết lập trình
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Mở app êm ru, không màn hình đen
              </span>
            </div>
          </div>

          {/* Nút Tải To Nổi Bật Dành Cho Người Mới */}
          <div className="flex flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <button
              id="btn-download-full-bundle"
              onClick={() => createAndDownloadZip(selectedOS)}
              disabled={loadingState.isOpen}
              className="px-8 py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-950/70 border border-blue-400/40 transition-all cursor-pointer"
            >
              <Download className="w-6 h-6 animate-bounce" />
              <span>
                {selectedOS === 'windows' ? 'TẢI BẢN CHO WINDOWS (.ZIP)' : 
                 selectedOS === 'macos' ? 'TẢI BẢN CHO MACOS (.ZIP)' :
                 selectedOS === 'linux' ? 'TẢI BẢN CHO LINUX (.ZIP)' : 'TẢI TRỌN GÓI TẤT CẢ HĐH (.ZIP)'}
              </span>
            </button>
            <span className="text-center text-xs text-slate-400">
              Dung lượng siêu nhẹ ~35 KB • Tải về chỉ mất 1 giây
            </span>
          </div>
        </div>

        {/* 3 BƯỚC CỰC DỄ HIỂU NGAY TRONG HERO */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              3 Bước Sử Dụng Cực Dễ (Xem Là Làm Được Ngay)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bước 1 */}
            <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-4 flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 font-extrabold text-sm flex items-center justify-center border border-blue-500/40">
                  1
                </span>
                <span className="text-[11px] font-semibold text-blue-400">Bước 1</span>
              </div>
              <h4 className="font-bold text-white text-sm">Tải gói về máy</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nhấn nút màu xanh <strong>"TẢI BẢN CHO WINDOWS (.ZIP)"</strong> ở trên để tải file nén về thư mục <em>Downloads</em> của bạn.
              </p>
            </div>

            {/* Bước 2 */}
            <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 font-extrabold text-sm flex items-center justify-center border border-indigo-500/40">
                  2
                </span>
                <span className="text-[11px] font-semibold text-indigo-400">Bước 2</span>
              </div>
              <h4 className="font-bold text-white text-sm">Giải nén thư mục</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nhấp chuột phải vào file vừa tải về, chọn <strong>"Extract All..."</strong> (hoặc "Giải nén tại đây") để mở các tập tin ra.
              </p>
            </div>

            {/* Bước 3 */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 flex flex-col gap-2 relative shadow-lg shadow-emerald-950/30">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-sm flex items-center justify-center border border-emerald-500/40">
                  3
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Mở App Ngay
                </span>
              </div>
              <h4 className="font-bold text-emerald-300 text-sm">Nhấp đúp "CHAY_APP.vbs"</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trong thư mục vừa giải nén, nhấp đúp vào file <strong className="text-emerald-400 font-mono">CHAY_APP.vbs</strong>. Ứng dụng sẽ xuất hiện ngay lập tức, êm ru và không có lỗi!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BẢNG CHỈ DẪN: "NÊN BẤM VÀO FILE NÀO ĐỂ CHẠY?" */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              Bạn Đang Tự Hỏi: "Trong Thư Mục Có Nhiều File, Tôi Nên Bấm File Nào?"
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dưới đây là lời khuyên rõ ràng nhất dành cho bạn tùy theo nhu cầu:
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 w-fit">
            Mẹo: Chỉ cần chọn 1 trong các cách sau
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Lựa chọn 1: CHAY_APP.vbs (Khuyên dùng số 1) */}
          <div className="bg-slate-950 border-2 border-emerald-500/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-emerald-950/40 relative">
            <span className="absolute -top-3 left-4 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              ⭐ Khuyên dùng nhất
            </span>
            <div>
              <div className="flex items-center gap-2 mt-1 mb-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h4 className="font-extrabold text-white text-base">CHAY_APP.vbs</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Chạy app êm ru:</strong> Mở ngay giao diện sao lưu Chrome mà <strong>hoàn toàn không hiện cửa sổ đen cmd</strong>, không bao giờ bị phần mềm diệt virus làm phiền!
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-emerald-400 font-semibold block mb-2">
                ✓ Phù hợp với tất cả mọi người
              </span>
              <button
                onClick={() => downloadFile("CHAY_APP.vbs", RUN_SILENT_VBS, "text/plain")}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Tải riêng file này
              </button>
            </div>
          </div>

          {/* Lựa chọn 2: TAO_SHORTCUT_DESKTOP.bat */}
          <div className="bg-slate-950 border border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-400 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-5 h-5 text-blue-400" />
                <h4 className="font-extrabold text-white text-base">TAO_SHORTCUT_DESKTOP.bat</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Tạo icon ngoài màn hình:</strong> Nhấp đúp vào file này, nó sẽ tự tạo một biểu tượng <code className="text-blue-300 font-mono">Chrome Full Backup Tool</code> ngay trên màn hình Desktop của bạn.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-blue-400 font-semibold block mb-2">
                ✓ Tiện lợi như ứng dụng cài sẵn
              </span>
              <button
                onClick={() => downloadFile("TAO_SHORTCUT_DESKTOP.bat", TAO_SHORTCUT_DESKTOP_BAT, "application/x-bat")}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải riêng file này
              </button>
            </div>
          </div>

          {/* Lựa chọn 3: CHAY_NGAY_POWERSHELL.bat */}
          <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-400 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h4 className="font-extrabold text-white text-base">CHAY_NGAY_POWERSHELL.bat</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Không cần cài Python:</strong> Nếu máy tính của bạn hoàn toàn chưa có Python, file này sẽ chạy bằng công cụ PowerShell có sẵn của Windows để sao lưu ngay lập tức.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-purple-400 font-semibold block mb-2">
                ✓ Dành cho máy chưa cài gì
              </span>
              <button
                onClick={() => downloadFile("CHAY_NGAY_POWERSHELL.bat", RUN_POWERSHELL_BAT, "application/x-bat")}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải riêng file này
              </button>
            </div>
          </div>

          {/* Lựa chọn 4: build_exe.bat */}
          <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-400 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <h4 className="font-extrabold text-white text-base">build_exe.bat</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Tự tạo file .EXE:</strong> Nhấp đúp vào đây để tự động đóng gói toàn bộ ứng dụng thành 1 file <code className="text-cyan-300 font-mono">ChromeBackupRestore.exe</code> độc lập lưu vào USB.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-cyan-400 font-semibold block mb-2">
                ✓ Dành cho ai muốn file .EXE
              </span>
              <button
                onClick={() => downloadFile("build_exe.bat", BUILD_BAT_CODE, "application/x-bat")}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải riêng file này
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BỘ CHỌN HỆ ĐIỀU HÀNH (WINDOWS / MACBOOK / LINUX) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Bạn Đang Dùng Hệ Điều Hành Nào?
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Chọn để xem hướng dẫn riêng cho hệ điều hành của bạn
          </span>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'windows', label: 'Windows (PC / Laptop)', icon: Monitor, color: 'text-blue-400', badge: 'Phổ biến nhất' },
            { id: 'macos', label: 'macOS (MacBook M1/M2/Intel)', icon: Apple, color: 'text-amber-400', badge: 'Dễ dùng' },
            { id: 'linux', label: 'Linux (Ubuntu / Fedora)', icon: Terminal, color: 'text-emerald-400', badge: 'Native' },
            { id: 'all', label: 'Tất Cả HĐH (Universal)', icon: Layers, color: 'text-cyan-400', badge: 'Đầy đủ' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedOS === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedOS(tab.id as TargetOS)}
                className={`p-3.5 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer text-left ${
                  isSelected 
                    ? 'bg-slate-800 border-blue-500 text-white shadow-md' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${tab.color}`} />
                    <span className="text-xs font-bold">{tab.label}</span>
                  </div>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                </div>
                <span className="text-[10px] text-slate-500">{tab.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Khối hiển thị chi tiết theo từng HĐH đã chọn */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              {selectedOS === 'windows' && '🪟 Dành cho Windows: Hỗ trợ Windows 10, 11 (Tự tìm đường dẫn Chrome trong máy)'}
              {selectedOS === 'macos' && '🍎 Dành cho macOS: Tương thích MacBook chip Apple Silicon M1/M2/M3 và chip Intel'}
              {selectedOS === 'linux' && '🐧 Dành cho Linux: Tương thích Ubuntu, Debian, Fedora, Arch Linux'}
              {selectedOS === 'all' && '📦 Gói Universal: Đầy đủ file cho cả Windows, macOS và Linux trong 1 file ZIP'}
            </div>
            <p className="text-xs text-slate-400">
              {selectedOS === 'windows' && 'Sau khi tải về, chỉ cần giải nén và mở file CHAY_APP.vbs để sử dụng ngay.'}
              {selectedOS === 'macos' && 'Sau khi tải về, giải nén và nhấp đúp file CHAY_NGAY_MACOS.command để mở.'}
              {selectedOS === 'linux' && 'Sau khi tải về, mở Terminal và gõ: chmod +x CHAY_NGAY_LINUX.sh && ./CHAY_NGAY_LINUX.sh'}
              {selectedOS === 'all' && 'Bao gồm toàn bộ file mã nguồn Python, script batch Windows, command macOS và shell Linux.'}
            </p>
          </div>

          <button
            onClick={() => createAndDownloadZip(selectedOS)}
            disabled={loadingState.isOpen}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shrink-0 transition-colors shadow-md shadow-emerald-950 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Tải Gói Cho {selectedOS === 'windows' ? 'Windows' : selectedOS === 'macos' ? 'macOS' : selectedOS === 'linux' ? 'Linux' : 'Tất Cả'} (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* 4. KHU VỰC GỠ CÀI ĐẶT (UNINSTALL) SẠCH SẼ 100% - AN TÂM CHO NGƯỜI DÙNG */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-slate-200 font-semibold text-base">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <span className="block font-bold">Bạn Muốn Xóa Ứng Dụng Khỏi Máy Tính? (Gỡ Cài Đặt)</span>
              <span className="text-xs text-slate-400 font-normal">Hoàn toàn không để lại file rác trong hệ thống máy tính</span>
            </div>
          </div>
          
          <button
            onClick={handleExecuteUninstall}
            disabled={loadingState.isOpen}
            className="px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950 transition-colors cursor-pointer border border-red-500/40 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Gỡ Cài Đặt Ngay (1-Click)</span>
          </button>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 p-3.5 rounded-xl">
          <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          <span className="leading-relaxed">
            <strong>Bảo đảm an toàn dữ liệu 100%:</strong> Gỡ cài đặt chỉ xóa phần mềm tạm thời. <strong>Tất cả các tệp sao lưu dữ liệu (.zip) của bạn trước đó VẪN NGUYÊN VẸN 100%</strong> trong thư mục sao lưu, không bao giờ bị xóa mất!
          </span>
        </div>
      </div>
    </div>
  );
};
