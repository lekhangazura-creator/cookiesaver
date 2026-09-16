import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Play, RefreshCw, CheckCircle2, AlertTriangle, AlertOctagon,
  Terminal, HardDrive, Folder, Check, Zap, RotateCcw,
  Users, ExternalLink, Download, Layers, X, Edit3, Save, Info, Trash2, Sparkles, HelpCircle
} from 'lucide-react';
import { LogMessage, ChromeProfileInfo, BackupRecord, BackupHistoryItem, BackupSchedulerConfig } from '../types';
import { QuickGuideButton } from './QuickGuideModal';
import { BackupHistoryTable } from './BackupHistoryTable';
import { LoadingOverlay } from './LoadingOverlay';
import { BackupSchedulerCard } from './BackupSchedulerCard';
import { ProfileSelector } from './ProfileSelector';

interface Props {
  onDownloadScript: () => void;
  onDownloadZip: () => void;
  onSwitchToDownload: () => void;
  onSwitchToExtension: () => void;
  onOpenTutorial?: () => void;
  schedulerConfig?: BackupSchedulerConfig;
  onUpdateSchedulerConfig?: (config: BackupSchedulerConfig) => void;
  onOpenSchedulerModal?: () => void;
}

export const ChromeFullBackup: React.FC<Props> = ({ 
  onDownloadScript, 
  onDownloadZip,
  onSwitchToDownload,
  onSwitchToExtension,
  onOpenTutorial,
  schedulerConfig,
  onUpdateSchedulerConfig,
  onOpenSchedulerModal
}) => {
  // 1. VỊ TRÍ ĐÃ LƯU TRƯỚC ĐÂY (TỰ ĐỘNG GHI NHỚ QUA LOCALSTORAGE - KHÔNG CẦN CHỌN LẠI SAU KHI ĐÓNG APP)
  const [backupPath, setBackupPath] = useState<string>(() => {
    return localStorage.getItem('chrome_backup_saved_location') || 'C:\\Users\\Administrator\\Documents\\Chrome_Backups';
  });
  const [showEditPathModal, setShowEditPathModal] = useState(false);
  const [tempPathInput, setTempPathInput] = useState(backupPath);
  const [showConfirmRestoreModal, setShowConfirmRestoreModal] = useState(false);

  // Full-screen Loading Overlay State for Uninstall / Operations
  const [overlayState, setOverlayState] = useState<{
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

  // 2. THANH TIẾN TRÌNH % (PROGRESS BAR)
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStepText, setProgressStepText] = useState('Trạng thái: Sẵn sàng thực hiện');
  const [progressDetailText, setProgressDetailText] = useState('Hệ thống đã nhận diện cấu hình và sẵn sàng cho thao tác 1-Click.');
  const [isRunning, setIsRunning] = useState(false);
  const [operationType, setOperationType] = useState<'idle' | 'backup' | 'restore'>('idle');

  // Danh sách các bản sao lưu
  const [simulatedBackups, setSimulatedBackups] = useState<BackupRecord[]>([
    {
      id: 'bk_01',
      fileName: 'Chrome_AllProfiles_Backup_20260914_1000.zip',
      filePath: `${backupPath}\\Chrome_AllProfiles_Backup_20260914_1000.zip`,
      size: '184.2 MB',
      timestamp: 'Hôm nay, 10:00:15',
      profilesIncluded: ['Default', 'Profile 1', 'Profile 2'],
      cookieCount: '1,870 cookies & tokens',
      extensionCount: 29,
      openTabsCount: 38,
      backupMode: 'smart_speed',
      createdDate: new Date(),
      isManual: false
    }
  ]);

  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<string>(
    'Chrome_AllProfiles_Backup_20260914_1000.zip'
  );

  // Fallback default scheduler config if not passed via props
  const defaultLocalConfig: BackupSchedulerConfig = {
    enabled: true,
    frequency: 'daily',
    time: '20:00',
    dayOfWeek: 5,
    intervalHours: 4,
    intervalDays: 1,
    autoCloseChrome: true,
    notifyBeforeMinutes: 5,
    maxRetentionBackups: 5,
    smartSpeed: true
  };

  const currentScheduler = schedulerConfig || defaultLocalConfig;

  const handleToggleScheduler = () => {
    if (onUpdateSchedulerConfig) {
      onUpdateSchedulerConfig({
        ...currentScheduler,
        enabled: !currentScheduler.enabled
      });
    }
  };

  const handleTriggerSchedulerTest = () => {
    appendLog('step', '================================================================');
    appendLog('info', `[⏰ SCHEDULER] Kích hoạt tác vụ sao lưu tự động theo lịch (${currentScheduler.frequency} lúc ${currentScheduler.time})...`);
    executeOneClickBackup();
  };

  const detectedProfiles: ChromeProfileInfo[] = [
    {
      id: 'default',
      folderName: 'Default',
      displayName: 'Profile Mặc Định (Chính)',
      email: 'alex.nguyen@gmail.com',
      avatarColor: 'bg-emerald-500',
      cookiesEstimated: '840 cookies & sessions',
      extensionsCount: 14,
      isOpen: true,
      category: 'Cá nhân',
      sizeEstimated: '98 MB'
    },
    {
      id: 'profile1',
      folderName: 'Profile 1',
      displayName: 'Công Việc & Doanh Nghiệp',
      email: 'work@company.io',
      avatarColor: 'bg-blue-500',
      cookiesEstimated: '620 cookies & tokens',
      extensionsCount: 9,
      isOpen: true,
      category: 'Công việc',
      sizeEstimated: '64 MB'
    },
    {
      id: 'profile2',
      folderName: 'Profile 2',
      displayName: 'Tài Khoản Tài Chính & Crypto',
      email: 'investor.vault@gmail.com',
      avatarColor: 'bg-amber-500',
      cookiesEstimated: '410 cookies & sessions',
      extensionsCount: 6,
      isOpen: false,
      category: 'Tài chính',
      sizeEstimated: '42 MB'
    },
    {
      id: 'profile3',
      folderName: 'Profile 3',
      displayName: 'Thử Nghiệm & Lập Trình (Dev)',
      email: undefined,
      avatarColor: 'bg-purple-500',
      cookiesEstimated: '190 cookies & tokens',
      extensionsCount: 18,
      isOpen: false,
      category: 'Lập trình',
      sizeEstimated: '55 MB'
    },
    {
      id: 'profile4',
      folderName: 'Profile 4',
      displayName: 'Mua Sắm & Giải Trí Gia Đình',
      email: 'shopping.family@gmail.com',
      avatarColor: 'bg-rose-500',
      cookiesEstimated: '530 cookies & sessions',
      extensionsCount: 5,
      isOpen: false,
      category: 'Giải trí',
      sizeEstimated: '36 MB'
    }
  ];

  // Danh sách ID các profile được chọn để backup
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('chrome_backup_selected_profile_ids');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved profile ids:', e);
      }
    }
    return ['default', 'profile1', 'profile2', 'profile3', 'profile4'];
  });

  const handleToggleProfile = (id: string) => {
    setSelectedProfileIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('chrome_backup_selected_profile_ids', JSON.stringify(next));
      return next;
    });
  };

  const handleSelectAllProfiles = () => {
    const allIds = detectedProfiles.map(p => p.id);
    setSelectedProfileIds(allIds);
    localStorage.setItem('chrome_backup_selected_profile_ids', JSON.stringify(allIds));
    appendLog('info', `[LỰA CHỌN PROFILES] Đã chọn toàn bộ ${allIds.length} Profiles.`);
  };

  const handleDeselectAllProfiles = () => {
    setSelectedProfileIds([]);
    localStorage.setItem('chrome_backup_selected_profile_ids', JSON.stringify([]));
    appendLog('warning', '[LỰA CHỌN PROFILES] Đã bỏ chọn toàn bộ Profiles. Vui lòng chọn ít nhất 1 Profile trước khi sao lưu.');
  };

  const handleInvertProfileSelection = () => {
    setSelectedProfileIds(prev => {
      const next = detectedProfiles.filter(p => !prev.includes(p.id)).map(p => p.id);
      localStorage.setItem('chrome_backup_selected_profile_ids', JSON.stringify(next));
      appendLog('info', `[LỰA CHỌN PROFILES] Đã đảo lựa chọn: ${next.length}/${detectedProfiles.length} Profiles.`);
      return next;
    });
  };

  const handleSelectOnlyWithEmail = () => {
    const emailIds = detectedProfiles.filter(p => !!p.email).map(p => p.id);
    setSelectedProfileIds(emailIds);
    localStorage.setItem('chrome_backup_selected_profile_ids', JSON.stringify(emailIds));
    appendLog('info', `[LỰA CHỌN PROFILES] Đã lọc chọn ${emailIds.length} Profiles có tài khoản Google Email.`);
  };

  const handleSelectOnlyOpen = () => {
    const openIds = detectedProfiles.filter(p => p.isOpen).map(p => p.id);
    setSelectedProfileIds(openIds);
    localStorage.setItem('chrome_backup_selected_profile_ids', JSON.stringify(openIds));
    appendLog('info', `[LỰA CHỌN PROFILES] Đã lọc chọn ${openIds.length} Profiles đang chạy ngầm.`);
  };

  const [logs, setLogs] = useState<LogMessage[]>([
    {
      id: '1',
      timestamp: '10:00:01',
      type: 'info',
      text: 'Khởi động Chrome 100% Full Backup Engine (Bản v5.2.0 • Tự động ghi nhớ vị trí).'
    },
    {
      id: '2',
      timestamp: '10:00:02',
      type: 'success',
      text: `Đã nạp vị trí lưu trước đây: "${backupPath}" (Tự động ghi nhớ trong cấu hình).`
    },
    {
      id: '3',
      timestamp: '10:00:02',
      type: 'info',
      text: 'Đã nhận diện 3 Profiles: "Default", "Profile 1", "Profile 2" cùng 100% Cookies SQLite & Extensions.'
    },
    {
      id: '4',
      timestamp: '10:00:03',
      type: 'step',
      text: 'Sẵn sàng! Nhấn [1-CLICK AUTO BACKUP] để sao lưu hoặc [1-CLICK AUTO RESTORE] để khôi phục.'
    }
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Cảnh báo người dùng nếu cố tình đóng tab hoặc tắt app trong lúc đang sao lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault();
        e.returnValue = 'Đang trong quá trình sao lưu dữ liệu! Vui lòng đừng tắt app để tránh làm hỏng tệp!';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning]);

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

  // Đổi và ghi nhớ vị trí lưu
  const handleSaveNewPath = (newPath: string) => {
    const trimmed = newPath.trim();
    if (!trimmed) return;
    setBackupPath(trimmed);
    localStorage.setItem('chrome_backup_saved_location', trimmed);
    setShowEditPathModal(false);
    appendLog('success', `[VỊ TRÍ ĐÃ LƯU] Đã cập nhật và ghi nhớ vị trí mới: ${trimmed}`);
    appendLog('info', '-> Vị trí này sẽ được tự động nạp mỗi khi mở lại ứng dụng mà không cần chọn lại.');
  };

  // 1-CLICK AUTO BACKUP VỚI THANH % VÀ CẢNH BÁO
  const executeOneClickBackup = () => {
    if (isRunning) return;

    if (selectedProfileIds.length === 0) {
      appendLog('error', '[❌ CHƯA CHỌN PROFILE] Vui lòng chọn ít nhất 1 Profile cần sao lưu trong danh sách!');
      return;
    }

    const targetProfiles = detectedProfiles.filter(p => selectedProfileIds.includes(p.id));
    const targetFolderNames = targetProfiles.map(p => p.folderName);
    const targetDisplayNames = targetProfiles.map(p => p.displayName);
    const totalSelectedCookies = targetProfiles.reduce((acc, p) => {
      const match = p.cookiesEstimated.match(/\d+/);
      return acc + (match ? parseInt(match[0], 10) : 0);
    }, 0);
    const totalSelectedExtensions = targetProfiles.reduce((acc, p) => acc + p.extensionsCount, 0);
    const estSizeMB = (targetProfiles.reduce((acc, p) => {
      const val = p.sizeEstimated ? parseFloat(p.sizeEstimated) : 50;
      return acc + val;
    }, 0)).toFixed(1);

    setIsRunning(true);
    setOperationType('backup');
    setProgressPercent(5);
    setProgressStepText(`[1/5] Kiểm tra tiến trình Chrome cho ${targetProfiles.length} Profiles...`);
    setProgressDetailText(`Đang quét tiến trình chrome.exe và khóa tệp SQLite của ${targetFolderNames.join(', ')}...`);

    appendLog('step', '================================================================');
    appendLog('step', `BẮT ĐẦU SAO LƯU CHO ${targetProfiles.length}/${detectedProfiles.length} PROFILES ĐÃ CHỌN: [${targetFolderNames.join(', ')}]`);
    appendLog('info', `-> Danh sách chi tiết: ${targetDisplayNames.join(' | ')}`);
    appendLog('warning', '🚨 [CẢNH BÁO QUAN TRỌNG] Đang sao lưu dữ liệu: TUYỆT ĐỐI ĐỪNG TẮT APP HOẶC ĐÓNG CỬA SỔ!');
    appendLog('step', '================================================================');

    // Bước 1: Cảnh báo & Tắt Chrome giải phóng khóa tệp SQLite (15%)
    setTimeout(() => {
      setProgressPercent(15);
      setProgressStepText('[2/5] Đang giải phóng khóa tệp SQLite (taskkill chrome.exe)...');
      setProgressDetailText('Đang tự động đóng an toàn tiến trình Chrome để chống khóa tệp SQLite...');
      appendLog('warning', '[⚠️ CẢNH BÁO TIẾN TRÌNH] Phát hiện Chrome đang chạy ngầm. Tự động đóng an toàn để tránh lỗi khóa tệp SQLite (Database is locked)...');
      appendLog('success', '[✓] Đã giải phóng hoàn toàn khóa tệp. Tất cả Cookies & Login Data đã sẵn sàng sao chép.');

      // Bước 2: Khởi tạo tệp nén tại vị trí đã nhớ (35%)
      setTimeout(() => {
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
        const zipSuffix = targetProfiles.length === detectedProfiles.length ? 'AllProfiles' : `${targetProfiles.length}Profiles`;
        const zipName = `Chrome_Backup_${zipSuffix}_${timestamp}.zip`;
        const fullDest = `${backupPath}\\${zipName}`;

        setProgressPercent(35);
        setProgressStepText('[3/5] Khởi tạo tệp lưu trữ bảo mật...');
        setProgressDetailText(`Đang tạo tệp nén tại vị trí đã nhớ: ${fullDest}`);
        appendLog('info', `[+] Tạo tệp nén tại vị trí đã nhớ: ${fullDest}`);
        appendLog('info', '[*] Trích xuất Master Key DPAPI từ Local State để bảo tồn khả năng giải mã Cookies & Passwords...');

        // Bước 3: Nén tất cả Profiles & Cookies (65%)
        setTimeout(() => {
          setProgressPercent(65);
          setProgressStepText(`[4/5] Đang sao chép ${targetProfiles.length} Profiles, Cookies, Passwords, Tabs...`);
          setProgressDetailText(`Đang nén ${targetFolderNames.join(', ')} (${totalSelectedExtensions} extensions, ~${estSizeMB} MB)...`);
          targetProfiles.forEach(p => {
            appendLog('info', `-> Đang nén Profile "${p.folderName}" (${p.displayName}) - ${p.cookiesEstimated}, ${p.extensionsCount} extensions...`);
          });
          appendLog('info', '-> Đang lưu trữ Sessions & Tabs đang mở của các Profiles đã chọn...');

          // Bước 4: Kiểm tra toàn vẹn & Ghi nhớ vị trí (90%)
          setTimeout(() => {
            setProgressPercent(90);
            setProgressStepText('[5/5] Kiểm tra toàn vẹn dữ liệu & Lưu vị trí vào cấu hình...');
            setProgressDetailText('Kiểm tra chỉ mục ZIP và ghi nhận trạng thái vào config.json...');

            const newRecord: BackupRecord = {
              id: Date.now().toString(),
              fileName: zipName,
              filePath: fullDest,
              size: `${estSizeMB} MB`,
              timestamp: 'Vừa xong',
              profilesIncluded: targetFolderNames,
              cookieCount: `${totalSelectedCookies.toLocaleString()} cookies & sessions`,
              extensionCount: totalSelectedExtensions,
              openTabsCount: targetProfiles.length * 12,
              backupMode: 'smart_speed',
              createdDate: new Date()
            };

            setSimulatedBackups(prev => [newRecord, ...prev]);
            setSelectedBackupForRestore(zipName);

            // Lưu vào bảng lịch sử persistent trong localStorage
            try {
              const histItem: BackupHistoryItem = {
                id: 'bk_' + Date.now(),
                fileName: zipName,
                filePath: fullDest,
                size: `${estSizeMB} MB`,
                timestamp: new Date().toLocaleString('vi-VN'),
                isoDate: new Date().toISOString(),
                profilesCount: targetProfiles.length,
                profilesNames: targetFolderNames,
                cookiesCount: `${totalSelectedCookies.toLocaleString()} cookies & sessions`,
                os: 'windows',
                status: 'verified',
                note: targetProfiles.length === detectedProfiles.length
                  ? 'Sao lưu toàn bộ Profiles'
                  : `Chỉ sao lưu ${targetProfiles.length}/${detectedProfiles.length} Profiles (${targetFolderNames.join(', ')})`
              };
              const rawStored = localStorage.getItem('chrome_backup_history_records');
              const parsed = rawStored ? JSON.parse(rawStored) : [];
              localStorage.setItem('chrome_backup_history_records', JSON.stringify([histItem, ...(Array.isArray(parsed) ? parsed : [])]));
            } catch (err) {
              console.error('Failed to sync history:', err);
            }

            // Bước 5: Hoàn tất 100%
            setTimeout(() => {
              setProgressPercent(100);
              setProgressStepText('✓ SAO LƯU HOÀN TẤT 100%!');
              setProgressDetailText(`Tệp đã được lưu an toàn tại: ${fullDest}`);
              appendLog('success', `[✓ THÀNH CÔNG] ĐÃ SAO LƯU AN TOÀN ${targetProfiles.length} PROFILES CHROME!`);
              appendLog('success', `-> Tệp lưu trữ: ${zipName} (${estSizeMB} MB)`);
              appendLog('success', `-> Profiles bao gồm: ${targetFolderNames.join(', ')}`);
              appendLog('success', `-> Vị trí lưu: ${backupPath} (Đã tự động ghi nhớ cho các lần tiếp theo)`);
              appendLog('step', '================================================================');

              setIsRunning(false);
              setOperationType('idle');
            }, 700);
          }, 800);
        }, 800);
      }, 700);
    }, 800);
  };

  // 1-CLICK AUTO RESTORE VỚI THANH % VÀ CẢNH BÁO
  const executeOneClickRestore = () => {
    setShowConfirmRestoreModal(false);
    if (isRunning) return;
    setIsRunning(true);
    setOperationType('restore');
    setProgressPercent(5);
    setProgressStepText('[1/5] Kiểm tra tệp sao lưu & Cảnh báo an toàn...');
    setProgressDetailText(`Đang định vị bản sao lưu mới nhất: ${selectedBackupForRestore}...`);

    appendLog('step', '================================================================');
    appendLog('step', 'BẮT ĐẦU TIẾN TRÌNH KHÔI PHỤC 1-CLICK TỰ ĐỘNG TOÀN BỘ CHROME');
    appendLog('step', '================================================================');

    // Bước 1: Cảnh báo ghi đè & Tắt sạch Chrome (20%)
    setTimeout(() => {
      setProgressPercent(20);
      setProgressStepText('[2/5] Đang đóng sạch chrome.exe để giải phóng tệp...');
      setProgressDetailText('Tắt tất cả tiến trình Chrome tránh xung đột khi ghi đè tệp Cookies...');
      appendLog('warning', '[⚠️ CẢNH BÁO GHI ĐÈ] Đang thay thế toàn bộ Profiles hiện tại bằng dữ liệu trong bản sao lưu...');
      appendLog('info', '[+] Tự động đóng chrome.exe (taskkill /F /IM chrome.exe)...');
      appendLog('success', '[✓] Đã giải phóng hoàn toàn file handles.');

      // Bước 2: Giải nén & Phục hồi Profiles (55%)
      setTimeout(() => {
        setProgressPercent(55);
        setProgressStepText('[3/5] Đang giải nén và phục hồi từng Profile, Cookie, Mật khẩu...');
        setProgressDetailText('Đang nạp 1,870 cookies, 29 extensions và các phiên làm việc...');
        appendLog('info', `[+] Giải nén tệp: ${selectedBackupForRestore}`);
        appendLog('info', '-> Phục hồi Local State và khóa Master Key DPAPI...');
        appendLog('info', '-> Phục hồi thư mục Profiles: Default, Profile 1, Profile 2...');
        appendLog('info', '-> Phục hồi cơ sở dữ liệu SQLite Cookies (Network\\Cookies) và Login Data...');

        // Bước 3: Vá cờ Normal Exit chống văng về Guest (85%)
        setTimeout(() => {
          setProgressPercent(85);
          setProgressStepText('[4/5] Chuẩn hóa cờ khởi chạy Normal Clean Exit...');
          setProgressDetailText('Vá exit_type = "Normal" trong Preferences để không bị hỏi Guest...');
          appendLog('info', '[+] Đang sửa cờ exit_type = "Normal" và exited_cleanly = true...');
          appendLog('success', '[✓] Đã sửa lỗi văng phiên cho 3 Profiles thành công.');

          // Bước 4: Tự động mở lại Chrome (100%)
          setTimeout(() => {
            setProgressPercent(100);
            setProgressStepText('✓ KHÔI PHỤC HOÀN TẤT 100%!');
            setProgressDetailText('Google Chrome đã tự động mở lại với đầy đủ Profiles, Cookies và Tabs!');
            appendLog('success', '[+] Tự động khởi chạy Google Chrome (--restore-last-session)...');
            appendLog('success', '[✓ THÀNH CÔNG] GOOGLE CHROME ĐÃ MỞ LẠI VỚI ĐẦY ĐỦ PROFILES, COOKIES VÀ TABS!');
            appendLog('step', '================================================================');

            setIsRunning(false);
            setOperationType('idle');
          }, 800);
        }, 800);
      }, 700);
    }, 800);
  };

  const handleUninstallApp = () => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ cài đặt ứng dụng? Thao tác này sẽ xóa sạch cấu hình config.json, cache phiên làm việc và khôi phục cài đặt gốc.\n\nLƯU Ý QUAN TRỌNG: Các tệp .zip sao lưu Chrome của bạn vẫn được giữ nguyên an toàn 100%!")) {
      return;
    }

    setOverlayState({
      isOpen: true,
      title: 'Đang Gỡ Cài Đặt (Uninstall)...',
      subtitle: 'Đang dọn dẹp config.json, cache phiên làm việc và tệp cấu hình...',
      type: 'uninstall',
      progress: 25
    });

    setTimeout(() => {
      setOverlayState(prev => ({ ...prev, progress: 65, subtitle: 'Đang reset vị trí ghi nhớ về mặc định...' }));
      localStorage.removeItem('chrome_backup_saved_location');
      setBackupPath('C:\\Users\\Administrator\\Documents\\Chrome_Backups');

      setTimeout(() => {
        setOverlayState(prev => ({ ...prev, progress: 95, subtitle: 'Đang bảo toàn các bản sao lưu .ZIP an toàn...' }));

        setTimeout(() => {
          setOverlayState(prev => ({ ...prev, progress: 100, subtitle: 'Gỡ cài đặt hoàn tất 100%!' }));
          setTimeout(() => {
            setOverlayState({ isOpen: false, title: '', type: 'uninstall' });
            appendLog('success', '[✓] Đã hoàn tất gỡ cài đặt sạch sẽ 100%. File sao lưu .zip của bạn vẫn an toàn!');
          }, 500);
        }, 400);
      }, 500);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Fullscreen Loading Overlay cho Gỡ Cài Đặt và Thao Tác Nặng */}
      <LoadingOverlay 
        isOpen={overlayState.isOpen}
        title={overlayState.title}
        subtitle={overlayState.subtitle}
        type={overlayState.type}
        progress={overlayState.progress}
      />

      {/* BANNER HƯỚNG DẪN NHANH DÀNH CHO NGƯỜI DÙNG MỚI */}
      {onOpenTutorial && (
        <section className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/50 border border-cyan-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-cyan-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs sm:text-sm">
                  Bạn là người dùng mới? Khám phá Hướng dẫn nhanh!
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.2 rounded border border-cyan-500/30 uppercase font-mono">
                  Mới
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Xem giải thích chi tiết toàn bộ thành phần: Sao lưu 1-Click, Khôi phục, Lập lịch Scheduler, Tải bản .EXE và Extension.
              </p>
            </div>
          </div>

          <button
            id="btn-open-guide-banner"
            type="button"
            onClick={onOpenTutorial}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-950 cursor-pointer shrink-0 self-end sm:self-center group"
          >
            <HelpCircle className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
            <span>Xem Hướng Dẫn Nhanh (?)</span>
          </button>
        </section>
      )}

      {/* 1. KHUNG VỊ TRÍ ĐÃ LƯU TRƯỚC ĐÂY (TỰ ĐỘNG GHI NHỚ - KHÔNG CẦN CHỌN LẠI) */}
      <section className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 sm:p-5 shadow-lg shadow-cyan-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Vị Trí Lưu Trữ Đã Ghi Nhớ
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <Check className="w-3 h-3" />
                  Đã tự động ghi nhớ
                </span>
                <QuickGuideButton topicId="auto_memory" />
              </div>
              <div className="font-mono text-xs sm:text-sm text-slate-100 mt-1 font-semibold break-all bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-800">
                {backupPath}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Ứng dụng tự động lưu vào vị trí này — Bạn không cần phải chọn lại mỗi khi đóng và mở lại app.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => {
                setTempPathInput(backupPath);
                setShowEditPathModal(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Đổi vị trí</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. HỆ THỐNG CẢNH BÁO THÔNG MINH (ALERTS & WARNINGS) */}
      <section className="bg-slate-900/90 border-l-4 border-l-amber-400 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Hệ Thống Cảnh Báo An Toàn & Lưu Ý Kỹ Thuật</span>
          </div>
          <QuickGuideButton topicId="smart_alerts" label="Cảnh báo an toàn (?)" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          {/* Cảnh báo 1: Đang sao lưu thì ĐỪNG TẮT APP */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-red-500/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rounded-full blur-xl pointer-events-none" />
            <span className="font-bold text-red-400 flex items-center gap-1.5 mb-1">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              Đang sao lưu: ĐỪNG TẮT APP!
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Trong khi sao lưu đang chạy (thanh % đang tăng), <strong>tuyệt đối không tắt app, không đóng tab hoặc ngắt nguồn/rút USB</strong> để tránh làm hỏng cấu trúc tệp ZIP (corrupted archive).
            </p>
          </div>

          {/* Cảnh báo 2: Chrome đang chạy */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="font-semibold text-amber-300 block mb-1">
              ⚠️ Xung đột Chrome (File Lock)
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Google Chrome chạy ngầm sẽ khóa các file SQLite (<code className="text-amber-200">Network/Cookies</code>, <code className="text-amber-200">Login Data</code>). Công cụ sẽ <strong>tự động đóng chrome.exe</strong> an toàn trước khi sao chép.
            </p>
          </div>

          {/* Cảnh báo 3: Restore ghi đè */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="font-semibold text-cyan-300 block mb-1">
              ⚠️ Ghi đè khi Restore (Profile)
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Khôi phục sẽ thay thế toàn bộ phiên đăng nhập hiện tại bằng dữ liệu từ bản sao lưu. Hệ thống tự động sửa cờ <code className="text-emerald-300">Normal Exit</code> để chống bị văng về chế độ Guest.
            </p>
          </div>
        </div>
      </section>

      {/* 2.5 BỘ LỌC VÀ TÌM KIẾM PROFILES ĐỂ CHỌN SAO LƯU (SEARCH & FILTER PROFILES) */}
      <ProfileSelector
        profiles={detectedProfiles}
        selectedProfileIds={selectedProfileIds}
        onToggleProfile={handleToggleProfile}
        onSelectAll={handleSelectAllProfiles}
        onDeselectAll={handleDeselectAllProfiles}
        onInvertSelection={handleInvertProfileSelection}
        onSelectOnlyWithEmail={handleSelectOnlyWithEmail}
        onSelectOnlyOpen={handleSelectOnlyOpen}
      />

      {/* CẢNH BÁO TRỰC TIẾP KHI ĐANG SAO LƯU (LIVE WARNING BANNER) */}
      {isRunning && operationType === 'backup' && (
        <div className="bg-gradient-to-r from-red-950/90 via-red-900/60 to-slate-900 border-2 border-red-500 text-red-200 rounded-xl p-4 sm:p-5 flex items-start sm:items-center gap-4 shadow-2xl shadow-red-950/70 animate-pulse">
          <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center shrink-0 text-red-400 shadow-inner">
            <AlertOctagon className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm sm:text-base font-extrabold text-red-400 tracking-tight uppercase">
                ⚠️ CẢNH BÁO: ĐANG SAO LƯU DỮ LIỆU — VUI LÒNG ĐỪNG TẮT APP!
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-red-200/90 mt-1 leading-relaxed">
              Hệ thống đang nén và ghi dữ liệu Profiles, Cookies SQLite và Sessions vào tệp sao lưu. <strong>Tuyệt đối KHÔNG tắt ứng dụng, KHÔNG đóng cửa sổ hoặc rút ổ đĩa</strong> để tránh làm hỏng file backup. Vui lòng giữ nguyên và chờ đến 100%!
            </p>
          </div>
        </div>
      )}

      {/* CẢNH BÁO TRỰC TIẾP KHI ĐANG KHÔI PHỤC (LIVE RESTORE WARNING BANNER) */}
      {isRunning && operationType === 'restore' && (
        <div className="bg-gradient-to-r from-blue-950/90 via-blue-900/60 to-slate-900 border-2 border-blue-500 text-blue-200 rounded-xl p-4 sm:p-5 flex items-start sm:items-center gap-4 shadow-2xl shadow-blue-950/70 animate-pulse">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center shrink-0 text-blue-400 shadow-inner">
            <RotateCcw className="w-6 h-6 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
              <h3 className="text-sm sm:text-base font-extrabold text-blue-300 tracking-tight uppercase">
                ⚠️ ĐANG KHÔI PHỤC DỮ LIỆU — ĐỪNG TẮT APP HOẶC MỞ CHROME!
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-blue-200/90 mt-1 leading-relaxed">
              Đang giải nén và ghi đè dữ liệu Profiles và cấu hình Normal Exit. Ứng dụng sẽ tự động mở lại Chrome sau khi hoàn tất.
            </p>
          </div>
        </div>
      )}

      {/* 3. THANH TIẾN TRÌNH % (PROGRESS BAR % TRỰC QUAN) */}
      <section className={`bg-slate-900 border rounded-xl p-5 transition-all duration-300 ${
        isRunning ? 'border-emerald-500 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/50' : 'border-slate-800'
      }`}>
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-xs sm:text-sm font-bold text-slate-100">
              {progressStepText}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <QuickGuideButton topicId="progress_bar" label="Tiến trình (?)" />
            <span className="text-base sm:text-xl font-extrabold font-mono text-emerald-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Thanh Progress Bar */}
        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 ease-out shadow-sm shadow-emerald-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span className="truncate pr-2">{progressDetailText}</span>
          <span className="shrink-0 text-[11px] text-slate-500">
            {isRunning ? 'Đang thực thi...' : 'Sẵn sàng'}
          </span>
        </div>
      </section>

      {/* 4. KHUNG 2 NÚT HÀNH ĐỘNG 1-CLICK (LỚN, TRANG TRÍ BÓNG BẨY) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nút Backup 1-Click */}
        <div
          role="button"
          tabIndex={isRunning ? -1 : 0}
          aria-disabled={isRunning || selectedProfileIds.length === 0}
          onClick={!isRunning && selectedProfileIds.length > 0 ? executeOneClickBackup : undefined}
          onKeyDown={(e) => {
            if (!isRunning && selectedProfileIds.length > 0 && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              executeOneClickBackup();
            }
          }}
          className={`relative group overflow-hidden rounded-xl p-5 text-left border transition-all duration-200 select-none ${
            isRunning 
              ? 'opacity-60 cursor-not-allowed bg-slate-900 border-slate-800' 
              : selectedProfileIds.length === 0
                ? 'opacity-70 cursor-not-allowed bg-slate-900 border-rose-500/50'
                : 'cursor-pointer bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 border-emerald-500/60 shadow-xl shadow-emerald-950/50 hover:shadow-emerald-900/60 hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-inner ${
              selectedProfileIds.length === 0 ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300' : 'bg-white/10 backdrop-blur border border-white/20'
            }`}>
              <Zap className="w-6 h-6 fill-white text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                selectedProfileIds.length === 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/15 text-white border border-white/20'
              }`}>
                {selectedProfileIds.length === 0
                  ? 'Chưa chọn Profile nào'
                  : `${selectedProfileIds.length}/${detectedProfiles.length} Profiles`}
              </span>
              <QuickGuideButton topicId="one_click_backup" className="!bg-black/40 !border-white/30 !text-white" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            ⚡ 1-CLICK AUTO BACKUP
          </h3>
          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            {selectedProfileIds.length === 0 ? (
              <span className="text-rose-200 font-semibold">⚠️ Vui lòng chọn ít nhất 1 Profile trong danh sách phía trên để sao lưu.</span>
            ) : selectedProfileIds.length === detectedProfiles.length ? (
              <span>Tự động tắt Chrome, sao lưu toàn bộ {detectedProfiles.length} Profiles, Cookies SQLite và Mật khẩu vào vị trí đã nhớ.</span>
            ) : (
              <span>Tự động tắt Chrome, sao lưu {selectedProfileIds.length} Profiles đã chọn ({detectedProfiles.filter(p => selectedProfileIds.includes(p.id)).map(p => p.folderName).join(', ')}) vào vị trí đã nhớ.</span>
            )}
          </p>
        </div>

        {/* Nút Restore 1-Click */}
        <div
          role="button"
          tabIndex={isRunning ? -1 : 0}
          aria-disabled={isRunning}
          onClick={!isRunning ? () => setShowConfirmRestoreModal(true) : undefined}
          onKeyDown={(e) => {
            if (!isRunning && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setShowConfirmRestoreModal(true);
            }
          }}
          className={`relative group overflow-hidden rounded-xl p-5 text-left border transition-all duration-200 cursor-pointer select-none ${
            isRunning 
              ? 'opacity-60 cursor-not-allowed bg-slate-900 border-slate-800' 
              : 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-500 hover:to-indigo-700 border-blue-500/60 shadow-xl shadow-blue-950/50 hover:shadow-blue-900/60 hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white shadow-inner">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-full text-white border border-white/20">
                1-Click Restore
              </span>
              <QuickGuideButton topicId="one_click_restore" className="!bg-black/40 !border-white/30 !text-white" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            🔄 1-CLICK AUTO RESTORE
          </h3>
          <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
            Tự động giải nén bản mới nhất, sửa lỗi Normal Exit và mở lại Chrome với đầy đủ Profiles & Tabs.
          </p>
        </div>
      </section>

      {/* 4.5 BỘ LẬP LỊCH SAO LƯU TỰ ĐỘNG (AUTO BACKUP SCHEDULER CARD) */}
      <BackupSchedulerCard 
        config={currentScheduler}
        onToggle={handleToggleScheduler}
        onOpenModal={() => {
          if (onOpenSchedulerModal) {
            onOpenSchedulerModal();
          }
        }}
        onTriggerTest={handleTriggerSchedulerTest}
      />

      {/* 5. TỔNG QUAN PHẠM VI SAO LƯU & DANH SÁCH BẢN SAO LƯU */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tóm tắt Profile đang chọn */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              Hồ Sơ Sao Lưu Kế Tiếp ({selectedProfileIds.length}/{detectedProfiles.length})
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${
              selectedProfileIds.length === 0 
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                : selectedProfileIds.length === detectedProfiles.length
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}>
              {selectedProfileIds.length === 0 
                ? 'Chưa chọn' 
                : selectedProfileIds.length === detectedProfiles.length 
                  ? '100% Toàn bộ' 
                  : 'Đã tùy chọn'}
            </span>
          </div>

          <div className="space-y-2">
            {detectedProfiles.filter(p => selectedProfileIds.includes(p.id)).length === 0 ? (
              <div className="p-4 text-center text-xs text-rose-400/90 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                <AlertTriangle className="w-5 h-5 mx-auto mb-1.5 text-rose-400" />
                Chưa chọn Profile nào. Hãy bấm "Chọn tất cả" hoặc tích chọn trong bộ lọc phía trên để tiếp tục.
              </div>
            ) : (
              detectedProfiles.filter(p => selectedProfileIds.includes(p.id)).map((p) => (
                <div key={p.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-full ${p.avatarColor} text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0`}>
                      {p.displayName.charAt(0)}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="font-semibold text-slate-200 truncate">{p.displayName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.email || 'Chỉ lưu trữ cục bộ'}</div>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 shrink-0 pl-2">
                    <div className="text-emerald-400 font-semibold">{p.cookiesEstimated.split(' ')[0]} cookies</div>
                    <div>{p.sizeEstimated || '50 MB'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Danh sách bản sao lưu đã có trong thư mục ghi nhớ */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              Bản Sao Lưu Trong Vị Trí Đã Nhớ ({simulatedBackups.length})
            </span>
            <div className="flex items-center gap-2">
              <QuickGuideButton topicId="multi_os" label="Đa HĐH (?)" />
              <span className="text-[10px] text-slate-400">
                Khôi phục ưu tiên từ file này
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {simulatedBackups.map((b) => (
              <div 
                key={b.id}
                onClick={() => setSelectedBackupForRestore(b.fileName)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  selectedBackupForRestore === b.fileName 
                    ? 'bg-slate-800/90 border-blue-500 shadow-sm' 
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedBackupForRestore === b.fileName ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      <span>{b.fileName}</span>
                      {selectedBackupForRestore === b.fileName && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">
                          Đang chọn
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {b.timestamp} • Dung lượng: {b.size} • {b.cookieCount}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">{b.openTabsCount} tabs mở</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BẢNG LƯU LỊCH SỬ CÁC LẦN BACKUP ĐÃ THỰC HIỆN (LOCALSTORAGE PERSISTENT) */}
      <BackupHistoryTable 
        onSelectRestore={(item) => {
          setSelectedBackupForRestore(item.fileName);
          setShowConfirmRestoreModal(true);
        }}
      />

      {/* 6. NHẬT KÝ HOẠT ĐỘNG (CONSOLE LOGS) */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Nhật Ký Thực Thi (Console Real-time Logs)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLogs([])}
              className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              Xóa log
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950/90 font-mono text-xs text-slate-300 h-52 overflow-y-auto space-y-1.5">
          {logs.map((l) => (
            <div key={l.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-500 shrink-0 text-[11px]">[{l.timestamp}]</span>
              <span className={
                l.type === 'success' ? 'text-emerald-400 font-semibold' :
                l.type === 'warning' ? 'text-amber-400' :
                l.type === 'error' ? 'text-red-400 font-bold' :
                l.type === 'step' ? 'text-cyan-300 font-semibold' :
                'text-slate-300'
              }>
                {l.text}
              </span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </section>

      {/* 7. BẢO TRÌ & GỠ CÀI ĐẶT AN TOÀN (1-CLICK UNINSTALL VỚI LOADING OVERLAY) */}
      <section className="bg-slate-900/90 border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">Gỡ Cài Đặt Sạch Sẽ (1-Click Safe Uninstall)</span>
              <QuickGuideButton topicId="uninstall_guide" label="Hướng dẫn (?)" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dọn dẹp tệp cấu hình config.json & khôi phục mặc định. <span className="text-emerald-400 font-semibold">Tất cả file sao lưu .zip vẫn an toàn 100%.</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleUninstallApp}
          className="px-3.5 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Gỡ Cài Đặt 1-Click</span>
        </button>
      </section>

      {/* MODAL: ĐỔI VỊ TRÍ LƯU TRỮ */}
      {showEditPathModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Folder className="w-4 h-4 text-cyan-400" />
                Đổi Vị Trí Thư Mục Sao Lưu
              </h3>
              <button 
                onClick={() => setShowEditPathModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Nhập đường dẫn thư mục mới hoặc chọn từ các gợi ý an toàn. Vị trí này sẽ được <strong>tự động ghi nhớ</strong> cho tất cả các lần sử dụng tiếp theo:
              </p>

              <input
                type="text"
                value={tempPathInput}
                onChange={(e) => setTempPathInput(e.target.value)}
                placeholder="Ví dụ: D:\My_Chrome_Backups"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block">Vị trí gợi ý:</span>
                {[
                  'C:\\Users\\Administrator\\Documents\\Chrome_Backups',
                  'D:\\Backups\\Chrome_Full_Profiles',
                  'E:\\USB_Safe_Storage\\Chrome_Vault'
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTempPathInput(s)}
                    className="w-full text-left text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-slate-950 hover:bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-800 transition-colors"
                  >
                    📁 {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditPathModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleSaveNewPath(tempPathInput)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu & Ghi nhớ vị trí</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN CẢNH BÁO GHI ĐÈ KHI RESTORE */}
      {showConfirmRestoreModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/60 rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/40">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Xác Nhận 1-Click Khôi Phục</h3>
                <span className="text-[11px] text-amber-300 font-semibold">Cảnh báo ghi đè dữ liệu phiên</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Hành động này sẽ <strong>tắt Google Chrome</strong> và <strong>thay thế toàn bộ dữ liệu Profiles hiện tại</strong> bằng tệp sao lưu:
              <br />
              <code className="text-cyan-300 block my-2 bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] break-all">
                {selectedBackupForRestore}
              </code>
              Sau khi khôi phục xong, Chrome sẽ tự động mở lại với đầy đủ Profiles, Cookies và các tab đã lưu.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmRestoreModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={executeOneClickRestore}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/40 cursor-pointer"
              >
                Tiếp tục Khôi Phục 1-Click
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
