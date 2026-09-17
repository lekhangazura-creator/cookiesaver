import React, { useState } from 'react';
import { 
  HelpCircle, X, BookOpen, Check, ShieldCheck, HardDrive, 
  Terminal, AlertTriangle, Layers, RotateCcw, Zap, Trash2, 
  Apple, Laptop, Sparkles, FileText, ChevronRight, ChevronLeft,
  Search, ArrowRight, Download, Puzzle, Palette, Clock, CheckCircle2,
  ExternalLink, Eye, Info
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'backup' | 'download' | 'extension') => void;
  onOpenThemeStudio?: () => void;
  onOpenScheduler?: () => void;
}

interface ComponentHelpItem {
  id: string;
  name: string;
  category: 'Cốt Lõi' | 'Tự Động & Lập Lịch' | 'Đa Nền Tảng' | 'Giao Diện';
  icon: React.ElementType;
  iconColor: string;
  summary: string;
  whatItDoes: string;
  howToUse: string[];
  safetyNote?: string;
  actionButton?: {
    label: string;
    action: () => void;
  };
}

export const AppTutorialModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenThemeStudio,
  onOpenScheduler
}) => {
  const [viewMode, setViewMode] = useState<'walkthrough' | 'directory'>('walkthrough');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  if (!isOpen) return null;

  // Danh sách các bước trong Walkthrough (6 bước toàn diện)
  const walkthroughSteps = [
    {
      step: 1,
      title: 'Chào Mừng & Tổng Quan Ứng Dụng',
      badge: 'BẮT ĐẦU NHANH',
      icon: Sparkles,
      iconColor: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
      description: 'Đây là công cụ sao lưu và phục hồi Google Chrome chuyên nghiệp, bảo toàn 100% tài khoản, Cookies và Mật khẩu trên mọi hệ điều hành (Windows, macOS, Linux).',
      highlights: [
        '2 Ngăn chính trên Header: [Bản App (.EXE / Desktop)] và [Bản Extension].',
        'Bộ đổi giao diện Sáng / Tối và Theme Studio tùy biến màu sắc trực quan.',
        'Thiết kế Portable 100%: Không chèn file rác vào registry, dễ dàng di chuyển và sao chép.',
        'Hỗ trợ đầy đủ Tiếng Việt và các mẹo kỹ thuật chuẩn DPAPI.'
      ],
      tip: 'Bạn có thể xem lại hướng dẫn này bất kỳ lúc nào bằng cách nhấp vào nút "Hướng dẫn nhanh (?)" trên thanh Header.'
    },
    {
      step: 2,
      title: 'Tự Động Ghi Nhớ Vị Trí (Auto Memory)',
      badge: 'CỐT LÕI',
      icon: HardDrive,
      iconColor: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40',
      description: 'Ứng dụng tự động ghi nhớ thư mục lưu trữ vào config.json và localStorage, bạn không cần phải chọn lại thư mục mỗi lần khởi động.',
      highlights: [
        'Vị trí mặc định chuẩn: C:\\Users\\...\\Documents\\Chrome_Backups (trên Windows) hoặc ~/Documents/Chrome_Backups (trên macOS/Linux).',
        'Nhấn nút "Đổi vị trí" để dễ dàng chuyển sang ổ D:, E: hoặc USB sao lưu an toàn.',
        'Mọi bản sao lưu tiếp theo sẽ tự động lưu thẳng vào thư mục đã chọn mà không làm phiền bạn.',
        'Đồng bộ tức thì với các bản script Desktop (.bat, .command, .sh).'
      ],
      tip: 'Khuyên dùng: Nên lưu trữ vào ổ đĩa khác với ổ cài đặt hệ điều hành C: hoặc USB di động để phòng trường hợp máy tính bị cài lại Windows.'
    },
    {
      step: 3,
      title: '⚡ 1-Click Auto Backup & Thanh Tiến Trình %',
      badge: 'SAO LƯU 100%',
      icon: Zap,
      iconColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
      description: 'Sao lưu trọn vẹn tất cả Profiles (Default, Profile 1, 2,...), 100% Cookies SQLite, Sessions và Mật khẩu DPAPI.',
      highlights: [
        'Tự động đóng chrome.exe an toàn: Tránh hoàn toàn lỗi khóa file SQLite (File Lock) làm rỗng file Cookies.',
        'Thanh Tiến trình % (0% - 100%): Trực quan hóa từng giai đoạn từ quét Chrome, trích xuất DPAPI Master Key, nén dữ liệu đến kiểm tra toàn vẹn.',
        '🚨 CẢNH BÁO QUAN TRỌNG: Khi thanh % đang chạy, TUYỆT ĐỐI KHÔNG TẮT APP hoặc rút ổ đĩa để tránh làm hỏng file nén ZIP.',
        'Bảo tồn 100% trạng thái tab đang mở để phục hồi nguyên vẹn khi cần.'
      ],
      tip: 'Chế độ Thông minh tự động bỏ qua GPUCache và cache tạm thời, giúp file ZIP nhỏ gọn hơn 70% mà không mất bất kỳ cookie nào.'
    },
    {
      step: 4,
      title: '🔄 1-Click Auto Restore & Vá Lỗi Normal Exit',
      badge: 'KHÔI PHỤC',
      icon: RotateCcw,
      iconColor: 'text-blue-400 bg-blue-500/20 border-blue-500/40',
      description: 'Khôi phục phiên làm việc nhanh chóng, tự động vá lỗi văng tài khoản Guest và mở lại toàn bộ các tab.',
      highlights: [
        'Tự động chọn bản sao lưu mới nhất trong thư mục ghi nhớ, hoặc cho phép bạn chọn bản bất kỳ trong lịch sử.',
        'Tắt Chrome ngầm trước khi giải nén để tránh xung đột ghi đè.',
        '✓ Vá cờ Normal Exit: Tự động sửa Preferences (exit_type = "Normal", exited_cleanly = true) để Chrome không bao giờ bị văng tài khoản.',
        'Tự động khởi động lại Chrome với tham số --restore-last-session khôi phục toàn bộ các tab đang mở.'
      ],
      tip: 'Nếu muốn khôi phục bản sao lưu cũ hơn, hãy nhấp chọn file trong danh sách "Bản Sao Lưu Trong Vị Trí Đã Nhớ" trước khi nhấn Restore.'
    },
    {
      step: 5,
      title: '⏰ Bộ Lập Lịch Sao Lưu Tự Động (Auto Scheduler)',
      badge: 'TÍNH NĂNG MỚI',
      icon: Clock,
      iconColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
      description: 'Cấu hình tần suất tự động sao lưu định kỳ để bạn không bao giờ phải lo lắng về việc quên sao lưu Chrome.',
      highlights: [
        'Tần suất linh hoạt: Hàng ngày (Daily), Hàng tuần (Weekly), Mỗi X giờ hoặc Khi mở máy.',
        'Hẹn giờ thông minh: Chọn thời gian thích hợp (ví dụ 20:00 tối sau khi hoàn thành công việc).',
        'Tích hợp Windows Task Scheduler: Xuất file .BAT tạo tác vụ chạy ngầm hoàn toàn không hiện cửa sổ.',
        'Tùy chọn tự động dọn dẹp các bản cũ (Retention) để tránh làm đầy dung lượng ổ cứng.'
      ],
      tip: 'Nhấn nút "Tùy Chỉnh Lịch" trên thẻ Scheduler để cấu hình giờ chạy và tải file kích hoạt tự động cho máy tính.'
    },
    {
      step: 6,
      title: '📦 Tải Bản Cài Đặt (.EXE, Scripts) & Extension',
      badge: 'ĐA NỀN TẢNG',
      icon: Download,
      iconColor: 'text-purple-400 bg-purple-500/20 border-purple-500/40',
      description: 'Sử dụng công cụ ở bất kỳ đâu: ứng dụng độc lập trên máy tính hoặc tiện ích tích hợp ngay trong Chrome.',
      highlights: [
        'Ngăn "Tải Bản .EXE": Tải trọn bộ script Windows PowerShell (CHAY_NGAY_POWERSHELL.bat - chạy ngay không cần cài thêm gì), macOS (.command), Linux (.sh).',
        'Ngăn "Tải Bản Extension": Cài đặt tiện ích mở rộng trực tiếp vào chrome://extensions để sao lưu nhanh trong 1 click.',
        'Gỡ cài đặt sạch sẽ (Uninstall): Xóa toàn bộ file tạm và config.json mà vẫn giữ nguyên 100% các file .zip sao lưu của bạn.'
      ],
      tip: 'Bản PowerShell trên Windows hoàn toàn độc lập, không yêu cầu cài đặt Python hay bất kỳ phần mềm bên thứ 3 nào.'
    }
  ];

  // Danh mục tất cả thành phần để tra cứu
  const allComponents: ComponentHelpItem[] = [
    {
      id: 'auto_memory',
      name: 'Vị Trí Đã Ghi Nhớ (Auto Memory)',
      category: 'Cốt Lõi',
      icon: HardDrive,
      iconColor: 'text-cyan-400',
      summary: 'Tự động lưu và nhớ đường dẫn thư mục backup vĩnh viễn vào config.json.',
      whatItDoes: 'Ghi nhớ đường dẫn lưu trữ để bạn không phải chọn lại mỗi lần mở app. Hỗ trợ chuyển sang ổ D:, E:, USB với 1 cú nhấp chuột.',
      howToUse: [
        'Xem vị trí hiện tại ở thanh cấu hình của Bản App (.EXE / Desktop).',
        'Tập lệnh và App tự động lưu vị trí sao lưu vào config.json trong cùng thư mục.',
        'Đường dẫn sẽ được lưu tự động cho mọi lần sử dụng tiếp theo.'
      ],
      safetyNote: 'Đường dẫn hợp lệ trên Windows có dạng C:\\Users\\... hoặc D:\\Backups, trên macOS là ~/Documents/Backups.',
      actionButton: onNavigateToTab ? {
        label: 'Mở Bản App (.EXE)',
        action: () => {
          onNavigateToTab('app');
          onClose();
        }
      } : undefined
    },
    {
      id: 'profile_filter',
      name: '🔍 Tìm Kiếm & Bộ Lọc Profiles',
      category: 'Cốt Lõi',
      icon: Search,
      iconColor: 'text-cyan-400',
      summary: 'Tìm kiếm nhanh và chọn lọc từng Profile cụ thể cần sao lưu thay vì luôn backup toàn bộ.',
      whatItDoes: 'Cung cấp thanh tìm kiếm thông minh theo tên, thư mục, email; các chip lọc (Tất cả, Đã chọn, Có email Google, Chỉ cục bộ, Đang chạy ngầm); cùng các nút chọn hàng loạt để tối ưu dung lượng sao lưu.',
      howToUse: [
        'Nhập từ khóa vào ô tìm kiếm trên thanh "Bộ Lọc & Chọn Profiles Cần Sao Lưu".',
        'Bấm các chip lọc như "Có Email Google" hoặc "Đang Chạy Ngầm" để thu gọn danh sách.',
        'Tích/bỏ tích các ô checkbox trên từng thẻ Profile hoặc bấm "Chọn tất cả" / "Bỏ chọn".',
        'Nút [1-CLICK AUTO BACKUP] sẽ tự động cập nhật số Profile được chọn và nén chính xác các Profile đó.'
      ],
      safetyNote: 'Bạn phải chọn ít nhất 1 Profile để sao lưu. Nếu bỏ chọn hết, nút backup sẽ thông báo cảnh báo an toàn.',
      actionButton: onNavigateToTab ? {
        label: 'Xem Bộ Lọc Profiles',
        action: () => {
          onNavigateToTab('backup');
          onClose();
        }
      } : undefined
    },
    {
      id: 'one_click_backup',
      name: '⚡ 1-Click Auto Backup',
      category: 'Cốt Lõi',
      icon: Zap,
      iconColor: 'text-emerald-400',
      summary: 'Sao lưu trọn vẹn 100% tất cả Profiles, Cookies DPAPI, Passwords và Tabs.',
      whatItDoes: 'Đóng Chrome an toàn, quét mọi hồ sơ người dùng (Default, Profile 1, Profile 2,...), bảo toàn khóa giải mã DPAPI Master Key và đóng gói thành file ZIP bảo mật.',
      howToUse: [
        'Nhấn vào nút màu xanh lá to "⚡ 1-CLICK AUTO BACKUP".',
        'Quan sát thanh tiến trình % chạy từ 0% đến 100%.',
        'Chờ đến khi xuất hiện thông báo sao lưu hoàn tất.'
      ],
      safetyNote: 'TUYỆT ĐỐI KHÔNG TẮT APP hoặc rút ổ đĩa khi thanh % đang chạy để tránh làm hỏng tệp ZIP.',
      actionButton: onNavigateToTab ? {
        label: 'Mở Trang Sao Lưu',
        action: () => {
          onNavigateToTab('backup');
          onClose();
        }
      } : undefined
    },
    {
      id: 'one_click_restore',
      name: '🔄 1-Click Auto Restore',
      category: 'Cốt Lõi',
      icon: RotateCcw,
      iconColor: 'text-blue-400',
      summary: 'Khôi phục bản sao lưu mới nhất, sửa lỗi Normal Exit và mở lại Chrome.',
      whatItDoes: 'Giải nén dữ liệu hồ sơ vào thư mục Chrome User Data, vá cờ Normal Exit để chống văng về tài khoản Guest, và tự động mở lại Chrome.',
      howToUse: [
        'Chọn bản sao lưu mong muốn trong danh sách bên dưới (hoặc dùng bản mới nhất mặc định).',
        'Nhấn nút màu xanh dương "🔄 1-CLICK AUTO RESTORE".',
        'Xác nhận trong hộp thoại cảnh báo ghi đè.',
        'Hệ thống sẽ hoàn tất và tự khởi chạy lại Google Chrome.'
      ],
      safetyNote: 'Khôi phục sẽ thay thế dữ liệu phiên hiện tại bằng dữ liệu của bản sao lưu đã chọn.',
      actionButton: onNavigateToTab ? {
        label: 'Mở Trang Khôi Phục',
        action: () => {
          onNavigateToTab('backup');
          onClose();
        }
      } : undefined
    },
    {
      id: 'scheduler',
      name: '⏰ Lập Lịch Sao Lưu Tự Động (Auto Scheduler)',
      category: 'Tự Động & Lập Lịch',
      icon: Clock,
      iconColor: 'text-emerald-400',
      summary: 'Lên lịch sao lưu định kỳ hàng ngày, hàng tuần hoặc khi khởi động máy.',
      whatItDoes: 'Tự động kích hoạt quy trình sao lưu theo chu kỳ bạn cấu hình, giúp bảo vệ dữ liệu thường xuyên mà không phụ thuộc vào trí nhớ.',
      howToUse: [
        'Nhấn công tắc "BẬT LỊCH" trên thẻ Lập Lịch Sao Lưu Tự Động.',
        'Nhấn "Tùy Chỉnh Lịch" để chọn giờ (ví dụ 20:00) và tần suất (hàng ngày / hàng tuần).',
        'Tải file .BAT để đăng ký vào Windows Task Scheduler chạy ngầm thực tế.'
      ],
      safetyNote: 'Có thể bật tùy chọn nhắc trước 5 phút để chuẩn bị đóng tab trước khi tác vụ ngầm chạy.',
      actionButton: onOpenScheduler ? {
        label: 'Mở Cài Đặt Lập Lịch',
        action: () => {
          onOpenScheduler();
          onClose();
        }
      } : undefined
    },
    {
      id: 'smart_alerts',
      name: 'Hệ Thống Cảnh Báo An Toàn & Khóa File SQLite',
      category: 'Cốt Lõi',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      summary: 'Bảo vệ dữ liệu chống khóa file SQLite và cảnh báo trực tiếp khi đang chạy.',
      whatItDoes: 'Ngăn ngừa các lỗi phổ biến khi sao lưu Chrome: xung đột khóa tệp khi trình duyệt đang mở, lỗi văng Guest khi khôi phục, và lỗi hỏng file do tắt app đột ngột.',
      howToUse: [
        'Luôn tuân theo cảnh báo: không đóng app khi thanh tiến trình đang chạy.',
        'Để công cụ tự động tắt chrome.exe an toàn trước khi nén để dữ liệu cookie đầy đủ 100%.'
      ],
      safetyNote: 'Nếu Chrome đang mở khi sao lưu thủ công, file Cookies SQLite sẽ bị rỗng do Windows khóa độc quyền.'
    },
    {
      id: 'progress_bar',
      name: 'Thanh Tiến Trình % (0% - 100%)',
      category: 'Cốt Lõi',
      icon: Layers,
      iconColor: 'text-emerald-400',
      summary: 'Trực quan hóa 5 bước sao lưu / khôi phục theo thời gian thực.',
      whatItDoes: 'Hiển thị chính xác từng bước I/O: Quét Chrome ngầm -> Tắt an toàn -> Khởi tạo ZIP & DPAPI -> Nén hồ sơ -> Hoàn tất 100%.',
      howToUse: [
        'Theo dõi tiến độ qua thanh phần trăm màu xanh.',
        'Đọc mô tả chi tiết ở dòng trạng thái để biết hệ thống đang xử lý profile nào.'
      ]
    },
    {
      id: 'download_center',
      name: 'Tải Bản .EXE & Scripts Đa Nền Tảng',
      category: 'Đa Nền Tảng',
      icon: Download,
      iconColor: 'text-blue-400',
      summary: 'Gói cài đặt độc lập chạy trực tiếp trên Windows, macOS và Linux.',
      whatItDoes: 'Cung cấp mã nguồn Python, file BAT PowerShell cho Windows, shell script cho macOS/Linux và hướng dẫn build thành file .EXE độc lập.',
      howToUse: [
        'Chuyển sang ngăn "Tải Bản .EXE" trên thanh Header.',
        'Chọn hệ điều hành tương ứng (Windows / macOS / Linux).',
        'Tải file thực thi hoặc sao chép mã lệnh chạy ngay.'
      ],
      actionButton: onNavigateToTab ? {
        label: 'Mở Trang Tải Bản .EXE',
        action: () => {
          onNavigateToTab('download');
          onClose();
        }
      } : undefined
    },
    {
      id: 'extension_center',
      name: 'Tiện Ích Mở Rộng Chrome Extension',
      category: 'Đa Nền Tảng',
      icon: Puzzle,
      iconColor: 'text-cyan-400',
      summary: 'Bản tiện ích mở rộng chạy trực tiếp trên thanh công cụ của Google Chrome.',
      whatItDoes: 'Cho phép sao lưu và phục hồi nhanh các profile ngay trong giao diện Chrome mà không cần mở phần mềm ngoài.',
      howToUse: [
        'Chuyển sang ngăn "Tải Bản Extension".',
        'Tải tệp ZIP extension.',
        'Mở chrome://extensions, bật Developer Mode và giải nén để sử dụng.'
      ],
      actionButton: onNavigateToTab ? {
        label: 'Mở Trang Extension',
        action: () => {
          onNavigateToTab('extension');
          onClose();
        }
      } : undefined
    },
    {
      id: 'theme_studio',
      name: 'Bộ Chuyển Đổi Giao Diện & Theme Studio',
      category: 'Giao Diện',
      icon: Palette,
      iconColor: 'text-purple-400',
      summary: 'Chuyển nhanh Sáng / Tối và tùy biến 10+ giao diện cao cấp.',
      whatItDoes: 'Cho phép chọn nhanh giữa Light/Dark mode hoặc tùy chỉnh màu sắc nhấn, độ cong góc, viền và hiệu ứng ánh sáng.',
      howToUse: [
        'Nhấn nút Sáng / Tối trên thanh Header để chuyển nhanh.',
        'Nhấn nút bảng màu "Theme Studio" để mở bảng tùy biến chuyên sâu.'
      ],
      actionButton: onOpenThemeStudio ? {
        label: 'Mở Theme Studio',
        action: () => {
          onOpenThemeStudio();
          onClose();
        }
      } : undefined
    },
    {
      id: 'uninstall_clean',
      name: 'Gỡ Cài Đặt (Uninstall) 100% Sạch Sẽ',
      category: 'Cốt Lõi',
      icon: Trash2,
      iconColor: 'text-red-400',
      summary: 'Dọn dẹp sạch sẽ cấu hình tạm mà vẫn bảo toàn tuyệt đối các file .zip sao lưu.',
      whatItDoes: 'Thiết kế chuẩn Portable: khi cần xóa ứng dụng, chỉ dọn dẹp config.json và thư mục tạm, tuyệt đối không xóa các file sao lưu của bạn.',
      howToUse: [
        'Nhấn nút "Gỡ cài đặt (Uninstall)" màu đỏ ở cuối trang Bản App.',
        'Hoặc chạy tệp UNINSTALL.bat trong thư mục cài đặt.'
      ],
      safetyNote: 'Mọi tệp .zip sao lưu trong thư mục của bạn VẪN NGUYÊN VẸN 100%.'
    }
  ];

  // Lọc theo search và category
  const filteredComponents = allComponents.filter(item => {
    const matchesCat = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whatItDoes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const currentStep = walkthroughSteps[currentStepIndex];

  return (
    <div 
      id="app-tutorial-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 text-left"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="app-tutorial-modal-card"
        className="w-full max-w-3xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Hướng Dẫn Nhanh & Tổng Quan Ứng Dụng
                </h2>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 uppercase">
                  Dành Cho Người Mới
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Giải thích chi tiết tất cả các thành phần, tính năng và lưu ý kỹ thuật để bạn làm chủ ứng dụng
              </p>
            </div>
          </div>

          <button 
            id="btn-close-app-tutorial"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            title="Đóng hướng dẫn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chuyển đổi giữa 2 chế độ: Walkthrough Từng Bước vs Tra Cứu Tất Cả Thành Phần */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-slate-950/50 border-b border-slate-800 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              id="btn-tab-walkthrough"
              onClick={() => setViewMode('walkthrough')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'walkthrough'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tour Từng Bước ({currentStepIndex + 1}/{walkthroughSteps.length})</span>
            </button>

            <button
              id="btn-tab-directory"
              onClick={() => setViewMode('directory')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'directory'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tra Cứu Mọi Thành Phần ({allComponents.length})</span>
            </button>
          </div>

          {viewMode === 'walkthrough' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Bước {currentStepIndex + 1} của {walkthroughSteps.length}</span>
              <div className="flex gap-1 ml-1">
                {walkthroughSteps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentStepIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      i === currentStepIndex ? 'bg-cyan-400 scale-125' : 'bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Chuyển tới bước ${i + 1}`}
                    aria-label={`Chuyển tới bước ${i + 1}`}
                  ></button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Thân Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {viewMode === 'walkthrough' ? (
            /* ==========================================================
               CHẾ ĐỘ 1: TOUR TỪNG BƯỚC (WALKTHROUGH INTERACTIVE)
               ========================================================== */
            <div className="space-y-5">
              {/* Header của Bước */}
              <div className="flex items-start justify-between gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${currentStep.iconColor}`}>
                    <currentStep.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {currentStep.badge}
                      </span>
                      <span className="text-xs text-slate-400">Bước {currentStep.step} / {walkthroughSteps.length}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                      {currentStep.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Mô tả bước */}
              <p className="text-slate-300 leading-relaxed text-sm bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                {currentStep.description}
              </p>

              {/* Các điểm nổi bật */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                  Nội Dung Trọng Tâm:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentStep.highlights.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mẹo kỹ thuật hữu ích */}
              {currentStep.tip && (
                <div className="bg-cyan-950/30 border border-cyan-800/40 p-3.5 rounded-xl text-xs text-cyan-200/90 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cyan-300">Mẹo hữu ích: </strong>
                    {currentStep.tip}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ==========================================================
               CHẾ ĐỘ 2: TRA CỨU TẤT CẢ THÀNH PHẦN (DIRECTORY BREAKDOWN)
               ========================================================== */
            <div className="space-y-4">
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm thành phần (VD: sao lưu, khôi phục, scheduler, cookie, exe...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
                  {['Tất cả', 'Cốt Lõi', 'Tự Động & Lập Lịch', 'Đa Nền Tảng', 'Giao Diện'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all font-semibold cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh sách thẻ các thành phần */}
              <div className="space-y-3">
                {filteredComponents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Không tìm thấy thành phần nào khớp với từ khóa "{searchQuery}".
                  </div>
                ) : (
                  filteredComponents.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <div 
                        key={item.id}
                        className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/90 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                              <ItemIcon className={`w-4 h-4 ${item.iconColor}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">
                                  {item.name}
                                </h4>
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {item.summary}
                              </p>
                            </div>
                          </div>

                          {/* Quick Action Button if available */}
                          {item.actionButton && (
                            <button
                              onClick={item.actionButton.action}
                              className="px-2.5 py-1 text-[11px] font-bold bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded-lg flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                            >
                              <span>{item.actionButton.label}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* What it does */}
                        <div className="text-xs text-slate-300 mt-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                          <strong className="text-slate-200">Vai trò: </strong>
                          {item.whatItDoes}
                        </div>

                        {/* How to use bullets */}
                        <div className="mt-2.5 space-y-1 text-xs text-slate-400">
                          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider block">
                            Cách sử dụng:
                          </span>
                          {item.howToUse.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-1.5 pl-1">
                              <span className="text-cyan-400 font-bold">•</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>

                        {/* Safety note if any */}
                        {item.safetyNote && (
                          <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-900/30 p-2 rounded-lg flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Lưu ý: </strong>{item.safetyNote}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal với nút điều hướng */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          {viewMode === 'walkthrough' ? (
            <>
              <button
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentStepIndex === 0
                    ? 'opacity-40 cursor-not-allowed text-slate-600 bg-slate-950'
                    : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Bước Trước</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Bỏ qua
                </button>

                {currentStepIndex < walkthroughSteps.length - 1 ? (
                  <button
                    id="btn-walkthrough-next"
                    onClick={() => setCurrentStepIndex(prev => Math.min(walkthroughSteps.length - 1, prev + 1))}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-950 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Tiếp tục</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="btn-walkthrough-finish"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Đã Hiểu & Bắt Đầu</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Nhấn nút "Xem chi tiết" để chuyển trực tiếp đến thành phần tương ứng</span>
              </span>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-950 cursor-pointer"
              >
                Đóng Hướng Dẫn
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
