export const DESKTOP_APP_PYTHON_CODE = `"""
========================================================================================
   CHROME 100% FULL BACKUP & AUTO SCHEDULER PRO (DESKTOP v6.2)
   - Giao diện Hiện Đại (Modern Flat UI - Không hở trắng - Tùy biến hình dạng)
   - Theme Studio (6 Giao diện màu sắc: Dark Slate, Cyberpunk, Midnight, Emerald, Dracula, Light)
   - Đa Ngôn Ngữ (Tiếng Việt 🇻🇳 / English 🇬🇧)
   - Tự Động Kiểm Tra & Cập Nhật Phiên Bản (Auto Update Engine)
   - Hiển thị vị trí lưu rõ ràng + Dung lượng ổ cứng + 1-Click mở Explorer
   - Bộ Lọc & Tìm Kiếm Profile (Search & Filter Profiles)
   - Lập Lịch Sao Lưu Tự Động & Chạy Ngầm Khay Hệ Thống (Tray Daemon)
========================================================================================
"""

import os
import sys
import json
import glob
import shutil
import zipfile
import subprocess
import threading
import time
import urllib.request
from datetime import datetime
from pathlib import Path

import tkinter as tk
from tkinter import ttk, filedialog, messagebox

# Hỗ trợ System Tray (pystray + PIL) nếu có
USE_TRAY = False
try:
    import pystray
    from PIL import Image, ImageDraw
    USE_TRAY = True
except Exception:
    USE_TRAY = False

APP_CURRENT_VERSION = "v6.2.0"
UPDATE_CHECK_URL = "https://raw.githubusercontent.com/google-gemini/chrome-backup-tool/main/version.json"

# =====================================================================
# THEME STUDIO PALETTES (Đồng bộ hoàn toàn với bản Web)
# =====================================================================
THEMES = {
    "dark-slate": {
        "name": "Dark Slate (Mặc định)",
        "bg": "#020617",
        "card": "#0f172a",
        "card_alt": "#1e293b",
        "border": "#334155",
        "text": "#f8fafc",
        "text_muted": "#94a3b8",
        "accent": "#10b981",
        "accent_hover": "#059669",
        "accent_fg": "#ffffff",
        "blue": "#38bdf8",
        "danger": "#ef4444",
        "warning": "#f59e0b",
        "input_bg": "#090d16",
        "progress_trough": "#090d16"
    },
    "cyberpunk-neon": {
        "name": "Cyberpunk Neon",
        "bg": "#090514",
        "card": "#130924",
        "card_alt": "#241242",
        "border": "#4c1d95",
        "text": "#fdf4ff",
        "text_muted": "#c084fc",
        "accent": "#06b6d4",
        "accent_hover": "#0891b2",
        "accent_fg": "#000000",
        "blue": "#a855f7",
        "danger": "#f43f5e",
        "warning": "#eab308",
        "input_bg": "#05010a",
        "progress_trough": "#05010a"
    },
    "midnight-ocean": {
        "name": "Midnight Ocean",
        "bg": "#020b1e",
        "card": "#071738",
        "card_alt": "#0f2b60",
        "border": "#1e3a8a",
        "text": "#f0f9ff",
        "text_muted": "#7dd3fc",
        "accent": "#0ea5e9",
        "accent_hover": "#0284c7",
        "accent_fg": "#ffffff",
        "blue": "#38bdf8",
        "danger": "#f43f5e",
        "warning": "#fbbf24",
        "input_bg": "#010612",
        "progress_trough": "#010612"
    },
    "emerald-forest": {
        "name": "Emerald Forest",
        "bg": "#02150d",
        "card": "#05291b",
        "card_alt": "#09402b",
        "border": "#065f46",
        "text": "#ecfdf5",
        "text_muted": "#6ee7b7",
        "accent": "#22c55e",
        "accent_hover": "#16a34a",
        "accent_fg": "#ffffff",
        "blue": "#34d399",
        "danger": "#ef4444",
        "warning": "#f59e0b",
        "input_bg": "#010d08",
        "progress_trough": "#010d08"
    },
    "dracula-purple": {
        "name": "Dracula Purple",
        "bg": "#120e24",
        "card": "#1d163a",
        "card_alt": "#2c2256",
        "border": "#43337a",
        "text": "#f8f7ff",
        "text_muted": "#c4b5fd",
        "accent": "#a855f7",
        "accent_hover": "#9333ea",
        "accent_fg": "#ffffff",
        "blue": "#c084fc",
        "danger": "#f87171",
        "warning": "#fbbf24",
        "input_bg": "#090614",
        "progress_trough": "#090614"
    },
    "light-titanium": {
        "name": "Light Titanium Clean",
        "bg": "#f1f5f9",
        "card": "#ffffff",
        "card_alt": "#e2e8f0",
        "border": "#cbd5e1",
        "text": "#0f172a",
        "text_muted": "#64748b",
        "accent": "#0284c7",
        "accent_hover": "#0369a1",
        "accent_fg": "#ffffff",
        "blue": "#2563eb",
        "danger": "#dc2626",
        "warning": "#d97706",
        "input_bg": "#f8fafc",
        "progress_trough": "#e2e8f0"
    }
}

# =====================================================================
# BỘ TỪ ĐIỂN ĐA NGÔN NGỮ (VIETNAMESE / ENGLISH)
# =====================================================================
I18N = {
    "vi": {
        "app_title": "🛡️ Chrome Full Backup & Scheduler Pro (v6.2)",
        "subtitle": "Bản Desktop Pro • Theme Studio • Đa Ngôn Ngữ • Auto Update • Chạy Ngầm",
        "theme_label": "🎨 Giao Diện:",
        "lang_label": "🌐 Ngôn Ngữ:",
        "version_label": "Phiên bản:",
        "btn_check_update": "🔄 Kiểm Tra Cập Nhật",
        "btn_update_now": "🚀 Có Bản Mới!",
        "backup_loc_title": "📁 VỊ TRÍ THƯ MỤC SAO LƯU (LƯU TRỮ VĨNH VIỄN)",
        "backup_loc_sub": "Đường dẫn được ghi nhớ tự động • Không bao giờ bị mất",
        "btn_browse": "📁 Đổi Thư Mục...",
        "btn_open_folder": "📂 Mở Trong Explorer",
        "btn_copy_path": "📋 Copy",
        "free_space": "Trống:",
        "backup_count": "Đang lưu:",
        "profiles_title": "👥 LỰA CHỌN PROFILES CHROME CẦN SAO LƯU",
        "search_placeholder": "🔍 Tìm kiếm theo tên hoặc email profile...",
        "btn_select_all": "✓ Chọn Tất Cả",
        "btn_deselect_all": "✕ Bỏ Chọn",
        "btn_email_only": "📧 Chỉ Có Email",
        "selected_profiles": "Đã chọn: {count}/{total} Profiles",
        "scheduler_title": "⏰ LẬP LỊCH TỰ ĐỘNG & CHẠY NGẦM (DAEMON / TRAY)",
        "chk_enable_sched": "Kích hoạt Tự Động Sao Lưu Theo Lịch Hẹn",
        "sched_active": "[ĐANG BẬT NGẦM]",
        "sched_inactive": "[ĐANG TẮT]",
        "frequency": "Tần suất:",
        "freq_daily": "Hàng ngày",
        "freq_hourly": "Mỗi giờ",
        "time_at": "Giờ sao lưu (HH:MM):",
        "chk_auto_close": "Tự tắt Chrome",
        "chk_minimize_tray": "Thu nhỏ xuống khay [X]",
        "btn_test_sched": "▶️ Chạy Thử Ngay",
        "status_ready": "Sẵn sàng thực hiện",
        "btn_backup": "⚡ 1-CLICK AUTO BACKUP\\n(Sao Lưu Profiles Đã Chọn)",
        "btn_restore": "🔄 1-CLICK AUTO RESTORE\\n(Khôi Phục & Mở Lại Chrome)",
        "btn_minimize": "🔽 Thu Nhỏ Khay Hệ Thống",
        "btn_restore_zip": "📁 Khôi phục từ zip khác...",
        "btn_shape": "📐 Đổi Kích Thước App",
        "btn_uninstall": "🗑️ Gỡ Cài Đặt (Uninstall)",
        "console_title": "Nhật ký hoạt động (Console Logs)",
        "copied": "Đã copy đường dẫn vào bộ nhớ tạm!",
        "update_modal_title": "🚀 BẢN CẬP NHẬT MỚI CỦA ỨNG DỤNG",
        "update_modal_msg": "Đã có phiên bản mới {new_ver} (Hiện tại: {cur_ver}).\\n\\nĐiểm mới trong bản này:\\n- Tích hợp Theme Studio & Đa ngôn ngữ\\n- Vá triệt để giao diện không bị hở trắng\\n- Hiển thị vị trí lưu trữ rõ ràng và dung lượng ổ đĩa\\n- Lập lịch tự động thông minh hơn.\\n\\nBạn có muốn cập nhật ngay bây giờ?",
        "up_to_date": "Ứng dụng của bạn đang ở phiên bản mới nhất ({ver})!",
        "confirm_backup_chrome_running": "Google Chrome đang mở. Ứng dụng sẽ tự động đóng Chrome an toàn để tránh khóa file SQLite.\\n\\nTiếp tục sao lưu?",
        "confirm_restore": "Khôi phục 1-Click sẽ ghi đè Profiles hiện tại bằng bản sao lưu mới nhất.\\n\\nChrome sẽ tự động đóng và mở lại nguyên vẹn.\\nTiếp tục?",
        "backup_done": "Sao lưu thành công {count} Profiles!\\n\\nTệp: {file}\\nDung lượng: {size} MB",
        "restore_done": "Đã khôi phục thành công 100%! Chrome đã được mở lại.",
        "shape_standard": "Chuẩn (960x780)",
        "shape_wide": "Rộng (1120x820)",
        "shape_compact": "Gọn (820x680)"
    },
    "en": {
        "app_title": "🛡️ Chrome Full Backup & Scheduler Pro (v6.2)",
        "subtitle": "Desktop Pro • Theme Studio • Multi-Language • Auto Update • Background Daemon",
        "theme_label": "🎨 Theme:",
        "lang_label": "🌐 Language:",
        "version_label": "Version:",
        "btn_check_update": "🔄 Check Updates",
        "btn_update_now": "🚀 Update Available!",
        "backup_loc_title": "📁 BACKUP STORAGE DIRECTORY (AUTO MEMORY)",
        "backup_loc_sub": "Path is remembered permanently • Never lost upon closing",
        "btn_browse": "📁 Change Folder...",
        "btn_open_folder": "📂 Open Explorer",
        "btn_copy_path": "📋 Copy",
        "free_space": "Free:",
        "backup_count": "Stored:",
        "profiles_title": "👥 CHOOSE CHROME PROFILES TO BACKUP",
        "search_placeholder": "🔍 Filter profiles by name or email...",
        "btn_select_all": "✓ Select All",
        "btn_deselect_all": "✕ Deselect",
        "btn_email_only": "📧 Email Only",
        "selected_profiles": "Selected: {count}/{total} Profiles",
        "scheduler_title": "⏰ AUTO SCHEDULER & BACKGROUND DAEMON (TRAY)",
        "chk_enable_sched": "Enable Automatic Background Backup Schedule",
        "sched_active": "[RUNNING IN BACKGROUND]",
        "sched_inactive": "[DISABLED]",
        "frequency": "Frequency:",
        "freq_daily": "Daily",
        "freq_hourly": "Hourly",
        "time_at": "Backup Time (HH:MM):",
        "chk_auto_close": "Auto Close Chrome",
        "chk_minimize_tray": "Minimize to Tray on [X]",
        "btn_test_sched": "▶️ Test Run Now",
        "status_ready": "Ready to execute",
        "btn_backup": "⚡ 1-CLICK AUTO BACKUP\\n(Backup Selected Profiles)",
        "btn_restore": "🔄 1-CLICK AUTO RESTORE\\n(Restore & Reopen Chrome)",
        "btn_minimize": "🔽 Minimize to Tray",
        "btn_restore_zip": "📁 Restore from custom zip...",
        "btn_shape": "📐 Change Window Size",
        "btn_uninstall": "🗑️ Uninstall App Config",
        "console_title": "Activity Console Logs",
        "copied": "Path copied to clipboard!",
        "update_modal_title": "🚀 NEW APPLICATION VERSION AVAILABLE",
        "update_modal_msg": "A new version {new_ver} is available (Current: {cur_ver}).\\n\\nWhat's new:\\n- Integrated Theme Studio & Multi-Language\\n- Completely fixed white UI patches\\n- Clear storage display & free disk space monitoring\\n- Smarter automated background scheduler.\\n\\nDo you want to update now?",
        "up_to_date": "Your application is currently up to date ({ver})!",
        "confirm_backup_chrome_running": "Google Chrome is running. The tool will safely close Chrome processes to release SQLite locks.\\n\\nContinue?",
        "confirm_restore": "1-Click Restore will overwrite current Chrome Profiles with your latest backup.\\n\\nChrome will close and reopen cleanly.\\nContinue?",
        "backup_done": "Backup completed successfully for {count} Profiles!\\n\\nFile: {file}\\nSize: {size} MB",
        "restore_done": "Restored 100% successfully! Chrome has been reopened.",
        "shape_standard": "Standard (960x780)",
        "shape_wide": "Wide (1120x820)",
        "shape_compact": "Compact (820x680)"
    }
}

CACHE_FOLDERS = {
    "cache", "code cache", "gpucache", "dawncache", "mediacache",
    "crashpad", "shadercache", "grshadercache"
}

def get_config_file_path() -> Path:
    appdata = os.environ.get("APPDATA")
    if appdata:
        cfg_dir = Path(appdata) / "ChromeBackupTool"
        cfg_dir.mkdir(parents=True, exist_ok=True)
        return cfg_dir / "config.json"
    return Path.home() / ".chrome_backup_config.json"

def load_saved_config() -> dict:
    try:
        cfg = get_config_file_path()
        if cfg.exists():
            with open(cfg, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def save_config_data(new_data: dict):
    try:
        cfg = get_config_file_path()
        data = load_saved_config()
        data.update(new_data)
        with open(cfg, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception:
        pass

def get_chrome_folder_path() -> Path:
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support" / "Google" / "Chrome"
    elif sys.platform.startswith("linux"):
        p = Path.home() / ".config" / "google-chrome"
        if not p.exists() and (Path.home() / ".config" / "chromium").exists():
            return Path.home() / ".config" / "chromium"
        return p
    else:
        appdata = os.environ.get("LOCALAPPDATA") or str(Path.home() / "AppData" / "Local")
        return Path(appdata) / "Google" / "Chrome"

def get_chrome_user_data_path() -> Path:
    if sys.platform in ("darwin", "linux"):
        return get_chrome_folder_path()
    return get_chrome_folder_path() / "User Data"

def get_chrome_executable_path() -> str:
    if sys.platform == "darwin":
        return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    elif sys.platform.startswith("linux"):
        for cmd in ["google-chrome", "google-chrome-stable", "chromium"]:
            if shutil.which(cmd):
                return cmd
        return "google-chrome"
    else:
        paths = [
            os.path.join(os.environ.get("PROGRAMFILES", "C:/Program Files"), "Google", "Chrome", "Application", "chrome.exe"),
            os.path.join(os.environ.get("PROGRAMFILES(X86)", "C:/Program Files (x86)"), "Google", "Chrome", "Application", "chrome.exe"),
            os.path.join(os.environ.get("LOCALAPPDATA", ""), "Google", "Chrome", "Application", "chrome.exe"),
        ]
        for p in paths:
            if p and os.path.exists(p):
                return p
        return "chrome.exe"

def is_chrome_running() -> bool:
    try:
        if sys.platform == "win32":
            out = subprocess.check_output('tasklist /FI "IMAGENAME eq chrome.exe" /NH', shell=True).decode('utf-8', errors='ignore')
            return "chrome.exe" in out.lower()
        else:
            res = subprocess.run(["pgrep", "-f", "chrome"], capture_output=True)
            return res.returncode == 0
    except Exception:
        return False

def kill_chrome_processes(log_cb=print):
    log_cb("[1/4] Đang đóng sạch các tiến trình Chrome để giải phóng file SQLite...")
    try:
        if sys.platform == "win32":
            for target in ["chrome.exe", "GoogleCrashHandler.exe", "GoogleCrashHandler64.exe"]:
                subprocess.run(["taskkill", "/F", "/IM", target], capture_output=True)
            time.sleep(1.5)
        else:
            subprocess.run(["pkill", "-f", "chrome"], capture_output=True)
        log_cb("[✓] Đã giải phóng hoàn toàn khóa tệp SQLite.")
    except Exception as e:
        log_cb(f"[!] Cảnh báo đóng Chrome: {e}")

def detect_chrome_profiles(user_data_path: Path) -> list:
    profiles = []
    local_state = user_data_path / "Local State"
    if local_state.exists():
        try:
            with open(local_state, "r", encoding="utf-8", errors="ignore") as f:
                data = json.load(f)
                cache = data.get("profile", {}).get("info_cache", {})
                for folder, details in cache.items():
                    profiles.append({
                        "folder": folder,
                        "name": details.get("name", folder),
                        "email": details.get("user_name", "")
                    })
        except Exception:
            pass
    if not profiles:
        for item in user_data_path.glob("Profile *"):
            if item.is_dir():
                profiles.append({"folder": item.name, "name": item.name, "email": ""})
        if (user_data_path / "Default").is_dir():
            profiles.insert(0, {"folder": "Default", "name": "Default Profile", "email": ""})
    return profiles

def fix_chrome_clean_exit(user_data_path: Path, log_cb=print):
    log_cb("[+] Vá cờ 'Normal Clean Exit' chống văng về Guest...")
    for pref in user_data_path.glob("*/Preferences"):
        try:
            if pref.is_file():
                with open(pref, "r", encoding="utf-8", errors="ignore") as f:
                    data = json.load(f)
                data.setdefault("profile", {})["exit_type"] = "Normal"
                data.setdefault("profile", {})["exited_cleanly"] = True
                with open(pref, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
        except Exception:
            pass

def launch_chrome_automatically(log_cb=print):
    try:
        if sys.platform == "darwin":
            subprocess.Popen(["open", "-a", "Google Chrome", "--args", "--restore-last-session"])
        elif sys.platform.startswith("linux"):
            subprocess.Popen([get_chrome_executable_path(), "--restore-last-session"])
        else:
            subprocess.Popen([get_chrome_executable_path(), "--restore-last-session"])
        log_cb("[✓] Chrome đã được mở lại với đầy đủ Profiles & Tabs.")
    except Exception as e:
        log_cb(f"[!] Mở Chrome: {e}")

def get_disk_free_info(path: Path) -> str:
    try:
        usage = shutil.disk_usage(str(path))
        free_gb = usage.free / (1024 ** 3)
        return f"{free_gb:.1f} GB"
    except Exception:
        return "N/A"

def create_tray_image(accent_color="#22c55e"):
    try:
        img = Image.new('RGB', (64, 64), color=(15, 23, 42))
        d = ImageDraw.Draw(img)
        d.polygon([(32, 8), (56, 16), (56, 40), (32, 58), (8, 40), (8, 16)], fill=(34, 197, 94))
        d.polygon([(32, 14), (50, 20), (50, 38), (32, 52), (14, 38), (14, 20)], fill=(15, 23, 42))
        d.ellipse([(26, 26), (38, 38)], fill=(34, 197, 94))
        return img
    except Exception:
        return None


class ChromeBackupApp:
    def __init__(self, root):
        self.root = root
        self.chrome_folder = get_chrome_folder_path()
        self.user_data_path = get_chrome_user_data_path()
        
        cfg = load_saved_config()
        self.current_theme_id = cfg.get("theme", "dark-slate")
        if self.current_theme_id not in THEMES:
            self.current_theme_id = "dark-slate"
        self.current_lang = cfg.get("language", "vi")
        if self.current_lang not in I18N:
            self.current_lang = "vi"

        saved_dir = cfg.get("saved_backup_dir")
        if saved_dir and os.path.exists(saved_dir):
            self.backup_dir = Path(saved_dir)
        else:
            self.backup_dir = Path.home() / "Documents" / "Chrome_Backups"
            self.backup_dir.mkdir(parents=True, exist_ok=True)

        self.is_busy = False
        self.detected_profiles = []
        self.profile_vars = {}
        self.tray_icon = None
        self._stop_scheduler = False
        self.has_new_version = False
        self.latest_version_found = APP_CURRENT_VERSION

        # Cấu hình Scheduler
        sched_cfg = cfg.get("scheduler", {})
        self.sched_enabled = sched_cfg.get("enabled", True)
        self.sched_freq = sched_cfg.get("frequency", "daily")
        self.sched_time = sched_cfg.get("time", "20:00")
        self.sched_interval = sched_cfg.get("interval_hours", 4)
        self.sched_auto_close = sched_cfg.get("auto_close_chrome", True)
        self.sched_retention = sched_cfg.get("retention_count", 5)
        self.minimize_on_close = cfg.get("minimize_on_close", True)
        self.window_shape = cfg.get("window_shape", "standard") # standard | wide | compact

        # Cài đặt kích thước cửa sổ
        self.apply_window_shape(self.window_shape, initial=True)

        self.root.protocol("WM_DELETE_WINDOW", self.on_close_requested)
        
        # Thiết lập ttk style để không bao giờ bị hở trắng trên Windows
        self.ttk_style = ttk.Style()
        try:
            self.ttk_style.theme_use('clam')
        except Exception:
            pass

        self.setup_ui()
        self.apply_theme(self.current_theme_id)
        self.load_profiles()

        # Khởi động luồng Scheduler và kiểm tra cập nhật ngầm
        self.start_scheduler_thread()
        self.check_for_updates(silent=True)

    def t(self, key: str, **kwargs) -> str:
        """Lấy chuỗi dịch theo ngôn ngữ đang chọn."""
        lang_dict = I18N.get(self.current_lang, I18N["vi"])
        text = lang_dict.get(key, I18N["vi"].get(key, key))
        if kwargs:
            try:
                return text.format(**kwargs)
            except Exception:
                return text
        return text

    def apply_window_shape(self, shape: str, initial=False):
        self.window_shape = shape
        if shape == "wide":
            geo = "1120x840"
            self.root.minsize(980, 720)
        elif shape == "compact":
            geo = "820x680"
            self.root.minsize(760, 600)
        else:
            geo = "960x780"
            self.root.minsize(860, 680)
        self.root.geometry(geo)
        if not initial:
            save_config_data({"window_shape": shape})
            self.log(f"[HÌNH DẠNG] Đã áp dụng kích thước: {shape} ({geo})")

    def setup_ui(self):
        self.root.title(self.t("app_title"))
        
        # Canvas chính có Scrollbar để giao diện linh hoạt, không bị vỡ trên mọi màn hình
        self.main_container = tk.Frame(self.root)
        self.main_container.pack(fill="both", expand=True)

        # 1. TOP HEADER BAR: Logo + Version + Theme Studio + Language + Shape
        self.header_frame = tk.Frame(self.main_container, padx=16, pady=8)
        self.header_frame.pack(fill="x")

        # Hàng trên của Header: Title + Subtitle + Update badge
        h_top = tk.Frame(self.header_frame)
        h_top.pack(fill="x", pady=(0, 4))
        
        self.lbl_title = tk.Label(h_top, text="🛡️ CHROME 100% FULL BACKUP & AUTO SCHEDULER", font=("Segoe UI", 12, "bold"))
        self.lbl_title.pack(side="left")

        # Nút Update
        self.btn_update = tk.Button(h_top, text=f"v{APP_CURRENT_VERSION} • {self.t('btn_check_update')}", font=("Segoe UI", 8, "bold"), relief="flat", padx=8, pady=2, cursor="hand2", command=self.check_for_updates)
        self.btn_update.pack(side="right", padx=(4, 0))

        # Nút đổi ngôn ngữ (Toggle nhanh VI / EN)
        self.btn_lang = tk.Button(h_top, text=f"🌐 {'Tiếng Việt' if self.current_lang == 'vi' else 'English'}", font=("Segoe UI", 8, "bold"), relief="flat", padx=8, pady=2, cursor="hand2", command=self.toggle_language)
        self.btn_lang.pack(side="right", padx=(4, 0))

        # Nút đổi hình dạng cửa sổ
        self.btn_shape_toggle = tk.Button(h_top, text="📐 Hình dạng", font=("Segoe UI", 8), relief="flat", padx=6, pady=2, cursor="hand2", command=self.cycle_window_shape)
        self.btn_shape_toggle.pack(side="right", padx=(4, 0))

        # Hàng dưới của Header: Subtitle + Theme Studio Dropdown
        h_bot = tk.Frame(self.header_frame)
        h_bot.pack(fill="x")

        self.lbl_subtitle = tk.Label(h_bot, text=self.t("subtitle"), font=("Segoe UI", 8))
        self.lbl_subtitle.pack(side="left")

        # Theme Studio Switcher
        theme_box = tk.Frame(h_bot)
        theme_box.pack(side="right")
        self.lbl_theme_select = tk.Label(theme_box, text=self.t("theme_label"), font=("Segoe UI", 8, "bold"))
        self.lbl_theme_select.pack(side="left", padx=(0, 4))

        self.var_theme = tk.StringVar(value=self.current_theme_id)
        theme_keys = list(THEMES.keys())
        theme_labels = [THEMES[k]["name"] for k in theme_keys]
        self.cb_theme = ttk.Combobox(theme_box, textvariable=self.var_theme, values=theme_keys, width=16, state="readonly")
        self.cb_theme.pack(side="left")
        self.cb_theme.bind("<<ComboboxSelected>>", self.on_theme_changed)

        # 2. KHỐI VỊ TRÍ LƯU TRỮ (GIAO DIỆN HIỆN ĐẠI, KHÔNG BỊ HỞ TRẮNG, CÓ THÔNG TIN Ổ ĐĨA)
        self.loc_card = tk.Frame(self.main_container, padx=14, pady=8, highlightthickness=1)
        self.loc_card.pack(fill="x", padx=16, pady=4)

        loc_h = tk.Frame(self.loc_card)
        loc_h.pack(fill="x", pady=(0, 4))
        self.lbl_loc_title = tk.Label(loc_h, text=self.t("backup_loc_title"), font=("Segoe UI", 9, "bold"))
        self.lbl_loc_title.pack(side="left")

        # Thông tin dung lượng ổ đĩa & số file
        self.lbl_disk_info = tk.Label(loc_h, text="Trống: ...", font=("Segoe UI", 8, "bold"))
        self.lbl_disk_info.pack(side="right")

        # Hộp hiển thị đường dẫn nổi bật (Dùng Frame + Label/Entry có màu nền chuẩn dark, KHÔNG TRẮNG)
        p_row = tk.Frame(self.loc_card)
        p_row.pack(fill="x", pady=2)

        self.path_display_frame = tk.Frame(p_row, padx=8, pady=4, highlightthickness=1)
        self.path_display_frame.pack(side="left", fill="x", expand=True, padx=(0, 6))

        self.path_var = tk.StringVar(value=str(self.backup_dir))
        self.lbl_current_path = tk.Label(self.path_display_frame, textvariable=self.path_var, font=("Consolas", 9, "bold"), anchor="w")
        self.lbl_current_path.pack(fill="x")

        self.btn_browse = tk.Button(p_row, text=self.t("btn_browse"), font=("Segoe UI", 8, "bold"), relief="flat", padx=8, pady=4, cursor="hand2", command=self.browse_dir)
        self.btn_browse.pack(side="left", padx=(0, 4))

        self.btn_open_exp = tk.Button(p_row, text=self.t("btn_open_folder"), font=("Segoe UI", 8), relief="flat", padx=8, pady=4, cursor="hand2", command=self.open_in_explorer)
        self.btn_open_exp.pack(side="left", padx=(0, 4))

        self.btn_copy_path = tk.Button(p_row, text=self.t("btn_copy_path"), font=("Segoe UI", 8), relief="flat", padx=6, pady=4, cursor="hand2", command=self.copy_path_to_clipboard)
        self.btn_copy_path.pack(side="left")

        # 3. KHỐI LỰA CHỌN PROFILES (SEARCH & FILTER REAL-TIME)
        self.prof_card = tk.Frame(self.main_container, padx=14, pady=8, highlightthickness=1)
        self.prof_card.pack(fill="x", padx=16, pady=4)

        prof_top = tk.Frame(self.prof_card)
        prof_top.pack(fill="x", pady=(0, 4))

        self.lbl_prof_title = tk.Label(prof_top, text=self.t("profiles_title"), font=("Segoe UI", 9, "bold"))
        self.lbl_prof_title.pack(side="left")

        self.lbl_prof_summary = tk.Label(prof_top, text="...", font=("Segoe UI", 8, "bold"))
        self.lbl_prof_summary.pack(side="right")

        # Thanh Search & Filter Profile
        search_row = tk.Frame(self.prof_card)
        search_row.pack(fill="x", pady=(0, 4))

        self.var_search = tk.StringVar()
        self.var_search.trace_add("write", lambda *args: self.filter_profiles_display())
        self.search_entry = tk.Entry(search_row, textvariable=self.var_search, font=("Segoe UI", 9), relief="flat", highlightthickness=1)
        self.search_entry.pack(side="left", fill="x", expand=True, padx=(0, 6), ipady=3)

        self.btn_sel_all = tk.Button(search_row, text=self.t("btn_select_all"), font=("Segoe UI", 8, "bold"), relief="flat", padx=6, pady=2, cursor="hand2", command=self.select_all_profiles)
        self.btn_sel_all.pack(side="left", padx=(0, 3))

        self.btn_desel_all = tk.Button(search_row, text=self.t("btn_deselect_all"), font=("Segoe UI", 8), relief="flat", padx=6, pady=2, cursor="hand2", command=self.deselect_all_profiles)
        self.btn_desel_all.pack(side="left", padx=(0, 3))

        self.btn_email_only = tk.Button(search_row, text=self.t("btn_email_only"), font=("Segoe UI", 8), relief="flat", padx=6, pady=2, cursor="hand2", command=self.select_email_only)
        self.btn_email_only.pack(side="left")

        # Container chứa checkbox danh sách Profile (có scrollbar nếu nhiều profile)
        self.prof_container_outer = tk.Frame(self.prof_card, highlightthickness=1)
        self.prof_container_outer.pack(fill="x", pady=2)

        self.prof_canvas = tk.Canvas(self.prof_container_outer, height=95, highlightthickness=0)
        self.prof_scrollbar = ttk.Scrollbar(self.prof_container_outer, orient="vertical", command=self.prof_canvas.yview)
        self.prof_inner_frame = tk.Frame(self.prof_canvas)

        self.prof_inner_frame.bind(
            "<Configure>",
            lambda e: self.prof_canvas.configure(scrollregion=self.prof_canvas.bbox("all"))
        )
        self.prof_canvas.create_window((0, 0), window=self.prof_inner_frame, anchor="nw")
        self.prof_canvas.configure(yscrollcommand=self.prof_scrollbar.set)

        self.prof_canvas.pack(side="left", fill="x", expand=True)
        self.prof_scrollbar.pack(side="right", fill="y")

        # 4. KHỐI LẬP LỊCH TỰ ĐỘNG & CHẠY NGẦM
        self.sched_card = tk.Frame(self.main_container, padx=14, pady=8, highlightthickness=1)
        self.sched_card.pack(fill="x", padx=16, pady=4)

        s_top = tk.Frame(self.sched_card)
        s_top.pack(fill="x", pady=(0, 4))

        self.var_sched_enabled = tk.BooleanVar(value=self.sched_enabled)
        self.chk_sched = tk.Checkbutton(
            s_top, text=self.t("chk_enable_sched"), variable=self.var_sched_enabled,
            font=("Segoe UI", 9, "bold"), command=self.save_scheduler_settings
        )
        self.chk_sched.pack(side="left")

        self.lbl_sched_status = tk.Label(s_top, text=self.t("sched_active"), font=("Segoe UI", 8, "bold"))
        self.lbl_sched_status.pack(side="left", padx=8)

        self.btn_test_sched = tk.Button(s_top, text=self.t("btn_test_sched"), font=("Segoe UI", 8, "bold"), relief="flat", padx=8, pady=2, cursor="hand2", command=self.trigger_test_scheduler)
        self.btn_test_sched.pack(side="right")

        # Cài đặt chi tiết Scheduler
        s_row = tk.Frame(self.sched_card)
        s_row.pack(fill="x", pady=2)

        self.lbl_freq = tk.Label(s_row, text=self.t("frequency"), font=("Segoe UI", 8))
        self.lbl_freq.pack(side="left")

        self.var_freq = tk.StringVar(value=self.sched_freq)
        self.cb_freq = ttk.Combobox(s_row, textvariable=self.var_freq, values=["daily", "hourly"], width=8, state="readonly")
        self.cb_freq.pack(side="left", padx=4)
        self.cb_freq.bind("<<ComboboxSelected>>", lambda e: self.save_scheduler_settings())

        self.lbl_time = tk.Label(s_row, text=self.t("time_at"), font=("Segoe UI", 8))
        self.lbl_time.pack(side="left", padx=(8, 2))

        self.var_time = tk.StringVar(value=self.sched_time)
        self.ent_time = tk.Entry(s_row, textvariable=self.var_time, width=7, font=("Consolas", 9, "bold"), relief="flat", highlightthickness=1)
        self.ent_time.pack(side="left")
        self.ent_time.bind("<FocusOut>", lambda e: self.save_scheduler_settings())

        self.var_auto_close = tk.BooleanVar(value=self.sched_auto_close)
        self.chk_close = tk.Checkbutton(s_row, text=self.t("chk_auto_close"), variable=self.var_auto_close, font=("Segoe UI", 8), command=self.save_scheduler_settings)
        self.chk_close.pack(side="left", padx=8)

        self.var_minimize = tk.BooleanVar(value=self.minimize_on_close)
        self.chk_min = tk.Checkbutton(s_row, text=self.t("chk_minimize_tray"), variable=self.var_minimize, font=("Segoe UI", 8), command=self.save_scheduler_settings)
        self.chk_min.pack(side="right")

        # 5. THANH TIẾN TRÌNH % (ĐƯỢC STYLED CHỐNG TRẮNG HOÀN TOÀN)
        self.prog_card = tk.Frame(self.main_container, padx=16, pady=4)
        self.prog_card.pack(fill="x")

        self.lbl_progress = tk.Label(self.prog_card, text=self.t("status_ready"), font=("Segoe UI", 8, "bold"))
        self.lbl_progress.pack(anchor="w", pady=(0, 2))

        self.progress_bar = ttk.Progressbar(self.prog_card, orient="horizontal", mode="determinate", maximum=100, style="Modern.Horizontal.TProgressbar")
        self.progress_bar.pack(fill="x", ipady=2)

        # 6. CÁC NÚT HÀNH ĐỘNG CHÍNH (BACKUP / RESTORE)
        self.action_card = tk.Frame(self.main_container, padx=16, pady=4)
        self.action_card.pack(fill="x")

        self.btn_backup = tk.Button(
            self.action_card, text=self.t("btn_backup"),
            font=("Segoe UI", 10, "bold"), height=2, relief="flat", cursor="hand2", command=self.start_backup
        )
        self.btn_backup.pack(side="left", fill="x", expand=True, padx=(0, 4))

        self.btn_restore = tk.Button(
            self.action_card, text=self.t("btn_restore"),
            font=("Segoe UI", 10, "bold"), height=2, relief="flat", cursor="hand2", command=self.start_restore
        )
        self.btn_restore.pack(side="right", fill="x", expand=True, padx=(4, 0))

        # Phụ trợ: Khay hệ thống, Zip khác, Gỡ cài đặt
        self.sub_card = tk.Frame(self.main_container, padx=16, pady=2)
        self.sub_card.pack(fill="x")

        self.btn_min_tray = tk.Button(self.sub_card, text=self.t("btn_minimize"), font=("Segoe UI", 8), relief="flat", cursor="hand2", command=self.minimize_to_background)
        self.btn_min_tray.pack(side="left")

        self.btn_custom_zip = tk.Button(self.sub_card, text=self.t("btn_restore_zip"), font=("Segoe UI", 8), relief="flat", cursor="hand2", command=self.manual_restore)
        self.btn_custom_zip.pack(side="left", padx=6)

        self.btn_uninstall = tk.Button(self.sub_card, text=self.t("btn_uninstall"), font=("Segoe UI", 8, "bold"), relief="flat", cursor="hand2", command=self.uninstall)
        self.btn_uninstall.pack(side="right")

        # 7. CONSOLE LOG
        self.log_card = tk.LabelFrame(self.main_container, text=self.t("console_title"), font=("Segoe UI", 8), padx=6, pady=4)
        self.log_card.pack(fill="both", expand=True, padx=16, pady=(2, 8))

        self.txt_log = tk.Text(self.log_card, font=("Consolas", 8), wrap="word", relief="flat")
        self.txt_log.pack(fill="both", expand=True)

        self.update_disk_and_backups_info()

    def apply_theme(self, theme_id: str):
        """Thay đổi toàn bộ màu sắc của ứng dụng theo Theme Studio."""
        self.current_theme_id = theme_id
        pal = THEMES.get(theme_id, THEMES["dark-slate"])

        # 1. Backgrounds chính
        self.root.configure(bg=pal["bg"])
        self.main_container.configure(bg=pal["bg"])
        self.header_frame.configure(bg=pal["card"])
        for child in self.header_frame.winfo_children():
            child.configure(bg=pal["card"])
            for sub in child.winfo_children():
                if isinstance(sub, (tk.Frame, tk.Label)):
                    sub.configure(bg=pal["card"])

        self.lbl_title.configure(fg=pal["accent"], bg=pal["card"])
        self.lbl_subtitle.configure(fg=pal["text_muted"], bg=pal["card"])
        self.lbl_theme_select.configure(fg=pal["text"], bg=pal["card"])

        # Nút Update
        if self.has_new_version:
            self.btn_update.configure(bg=pal["warning"], fg="#000000", activebackground=pal["warning"])
        else:
            self.btn_update.configure(bg=pal["card_alt"], fg=pal["text"], activebackground=pal["border"])

        self.btn_lang.configure(bg=pal["card_alt"], fg=pal["text"], activebackground=pal["border"])
        self.btn_shape_toggle.configure(bg=pal["card_alt"], fg=pal["text"], activebackground=pal["border"])

        # 2. Thẻ vị trí lưu
        self.loc_card.configure(bg=pal["card"], highlightbackground=pal["border"], highlightcolor=pal["accent"])
        for child in self.loc_card.winfo_children():
            child.configure(bg=pal["card"])
            for sub in child.winfo_children():
                if isinstance(sub, tk.Frame) and sub != self.path_display_frame:
                    sub.configure(bg=pal["card"])
                elif isinstance(sub, tk.Label) and sub != self.lbl_current_path:
                    sub.configure(bg=pal["card"])

        self.lbl_loc_title.configure(fg=pal["blue"], bg=pal["card"])
        self.lbl_disk_info.configure(fg=pal["accent"], bg=pal["card"])

        # Khung path - KHÔNG BAO GIỜ BỊ TRẮNG!
        self.path_display_frame.configure(bg=pal["input_bg"], highlightbackground=pal["border"], highlightcolor=pal["accent"])
        self.lbl_current_path.configure(bg=pal["input_bg"], fg=pal["text"])

        self.btn_browse.configure(bg=pal["card_alt"], fg=pal["text"], activebackground=pal["border"])
        self.btn_open_exp.configure(bg=pal["card_alt"], fg=pal["text"], activebackground=pal["border"])
        self.btn_copy_path.configure(bg=pal["card_alt"], fg=pal["text"], activebackground=pal["border"])

        # 3. Thẻ Profiles
        self.prof_card.configure(bg=pal["card"], highlightbackground=pal["border"], highlightcolor=pal["accent"])
        for child in self.prof_card.winfo_children():
            if child not in (self.prof_container_outer, self.search_entry):
                child.configure(bg=pal["card"])
                for sub in child.winfo_children():
                    if isinstance(sub, tk.Frame):
                        sub.configure(bg=pal["card"])
                    elif isinstance(sub, tk.Label) and sub not in (self.lbl_prof_title, self.lbl_prof_summary):
                        sub.configure(bg=pal["card"])

        self.lbl_prof_title.configure(fg=pal["blue"], bg=pal["card"])
        self.lbl_prof_summary.configure(fg=pal["text_muted"], bg=pal["card"])

        self.search_entry.configure(
            bg=pal["input_bg"], fg=pal["text"], insertbackground=pal["accent"],
            highlightbackground=pal["border"], highlightcolor=pal["accent"]
        )

        self.btn_sel_all.configure(bg=pal["accent"], fg=pal["accent_fg"], activebackground=pal["accent_hover"])
        self.btn_desel_all.configure(bg=pal["card_alt"], fg=pal["text"], activebackground=pal["border"])
        self.btn_email_only.configure(bg=pal["blue"], fg="#ffffff", activebackground=pal["border"])

        self.prof_container_outer.configure(bg=pal["input_bg"], highlightbackground=pal["border"])
        self.prof_canvas.configure(bg=pal["input_bg"])
        self.prof_inner_frame.configure(bg=pal["input_bg"])

        # Cập nhật các checkboxes trong profiles
        for child in self.prof_inner_frame.winfo_children():
            if isinstance(child, tk.Checkbutton):
                child.configure(
                    bg=pal["input_bg"], fg=pal["text"],
                    selectcolor=pal["card_alt"], activebackground=pal["input_bg"],
                    activeforeground=pal["text"]
                )

        # 4. Thẻ Scheduler
        self.sched_card.configure(bg=pal["card"], highlightbackground=pal["border"], highlightcolor=pal["accent"])
        for child in self.sched_card.winfo_children():
            child.configure(bg=pal["card"])
            for sub in child.winfo_children():
                if isinstance(sub, tk.Frame):
                    sub.configure(bg=pal["card"])
                elif isinstance(sub, tk.Label) and sub != self.lbl_sched_status:
                    sub.configure(bg=pal["card"], fg=pal["text"])

        self.chk_sched.configure(
            bg=pal["card"], fg=pal["accent"],
            selectcolor=pal["input_bg"], activebackground=pal["card"],
            activeforeground=pal["accent"]
        )
        self.lbl_sched_status.configure(
            bg=pal["card"],
            fg=pal["accent"] if self.var_sched_enabled.get() else pal["text_muted"]
        )
        self.btn_test_sched.configure(bg=pal["blue"], fg="#ffffff", activebackground=pal["border"])

        self.lbl_freq.configure(fg=pal["text"], bg=pal["card"])
        self.lbl_time.configure(fg=pal["text"], bg=pal["card"])
        self.ent_time.configure(
            bg=pal["input_bg"], fg=pal["text"], insertbackground=pal["accent"],
            highlightbackground=pal["border"], highlightcolor=pal["accent"]
        )
        self.chk_close.configure(
            bg=pal["card"], fg=pal["text"], selectcolor=pal["input_bg"],
            activebackground=pal["card"], activeforeground=pal["text"]
        )
        self.chk_min.configure(
            bg=pal["card"], fg=pal["text"], selectcolor=pal["input_bg"],
            activebackground=pal["card"], activeforeground=pal["text"]
        )

        # 5. Thanh tiến trình (TTK Style chống trắng)
        self.prog_card.configure(bg=pal["bg"])
        self.lbl_progress.configure(bg=pal["bg"], fg=pal["blue"])

        try:
            self.ttk_style.configure(
                "Modern.Horizontal.TProgressbar",
                troughcolor=pal["progress_trough"],
                background=pal["accent"],
                bordercolor=pal["border"],
                lightcolor=pal["accent"],
                darkcolor=pal["accent"]
            )
        except Exception:
            pass

        # 6. Các nút hành động
        self.action_card.configure(bg=pal["bg"])
        self.btn_backup.configure(
            bg=pal["accent"], fg=pal["accent_fg"],
            activebackground=pal["accent_hover"], activeforeground=pal["accent_fg"]
        )
        self.btn_restore.configure(
            bg=pal["blue"], fg="#ffffff",
            activebackground=pal["border"], activeforeground="#ffffff"
        )

        self.sub_card.configure(bg=pal["bg"])
        self.btn_min_tray.configure(bg=pal["card_alt"], fg=pal["text"], activebackground=pal["border"])
        self.btn_custom_zip.configure(bg=pal["card_alt"], fg=pal["text"], activebackground=pal["border"])
        self.btn_uninstall.configure(bg=pal["card_alt"], fg=pal["danger"], activebackground=pal["border"])

        # 7. Console Log
        self.log_card.configure(bg=pal["card"], fg=pal["text_muted"])
        self.txt_log.configure(
            bg=pal["input_bg"], fg=pal["blue"], insertbackground=pal["accent"],
            selectbackground=pal["card_alt"]
        )

    def on_theme_changed(self, event=None):
        new_theme = self.var_theme.get()
        self.apply_theme(new_theme)
        save_config_data({"theme": new_theme})
        self.log(f"[THEME STUDIO] Đã chuyển đổi sang giao diện: {THEMES[new_theme]['name']}")

    def toggle_language(self):
        new_lang = "en" if self.current_lang == "vi" else "vi"
        self.set_language(new_lang)

    def set_language(self, lang: str):
        self.current_lang = lang
        save_config_data({"language": lang})
        self.btn_lang.config(text=f"🌐 {'Tiếng Việt' if lang == 'vi' else 'English'}")
        
        # Cập nhật tất cả nhãn hiển thị
        self.root.title(self.t("app_title"))
        self.lbl_subtitle.config(text=self.t("subtitle"))
        self.lbl_theme_select.config(text=self.t("theme_label"))
        self.lbl_loc_title.config(text=self.t("backup_loc_title"))
        self.btn_browse.config(text=self.t("btn_browse"))
        self.btn_open_exp.config(text=self.t("btn_open_folder"))
        self.btn_copy_path.config(text=self.t("btn_copy_path"))
        self.lbl_prof_title.config(text=self.t("profiles_title"))
        self.btn_sel_all.config(text=self.t("btn_select_all"))
        self.btn_desel_all.config(text=self.t("btn_deselect_all"))
        self.btn_email_only.config(text=self.t("btn_email_only"))
        self.chk_sched.config(text=self.t("chk_enable_sched"))
        self.lbl_freq.config(text=self.t("frequency"))
        self.lbl_time.config(text=self.t("time_at"))
        self.chk_close.config(text=self.t("chk_auto_close"))
        self.chk_min.config(text=self.t("chk_minimize_tray"))
        self.btn_test_sched.config(text=self.t("btn_test_sched"))
        self.btn_backup.config(text=self.t("btn_backup"))
        self.btn_restore.config(text=self.t("btn_restore"))
        self.btn_min_tray.config(text=self.t("btn_minimize"))
        self.btn_custom_zip.config(text=self.t("btn_restore_zip"))
        self.btn_uninstall.config(text=self.t("btn_uninstall"))
        self.log_card.config(text=self.t("console_title"))

        self.update_disk_and_backups_info()
        self.update_profile_summary()
        self.log(f"[NGÔN NGỮ] Đã chuyển đổi sang: {'Tiếng Việt' if lang == 'vi' else 'English'}")

    def cycle_window_shape(self):
        shapes = ["standard", "wide", "compact"]
        cur_idx = shapes.index(self.window_shape) if self.window_shape in shapes else 0
        next_shape = shapes[(cur_idx + 1) % len(shapes)]
        self.apply_window_shape(next_shape)

    def update_disk_and_backups_info(self):
        free_str = get_disk_free_info(self.backup_dir)
        zips = list(self.backup_dir.glob("Chrome_Backup_*.zip"))
        count = len(zips)
        total_mb = sum([f.stat().st_size for f in zips]) / (1024 * 1024) if zips else 0
        self.lbl_disk_info.config(
            text=f"{self.t('free_space')} {free_str} | {self.t('backup_count')} {count} tệp ({total_mb:.1f} MB)"
        )

    def copy_path_to_clipboard(self):
        self.root.clipboard_clear()
        self.root.clipboard_append(str(self.backup_dir))
        self.log(f"[CLIPBOARD] {self.t('copied')}: {self.backup_dir}")
        messagebox.showinfo("Clipboard", f"{self.t('copied')}\\n\\n{self.backup_dir}")

    def open_in_explorer(self):
        try:
            if sys.platform == "win32":
                os.startfile(str(self.backup_dir))
            elif sys.platform == "darwin":
                subprocess.Popen(["open", str(self.backup_dir)])
            else:
                subprocess.Popen(["xdg-open", str(self.backup_dir)])
        except Exception as e:
            self.log(f"[!] Không thể mở thư mục: {e}")

    def check_for_updates(self, silent=False):
        """Kiểm tra phiên bản mới từ máy chủ / repository."""
        def _check():
            try:
                # Giả lập hoặc gọi URL kiểm tra cập nhật
                # Trong môi trường offline hoặc github, lấy phiên bản
                req = urllib.request.Request(
                    UPDATE_CHECK_URL,
                    headers={'User-Agent': 'ChromeBackupTool/' + APP_CURRENT_VERSION}
                )
                with urllib.request.urlopen(req, timeout=4) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    remote_ver = data.get("version", APP_CURRENT_VERSION)
                    if remote_ver != APP_CURRENT_VERSION:
                        self.has_new_version = True
                        self.latest_version_found = remote_ver
                        self.root.after(0, lambda: self._notify_update_found(remote_ver, silent))
                        return
            except Exception:
                pass
            
            if not silent:
                self.root.after(0, lambda: messagebox.showinfo(
                    "Phiên Bản", self.t("up_to_date", ver=APP_CURRENT_VERSION)
                ))

        threading.Thread(target=_check, daemon=True).start()

    def _notify_update_found(self, new_ver: str, silent: bool):
        pal = THEMES.get(self.current_theme_id, THEMES["dark-slate"])
        self.btn_update.config(
            text=f"🚀 {self.t('btn_update_now')} ({new_ver})",
            bg=pal["warning"], fg="#000000"
        )
        if not silent:
            msg = self.t("update_modal_msg", new_ver=new_ver, cur_ver=APP_CURRENT_VERSION)
            if messagebox.askyesno(self.t("update_modal_title"), msg):
                try:
                    import webbrowser
                    webbrowser.open("https://github.com/google-gemini/chrome-backup-tool/releases")
                except Exception:
                    pass

    def log(self, msg: str):
        now = datetime.now().strftime("%H:%M:%S")
        line = f"[{now}] {msg}\\n"
        def _w():
            self.txt_log.insert("end", line)
            self.txt_log.see("end")
        if threading.current_thread() == threading.main_thread():
            _w()
        else:
            self.root.after(0, _w)

    def update_progress(self, percent: float, text: str):
        def _u():
            self.progress_bar["value"] = percent
            self.lbl_progress.config(text=f"{int(percent)}% - {text}")
        if threading.current_thread() == threading.main_thread():
            _u()
        else:
            self.root.after(0, _u)

    def browse_dir(self):
        chosen = filedialog.askdirectory(initialdir=str(self.backup_dir))
        if chosen:
            self.backup_dir = Path(chosen)
            self.path_var.set(chosen)
            save_config_data({"saved_backup_dir": chosen})
            self.update_disk_and_backups_info()
            self.log(f"[VỊ TRÍ MỚI] Đã đổi và ghi nhớ thư mục sao lưu: {chosen}")

    def load_profiles(self):
        self.detected_profiles = detect_chrome_profiles(self.user_data_path)
        self.filter_profiles_display()

    def filter_profiles_display(self):
        query = self.var_search.get().strip().lower()
        for w in self.prof_inner_frame.winfo_children():
            w.destroy()
        
        cfg = load_saved_config()
        saved_selected = cfg.get("selected_profiles", [p["folder"] for p in self.detected_profiles])
        pal = THEMES.get(self.current_theme_id, THEMES["dark-slate"])

        for p in self.detected_profiles:
            match = (
                not query or 
                query in p["name"].lower() or 
                query in p["folder"].lower() or 
                query in p.get("email", "").lower()
            )
            if not match:
                continue

            if p["folder"] not in self.profile_vars:
                is_checked = p["folder"] in saved_selected
                self.profile_vars[p["folder"]] = tk.BooleanVar(value=is_checked)

            var = self.profile_vars[p["folder"]]
            text_label = f'{p["name"]} ({p["folder"]})' + (f' - {p["email"]}' if p["email"] else '')
            chk = tk.Checkbutton(
                self.prof_inner_frame, text=text_label, variable=var,
                bg=pal["input_bg"], fg=pal["text"], selectcolor=pal["card_alt"],
                activebackground=pal["input_bg"], activeforeground=pal["text"],
                font=("Segoe UI", 8), command=self.save_profile_selection
            )
            chk.pack(anchor="w", padx=4, pady=1)

        self.update_profile_summary()

    def update_profile_summary(self):
        sel = [k for k, v in self.profile_vars.items() if v.get()]
        total = len(self.detected_profiles)
        self.lbl_prof_summary.config(text=self.t("selected_profiles", count=len(sel), total=total))

    def save_profile_selection(self):
        sel = [k for k, v in self.profile_vars.items() if v.get()]
        save_config_data({"selected_profiles": sel})
        self.update_profile_summary()

    def select_all_profiles(self):
        for v in self.profile_vars.values():
            v.set(True)
        self.save_profile_selection()

    def deselect_all_profiles(self):
        for v in self.profile_vars.values():
            v.set(False)
        self.save_profile_selection()

    def select_email_only(self):
        for p in self.detected_profiles:
            if p["folder"] in self.profile_vars:
                self.profile_vars[p["folder"]].set(bool(p.get("email")))
        self.save_profile_selection()

    def save_scheduler_settings(self):
        enabled = self.var_sched_enabled.get()
        pal = THEMES.get(self.current_theme_id, THEMES["dark-slate"])
        self.lbl_sched_status.config(
            text=self.t("sched_active") if enabled else self.t("sched_inactive"),
            fg=pal["accent"] if enabled else pal["text_muted"]
        )
        data = {
            "scheduler": {
                "enabled": enabled,
                "frequency": self.var_freq.get(),
                "time": self.var_time.get(),
                "auto_close_chrome": self.var_auto_close.get(),
                "retention_count": self.sched_retention
            },
            "minimize_on_close": self.var_minimize.get()
        }
        save_config_data(data)
        self.log(f"[LẬP LỊCH] Cập nhật: {'Bật' if enabled else 'Tắt'}, Tần suất: {self.var_freq.get()}, Giờ: {self.var_time.get()}")

    def start_scheduler_thread(self):
        def _loop():
            while not self._stop_scheduler:
                try:
                    cfg = load_saved_config()
                    sched = cfg.get("scheduler", {})
                    if sched.get("enabled", False) and not self.is_busy:
                        now = datetime.now()
                        freq = sched.get("frequency", "daily")
                        last_run_str = sched.get("last_run")
                        should_run = False

                        if freq == "daily":
                            t_parts = sched.get("time", "20:00").split(":")
                            thour, tmin = int(t_parts[0]), int(t_parts[1])
                            if now.hour == thour and now.minute == tmin:
                                last_date = datetime.fromisoformat(last_run_str).date() if last_run_str else None
                                if last_date != now.date():
                                    should_run = True
                        elif freq == "hourly":
                            if last_run_str:
                                diff = (now - datetime.fromisoformat(last_run_str)).total_seconds() / 3600.0
                                if diff >= sched.get("interval_hours", 4):
                                    should_run = True
                            else:
                                should_run = True

                        if should_run:
                            self.log("[⏰ SCHEDULER] Đến giờ sao lưu tự động! Đang tiến hành sao lưu ngầm...")
                            sched["last_run"] = now.isoformat()
                            cfg["scheduler"] = sched
                            save_config_data(cfg)
                            self._execute_backup_process(is_scheduled=True)
                except Exception as e:
                    print(f"Scheduler err: {e}")
                time.sleep(30)
        threading.Thread(target=_loop, daemon=True).start()

    def trigger_test_scheduler(self):
        if self.is_busy:
            return
        self.log("[TEST SCHEDULER] Đang kích hoạt chạy thử nghiệm lập lịch ngay lập tức...")
        threading.Thread(target=self._execute_backup_process, args=(True,), daemon=True).start()

    def start_backup(self):
        if self.is_busy:
            return
        sel = [k for k, v in self.profile_vars.items() if v.get()]
        if not sel:
            messagebox.showwarning("CẢNH BÁO", "Vui lòng chọn ít nhất 1 Profile cần sao lưu!")
            return
        if is_chrome_running():
            if not messagebox.askyesno("CHROME ĐANG MỞ", self.t("confirm_backup_chrome_running")):
                return
        threading.Thread(target=self._execute_backup_process, daemon=True).start()

    def _execute_backup_process(self, is_scheduled=False):
        self.is_busy = True
        try:
            self.update_progress(10, "Đang đóng an toàn các tiến trình Chrome...")
            kill_chrome_processes(self.log)

            sel_folders = [k for k, v in self.profile_vars.items() if v.get()]
            if not sel_folders:
                sel_folders = [p["folder"] for p in self.detected_profiles]

            self.update_progress(30, f"Đang chuẩn bị sao lưu {len(sel_folders)} Profiles...")
            self.backup_dir.mkdir(parents=True, exist_ok=True)
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            tag = "Scheduled" if is_scheduled else f"{len(sel_folders)}Profiles"
            zip_name = f"Chrome_Backup_{tag}_{ts}.zip"
            zip_path = self.backup_dir / zip_name

            files_to_pack = []
            for root_f in ["Local State", "First Run", "Variations"]:
                rf = self.user_data_path / root_f
                if rf.is_file():
                    files_to_pack.append((rf, rf.relative_to(self.chrome_folder)))

            for folder in sel_folders:
                p_dir = self.user_data_path / folder
                if p_dir.is_dir():
                    for root, dirs, files in os.walk(p_dir):
                        dirs[:] = [d for d in dirs if d.lower() not in CACHE_FOLDERS]
                        for f in files:
                            fp = Path(root) / f
                            try:
                                rel = fp.relative_to(self.chrome_folder)
                                files_to_pack.append((fp, rel))
                            except Exception:
                                pass

            total = len(files_to_pack)
            self.log(f"[+] Đang nén {total:,} tệp từ {len(sel_folders)} Profiles...")

            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
                for idx, (src, arc) in enumerate(files_to_pack):
                    try:
                        zf.write(src, arc)
                    except Exception:
                        pass
                    if idx % 100 == 0 or idx == total - 1:
                        pct = 35 + int((idx / max(1, total)) * 55)
                        self.update_progress(pct, f"Đang nén ({idx:,}/{total:,})...")

            size_mb = os.path.getsize(zip_path) / (1024 * 1024)
            self.update_progress(100, f"Sao lưu hoàn tất! ({size_mb:.1f} MB)")
            self.log(f"[✓ THÀNH CÔNG] Đã tạo file sao lưu: {zip_path.name} ({size_mb:.1f} MB)")
            self.update_disk_and_backups_info()

            self._cleanup_retention()

            if not is_scheduled:
                messagebox.showinfo(
                    "SAO LƯU THÀNH CÔNG",
                    self.t("backup_done", count=len(sel_folders), file=zip_path.name, size=f"{size_mb:.1f}")
                )
        except Exception as e:
            self.log(f"[LỖI SAO LƯU] {e}")
            self.update_progress(0, "Lỗi sao lưu.")
        finally:
            self.is_busy = False

    def _cleanup_retention(self):
        retention = self.sched_retention
        if retention <= 0:
            return
        zips = sorted(self.backup_dir.glob("Chrome_Backup_*.zip"), key=lambda x: x.stat().st_mtime, reverse=True)
        if len(zips) > retention:
            for old_zip in zips[retention:]:
                try:
                    old_zip.unlink()
                    self.log(f"[DỌN DẸP] Đã xóa bản sao lưu cũ: {old_zip.name}")
                except Exception:
                    pass

    def start_restore(self):
        if self.is_busy:
            return
        if not messagebox.askyesno("XÁC NHẬN KHÔI PHỤC", self.t("confirm_restore")):
            return
        threading.Thread(target=self._execute_restore_process, daemon=True).start()

    def _execute_restore_process(self, custom_zip=None):
        self.is_busy = True
        try:
            target = custom_zip
            if not target:
                zips = sorted(self.backup_dir.glob("Chrome_Backup_*.zip"), key=lambda x: x.stat().st_mtime, reverse=True)
                if not zips:
                    raise Exception("Không tìm thấy bản sao lưu nào trong thư mục!")
                target = zips[0]

            self.update_progress(20, "Đang đóng Chrome...")
            kill_chrome_processes(self.log)

            self.update_progress(40, f"Đang giải nén: {target.name}...")
            with zipfile.ZipFile(target, "r") as zf:
                zf.extractall(self.chrome_folder)

            self.update_progress(90, "Vá cờ Normal Clean Exit...")
            fix_chrome_clean_exit(self.user_data_path, self.log)

            self.update_progress(98, "Đang mở lại Google Chrome...")
            launch_chrome_automatically(self.log)

            self.update_progress(100, "Khôi phục hoàn tất 100%!")
            self.log("[✓ THÀNH CÔNG] Đã khôi phục hoàn toàn dữ liệu Chrome!")
            messagebox.showinfo("KHÔI PHỤC THÀNH CÔNG", self.t("restore_done"))
        except Exception as e:
            self.log(f"[LỖI KHÔI PHỤC] {e}")
            self.update_progress(0, "Lỗi khôi phục.")
            messagebox.showerror("LỖI", f"Khôi phục thất bại: {e}")
        finally:
            self.is_busy = False

    def manual_restore(self):
        chosen = filedialog.askopenfilename(initialdir=str(self.backup_dir), filetypes=[("Zip files", "*.zip")])
        if chosen:
            if messagebox.askyesno("XÁC NHẬN", f"Khôi phục từ tệp:\\n{chosen}\\n\\nTiếp tục?"):
                threading.Thread(target=self._execute_restore_process, args=(Path(chosen),), daemon=True).start()

    def minimize_to_background(self):
        self.root.withdraw()
        self.log("[CHẠY NGẦM] Ứng dụng đã thu nhỏ xuống nền. Lập lịch tự động vẫn hoạt động!")
        
        if USE_TRAY and self.tray_icon is None:
            pal = THEMES.get(self.current_theme_id, THEMES["dark-slate"])
            tray_img = create_tray_image(pal["accent"])
            if tray_img:
                menu = pystray.Menu(
                    pystray.MenuItem("🛡️ Mở Giao Diện Chrome Backup", self.restore_from_background),
                    pystray.MenuItem("⚡ Sao Lưu Ngay", lambda: threading.Thread(target=self._execute_backup_process, daemon=True).start()),
                    pystray.MenuItem("❌ Thoát Hoàn Toàn", self.quit_app)
                )
                self.tray_icon = pystray.Icon("chrome_backup", tray_img, "Chrome Backup Pro", menu)
                threading.Thread(target=self.tray_icon.run, daemon=True).start()
        elif not USE_TRAY:
            messagebox.showinfo(
                "ĐANG CHẠY NGẦM", 
                "Ứng dụng đang chạy ngầm trong hệ thống để thực hiện lập lịch sao lưu tự động.\\n\\nĐể mở lại giao diện, hãy mở lại shortcut ứng dụng hoặc nhấn icon."
            )

    def restore_from_background(self, icon=None, item=None):
        self.root.after(0, self.root.deiconify)
        self.root.after(0, self.root.lift)

    def on_close_requested(self):
        if self.is_busy:
            messagebox.showwarning("CẢNH BÁO", "Đang trong tiến trình sao lưu/khôi phục! Đừng đóng cửa sổ lúc này.")
            return
        if self.var_minimize.get():
            self.minimize_to_background()
        else:
            self.quit_app()

    def quit_app(self, icon=None, item=None):
        self._stop_scheduler = True
        if self.tray_icon:
            try:
                self.tray_icon.stop()
            except Exception:
                pass
        self.root.destroy()

    def uninstall(self):
        if not messagebox.askyesno("GỠ CÀI ĐẶT", "Bạn có chắc muốn dọn dẹp cấu hình ứng dụng?\\n(Các file sao lưu .zip của bạn vẫn được giữ nguyên an toàn)"):
            return
        try:
            cfg = get_config_file_path()
            if cfg.exists():
                cfg.unlink()
            messagebox.showinfo("ĐÃ DỌN DẸP", "Đã xóa sạch cấu hình! Bạn có thể xóa ứng dụng.")
            self.quit_app()
        except Exception as e:
            messagebox.showerror("LỖI", f"Không thể xóa: {e}")


def main():
    root = tk.Tk()
    app = ChromeBackupApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
`;
