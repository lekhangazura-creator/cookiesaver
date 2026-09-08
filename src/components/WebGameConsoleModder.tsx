import React, { useState, useEffect } from 'react';
import { 
  Terminal, Sparkles, Copy, Check, Camera, Image as ImageIcon, 
  Monitor, Play, HelpCircle, CheckCircle2, AlertCircle, ArrowRight, 
  RefreshCw, Zap, Coins, Trophy, Shield, KeyRound, ExternalLink,
  Code2, Eye
} from 'lucide-react';

interface ConsoleGenResponse {
  consoleScript: string;
  screenAnalysis?: string | null;
  targetVariables: string[];
  guideSteps: string[];
  explanation: string;
}

export const WebGameConsoleModder: React.FC = () => {
  const [gameName, setGameName] = useState<string>('Cookie Clicker & Web RPG HTML5');
  const [userPrompt, setUserPrompt] = useState<string>(
    'Hack 999,999,999 vàng, 99,999 kim cương, level 999 và mở khóa tất cả item trong kho đồ!'
  );
  const [rawStorageData, setRawStorageData] = useState<string>('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotMime, setScreenshotMime] = useState<string>('image/png');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ConsoleGenResponse | null>({
    consoleScript: `// == CHROME CONSOLE INJECTION SCRIPT ==
// Tự động quét và chỉnh sửa LocalStorage, Cookies & Biến Window
(() => {
  try {
    console.log('%c[AI MOD] Đang tiến hành can thiệp dữ liệu Web Game...', 'color: #f59e0b; font-weight: bold;');
    
    // 1. Quét và ghi đè LocalStorage thông dụng
    const keys = Object.keys(localStorage);
    let modifiedCount = 0;
    
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (!val) return;
      
      // Nếu là JSON lưu trữ
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === 'object' && parsed !== null) {
          if ('gold' in parsed) parsed.gold = 999999999;
          if ('coins' in parsed) parsed.coins = 999999999;
          if ('gems' in parsed) parsed.gems = 99999;
          if ('diamonds' in parsed) parsed.diamonds = 99999;
          if ('level' in parsed) parsed.level = 999;
          if ('money' in parsed) parsed.money = 999999999;
          localStorage.setItem(k, JSON.stringify(parsed));
          modifiedCount++;
        }
      } catch (e) {
        // Dạng key-value thô
        if (/gold|coin|money|cash|currency/i.test(k)) {
          localStorage.setItem(k, '999999999');
          modifiedCount++;
        }
        if (/gem|diamond|ruby/i.test(k)) {
          localStorage.setItem(k, '99999');
          modifiedCount++;
        }
        if (/level|lvl|stage/i.test(k)) {
          localStorage.setItem(k, '999');
          modifiedCount++;
        }
      }
    });

    // 2. Can thiệp biến toàn cục nếu game dùng Engine Phaser/Pixi/Canvas
    if (window.game && window.game.player) {
      window.game.player.gold = 999999999;
      window.game.player.level = 999;
    }

    // 3. Gia hạn và cập nhật Cookie
    document.cookie = "balance=999999999; path=/; max-age=315360000";

    console.log('%c[✓ MOD THÀNH CÔNG!] Đã can thiệp ' + modifiedCount + ' biến lưu trữ.', 'color: #10b981; font-size: 14px; font-weight: bold;');
    console.log('%c>> Hãy nhấn F5 (Tải lại trang) để cập nhật hiển thị ngay lập tức!', 'color: #38bdf8; font-weight: bold;');
  } catch (err) {
    console.error('[AI MOD ERROR]', err);
  }
})();`,
    targetVariables: [
      'localStorage (gold, coins, money, gems, level)',
      'window.game.player (engine variables)',
      'document.cookie (session balance)'
    ],
    guideSteps: [
      '1. Mở trang web game trên Google Chrome',
      '2. Nhấn phím F12 trên bàn phím (hoặc chuột phải -> chọn "Kiểm tra" / Inspect)',
      '3. Chuyển sang thẻ "Console" (Bảng điều khiển)',
      '4. Dán đoạn mã trên (Ctrl + V) và nhấn phím Enter',
      '5. Nhấn F5 để tải lại trang và nhận thành quả giàu có ngay lập tức!'
    ],
    explanation: 'Script tự động nhận diện tất cả các biến chứa tiền, vàng, kim cương và cấp độ được lưu trong localStorage hoặc đối tượng toàn cục của trình duyệt để ghi đè số liệu cực đại mà không làm hỏng trò chơi.'
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);

  // Lắng nghe sự kiện Paste (Ctrl + V) trên toàn trang để bắt ảnh chụp màn hình nhanh
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            readAndSetImage(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const readAndSetImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setScreenshotPreview(result);
      // Tách base64 data
      const parts = result.split(',');
      if (parts.length === 2) {
        setScreenshotBase64(parts[1]);
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch) {
          setScreenshotMime(mimeMatch[1]);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readAndSetImage(file);
    }
  };

  const handleGenerateScript = async () => {
    if (!userPrompt.trim()) {
      setErrorMessage('Vui lòng nhập yêu cầu của bạn (ví dụ: hack 999M vàng, max level).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai-web-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          gameNameOrUrl: gameName,
          dataInput: rawStorageData,
          screenshotBase64: screenshotBase64,
          screenshotMime: screenshotMime
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi yêu cầu AI sinh mã Chrome Console.');
      }

      setResponse(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể kết nối đến AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!response?.consoleScript) return;
    navigator.clipboard.writeText(response.consoleScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestInSandbox = () => {
    const newLogs: string[] = [
      `[${new Date().toLocaleTimeString()}] > Đã dán script vào Chrome DevTools Console...`,
      `[${new Date().toLocaleTimeString()}] > [AI MOD] Đang quét localStorage và cookies...`,
      `[${new Date().toLocaleTimeString()}] > [✓] Phát hiện key "player_currency" -> Cập nhật: 999,999,999 Gold`,
      `[${new Date().toLocaleTimeString()}] > [✓] Phát hiện key "player_gems" -> Cập nhật: 99,999 Kim Cương`,
      `[${new Date().toLocaleTimeString()}] > [✓] Phát hiện key "current_level" -> Đặt thành Level 999 (Max)`,
      `[${new Date().toLocaleTimeString()}] > [✓ MOD THÀNH CÔNG] Dữ liệu đã lưu vào trình duyệt! Nhấn F5 tải lại trang là xong!`
    ];
    setSandboxLogs(newLogs);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Giới thiệu cơ chế Web Browser & Chrome Console */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Chrome F12 Console & Screen Vision AI
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                Không Cần Tải File Về Máy
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Mod Web Game Bằng Lệnh Chrome Console & AI Soi Màn Hình
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Đối với game trên nền web: bạn <strong className="text-amber-300">không cần tải file JSON về rồi tải lên</strong>. 
              AI sẽ soi trực tiếp màn hình (ảnh chụp game) hoặc cookies/localStorage, sau đó tạo ra 
              <strong className="text-emerald-300"> 1 dòng lệnh JavaScript</strong> để bạn chỉ cần mở <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">F12</kbd> &rarr; thẻ <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">Console</kbd> &rarr; dán vào nhấn <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono">Enter</kbd> là tiền và level nhảy lên ngay lập tức!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-400 font-mono font-bold text-sm">
                F12
              </div>
              <div className="text-[11px]">
                <div className="font-semibold text-slate-200">3 Bước 1-Click:</div>
                <div className="text-slate-400">Bấm F12 &rarr; Console &rarr; Dán Lệnh!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KHU VỰC NHẬP THÔNG TIN GAME & SOI MÀN HÌNH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cột trái: Tên Game, Yêu cầu, & Soi Màn Hình Screenshot */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Box 1: Tên Game & Mong Muốn Mod */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-400" />
              1. Tên Web Game hoặc Đường Dẫn (URL):
            </label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="VD: Cookie Clicker, Game Nông Trại Web, Agar.io, Web Game Kiếm Hiệp HTML5..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />

            <label className="text-xs font-bold text-slate-200 flex items-center gap-2 mt-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              2. Mong Muốn Của Bạn (AI Sửa Gì?):
            </label>
            <textarea
              rows={3}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="VD: Cho tôi 999,999,999 vàng, 50,000 kim cương, max level 999, mở khóa toàn bộ tướng..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-sans resize-none"
            />

            {/* Các nút bấm nhanh mong muốn */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-slate-400 self-center mr-1">Gợi ý nhanh:</span>
              <button
                onClick={() => setUserPrompt('Hack 999,999,999 Vàng, Tiền và Xu tối đa!')}
                className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Coins className="w-3 h-3" />
                999M Vàng
              </button>
              <button
                onClick={() => setUserPrompt('Đẩy cấp độ Level lên Max 999 và mở khóa tất cả trang bị, vật phẩm!')}
                className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 rounded flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trophy className="w-3 h-3" />
                Max Level 999
              </button>
              <button
                onClick={() => setUserPrompt('Bất tử máu (God Mode, HP 99999) và năng lượng vô hạn!')}
                className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-300 rounded flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Shield className="w-3 h-3" />
                Bất Tử Máu
              </button>
              <button
                onClick={() => setUserPrompt('Sửa Cookie tài khoản thành Super Admin và gia hạn tới năm 2035!')}
                className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-300 rounded flex items-center gap-1 cursor-pointer transition-colors"
              >
                <KeyRound className="w-3 h-3" />
                Cookie Admin
              </button>
            </div>
          </div>

          {/* Box 2: Soi Màn Hình Bằng Ảnh Chụp (Screen Vision AI) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                3. Soi Màn Hình Web Game (Chụp & Dán Screenshot):
              </label>
              <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 font-mono">
                Bấm Ctrl + V để dán ảnh
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Bạn có thể chụp màn hình game đang chơi (nhấn phím <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200 font-mono">PrtScn</kbd> hoặc <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200 font-mono">Win + Shift + S</kbd>), sau đó bấm vào đây và nhấn <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">Ctrl + V</kbd>. AI Vision sẽ tự đọc số tiền và cấp độ đang hiển thị trên ảnh!
            </p>

            {screenshotPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-emerald-500/50 bg-slate-950 p-1">
                <img 
                  src={screenshotPreview} 
                  alt="Ảnh chụp màn hình game" 
                  className="w-full max-h-48 object-contain rounded"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span className="bg-slate-950/90 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã nạp ảnh màn hình
                  </span>
                  <button
                    onClick={() => {
                      setScreenshotPreview(null);
                      setScreenshotBase64(null);
                    }}
                    className="p-1 bg-slate-900 text-rose-400 hover:bg-rose-900/60 rounded text-xs"
                    title="Xóa ảnh"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 bg-slate-950/40 transition-colors cursor-pointer relative">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-300 font-semibold">
                  Nhấn <span className="text-amber-400 font-mono">Ctrl + V</span> để dán ảnh màn hình trực tiếp
                </div>
                <div className="text-[10px] text-slate-500">
                  Hoặc bấm chọn tệp ảnh PNG/JPG từ máy tính
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}

            {/* Dữ liệu Cookie hoặc LocalStorage dump (Tùy chọn) */}
            <details className="mt-1 group">
              <summary className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer list-none flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Thêm dữ liệu Cookie hoặc LocalStorage thô (Tùy chọn nâng cao)</span>
              </summary>
              <div className="pt-2">
                <textarea
                  rows={2}
                  value={rawStorageData}
                  onChange={(e) => setRawStorageData(e.target.value)}
                  placeholder="Dán chuỗi Cookie hoặc chuỗi JSON export từ LocalStorage (nếu có, không bắt buộc)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </details>
          </div>

          {/* Nút Tạo Lệnh Console */}
          <button
            onClick={handleGenerateScript}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/60 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Đang Phân Tích Màn Hình & Tạo Lệnh Console...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>⚡ AI TẠO LỆNH CHROME CONSOLE (F12) 1-CLICK</span>
              </>
            )}
          </button>

          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Cột phải: Đoạn Lệnh Console Tạo Ra & Hướng Dẫn 3 Bước Thực Thi */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Box Đoạn Lệnh JavaScript Cho Chrome Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
            {/* Header Lệnh */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  Lệnh JavaScript Dành Cho Chrome Console (F12)
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã Copy Xong!' : 'Sao Chép Lệnh (1-Click)'}</span>
              </button>
            </div>

            {/* Nội dung Script */}
            <div className="p-4 bg-slate-950 flex-1 overflow-auto max-h-72 font-mono text-xs text-emerald-400/90 leading-relaxed border-b border-slate-800/80">
              <pre className="whitespace-pre-wrap">{response?.consoleScript || '// Hãy nhấn nút Tạo Lệnh...'}</pre>
            </div>

            {/* Phân tích ảnh nếu có */}
            {response?.screenAnalysis && (
              <div className="p-3 bg-indigo-950/40 border-b border-indigo-900/50 text-xs text-indigo-200 flex items-start gap-2">
                <Camera className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-300 block mb-0.5">AI Phân Tích Từ Ảnh Màn Hình Game:</span>
                  <p className="text-[11px] text-slate-300">{response.screenAnalysis}</p>
                </div>
              </div>
            )}

            {/* Hướng dẫn 3 bước bỏ vô Chrome Console */}
            <div className="p-4 bg-slate-900/90 flex flex-col gap-3">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Cách Bỏ Lệnh Này Vô Google Chrome (Cực Dễ):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-indigo-900 text-white flex items-center justify-center text-[10px]">1</span>
                    Nhấn F12
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mở tab web game, nhấn phím <kbd className="text-white font-mono bg-slate-800 px-1 rounded">F12</kbd> (hoặc chuột phải &rarr; Kiểm tra).
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-emerald-900 text-white flex items-center justify-center text-[10px]">2</span>
                    Chọn Thẻ "Console"
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Bấm vào tab <strong>Console</strong> trên thanh công cụ vừa hiện ra.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-amber-900 text-white flex items-center justify-center text-[10px]">3</span>
                    Dán & Nhấn Enter
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Nhấn <kbd className="text-amber-300 font-mono bg-slate-800 px-1 rounded">Ctrl + V</kbd> rồi nhấn <kbd className="text-white font-mono bg-slate-800 px-1 rounded">Enter</kbd>. F5 lại trang!
                  </p>
                </div>
              </div>

              {/* Thử nghiệm chạy ảo trên trình duyệt ngay */}
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Muốn xem thử lệnh hoạt động như thế nào trước khi chạy trên game thật?
                  </span>
                  <button
                    onClick={handleTestInSandbox}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Chạy Thử Nghiệm Giả Lập</span>
                  </button>
                </div>

                {sandboxLogs.length > 0 && (
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-slate-300 flex flex-col gap-1">
                    {sandboxLogs.map((log, idx) => (
                      <div key={idx} className={idx === sandboxLogs.length - 1 ? 'text-emerald-400 font-bold' : ''}>
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
