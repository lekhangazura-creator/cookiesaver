import React, { useState } from 'react';
import { 
  Palette, Sun, Moon, Check, Sparkles, Sliders, RotateCcw, 
  X, Eye, ShieldCheck, Zap, Layers, CircleDot, Copy, Download,
  Upload, Dices, CornerDownRight, CheckCheck
} from 'lucide-react';
import { ThemePreset, CustomThemeSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
  customSettings: CustomThemeSettings;
  onUpdateCustomSettings: (settings: CustomThemeSettings) => void;
  onResetDefault: () => void;
}

export const ThemeStudioModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  customSettings,
  onUpdateCustomSettings,
  onResetDefault,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'custom'>('presets');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets: { 
    id: ThemePreset; 
    name: string; 
    desc: string; 
    type: 'dark' | 'light'; 
    bg: string; 
    card: string;
    accent: string; 
    border: string;
    tag?: string;
  }[] = [
    {
      id: 'dark-slate',
      name: 'Dark Slate (Mặc định)',
      desc: 'Nền tối trầm công nghệ, tương phản chuẩn dev, dịu mắt ban đêm',
      type: 'dark',
      bg: '#020617',
      card: '#0f172a',
      accent: '#10b981',
      border: '#1e293b',
      tag: 'Phổ biến'
    },
    {
      id: 'light-titanium',
      name: 'Light Titanium Clean',
      desc: 'Giao diện trắng ngà tinh tế, sắc nét, chuẩn văn phòng & ban ngày',
      type: 'light',
      bg: '#f8fafc',
      card: '#ffffff',
      accent: '#059669',
      border: '#e2e8f0',
      tag: 'Chế độ Sáng'
    },
    {
      id: 'light-nordic',
      name: 'Light Nordic Frost',
      desc: 'Trắng ngọc bích băng tuyết mát lành, độ tương phản cao, phong cách Bắc Âu',
      type: 'light',
      bg: '#f1f5f9',
      card: '#ffffff',
      accent: '#0284c7',
      border: '#cbd5e1',
      tag: 'Mới'
    },
    {
      id: 'cyber-oled',
      name: 'Cyber OLED (Đen Thuần)',
      desc: 'Đen tuyệt đối #000000, tiết kiệm pin tối đa cho màn hình OLED/AMOLED',
      type: 'dark',
      bg: '#000000',
      card: '#09090b',
      accent: '#06b6d4',
      border: '#27272a',
      tag: 'Tiết kiệm pin'
    },
    {
      id: 'emerald',
      name: 'Emerald Cyber Matrix',
      desc: 'Sắc xanh lục bảo thẫm, phong cách hacker an ninh mạng bảo mật cao',
      type: 'dark',
      bg: '#021a12',
      card: '#062b1f',
      accent: '#10b981',
      border: '#0d4633',
      tag: 'Hacker Pro'
    },
    {
      id: 'royal-amethyst',
      name: 'Royal Amethyst (Tím Hoàng Gia)',
      desc: 'Sắc tím bóng đêm huyền bí, sang trọng, mang cảm hứng gaming & crypto',
      type: 'dark',
      bg: '#0c0714',
      card: '#180f28',
      accent: '#a855f7',
      border: '#3b2366',
      tag: 'Sang trọng'
    },
    {
      id: 'sepia',
      name: 'Warm Sunset Coffee',
      desc: 'Tông nâu cà phê ấm cúng, hạn chế ánh sáng xanh, bảo vệ mắt đọc đêm',
      type: 'dark',
      bg: '#171412',
      card: '#24201c',
      accent: '#f59e0b',
      border: '#3b352f',
      tag: 'Bảo vệ mắt'
    },
    {
      id: 'custom',
      name: 'Tự Edit Giao Diện (Studio)',
      desc: 'Tự do pha màu nền, thẻ, màu nhấn Accent, bo góc và hiệu ứng ánh sáng',
      type: customSettings.mode,
      bg: customSettings.bgColor,
      card: customSettings.cardColor,
      accent: customSettings.accentColor,
      border: customSettings.borderColor,
      tag: 'Tùy biến 100%'
    }
  ];

  const accentPalette = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Cyber Cyan', hex: '#06b6d4' },
    { name: 'Sky Blue', hex: '#0284c7' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Amethyst', hex: '#a855f7' },
    { name: 'Crimson Rose', hex: '#f43f5e' },
    { name: 'Sunset Amber', hex: '#f59e0b' },
    { name: 'Lime Glow', hex: '#84cc16' },
    { name: 'Flame Orange', hex: '#ea580c' },
    { name: 'Ruby Red', hex: '#dc2626' }
  ];

  const bgPaletteDark = [
    { name: 'Slate Deep', hex: '#020617', card: '#0f172a', border: '#1e293b' },
    { name: 'Pure OLED', hex: '#000000', card: '#0a0a0a', border: '#27272a' },
    { name: 'Midnight Navy', hex: '#050c1e', card: '#0c1a38', border: '#162b55' },
    { name: 'Zinc Charcoal', hex: '#09090b', card: '#18181b', border: '#27272a' },
    { name: 'Emerald Night', hex: '#021a12', card: '#062b1f', border: '#0d4633' },
    { name: 'Dark Amethyst', hex: '#0c0714', card: '#180f28', border: '#3b2366' },
  ];

  const bgPaletteLight = [
    { name: 'Titanium Ice', hex: '#f8fafc', card: '#ffffff', border: '#e2e8f0' },
    { name: 'Nordic Frost', hex: '#f1f5f9', card: '#ffffff', border: '#cbd5e1' },
    { name: 'Pure White', hex: '#ffffff', card: '#f8fafc', border: '#e5e7eb' },
    { name: 'Warm Cream', hex: '#fafaf9', card: '#ffffff', border: '#e7e5e4' },
    { name: 'Light Mint', hex: '#f0fdf4', card: '#ffffff', border: '#bbf7d0' },
    { name: 'Light Lavender', hex: '#faf5ff', card: '#ffffff', border: '#e9d5ff' },
  ];

  // Random color combination generator
  const handleRandomizeTheme = () => {
    const isDark = Math.random() > 0.35;
    const randomAccent = accentPalette[Math.floor(Math.random() * accentPalette.length)].hex;
    const bgPool = isDark ? bgPaletteDark : bgPaletteLight;
    const randomBg = bgPool[Math.floor(Math.random() * bgPool.length)];
    const radii = ['0px', '4px', '8px', '14px', '22px'] as const;
    const randomRadius = radii[Math.floor(Math.random() * radii.length)];

    onUpdateCustomSettings({
      mode: isDark ? 'dark' : 'light',
      accentColor: randomAccent,
      bgColor: randomBg.hex,
      cardColor: randomBg.card,
      borderColor: randomBg.border,
      textColor: isDark ? '#f8fafc' : '#0f172a',
      borderRadius: randomRadius,
      contrast: 'normal',
      glowEffect: true
    });
    if (currentTheme !== 'custom') {
      onSelectTheme('custom');
    }
  };

  const handleCopyThemeJson = () => {
    const jsonStr = JSON.stringify(customSettings, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  const handleApplyImportedJson = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJsonText);
      if (!parsed.bgColor || !parsed.accentColor || !parsed.cardColor) {
        throw new Error('Cấu hình JSON thiếu các trường bgColor, accentColor, cardColor bắt buộc.');
      }
      onUpdateCustomSettings(parsed);
      onSelectTheme('custom');
      setShowImportModal(false);
      setImportJsonText('');
    } catch (err: any) {
      setImportError(err.message || 'Cú pháp JSON không hợp lệ.');
    }
  };

  return (
    <div 
      id="theme-studio-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="theme-studio-modal"
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Theme Studio & Bộ Chuyển Đổi Giao Diện
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  v5.3.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chuyển nhanh Sáng / Tối, 7 bộ theme cao cấp hoặc tự do tùy chỉnh màu sắc & bo góc
              </p>
            </div>
          </div>
          <button 
            id="btn-close-theme-studio"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              id="tab-theme-presets"
              onClick={() => setActiveSubTab('presets')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'presets'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Giao Diện Tuyển Chọn ({presets.length})</span>
            </button>
            <button
              id="tab-theme-custom"
              onClick={() => {
                setActiveSubTab('custom');
                if (currentTheme !== 'custom') onSelectTheme('custom');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'custom'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tự Edit Tùy Chỉnh (Studio)</span>
            </button>
          </div>

          {/* Nút chuyển nhanh Sáng / Tối trong Modal */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            <button
              id="btn-quick-toggle-light"
              onClick={() => onSelectTheme('light-titanium')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                currentTheme === 'light-titanium' || currentTheme === 'light-nordic'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Chuyển sang Chế độ Sáng"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Chế độ Sáng</span>
            </button>
            <button
              id="btn-quick-toggle-dark"
              onClick={() => onSelectTheme('dark-slate')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                currentTheme === 'dark-slate' || currentTheme === 'cyber-oled'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Chuyển sang Chế độ Tối"
            >
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chế độ Tối</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeSubTab === 'presets' ? (
            /* ==========================================================
               TAB 1: GIAO DIỆN TUYỂN CHỌN (PRESETS)
               ========================================================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Chọn một chủ đề phù hợp với điều kiện ánh sáng và sở thích của bạn:
                </span>
                <span className="text-[11px] text-slate-400">
                  Đang chọn: <strong className="text-emerald-400">{presets.find(p => p.id === currentTheme)?.name || currentTheme}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {presets.map((preset) => {
                  const isSelected = currentTheme === preset.id;
                  return (
                    <div
                      key={preset.id}
                      id={`preset-card-${preset.id}`}
                      onClick={() => {
                        onSelectTheme(preset.id);
                        if (preset.id === 'custom') setActiveSubTab('custom');
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative group select-none ${
                        isSelected
                          ? 'border-emerald-500 bg-slate-800/90 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          {preset.type === 'light' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-emerald-400" />
                          )}
                          <span className="font-bold text-white text-xs sm:text-sm">
                            {preset.name}
                          </span>
                          {preset.tag && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {preset.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {preset.desc}
                        </p>
                      </div>

                      {/* Bảng màu đại diện xem trước */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">Màu:</span>
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: preset.bg }}
                            title={`Nền: ${preset.bg}`}
                          />
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: preset.card }}
                            title={`Thẻ: ${preset.card}`}
                          />
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: preset.accent }}
                            title={`Màu nhấn: ${preset.accent}`}
                          />
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: preset.border }}
                            title={`Viền: ${preset.border}`}
                          />
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {preset.type === 'light' ? 'Light Mode' : 'Dark Mode'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ==========================================================
               TAB 2: TỰ EDIT (CUSTOM STUDIO ĐẦY ĐỦ CÁC MỤC CẦN THIẾT)
               ========================================================== */
            <div className="space-y-5">
              {/* Toolbar tiện ích: Randomize, Copy JSON, Import JSON */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bộ Công Cụ Thiết Kế Custom</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleRandomizeTheme}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                    title="Gợi ý phối màu ngẫu nhiên hài hòa"
                  >
                    <Dices className="w-3.5 h-3.5 text-amber-400" />
                    <span>Phối màu ngẫu nhiên</span>
                  </button>
                  <button
                    onClick={handleCopyThemeJson}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                    title="Sao chép cấu hình JSON để chia sẻ hoặc lưu trữ"
                  >
                    {copiedStatus ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copiedStatus ? 'Đã sao chép!' : 'Xuất JSON'}</span>
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                    title="Dán cấu hình JSON đã có để nạp giao diện"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Nhập JSON</span>
                  </button>
                </div>
              </div>

              {/* MỤC 1: CHẾ ĐỘ NỀN TẢNG (BASE TONE SÁNG / TỐI) */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>1. Chế Độ Nền Tảng (Base Tone Sáng / Tối)</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    {customSettings.mode === 'dark' ? '🌙 Tối (Dark Mode)' : '☀️ Sáng (Light Mode)'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    id="btn-custom-mode-dark"
                    onClick={() => onUpdateCustomSettings({ 
                      ...customSettings, 
                      mode: 'dark',
                      bgColor: '#020617',
                      cardColor: '#0f172a',
                      borderColor: '#1e293b',
                      textColor: '#f8fafc'
                    })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      customSettings.mode === 'dark'
                        ? 'bg-slate-800 text-emerald-400 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20 font-bold'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-emerald-400" />
                    <span>Chế độ Tối (Dark Mode)</span>
                  </button>
                  <button
                    id="btn-custom-mode-light"
                    onClick={() => onUpdateCustomSettings({ 
                      ...customSettings, 
                      mode: 'light',
                      bgColor: '#f8fafc',
                      cardColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      textColor: '#0f172a'
                    })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      customSettings.mode === 'light'
                        ? 'bg-slate-800 text-amber-300 border-amber-500/50 shadow-md ring-1 ring-amber-500/20 font-bold'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Chế độ Sáng (Light Mode)</span>
                  </button>
                </div>
              </div>

              {/* MỤC 2: MÀU NHẤN CHỦ ĐẠO (ACCENT COLOR) */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span>2. Màu Nhấn Chủ Đạo (Accent Brand Color)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Dùng cho nút bấm, viền nổi bật & icon</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: customSettings.accentColor }}
                    />
                    <input
                      id="custom-accent-color-picker"
                      type="color"
                      value={customSettings.accentColor}
                      onChange={(e) => onUpdateCustomSettings({ ...customSettings, accentColor: e.target.value })}
                      className="w-7 h-6 rounded cursor-pointer border-0 bg-transparent"
                      title="Chọn màu nhấn tự do"
                    />
                    <input
                      type="text"
                      value={customSettings.accentColor}
                      onChange={(e) => onUpdateCustomSettings({ ...customSettings, accentColor: e.target.value })}
                      className="w-20 px-2 py-0.5 text-[11px] font-mono rounded bg-slate-900 border border-slate-700 text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {accentPalette.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => onUpdateCustomSettings({ ...customSettings, accentColor: c.hex })}
                      className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                        customSettings.accentColor.toLowerCase() === c.hex.toLowerCase()
                          ? 'border-white bg-slate-800 text-white font-bold shadow-sm'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* MỤC 3: MÀU NỀN CANVAS & MẶT THẺ (CANVAS & SURFACES) */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white">
                    3. Tông Nền & Mặt Thẻ (Canvas & Surface Colors)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Nền:</span>
                      <input
                        id="custom-bg-color-picker"
                        type="color"
                        value={customSettings.bgColor}
                        onChange={(e) => onUpdateCustomSettings({ ...customSettings, bgColor: e.target.value })}
                        className="w-6 h-5 rounded cursor-pointer border-0 bg-transparent"
                        title="Chọn màu nền tự do"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Thẻ:</span>
                      <input
                        id="custom-card-color-picker"
                        type="color"
                        value={customSettings.cardColor}
                        onChange={(e) => onUpdateCustomSettings({ ...customSettings, cardColor: e.target.value })}
                        className="w-6 h-5 rounded cursor-pointer border-0 bg-transparent"
                        title="Chọn màu thẻ tự do"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Viền:</span>
                      <input
                        id="custom-border-color-picker"
                        type="color"
                        value={customSettings.borderColor}
                        onChange={(e) => onUpdateCustomSettings({ ...customSettings, borderColor: e.target.value })}
                        className="w-6 h-5 rounded cursor-pointer border-0 bg-transparent"
                        title="Chọn màu viền tự do"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(customSettings.mode === 'dark' ? bgPaletteDark : bgPaletteLight).map((p) => {
                    const isSelected = customSettings.bgColor.toLowerCase() === p.hex.toLowerCase();
                    return (
                      <button
                        key={p.name}
                        onClick={() => onUpdateCustomSettings({ 
                          ...customSettings, 
                          bgColor: p.hex, 
                          cardColor: p.card,
                          borderColor: p.border
                        })}
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-slate-800 text-white font-bold shadow-sm'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs">{p.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: p.hex }} title="Nền" />
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: p.card }} title="Thẻ" />
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: p.border }} title="Viền" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MỤC 4: ĐỘ BO GÓC (BORDER RADIUS) */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>4. Mức Độ Bo Góc Thẻ & Nút (Border Radius)</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">{customSettings.borderRadius}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {([
                    { rad: '0px', label: 'Vuông vức (0px)' },
                    { rad: '4px', label: 'Sắc sảo (4px)' },
                    { rad: '8px', label: 'Tiêu chuẩn (8px)' },
                    { rad: '14px', label: 'Mềm mại (14px)' },
                    { rad: '22px', label: 'Siêu cong (22px)' }
                  ] as const).map(({ rad, label }) => (
                    <button
                      key={rad}
                      onClick={() => onUpdateCustomSettings({ ...customSettings, borderRadius: rad })}
                      className={`py-2 px-2 text-center text-xs border rounded-lg transition-all cursor-pointer ${
                        customSettings.borderRadius === rad
                          ? 'border-emerald-500 bg-slate-800 text-emerald-300 font-bold shadow-sm'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MỤC 5: HIỆU ỨNG ÁNH SÁNG GLOW & PHẢN CHIẾU */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white block">
                    5. Hiệu Ứng Ánh Sáng Glow (Neon & Ambient Glow)
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Thêm quầng sáng huyền ảo bao quanh các nút bấm và trạng thái kích hoạt
                  </p>
                </div>
                <button
                  onClick={() => onUpdateCustomSettings({ ...customSettings, glowEffect: !customSettings.glowEffect })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    customSettings.glowEffect !== false
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {customSettings.glowEffect !== false ? 'Đang Bật (On)' : 'Đang Tắt (Off)'}
                </button>
              </div>

              {/* MỤC 6: BẢNG XEM TRƯỚC THỜI GIAN THỰC (LIVE PREVIEW TOÀN DIỆN) */}
              <div 
                className="p-5 rounded-2xl border transition-all shadow-xl"
                style={{
                  backgroundColor: customSettings.cardColor,
                  borderColor: customSettings.borderColor,
                  borderRadius: customSettings.borderRadius,
                  color: customSettings.textColor,
                  boxShadow: customSettings.glowEffect !== false ? `0 10px 25px -5px ${customSettings.accentColor}25` : undefined
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" style={{ color: customSettings.accentColor }} />
                    <span className="text-xs font-bold font-mono tracking-wider">
                      BẢNG XEM TRƯỚC THỜI GIAN THỰC (LIVE PREVIEW)
                    </span>
                  </div>
                  <span 
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold"
                    style={{ 
                      backgroundColor: `${customSettings.accentColor}20`, 
                      color: customSettings.accentColor,
                      border: `1px solid ${customSettings.accentColor}40`
                    }}
                  >
                    Custom Studio Active
                  </span>
                </div>

                <p className="text-xs opacity-85 mb-4 leading-relaxed">
                  Đây là mô phỏng giao diện các nút, thẻ và thanh tiến trình theo thông số màu sắc bạn đang tùy chỉnh.
                </p>

                {/* Thanh tiến trình giả lập */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] mb-1 font-mono opacity-80">
                    <span>Thanh Tiến Trình (Progress %):</span>
                    <span>75% Hoàn tất</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${customSettings.borderColor}` }}>
                    <div 
                      className="h-full transition-all duration-300 rounded-full" 
                      style={{ 
                        width: '75%', 
                        backgroundColor: customSettings.accentColor,
                        boxShadow: customSettings.glowEffect !== false ? `0 0 10px ${customSettings.accentColor}` : undefined
                      }} 
                    />
                  </div>
                </div>

                {/* Các nút bấm mô phỏng */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    className="px-4 py-2 text-xs font-bold text-slate-950 shadow-md flex items-center gap-1.5 transition-all"
                    style={{
                      backgroundColor: customSettings.accentColor,
                      borderRadius: customSettings.borderRadius,
                      boxShadow: customSettings.glowEffect !== false ? `0 4px 14px ${customSettings.accentColor}40` : undefined
                    }}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Nút Chính (Primary)</span>
                  </button>

                  <button
                    className="px-3.5 py-2 text-xs font-semibold border opacity-90 transition-all"
                    style={{
                      borderColor: customSettings.borderColor,
                      borderRadius: customSettings.borderRadius
                    }}
                  >
                    Nút Viền Phụ (Secondary)
                  </button>

                  <span 
                    className="px-2.5 py-1 text-[11px] font-mono rounded"
                    style={{
                      backgroundColor: `${customSettings.accentColor}15`,
                      color: customSettings.accentColor,
                      border: `1px solid ${customSettings.accentColor}30`,
                      borderRadius: customSettings.borderRadius
                    }}
                  >
                    Badge Trạng Thái
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70 gap-3">
          <button
            id="btn-reset-default-theme"
            onClick={onResetDefault}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              id="btn-apply-and-close-theme"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Lưu & Áp Dụng Giao Diện</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: NHẬP JSON CẤU HÌNH THEME */}
      {showImportModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Nhập Cấu Hình Theme JSON</span>
              </h3>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Dán đoạn mã JSON chứa cấu hình giao diện đã lưu vào ô bên dưới:
            </p>
            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"mode": "dark", "accentColor": "#10b981", "bgColor": "#020617", ...}'
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            {importError && (
              <p className="text-xs text-red-400 font-semibold">{importError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                Đóng
              </button>
              <button
                onClick={handleApplyImportedJson}
                className="px-4 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
              >
                Áp Dụng JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
