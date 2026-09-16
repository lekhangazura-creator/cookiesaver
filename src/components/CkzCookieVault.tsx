import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import { 
  Shield, Key, Lock, Unlock, Download, Upload, 
  Copy, Check, FileCode, AlertTriangle, CheckCircle2, 
  Search, Eye, EyeOff, Terminal, Sparkles, RefreshCw,
  ExternalLink, Layers, ArrowRight, HardDrive, Info
} from 'lucide-react';
import { 
  ChromeCookieItem, 
  decryptCkz, 
  encryptToCkz, 
  generateConsoleInjectionScript 
} from '../utils/ckzCrypto';
import { 
  EXTENSION_MANIFEST, 
  EXTENSION_POPUP_HTML, 
  EXTENSION_POPUP_JS, 
  EXTENSION_STYLE_CSS 
} from '../data/extensionFiles';

// Sample cookies for testing and demonstration
const SAMPLE_COOKIES: ChromeCookieItem[] = [
  {
    domain: ".google.com",
    name: "SID",
    value: "g.a000nAgA41xY89dM71bZ_SampleGoogleSessionIdToken99",
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "unspecified",
    expirationDate: Math.floor(Date.now() / 1000) + 31536000,
    hostOnly: false,
    session: false
  },
  {
    domain: ".facebook.com",
    name: "c_user",
    value: "100087654321098",
    path: "/",
    secure: true,
    httpOnly: false,
    sameSite: "no_restriction",
    expirationDate: Math.floor(Date.now() / 1000) + 15552000,
    hostOnly: false,
    session: false
  },
  {
    domain: ".facebook.com",
    name: "xs",
    value: "38%3AaBcD1234efgh%3A2%3A1710000000%3A-1%3A1",
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "no_restriction",
    expirationDate: Math.floor(Date.now() / 1000) + 15552000,
    hostOnly: false,
    session: false
  },
  {
    domain: ".shopee.vn",
    name: "SPC_EC",
    value: "qWerTyUiOp1234567890zXcVbNmMkLpQ_ShopeeUserSessionToken",
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expirationDate: Math.floor(Date.now() / 1000) + 7776000,
    hostOnly: false,
    session: false
  }
];

// Pre-encrypted sample .ckz content with password "123456"
const SAMPLE_PRE_ENCRYPTED_CKZ = encryptToCkz(SAMPLE_COOKIES, "123456").ckzContent || "";

interface CkzCookieVaultProps {
  onNotify?: (msg: string) => void;
}

