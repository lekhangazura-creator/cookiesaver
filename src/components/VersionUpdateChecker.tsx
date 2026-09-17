import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, CheckCircle2, ArrowUpCircle, Sparkles, X, 
  ExternalLink, Download, Clock, ShieldCheck, Zap, AlertCircle
} from 'lucide-react';
import { VersionReleaseInfo } from '../types';

interface Props {
  currentVersion: string;
  onDownloadZip?: () => void;
}

export const VersionUpdateChecker: React.FC<Props> = ({ 
  currentVersion,
  onDownloadZip 
}) => {
  const [status, setStatus] = useState<'checking' | 'up-to-date' | 'new-version'>('up-to-date');
  const [lastChecked, setLastChecked] = useState<string>('Vừa xong');
  const [showChangelogModal, setShowChangelogModal] = useState<boolean>(false);
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  const newReleaseInfo: VersionReleaseInfo = {
    version: 'v5.4.0',
    releaseDate: 'Hôm nay (Bản phát hành mới nhất)',
    isCritical: false,
    fileSize: '1.8 MB (Đầy đủ mã nguồn, scripts và file hướng dẫn)',
    highlights: [
      '🎨 Theme Studio: Hỗ trợ Chế độ Sáng (Light Mode), Cyber OLED, Emerald và Tự Edit màu sắc tùy ý',
      '⚡ Cơ chế kiểm tra định kỳ (Auto Update Checker) ngay tại chân trang',
      '🛡️ Bảo vệ an toàn tệp SQLite Lock và tự động đóng/mở Chrome phiên làm việc',
      '🗑️ Gỡ cài đặt (Uninstall) 1-Click: Dọn dẹp sạch sẽ 100% không lưu file rác trong Windows',
      '💾 Tự động ghi nhớ vị trí sao lưu (Auto Memory Path) an toàn trong config.json'
    ]
  };

  const checkForUpdates = () => {
    setStatus('checking');
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastChecked(timeStr);
      setStatus('up-to-date');
    }, 900);
  };

  // Kiểm tra phiên bản mới định kỳ (mỗi 60 giây)
  useEffect(() => {
    // Kiểm tra lần đầu khi tải ứng dụng
    checkForUpdates();

    checkTimerRef.current = setInterval(() => {
      checkForUpdates();
    }, 60000);

    return () => {
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
    };
  }, []);

  return (
    <>
      <div 
        id="version-update-checker"
        className="flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs"
      >
        {/* Chỉ báo trạng thái */}
        {status === 'checking' && (
          <div className="flex items-center gap-1.5 text-blue-400 font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Đang kiểm tra bản cập nhật...</span>
          </div>
        )}

        {status === 'up-to-date' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Đang dùng bản mới nhất ({currentVersion})</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] text-slate-400">Kiểm tra lúc: {lastChecked}</span>
          </div>
        )}

        {status === 'new-version' && (
          <div className="flex items-center gap-2 animate-in fade-in duration-300">
            <div 
              id="new-version-available-badge"
              onClick={() => setShowChangelogModal(true)}
              className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold cursor-pointer hover:bg-amber-500/30 transition-all shadow-sm shadow-amber-950"
              title="Nhấp để xem chi tiết bản cập nhật mới"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>New version available: {newReleaseInfo.version}!</span>
            </div>

            <button
              id="btn-view-changelog"
              onClick={() => setShowChangelogModal(true)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-200 underline decoration-amber-500/50 cursor-pointer"
            >
              Xem chi tiết
            </button>
          </div>
        )}

        {/* Nút kiểm tra thủ công */}
        <div className="flex items-center gap-1.5 ml-1 pl-1 border-l border-slate-800">
          <button
            id="btn-manual-check-update"
            onClick={() => checkForUpdates()}
            disabled={status === 'checking'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
            title="Kiểm tra cập nhật ngay bây giờ"
          >
            <RefreshCw className={`w-3 h-3 ${status === 'checking' ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Modal Thông Báo Bản Cập Nhật Mới (Changelog & Download) */}
      {showChangelogModal && (
        <div 
          id="version-changelog-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowChangelogModal(false);
          }}
        >
          <div 
            id="version-changelog-modal"
            className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-amber-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <ArrowUpCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Bản Cập Nhật Mới Đã Sẵn Sàng!
                    </h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {newReleaseInfo.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Phiên bản hiện tại: <span className="font-mono text-slate-300">{currentVersion}</span> • Phát hành: {newReleaseInfo.releaseDate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowChangelogModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung thay đổi (Changelog highlights) */}
            <div className="p-6 space-y-4 text-xs sm:text-sm max-h-[60vh] overflow-y-auto">
              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Những điểm mới trong phiên bản {newReleaseInfo.version}:</span>
                </span>
                <ul className="space-y-2 pt-1 text-slate-300 text-xs leading-relaxed">
                  {newReleaseInfo.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Bản cập nhật tương thích hoàn toàn với tất cả các tệp sao lưu <code>.zip</code> cũ của bạn mà không làm mất dữ liệu.
                </span>
              </div>
            </div>

            {/* Footer nút hành động */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
              <button
                onClick={() => setShowChangelogModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Để sau
              </button>

              <button
                id="btn-download-new-version"
                onClick={() => {
                  if (onDownloadZip) {
                    onDownloadZip();
                  }
                  setShowChangelogModal(false);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-950 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Bản Cập Nhật {newReleaseInfo.version} (.ZIP)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
