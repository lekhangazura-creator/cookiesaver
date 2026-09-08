import React from 'react';
import { 
  AlertTriangle, ShieldCheck, Database, Key, 
  Layers, Clock, CheckCircle2, FileQuestion, HelpCircle 
} from 'lucide-react';

export const TechGuide: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6 text-slate-300">
      {/* Khối giải thích căn nguyên lỗi Chrome reset */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Tại Sao Chrome Crash Lại Bị "Reset Về Trắng Tinh" & Mất Sạch Đăng Nhập?
            </h3>
            <p className="text-xs text-slate-400">
              Phân tích cơ chế hoạt động của Chromium dưới góc nhìn lập trình hệ thống
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-2">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <h4 className="font-semibold text-amber-400 flex items-center gap-2">
              <Key className="w-4 h-4" />
              1. Hỏng tệp Master Key (Local State)
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Google Chrome không lưu cookie dưới dạng văn bản thô. Nó dùng hàm <code className="text-amber-300">CryptProtectData (DPAPI)</code> của Windows để mã hóa khóa AES trong tệp <code className="text-white">Local State</code>. Khi máy tính bị crash đột ngột (tắt nguồn, màn hình xanh, crash RAM), tệp <code className="text-white">Local State</code> bị dở dang (0 byte hoặc JSON lỗi). Khi mở lại, Chrome coi như tệp hỏng và <strong>tự động sinh key mới</strong>, khiến toàn bộ Cookies và Mật khẩu cũ không thể giải mã được nữa!
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <h4 className="font-semibold text-rose-400 flex items-center gap-2">
              <Database className="w-4 h-4" />
              2. Khóa cơ sở dữ liệu SQLite (Locked Files)
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Các tệp <code className="text-rose-300">Network/Cookies</code> và <code className="text-rose-300">Login Data</code> là các database SQLite ở chế độ WAL (Write-Ahead Logging). Khi Chrome crash nhưng tiến trình chạy ngầm chưa kịp thoát, các tệp này bị khóa chặt. Nếu người dùng cố mở Chrome hoặc sao chép, hệ điều hành báo lỗi <code className="text-white">WinError 32: File Locked</code> dẫn đến hỏng cấu trúc profile.
            </p>
          </div>
        </div>
      </div>

      {/* Khối giải thích giải pháp của công cụ Python */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Giải Pháp Khắc Phục Triệt Để Của Ứng Dụng Này
            </h3>
            <p className="text-xs text-slate-400">
              Nguyên lý sao lưu và phục hồi giữ nguyên 100% phiên làm việc không bị bắt đăng nhập lại
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-2">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              1. Tắt Chrome triệt để
            </span>
            <p className="text-slate-400 leading-relaxed">
              Ứng dụng tự động chạy lệnh tắt toàn bộ cây tiến trình <code className="text-emerald-300">taskkill /F /IM chrome.exe</code> và tạm dừng 1.5 giây để SQLite đóng các file journal an toàn trước khi nén hoặc ghi đè.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              2. Giữ nguyên Master Key
            </span>
            <p className="text-slate-400 leading-relaxed">
              Bản sao lưu lưu trữ chính xác tệp <code className="text-emerald-300">Local State</code> gốc. Khi restore, Chrome nhận lại đúng khóa DPAPI ban đầu, giải mã thành công tất cả Cookies của Google, Facebook, Shopee, Telegram...
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              3. Loại trừ rác Cache thông minh
            </span>
            <p className="text-slate-400 leading-relaxed">
              Loại bỏ các thư mục tạm vô dụng (<code className="text-slate-300">Code Cache, GPUCache, Crashpad</code>) giúp giảm kích thước file backup từ 20GB xuống chỉ còn ~150MB, quá trình sao lưu chỉ mất 3-5 giây!
            </p>
          </div>
        </div>
      </div>

      {/* Cấu trúc các tệp quan trọng trong thư mục Chrome User Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          Bản Đồ Cấu Trúc Các Tệp Quan Trọng Trong Chrome User Data
        </h3>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto">
          <div className="text-emerald-400 font-bold mb-2">
            %LOCALAPPDATA%\Google\Chrome\User Data\
          </div>
          <div className="pl-4 border-l border-slate-800 space-y-1.5">
            <div>
              <span className="text-amber-400 font-bold">├── Local State</span>
              <span className="text-slate-500 ml-3">← [QUAN TRỌNG NHẤT] Chứa master key DPAPI giải mã cookies & passwords</span>
            </div>
            <div>
              <span className="text-blue-400 font-bold">├── Default / Profile 1 / Profile 2...</span>
              <span className="text-slate-500 ml-3">← Các hồ sơ người dùng riêng biệt</span>
            </div>
            <div className="pl-6 border-l border-slate-800 space-y-1">
              <div>
                <span className="text-emerald-300">├── Network/Cookies</span>
                <span className="text-slate-500 ml-3">← SQLite DB lưu tất cả Cookies và Sessions đăng nhập</span>
              </div>
              <div>
                <span className="text-emerald-300">├── Sessions/</span>
                <span className="text-slate-500 ml-3">← Các tab đang mở, khôi phục trạng thái duyệt web</span>
              </div>
              <div>
                <span className="text-emerald-300">├── Login Data</span>
                <span className="text-slate-500 ml-3">← Mật khẩu tài khoản đã lưu</span>
              </div>
              <div>
                <span className="text-emerald-300">├── Bookmarks</span>
                <span className="text-slate-500 ml-3">← Dấu trang website</span>
              </div>
              <div>
                <span className="text-emerald-300">├── Extensions/</span>
                <span className="text-slate-500 ml-3">← Toàn bộ tiện ích mở rộng đã cài đặt</span>
              </div>
              <div>
                <span className="text-slate-500 line-through">├── Cache / Code Cache / GPUCache</span>
                <span className="text-emerald-400 ml-3">← (Được công cụ tự động bỏ qua để tiết kiệm 95% dung lượng)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thiết lập tự động sao lưu định kỳ với Windows Task Scheduler */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Cách Tự Động Sao Lưu Hàng Ngày Bằng Windows Task Scheduler
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Nếu bạn muốn máy tính tự động tạo bản sao lưu mỗi ngày lúc 12h trưa hoặc khi khởi động máy:
        </p>

        <ol className="list-decimal list-inside text-xs space-y-2 text-slate-300 mt-2">
          <li>Nhấn phím <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-white">Win + R</kbd>, gõ <code className="text-emerald-400">taskschd.msc</code> rồi nhấn Enter.</li>
          <li>Chọn <strong>Create Basic Task...</strong> đặt tên là <code className="text-white font-mono">AutoBackupChrome</code>.</li>
          <li>Chọn tần suất: <strong>Daily (Hàng ngày)</strong> hoặc <strong>When I log on (Mỗi khi mở máy)</strong>.</li>
          <li>Chọn <strong>Start a program</strong>, trỏ đến file <code className="text-white font-mono">ChromeBackupRestore.exe</code> hoặc file script <code className="text-white font-mono">backup_chrome.ps1</code>.</li>
          <li>Nhấn <strong>Finish</strong>. Từ nay hệ thống sẽ tự động bảo vệ dữ liệu Chrome của bạn hoàn toàn tự động!</li>
        </ol>
      </div>
    </div>
  );
};
