export const DESKTOP_APP_PYTHON_CODE = `"""
========================================================================================
   CHROME 100% FULL PROFILE BACKUP & RESTORE APP (DESKTOP PRO v6.0)
   - Chạy ngầm (Background Daemon / System Tray)
   - Lập lịch sao lưu tự động (Auto Backup Scheduler)
   - Chọn lọc từng Profile Chrome (Profile Selector & Filter)
   - 1-Click Auto Backup & 1-Click Auto Restore (Tự động đóng Chrome, nén SQLite)
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
from datetime import datetime
from pathlib import Path

import tkinter as tk
from tkinter import ttk, filedialog, messagebox

# Hỗ trợ giao diện hiện đại CustomTkinter nếu có, tự động fallback về Tkinter gốc
USE_CTK = False
ctk = None
try:
    import customtkinter as _ctk
    _ctk.set_appearance_mode("Dark")
    try:
        _ctk.set_default_color_theme("green")
    except Exception:
        pass
    ctk = _ctk
    USE_CTK = True
except Exception:
    USE_CTK = False

# Hỗ trợ System Tray (pystray + PIL) nếu có
USE_TRAY = False
try:
    import pystray
    from PIL import Image, ImageDraw
    USE_TRAY = True
except Exception:
    USE_TRAY = False

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

def create_tray_image():
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
        self.root.title("🛡️ Chrome Full Backup & Scheduler Pro (v6.0)")
        self.root.geometry("900x780")
        self.root.minsize(820, 680)

        self.chrome_folder = get_chrome_folder_path()
        self.user_data_path = get_chrome_user_data_path()
        
        cfg = load_saved_config()
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

        # Cấu hình Scheduler
        sched_cfg = cfg.get("scheduler", {})
        self.sched_enabled = sched_cfg.get("enabled", True)
        self.sched_freq = sched_cfg.get("frequency", "daily") # daily | hourly
        self.sched_time = sched_cfg.get("time", "12:00")
        self.sched_interval = sched_cfg.get("interval_hours", 4)
        self.sched_auto_close = sched_cfg.get("auto_close_chrome", True)
        self.sched_retention = sched_cfg.get("retention_count", 5)
        self.minimize_on_close = cfg.get("minimize_on_close", True)

        self.root.protocol("WM_DELETE_WINDOW", self.on_close_requested)
        self.setup_ui()
        self.load_profiles()

        # Khởi động luồng Scheduler chạy ngầm
        self.start_scheduler_thread()

    def setup_ui(self):
        # 1. Header
        header = tk.Frame(self.root, bg="#0f172a", padx=16, pady=10)
        header.pack(fill="x")
        tk.Label(header, text="🛡️ CHROME 100% FULL BACKUP & AUTO SCHEDULER", font=("Segoe UI", 13, "bold"), fg="#22c55e", bg="#0f172a").pack(anchor="w")
        tk.Label(header, text="Bản Desktop Pro • Chạy Ngầm (Tray Daemon) • Lập Lịch Tự Động • Tùy Chọn Profiles", font=("Segoe UI", 9), fg="#94a3b8", bg="#0f172a").pack(anchor="w")

        # 2. Vị trí sao lưu
        p_box = tk.LabelFrame(self.root, text="📁 Vị trí thư mục sao lưu (Tự động ghi nhớ)", bg="#1e293b", fg="#38bdf8", font=("Segoe UI", 9, "bold"), padx=10, pady=5)
        p_box.pack(fill="x", padx=16, pady=4)
        p_row = tk.Frame(p_box, bg="#1e293b")
        p_row.pack(fill="x")
        self.path_var = tk.StringVar(value=str(self.backup_dir))
        entry = tk.Entry(p_row, textvariable=self.path_var, state="readonly", bg="#090d16", fg="#ffffff", font=("Consolas", 9))
        entry.pack(side="left", fill="x", expand=True, padx=(0, 6))
        tk.Button(p_row, text="📁 Đổi Thư Mục...", bg="#334155", fg="white", relief="flat", command=self.browse_dir).pack(side="right")

        # 3. LỰA CHỌN PROFILES (PROFILE SELECTOR - ĐỒNG BỘ WEB)
        prof_box = tk.LabelFrame(self.root, text="👥 Lựa Chọn Profiles Chrome Cần Sao Lưu (Đồng bộ với bản Web)", bg="#1e293b", fg="#38bdf8", font=("Segoe UI", 9, "bold"), padx=10, pady=5)
        prof_box.pack(fill="x", padx=16, pady=4)
        
        prof_top = tk.Frame(prof_box, bg="#1e293b")
        prof_top.pack(fill="x", pady=(0, 4))
        tk.Button(prof_top, text="✓ Chọn Tất Cả", bg="#16a34a", fg="white", font=("Segoe UI", 8), relief="flat", command=self.select_all_profiles).pack(side="left", padx=(0, 4))
        tk.Button(prof_top, text="✕ Bỏ Chọn Hết", bg="#475569", fg="white", font=("Segoe UI", 8), relief="flat", command=self.deselect_all_profiles).pack(side="left", padx=(0, 4))
        tk.Button(prof_top, text="📧 Chỉ Có Email", bg="#0284c7", fg="white", font=("Segoe UI", 8), relief="flat", command=self.select_email_only).pack(side="left")
        
        self.lbl_prof_summary = tk.Label(prof_top, text="Đang quét profiles...", bg="#1e293b", fg="#94a3b8", font=("Segoe UI", 8))
        self.lbl_prof_summary.pack(side="right")

        self.prof_container = tk.Frame(prof_box, bg="#090d16", padx=6, pady=4)
        self.prof_container.pack(fill="x")

        # 4. LẬP LỊCH SAO LƯU TỰ ĐỘNG & CHẠY NGẦM (SCHEDULER CARD)
        sched_box = tk.LabelFrame(self.root, text="⏰ Lập Lịch Tự Động & Chạy Ngầm (Auto Scheduler Daemon)", bg="#1e293b", fg="#38bdf8", font=("Segoe UI", 9, "bold"), padx=10, pady=6)
        sched_box.pack(fill="x", padx=16, pady=4)

        s_row1 = tk.Frame(sched_box, bg="#1e293b")
        s_row1.pack(fill="x", pady=2)

        self.var_sched_enabled = tk.BooleanVar(value=self.sched_enabled)
        chk_sched = tk.Checkbutton(s_row1, text="Kích hoạt Tự Động Sao Lưu Ngầm Theo Lịch", variable=self.var_sched_enabled, bg="#1e293b", fg="#22c55e", selectcolor="#090d16", activebackground="#1e293b", activeforeground="#22c55e", font=("Segoe UI", 9, "bold"), command=self.save_scheduler_settings)
        chk_sched.pack(side="left")

        self.lbl_sched_status = tk.Label(s_row1, text="[ĐANG BẬT NGẦM]", bg="#1e293b", fg="#22c55e", font=("Segoe UI", 8, "bold"))
        self.lbl_sched_status.pack(side="left", padx=8)

        tk.Button(s_row1, text="▶️ Chạy Thử Lịch Ngay", bg="#0284c7", fg="white", font=("Segoe UI", 8, "bold"), relief="flat", command=self.trigger_test_scheduler).pack(side="right")

        s_row2 = tk.Frame(sched_box, bg="#1e293b")
        s_row2.pack(fill="x", pady=2)

        tk.Label(s_row2, text="Tần suất:", bg="#1e293b", fg="#cbd5e1", font=("Segoe UI", 8)).pack(side="left")
        self.var_freq = tk.StringVar(value=self.sched_freq)
        cb_freq = ttk.Combobox(s_row2, textvariable=self.var_freq, values=["daily", "hourly"], width=8, state="readonly")
        cb_freq.pack(side="left", padx=4)
        cb_freq.bind("<<ComboboxSelected>>", lambda e: self.save_scheduler_settings())

        tk.Label(s_row2, text="Giờ sao lưu (HH:MM):", bg="#1e293b", fg="#cbd5e1", font=("Segoe UI", 8)).pack(side="left", padx=(8, 2))
        self.var_time = tk.StringVar(value=self.sched_time)
        ent_time = tk.Entry(s_row2, textvariable=self.var_time, width=6, bg="#090d16", fg="white", font=("Consolas", 9))
        ent_time.pack(side="left")
        ent_time.bind("<FocusOut>", lambda e: self.save_scheduler_settings())

        self.var_auto_close = tk.BooleanVar(value=self.sched_auto_close)
        chk_close = tk.Checkbutton(s_row2, text="Tự tắt Chrome", variable=self.var_auto_close, bg="#1e293b", fg="#cbd5e1", selectcolor="#090d16", activebackground="#1e293b", font=("Segoe UI", 8), command=self.save_scheduler_settings)
        chk_close.pack(side="left", padx=8)

        self.var_minimize = tk.BooleanVar(value=self.minimize_on_close)
        chk_min = tk.Checkbutton(s_row2, text="Thu nhỏ chạy ngầm khi bấm [X]", variable=self.var_minimize, bg="#1e293b", fg="#cbd5e1", selectcolor="#090d16", activebackground="#1e293b", font=("Segoe UI", 8), command=self.save_scheduler_settings)
        chk_min.pack(side="right")

        # 5. Thanh tiến trình
        prog_box = tk.Frame(self.root, bg="#0f172a", padx=16, pady=2)
        prog_box.pack(fill="x")
        self.lbl_progress = tk.Label(prog_box, text="Sẵn sàng thực hiện", fg="#38bdf8", bg="#0f172a", font=("Segoe UI", 8, "bold"))
        self.lbl_progress.pack(anchor="w")
        self.progress_bar = ttk.Progressbar(prog_box, orient="horizontal", mode="determinate", maximum=100)
        self.progress_bar.pack(fill="x", pady=2)

        # 6. Các nút hành động chính
        btn_box = tk.Frame(self.root, bg="#0f172a", padx=16, pady=4)
        btn_box.pack(fill="x")
        self.btn_backup = tk.Button(btn_box, text="⚡ 1-CLICK AUTO BACKUP\\n(Sao Lưu Profiles Đã Chọn)", bg="#16a34a", fg="white", font=("Segoe UI", 10, "bold"), height=2, relief="flat", command=self.start_backup)
        self.btn_backup.pack(side="left", fill="x", expand=True, padx=(0, 4))
        self.btn_restore = tk.Button(btn_box, text="🔄 1-CLICK AUTO RESTORE\\n(Khôi Phục & Mở Lại Chrome)", bg="#2563eb", fg="white", font=("Segoe UI", 10, "bold"), height=2, relief="flat", command=self.start_restore)
        self.btn_restore.pack(side="right", fill="x", expand=True, padx=(4, 0))

        # Phụ trợ: Chạy ngầm + Gỡ cài đặt
        sub_row = tk.Frame(self.root, bg="#0f172a", padx=16, pady=2)
        sub_row.pack(fill="x")
        tk.Button(sub_row, text="🔽 Thu Nhỏ Xuống Chạy Ngầm (Tray)", bg="#334155", fg="white", font=("Segoe UI", 8), relief="flat", command=self.minimize_to_background).pack(side="left")
        tk.Button(sub_row, text="📁 Khôi phục từ zip khác...", bg="#334155", fg="white", font=("Segoe UI", 8), relief="flat", command=self.manual_restore).pack(side="left", padx=6)
        tk.Button(sub_row, text="🗑️ Gỡ Cài Đặt (Uninstall)", bg="#7f1d1d", fg="#fca5a5", font=("Segoe UI", 8), relief="flat", command=self.uninstall).pack(side="right")

        # 7. Nhật ký console log
        log_frame = tk.LabelFrame(self.root, text="Nhật ký hoạt động (Console Logs)", bg="#0f172a", fg="#94a3b8", font=("Segoe UI", 8), padx=6, pady=4)
        log_frame.pack(fill="both", expand=True, padx=16, pady=(2, 8))
        self.txt_log = tk.Text(log_frame, bg="#090d16", fg="#38bdf8", font=("Consolas", 8), wrap="word", relief="flat")
        self.txt_log.pack(fill="both", expand=True)

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
        chosen = filedialog.askdirectory(initialdir=self.path_var.get())
        if chosen:
            self.backup_dir = Path(chosen)
            self.path_var.set(chosen)
            save_config_data({"saved_backup_dir": chosen})
            self.log(f"[VỊ TRÍ MỚI] Đã đổi và ghi nhớ thư mục sao lưu: {chosen}")

    def load_profiles(self):
        self.detected_profiles = detect_chrome_profiles(self.user_data_path)
        for w in self.prof_container.winfo_children():
            w.destroy()
        self.profile_vars = {}

        cfg = load_saved_config()
        saved_selected = cfg.get("selected_profiles", [p["folder"] for p in self.detected_profiles])

        for p in self.detected_profiles:
            is_checked = p["folder"] in saved_selected
            var = tk.BooleanVar(value=is_checked)
            self.profile_vars[p["folder"]] = var
            text_label = f'{p["name"]} ({p["folder"]})' + (f' - {p["email"]}' if p["email"] else '')
            chk = tk.Checkbutton(
                self.prof_container, text=text_label, variable=var,
                bg="#090d16", fg="#cbd5e1", selectcolor="#1e293b", activebackground="#090d16",
                font=("Segoe UI", 8), command=self.save_profile_selection
            )
            chk.pack(anchor="w", padx=4, pady=1)

        self.update_profile_summary()

    def update_profile_summary(self):
        sel = [k for k, v in self.profile_vars.items() if v.get()]
        total = len(self.detected_profiles)
        self.lbl_prof_summary.config(text=f"Đã chọn: {len(sel)}/{total} Profiles")

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
            self.profile_vars[p["folder"]].set(bool(p["email"]))
        self.save_profile_selection()

    def save_scheduler_settings(self):
        enabled = self.var_sched_enabled.get()
        self.lbl_sched_status.config(
            text="[ĐANG BẬT NGẦM]" if enabled else "[ĐANG TẮT]",
            fg="#22c55e" if enabled else "#94a3b8"
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
        """Khởi động luồng daemon kiểm tra thời gian sao lưu định kỳ trong nền."""
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
                            t_parts = sched.get("time", "12:00").split(":")
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
            messagebox.showwarning("CHƯA CHỌN PROFILE", "Vui lòng chọn ít nhất 1 Profile cần sao lưu!")
            return
        if is_chrome_running():
            if not messagebox.askyesno("CHROME ĐANG CHẠY", "Google Chrome đang chạy ngầm. Ứng dụng sẽ tự động đóng Chrome để tránh khóa file SQLite.\\n\\nTiếp tục?"):
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

            # Thu thập files cần sao lưu
            files_to_pack = []
            
            # File hệ thống cốt lõi tại User Data (Local State chứa encryption key DPAPI)
            for root_f in ["Local State", "First Run", "Variations"]:
                rf = self.user_data_path / root_f
                if rf.is_file():
                    files_to_pack.append((rf, rf.relative_to(self.chrome_folder)))

            # Profiles được chọn
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

            # Dọn dẹp bản sao lưu cũ theo retention
            self._cleanup_retention()

            if not is_scheduled:
                messagebox.showinfo("SAO LƯU THÀNH CÔNG", f"Đã sao lưu thành công {len(sel_folders)} Profiles!\\n\\nFile: {zip_path.name}\\nDung lượng: {size_mb:.1f} MB")
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
                    self.log(f"[DỌN DẸP] Đã xóa bản sao lưu cũ vượt quá {retention} bản: {old_zip.name}")
                except Exception:
                    pass

    def start_restore(self):
        if self.is_busy:
            return
        if not messagebox.askyesno("XÁC NHẬN KHÔI PHỤC", "Khôi phục 1-Click sẽ ghi đè Profiles hiện tại bằng bản sao lưu mới nhất.\\nChrome sẽ tự động đóng và mở lại.\\n\\nTiếp tục?"):
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
            messagebox.showinfo("KHÔI PHỤC THÀNH CÔNG", "Đã khôi phục thành công 100%! Chrome đã được mở lại.")
        except Exception as e:
            self.log(f"[LỖI KHÔI PHỤC] {e}")
            self.update_progress(0, "Lỗi khôi phục.")
            messagebox.showerror("LỖI", f"Khôi phục thất bại: {e}")
        finally:
            self.is_busy = False

    def manual_restore(self):
        chosen = filedialog.askopenfilename(initialdir=self.backup_dir, filetypes=[("Zip files", "*.zip")])
        if chosen:
            if messagebox.askyesno("XÁC NHẬN", f"Khôi phục từ tệp:\\n{chosen}\\n\\nTiếp tục?"):
                threading.Thread(target=self._execute_restore_process, args=(Path(chosen),), daemon=True).start()

    def minimize_to_background(self):
        """Thu nhỏ ứng dụng xuống chạy ngầm trong khay hệ thống hoặc nền."""
        self.root.withdraw()
        self.log("[CHẠY NGẦM] Ứng dụng đã thu nhỏ xuống nền. Lập lịch tự động vẫn hoạt động!")
        
        if USE_TRAY and self.tray_icon is None:
            tray_img = create_tray_image()
            if tray_img:
                menu = pystray.Menu(
                    pystray.MenuItem("🛡️ Mở Giao Diện Chrome Backup", self.restore_from_background),
                    pystray.MenuItem("⚡ Sao Lưu Ngay", lambda: threading.Thread(target=self._execute_backup_process, daemon=True).start()),
                    pystray.MenuItem("❌ Thoát Hoàn Toàn", self.quit_app)
                )
                self.tray_icon = pystray.Icon("chrome_backup", tray_img, "Chrome Backup & Scheduler", menu)
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
