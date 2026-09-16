import React from 'react';
import { 
  AlertTriangle, ShieldCheck, Database, Key, 
  Layers, Clock, CheckCircle2, FileQuestion, HelpCircle, FolderCheck, HardDrive
} from 'lucide-react';

export const TechGuide: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6 text-slate-300">
      {/* Khối: Lưu thẳng toàn bộ cả thư mục Chrome (C:\Users\...\AppData\Local\Google\Chrome) */}
      <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-6 sm:p-7 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <FolderCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                Cơ Chế Mới: Lưu Thẳng Toàn Bộ Cả Thư Mục Chrome
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Khuyên Dùng Nhất
              </span>
            </div>
            <p className="text-xs text-emerald-300/80">
              Đường dẫn: <code className="font-mono text-white bg-slate-800/80 px-1.5 py-0.5 rounded">%LOCALAPPDATA%\Google\Chrome</code> — Lưu trọn vẹn 100% mọi tệp, không tách riêng Cookie hay Profile
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-1">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              1. Không Cần Chia 2 Việc Phức Tạp
            </span>
            <p className="text-slate-400 leading-relaxed">
              Trước đây bạn phải xuất Cookie riêng và lưu Profile riêng. Giờ đây công cụ lưu <strong>thẳng toàn bộ cả thư mục Chrome</strong> (<code className="text-slate-200">Google\Chrome</code>). Mọi tệp tin, từ <code className="text-white">User Data</code>, <code className="text-white">Local State</code>, tất cả profiles đến mọi extensions đều nằm chung trong 1 tệp duy nhất.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              2. Đảm Bảo Khóa Giải Mã Không Lệch
            </span>
            <p className="text-slate-400 leading-relaxed">
              Vì toàn bộ thư mục Chrome được đóng gói cùng nhau, tệp mã hóa <code className="text-white">Local State</code> và cơ sở dữ liệu <code className="text-white">Network/Cookies</code> luôn đồng bộ tuyệt đối về mốc thời gian. Khi khôi phục, Chrome mở lên có sẵn 100% cookie mà không bị coi là Guest!
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              3. Phục Hồi 1-Click Vào Đúng Vị Trí
            </span>
            <p className="text-slate-400 leading-relaxed">
              Khi nhấn <strong>[1-CLICK AUTO RESTORE]</strong>, script tự nhận diện và giải nén toàn bộ tệp vào <code className="text-emerald-300">%LOCALAPPDATA%\Google\Chrome</code>, tự vá cờ Normal Exit và bật Chrome lên cho bạn ngay tức khắc.
            </p>
          </div>
        </div>
      </div>

      {/* Khối giải thích tại sao restore bị giống Guest hoặc không có Cookie */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-7 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Tại Sao Khôi Phục Lại Thấy Profiles Rỗng, Mất Cookies Hoặc Giống Như "Guest Mode"?
            </h3>
            <p className="text-xs text-amber-300/80">
              Nguyên nhân chính xác từ cơ chế nén file và cách khắc phục 100% thành công
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-1">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-semibold text-rose-400">1. Tệp Backup Cũ Bị Nén Dở Dang</span>
            <p className="text-slate-400 leading-relaxed">
              Tệp backup cũ (ví dụ tệp 143.7 MB bị lỗi <code className="text-rose-300">File is not a zip file</code>) đã bị tắt ngang giữa chừng khi nén. Nó <strong>chỉ kịp tạo các thư mục Profile rỗng</strong>, còn toàn bộ tệp database <code className="text-white">Network/Cookies</code> (chứa token đăng nhập) và <code className="text-white">Login Data</code> (mật khẩu) nằm ở phần sau nên <strong>chưa kịp được nén vào file</strong>! Khi Chrome mở lên chỉ thấy folder rỗng nên tự đưa về trạng thái trắng (Guest).
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-semibold text-amber-400">2. Cờ "Crashed" Khóa Phiên Làm Việc</span>
            <p className="text-slate-400 leading-relaxed">
              Khi tiến trình Chrome bị đóng đột ngột, Chrome tự động ghi cờ <code className="text-amber-300">exit_type: "Crashed"</code> vào tệp Preferences. Khi mở lại, Chrome sẽ cách ly phiên làm việc cũ hoặc bật màn hình chọn tài khoản/Guest. Bản cập nhật mới đã tích hợp tính năng <strong>tự động dọn cờ về Normal Clean Exit</strong> giúp Chrome nạp ngay lập tức.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-semibold text-emerald-400">3. Cách Khắc Phục Dứt Điểm</span>
            <p className="text-slate-400 leading-relaxed">
              Hãy tải bản Python Script mới nhất:
              <br />• Nhấn nút màu xanh lá <strong>[1-CLICK AUTO BACKUP]</strong>: Bản mới nén siêu tốc chỉ 5-10 giây, đảm bảo 100% tệp Cookies và Local State được đóng gói trọn vẹn.
              <br />• Sau đó nhấn <strong>[1-CLICK AUTO RESTORE]</strong>: Chrome sẽ mở lại với đầy đủ tài khoản Facebook, Google, Shopee đã đăng nhập sẵn!
            </p>
          </div>
        </div>
      </div>

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
