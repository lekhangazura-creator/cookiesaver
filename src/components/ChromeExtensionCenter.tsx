import React, { useState, useEffect } from 'react';
import { 
  Download, Puzzle, ShieldCheck, CheckCircle2, AlertTriangle, AlertOctagon,
  Folder, Sparkles, RefreshCw, Zap, ExternalLink, HardDrive, Check,
  Info, Eye, Laptop, ArrowRight, Image as ImageIcon
} from 'lucide-react';
import { downloadExtensionZipPackage, generateExtensionIconBase64 } from '../utils/extensionPackage';

interface Props {
  onNotify: (msg: string) => void;
}

export const ChromeExtensionCenter: React.FC<Props> = ({ onNotify }) => {
  // 1. TỰ ĐỘNG GHI NHỚ VỊ TRÍ TẢI (Mô phỏng chrome.storage.local)
  const [savedFolder, setSavedFolder] = useState<string>(() => {
    return localStorage.getItem('ext_saved_download_folder') || 'Chrome_Backups/';
  });
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [tempFolderInput, setTempFolderInput] = useState(savedFolder);

  // 2. THANH TIẾN TRÌNH % CHO SIMULATOR POPUP
  const [simProgress, setSimProgress] = useState(0);
  const [simStepText, setSimStepText] = useState('Sẵn sàng');
  const [simDetailText, setSimDetailText] = useState('Nhấn 1-Click để bắt đầu');
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [simLastBackupTime, setSimLastBackupTime] = useState('Chưa thực hiện');

  const [stats, setStats] = useState({
    cookies: 1870,
    bookmarks: 245,
    tabs: 38
  });

  const handleSaveSimFolder = () => {
    let val = tempFolderInput.trim();
    if (!val) val = 'Chrome_Backups/';
    if (!val.endsWith('/')) val += '/';
    setSavedFolder(val);
    localStorage.setItem('ext_saved_download_folder', val);
    setIsEditingFolder(false);
    onNotify(`Đã ghi nhớ vị trí lưu mới: Downloads/${val} (Tự động nạp cho các lần sau)`);
  };

  // Giả lập Backup 1-Click trên Extension
  const runExtensionBackupSimulation = () => {
    if (isSimRunning) return;
    setIsSimRunning(true);
    setSimProgress(10);
    setSimStepText('⚠️ ĐANG SAO LƯU: ĐỪNG TẮT APP!');
    setSimDetailText('Hệ thống đang sao lưu, tuyệt đối không tắt trình duyệt hoặc đóng popup...');

    setTimeout(() => {
      setSimProgress(35);
      setSimStepText('Đang đọc Dấu trang (Bookmarks)...');
      setSimDetailText('Bảo tồn 245 dấu trang và cấu trúc cây thư mục...');

      setTimeout(() => {
        setSimProgress(65);
        setSimStepText('Đang lưu trữ Tabs & Cửa sổ đang mở...');
        setSimDetailText('Ghi lại 38 tabs và thứ tự hiển thị...');

        setTimeout(() => {
          setSimProgress(85);
          setSimStepText('Đang nén dữ liệu & Ghi nhớ vị trí tải...');
          setSimDetailText(`Tự động lưu vào: Downloads/${savedFolder} (Không hỏi lại)`);

          setTimeout(() => {
            setSimProgress(100);
            setSimStepText('✓ SAO LƯU 100% HOÀN TẤT!');
            setSimDetailText(`Tệp đã được lưu tự động vào Downloads/${savedFolder}chrome_full_backup.json`);
            
            const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            setSimLastBackupTime(`Hôm nay lúc ${nowTime}`);
            setIsSimRunning(false);

            // Kích hoạt tải file demo json
            const demoData = {
              app: "Chrome Full Backup Extension",
              timestamp: new Date().toISOString(),
              targetFolder: savedFolder,
              cookiesCount: 1870,
              tabsCount: 38,
              bookmarksCount: 245
            };
            const blob = new Blob([JSON.stringify(demoData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chrome_full_backup_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            onNotify(`Extension đã sao lưu thành công và tải vào thư mục ${savedFolder}!`);
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  // Giả lập Restore 1-Click trên Extension
  const runExtensionRestoreSimulation = () => {
    if (isSimRunning) return;
    setIsSimRunning(true);
    setSimProgress(15);
    setSimStepText('⚠️ CẢNH BÁO: Đang kiểm tra tệp sao lưu...');
    setSimDetailText('Khôi phục sẽ thay thế Cookies và nạp lại các tabs...');

    setTimeout(() => {
      setSimProgress(45);
      setSimStepText('Đang phục hồi 1,870 Cookies đăng nhập...');
      setSimDetailText('Ghi đè cookies bảo mật vào trình duyệt...');

      setTimeout(() => {
        setSimProgress(80);
        setSimStepText('Đang mở lại các Tabs phiên làm việc...');
        setSimDetailText('Mở lại 38 tabs và cửa sổ đã sao lưu...');

        setTimeout(() => {
          setSimProgress(100);
          setSimStepText('✓ KHÔI PHỤC HOÀN TẤT 100%!');
          setSimDetailText('Tất cả Cookies và Tabs đã được phục hồi nguyên vẹn.');
          setIsSimRunning(false);
          onNotify('Đã khôi phục 100% Cookies và Tabs trên Extension!');
        }, 700);
      }, 700);
    }, 700);
  };

  // Tải trọn gói Chrome Extension ZIP
  const handleDownloadExtensionZip = async () => {
    try {
      onNotify('Đang đóng gói tiện ích và tạo đầy đủ bộ icon chuẩn Chrome (16, 32, 48, 128px)...');
      await downloadExtensionZipPackage('Chrome_Full_Backup_Extension_v5.zip');
      onNotify('Đã tải xuống gói Chrome_Full_Backup_Extension_v5.zip đầy đủ icons!');
    } catch (err) {
      console.error(err);
      onNotify('Lỗi khi nén gói extension.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Banner Giới Thiệu & Nút Tải Extension */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold">
              <Puzzle className="w-3.5 h-3.5" />
              <span>BẢN TIỆN ÍCH MỞ RỘNG (CHROME EXTENSION)</span>
              <span className="bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded text-[10px]">Manifest V3</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Tiện Ích Chrome Full Backup Chạy Trực Tiếp Trên Trình Duyệt
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Phiên bản tiện ích hoạt động ngay trên Google Chrome mà không cần cài đặt Python hay quyền Administrator. Sở hữu đầy đủ các tính năng như bản .EXE: <strong>Tự động ghi nhớ vị trí tải</strong>, <strong>thanh % Progress Bar mượt mà</strong>, và <strong>cảnh báo an toàn thông minh</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Nhớ vị trí tải không cần chọn lại
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
                Có thanh % Progress Bar trực quan
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <CheckCircle2 className="w-4 h-4" />
                Cảnh báo an toàn & bảo vệ Cookies
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={handleDownloadExtensionZip}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-950/60 hover:shadow-cyan-900/80 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Tải Gói Extension (.ZIP)</span>
            </button>

            <span className="text-[11px] text-slate-400 text-center">
              Dung lượng ~45 KB • Cài đặt trong 10 giây
            </span>
          </div>
        </div>
      </section>

      {/* Grid: 1 Bên là Trình Giả Lập Popup Interactive, 1 Bên là Hướng Dẫn Cài Đặt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI: INTERACTIVE LIVE EXTENSION SIMULATOR */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Trải Nghiệm Trực Tiếp Giao Diện Tiện Ích Chrome Extension
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Mô phỏng Popup
            </span>
          </div>

          {/* KHUNG POPUP EXTENSION SIMULATOR */}
          <div className="bg-[#090d16] border border-cyan-500/50 rounded-2xl p-5 shadow-2xl max-w-md w-full mx-auto space-y-4 font-sans text-slate-100">
            {/* Header Popup */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  🛡️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-cyan-400">Chrome Full Backup</h4>
                  <p className="text-[10px] text-slate-400">Tiện ích sao lưu 1-Click trên Chrome</p>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-cyan-600 text-white px-2 py-0.5 rounded">
                v5.2.0 (Đủ Icons)
              </span>
            </div>

            {/* Vị trí đã ghi nhớ (Không cần chọn lại) */}
            <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" />
                  Vị Trí Đã Ghi Nhớ (Tự Động Lưu)
                </span>
                <button
                  onClick={() => setIsEditingFolder(!isEditingFolder)}
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  {isEditingFolder ? 'Hủy' : 'Đổi vị trí'}
                </button>
              </div>

              {isEditingFolder ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={tempFolderInput}
                    onChange={(e) => setTempFolderInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleSaveSimFolder}
                    className="px-2.5 py-1 bg-cyan-600 text-white rounded text-[10px] font-bold"
                  >
                    Lưu
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 font-mono text-[11px] text-slate-200 truncate">
                  Downloads/{savedFolder}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <span>Đã ghi nhớ tự động • Không cần chọn lại khi đóng extension</span>
              </div>
            </div>

            {/* Hộp Cảnh Báo An Toàn */}
            <div className="bg-amber-500/10 border-l-2 border-amber-400 rounded-r-lg p-2.5 text-[10px] text-amber-200/90 space-y-1">
              <div className="flex items-center gap-1 font-bold text-amber-300">
                <AlertTriangle className="w-3 h-3" />
                <span>CẢNH BÁO AN TOÀN & LƯU Ý:</span>
              </div>
              <p>
                • <strong className="text-red-400">Đang sao lưu: ĐỪNG TẮT APP/TRÌNH DUYỆT!</strong> Giữ nguyên cửa sổ cho đến khi đạt 100%.
              </p>
              <p>
                • <strong>Không gửi file:</strong> Tệp chứa Cookies phiên thật, không chia sẻ cho người khác.
              </p>
              <p>
                • <strong>Khi Restore:</strong> Khôi phục sẽ nạp lại phiên và mở lại các tabs đã lưu.
              </p>
            </div>

            {/* Banner Cảnh Báo Trực Tiếp Khi Đang Sao Lưu */}
            {isSimRunning && (
              <div className="bg-red-950/90 border border-red-500 rounded-lg p-2 flex items-center gap-2 text-red-200 text-[10px] animate-pulse">
                <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
                <div>
                  <span className="font-extrabold text-red-300 block uppercase tracking-wide">⚠️ ĐANG SAO LƯU: ĐỪNG TẮT APP!</span>
                  <span className="text-red-200/90 text-[9px]">Vui lòng giữ nguyên cửa sổ và không đóng tiện ích/trình duyệt.</span>
                </div>
              </div>
            )}

            {/* Thanh Tiến Trình % (Progress Bar %) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-emerald-400">{simStepText}</span>
                <span className="font-bold font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  {simProgress}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${simProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block truncate">{simDetailText}</span>
            </div>

            {/* 2 Nút Hành Động 1-Click */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={runExtensionBackupSimulation}
                disabled={isSimRunning}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>1-CLICK BACKUP</span>
              </button>

              <button
                onClick={runExtensionRestoreSimulation}
                disabled={isSimRunning}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/40 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>1-CLICK RESTORE</span>
              </button>
            </div>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2 rounded-lg text-center border border-slate-800">
              <div>
                <span className="block text-xs font-bold text-cyan-400">{stats.cookies.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400">Cookies</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-cyan-400">{stats.bookmarks}</span>
                <span className="text-[9px] text-slate-400">Bookmarks</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-cyan-400">{stats.tabs}</span>
                <span className="text-[9px] text-slate-400">Tabs Mở</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center">
              Lần sao lưu gần nhất: {simLastBackupTime}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: HƯỚNG DẪN CÀI ĐẶT & SO SÁNH TÍNH NĂNG */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Hướng Dẫn Cài Đặt 3 Bước */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-400" />
              Cách Cài Đặt Tiện Ích Trên Google Chrome (3 Bước)
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
                  1
                </span>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-white block">Tải file ZIP và giải nén</span>
                  <p className="text-slate-400">
                    Bấm nút <strong className="text-cyan-400">Tải Gói Extension (.ZIP)</strong> bên trên và giải nén ra một thư mục trên máy tính (ví dụ: <code className="text-slate-300">D:\Chrome_Extension</code>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
                  2
                </span>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-white block">Mở trang Quản Lý Tiện Ích của Chrome</span>
                  <p className="text-slate-400">
                    Mở tab mới trên Chrome, gõ vào thanh địa chỉ: <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">chrome://extensions/</code> và gạt công tắc <strong>Developer mode</strong> (Chế độ cho nhà phát triển) ở góc phải sang <strong>BẬT</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
                  3
                </span>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-white block">Bấm "Load unpacked" và chọn thư mục</span>
                  <p className="text-slate-400">
                    Nhấn nút <strong>Load unpacked</strong> (Tải tiện ích đã giải nén) ở góc trái và chọn thư mục vừa giải nén. Tiện ích sẽ xuất hiện ngay lập tức và sẵn sàng sử dụng!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kiểm tra & Xác Thực Bộ Icons Chuẩn Chrome Manifest V3 */}
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Bộ Biểu Tượng Chuẩn Chrome (Đã Tích Hợp Đầy Đủ)
              </h4>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Đạt Chuẩn Manifest V3
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Google Chrome yêu cầu bắt buộc phải có đủ các kích thước biểu tượng trong thư mục <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">icons/</code>. Gói ZIP tải xuống đã được tự động tạo sẵn 100% hình ảnh PNG hợp lệ, ngăn chặn hoàn toàn lỗi <code className="text-rose-400 bg-slate-950 px-1 py-0.5 rounded font-mono">Could not load icon</code> khi bấm "Load unpacked":
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { size: 16, label: "16x16 px", use: "Toolbar Icon" },
                { size: 32, label: "32x32 px", use: "Retina / Win High-DPI" },
                { size: 48, label: "48x48 px", use: "Trang Quản lý Tiện ích" },
                { size: 128, label: "128x128 px", use: "Cửa hàng & Cài đặt" }
              ].map((item) => {
                const iconBase64 = generateExtensionIconBase64(item.size);
                return (
                  <div key={item.size} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 flex items-center justify-center bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden">
                      <img 
                        src={`data:image/png;base64,${iconBase64}`} 
                        alt={`Icon ${item.size}`} 
                        className="object-contain"
                        style={{ width: Math.min(item.size, 36), height: Math.min(item.size, 36) }}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-white font-mono block">icons/{item.size}.png</span>
                      <span className="text-[10px] text-cyan-400 block">{item.label}</span>
                      <span className="text-[9px] text-slate-500 block leading-tight">{item.use}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* So Sánh Bản .EXE vs Bản Chrome Extension */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              So Sánh Giữa Bản .EXE (Desktop) & Bản Extension
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">Tính năng</th>
                    <th className="pb-2 text-emerald-400">Bản Desktop .EXE</th>
                    <th className="pb-2 text-cyan-400">Bản Extension</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  <tr>
                    <td className="py-2 font-semibold">Tự động nhớ vị trí đã tải</td>
                    <td className="py-2 text-emerald-300">✓ Qua config.json</td>
                    <td className="py-2 text-cyan-300">✓ Qua chrome.storage</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold">Thanh tiến trình Bar %</td>
                    <td className="py-2 text-emerald-300">✓ 0% - 100% chi tiết</td>
                    <td className="py-2 text-cyan-300">✓ 0% - 100% mượt mà</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold">Cảnh báo thông minh</td>
                    <td className="py-2 text-emerald-300">✓ Cảnh báo chrome.exe & file lock</td>
                    <td className="py-2 text-cyan-300">✓ Cảnh báo ghi đè cookies & tab</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold">Phạm vi sao lưu</td>
                    <td className="py-2 text-emerald-300">100% Thư mục Chrome vật lý</td>
                    <td className="py-2 text-cyan-300">100% Cookies, Tabs, Bookmarks</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold">Yêu cầu cài đặt</td>
                    <td className="py-2 text-slate-300">Windows (.exe hoặc Python)</td>
                    <td className="py-2 text-cyan-300">Mọi máy có Chrome (Mac, Win, Linux)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