export const CkzCookieVault: React.FC<CkzCookieVaultProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'decrypt' | 'encrypt' | 'extension'>('decrypt');
  
  // Decrypt State
  const [ckzInput, setCkzInput] = useState<string>(SAMPLE_PRE_ENCRYPTED_CKZ);
  const [decryptPassword, setDecryptPassword] = useState<string>('123456');
  const [decryptedCookies, setDecryptedCookies] = useState<ChromeCookieItem[] | null>(SAMPLE_COOKIES);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [revealedValues, setRevealedValues] = useState<Record<string, boolean>>({});
  const [showConsoleScript, setShowConsoleScript] = useState<boolean>(false);
  const [targetDomainForScript, setTargetDomainForScript] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Encrypt State
  const [cookiesJsonInput, setCookiesJsonInput] = useState<string>(JSON.stringify(SAMPLE_COOKIES, null, 2));
  const [encryptPassword, setEncryptPassword] = useState<string>('123456');
  const [encryptConfirmPassword, setEncryptConfirmPassword] = useState<string>('123456');
  const [encryptError, setEncryptError] = useState<string | null>(null);
  const [generatedCkz, setGeneratedCkz] = useState<string | null>(null);

  const notify = (msg: string) => {
    if (onNotify) onNotify(msg);
  };

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    notify(`Đã sao chép ${label}!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle Decrypt Action
  const handleDecrypt = () => {
    setDecryptError(null);
    if (!ckzInput.trim()) {
      setDecryptError('Vui lòng chọn tệp .ckz hoặc dán chuỗi JSON mã hóa.');
      return;
    }
    if (!decryptPassword) {
      setDecryptError('Vui lòng nhập mật khẩu giải mã.');
      return;
    }

    const result = decryptCkz(ckzInput, decryptPassword);
    if (result.success && result.cookies) {
      setDecryptedCookies(result.cookies);
      setDecryptError(null);
      notify(`Giải mã thành công ${result.cookies.length} cookies!`);
    } else {
      setDecryptError(result.error || 'Giải mã thất bại!');
      setDecryptedCookies(null);
    }
  };

  // Handle Upload .ckz File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCkzInput(content);
      notify(`Đã tải lên tệp ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.onerror = () => {
      setDecryptError('Không thể đọc tệp tin đã chọn.');
    };
    reader.readAsText(file);
  };

  // Filtered cookies in inspect view
  const filteredCookies = useMemo(() => {
    if (!decryptedCookies) return [];
    if (!searchQuery.trim()) return decryptedCookies;
    const q = searchQuery.toLowerCase();
    return decryptedCookies.filter(c => 
      c.domain.toLowerCase().includes(q) || 
      c.name.toLowerCase().includes(q) || 
      c.value.toLowerCase().includes(q)
    );
  }, [decryptedCookies, searchQuery]);

  // Unique domains list
  const uniqueDomains = useMemo(() => {
    if (!decryptedCookies) return [];
    const domains = new Set<string>();
    decryptedCookies.forEach(c => {
      const d = c.domain.startsWith('.') ? c.domain.slice(1) : c.domain;
      domains.add(d);
    });
    return Array.from(domains);
  }, [decryptedCookies]);

  // Handle Encrypt & Generate .ckz
  const handleEncrypt = () => {
    setEncryptError(null);
    if (encryptPassword !== encryptConfirmPassword) {
      setEncryptError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (encryptPassword.length < 3) {
      setEncryptError('Mật khẩu phải có ít nhất 3 ký tự.');
      return;
    }

    try {
      const parsed = JSON.parse(cookiesJsonInput);
      if (!Array.isArray(parsed)) {
        setEncryptError('Dữ liệu JSON phải là mảng các Cookies [{ name, value, domain, ... }].');
        return;
      }

      const result = encryptToCkz(parsed as ChromeCookieItem[], encryptPassword);
      if (result.success && result.ckzContent) {
        setGeneratedCkz(result.ckzContent);
        notify('Đã mã hóa và tạo tệp .ckz thành công!');
      } else {
        setEncryptError(result.error || 'Lỗi khi mã hóa.');
      }
    } catch {
      setEncryptError('Định dạng JSON cookies không hợp lệ. Vui lòng kiểm tra cú pháp.');
    }
  };

  // Download .ckz file
  const downloadCkzFile = (content: string, filename?: string) => {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10);
    const timeStr = d.toTimeString().slice(0, 8).replace(/:/g, '-');
    const finalName = filename || `cookies-${dateStr}-${timeStr}.ckz`;

    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify(`Đã tải xuống ${finalName}!`);
  };

  // Download Decrypted JSON
  const downloadDecryptedJson = () => {
    if (!decryptedCookies) return;
    const blob = new Blob([JSON.stringify(decryptedCookies, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookies-decrypted-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('Đã tải xuống file cookies đã giải mã!');
  };

  // Download Chrome Extension ZIP package
  const handleDownloadExtensionZip = async () => {
    try {
      notify('Đang đóng gói tiện ích Chrome Extension .ckz...');
      const zip = new JSZip();

      // Readme instructions
      const readme = `=============================================================================
HƯỚNG DẪN CÀI ĐẶT TIỆN ÍCH CHROME: COOKIES BACKUP & RESTORE (.CKZ)
=============================================================================

1. BẬT CHẾ ĐỘ DEVELOPER MODE TRÊN CHROME:
   - Mở trình duyệt Google Chrome.
   - Truy cập vào địa chỉ: chrome://extensions/ (hoặc vào Menu 3 chấm -> Extensions -> Manage Extensions).
   - Ở góc trên cùng bên phải, BẬT công tắc "Developer mode" (Chế độ dành cho nhà phát triển).

2. NẠP TIỆN ÍCH VÀO CHROME:
   - Nhấn nút "Load unpacked" (Tải tiện ích đã giải nén) ở góc trái.
   - Chọn chính thư mục chứa các file này (thư mục vừa giải nén có file manifest.json).
   - Tiện ích "Cookie Backup and Restore (.ckz)" sẽ xuất hiện ngay lập tức trên thanh công cụ!

3. CÁCH SỬ DỤNG:
   - ĐỂ SAO LƯU: Bấm vào biểu tượng tiện ích -> Nhấn "Backup all cookies" -> Đặt mật khẩu -> File .ckz sẽ được tải về.
   - ĐỂ KHÔI PHỤC: Mở tiện ích -> Chọn file .ckz -> Nhập mật khẩu -> Toàn bộ Cookies sẽ được nạp lại 100%!
`;

      zip.file("manifest.json", EXTENSION_MANIFEST);
      zip.file("popup.html", EXTENSION_POPUP_HTML);
      zip.file("popup.js", EXTENSION_POPUP_JS);
      zip.file("style.css", EXTENSION_STYLE_CSS);
      zip.file("HUONG_DAN_CAI_DAT.txt", readme);

      // Fetch official sjcl.js from CDN or embed minimal sjcl bundle
      const sjclResponse = await fetch('https://cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.8/sjcl.min.js').catch(() => null);
      if (sjclResponse && sjclResponse.ok) {
        const sjclCode = await sjclResponse.text();
        zip.file("sjcl.js", sjclCode);
      } else {
        // Fallback placeholder
        zip.file("sjcl.js", `// SJCL Crypto Bundle\n// Loaded from https://cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.8/sjcl.min.js`);
      }

      // Add icons directory
      const iconsFolder = zip.folder("icons");
      if (iconsFolder) {
        // Try fetching uploaded icon assets or create standard png references
        const iconBlob = await fetch('/icons/48.png').then(r => r.blob()).catch(() => null);
        if (iconBlob) {
          iconsFolder.file("16.png", iconBlob);
          iconsFolder.file("48.png", iconBlob);
          iconsFolder.file("128.png", iconBlob);
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Chrome_Cookie_Backup_Restore_Extension_CKZ.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify('Đã tải xuống gói Extension Chrome (.zip) thành công!');
    } catch (err) {
      console.error(err);
      notify('Lỗi khi đóng gói tiện ích.');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-300">
      {/* Banner giới thiệu định dạng .CKZ */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/30 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Chuẩn Mã Hóa Cookies .CKZ (SJCL AES-256 CCM)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Cookie Vault: Trích Xuất, Giải Mã & Phục Hồi File <code className="text-emerald-400">.ckz</code>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Khắc phục triệt để nhược điểm của việc sao lưu tệp SQLite trực tiếp (vốn bị khóa bởi DPAPI Windows hoặc App-Bound Encryption khiến Chrome reset về Guest). Định dạng <strong>.ckz</strong> trích xuất Cookies đã giải mã qua Chrome Extension API và bảo vệ bằng mật khẩu riêng của bạn — <strong>chuyển sang mọi máy tính, profile khác hay cài lại Win vẫn đăng nhập 100%!</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={handleDownloadExtensionZip}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Tải Extension Chrome (.zip)
            </button>
            <button
              onClick={() => setActiveTab('extension')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              Xem Hướng Dẫn Cài Đặt
            </button>
          </div>
        </div>
      </div>

      {/* Tabs chuyển đổi chức năng */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl max-w-xl">
        <button
          onClick={() => setActiveTab('decrypt')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'decrypt'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Unlock className="w-4 h-4" />
          Giải Mã & Xem .ckz
        </button>

        <button
          onClick={() => setActiveTab('encrypt')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'encrypt'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Lock className="w-4 h-4" />
          Tạo File .ckz Mới
        </button>

        <button
          onClick={() => setActiveTab('extension')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'extension'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          Bộ Cài Tiện Ích Chrome
        </button>
      </div>

      {/* ===================== TAB 1: GIẢI MÃ & XEM FILE .CKZ ===================== */}
      {activeTab === 'decrypt' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái: Nhập tệp .ckz và Mật khẩu */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  Nạp Dữ Liệu Tệp .ckz
                </h3>
                <label className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5 cursor-pointer bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Chọn tệp .ckz từ máy
                  <input
                    type="file"
                    accept=".ckz,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">
                  Nội dung chuỗi mã hóa SJCL (.ckz):
                </label>
                <textarea
                  value={ckzInput}
                  onChange={(e) => setCkzInput(e.target.value)}
                  rows={7}
                  placeholder='{"iv":"...","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"...","ct":"..."}'
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">
                  Mật khẩu giải mã (Decryption Password):
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={decryptPassword}
                    onChange={(e) => setDecryptPassword(e.target.value)}
                    placeholder="Nhập mật khẩu đã đặt khi backup"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * Gợi ý: File mẫu bên trên dùng mật khẩu thử nghiệm: <code className="text-amber-400">123456</code>
                </p>
              </div>

              {decryptError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{decryptError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDecrypt}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  Giải Mã Cookies Ngay
                </button>
                <button
                  onClick={() => {
                    setCkzInput(SAMPLE_PRE_ENCRYPTED_CKZ);
                    setDecryptPassword('123456');
                    setDecryptError(null);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Tải lại dữ liệu mẫu"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Mẫu
                </button>
              </div>
            </div>

            {/* Cột phải: Thống kê và Bảng Cookies đã giải mã */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Danh Sách Cookies Đã Giải Mã
                  </h3>
                  <p className="text-xs text-slate-400">
                    {decryptedCookies ? `Đã nạp ${decryptedCookies.length} cookies từ ${uniqueDomains.length} trang web` : 'Chưa có dữ liệu'}
                  </p>
                </div>

                {decryptedCookies && decryptedCookies.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadDecryptedJson}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Xuất JSON
                    </button>
                    <button
                      onClick={() => setShowConsoleScript(!showConsoleScript)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        showConsoleScript
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      Script F12 Console
                    </button>
                  </div>
                )}
              </div>

              {/* Hộp tạo Script Console F12 để nạp trực tiếp */}
              {showConsoleScript && decryptedCookies && (
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4" />
                      Đoạn Mã JavaScript Tự Động Nạp Cookie Vào Trình Duyệt (F12)
                    </span>
                    <button
                      onClick={() => copyToClipboard(
                        generateConsoleInjectionScript(decryptedCookies, targetDomainForScript),
                        'console_code',
                        'Mã Script Console'
                      )}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'console_code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'console_code' ? 'Đã sao chép' : 'Sao chép mã'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Lọc nạp cho domain:</span>
                    <select
                      value={targetDomainForScript}
                      onChange={(e) => setTargetDomainForScript(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value="">Tất cả các domain</option>
                      {uniqueDomains.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <pre className="bg-slate-900/90 p-3 rounded-lg text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto border border-slate-800">
                    {generateConsoleInjectionScript(decryptedCookies, targetDomainForScript)}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    💡 <strong>Cách dùng:</strong> Mở trang web (ví dụ facebook.com) &rarr; Nhấn <strong>F12</strong> &rarr; Chọn tab <strong>Console</strong> &rarr; Dán đoạn mã này vào &rarr; Nhấn <strong>Enter</strong> rồi F5 lại trang!
                  </p>
                </div>
              )}

              {/* Thanh tìm kiếm domain */}
              {decryptedCookies && decryptedCookies.length > 0 && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên domain (google, facebook, shopee...) hoặc tên cookie..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              )}

              {/* Bảng hiển thị danh sách Cookies */}
              {decryptedCookies && decryptedCookies.length > 0 ? (
                <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950/80 sticky top-0 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Domain</th>
                        <th className="p-2.5">Tên Cookie</th>
                        <th className="p-2.5">Giá Trị (Token)</th>
                        <th className="p-2.5">Bảo Mật</th>
                        <th className="p-2.5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {filteredCookies.map((cookie, idx) => {
                        const rowKey = `${cookie.domain}_${cookie.name}_${idx}`;
                        const isRevealed = revealedValues[rowKey];
                        const isExpired = cookie.expirationDate && (cookie.expirationDate * 1000 < Date.now());

                        return (
                          <tr key={rowKey} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-2.5 text-emerald-400 font-medium">
                              {cookie.domain}
                            </td>
                            <td className="p-2.5 text-white font-semibold">
                              {cookie.name}
                            </td>
                            <td className="p-2.5 max-w-[200px] truncate text-slate-400">
                              {isRevealed ? cookie.value : '••••••••••••••••••••••••'}
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                {cookie.secure && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-sans">
                                    HTTPS
                                  </span>
                                )}
                                {cookie.httpOnly && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-sans">
                                    HttpOnly
                                  </span>
                                )}
                                {isExpired && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-sans">
                                    Hết hạn
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setRevealedValues(prev => ({ ...prev, [rowKey]: !prev[rowKey] }))}
                                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title={isRevealed ? "Ẩn giá trị" : "Hiện giá trị"}
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(cookie.value, rowKey, `cookie ${cookie.name}`)}
                                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title="Sao chép giá trị"
                                >
                                  {copiedKey === rowKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Shield className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs">Chưa có dữ liệu cookies nào được giải mã.</p>
                  <p className="text-[11px] text-slate-600">Nhập chuỗi .ckz và mật khẩu ở cột bên trái rồi nhấn "Giải Mã Cookies Ngay".</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: TẠO TỆP .CKZ MỚI ===================== */}
      {activeTab === 'encrypt' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                Đóng Gói & Mã Hóa Danh Sách Cookies Sang Tệp .ckz
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chuẩn AES-256 CCM, tương thích 100% với tiện ích Cookie Backup and Restore trên Chrome Web Store
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-medium">
                    Dữ liệu Cookies (Định dạng JSON):
                  </label>
                  <button
                    onClick={() => setCookiesJsonInput(JSON.stringify(SAMPLE_COOKIES, null, 2))}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Dán dữ liệu mẫu
                  </button>
                </div>
                <textarea
                  value={cookiesJsonInput}
                  onChange={(e) => setCookiesJsonInput(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">
                    Mật khẩu mã hóa:
                  </label>
                  <input
                    type="password"
                    value={encryptPassword}
                    onChange={(e) => setEncryptPassword(e.target.value)}
                    placeholder="Tối thiểu 3 ký tự"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">
                    Xác nhận mật khẩu:
                  </label>
                  <input
                    type="password"
                    value={encryptConfirmPassword}
                    onChange={(e) => setEncryptConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {encryptError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{encryptError}</span>
                </div>
              )}

              <button
                onClick={handleEncrypt}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Mã Hóa & Tạo Tệp .ckz Ngay
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Kết Quả Tệp .ckz Đã Tạo
              </h4>

              {generatedCkz ? (
                <div className="flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-300">
                      Tệp .ckz đã được mã hóa bằng thuật toán <strong>AES-256 CCM (PBKDF2 10,000 vòng lặp)</strong>. Bạn có thể tải tệp này về hoặc sao chép để khôi phục trên bất kỳ trình duyệt Chrome nào!
                    </p>
                    <textarea
                      readOnly
                      value={generatedCkz}
                      rows={8}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-300 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadCkzFile(generatedCkz)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Tải Xuống Tệp .ckz
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedCkz, 'generated_ckz', 'chuỗi mã hóa .ckz')}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'generated_ckz' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Sao Chép
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-12">
                  <Lock className="w-12 h-12 mb-2 opacity-30 text-emerald-500" />
                  <p className="text-xs">Chưa có tệp .ckz nào được tạo.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Nhập dữ liệu Cookies và mật khẩu ở bên trái rồi nhấn "Mã Hóa & Tạo Tệp .ckz Ngay".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: BỘ CÀI EXTENSION & HƯỚNG DẪN ===================== */}
      {activeTab === 'extension' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Cài Đặt Tiện Ích Chrome "Cookie Backup and Restore (.ckz)"
                </h3>
                <p className="text-xs text-slate-400">
                  Dành cho máy tính cần sao lưu hoặc khôi phục trực tiếp trên giao diện trình duyệt mà không cần cài Python
                </p>
              </div>

              <button
                onClick={handleDownloadExtensionZip}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                Tải Trọn Bộ Extension (.zip)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                  1
                </div>
                <h4 className="font-semibold text-white">Mở trang Extensions</h4>
                <p className="text-slate-400 leading-relaxed">
                  Mở Google Chrome, gõ <code className="text-emerald-300 font-mono">chrome://extensions/</code> vào thanh địa chỉ rồi nhấn Enter.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                  2
                </div>
                <h4 className="font-semibold text-white">Bật Developer Mode</h4>
                <p className="text-slate-400 leading-relaxed">
                  Ở góc trên cùng bên phải, gạt công tắc <strong>Developer mode (Chế độ dành cho nhà phát triển)</strong> sang trạng thái BẬT.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                  3
                </div>
                <h4 className="font-semibold text-white">Nhấn "Load unpacked"</h4>
                <p className="text-slate-400 leading-relaxed">
                  Bấm nút <strong>Load unpacked (Tải tiện ích đã giải nén)</strong> và trỏ vào thư mục vừa giải nén từ file zip. Tiện ích sẽ sẵn sàng dùng ngay!
                </p>
              </div>
            </div>

            {/* So sánh cơ chế SQLite Copy vs .CKZ */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Info className="w-4 h-4 text-blue-400" />
                So Sánh: Sao Lưu Thư Mục User Data vs Định Dạng .ckz
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-amber-400 block">
                    📁 Sao Lưu Thư Mục Chrome User Data (Tool Python / Batch):
                  </span>
                  <ul className="text-slate-400 space-y-1 list-disc list-inside">
                    <li>Lưu cả cấu trúc Profiles, Bookmarks, Lịch sử, Tabs đang mở.</li>
                    <li>Nhanh 1-click tự động khôi phục trên chính máy tính đó.</li>
                    <li>Phụ thuộc vào DPAPI Windows & tính năng Clean Exit (đã được công cụ giải quyết).</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-emerald-400 block">
                    🍪 Định Dạng .ckz (Chrome Extension API + SJCL AES-256):
                  </span>
                  <ul className="text-slate-400 space-y-1 list-disc list-inside">
                    <li>Trích xuất Cookies đã giải mã trực tiếp từ bộ nhớ RAM Chrome.</li>
                    <li><strong>Bất tử 100% qua mọi máy tính</strong>, kể cả chuyển từ Windows sang Mac/Linux.</li>
                    <li>Không bao giờ lo bị văng tài khoản hay rơi vào trạng thái Guest Mode!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
