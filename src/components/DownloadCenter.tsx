import React, { useState } from 'react';
import { 
  Download, FileCode, Terminal, Package, Check, Copy, 
  ExternalLink, ArrowRight, ShieldCheck, Zap, Laptop, FileText
} from 'lucide-react';
import JSZip from 'jszip';
import { PYTHON_SCRIPT_CODE, BUILD_BAT_CODE, REQUIREMENTS_TXT, POWERSHELL_SCRIPT } from '../data/pythonScript';

interface Props {
  onDownloadScript: () => void;
  onDownloadZip: () => void;
}

export const DownloadCenter: React.FC<Props> = ({ onDownloadScript, onDownloadZip }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

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

  const handleDownloadFullBundle = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      const readmeContent = `=============================================================================
HƯỚNG DẪN SỬ DỤNG VÀ ĐÓNG GÓI CHROME 100% FULL BACKUP & 1-CLICK AUTO RESTORE
=============================================================================

1. CÁC TẬP TIN TRONG GÓI NÀY:
   - chrome_backup_tool.py : Ứng dụng Python GUI chuyên nghiệp bảo vệ 100% dữ liệu
   - build_exe.bat         : Tập lệnh 1-Click tự động đóng gói sang file .exe độc lập
   - requirements.txt      : Danh sách thư viện (customtkinter, psutil, pyinstaller)
   - backup_chrome.ps1     : Phiên bản PowerShell tự động chạy trên mọi máy Windows

2. DỮ LIỆU ĐƯỢC LƯU TRỮ VÀ KHÔI PHỤC TOÀN VẸN 100%:
   ✓ TẤT CẢ PROFILES: Default, Profile 1, Profile 2, Profile 3...
   ✓ TOÀN BỘ COOKIES & PHIÊN ĐĂNG NHẬP: Không bao giờ bị bắt đăng nhập lại!
   ✓ KHÓA MASTER KEY DPAPI: Bảo tồn tệp Local State để giải mã cookies & mật khẩu
   ✓ TOÀN BỘ MẬT KHẨU ĐÃ LƯU: Login Data & Login Data For Account
   ✓ TOÀN BỘ EXTENSIONS: Giữ nguyên cấu hình mọi tiện ích mở rộng (MetaMask, ví,...)
   ✓ TABS ĐANG MỞ & SESSIONS: Current Session, Current Tabs, Last Tabs
   ✓ DẤU TRANG & LỊCH SỬ: Bookmarks, History, Favicons, Preferences

3. CÁCH SỬ DỤNG 1-CLICK AUTO RESTORE (TỰ ĐỘNG HÓA 100% - KHÔNG CẦN MANUAL):
   - Khi Chrome gặp lỗi crash hoặc tự động reset:
     Bước 1: Mở ứng dụng ChromeBackupRestore.exe (hoặc chrome_backup_tool.py).
     Bước 2: Nhấn nút [🔄 1-CLICK AUTO RESTORE].
     Bước 3: XONG! Ứng dụng sẽ tự động:
             + Tìm bản sao lưu mới nhất.
             + Tắt sạch các tiến trình chrome.exe bị treo.
             + Phục hồi nguyên vẹn 100% dữ liệu.
             + Tự động mở lại Google Chrome với tất cả Profiles và Tabs mở sẵn!

4. CÁCH ĐÓNG GÓI THÀNH FILE .EXE ĐỘC LẬP:
   - Chỉ cần click đúp vào file "build_exe.bat".
   - Sau ~45 giây, thư mục "dist\\ChromeBackupRestore\\ChromeBackupRestore.exe" sẽ xuất hiện.
   - Chép file .exe này sang bất kỳ máy tính nào để dùng mà không cần cài đặt Python!
`;

      zip.file("chrome_backup_tool.py", PYTHON_SCRIPT_CODE);
      zip.file("build_exe.bat", BUILD_BAT_CODE);
      zip.file("requirements.txt", REQUIREMENTS_TXT);
      zip.file("backup_chrome.ps1", POWERSHELL_SCRIPT);
      zip.file("HUONG_DAN_SU_DUNG.txt", readmeContent);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "Chrome_Backup_Restore_Tool_Package.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi khi nén zip:", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Banner tải trọn gói nổi bật */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-blue-950/70 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col gap-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold w-fit">
            <Package className="w-3.5 h-3.5" />
            Bộ Công Cụ Hoàn Chỉnh Đã Được Kiểm Tra Kỹ Lưỡng
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tải Trọn Gói Bản Cài Đặt & Script Build .EXE
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Bao gồm toàn bộ mã nguồn Python GUI (<code className="text-emerald-400">customtkinter</code> + <code className="text-emerald-400">tkinter</code>), script 1-Click tự động tạo file <code className="text-blue-400">.exe</code> qua PyInstaller, và hướng dẫn chi tiết chống mất Cookies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full lg:w-auto">
          <button
            id="btn-download-full-bundle"
            onClick={handleDownloadFullBundle}
            disabled={isZipping}
            className="px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg shadow-emerald-950 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-5 h-5" />
            <span>{isZipping ? 'Đang chuẩn bị file...' : 'Tải Trọn Gói (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Danh sách các tập tin có thể tải lẻ */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-emerald-400" />
          Tải Từng Tập Tin Riêng Lẻ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Python Script */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <FileCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">chrome_backup_tool.py</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ứng dụng Python GUI chính hoàn chỉnh. Hỗ trợ nút Xanh lá (Backup), Xanh dương (Restore), Log thời gian thực.
              </p>
            </div>
            <button
              onClick={() => downloadFile("chrome_backup_tool.py", PYTHON_SCRIPT_CODE)}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Tải file .py (14 KB)
            </button>
          </div>

          {/* Card 2: build_exe.bat */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <Terminal className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">build_exe.bat</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Script Windows 1-Click tự động tải thư viện và biên dịch ra file <code className="text-blue-300">.exe</code> độc lập chỉ bằng 1 cú nhấp đúp chuột.
              </p>
            </div>
            <button
              onClick={() => downloadFile("build_exe.bat", BUILD_BAT_CODE, "application/x-bat")}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Tải build_exe.bat (2 KB)
            </button>
          </div>

          {/* Card 3: requirements.txt */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-amber-500/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">requirements.txt</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Khai báo các thư viện Python: <code className="text-amber-300">customtkinter</code>, <code className="text-amber-300">psutil</code>, <code className="text-amber-300">pyinstaller</code>.
              </p>
            </div>
            <button
              onClick={() => downloadFile("requirements.txt", REQUIREMENTS_TXT)}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Tải requirements.txt
            </button>
          </div>

          {/* Card 4: backup_chrome.ps1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-purple-500/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Terminal className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">backup_chrome.ps1</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tập lệnh PowerShell gốc của Windows, có thể chạy thẳng mà không cần cài đặt Python.
              </p>
            </div>
            <button
              onClick={() => downloadFile("backup_chrome.ps1", POWERSHELL_SCRIPT, "text/plain")}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Tải file .ps1 (3 KB)
            </button>
          </div>
        </div>
      </div>

      {/* Hướng dẫn 3 bước đóng gói thành file .exe */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Hướng Dẫn Tạo File .EXE Độc Lập Trong 3 Bước (Chạy Không Cần Cài Python)
          </h3>
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
              Nhấn nút <strong>"Tải Trọn Gói (.ZIP)"</strong> ở trên và giải nén ra một thư mục bất kỳ trên máy tính của bạn (Ví dụ: <code className="text-slate-300">C:\ChromeTool</code>).
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
            <span>Hoặc lệnh thủ công qua terminal (Cmd / PowerShell):</span>
            <button
              onClick={() => copyToClipboard('pip install customtkinter psutil pyinstaller && pyinstaller --onedir --windowed --name "ChromeBackupRestore" chrome_backup_tool.py', 'manual-cmd')}
              className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-0.5 rounded transition-colors"
            >
              {copiedCmd === 'manual-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedCmd === 'manual-cmd' ? 'Đã copy' : 'Sao chép lệnh'}
            </button>
          </div>
          <code className="text-xs font-mono text-emerald-400 bg-black/40 p-2.5 rounded border border-slate-800 overflow-x-auto">
            pip install customtkinter psutil pyinstaller && pyinstaller --onedir --windowed --name "ChromeBackupRestore" chrome_backup_tool.py
          </code>
        </div>
      </div>
    </div>
  );
};
