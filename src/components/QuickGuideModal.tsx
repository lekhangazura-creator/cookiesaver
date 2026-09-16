import React, { useState } from 'react';
import { 
  HelpCircle, X, BookOpen, Check, ShieldCheck, HardDrive, 
  Terminal, AlertTriangle, Layers, RotateCcw, Zap, Trash2, 
  Apple, Laptop, Sparkles, FileText, ExternalLink
} from 'lucide-react';
import { QuickGuideTopic } from '../types';

export const GUIDE_TOPICS: Record<string, QuickGuideTopic> = {
  auto_memory: {
    id: 'auto_memory',
    title: 'Tự Động Ghi Nhớ Vị Trí Lưu Trữ',
    shortDesc: 'Ứng dụng tự động lưu vị trí vào config.json và ghi nhớ vĩnh viễn, bạn không cần chọn lại mỗi lần mở app.',
    bullets: [
      'Tự động ghi nhớ thư mục sao lưu (mặc định Documents\\Chrome_Backups trên Windows hoặc ~/Documents/Chrome_Backups trên macOS/Linux).',
      'Lưu trữ trạng thái vào config.json, không làm phiền người dùng phải chọn lại mỗi khi đóng và mở lại ứng dụng.',
      'Cho phép nhấn nút "Đổi vị trí" bất cứ lúc nào để chuyển sang ổ cứng D:, E:, USB an toàn hoặc ổ di động.',
      'Hỗ trợ đường dẫn chuẩn tương thích trên cả Windows, macOS và Linux.'
    ],
    technicalTip: 'Vị trí được lưu đồng thời trong localStorage của Web UI và config.json của bản Desktop (.EXE / Python / Shell script).',
    referenceFile: 'HUONG_DAN_SU_DUNG.txt (Mục 1 & 2)'
  },
  smart_alerts: {
    id: 'smart_alerts',
    title: 'Hệ Thống Cảnh Báo An Toàn & Lưu Ý Kỹ Thuật',
    shortDesc: 'Hệ thống cảnh báo đa lớp giúp bảo vệ dữ liệu, chống khóa file SQLite và chống văng phiên đăng nhập.',
    bullets: [
      '🚨 CẢNH BÁO QUAN TRỌNG: Khi đang sao lưu (thanh % đang chạy), TUYỆT ĐỐI ĐỪNG TẮT APP, đừng đóng cửa sổ hoặc rút ổ cứng để tránh làm hỏng tệp ZIP (corrupted archive).',
      '⚠️ Tránh xung đột File Lock: Khi Chrome đang mở, các file cơ sở dữ liệu SQLite như Network/Cookies và Login Data sẽ bị khóa cứng. Ứng dụng sẽ tự động đóng chrome.exe an toàn trước khi nén.',
      '⚠️ Cảnh báo ghi đè khi Restore: Khôi phục sẽ thay thế toàn bộ Profiles hiện tại bằng dữ liệu trong bản sao lưu đã chọn.',
      '✓ Vá cờ Normal Exit: Tự động sửa exit_type = "Normal" và exited_cleanly = true trong Preferences để Chrome không bao giờ bị văng về chế độ Guest sau khi khôi phục.'
    ],
    technicalTip: 'Kỹ thuật taskkill an toàn kết hợp sleep 1.8s bảo đảm 100% file handle được giải phóng hoàn toàn trước khi nén SQLite.',
    referenceFile: 'HUONG_DAN_SU_DUNG.txt (Mục 2 & Cảnh báo an toàn)'
  },
  progress_bar: {
    id: 'progress_bar',
    title: 'Thanh Tiến Trình % (Progress Bar 0% - 100%)',
    shortDesc: 'Trực quan hóa chính xác từng bước thực thi với thanh phần trăm và mô tả tiến trình thời gian thực.',
    bullets: [
      '[1/5] Kiểm tra tiến trình Chrome & File SQLite (Quét chrome.exe ngầm).',
      '[2/5] Đóng an toàn chrome.exe để giải phóng hoàn toàn khóa tệp SQLite.',
      '[3/5] Khởi tạo tệp lưu trữ bảo mật tại vị trí đã ghi nhớ, trích xuất Master Key DPAPI.',
      '[4/5] Nén tất cả Profiles (Default, Profile 1,...), 100% Cookies, Passwords, Extensions và Tabs.',
      '[5/5] Kiểm tra toàn vẹn dữ liệu, hoàn tất 100% và ghi nhận trạng thái vào lịch sử.'
    ],
    technicalTip: 'Thanh tiến trình phản ánh chính xác các giai đoạn I/O ổ đĩa, giúp người dùng nắm bắt tình trạng mà không sốt ruột.',
    referenceFile: 'HUONG_DAN_SU_DUNG.txt (Mục 2 - Quy trình sao lưu)'
  },
  one_click_backup: {
    id: 'one_click_backup',
    title: '1-Click Auto Backup Toàn Diện 100%',
    shortDesc: 'Sao lưu trọn vẹn tất cả Profiles, Cookies DPAPI, Mật khẩu, Tiện ích mở rộng và Tabs vào vị trí đã nhớ.',
    bullets: [
      'Sao lưu 100% tất cả Profiles: Default, Profile 1, Profile 2, Profile 3,... không sót bất kỳ tài khoản nào.',
      'Bảo tồn 100% Cookies SQLite và Session Tokens: Đảm bảo không bao giờ bị đăng xuất khỏi Facebook, Gmail, Shopee, Telegram.',
      'Bảo tồn khóa Master Key DPAPI (Local State & os_crypt) để mật khẩu và cookies đã lưu có thể giải mã bình thường.',
      'Lưu trữ trọn vẹn toàn bộ Extensions và dữ liệu nội bộ của Extensions.',
      'Lưu trạng thái phiên làm việc (Current Session, Current Tabs) để phục hồi nguyên trạng các tab đang mở.'
    ],
    technicalTip: 'Chế độ Thông minh tự động bỏ qua cache tạm thời (GPUCache, Code Cache) để file ZIP nhỏ gọn hơn 70% mà vẫn nguyên vẹn 100% phiên đăng nhập.',
    referenceFile: 'HUONG_DAN_SU_DUNG.txt (Mục 1 & 2)'
  },
  one_click_restore: {
    id: 'one_click_restore',
    title: '1-Click Auto Restore (Khôi Phục & Mở Lại Chrome)',
    shortDesc: 'Giải nén bản mới nhất, sửa lỗi Normal Exit và tự động mở lại Chrome với đầy đủ Profiles & Tabs.',
    bullets: [
      'Tự động định vị bản sao lưu mới nhất trong thư mục đã ghi nhớ, hoặc cho phép chọn thủ công bản backup mong muốn.',
      'Tắt sạch Google Chrome ngầm trước khi giải nén để tránh ghi đè lỗi tệp.',
      'Giải nén và phục hồi chính xác cấu trúc thư mục User Data của Chrome.',
      'Tự động vá cờ Normal Clean Exit trong file Preferences của tất cả Profiles.',
      'Tự động khởi chạy Google Chrome với tham số --restore-last-session để mở lại toàn bộ các tab.'
    ],
    technicalTip: 'Lỗi văng về tài khoản Guest là lỗi phổ biến nhất khi phục hồi thủ công. Công cụ giải quyết triệt để vấn đề này bằng bộ vá Preferences.',
    referenceFile: 'HUONG_DAN_SU_DUNG.txt (Mục 2 - Khôi phục 1-Click)'
  },
  multi_os: {
    id: 'multi_os',
    title: 'Hỗ Trợ Mọi Loại Hệ Điều Hành (Windows, macOS, Linux)',
    shortDesc: 'Hoạt động đồng bộ trên Windows 10/11, macOS (Apple Silicon M1/M2/M3 & Intel) và mọi bản phân phối Linux.',
    bullets: [
      '🪟 Windows: Chạy ngay với CHAY_NGAY_POWERSHELL.bat (không cần cài gì cả), CHAY_NGAY_PYTHON.bat hoặc build sang ChromeBackupRestore.exe.',
      '🍎 macOS: Hỗ trợ cả chip M1/M2/M3/M4 và chip Intel. Nhấp đúp vào CHAY_NGAY_MACOS.command hoặc chạy ./backup_chrome_unix.sh. Đường dẫn Chrome: ~/Library/Application Support/Google/Chrome.',
      '🐧 Linux: Tương thích Ubuntu, Debian, Fedora, Arch, Manjaro, Linux Mint. Chạy ./CHAY_NGAY_LINUX.sh hoặc ./backup_chrome_unix.sh. Đường dẫn Chrome: ~/.config/google-chrome.',
      '📦 Gói Đa Nền Tảng: Bản tải về chứa sẵn toàn bộ file script và mã nguồn tối ưu cho cả 3 hệ điều hành trong cùng một gói ZIP.'
    ],
    technicalTip: 'Mã nguồn Python tự động nhận diện sys.platform ("win32", "darwin", "linux") để tự điều chỉnh đường dẫn tệp và lệnh tắt/mở Chrome.',
    referenceFile: 'HUONG_DAN_SU_DUNG.txt (Mục 2 - Đa hệ điều hành)'
  },
  uninstall_clean: {
    id: 'uninstall_clean',
    title: 'Gỡ Cài Đặt (Uninstall) 100% Sạch Sẽ',
    shortDesc: 'Dọn dẹp sạch sẽ cấu hình tạm mà vẫn giữ an toàn 100% các file .zip sao lưu của bạn.',
    bullets: [
      'Thiết kế dạng Portable: Không chôn file rác vào Windows Registry hay các thư mục hệ thống.',
      'Cách 1: Nhấn trực tiếp nút màu đỏ "Gỡ cài đặt (Uninstall)" ngay trong giao diện ứng dụng.',
      'Cách 2: Chạy file UNINSTALL.bat (trên Windows) hoặc UNINSTALL_UNIX.sh (trên macOS/Linux).',
      'Xóa sạch config.json và các thư mục tạm (build, dist, __pycache__) trong 1 giây.',
      '✓ Bảo toàn dữ liệu: Mọi tệp sao lưu Chrome (.zip) trong thư mục sao lưu VẪN ĐƯỢC GIỮ NGUYÊN AN TOÀN 100%.'
    ],
    technicalTip: 'Quá trình gỡ cài đặt chỉ dọn dẹp các tệp cấu hình của công cụ, tuyệt đối không chạm vào thư mục Chrome của bạn.',
    referenceFile: 'HUONG_DAN_SU_DUNG.txt (Mục 3 - Gỡ cài đặt sạch sẽ)'
  },
  scheduler: {
    id: 'scheduler',
    title: 'Bộ Lập Lịch Sao Lưu Tự Động (Auto Scheduler)',
    shortDesc: 'Cấu hình tần suất tự động sao lưu Chrome profiles theo chu kỳ để không bao giờ bị quên.',
    bullets: [
      'Tần suất linh hoạt: Chọn sao lưu hàng ngày (Daily), hàng tuần (Weekly), mỗi X giờ hoặc khi mở máy tính.',
      'Cơ chế chống quên: Tự động lên lịch chạy định kỳ mà không cần người dùng phải nhớ thao tác thủ công.',
      'Tự động đóng Chrome an toàn: Tránh lỗi xung đột khóa tệp SQLite trước khi sao chép ngầm.',
      'Thông báo nhắc nhở trước 5 phút: Giúp bạn kịp thời lưu các tab quan trọng.',
      'Tích hợp Hệ điều hành: Xuất tệp .bat tự động đăng ký Windows Task Scheduler hoặc Crontab cho macOS/Linux.'
    ],
    technicalTip: 'Sử dụng Windows Task Scheduler (schtasks.exe) cho phép tác vụ chạy ngầm hoàn toàn không hiện cửa sổ, không làm gián đoạn công việc.',
    referenceFile: 'HUONG_DAN_SU_DUNG.txt (Mục 4 - Lập lịch tự động)'
  }
};

