/**
 * Utility for .ckz (Cookie Backup and Restore) format using SJCL (Stanford Javascript Crypto Library)
 * Compatible with the Chrome extension "Cookie Backup and Restore" (candh/cookies-backup-chrome)
 */
import sjcl from 'sjcl';

export interface ChromeCookieItem {
  domain: string;
  expirationDate?: number;
  hostOnly?: boolean;
  httpOnly?: boolean;
  name: string;
  path: string;
  sameSite?: string;
  secure?: boolean;
  session?: boolean;
  storeId?: string;
  value: string;
  [key: string]: unknown;
}

export interface CkzMetadata {
  cipher: string;
  iter: number;
  ks: number;
  mode: string;
  ts: number;
  v: number;
}

/**
 * Decrypts a .ckz file content (or JSON text) with a password
 */
export function decryptCkz(ckzContent: string, password: string): { success: boolean; cookies?: ChromeCookieItem[]; error?: string } {
  try {
    const trimmed = ckzContent.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
      return { success: false, error: 'Định dạng không hợp lệ: Tệp .ckz phải là chuỗi JSON mã hóa của SJCL.' };
    }

    // sjcl.decrypt accepts password and the JSON string representation
    const decryptedJson = (sjcl.decrypt as (pwd: string, data: string) => string)(password, trimmed);
    const parsed = JSON.parse(decryptedJson);

    if (!Array.isArray(parsed)) {
      return { success: false, error: 'Dữ liệu giải mã thành công nhưng không phải là danh sách Cookies hợp lệ.' };
    }

    return {
      success: true,
      cookies: parsed as ChromeCookieItem[]
    };
  } catch (err: unknown) {
    const errMsg = (err instanceof Error) ? err.message : String(err);
    if (errMsg.toLowerCase().includes('corrupt') || errMsg.toLowerCase().includes('tag') || errMsg.toLowerCase().includes('ccm')) {
      return { success: false, error: 'Mật khẩu không đúng! Hãy kiểm tra lại mật khẩu giải mã.' };
    } else if (errMsg.toLowerCase().includes('invalid') || errMsg.toLowerCase().includes('json')) {
      return { success: false, error: 'Tệp không phải là định dạng .ckz hợp lệ.' };
    }
    return { success: false, error: `Lỗi giải mã: ${errMsg}` };
  }
}

/**
 * Encrypts an array of Chrome cookies into a .ckz format (SJCL AES-256 CCM)
 */
export function encryptToCkz(cookies: ChromeCookieItem[], password: string): { success: boolean; ckzContent?: string; error?: string } {
  try {
    if (!password || password.length < 3) {
      return { success: false, error: 'Mật khẩu phải có ít nhất 3 ký tự.' };
    }

    const jsonString = JSON.stringify(cookies);
    // Uses 256-bit AES key like the official extension
    const encrypted = (sjcl.encrypt as unknown as (pwd: string, plaintext: string, options?: Record<string, unknown>) => string)(
      password,
      jsonString,
      { ks: 256 }
    );
    return {
      success: true,
      ckzContent: encrypted
    };
  } catch (err: unknown) {
    const errMsg = (err instanceof Error) ? err.message : String(err);
    return { success: false, error: `Lỗi mã hóa: ${errMsg}` };
  }
}

/**
 * Generate Console snippet to inject cookies into the current tab via document.cookie
 */
export function generateConsoleInjectionScript(cookies: ChromeCookieItem[], targetDomain?: string): string {
  const filtered = targetDomain 
    ? cookies.filter(c => c.domain.includes(targetDomain))
    : cookies;

  return `// ========================================================
// SCRIPT NẠP COOKIE TỰ ĐỘNG TỪ TỆP .CKZ VÀO TRÌNH DUYỆT
// Hướng dẫn: Mở trang web cần nạp (F12 -> Console) -> Dán đoạn mã này -> Nhấn Enter
// ========================================================
(() => {
  const cookies = ${JSON.stringify(filtered.map(c => ({
    name: c.name,
    value: c.value,
    path: c.path || '/',
    domain: c.domain,
    secure: c.secure,
    expires: c.expirationDate ? new Date(c.expirationDate * 1000).toUTCString() : undefined
  })), null, 2)};

  let count = 0;
  for (const c of cookies) {
    let cookieStr = encodeURIComponent(c.name) + "=" + encodeURIComponent(c.value) + "; path=" + c.path;
    if (c.expires) cookieStr += "; expires=" + c.expires;
    if (c.secure) cookieStr += "; Secure";
    document.cookie = cookieStr;
    count++;
  }
  console.log("%c[✓] ĐÃ NẠP THÀNH CÔNG " + count + " COOKIES VÀO TRANG!", "color: #22c55e; font-size: 14px; font-weight: bold;");
  console.log("-> Hãy F5 lại trang để nhận trạng thái đăng nhập!");
})();`;
}
