import React, { useState } from 'react';
import { 
  Sparkles, FileCode, Play, Copy, Check, Download, 
  Upload, RefreshCw, Zap, Coins, Trophy, Shield, 
  KeyRound, HelpCircle, ArrowRight, CheckCircle2, 
  AlertCircle, Undo, Wand2, Terminal, Code2, Gamepad2,
  HardDrive, Folder, Monitor, Camera
} from 'lucide-react';
import { WebGameConsoleModder } from './WebGameConsoleModder';

interface PresetSample {
  id: string;
  title: string;
  category: 'game_rpg' | 'game_tycoon' | 'cookie' | 'localstorage';
  description: string;
  defaultPrompt: string;
  content: string;
  format: 'json' | 'cookie' | 'text';
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'rpg_save',
    title: '🎮 Save Game RPG Offline (Hiệp Sĩ Phiêu Lưu)',
    category: 'game_rpg',
    description: 'File JSON lưu trạng thái nhân vật: vàng ít, level thấp, cày mãi không qua ải.',
    defaultPrompt: 'Cày lâu quá! Hãy biến tôi thành đại gia: 999,999,999 Vàng, 99,999 Kim Cương, Level 999, máu 99999 và mở khóa tất cả vũ khí huyền thoại!',
    format: 'json',
    content: JSON.stringify({
      game_name: "Shadow Knights Offline",
      player: {
        username: "DragonSlayer99",
        level: 3,
        experience: 450,
        hp: 120,
        max_hp: 120,
        gold: 180,
        gems: 5,
        energy: 15,
        vip: false
      },
      inventory: [
        { id: "wp_01", name: "Gậy Gỗ Cũ", damage: 5, level: 1 },
        { id: "wp_02", name: "Dao Găm Rỉ Sét", damage: 12, level: 1 }
      ],
      unlocked_stages: [1, 2],
      achievements_completed: 1,
      last_saved: "2026-09-08T09:12:00Z"
    }, null, 2)
  },
  {
    id: 'tycoon_save',
    title: '🏰 Save Game Idle Nông Trại / Tycoon',
    category: 'game_tycoon',
    description: 'Dữ liệu tiền tệ game nhàn rỗi: tiền tăng chậm, nhiều nhà máy chưa mở.',
    defaultPrompt: 'Edit cho tôi 9,999,999,999 Tiền Mặt, 50,000 Ruby, nhân tốc độ sản xuất x100 và mở khóa tất cả nhà xưởng!',
    format: 'json',
    content: JSON.stringify({
      game: "Farm & Factory Tycoon",
      version: "1.4.2",
      currency: {
        cash: 1250,
        rubies: 12,
        production_multiplier: 1.0
      },
      stats: {
        factories_owned: 1,
        max_factories: 10,
        auto_collect: false,
        prestige_level: 0
      },
      upgrades: {
        harvester_speed: 1,
        conveyor_belt: 1,
        truck_capacity: 1
      }
    }, null, 2)
  },
  {
    id: 'cookie_session',
    title: '🍪 Chuỗi Cookie Trình Duyệt / Game Web',
    category: 'cookie',
    description: 'Chuỗi Cookie chứa token, điểm số lưu tạm và quyền hạn tài khoản.',
    defaultPrompt: 'Nâng cấp quyền user_role thành "super_admin", tăng điểm token_balance lên 999999 và kéo dài thời hạn cookie tới năm 2035!',
    format: 'cookie',
    content: 'session_id=s%3A7a8f9d0c2e; user_role=free_member; balance_tokens=150; is_vip=0; theme=dark; Max-Age=86400; Path=/; SameSite=Lax'
  }
];

