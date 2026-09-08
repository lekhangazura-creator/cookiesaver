/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import { Header } from './components/Header';
import { DesktopGuiSimulator } from './components/DesktopGuiSimulator';
import { DownloadCenter } from './components/DownloadCenter';
import { CodeViewer } from './components/CodeViewer';
import { TechGuide } from './components/TechGuide';
import { CookieFileEditor } from './components/CookieFileEditor';
import { PYTHON_SCRIPT_CODE, BUILD_BAT_CODE, REQUIREMENTS_TXT, POWERSHELL_SCRIPT } from './data/pythonScript';
import { ShieldCheck, HardDrive, Terminal, Download, Zap, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'download' | 'code' | 'guide' | 'editor'>('simulator');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  const handleDownloadZip = async () => {
    try {
      showToast('Đang đóng gói file ZIP...');
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

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Chrome_Backup_Restore_Tool_Package.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Đã tải xuống gói Chrome_Backup_Restore_Tool_Package.zip!');
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi nén gói zip.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onDownloadZip={handleDownloadZip}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8">
        {/* Quick Highlights Info Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Chống mất Cookies & Session khi Chrome Crash
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <Terminal className="w-4 h-4" />
              Tự động tắt <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">chrome.exe</code> (Không khóa file)
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <HardDrive className="w-4 h-4" />
              Đóng gói <code className="bg-slate-800 px-1 py-0.5 rounded text-purple-300">.exe</code> độc lập qua PyInstaller
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className="text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 px-3 py-1 rounded-md transition-all flex items-center gap-1.5 shadow-sm shadow-amber-950/40 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>🎮 AI Mod Game & Cookies</span>
            </button>
            <button
              onClick={handleDownloadScript}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-md border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Tải .py
            </button>
            <button
              onClick={handleDownloadZip}
              className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-md transition-colors flex items-center gap-1 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              Tải gói Build .EXE
            </button>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'simulator' && (
          <DesktopGuiSimulator 
            onDownloadScript={handleDownloadScript}
            onDownloadZip={handleDownloadZip}
          />
        )}

        {activeTab === 'download' && (
          <DownloadCenter 
            onDownloadScript={handleDownloadScript}
            onDownloadZip={handleDownloadZip}
          />
        )}

        {activeTab === 'code' && (
          <CodeViewer />
        )}

        {activeTab === 'guide' && (
          <TechGuide />
        )}

        {activeTab === 'editor' && (
          <CookieFileEditor />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Ứng dụng Chrome Profile & Session Backup / Restore Tool • Tương thích mọi phiên bản Google Chrome & Windows
          </span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Python 3.8+ / PyInstaller</span>
            <span>•</span>
            <span>CustomTkinter / Tkinter</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
