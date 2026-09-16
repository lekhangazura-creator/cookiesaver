export interface LogMessage {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'step';
  text: string;
}

export interface ChromeProfileInfo {
  id: string;
  folderName: string;
  displayName: string;
  email?: string;
  avatarColor: string;
  cookiesEstimated: string;
  extensionsCount: number;
  isOpen: boolean;
  category?: string;
  sizeEstimated?: string;
}

export interface BackupRecord {
  id: string;
  fileName: string;
  filePath: string;
  size: string;
  timestamp: string;
  profilesIncluded: string[];
  cookieCount: string;
  extensionCount: number;
  openTabsCount: number;
  backupMode: 'full_100' | 'smart_speed';
  createdDate: Date;
  isManual?: boolean;
  manualTag?: string;
}

export interface ManualSavedFile {
  id: string;
  name: string;
  type: 'cookie' | 'save_game' | 'chrome_backup' | 'custom_file';
  size: string;
  timestamp: string;
  content: string;
  description: string;
}

export type ThemePreset = 
  | 'dark-slate' 
  | 'light-titanium' 
  | 'light-nordic' 
  | 'emerald' 
  | 'cyber-oled' 
  | 'sepia' 
  | 'royal-amethyst' 
  | 'custom';

export interface CustomThemeSettings {
  mode: 'dark' | 'light';
  accentColor: string;
  bgColor: string;
  cardColor: string;
  borderColor: string;
  textColor: string;
  borderRadius: '0px' | '4px' | '8px' | '14px' | '22px';
  contrast: 'normal' | 'high';
  glowEffect?: boolean;
}

export type TargetOS = 'all' | 'windows' | 'macos' | 'linux';

export interface VersionReleaseInfo {
  version: string;
  releaseDate: string;
  isCritical?: boolean;
  fileSize?: string;
  highlights: string[];
  downloadUrl?: string;
}

export interface BackupHistoryItem {
  id: string;
  fileName: string;
  filePath: string;
  size: string;
  timestamp: string;
  isoDate: string;
  profilesCount: number;
  profilesNames: string[];
  cookiesCount: string;
  os: TargetOS;
  status: 'success' | 'verified' | 'restored';
  note?: string;
}

export interface QuickGuideTopic {
  id: string;
  title: string;
  shortDesc: string;
  bullets: string[];
  technicalTip?: string;
  referenceFile?: string;
}

export type SchedulerFrequency = 'daily' | 'weekly' | 'hourly' | 'interval_days' | 'on_startup';

export interface BackupSchedulerConfig {
  enabled: boolean;
  frequency: SchedulerFrequency;
  time: string; // e.g., '20:00'
  dayOfWeek: number; // 0=Chủ nhật, 1=Thứ 2, ..., 5=Thứ 6, 6=Thứ 7
  intervalHours: number; // 4, 8, 12
  intervalDays: number; // 1, 2, 3, 7
  autoCloseChrome: boolean;
  notifyBeforeMinutes: number; // 0, 5, 15
  maxRetentionBackups: number; // 3, 5, 10, 0=vô hạn
  smartSpeed: boolean;
  lastRunTimestamp?: string;
  nextRunEstimated?: string;
}