export const CookieFileEditor: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'web_console' | 'file_json'>('web_console');
  const [selectedSample, setSelectedSample] = useState<PresetSample>(PRESET_SAMPLES[0]);
  const [fileContent, setFileContent] = useState<string>(PRESET_SAMPLES[0].content);
  const [userPrompt, setUserPrompt] = useState<string>(PRESET_SAMPLES[0].defaultPrompt);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<{
    explanation: string;
    changes: string[];
    modifiedContent: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualFileName, setManualFileName] = useState<string>('');
  const [manualFileDesc, setManualFileDesc] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; size: string } | null>(null);

  // Thư viện các tệp đã lưu thủ công để lần sau có thể feed lại
  const [manualSavedFiles, setManualSavedFiles] = useState<{
    id: string;
    name: string;
    description: string;
    timestamp: string;
    format: 'json' | 'cookie' | 'text';
    content: string;
    defaultPrompt: string;
  }[]>([
    {
      id: 'm_save_01',
      name: 'ShadowKnights_MaxRich_Vip999.json',
      description: 'Bản save game đã mod 999M vàng, full ngọc và mở khóa nhân vật cấp 999',
      timestamp: 'Hôm nay, 10:15',
      format: 'json',
      defaultPrompt: 'Giữ nguyên 999M vàng và thêm 50 vũ khí thần thoại cấp SSS',
      content: JSON.stringify({
        game_name: "Shadow Knights Offline",
        player: {
          username: "DragonSlayer99",
          level: 999,
          hp: 99999,
          gold: 999999999,
          gems: 99999,
          vip: true
        },
        inventory: [
          { id: "wp_mythic_01", name: "Thánh Kiếm Excalibur", damage: 9999, level: 100 },
          { id: "wp_mythic_02", name: "Cung Thần Apollo", damage: 8500, level: 100 }
        ],
        unlocked_stages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      }, null, 2)
    },
    {
      id: 'm_save_02',
      name: 'Cookie_SuperAdmin_Expires2035.txt',
      description: 'Cookie tài khoản đã mod quyền super_admin và hạn đến 2035',
      timestamp: 'Hôm qua, 16:30',
      format: 'cookie',
      defaultPrompt: 'Tăng hạn cookie thêm 10 năm nữa',
      content: 'session_id=s%3A7a8f9d0c2e; user_role=super_admin; balance_tokens=999999; is_vip=1; theme=dark; Max-Age=315360000; expires=Tue, 19 Jan 2038 03:14:07 GMT; Path=/; SameSite=Lax'
    }
  ]);

  // Phân tích nhanh dữ liệu JSON để hiển thị mini simulator
  let parsedGameData: any = null;
  try {
    parsedGameData = JSON.parse(fileContent);
  } catch {
    // Không phải json hợp lệ
  }

  const handleSelectSample = (sample: PresetSample) => {
    setSelectedSample(sample);
    setFileContent(sample.content);
    setUserPrompt(sample.defaultPrompt);
    setAiResponse(null);
    setErrorMessage(null);
    setUploadedFileInfo(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
    setUploadedFileInfo({ name: file.name, size: sizeStr });

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      setAiResponse(null);
      setErrorMessage(null);
      setUserPrompt('Phân tích file này và tìm các biến tiền tệ, vàng, kim cương, level để tăng lên mức tối đa giúp tôi!');
    };
    reader.readAsText(file);
  };

  // Lưu nội dung hiện tại vào Thư Viện Bản Thủ Công (Manual Archive)
  const handleSaveToManualArchive = () => {
    if (!fileContent.trim()) return;

    const defaultName = selectedSample.format === 'json' ? `SaveGame_Manual_${Date.now().toString().slice(-4)}.json` : `Cookie_Manual_${Date.now().toString().slice(-4)}.txt`;
    const finalName = manualFileName.trim() || defaultName;
    const finalDesc = manualFileDesc.trim() || 'Bản lưu thủ công người dùng tạo';

    const newManualItem = {
      id: 'm_' + Date.now(),
      name: finalName,
      description: finalDesc,
      timestamp: 'Vừa lưu thủ công',
      format: selectedSample.format,
      defaultPrompt: userPrompt,
      content: fileContent
    };

    setManualSavedFiles(prev => [newManualItem, ...prev]);
    setSaveSuccessMsg(`Đã lưu "${finalName}" vào Thư Viện Bản Thủ Công thành công!`);
    setManualFileName('');
    setManualFileDesc('');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Feed lại tệp thủ công vào trình sửa
  const handleFeedManualFileToEditor = (item: typeof manualSavedFiles[0]) => {
    setFileContent(item.content);
    setUserPrompt(item.defaultPrompt || 'Phân tích file và mod thêm các chỉ số theo ý tôi');
    setSelectedSample({
      id: item.id,
      title: item.name,
      category: 'game_rpg',
      description: item.description,
      defaultPrompt: item.defaultPrompt,
      content: item.content,
      format: item.format
    });
    setAiResponse(null);
    setErrorMessage(null);
    setUploadedFileInfo({ name: item.name, size: 'Lấy từ bộ lưu' });
  };

  const handleApplyAiEdit = async () => {
    if (!fileContent.trim()) {
      setErrorMessage('Vui lòng nhập hoặc chọn nội dung file cần chỉnh sửa.');
      return;
    }
    if (!userPrompt.trim()) {
      setErrorMessage('Vui lòng nhập yêu cầu bạn muốn AI sửa gì.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: fileContent,
          prompt: userPrompt,
          fileType: selectedSample.format,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gọi AI.');
      }

      setAiResponse({
        explanation: data.explanation,
        changes: data.changes || [],
        modifiedContent: data.modifiedContent,
      });

      // Tự động cập nhật nội dung sau khi AI sửa
      setFileContent(data.modifiedContent);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Lỗi kết nối tới AI Studio API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = selectedSample.format === 'json' ? 'game_save_rich.json' : 'cookies_modified.txt';
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-200">
      {/* THANH CHUYỂN ĐỔI 2 CHẾ ĐỘ TIỆN ÍCH CHO NGƯỜI DÙNG */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('web_console')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'web_console'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-300" />
            <span>⚡ Web Game: Lệnh Chrome Console (F12) & Soi Màn Hình</span>
            <span className="hidden md:inline-block text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
              1-Click
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('file_json')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'file_json'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md shadow-amber-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>📁 Bỏ File JSON / Save Vào Sửa (Tải File & Feed Manual)</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 px-3">
          {activeSubTab === 'web_console' ? (
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              Chạy trực tiếp trên trình duyệt bằng F12 Console — Không cần tải file!
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-300">
              <HardDrive className="w-3.5 h-3.5" />
              Chỉnh sửa tệp JSON save game offline & xuất file về máy
            </span>
          )}
        </div>
      </div>

      {/* CHẾ ĐỘ 1: WEB GAME CHROME CONSOLE (F12) & SOI MÀN HÌNH */}
      {activeSubTab === 'web_console' && (
        <WebGameConsoleModder />
      )}

      {/* CHẾ ĐỘ 2: SỬA TỆP JSON / SAVE GAME / COOKIES FILE */}
      {activeSubTab === 'file_json' && (
        <>
          {/* Banner Giới Thiệu Tính Năng Edit & AI Modding */}
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered Game & Cookie Modder (Gemini 3.8 Flash)
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Chỉnh Sửa File & Cookies — AI Sửa Giùm: "Cày Lâu? Edit Lên Giàu!"
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Chọn tệp qua hộp thoại đồ họa (chống gõ sai đường dẫn). AI sẽ tự động phân tích biến (vàng, kim cương, level, hạn cookie) và sửa chính xác. Bạn có thể lưu lại bản thủ công để lần sau feed vô lại dễ dàng!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto">
                <label className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md">
                  <Upload className="w-4 h-4" />
                  <span>📁 Chọn Tệp Qua Hộp Thoại...</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" accept=".json,.txt,.cookie,.dat,.sav" />
                </label>
              </div>
            </div>

            {/* Thanh trạng thái tệp đã nạp từ máy */}
            {uploadedFileInfo && (
              <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-amber-500/40 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200">Đã nạp tệp an toàn: </span>
                    <span className="font-mono text-amber-300 font-bold">{uploadedFileInfo.name}</span>
                    <span className="text-slate-400 ml-2">({uploadedFileInfo.size})</span>
                    <span className="ml-2 text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                      ✓ Không cần gõ vị trí - Chống chọn nhầm chỗ
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFileInfo(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

      {/* THƯ VIỆN BẢN LƯU THỦ CÔNG (MANUAL SAVED FILES & FEED-IN HUB) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              Thư Viện Bản Lưu Thủ Công (Lần Sau Feed Vô Lại Trong 1-Click):
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mỗi khi mod xong file save game hoặc cookie, hãy lưu lại. Lần sau chỉ cần bấm "Feed Bản Này" là tự động nạp lại nguyên vẹn!
            </p>
          </div>

          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {manualSavedFiles.length} tệp thủ công đã lưu
          </span>
        </div>

        {/* Danh sách các file manual đã lưu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {manualSavedFiles.map((mFile) => (
            <div
              key={mFile.id}
              className="p-3 bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 rounded-lg flex items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded bg-amber-950/60 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <FileCode className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-200 truncate block">
                      {mFile.name}
                    </span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold shrink-0">
                      MANUAL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {mFile.description}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    {mFile.timestamp}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleFeedManualFileToEditor(mFile)}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1 shadow cursor-pointer"
                  title="Feed tệp này vào trình sửa"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Feed Bản Này</span>
                </button>
                <button
                  onClick={() => setManualSavedFiles(prev => prev.filter(f => f.id !== mFile.id))}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                  title="Xóa khỏi danh sách"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Khung Lưu Bản Hiện Tại Thành File Thủ Công */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={manualFileName}
            onChange={(e) => setManualFileName(e.target.value)}
            placeholder="Đặt tên file manual (VD: SaveGame_MaxGiau_V1.json)..."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
          />
          <input
            type="text"
            value={manualFileDesc}
            onChange={(e) => setManualFileDesc(e.target.value)}
            placeholder="Ghi chú (VD: Bản đã mod 999M vàng và vip)..."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleSaveToManualArchive}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-emerald-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Lưu Vào Thư Viện Manual</span>
          </button>
        </div>

        {saveSuccessMsg && (
          <div className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 p-2 rounded flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Bộ Chọn File Mẫu Sẵn */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            Hoặc Chọn File Mẫu Thử Nghiệm:
          </span>
          <span className="text-[11px] text-slate-500">Bấm để nạp dữ liệu mẫu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_SAMPLES.map(sample => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between gap-2 transition-all ${
                selectedSample.id === sample.id
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-white block">
                  {sample.title}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {sample.description}
                </p>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded w-fit ${
                selectedSample.id === sample.id ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {sample.format.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* KHUNG CHÍNH: KHUNG NHẬP DỮ LIỆU & BẢNG ĐIỀU KHIỂN AI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CỘT TRÁI (7 CỘT): KHUNG SOẠN THẢO CODE / COOKIE FILE */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  Nội Dung Tệp (Save Game / Cookie / JSON)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1.5 transition-colors"
                  title="Sao chép nội dung"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1.5 transition-colors"
                  title="Tải file về máy"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Về</span>
                </button>
              </div>
            </div>

            <textarea
              id="textarea-file-content"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="w-full h-96 p-4 bg-slate-950 font-mono text-xs text-slate-200 focus:outline-none resize-none leading-relaxed border-none selection:bg-amber-500/30"
              placeholder="Dán mã JSON save game, chuỗi Cookie hoặc nội dung file cần chỉnh sửa vào đây..."
            />

            <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Độ dài: {fileContent.length} ký tự</span>
              <span>Định dạng: {selectedSample.format.toUpperCase()}</span>
            </div>
          </div>

          {/* GAME STATS PREVIEW (Nếu là game RPG hoặc Tycoon) */}
          {parsedGameData && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                Live Game Stats Preview (Xem Nhanh Chỉ Số Game Vừa Sửa)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Vàng / Tiền Mặt</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    🪙 {parsedGameData.player?.gold?.toLocaleString() || parsedGameData.currency?.cash?.toLocaleString() || 'N/A'}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Kim Cương / Ngọc</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    💎 {parsedGameData.player?.gems?.toLocaleString() || parsedGameData.currency?.rubies?.toLocaleString() || 'N/A'}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Cấp Độ (Level)</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    ⭐ Lv. {parsedGameData.player?.level || parsedGameData.stats?.factories_owned || 'N/A'}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Trạng Thái VIP</span>
                  <span className="text-sm font-bold text-purple-400 font-mono">
                    👑 {parsedGameData.player?.vip || parsedGameData.stats?.auto_collect ? 'KÍCH HOẠT VIP' : 'Miễn Phí'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI (5 CỘT): KHUNG LỆNH AI VÀ KẾT QUẢ PHÂN TÍCH */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Yêu Cầu AI Chỉnh Sửa Giùm
              </h3>
            </div>

            {/* Ô nhập Prompt cho AI */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">
                Bạn muốn sửa những gì? (Gõ tự nhiên):
              </label>
              <textarea
                id="textarea-ai-prompt"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                placeholder="Ví dụ: Cày lâu quá, sửa cho tôi lên 999 triệu vàng, max level 999, máu 99999..."
              />
            </div>

            {/* Các nút bấm nhanh (Quick Cheat Buttons) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">
                Gợi ý lệnh sửa nhanh 1-Click:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setUserPrompt('Cày lâu quá! Hãy biến tôi thành đại gia: 999,999,999 Vàng, 99,999 Kim Cương, Max Cấp Độ 999!')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] transition-colors"
                >
                  🪙 999 Triệu Vàng & Max Cấp
                </button>
                <button
                  type="button"
                  onClick={() => setUserPrompt('Mở khóa tất cả vật phẩm huyền thoại trong kho đồ inventory và tăng sát thương x100 lần!')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] transition-colors"
                >
                  ⚔️ Full Đồ Huyền Thoại
                </button>
                <button
                  type="button"
                  onClick={() => setUserPrompt('Bật trạng thái VIP vĩnh viễn, mở khóa mọi ải chơi và xóa bỏ giới hạn năng lượng energy!')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-[11px] transition-colors"
                >
                  👑 Mở Khóa VIP & Max Stage
                </button>
                <button
                  type="button"
                  onClick={() => setUserPrompt('Sửa cookie này để kéo dài thời hạn sang năm 2035 và cấp quyền admin vô hạn!')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[11px] transition-colors"
                >
                  ⏳ Cookie Hạn 2035 (Vĩnh Viễn)
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Nút gửi AI thực hiện */}
            <button
              id="btn-trigger-ai-edit"
              onClick={handleApplyAiEdit}
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer ${
                isLoading 
                  ? 'bg-amber-800 opacity-80 cursor-wait' 
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.99] shadow-amber-950'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Đang Phân Tích & Sửa Đổi Biến...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>✨ AI Sửa Giùm Tôi Ngay Lập Tức!</span>
                </>
              )}
            </button>
          </div>

          {/* KẾT QUẢ GIẢI THÍCH CỦA AI */}
          {aiResponse && (
            <div className="bg-emerald-950/30 border border-emerald-700/60 rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  AI Đã Thực Hiện Thành Công
                </h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {aiResponse.explanation}
              </p>

              {aiResponse.changes && aiResponse.changes.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1 border-t border-emerald-800/40 pt-2">
                  <span className="text-[11px] font-semibold text-emerald-400">
                    Chi tiết các biến đã sửa:
                  </span>
                  <ul className="text-xs space-y-1 text-slate-300">
                    {aiResponse.changes.map((ch, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{ch}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-1 pt-2 border-t border-emerald-800/40 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400">✓ Nội dung khung bên trái đã được cập nhật</span>
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Lưu File Sửa Về Máy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )}
</div>
  );
};
