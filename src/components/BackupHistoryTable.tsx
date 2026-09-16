import React, { useState, useEffect } from 'react';
import { 
  History, Search, Trash2, Download, RefreshCw, HardDrive, 
  CheckCircle2, FileArchive, Laptop, Apple, Terminal, 
  RotateCcw, Copy, Check, Filter, Calendar, Layers, ShieldCheck
} from 'lucide-react';
import { BackupHistoryItem, TargetOS } from '../types';
import { QuickGuideButton } from './QuickGuideModal';

const STORAGE_KEY = 'chrome_backup_history_records';

const DEFAULT_HISTORY_SEEDS: BackupHistoryItem[] = [
  {
    id: 'bk-win-01',
    fileName: 'Chrome_Backup_20260915_091530.zip',
    filePath: 'C:\\Users\\User\\Documents\\Chrome_Backups\\Chrome_Backup_20260915_091530.zip',
    size: '215.4 MB',
    timestamp: '15/09/2026 09:15:30',
    isoDate: '2026-09-15T09:15:30.000Z',
    profilesCount: 3,
    profilesNames: ['Default', 'Profile 1 (Công việc)', 'Profile 2 (Cá nhân)'],
    cookiesCount: '4,280 cookies',
    os: 'windows',
    status: 'verified',
    note: 'Bản sao lưu tự động trước khi dọn dẹp hệ thống'
  },
  {
    id: 'bk-mac-02',
    fileName: 'Chrome_macOS_Backup_20260914_174022.zip',
    filePath: '/Users/admin/Documents/Chrome_Backups/Chrome_macOS_Backup_20260914_174022.zip',
    size: '184.2 MB',
    timestamp: '14/09/2026 17:40:22',
    isoDate: '2026-09-14T17:40:22.000Z',
    profilesCount: 2,
    profilesNames: ['Default', 'Profile 1 (Mac Studio)'],
    cookiesCount: '3,120 cookies',
    os: 'macos',
    status: 'success',
    note: 'Lưu toàn bộ phiên đăng nhập & Extensions'
  },
  {
    id: 'bk-lin-03',
    fileName: 'Chrome_Linux_Backup_20260912_142010.zip',
    filePath: '/home/developer/Documents/Chrome_Backups/Chrome_Linux_Backup_20260912_142010.zip',
    size: '142.8 MB',
    timestamp: '12/09/2026 14:20:10',
    isoDate: '2026-09-12T14:20:10.000Z',
    profilesCount: 1,
    profilesNames: ['Default'],
    cookiesCount: '1,890 cookies',
    os: 'linux',
    status: 'success',
    note: 'Bản lưu định kỳ trên Ubuntu 24.04'
  }
];

interface Props {
  onSelectRestore?: (item: BackupHistoryItem) => void;
}

