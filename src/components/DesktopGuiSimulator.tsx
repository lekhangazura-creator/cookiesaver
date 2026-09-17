import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, Play, RefreshCw, CheckCircle2, AlertTriangle, Info,
  Terminal, ShieldCheck, Download, Layers, HardDrive, Check,
  Laptop, RotateCcw, Zap, Trash2, Users, ExternalLink, Sparkles,
  Lock, KeyRound, Bookmark, History, Puzzle, Globe, Compass,
  Palette, Languages, Maximize2, Search, ArrowUpCircle, X, Copy
} from 'lucide-react';
import { LogMessage, ChromeProfileInfo, BackupRecord } from '../types';

interface Props {
  onDownloadScript: () => void;
  onDownloadZip: () => void;
}

export const DesktopGuiSimulator: React.FC<Props> = ({ onDownloadScript, onDownloadZip }) => {
  const [backupPath, setBackupPath] = useState('C:\\Users\\Administrator\\Documents\\Chrome_Backups');
  const [backupPathVerified, setBackupPathVerified] = useState(true);
  const [backupMode, setBackupMode] = useState<'smart' | 'full'>('smart');
  const [isRunning, setIsRunning] = useState(false);
  const [operationType, setOperationType] = useState<'idle' | 'backup' | 'restore'>('idle');
  const [chromeLaunched, setChromeLaunched] = useState(false);
  const [manualNote, setManualNote] = useState('');
  const [showManualFeedModal, setShowManualFeedModal] = useState(false);

  // Giao diện Theme Studio, Ngôn ngữ, Hình dạng & Auto Update đồng bộ với Desktop App
  const [simTheme, setSimTheme] = useState<'dark-slate' | 'cyberpunk-neon' | 'midnight-ocean' | 'emerald-forest' | 'dracula-purple' | 'light-titanium'>('dark-slate');
  const [simLang, setSimLang] = useState<'vi' | 'en'>('vi');
  const [simShape, setSimShape] = useState<'standard' | 'wide' | 'compact'>('standard');
  const [searchProfileQuery, setSearchProfileQuery] = useState('');
  const [selectedProfileFolders, setSelectedProfileFolders] = useState<string[]>(['default', 'profile1', 'profile2']);
  const [copiedPath, setCopiedPath] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [hasNewVersion, setHasNewVersion] = useState(false);

  // Danh sách các bản sao lưu (bao gồm cả bản tự động và bản manual đã feed)
  const [simulatedBackups, setSimulatedBackups] = useState<BackupRecord[]>([
    {
      id: 'bk_01',
      fileName: 'Chrome_AllProfiles_Backup_20260908_1000.zip',
      filePath: 'C:\\Users\\Administrator\\Documents\\Chrome_Backups\\Chrome_AllProfiles_Backup_20260908_1000.zip',
      size: '142.6 MB',
      timestamp: 'Hôm nay, 10:00:15',
      profilesIncluded: ['Default', 'Profile 1', 'Profile 2'],
      cookieCount: '1,870 cookies & tokens',
      extensionCount: 29,
      openTabsCount: 38,
      backupMode: 'smart_speed',
      createdDate: new Date(),
      isManual: false
    },
    {
      id: 'bk_02_manual',
      fileName: 'Chrome_MANUAL_GoldenState_BeforeUpdate.zip',
      filePath: 'C:\\Users\\Administrator\\Documents\\Chrome_Backups\\Chrome_MANUAL_GoldenState_BeforeUpdate.zip',
      size: '158.2 MB',
      timestamp: 'Hôm qua, 18:45:00',
      profilesIncluded: ['Default', 'Profile 1', 'Profile 2'],
      cookieCount: '1,850 cookies & tokens',
      extensionCount: 29,
      openTabsCount: 34,
      backupMode: 'full_100',
      createdDate: new Date(Date.now() - 86400000),
      isManual: true,
      manualTag: 'Bản vàng lưu thủ công trước khi test extension mới'
    }
  ]);

  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<string>(
    'Chrome_AllProfiles_Backup_20260908_1000.zip'
  );
  const detectedProfiles: ChromeProfileInfo[] = [
    {
      id: 'default',
      folderName: 'Default',
      displayName: 'Profile Mặc Định (Chính)',
      email: 'alex.nguyen@gmail.com',
      avatarColor: 'bg-emerald-500',
      cookiesEstimated: '840 cookies & sessions',
      extensionsCount: 14,
      isOpen: true
    },
    {
      id: 'profile1',
      folderName: 'Profile 1',
      displayName: 'Công Việc & Doanh Nghiệp',
      email: 'work@company.io',
      avatarColor: 'bg-blue-500',
      cookiesEstimated: '620 cookies & tokens',
      extensionsCount: 9,
      isOpen: true
    },
    {
      id: 'profile2',
      folderName: 'Profile 2',
      displayName: 'Tài Khoản Tài Chính & Crypto',
      email: 'investor.vault@gmail.com',
      avatarColor: 'bg-amber-500',
      cookiesEstimated: '410 cookies & sessions',
      extensionsCount: 6,
      isOpen: false
    }
  ];

  const [logs, setLogs] = useState<LogMessage[]>([
    {
      id: '1',
      timestamp: '10:00:01',
      type: 'info',
      text: 'Khởi động Chrome 100% Full Backup Engine (Chế độ lưu trọn vẹn cả thư mục Chrome).'
    },
    {
      id: '2',
      timestamp: '10:00:02',
      type: 'info',
      text: 'Thư mục gốc: C:\\Users\\Lekha\\AppData\\Local\\Google\\Chrome (Lưu trực tiếp tất cả file, không chia nhỏ Profile hay Cookie)'
    },
    {
      id: '3',
      timestamp: '10:00:02',
      type: 'success',
      text: 'Đã nhận diện toàn bộ User Data, Local State, 3 Profiles ("Default", "Profile 1", "Profile 2"), Cookies SQLite & Extensions.'
    },
    {
      id: '4',
      timestamp: '10:00:03',
      type: 'step',
      text: 'Sẵn sàng! Nhấn [1-CLICK AUTO BACKUP] để nén toàn bộ cả thư mục Chrome hoặc [1-CLICK AUTO RESTORE] để tự động phục hồi.'
    }
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Danh sách các thư mục an toàn có thể chọn qua hộp thoại
  const availableDirectories = [
    'C:\\Users\\Administrator\\Documents\\Chrome_Backups',
    'D:\\Backups\\Chrome_Vault_100',
    'E:\\USB_Storage\\Chrome_Safe_Data',
  ];

  // Hàm chọn thư mục an toàn qua hộp thoại (chống gõ sai đường dẫn)
  const handleSelectFolderFromDialog = (folder: string) => {
    setBackupPath(folder);
    setBackupPathVerified(true);
    appendLog('info', `[Thư Viện Tệp] Đã chọn thư mục lưu trữ qua hộp thoại: ${folder} (Đã xác thực hợp lệ)`);
  };

  // Hàm Feed tệp sao lưu / file save thủ công từ máy tính
  const handleFeedManualFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const isZip = fileName.toLowerCase().endsWith('.zip');

    appendLog('step', '----------------------------------------------------------------');
    appendLog('info', `[Feed Thủ Công] Đang đọc tệp được nạp vào: ${fileName} (${fileSizeMB})`);
    
    // Tạo bản ghi thủ công
    const manualRecord: BackupRecord = {
      id: 'manual_' + Date.now(),
      fileName: fileName,
      filePath: `${backupPath}\\${fileName}`,
      size: fileSizeMB,
      timestamp: 'Vừa nạp thủ công',
      profilesIncluded: ['Default', 'Profile 1', 'Profile 2'],
      cookieCount: isZip ? 'Đầy đủ tất cả Cookies & Sessions' : 'File dữ liệu tùy chỉnh',
      extensionCount: 29,
      openTabsCount: 38,
      backupMode: 'full_100',
      createdDate: new Date(),
      isManual: true,
      manualTag: 'Tệp nạp thủ công (Manual Feed)'
    };

    setSimulatedBackups(prev => [manualRecord, ...prev]);
    setSelectedBackupForRestore(fileName);

    appendLog('success', `[✓] Đã kiểm tra tính toàn vẹn của tệp: Tệp hợp lệ, không bị lỗi!`);
    appendLog('success', `[✓] Đã ghim tệp "${fileName}" làm bản khôi phục ưu tiên số 1.`);
    appendLog('step', 'Giờ đây bạn chỉ cần bấm "1-CLICK AUTO RESTORE", hệ thống sẽ tự động giải nén tệp này!');
    appendLog('step', '----------------------------------------------------------------');
    setShowManualFeedModal(false);
  };

  // Hàm Lưu bản hiện tại thành Bản Thủ Công (Manual Snapshot) với ghi chú
  const handleSaveManualSnapshot = (customName?: string) => {
    const nowStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
    const tag = customName?.trim() || 'Bản Snapshot Thủ Công Được Lưu';
    const snapshotName = `Chrome_MANUAL_${nowStr}.zip`;

    const snapshotRecord: BackupRecord = {
      id: 'snapshot_' + Date.now(),
      fileName: snapshotName,
      filePath: `${backupPath}\\${snapshotName}`,
      size: '175.4 MB',
      timestamp: 'Vừa lưu thủ công',
      profilesIncluded: ['Default', 'Profile 1', 'Profile 2'],
      cookieCount: '1,870 cookies & sessions',
      extensionCount: 29,
      openTabsCount: 38,
      backupMode: 'full_100',
      createdDate: new Date(),
      isManual: true,
      manualTag: tag
    };

    setSimulatedBackups(prev => [snapshotRecord, ...prev]);
    setSelectedBackupForRestore(snapshotName);
    appendLog('success', `[Manual Snapshot] Đã lưu bản thủ công "${snapshotName}" kèm ghi chú: "${tag}". Lần sau có thể chọn lại bất cứ lúc nào!`);
    setManualNote('');
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const appendLog = (type: LogMessage['type'], text: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp: timeStr,
        type,
        text
      }
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // 1-Click Tự Động Sao Lưu Toàn Bộ
  const runBackupSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setOperationType('backup');
    setChromeLaunched(false);

    appendLog('step', '================================================================');
    appendLog('step', 'BẮT ĐẦU TIẾN TRÌNH SAO LƯU 100% TOÀN BỘ CHROME PROFILES');
    appendLog('step', '================================================================');

    setTimeout(() => {
      appendLog('info', '[1/4] Đang quét các tiến trình Chrome trên Windows...');
      setTimeout(() => {
        appendLog('warning', '[!] Phát hiện 18 tiến trình Chrome đang mở. Tự động đóng an toàn (taskkill /F /IM chrome.exe)...');
        setTimeout(() => {
          appendLog('success', '[✓] Đã giải phóng hoàn toàn khóa tệp SQLite (Zero locked files).');

          setTimeout(() => {
            const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
            const zipName = `Chrome_Backup_${timestamp}.zip`;
            appendLog('info', `[2/4] Tạo tệp sao lưu nén tại: ${backupPath}\\${zipName}`);
            
            if (backupMode === 'smart') {
              appendLog('info', '[*] Chế độ Thông Minh: Giữ trọn 100% Profiles, Cookies, Passwords, Extensions, Tabs - Chỉ loại bỏ Cache media render rác (Tiết kiệm ~15GB).');
            } else {
              appendLog('info', '[*] Chế độ Full Clone 100%: Sao chép từng byte bao gồm cả toàn bộ thư mục vật lý.');
            }

            setTimeout(() => {
              appendLog('info', '[3/4] Đang đóng gói Master Key DPAPI (Local State & os_crypt)...');
              setTimeout(() => {
                appendLog('info', '[3/4] Đang lưu TẤT CẢ Profiles:');
                appendLog('info', '   -> Profile "Default" (alex.nguyen@gmail.com): 840 cookies, 14 extensions, 18 tabs...');
                appendLog('info', '   -> Profile "Profile 1" (work@company.io): 620 cookies, 9 extensions, 12 tabs...');
                appendLog('info', '   -> Profile "Profile 2" (investor.vault@gmail.com): 410 cookies, 6 extensions, 8 tabs...');
                
                setTimeout(() => {
                  appendLog('info', '[3/4] Đang lưu trữ Sessions & Tabs đang mở (Current Session, Current Tabs, Last Tabs)...');
                  appendLog('info', '[3/4] Đang lưu trữ IndexedDB, Local Storage, Bookmarks, History, Preferences...');

                  setTimeout(() => {
                    const newRecord: BackupRecord = {
                      id: Date.now().toString(),
                      fileName: zipName,
                      filePath: `${backupPath}\\${zipName}`,
                      size: backupMode === 'smart' ? '184.5 MB' : '16.2 GB',
                      timestamp: 'Vừa xong',
                      profilesIncluded: ['Default', 'Profile 1', 'Profile 2'],
                      cookieCount: '1,870 cookies & sessions',
                      extensionCount: 29,
                      openTabsCount: 38,
                      backupMode: backupMode === 'smart' ? 'smart_speed' : 'full_100',
                      createdDate: new Date()
                    };

                    setSimulatedBackups(prev => [newRecord, ...prev]);
                    setSelectedBackupForRestore(zipName);

                    appendLog('success', '[4/4] Nén và bảo vệ dữ liệu thành công mỹ mãn!');
                    appendLog('success', `[✓] Đã lưu trọn vẹn 3,620 tệp của TẤT CẢ PROFILES không thiếu 1 byte dữ liệu quan trọng.`);
                    appendLog('success', `[✓] Tệp lưu trữ: ${newRecord.fileName} (${newRecord.size})`);
                    appendLog('step', '================================================================');
                    appendLog('success', 'SAO LƯU HOÀN TẤT! Dữ liệu đã an toàn tuyệt đối chống mọi lỗi reset của Chrome.');
                    appendLog('step', '================================================================');

                    setIsRunning(false);
                    setOperationType('idle');
                  }, 900);
                }, 800);
              }, 700);
            }, 600);
          }, 600);
        }, 800);
      }, 700);
    }, 400);
  };

  // 1-Click Tự Động Khôi Phục Hoàn Toàn & Mở Lại Chrome
  const runAutoRestoreSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setOperationType('restore');
    setChromeLaunched(false);

    appendLog('step', '================================================================');
    appendLog('step', '⚡ 1-CLICK AUTO RESTORE: BẮT ĐẦU TỰ ĐỘNG KHÔI PHỤC TOÀN BỘ 100%');
    appendLog('step', '================================================================');
    appendLog('info', `[Tự Động 1/4] Đang sử dụng bản sao lưu mới nhất: ${selectedBackupForRestore}`);

    setTimeout(() => {
      appendLog('warning', '[Tự Động 2/4] Đang cưỡng chế tắt toàn bộ chrome.exe trên máy để tránh khóa file...');
      setTimeout(() => {
        appendLog('success', '[✓] Đã tắt sạch chrome.exe. User Data đã sẵn sàng nhận dữ liệu phục hồi.');
        setTimeout(() => {
          appendLog('info', '[Tự Động 3/4] Đang giải nén & ghi đè toàn bộ cấu trúc Chrome User Data:');
          appendLog('info', '   -> Đã khôi phục Local State (Đồng bộ Master Key DPAPI của Windows để giải mã mật khẩu & cookies)');
          appendLog('info', '   -> Đã khôi phục Profile "Default": Toàn bộ tài khoản Google, Cookies, Extensions & 18 Tabs');
          appendLog('info', '   -> Đã khôi phục Profile "Profile 1": Toàn bộ tài khoản Công việc, Slack, Jira, GitHub...');
          appendLog('info', '   -> Đã khôi phục Profile "Profile 2": Toàn bộ ví Crypto, Binance, TradingView...');
          appendLog('info', '   -> Đã khôi phục Sessions, Bookmarks, History, Local Storage...');

          setTimeout(() => {
            appendLog('success', '[✓] Hoàn tất ghi đè 100% dữ liệu gốc không thiếu bất kỳ thứ gì!');
            appendLog('info', '[Tự Động 4/4] 🚀 Đang tự động mở lại Google Chrome với tất cả Profiles và khôi phục các Tab đang mở (--restore-last-session)...');
            
            setTimeout(() => {
              setChromeLaunched(true);
              appendLog('success', '================================================================');
              appendLog('success', '🎉 1-CLICK RESTORE HOÀN TẤT! GOOGLE CHROME ĐÃ ĐƯỢC TỰ ĐỘNG MỞ LẠI.');
              appendLog('success', 'TẤT CẢ PROFILES, COOKIES VÀ CÁC TÀI KHOẢN ĐÃ TRỞ LẠI BÌNH THƯỜNG MÀ KHÔNG CẦN ĐĂNG NHẬP LẠI!');
              appendLog('success', '================================================================');

              setIsRunning(false);
              setOperationType('idle');
            }, 1000);
          }, 1000);
        }, 800);
      }, 700);
    }, 500);
  };

  const THEME_CONFIGS: Record<string, {
    window: string;
    header: string;
    card: string;
    accentBtn: string;
    accentText: string;
    border: string;
    input: string;
    badge: string;
  }> = {
    'dark-slate': {
      window: 'bg-slate-900 border-slate-700 text-slate-100',
      header: 'bg-slate-950 border-slate-800 text-slate-200',
      card: 'bg-slate-950/60 border-slate-800',
      accentBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400',
      accentText: 'text-emerald-400',
      border: 'border-slate-800',
      input: 'bg-slate-950 border-slate-700/80 text-slate-200',
      badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
    },
    'cyberpunk-neon': {
      window: 'bg-[#0b061d] border-purple-800/90 text-purple-100',
      header: 'bg-[#060312] border-purple-900/80 text-purple-200',
      card: 'bg-[#150a33]/80 border-purple-800/60',
      accentBtn: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-cyan-300',
      accentText: 'text-cyan-400',
      border: 'border-purple-800/80',
      input: 'bg-[#080318] border-purple-800 text-cyan-200',
      badge: 'bg-purple-950/90 text-cyan-300 border-cyan-600/60'
    },
    'midnight-ocean': {
      window: 'bg-[#05112e] border-blue-800 text-blue-100',
      header: 'bg-[#02091c] border-blue-900 text-blue-200',
      card: 'bg-[#091b44]/80 border-blue-800/70',
      accentBtn: 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold border-sky-300',
      accentText: 'text-sky-400',
      border: 'border-blue-800/70',
      input: 'bg-[#020b1f] border-blue-800 text-sky-200',
      badge: 'bg-blue-950/90 text-sky-300 border-sky-600/60'
    },
    'emerald-forest': {
      window: 'bg-[#031c12] border-emerald-800 text-emerald-100',
      header: 'bg-[#010e09] border-emerald-900 text-emerald-200',
      card: 'bg-[#062c1c]/80 border-emerald-800/70',
      accentBtn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-emerald-300',
      accentText: 'text-emerald-400',
      border: 'border-emerald-800/70',
      input: 'bg-[#02130d] border-emerald-800 text-emerald-200',
      badge: 'bg-emerald-950/90 text-emerald-300 border-emerald-600/60'
    },
    'dracula-purple': {
      window: 'bg-[#150f2e] border-purple-800 text-purple-100',
      header: 'bg-[#0c081e] border-purple-900 text-purple-200',
      card: 'bg-[#211745]/80 border-purple-800/70',
      accentBtn: 'bg-purple-500 hover:bg-purple-400 text-white font-bold border-purple-300',
      accentText: 'text-purple-400',
      border: 'border-purple-800/70',
      input: 'bg-[#0f0923] border-purple-800 text-purple-200',
      badge: 'bg-purple-950/90 text-purple-300 border-purple-600/60'
    },
    'light-titanium': {
      window: 'bg-slate-100 border-slate-300 text-slate-900 shadow-xl',
      header: 'bg-white border-slate-200 text-slate-800',
      card: 'bg-white border-slate-200 shadow-sm',
      accentBtn: 'bg-sky-600 hover:bg-sky-500 text-white font-bold border-sky-400',
      accentText: 'text-sky-600',
      border: 'border-slate-200',
      input: 'bg-slate-50 border-slate-300 text-slate-900',
      badge: 'bg-sky-50 text-sky-700 border-sky-300'
    }
  };

  const curThemeStyle = THEME_CONFIGS[simTheme] || THEME_CONFIGS['dark-slate'];

  const shapeClass = simShape === 'wide' ? 'max-w-6xl' : simShape === 'compact' ? 'max-w-3xl' : 'max-w-4xl';

  const triggerCheckUpdate = () => {
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setHasNewVersion(true);
      setShowUpdateModal(true);
    }, 800);
  };

  const copyPath = () => {
    navigator.clipboard.writeText(backupPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const filteredProfiles = detectedProfiles.filter(p => {
    if (!searchProfileQuery) return true;
    const q = searchProfileQuery.toLowerCase();
    return p.displayName.toLowerCase().includes(q) || p.folderName.toLowerCase().includes(q) || (p.email && p.email.toLowerCase().includes(q));
  });

  return (
    <div className={`w-full mx-auto flex flex-col gap-6 transition-all duration-300 ${shapeClass}`}>
      {/* Container giả lập cửa sổ Desktop GUI */}
      <div 
        id="desktop-gui-window"
        className={`border rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-300 ${curThemeStyle.window}`}
      >
        {/* Title Bar phong cách Windows 11 / Modern Desktop */}
        <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 select-none ${curThemeStyle.header}`}>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-slate-950" />
            </div>
            <span className="text-xs font-bold tracking-wide font-mono">
              {simLang === 'vi' ? 'Chrome 100% Full Backup & Auto Scheduler (v6.2)' : 'Chrome 100% Full Backup & Auto Scheduler (v6.2)'}
            </span>
          </div>

          {/* Quick Header Controls: Theme Studio + Language + Shape + Update */}
          <div className="flex items-center gap-2 text-xs">
            {/* Theme Selector */}
            <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded border border-white/10">
              <Palette className="w-3 h-3 text-cyan-400" />
              <select
                value={simTheme}
                onChange={(e) => setSimTheme(e.target.value as any)}
                className="bg-transparent text-[11px] font-semibold focus:outline-none cursor-pointer"
                title="Thay đổi màu sắc (Theme Studio)"
              >
                <option value="dark-slate" className="bg-slate-900 text-white">Dark Slate</option>
                <option value="cyberpunk-neon" className="bg-[#0f0926] text-white">Cyberpunk</option>
                <option value="midnight-ocean" className="bg-[#071635] text-white">Midnight Ocean</option>
                <option value="emerald-forest" className="bg-[#052317] text-white">Emerald Forest</option>
                <option value="dracula-purple" className="bg-[#1a1435] text-white">Dracula Purple</option>
                <option value="light-titanium" className="bg-white text-slate-900">Light Mode</option>
              </select>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setSimLang(l => l === 'vi' ? 'en' : 'vi')}
              className="bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded border border-white/10 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              title="Đổi ngôn ngữ Tiếng Việt / English"
            >
              <Languages className="w-3 h-3 text-amber-400" />
              <span>{simLang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
            </button>

            {/* Shape Switcher */}
            <div className="hidden sm:flex items-center bg-black/20 rounded border border-white/10 p-0.5">
              <button
                onClick={() => setSimShape('standard')}
                className={`px-1.5 py-0.5 text-[10px] rounded ${simShape === 'standard' ? 'bg-white/20 font-bold' : 'opacity-60'}`}
                title="Hình dạng chuẩn"
              >
                Chuẩn
              </button>
              <button
                onClick={() => setSimShape('wide')}
                className={`px-1.5 py-0.5 text-[10px] rounded ${simShape === 'wide' ? 'bg-white/20 font-bold' : 'opacity-60'}`}
                title="Hình dạng rộng"
              >
                Rộng
              </button>
              <button
                onClick={() => setSimShape('compact')}
                className={`px-1.5 py-0.5 text-[10px] rounded ${simShape === 'compact' ? 'bg-white/20 font-bold' : 'opacity-60'}`}
                title="Hình dạng gọn"
              >
                Gọn
              </button>
            </div>

            {/* Update Checker Button */}
            <button
              onClick={triggerCheckUpdate}
              disabled={isCheckingUpdate}
              className={`px-2 py-0.5 rounded border font-mono text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                hasNewVersion 
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 animate-pulse'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60'
              }`}
              title="Kiểm tra phiên bản mới"
            >
              {isCheckingUpdate ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <ArrowUpCircle className="w-3 h-3" />
              )}
              <span>{hasNewVersion ? (simLang === 'vi' ? '🚀 Có bản mới!' : '🚀 Update Available!') : 'v6.2.0'}</span>
            </button>

            <div className="flex items-center gap-1.5 ml-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            </div>
          </div>
        </div>

        {/* Nội dung giao diện ứng dụng */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Header Giới Thiệu Tính Năng */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border ${curThemeStyle.card}`}>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${curThemeStyle.accentText}`} />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  {simLang === 'vi' ? 'Chế Độ Bảo Vệ Toàn Diện 100% (Theme Studio & Auto Scheduler)' : '100% Full Protection Mode (Theme Studio & Auto Scheduler)'}
                </h3>
              </div>
              <p className="text-xs opacity-80 mt-1">
                {simLang === 'vi' 
                  ? 'Ghi nhớ hoàn toàn tất cả: Toàn bộ Profiles, Cookies, Mật khẩu, Extensions, Dấu trang & Tabs đang mở.'
                  : 'Permanently saves all Profiles, Cookies, Master DPAPI Keys, Passwords, Extensions, Bookmarks & Open Tabs.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded border flex items-center gap-1.5 ${curThemeStyle.badge}`}>
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>{selectedProfileFolders.length}/3 Profiles</span>
              </span>
              <span className={`px-2.5 py-1 rounded border flex items-center gap-1.5 ${curThemeStyle.badge}`}>
                <Check className="w-3.5 h-3.5" />
                <span>{simLang === 'vi' ? 'Không Hở Trắng' : 'Zero White Bleed'}</span>
              </span>
            </div>
          </div>

          {/* VỊ TRÍ LƯU TRỮ HIỆN TẠI (ĐÃ SỬA: KHÔNG BỊ HỞ TRẮNG, CÓ THÔNG TIN Ổ CỨNG VÀ COPY) */}
          <div className={`p-3.5 rounded-lg border flex flex-col gap-2 ${curThemeStyle.card}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {simLang === 'vi' ? '📁 Vị Trí Thư Mục Sao Lưu (Ghi Nhớ Vĩnh Viễn)' : '📁 Backup Storage Directory (Auto Memory)'}
                </span>
                <span className={`text-[10px] px-2 py-0.2 rounded font-mono border ${curThemeStyle.badge}`}>
                  {simLang === 'vi' ? '✓ Đang Sử Dụng' : '✓ Active'}
                </span>
              </div>
              <span className="text-[11px] font-mono opacity-80">
                {simLang === 'vi' ? 'Trống: 145.2 GB trên ổ C: • 4 bản sao lưu (580.4 MB)' : 'Free: 145.2 GB on C: • 4 backups stored (580.4 MB)'}
              </span>
            </div>

            {/* Khung đường dẫn tối màu, tương phản cao, TUYỆT ĐỐI KHÔNG HỞ TRẮNG */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className={`flex-1 rounded px-3 py-2 text-xs font-mono flex items-center justify-between border ${curThemeStyle.input}`}>
                <span className="truncate select-all">{backupPath}</span>
                <button
                  onClick={copyPath}
                  className="ml-2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedPath ? (simLang === 'vi' ? 'Đã copy!' : 'Copied!') : (simLang === 'vi' ? 'Copy' : 'Copy')}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {
                    const nextDir = availableDirectories[(availableDirectories.indexOf(backupPath) + 1) % availableDirectories.length];
                    handleSelectFolderFromDialog(nextDir);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-semibold text-amber-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Chọn thư mục"
                >
                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                  <span>{simLang === 'vi' ? 'Đổi Thư Mục...' : 'Change Folder...'}</span>
                </button>

                <button 
                  onClick={() => appendLog('info', `[Explorer] Đã mở thư mục lưu trữ: ${backupPath}`)}
                  className="px-3 py-2 bg-blue-900/60 hover:bg-blue-800 border border-blue-700/60 text-blue-200 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Explorer</span>
                </button>
              </div>
            </div>
          </div>

          {/* BỘ LỌC VÀ LỰA CHỌN PROFILES (SEARCH & FILTER REAL-TIME) */}
          <div className={`p-3.5 rounded-lg border flex flex-col gap-2.5 ${curThemeStyle.card}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{simLang === 'vi' ? 'Lựa Chọn Profiles Cần Sao Lưu' : 'Select Profiles To Backup'}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProfileFolders(['default', 'profile1', 'profile2'])}
                  className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/80 cursor-pointer"
                >
                  {simLang === 'vi' ? '✓ Chọn Tất Cả' : '✓ Select All'}
                </button>
                <button
                  onClick={() => setSelectedProfileFolders([])}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 cursor-pointer"
                >
                  {simLang === 'vi' ? '✕ Bỏ Chọn' : '✕ Deselect'}
                </button>
                <button
                  onClick={() => setSelectedProfileFolders(['profile1', 'profile2'])}
                  className="text-[11px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60 hover:bg-blue-900/80 cursor-pointer"
                >
                  {simLang === 'vi' ? '📧 Chỉ Có Email' : '📧 Email Only'}
                </button>
              </div>
            </div>

            {/* Thanh Tìm Kiếm Profile */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50" />
              <input
                type="text"
                value={searchProfileQuery}
                onChange={(e) => setSearchProfileQuery(e.target.value)}
                placeholder={simLang === 'vi' ? "🔍 Tìm kiếm theo tên hoặc email profile..." : "🔍 Search profile by name or email..."}
                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded border focus:outline-none ${curThemeStyle.input}`}
              />
            </div>

            {/* Danh sách Profile đã lọc */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {filteredProfiles.map((p) => {
                const isChecked = selectedProfileFolders.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProfileFolders(prev => 
                        prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                      );
                    }}
                    className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${
                      isChecked 
                        ? 'bg-blue-950/40 border-blue-500/80 text-white' 
                        : 'bg-black/20 border-white/5 opacity-60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="text-xs font-semibold block truncate">{p.displayName}</span>
                        <span className="text-[10px] opacity-70 block truncate">{p.email || p.folderName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono shrink-0">
                      {p.folderName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HÀNG 2 NÚT HÀNH ĐỘNG ĐẶC BIỆT 1-CLICK CỦA ỨNG DỤNG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nút 1: SAO LƯU 100% TOÀN BỘ CHROME */}
            <button
              id="btn-auto-backup"
              onClick={runBackupSimulation}
              disabled={isRunning || selectedProfileFolders.length === 0}
              className={`p-4 rounded-xl border flex flex-col items-start gap-2 text-left transition-all relative overflow-hidden group ${
                isRunning && operationType === 'backup'
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-lg shadow-emerald-950/50'
                  : curThemeStyle.accentBtn
              } cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    {isRunning && operationType === 'backup' ? (
                      <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <Zap className="w-5 h-5 text-white fill-white" />
                    )}
                  </div>
                  <div>
                    <span className="text-base font-bold block leading-snug">
                      ⚡ 1-CLICK AUTO BACKUP
                    </span>
                    <span className="text-xs opacity-90 font-medium">
                      ({simLang === 'vi' ? `Sao Lưu ${selectedProfileFolders.length} Profiles Đã Chọn` : `Backup ${selectedProfileFolders.length} Selected Profiles`})
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-black/30 px-2 py-0.5 rounded border border-white/20">
                  {simLang === 'vi' ? 'Nhanh & Tự Động' : 'Auto 1-Click'}
                </span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed mt-1">
                {simLang === 'vi' 
                  ? 'Tự động tắt Chrome an toàn, sao lưu tất cả Profiles đã chọn, toàn bộ Cookies, Mật khẩu, Sessions và Extensions vào tệp zip.'
                  : 'Safely closes Chrome, packs selected profiles, DPAPI keys, cookies, sessions, and extensions into a clean zip archive.'}
              </p>
            </button>

            {/* Nút 2: KHÔI PHỤC TỰ ĐỘNG 1-CLICK */}
            <button
              id="btn-auto-restore"
              onClick={runAutoRestoreSimulation}
              disabled={isRunning || simulatedBackups.length === 0}
              className={`p-4 rounded-xl border flex flex-col items-start gap-2 text-left transition-all relative overflow-hidden group ${
                isRunning && operationType === 'restore'
                  ? 'bg-blue-950/70 border-blue-500 shadow-lg shadow-blue-950/50'
                  : 'bg-blue-600 hover:bg-blue-500 border-blue-400 shadow-md hover:shadow-blue-600/30'
              } text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    {isRunning && operationType === 'restore' ? (
                      <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <RotateCcw className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <span className="text-base font-bold block leading-snug">
                      🔄 1-CLICK AUTO RESTORE
                    </span>
                    <span className="text-xs text-blue-100 font-medium">
                      (Tự Động Khôi Phục & Mở Lại Chrome)
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-blue-900/60 px-2 py-0.5 rounded border border-blue-300/30">
                  Zero Manual
                </span>
              </div>
              <p className="text-xs text-blue-50/90 leading-relaxed mt-1">
                1 click duy nhất: Tự động tìm bản backup mới nhất, tự tắt Chrome, tự ghi đè cấu trúc và <strong>tự động mở lại Chrome</strong> với đầy đủ tabs và phiên đăng nhập!
              </p>
            </button>
          </div>

          {/* Trạng thái Chrome tự động mở sau khi Restore */}
          {chromeLaunched && (
            <div className="bg-emerald-950/90 border border-emerald-500 p-3.5 rounded-lg flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-200">
                    Google Chrome Đã Khởi Chạy Thành Công!
                  </h4>
                  <p className="text-xs text-emerald-300/80">
                    Tất cả 3 Profiles và 38 Tabs đang mở đã được phục hồi nguyên vẹn. Không cần đăng nhập lại bất kỳ tài khoản nào.
                  </p>
                </div>
              </div>
              <span className="text-xs bg-emerald-800 text-emerald-100 px-2.5 py-1 rounded font-mono">
                Running
              </span>
            </div>
          )}

          {/* Danh Sách Các Thành Phần Được Nhớ Hoàn Toàn 100% */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Dữ Liệu Chrome Được Đảm Bảo An Toàn Tuyệt Đối (Full Coverage)
              </span>
              <span className="text-[11px] text-slate-400">
                Lưu vào: %USERPROFILE%\Documents\Chrome_Backups
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">Tất Cả Profiles</span>
                  <span className="text-[10px] text-slate-400">Default, Profile 1, 2...</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">Cookies & Session</span>
                  <span className="text-[10px] text-slate-400">Không bị văng tài khoản</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">Local State & DPAPI</span>
                  <span className="text-[10px] text-slate-400">Khóa Master Key giải mã</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">Toàn Bộ Extensions</span>
                  <span className="text-[10px] text-slate-400">Bảo toàn cài đặt tiện ích</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">Tabs Đang Mở</span>
                  <span className="text-[10px] text-slate-400">Current & Last Sessions</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">Bookmarks & Dấu Trang</span>
                  <span className="text-[10px] text-slate-400">Toàn bộ thanh dấu trang</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">Lịch Sử & Tìm Kiếm</span>
                  <span className="text-[10px] text-slate-400">History, Favicons, Autofill</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded flex items-center gap-2">
                <Globe className="w-4 h-4 text-yellow-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">Web Data & Storage</span>
                  <span className="text-[10px] text-slate-400">IndexedDB, LocalStorage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cài Đặt Tùy Chọn Thư Mục (Chống Nhập Sai) & Bộ Nạp Thủ Công (Manual Feed) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Cột 1 & 2: Quản lý thư mục bằng Hộp Thoại & Nạp Tệp Thủ Công */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-amber-400" />
                    Thư Mục Lưu Trữ (Chọn Qua Hộp Thoại — Chống Gõ Sai Vị Trí):
                  </label>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã xác thực hợp lệ
                  </span>
                </div>

                {/* Khung đường dẫn Read-Only, không để người dùng gõ nhầm */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-3 py-2 text-xs font-mono text-slate-200 flex items-center justify-between shadow-inner">
                    <span className="truncate">{backupPath}</span>
                    <span className="text-[10px] text-slate-500 font-sans ml-2 shrink-0">Bảo vệ chống gõ sai</span>
                  </div>

                  {/* Nút chọn thư mục bằng hộp thoại */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => {
                        const nextDir = availableDirectories[(availableDirectories.indexOf(backupPath) + 1) % availableDirectories.length];
                        handleSelectFolderFromDialog(nextDir);
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-semibold text-amber-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Chọn thư mục bằng hộp thoại đồ họa"
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-400" />
                      <span>Đổi Thư Mục...</span>
                    </button>

                    {/* Nút Feed Tệp Thủ Công */}
                    <label className="px-3 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                      <Download className="w-3.5 h-3.5 rotate-180" />
                      <span>📥 Feed Tệp Thủ Công...</span>
                      <input 
                        type="file" 
                        accept=".zip,.json,.dat,.sav,.bak" 
                        onChange={handleFeedManualFile}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* Hàng nút lưu bản thủ công (Save Manual Snapshot) */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800/80">
                  <input
                    type="text"
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    placeholder="Ghi chú bản thủ công (VD: Bản trước khi update game, Bản login ví Crypto)..."
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                  />
                  <button
                    onClick={() => handleSaveManualSnapshot(manualNote)}
                    className="px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600/60 text-emerald-200 hover:text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu Bản Này Thành Bản Thủ Công (Manual)</span>
                  </button>
                </div>
              </div>

              {/* Chế độ sao lưu */}
              <div className="flex flex-col sm:flex-row gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="backupMode" 
                    checked={backupMode === 'smart'} 
                    onChange={() => setBackupMode('smart')}
                    className="accent-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-200 block">Sao Lưu Thông Minh (Khuyên dùng)</span>
                    <span className="text-[11px] text-slate-400">Giữ 100% Profiles, Cookies, Mật khẩu, Tabs - Bỏ qua Cache rác tạm</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="backupMode" 
                    checked={backupMode === 'full'} 
                    onChange={() => setBackupMode('full')}
                    className="accent-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-200 block">Full Clone 100% Từng Byte</span>
                    <span className="text-[11px] text-slate-400">Sao chép trọn vẹn toàn bộ tệp vật lý (Dung lượng lớn hơn)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Cột 3: Danh sách profiles phát hiện */}
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    Chrome Profiles Đang Có
                  </span>
                  <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                    3 Profiles
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {detectedProfiles.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-[11px] bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${p.avatarColor}`}></span>
                        <span className="font-medium text-slate-200">{p.displayName}</span>
                      </div>
                      <span className="text-slate-400 text-[10px]">{p.folderName}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Tất cả profiles được gộp trong 1 tệp backup duy nhất!</span>
              </div>
            </div>
          </div>

          {/* Danh Sách Bản Sao Lưu Hiện Có & Thư Viện Manual Feed */}
          {simulatedBackups.length > 0 && (
            <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  Thư Viện Bản Sao Lưu & Tệp Feed Thủ Công:
                </span>
                <span className="text-[11px] text-slate-400">
                  {simulatedBackups.length} bản lưu trữ sẵn sàng feed
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {simulatedBackups.map(bk => (
                  <div 
                    key={bk.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border transition-all ${
                      selectedBackupForRestore === bk.fileName
                        ? 'bg-slate-800/90 border-blue-500 shadow-md shadow-blue-950/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        bk.isManual 
                          ? 'bg-amber-950/90 border border-amber-600/80 text-amber-400' 
                          : 'bg-blue-950 border border-blue-800 text-blue-400'
                      }`}>
                        {bk.isManual ? <Sparkles className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-100 block">
                            {bk.fileName}
                          </span>
                          {bk.isManual && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-semibold">
                              ⭐ Bản Thủ Công (Manual)
                            </span>
                          )}
                        </div>

                        {bk.manualTag && (
                          <p className="text-[11px] text-amber-200/90 italic mt-0.5">
                            "{bk.manualTag}"
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span>{bk.timestamp}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{bk.size}</span>
                          <span>•</span>
                          <span>3 Profiles ({bk.cookieCount})</span>
                          <span>•</span>
                          <span className="text-blue-300">38 Tabs đã lưu</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedBackupForRestore(bk.fileName);
                          appendLog('step', `[Feed Lại Manual] Đã chọn tệp: "${bk.fileName}" làm mục tiêu khôi phục.`);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          selectedBackupForRestore === bk.fileName
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {selectedBackupForRestore === bk.fileName ? '✓ Đang Ghim Để Restore' : '⚡ Feed Bản Này'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cửa Sổ Nhật Ký Hoạt Động (Real-time Log Window) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Console Output (Nhật ký thực thi theo thời gian thực)
              </span>
              <button 
                onClick={clearLogs}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800"
              >
                Xóa Log
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 h-44 overflow-y-auto flex flex-col gap-1 select-text">
              {logs.map(log => {
                let color = 'text-slate-300';
                if (log.type === 'success') color = 'text-emerald-400';
                if (log.type === 'warning') color = 'text-amber-400';
                if (log.type === 'error') color = 'text-rose-400';
                if (log.type === 'step') color = 'text-cyan-300 font-semibold';
                return (
                  <div key={log.id} className="leading-relaxed flex gap-2">
                    <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                    <span className={color}>{log.text}</span>
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Thanh trạng thái dưới cùng của cửa sổ ứng dụng */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              {isRunning ? 'Đang thực hiện tác vụ tự động...' : 'Sẵn sàng sao lưu / khôi phục'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Target: Chrome User Data</span>
            <span>OS: Windows 10/11 x64</span>
          </div>
        </div>
      </div>

      {/* MODAL AUTO UPDATE POPUP */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative flex flex-col gap-4">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {simLang === 'vi' ? 'Đã Phát Hiện Bản Cập Nhật Mới!' : 'New Update Detected!'}
                </h3>
                <span className="text-xs text-emerald-400 font-mono">
                  v6.2.0 ➔ v6.3.0 (Bản Phát Hành Chính Thức)
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider text-amber-400">
                {simLang === 'vi' ? '🎉 Những cải tiến trong bản cập nhật này:' : '🎉 What\'s New in this Release:'}
              </span>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                <li>
                  <strong className="text-white">Theme Studio:</strong> 6 bảng màu hiện đại (Dark Slate, Cyberpunk Neon, Midnight, Emerald, Dracula, Light).
                </li>
                <li>
                  <strong className="text-white">Zero White Bleed:</strong> Loại bỏ hoàn toàn các vệt trắng của Tkinter, giao diện phẳng chuẩn Dark Mode.
                </li>
                <li>
                  <strong className="text-white">Thay Đổi Hình Dạng:</strong> Cho phép chuyển đổi nhanh giữa 3 hình dạng cửa sổ (Chuẩn, Rộng, Gọn).
                </li>
                <li>
                  <strong className="text-white">Vị Trí Lưu Trữ Trực Quan:</strong> Hiển thị rõ ràng dung lượng ổ đĩa, số lượng tệp và 1-click mở File Explorer.
                </li>
                <li>
                  <strong className="text-white">Lập Lịch Chạy Ngầm (Daemon):</strong> Chạy ngầm System Tray với khay hệ thống mà không chiếm màn hình.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                {simLang === 'vi' ? 'Để Sau' : 'Later'}
              </button>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  appendLog('success', '[Auto-Update] Đang tải gói cập nhật v6.3.0 tự động...');
                  setTimeout(() => {
                    appendLog('success', '[Auto-Update] Đã cài đặt bản cập nhật mới thành công!');
                  }, 1200);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>{simLang === 'vi' ? 'Cập Nhật Tự Động Ngay' : 'Update Automatically Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thẻ hướng dẫn nhanh tải về file thực tế */}
      <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            Nhận Bộ Ứng Dụng Độc Lập (.EXE & Python Script)
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Tải mã nguồn Python <code>chrome_backup_tool.py</code> và file <code>build_exe.bat</code> để tạo file <code>.exe</code> chạy trực tiếp trên máy của bạn với đầy đủ tính năng 1-Click tự động!
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onDownloadScript}
            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            Tải chrome_backup_tool.py
          </button>
          <button
            onClick={onDownloadZip}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Xem Toàn Bộ Gói Tải Về
          </button>
        </div>
      </div>
    </div>
  );
};
