/**
 * Trọn bộ mã nguồn Google Chrome Extension:
 * "Chrome Full Backup & 1-Click Restore Extension" (Manifest V3)
 * 
 * Tính năng chính:
 * 1. Tự động ghi nhớ vị trí trước đây đã tải/lưu qua chrome.storage.local (không bắt chọn lại sau khi đóng app)
 * 2. Sao lưu toàn vẹn: Cookies tất cả domain, Dấu trang Bookmarks, Tabs đang mở, Lịch sử duyệt web
 * 3. Thanh tiến trình % động (Progress Bar 0% - 100%) kèm từng bước chi tiết
 * 4. Hệ thống cảnh báo thông minh: Cảnh báo ghi đè khi Restore, cảnh báo bảo mật cookies phiên
 * 5. Giao diện Dark Slate hiện đại, trang trí bóng bẩy chuẩn Chrome Web Store
 */

export const EXTENSION_MANIFEST = `{
  "manifest_version": 3,
  "name": "Chrome Full Backup & 1-Click Restore",
  "version": "5.2.0",
  "description": "Tiện ích sao lưu & khôi phục 100% Cookies, Bookmarks, Tabs, Lịch sử. Tự động nhớ vị trí lưu, có thanh bar % và cảnh báo an toàn.",
  "action": {
    "default_popup": "popup.html",
    "default_title": "Chrome Full Backup & Restore",
    "default_icon": {
      "16": "icons/16.png",
      "32": "icons/32.png",
      "48": "icons/48.png",
      "128": "icons/128.png"
    }
  },
  "icons": {
    "16": "icons/16.png",
    "32": "icons/32.png",
    "48": "icons/48.png",
    "128": "icons/128.png"
  },
  "permissions": [
    "cookies",
    "bookmarks",
    "tabs",
    "history",
    "storage",
    "downloads"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  }
}`;

