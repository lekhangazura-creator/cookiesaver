import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, CheckSquare, Square, Check, X, 
  Users, Mail, Folder, HardDrive, AlertCircle, Sparkles, RefreshCw, Zap
} from 'lucide-react';
import { ChromeProfileInfo } from '../types';

export type ProfileFilterType = 'all' | 'selected' | 'unselected' | 'with_email' | 'local_only' | 'is_open';

interface ProfileSelectorProps {
  profiles: ChromeProfileInfo[];
  selectedProfileIds: string[];
  onToggleProfile: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
  onSelectOnlyWithEmail: () => void;
  onSelectOnlyOpen: () => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  selectedProfileIds,
  onToggleProfile,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onSelectOnlyWithEmail,
  onSelectOnlyOpen
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<ProfileFilterType>('all');

  // Lọc và tìm kiếm Profile
  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return profiles.filter((p) => {
      // 1. Kiểm tra từ khóa tìm kiếm
      const matchSearch = 
        !q ||
        p.displayName.toLowerCase().includes(q) ||
        p.folderName.toLowerCase().includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // 2. Kiểm tra bộ lọc
      const isSelected = selectedProfileIds.includes(p.id);
      switch (filterType) {
        case 'selected':
          return isSelected;
        case 'unselected':
          return !isSelected;
        case 'with_email':
          return !!p.email;
        case 'local_only':
          return !p.email;
        case 'is_open':
          return p.isOpen;
        case 'all':
        default:
          return true;
      }
    });
  }, [profiles, selectedProfileIds, searchQuery, filterType]);

  // Thống kê tổng hợp các Profiles đã chọn
  const selectedProfiles = useMemo(() => {
    return profiles.filter(p => selectedProfileIds.includes(p.id));
  }, [profiles, selectedProfileIds]);

  const totalSelectedCookies = useMemo(() => {
    return selectedProfiles.reduce((acc, p) => {
      const match = p.cookiesEstimated.match(/\d+/);
      return acc + (match ? parseInt(match[0], 10) : 0);
    }, 0);
  }, [selectedProfiles]);

  const totalSelectedExtensions = useMemo(() => {
    return selectedProfiles.reduce((acc, p) => acc + p.extensionsCount, 0);
  }, [selectedProfiles]);

  const isAllSelected = profiles.length > 0 && selectedProfileIds.length === profiles.length;
  const isNoneSelected = selectedProfileIds.length === 0;

  return (
    <div id="profile-selector-container" className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-4">
      {/* 1. Header & Chỉ số đã chọn */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>Chọn Profiles Cần Sao Lưu</span>
                <span className="text-[11px] font-normal text-slate-400">
                  ({selectedProfileIds.length}/{profiles.length} Profiles)
                </span>
              </h3>
              {isAllSelected && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Toàn Bộ
                </span>
              )}
              {!isAllSelected && !isNoneSelected && (
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Tùy Chọn Lọc
                </span>
              )}
              {isNoneSelected && (
                <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Chưa chọn profile
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Chỉ sao lưu những Profile bạn cần thay vì luôn nén toàn bộ dung lượng lớn.
            </p>
          </div>
        </div>

        {/* Badge Tóm tắt tài nguyên đã chọn */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right text-[11px] bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="text-slate-400">
              Ước tính: <span className="text-emerald-400 font-semibold">{totalSelectedCookies.toLocaleString()} cookies</span> • <span className="text-cyan-400 font-semibold">{totalSelectedExtensions} extensions</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Dung lượng ước tính: ~{(selectedProfiles.length * 58.5).toFixed(1)} MB
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thanh Tìm Kiếm (Search Bar) & Bộ Lọc (Filter Chips) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Input Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-profiles"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên profile, email, folder (Default, Profile 1...)"
            className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          {searchQuery && (
            <button
              id="btn-clear-profile-search"
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
              title="Xóa từ khóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Nút lọc (Filter Type Selector) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Lọc:
          </span>

          <button
            id="filter-chip-all"
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Tất cả ({profiles.length})
          </button>

          <button
            id="filter-chip-selected"
            type="button"
            onClick={() => setFilterType('selected')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'selected'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Đang chọn ({selectedProfileIds.length})
          </button>

          <button
            id="filter-chip-with-email"
            type="button"
            onClick={() => setFilterType('with_email')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'with_email'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Có Email ({profiles.filter(p => !!p.email).length})
          </button>

          <button
            id="filter-chip-local"
            type="button"
            onClick={() => setFilterType('local_only')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'local_only'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Cục bộ ({profiles.filter(p => !p.email).length})
          </button>

          <button
            id="filter-chip-is-open"
            type="button"
            onClick={() => setFilterType('is_open')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'is_open'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Đang chạy ({profiles.filter(p => p.isOpen).length})
          </button>
        </div>
      </div>

      {/* 3. Hàng Thao Tác Nhanh (Batch Selection Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="btn-select-all-profiles"
            type="button"
            onClick={onSelectAll}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chọn tất cả</span>
          </button>

          <button
            id="btn-deselect-all-profiles"
            type="button"
            onClick={onDeselectAll}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Square className="w-3.5 h-3.5 text-slate-400" />
            <span>Bỏ chọn tất cả</span>
          </button>

          <button
            id="btn-invert-selection"
            type="button"
            onClick={onInvertSelection}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Đảo chọn</span>
          </button>

          <button
            id="btn-select-only-email"
            type="button"
            onClick={onSelectOnlyWithEmail}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1.5 transition-colors border border-slate-700 hidden sm:flex"
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>Chỉ chọn có Email</span>
          </button>

          <button
            id="btn-select-only-open"
            type="button"
            onClick={onSelectOnlyOpen}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1.5 transition-colors border border-slate-700 hidden sm:flex"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Chỉ chọn đang mở</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          Hiển thị: <strong className="text-slate-200">{filteredProfiles.length}</strong> / {profiles.length} Profiles
        </div>
      </div>

      {/* 4. Danh sách Profiles dạng Cards tương tác với Checkbox */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {filteredProfiles.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center gap-2">
            <Search className="w-8 h-8 text-slate-400" />
            <div className="text-sm font-semibold text-slate-300">Không tìm thấy Profile nào phù hợp</div>
            <p className="text-xs text-slate-400 max-w-sm">
              Không có Profile nào khớp với từ khóa "{searchQuery}" hoặc tiêu chí lọc hiện tại.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700"
            >
              Đặt lại tìm kiếm & bộ lọc
            </button>
          </div>
        ) : (
          filteredProfiles.map((p) => {
            const isSelected = selectedProfileIds.includes(p.id);

            return (
              <div
                key={p.id}
                id={`profile-item-${p.id}`}
                onClick={() => onToggleProfile(p.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-950/90 border-cyan-500/60 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Checkbox + Avatar + Tên Profile */}
                <div className="flex items-center gap-3">
                  {/* Custom Checkbox */}
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                    isSelected 
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-sm' 
                      : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl ${p.avatarColor} text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0`}>
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>

                  {/* Chi tiết tên, email, folder */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {p.displayName}
                      </span>
                      <span className="text-[10px] font-mono font-semibold bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-700">
                        {p.folderName}
                      </span>
                      {p.category && (
                        <span className="text-[10px] font-medium bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded">
                          {p.category}
                        </span>
                      )}
                      {p.isOpen && (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          Đang chạy
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      {p.email ? (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Mail className="w-3 h-3 text-cyan-400" />
                          <span>{p.email}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          <span>Chưa liên kết Google Sync (Cục bộ)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thống kê Cookies, Extensions & Kích thước */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <div className="text-left sm:text-right text-[11px]">
                    <div className="text-emerald-400 font-semibold flex items-center sm:justify-end gap-1">
                      <span>{p.cookiesEstimated}</span>
                    </div>
                    <div className="text-slate-400">
                      {p.extensionsCount} extensions {p.sizeEstimated ? `• ~${p.sizeEstimated}` : ''}
                    </div>
                  </div>

                  {/* Nút toggle trực tiếp */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleProfile(p.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isSelected ? 'Đã chọn ✓' : 'Chọn +'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Cảnh báo an toàn nếu không chọn profile nào */}
      {isNoneSelected && (
        <div className="bg-rose-950/50 border border-rose-500/50 rounded-xl p-3 flex items-center gap-3 text-rose-200 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="flex-1">
            <strong>Chưa có Profile nào được chọn:</strong> Bạn cần chọn ít nhất 1 Profile để thực hiện sao lưu. Nhấp vào <strong>"Chọn tất cả"</strong> ở trên để sao lưu toàn bộ.
          </div>
          <button
            type="button"
            onClick={onSelectAll}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer shadow-sm"
          >
            Chọn tất cả ngay
          </button>
        </div>
      )}
    </div>
  );
};