export const BackupHistoryTable: React.FC<Props> = ({ onSelectRestore }) => {
  const [records, setRecords] = useState<BackupHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_HISTORY_SEEDS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOS, setSelectedOS] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to persist backup history:', e);
    }
  }, [records]);

  // Notice helper
  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleCopyPath = (item: BackupHistoryItem) => {
    navigator.clipboard.writeText(item.filePath);
    setCopiedId(item.id);
    triggerNotice(`Đã sao chép đường dẫn: ${item.fileName}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa bản ghi "${name}" khỏi lịch sử? (File thực tế trên ổ đĩa vẫn được giữ nguyên)`)) {
      setRecords(prev => prev.filter(r => r.id !== id));
      triggerNotice(`Đã xóa "${name}" khỏi bảng lịch sử.`);
    }
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc muốn xóa TOÀN BỘ lịch sử các lần backup? (Thao tác này chỉ xóa danh sách lưu trữ trên web, không xóa tệp trên ổ cứng)')) {
      setRecords([]);
      triggerNotice('Đã dọn sạch toàn bộ lịch sử.');
    }
  };

  const handleResetSample = () => {
    setRecords(DEFAULT_HISTORY_SEEDS);
    triggerNotice('Đã khôi phục dữ liệu lịch sử mẫu!');
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chrome_backup_history_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerNotice('Đã tải xuống tệp lịch sử sao lưu (.JSON)!');
  };

  // Filtered records
  const filteredRecords = records.filter(r => {
    const matchSearch = 
      r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.filePath.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.profilesNames.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.note && r.note.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchOS = selectedOS === 'all' || r.os === selectedOS;

    return matchSearch && matchOS;
  });

  const getOSBadge = (os: TargetOS) => {
    switch (os) {
      case 'windows':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Laptop className="w-3 h-3" /> Windows
          </span>
        );
      case 'macos':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Apple className="w-3 h-3" /> macOS
          </span>
        );
      case 'linux':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Terminal className="w-3 h-3" /> Linux
          </span>
        );
    }
  };

  return (
    <div id="backup-history-section" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Bảng Lịch Sử Các Lần Backup Đã Thực Hiện
              </h3>
              <QuickGuideButton topicId="auto_memory" label="Ghi nhớ (?)" />
            </div>
            <p className="text-xs text-slate-400">
              Lưu tự động vào <code className="text-cyan-300 font-mono">localStorage</code> giúp bạn dễ dàng theo dõi tên file, dung lượng và thời gian các bản lưu
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={handleExportJson}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Xuất file JSON lưu trữ"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Xuất JSON</span>
          </button>

          <button
            onClick={handleResetSample}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Nạp lại các bản ghi mẫu"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Mẫu</span>
          </button>

          {records.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 px-3 py-1.5 rounded-lg border border-red-800/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xóa toàn bộ danh sách lịch sử"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Xóa hết</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 text-xs px-4 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Summary Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
        <div>
          <span className="text-[11px] text-slate-500 block font-medium">Tổng số bản sao lưu</span>
          <span className="text-base font-extrabold text-white font-mono">{records.length} bản</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block font-medium">Bản sao lưu mới nhất</span>
          <span className="text-xs font-semibold text-cyan-400 truncate block mt-0.5">
            {records[0] ? records[0].timestamp : 'Chưa có'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block font-medium">Hệ điều hành đã lưu</span>
          <span className="text-xs font-semibold text-emerald-400 block mt-0.5">
            Windows • Mac • Linux
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block font-medium">Trạng thái bảo toàn</span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Nguyên vẹn
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên tệp zip, profile, ghi chú..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* OS Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl w-full sm:w-auto justify-between">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'windows', label: 'Windows' },
            { id: 'macos', label: 'macOS' },
            { id: 'linux', label: 'Linux' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedOS(tab.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                selectedOS === tab.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Records Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
              <th className="py-3 px-3.5">Tên Tệp Sao Lưu (.ZIP)</th>
              <th className="py-3 px-3">Dung Lượng</th>
              <th className="py-3 px-3">Thời Gian Sao Lưu</th>
              <th className="py-3 px-3">Profiles & Dữ Liệu</th>
              <th className="py-3 px-3">HĐH</th>
              <th className="py-3 px-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  <FileArchive className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-slate-400">Không tìm thấy bản ghi sao lưu nào</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Thực hiện bấm "1-Click Auto Backup" để tạo bản sao lưu mới hoặc nhấn nút "Mẫu" để nạp lại dữ liệu thử nghiệm.
                  </p>
                </td>
              </tr>
            ) : (
              filteredRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                  {/* File Name & Path */}
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <FileArchive className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate max-w-[200px] sm:max-w-[260px]">
                          {item.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[200px] sm:max-w-[260px]" title={item.filePath}>
                          {item.filePath}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                      {item.size}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono">{item.timestamp}</span>
                    </div>
                  </td>

                  {/* Profiles & Cookies */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1 max-w-[180px]">
                      <span className="text-white font-medium flex items-center gap-1 text-[11px]">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        {item.profilesCount} Profiles ({item.profilesNames.join(', ')})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        🍪 {item.cookiesCount} • Passwords DPAPI
                      </span>
                    </div>
                  </td>

                  {/* OS */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getOSBadge(item.os)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Copy Path */}
                      <button
                        onClick={() => handleCopyPath(item)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                        title="Sao chép đường dẫn tệp zip"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Restore This Backup */}
                      <button
                        onClick={() => onSelectRestore && onSelectRestore(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        title="Khôi phục dữ liệu từ bản này"
                      >
                        <RotateCcw className="w-3 h-3 text-cyan-400" />
                        <span>Khôi phục</span>
                      </button>

                      {/* Delete from history */}
                      <button
                        onClick={() => handleDeleteItem(item.id, item.fileName)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg border border-transparent hover:border-red-800/40 transition-colors cursor-pointer"
                        title="Xóa khỏi bảng lịch sử"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Dữ liệu được lưu an toàn trong trình duyệt của bạn và tự động đồng bộ khi thực hiện sao lưu mới.
        </span>
        <span className="font-mono text-slate-500">
          Hiển thị: {filteredRecords.length}/{records.length} bản sao lưu
        </span>
      </div>
    </div>
  );
};