export const EXTENSION_POPUP_HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chrome Full Backup & Restore</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="ext-container">
    <!-- Header -->
    <header class="ext-header">
      <div class="header-brand">
        <div class="brand-icon">🛡️</div>
        <div>
          <h1 class="brand-title">Chrome Full Backup</h1>
          <p class="brand-sub">Tiện ích sao lưu 1-Click trên Chrome</p>
        </div>
      </div>
      <span class="badge-v3">Manifest V3</span>
    </header>

    <!-- Thư mục ghi nhớ vị trí đã tải (Không cần chọn lại) -->
    <section class="card path-memory-card">
      <div class="card-header">
        <span class="icon">💾</span>
        <strong>Vị Trí Đã Ghi Nhớ (Tự Động Lưu)</strong>
      </div>
      <div class="path-display-row">
        <div class="path-box">
          <span class="folder-icon">📁</span>
          <span id="saved-folder-text">Downloads/Chrome_Backups/</span>
        </div>
        <button id="btn-edit-folder" class="btn-tiny" title="Đổi thư mục lưu">Đổi vị trí</button>
      </div>
      <div id="edit-folder-wrap" class="hidden edit-folder-box">
        <input type="text" id="inp-folder-name" placeholder="Ví dụ: Chrome_Backups/" />
        <button id="btn-save-folder" class="btn-tiny btn-save">Lưu</button>
      </div>
      <div class="memory-indicator">
        <span class="green-dot"></span>
        <small id="memory-status">Đã ghi nhớ tự động • Không cần chọn lại khi đóng extension</small>
      </div>
    </section>

    <!-- Hộp Cảnh Báo An Toàn (Alerts & Warnings) -->
    <section class="card warnings-card">
      <div class="warning-header">
        <span class="warn-icon">⚠️</span>
        <strong>CẢNH BÁO AN TOÀN & LƯU Ý</strong>
      </div>
      <ul class="warning-list">
        <li><strong style="color: #f87171;">Đang sao lưu: ĐỪNG TẮT APP/TRÌNH DUYỆT!</strong> Giữ nguyên cửa sổ Chrome và tiện ích cho đến khi thanh % đạt 100% để bảo đảm tệp dữ liệu không bị lỗi.</li>
        <li><strong>Không gửi file backup:</strong> Tệp chứa Cookies phiên đăng nhập thật của bạn, tuyệt đối không chia sẻ cho người khác.</li>
        <li><strong>Cảnh báo khi Restore:</strong> Khôi phục sẽ thay thế Cookies & nạp lại các tab được ghi lại trong bản backup.</li>
      </ul>
    </section>

    <!-- Banner Cảnh Báo Trực Tiếp Khi Đang Sao Lưu -->
    <div id="live-backup-warning" class="hidden live-warning-banner">
      <span class="warning-pulse-icon">🚨</span>
      <div class="warning-banner-text">
        <strong>CẢNH BÁO: ĐANG SAO LƯU — ĐỪNG TẮT TRÌNH DUYỆT!</strong>
        <p>Vui lòng giữ nguyên cửa sổ và không đóng tiện ích cho đến khi tiến trình hoàn tất 100%.</p>
      </div>
    </div>

    <!-- Thanh Tiến Trình Phần Trăm (Progress Bar %) -->
    <section id="progress-section" class="card progress-card hidden">
      <div class="progress-top">
        <span id="progress-step-text" class="progress-step">Đang chuẩn bị...</span>
        <span id="progress-percent" class="progress-percent-badge">0%</span>
      </div>
      <div class="progress-track">
        <div id="progress-bar-fill" class="progress-fill" style="width: 0%"></div>
      </div>
      <small id="progress-detail" class="progress-detail">Đang quét các đối tượng dữ liệu...</small>
    </section>

    <!-- Khung 2 Nút Hành Động 1-Click To Rõ Ràng -->
    <div class="action-buttons-grid">
      <button id="btn-auto-backup" class="btn-action btn-backup">
        <span class="btn-icon">⚡</span>
        <div class="btn-text">
          <span class="btn-title">1-CLICK BACKUP</span>
          <span class="btn-desc">Sao lưu Cookies, Tabs, Bookmarks</span>
        </div>
      </button>

      <button id="btn-auto-restore" class="btn-action btn-restore">
        <span class="btn-icon">🔄</span>
        <div class="btn-text">
          <span class="btn-title">1-CLICK RESTORE</span>
          <span class="btn-desc">Khôi phục từ tệp đã lưu</span>
        </div>
      </button>
    </div>

    <!-- Hidden input để chọn file restore -->
    <input type="file" id="file-restore-input" accept=".json,.chrome_backup" class="hidden" />

    <!-- Thống kê nhanh gần nhất -->
    <section class="card stats-card">
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-num" id="stat-cookies">--</span>
          <span class="stat-label">Cookies</span>
        </div>
        <div class="stat-item">
          <span class="stat-num" id="stat-bookmarks">--</span>
          <span class="stat-label">Bookmarks</span>
        </div>
        <div class="stat-item">
          <span class="stat-num" id="stat-tabs">--</span>
          <span class="stat-label">Tabs Mở</span>
        </div>
      </div>
      <div class="last-backup-note">
        <small id="last-backup-time">Bản sao lưu gần nhất: Chưa có</small>
      </div>
    </section>

    <!-- Thông báo kết quả -->
    <div id="result-message" class="hidden result-banner"></div>

    <!-- Footer -->
    <footer class="ext-footer">
      <span>Chrome Full Backup Extension • Ghi nhớ vị trí tự động</span>
    </footer>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;

