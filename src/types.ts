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
