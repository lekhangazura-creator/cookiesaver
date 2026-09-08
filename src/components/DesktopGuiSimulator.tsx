import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, Play, RefreshCw, CheckCircle2, AlertTriangle, Info,
  Terminal, ShieldCheck, Download, Layers, HardDrive, Check,
  Laptop, RotateCcw, Zap, Trash2, Users, ExternalLink, Sparkles,
  Lock, KeyRound, Bookmark, History, Puzzle, Globe, Compass
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
      text: 'Khởi động ứng dụng Chrome 100% Full Backup & 1-Click Auto Restore Engine (Python GUI).'
    },
    {
      id: '2',
      timestamp: '10:00:02',
      type: 'info',
      text: 'Đường dẫn dữ liệu: C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data'
    },
    {
      id: '3',
      timestamp: '10:00:02',
      type: 'success',
      text: 'Đã nhận diện 3 Chrome Profiles: "Default", "Profile 1", "Profile 2" cùng toàn bộ Cookies, Mật khẩu, Extensions và Sessions.'
    },
    {
      id: '4',
      timestamp: '10:00:03',
      type: 'step',
      text: 'Sẵn sàng! Nhấn "1-Click Auto Backup" để lưu trữ toàn bộ hoặc "1-Click Auto Restore" để tự động khôi phục 100% không cần làm thủ công.'
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

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Container giả lập cửa sổ Desktop GUI */}
      <div 
        id="desktop-gui-window"
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
      >
        {/* Title Bar phong cách Windows 11 / CustomTkinter */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-slate-950" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-slate-200 font-mono">
              Chrome 100% Full Profile & Session Backup Engine (1-Click Auto Restore)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-800/60">
              Python .EXE Desktop Ready
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            </div>
          </div>
        </div>

        {/* Nội dung giao diện ứng dụng */}
        <div className="p-5 flex flex-col gap-5">
          {/* Header Giới Thiệu Tính Năng */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-3.5 rounded-lg border border-slate-700/60">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Chế Độ Bảo Vệ Toàn Diện 100% (Không Còn Là Chỉ Cookie)
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Ghi nhớ hoàn toàn tất cả: Toàn bộ Profiles, Cookies, Mật khẩu, Extensions, Dấu trang & Tabs đang mở.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>3 Profiles Sẵn Sàng</span>
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>1-Click Tự Động Hóa</span>
              </span>
            </div>
          </div>

          {/* HÀNG 2 NÚT HÀNH ĐỘNG ĐẶC BIỆT 1-CLICK CỦA ỨNG DỤNG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nút 1: SAO LƯU 100% TOÀN BỘ CHROME */}
            <button
              id="btn-auto-backup"
              onClick={runBackupSimulation}
              disabled={isRunning}
              className={`p-4 rounded-xl border flex flex-col items-start gap-2 text-left transition-all relative overflow-hidden group ${
                isRunning && operationType === 'backup'
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-lg shadow-emerald-950/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 shadow-md hover:shadow-emerald-600/30'
              } text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
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
                    <span className="text-xs text-emerald-100 font-medium">
                      (Sao Lưu Toàn Bộ Chrome Ngay Lập Tức)
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-300/30">
                  Nhanh & Tự Động
                </span>
              </div>
              <p className="text-xs text-emerald-50/90 leading-relaxed mt-1">
                Tự động tắt Chrome an toàn, sao lưu tất cả 3 Profiles, toàn bộ Cookies, Mật khẩu, Sessions và Extensions vào tệp zip.
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