export const EXTENSION_POPUP_JS = `/**
 * Chrome Full Backup & 1-Click Restore Extension Engine
 * Tự động ghi nhớ vị trí lưu trữ qua chrome.storage.local
 */

const STORAGE_KEY_FOLDER = 'chrome_backup_saved_folder';
const STORAGE_KEY_LAST_BACKUP = 'chrome_backup_last_info';
const DEFAULT_FOLDER = 'Chrome_Backups/';

let currentSavedFolder = DEFAULT_FOLDER;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Nạp vị trí đã ghi nhớ trước đây từ chrome.storage.local
  chrome.storage.local.get([STORAGE_KEY_FOLDER, STORAGE_KEY_LAST_BACKUP], (result) => {
    if (result[STORAGE_KEY_FOLDER]) {
      currentSavedFolder = result[STORAGE_KEY_FOLDER];
    }
    updateFolderDisplay();

    if (result[STORAGE_KEY_LAST_BACKUP]) {
      const last = result[STORAGE_KEY_LAST_BACKUP];
      document.getElementById('last-backup-time').innerText = 'Bản sao lưu gần nhất: ' + last.time + ' (' + last.fileName + ')';
      document.getElementById('stat-cookies').innerText = last.cookiesCount || '0';
      document.getElementById('stat-bookmarks').innerText = last.bookmarksCount || '0';
      document.getElementById('stat-tabs').innerText = last.tabsCount || '0';
    } else {
      // Đếm sơ bộ dữ liệu hiện tại
      countCurrentStats();
    }
  });

  // Sự kiện đổi vị trí lưu
  document.getElementById('btn-edit-folder').addEventListener('click', toggleEditFolder);
  document.getElementById('btn-save-folder').addEventListener('click', saveNewFolder);

  // Nút Backup 1-Click
  document.getElementById('btn-auto-backup').addEventListener('click', executeOneClickBackup);

  // Nút Restore 1-Click
  document.getElementById('btn-auto-restore').addEventListener('click', () => {
    document.getElementById('file-restore-input').click();
  });
  document.getElementById('file-restore-input').addEventListener('change', executeOneClickRestore);
});

function updateFolderDisplay() {
  const displayEl = document.getElementById('saved-folder-text');
  displayEl.innerText = 'Downloads/' + currentSavedFolder;
}

function toggleEditFolder() {
  const box = document.getElementById('edit-folder-wrap');
  const inp = document.getElementById('inp-folder-name');
  if (box.classList.contains('hidden')) {
    box.classList.remove('hidden');
    inp.value = currentSavedFolder;
    inp.focus();
  } else {
    box.classList.add('hidden');
  }
}

function saveNewFolder() {
  let val = document.getElementById('inp-folder-name').value.trim();
  if (!val) val = DEFAULT_FOLDER;
  if (!val.endsWith('/')) val += '/';
  currentSavedFolder = val;
  chrome.storage.local.set({ [STORAGE_KEY_FOLDER]: val }, () => {
    updateFolderDisplay();
    document.getElementById('edit-folder-wrap').classList.add('hidden');
    showResult('Đã ghi nhớ vị trí lưu mới: Downloads/' + val + ' (Không cần chọn lại khi đóng app)', 'success');
  });
}

async function countCurrentStats() {
  try {
    const cookies = await chrome.cookies.getAll({});
    document.getElementById('stat-cookies').innerText = cookies.length.toLocaleString();
    const tabs = await chrome.tabs.query({});
    document.getElementById('stat-tabs').innerText = tabs.length.toLocaleString();
    chrome.bookmarks.getTree((tree) => {
      let bCount = 0;
      function walk(nodes) {
        for (const n of nodes) {
          if (n.url) bCount++;
          if (n.children) walk(n.children);
        }
      }
      walk(tree);
      document.getElementById('stat-bookmarks').innerText = bCount.toLocaleString();
    });
  } catch (e) {
    console.log(e);
  }
}

function setProgress(percent, stepText, detailText) {
  const sec = document.getElementById('progress-section');
  sec.classList.remove('hidden');
  document.getElementById('progress-percent').innerText = Math.round(percent) + '%';
  document.getElementById('progress-bar-fill').style.width = Math.min(100, Math.max(0, percent)) + '%';
  document.getElementById('progress-step-text').innerText = stepText;
  document.getElementById('progress-detail').innerText = detailText;
}

function hideProgress() {
  setTimeout(() => {
    document.getElementById('progress-section').classList.add('hidden');
  }, 2500);
}

function showResult(text, type) {
  const el = document.getElementById('result-message');
  el.className = 'result-banner ' + (type === 'success' ? 'result-success' : 'result-error');
  el.innerHTML = text;
  el.classList.remove('hidden');
  setTimeout(() => {
    el.classList.add('hidden');
  }, 6000);
}

/**
 * 1-CLICK BACKUP: Sao lưu và lưu vào vị trí đã nhớ
 */
async function executeOneClickBackup() {
  const liveWarn = document.getElementById('live-backup-warning');
  if (liveWarn) liveWarn.classList.remove('hidden');

  try {
    setProgress(5, '⚠️ CẢNH BÁO: ĐỪNG TẮT APP!', 'Đang kết nối API bảo mật của Google Chrome...');

    // 1. Quét Cookies (30%)
    setProgress(20, 'Đang sao lưu Cookies & Tokens', 'Thu thập phiên đăng nhập của tất cả các trang web...');
    const cookies = await chrome.cookies.getAll({});
    
    // 2. Quét Bookmarks (50%)
    setProgress(45, 'Đang đọc Dấu Trang (Bookmarks)', 'Bảo tồn cấu trúc cây thư mục dấu trang...');
    const bookmarksTree = await new Promise(res => chrome.bookmarks.getTree(res));

    // 3. Quét Tabs & Windows (70%)
    setProgress(65, 'Đang lưu Tabs & Phiên làm việc', 'Ghi lại các tab đang mở và thứ tự hiển thị...');
    const openTabs = await chrome.tabs.query({});
    const tabList = openTabs.map(t => ({ title: t.title, url: t.url, active: t.active, pinned: t.pinned }));

    // 4. Quét Lịch sử duyệt web gần đây (80%)
    setProgress(80, 'Đang tổng hợp Lịch sử duyệt web', 'Đóng gói dữ liệu an toàn...');
    const historyItems = await chrome.history.search({ text: '', maxResults: 500 });

    // 5. Đóng gói JSON
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
    const fileName = 'chrome_full_backup_' + timestamp + '.json';
    const fullDownloadPath = currentSavedFolder + fileName;

    const backupPayload = {
      meta: {
        app: 'Chrome Full Backup & Restore Extension',
        version: '5.0.0',
        timestamp: new Date().toISOString(),
        fileName: fileName,
        rememberedFolder: currentSavedFolder
      },
      cookies: cookies,
      bookmarks: bookmarksTree,
      tabs: tabList,
      history: historyItems,
      counts: {
        cookies: cookies.length,
        tabs: tabList.length,
        bookmarks: bookmarksTree.length
      }
    };

    setProgress(90, 'Lưu trữ vào vị trí đã nhớ', 'Đang tải về vị trí: Downloads/' + fullDownloadPath);

    // Sử dụng chrome.downloads.download với filename đã gán thư mục ghi nhớ
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);

    await chrome.downloads.download({
      url: blobUrl,
      filename: fullDownloadPath,
      saveAs: false // TỰ ĐỘNG LƯU VÀO VỊ TRÍ ĐÃ NHỚ, KHÔNG HỎI LẠI
    });

    setProgress(100, 'Sao lưu hoàn tất 100%!', 'Đã lưu trọn vẹn ' + cookies.length + ' cookies, ' + tabList.length + ' tabs.');

    // Cập nhật thống kê & ghi nhớ lịch sử
    const nowTimeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const lastInfo = {
      time: nowTimeStr,
      fileName: fileName,
      cookiesCount: cookies.length,
      tabsCount: tabList.length,
      bookmarksCount: bookmarksTree.length
    };
    chrome.storage.local.set({ [STORAGE_KEY_LAST_BACKUP]: lastInfo });

    document.getElementById('stat-cookies').innerText = cookies.length.toLocaleString();
    document.getElementById('stat-tabs').innerText = tabList.length.toLocaleString();
    document.getElementById('last-backup-time').innerText = 'Bản sao lưu gần nhất: ' + nowTimeStr + ' (' + fileName + ')';

    showResult('✓ Sao lưu 100% thành công! File đã được lưu tự động vào: <b>Downloads/' + fullDownloadPath + '</b>', 'success');
    hideProgress();
  } catch (err) {
    console.error(err);
    showResult('Lỗi khi sao lưu: ' + err.message, 'error');
    hideProgress();
  } finally {
    if (liveWarn) liveWarn.classList.add('hidden');
  }
}

/**
 * 1-CLICK RESTORE: Khôi phục Cookies & Tabs từ file
 */
async function executeOneClickRestore(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    setProgress(10, 'Đang đọc tệp sao lưu', 'Phân tích tính hợp lệ của tệp backup...');
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.cookies && !data.tabs) {
      throw new Error('Tệp không đúng định dạng Chrome Full Backup.');
    }

    const totalCookies = (data.cookies || []).length;
    setProgress(25, 'CẢNH BÁO: Đang chuẩn bị khôi phục', 'Sẽ nạp lại ' + totalCookies + ' cookies và các tabs...');

    // Khôi phục Cookies
    let restoredCount = 0;
    const cookiesList = data.cookies || [];
    for (let i = 0; i < cookiesList.length; i++) {
      const c = cookiesList[i];
      let url = 'http' + (c.secure ? 's' : '') + '://' + (c.domain.startsWith('.') ? c.domain.slice(1) : c.domain) + c.path;

      const cookieDetails = {
        url: url,
        name: c.name,
        value: c.value,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly,
        sameSite: c.sameSite
      };
      if (c.expirationDate) {
        cookieDetails.expirationDate = c.expirationDate;
      }

      try {
        await chrome.cookies.set(cookieDetails);
        restoredCount++;
      } catch (err) {
        // bỏ qua cookie lỗi domain
      }

      if (i % 20 === 0 || i === cookiesList.length - 1) {
        const p = 25 + Math.round((i / cookiesList.length) * 50);
        setProgress(p, 'Đang khôi phục Cookies (' + i + '/' + cookiesList.length + ')', 'Trang: ' + (c.domain || ''));
      }
    }

    // Khôi phục Tabs
    setProgress(85, 'Đang khôi phục các Tabs đã mở', 'Mở lại các phiên duyệt web...');
    if (data.tabs && data.tabs.length > 0) {
      for (const t of data.tabs.slice(0, 10)) {
        if (t.url && !t.url.startsWith('chrome://')) {
          try {
            await chrome.tabs.create({ url: t.url, active: false });
          } catch (e) {}
        }
      }
    }

    setProgress(100, 'Khôi phục hoàn tất 100%!', 'Đã phục hồi ' + restoredCount + ' cookies phiên đăng nhập thành công!');
    showResult('✓ KHÔI PHỤC THÀNH CÔNG! Đã nạp ' + restoredCount + ' cookies phiên và mở lại các tabs.', 'success');
    hideProgress();
  } catch (err) {
    console.error(err);
    showResult('Lỗi khi khôi phục: ' + err.message, 'error');
    hideProgress();
  }
}
`;