interface QuickGuideButtonProps {
  topicId: keyof typeof GUIDE_TOPICS;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const QuickGuideButton: React.FC<QuickGuideButtonProps> = ({
  topicId,
  label,
  size = 'sm',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const topic = GUIDE_TOPICS[topicId];

  if (!topic) return null;

  return (
    <>
      <button
        type="button"
        id={`btn-guide-${topicId}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        title={`Hướng dẫn nhanh: ${topic.title}`}
        className={`inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 rounded-full px-2 py-0.5 transition-all shadow-sm cursor-pointer ${
          size === 'sm' ? 'text-[10px]' : 'text-xs px-2.5 py-1'
        } ${className}`}
      >
        <HelpCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{label || 'Hướng dẫn (?)'}</span>
      </button>

      {isOpen && (
        <QuickGuideModal topic={topic} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};

interface ModalProps {
  topic: QuickGuideTopic;
  onClose: () => void;
}

export const QuickGuideModal: React.FC<ModalProps> = ({ topic, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block">
                Hướng Dẫn Nhanh • HUONG_DAN_SU_DUNG.txt
              </span>
              <h3 className="text-base font-extrabold text-white leading-tight">
                {topic.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Short description */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-medium">
          💡 {topic.shortDesc}
        </div>

        {/* Bullet points */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Chi tiết quan trọng:
          </span>
          <ul className="space-y-2">
            {topic.bullets.map((b, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                  ✓
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical tip */}
        {topic.technicalTip && (
          <div className="bg-cyan-950/40 border border-cyan-800/40 p-3 rounded-xl text-[11px] text-cyan-200/90 leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-300">Ghi chú kỹ thuật: </strong>
              {topic.technicalTip}
            </div>
          </div>
        )}

        {/* Reference */}
        {topic.referenceFile && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Nguồn: {topic.referenceFile}
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