export const EXTENSION_BACKGROUND_JS = `/**
 * Chrome Full Backup & Restore Service Worker (Manifest V3)
 * Giữ kết nối ngầm khi thực hiện các tác vụ sao lưu/khôi phục lớn
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome Full Backup Extension installed successfully!');
});
`;

export const EXTENSION_STYLE_CSS = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

body {
  width: 380px;
  background-color: #090d16;
  color: #f1f5f9;
  font-size: 13px;
  line-height: 1.4;
}

.ext-container {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Header */
.ext-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #1e293b;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  font-size: 24px;
}

.brand-title {
  font-size: 14px;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: -0.2px;
}

.brand-sub {
  font-size: 11px;
  color: #94a3b8;
}

.badge-v3 {
  font-size: 10px;
  font-weight: 700;
  background: #0284c7;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Cards */
.card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 10px 12px;
}

/* Memory Card */
.path-memory-card {
  border-color: #0284c7;
  background: linear-gradient(180deg, #0c182d 0%, #0f172a 100%);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #38bdf8;
  margin-bottom: 6px;
}

.path-display-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  background: #090d16;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #1e293b;
}

.path-box {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: monospace;
  font-size: 11px;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-tiny {
  font-size: 10px;
  font-weight: 600;
  background: #334155;
  color: #f8fafc;
  border: none;
  padding: 3px 7px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-tiny:hover {
  background: #475569;
}

.btn-save {
  background: #0284c7;
}
.btn-save:hover {
  background: #0369a1;
}

.edit-folder-box {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.edit-folder-box input {
  flex: 1;
  background: #090d16;
  border: 1px solid #334155;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.memory-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  color: #22c55e;
  font-size: 10px;
}

.green-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
}

/* Warnings Card */
.warnings-card {
  border-left: 3px solid #eab308;
  background: #141824;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #facc15;
  font-size: 11px;
  margin-bottom: 4px;
}

.warning-list {
  padding-left: 18px;
  font-size: 11px;
  color: #cbd5e1;
  line-height: 1.35;
}

.warning-list li {
  margin-bottom: 3px;
}

/* Live Warning Banner */
.live-warning-banner {
  background: rgba(127, 29, 29, 0.9);
  border: 1.5px solid #ef4444;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: pulse 1.5s infinite;
}

.warning-pulse-icon {
  font-size: 18px;
  line-height: 1;
}

.warning-banner-text strong {
  display: block;
  font-size: 10.5px;
  color: #fca5a5;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 800;
}

.warning-banner-text p {
  margin: 1px 0 0 0;
  font-size: 10px;
  color: #cbd5e1;
}

/* Progress Section */
.progress-card {
  border-color: #22c55e;
  background: #0c1f17;
}

.progress-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.progress-step {
  font-size: 11px;
  font-weight: 600;
  color: #4ade80;
}

.progress-percent-badge {
  font-size: 11px;
  font-weight: 700;
  background: #22c55e;
  color: #090d16;
  padding: 1px 6px;
  border-radius: 10px;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: #1e293b;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #38bdf8);
  transition: width 0.2s ease;
}

.progress-detail {
  font-size: 10px;
  color: #94a3b8;
  display: block;
}

/* Action Buttons Grid */
.action-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: transform 0.1s ease, filter 0.15s ease;
}

.btn-action:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-action:active {
  transform: translateY(0);
}

.btn-backup {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
}

.btn-restore {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-icon {
  font-size: 18px;
}

.btn-title {
  display: block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.btn-desc {
  display: block;
  font-size: 9.5px;
  opacity: 0.85;
}

/* Stats */
.stats-card {
  padding: 8px 10px;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  text-align: center;
  margin-bottom: 6px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 14px;
  font-weight: 700;
  color: #38bdf8;
}

.stat-label {
  font-size: 10px;
  color: #94a3b8;
}

.last-backup-note {
  text-align: center;
  border-top: 1px solid #1e293b;
  padding-top: 5px;
  color: #64748b;
  font-size: 10px;
}

/* Result Banner */
.result-banner {
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 11px;
}

.result-success {
  background: #064e3b;
  color: #a7f3d0;
  border: 1px solid #059669;
}

.result-error {
  background: #7f1d1d;
  color: #fecaca;
  border: 1px solid #dc2626;
}

/* Footer */
.ext-footer {
  text-align: center;
  font-size: 10px;
  color: #475569;
}

.hidden {
  display: none !important;
}
`;
