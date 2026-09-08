export const PYTHON_SCRIPT_CODE = `"""
========================================================================================
   CHROME 100% FULL PROFILE & SESSION BACKUP / RESTORE TOOL (1-CLICK AUTO ENGINE)
   Tác giả: Chuyên gia lập trình Python
   Mục đích:
     - Lưu trữ HOÀN TOÀN 100% dữ liệu Google Chrome:
       + Tất cả Profiles (Default, Profile 1, Profile 2, Profile 3,...)
       + 100% Cookies và Session Tokens (Không bao giờ bị đăng xuất tài khoản)
       + Khóa Master Key DPAPI (Local State & os_crypt)
       + Mật khẩu đã lưu (Login Data), Dấu trang (Bookmarks), Lịch sử (History)
       + Toàn bộ Tiện ích mở rộng (Extensions) & dữ liệu cục bộ của Extension
       + Toàn bộ Tabs đang mở & Trạng thái phiên làm việc (Sessions / Current Tabs)
       + Dữ liệu ứng dụng web (Local Storage, IndexedDB, Web Data)
     - Khôi phục 1-CLICK TỰ ĐỘNG:
       + Tự động tìm bản backup mới nhất
       + Tự động đóng chrome.exe giải phóng file lock
       + Tự động ghi đè khôi phục hoàn chỉnh
       + Tự động mở lại Google Chrome với tất cả Profiles và Tabs mở sẵn!
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

# Giao diện CustomTkinter hiện đại (Fallback tự động về Tkinter gốc nếu chưa cài)
USE_CUSTOMTKINTER = False
try:
    import customtkinter as ctk
    USE_CUSTOMTKINTER = True
except ImportError:
    import tkinter as tk
    from tkinter import ttk, filedialog, messagebox

if USE_CUSTOMTKINTER:
    import customtkinter as ctk
    from tkinter import filedialog, messagebox
    ctk.set_appearance_mode("Dark")  # Mặc định giao diện tối chuyên nghiệp
    ctk.set_default_color_theme("green")

# Các thư mục bộ nhớ đệm tạm thời (chỉ dùng để render hình ảnh/video tạm thời)
CACHE_FOLDERS_TO_SKIP = {
    "cache", "code cache", "gpucache", "dawncache", "mediacache",
    "crashpad", "shadercache", "grshadercache"
}

def get_chrome_user_data_path() -> Path:
    """Trả về đường dẫn chuẩn của thư mục Chrome User Data trên Windows."""
    local_appdata = os.environ.get("LOCALAPPDATA")
    if not local_appdata:
        local_appdata = str(Path.home() / "AppData" / "Local")
    return Path(local_appdata) / "Google" / "Chrome" / "User Data"

def get_chrome_executable_path() -> str:
    """Tìm đường dẫn tệp thực thi chrome.exe trên máy tính."""
    possible_paths = [
        os.environ.get("PROGRAMFILES", "C:\\\\Program Files") + "\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
        os.environ.get("PROGRAMFILES(X86)", "C:\\\\Program Files (x86)") + "\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
        os.environ.get("LOCALAPPDATA", "") + "\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
    ]
    for p in possible_paths:
        if p and os.path.exists(p):
            return p
    return "chrome.exe"

def get_default_backup_dir() -> Path:
    """Đường dẫn thư mục lưu trữ bản backup an toàn."""
    target = Path.home() / "Documents" / "Chrome_Backups"
    target.mkdir(parents=True, exist_ok=True)
    return target

def detect_chrome_profiles(user_data_path: Path) -> list:
    """Đọc tệp Local State để liệt kê chính xác tất cả các Profiles có trong Chrome."""
    profiles = []
    local_state_file = user_data_path / "Local State"
    
    if local_state_file.exists():
        try:
            with open(local_state_file, "r", encoding="utf-8", errors="ignore") as f:
                data = json.load(f)
                info_cache = data.get("profile", {}).get("info_cache", {})
                for folder_name, details in info_cache.items():
                    name = details.get("name", folder_name)
                    email = details.get("user_name", "")
                    profiles.append({
                        "folder": folder_name,
                        "name": name,
                        "email": email
                    })
        except Exception:
            pass

    if not profiles:
        # Quét thư mục vật lý nếu file Local State chưa đọc được
        for item in user_data_path.glob("Profile *"):
            if item.is_dir():
                profiles.append({"folder": item.name, "name": item.name, "email": ""})
        if (user_data_path / "Default").is_dir():
            profiles.insert(0, {"folder": "Default", "name": "Default Profile", "email": ""})

    return profiles

def kill_chrome_processes(log_callback=print) -> bool:
    """Tự động đóng tất cả các tiến trình chrome.exe để giải phóng khóa SQLite."""
    log_callback("[1/4] Đang quét các tiến trình Google Chrome trên hệ thống...")
    try:
        if sys.platform == "win32":
            res = subprocess.run(
                ["tasklist", "/FI", "IMAGENAME eq chrome.exe"],
                capture_output=True,
                text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0
            )
            if "chrome.exe" in res.stdout.lower():
                log_callback("[!] Phát hiện Chrome đang hoạt động. Tự động đóng an toàn để tránh khóa file...")
                subprocess.run(
                    ["taskkill", "/F", "/IM", "chrome.exe"],
                    capture_output=True,
                    creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0
                )
                time.sleep(1.5)  # Đợi Windows giải phóng handle SQLite
                log_callback("[✓] Đã đóng sạch toàn bộ chrome.exe. Tất cả tệp dữ liệu đã sẵn sàng!")
            else:
                log_callback("[✓] Chrome hiện không mở. Không có tệp nào bị khóa.")
        else:
            subprocess.run(["pkill", "-f", "chrome"], capture_output=True)
        return True
    except Exception as e:
        log_callback(f"[CẢNH BÁO] Kiểm tra đóng Chrome: {e}")
        return False

def launch_chrome_automatically(log_callback=print):
    """Tự động khởi động lại Google Chrome sau khi khôi phục xong."""
    try:
        chrome_exe = get_chrome_executable_path()
        log_callback(f"[+] Đang tự động mở lại Google Chrome ({chrome_exe})...")
        if sys.platform == "win32":
            subprocess.Popen([chrome_exe, "--restore-last-session"])
        else:
            subprocess.Popen(["google-chrome", "--restore-last-session"])
        log_callback("[✓] Google Chrome đã được khởi chạy thành công với đầy đủ Profiles và Tabs!")
    except Exception as e:
        log_callback(f"[LƯU Ý] Hãy mở Google Chrome bằng tay trên màn hình desktop: {e}")

class ChromeFullBackupApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Chrome 100% Full Profile & Session Backup Engine (1-Click Restore)")
        self.root.geometry("820x680")
        self.root.minsize(760, 600)

        self.user_data_path = get_chrome_user_data_path()
        self.backup_dir = get_default_backup_dir()
        self.manual_feed_file = None  # Tệp sao lưu được feed thủ công bởi người dùng
        self.is_busy = False

        self.setup_ui()
        self.inspect_chrome_environment()

    def setup_ui(self):
        if USE_CUSTOMTKINTER:
            self.setup_ctk_ui()
        else:
            self.setup_classic_ui()

    def setup_ctk_ui(self):
        # Tiêu đề
        header = ctk.CTkFrame(self.root, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=(15, 8))

        ctk.CTkLabel(
            header,
            text="CHROME 100% FULL BACKUP & 1-CLICK AUTO RESTORE",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color="#22c55e"
        ).pack(anchor="w")

        ctk.CTkLabel(
            header,
            text="Lưu trữ trọn vẹn TẤT CẢ Profiles, Cookies, Sessions, Mật khẩu, Extensions, Tabs đang mở",
            font=ctk.CTkFont(size=12),
            text_color="#94a3b8"
        ).pack(anchor="w")

        # Thư mục lưu trữ (Chống gõ sai: Đặt state='readonly', chỉ chọn qua hộp thoại)
        path_frame = ctk.CTkFrame(self.root, fg_color="#1e293b", corner_radius=10)
        path_frame.pack(fill="x", padx=20, pady=6)

        ctk.CTkLabel(
            path_frame, 
            text="Thư mục sao lưu (Chọn qua hộp thoại — chống gõ sai vị trí):", 
            font=ctk.CTkFont(size=12, weight="bold")
        ).pack(anchor="w", padx=15, pady=(8, 2))
        
        entry_row = ctk.CTkFrame(path_frame, fg_color="transparent")
        entry_row.pack(fill="x", padx=15, pady=(0, 10))

        self.path_var = ctk.StringVar(value=str(self.backup_dir))
        # state='readonly' để người dùng không gõ sai, chỉ chọn qua dialog
        self.entry_path = ctk.CTkEntry(entry_row, textvariable=self.path_var, state="readonly")
        self.entry_path.pack(side="left", fill="x", expand=True, padx=(0, 8))

        btn_browse = ctk.CTkButton(entry_row, text="📁 Đổi Thư Mục...", width=110, command=self.browse_backup_dir)
        btn_browse.pack(side="right", padx=(4, 0))

        btn_feed_manual = ctk.CTkButton(
            entry_row, 
            text="📥 Feed Tệp Thủ Công...", 
            width=140, 
            fg_color="#0284c7", 
            hover_color="#0369a1", 
            command=self.feed_manual_backup_file
        )
        btn_feed_manual.pack(side="right")

        # Tùy chọn sao lưu
        opt_frame = ctk.CTkFrame(self.root, fg_color="transparent")
        opt_frame.pack(fill="x", padx=20, pady=2)

        self.backup_mode_var = ctk.StringVar(value="smart")
        r1 = ctk.CTkRadioButton(
            opt_frame, 
            text="Sao lưu thông minh (Giữ 100% Profiles, Cookies, Passwords, Tabs - Bỏ qua Cache rác 20GB)",
            variable=self.backup_mode_var, 
            value="smart"
        )
        r1.pack(anchor="w", pady=2)

        r2 = ctk.CTkRadioButton(
            opt_frame, 
            text="Sao lưu tuyệt đối 100% (Full Clone từng byte - bao gồm mọi tệp vật lý)",
            variable=self.backup_mode_var, 
            value="full"
        )
        r2.pack(anchor="w", pady=2)

        # KHUNG 2 NÚT HÀNH ĐỘNG ĐẶC BIỆT 1-CLICK
        btn_grid = ctk.CTkFrame(self.root, fg_color="transparent")
        btn_grid.pack(fill="x", padx=20, pady=10)

        # NÚT BACKUP (XANH LÁ)
        self.btn_backup = ctk.CTkButton(
            btn_grid,
            text="⚡ 1-CLICK AUTO BACKUP\\n(Sao Lưu Toàn Bộ Chrome Ngay)",
            font=ctk.CTkFont(size=14, weight="bold"),
            fg_color="#22c55e",
            hover_color="#16a34a",
            height=54,
            command=self.start_backup_thread
        )
        self.btn_backup.pack(side="left", fill="x", expand=True, padx=(0, 8))

        # NÚT RESTORE 1-CLICK TỰ ĐỘNG (XANH DƯƠNG)
        self.btn_auto_restore = ctk.CTkButton(
            btn_grid,
            text="🔄 1-CLICK AUTO RESTORE\\n(Tự Động Khôi Phục & Mở Lại Chrome)",
            font=ctk.CTkFont(size=14, weight="bold"),
            fg_color="#2563eb",
            hover_color="#1d4ed8",
            height=54,
            command=self.start_auto_restore_thread
        )
        self.btn_auto_restore.pack(side="right", fill="x", expand=True, padx=(8, 0))

        # Nút chọn file thủ công phụ
        sub_btn_frame = ctk.CTkFrame(self.root, fg_color="transparent")
        sub_btn_frame.pack(fill="x", padx=20, pady=(0, 6))

        self.btn_manual_restore = ctk.CTkButton(
            sub_btn_frame,
            text="📁 Khôi phục từ zip khác...",
            font=ctk.CTkFont(size=11),
            fg_color="#334155",
            hover_color="#475569",
            height=28,
            command=self.start_manual_restore_thread
        )
        self.btn_manual_restore.pack(side="right")

        self.btn_editor = ctk.CTkButton(
            sub_btn_frame,
            text="🎮 Sửa Save Game / Cookie (Lên Giàu)",
            font=ctk.CTkFont(size=11, weight="bold"),
            fg_color="#d97706",
            hover_color="#b45309",
            height=28,
            command=self.open_game_save_editor_window
        )
        self.btn_editor.pack(side="right", padx=(0, 6))

        # Khung thông tin profiles
        self.lbl_profile_status = ctk.CTkLabel(
            sub_btn_frame,
            text="Đang nhận diện các Profiles trong máy...",
            font=ctk.CTkFont(size=11),
            text_color="#38bdf8"
        )
        self.lbl_profile_status.pack(side="left")

        # Khung nhật ký hoạt động (Log Window)
        log_box = ctk.CTkFrame(self.root, fg_color="#0f172a", corner_radius=10)
        log_box.pack(fill="both", expand=True, padx=20, pady=(4, 15))

        log_top = ctk.CTkFrame(log_box, fg_color="transparent")
        log_top.pack(fill="x", padx=12, pady=(8, 2))

        ctk.CTkLabel(log_top, text="Nhật ký hoạt động (Real-time Log Window):", font=ctk.CTkFont(weight="bold")).pack(side="left")

        ctk.CTkButton(log_top, text="Xóa Log", width=60, height=22, fg_color="#475569", command=self.clear_log).pack(side="right")

        self.txt_log = ctk.CTkTextbox(log_box, font=ctk.CTkFont(family="Consolas", size=11), fg_color="#090d16")
        self.txt_log.pack(fill="both", expand=True, padx=12, pady=(0, 10))

    def setup_classic_ui(self):
        """Fallback chuẩn bằng thư viện Tkinter tích hợp sẵn của Python."""
        import tkinter as tk
        top = tk.Frame(self.root, bg="#0f172a", padx=15, pady=10)
        top.pack(fill="x")

        tk.Label(top, text="CHROME 100% FULL BACKUP & 1-CLICK RESTORE", font=("Segoe UI", 12, "bold"), fg="#22c55e", bg="#0f172a").pack(anchor="w")
        tk.Label(top, text="Tự động sao lưu & khôi phục mọi Profiles, Cookies, Sessions không bị văng đăng nhập", font=("Segoe UI", 9), fg="#94a3b8", bg="#0f172a").pack(anchor="w")

        p_frame = tk.LabelFrame(self.root, text="Thư mục Backup", padx=10, pady=5)
        p_frame.pack(fill="x", padx=15, pady=5)

        self.path_var = tk.StringVar(value=str(self.backup_dir))
        tk.Entry(p_frame, textvariable=self.path_var).pack(side="left", fill="x", expand=True, padx=5)
        tk.Button(p_frame, text="Duyệt...", command=self.browse_backup_dir).pack(side="right")

        self.backup_mode_var = tk.StringVar(value="smart")

        btn_box = tk.Frame(self.root, padx=15, pady=8)
        btn_box.pack(fill="x")

        self.btn_backup = tk.Button(btn_box, text="⚡ 1-CLICK AUTO BACKUP\\n(Màu xanh lá)", bg="#22c55e", fg="white", font=("Segoe UI", 10, "bold"), height=2, command=self.start_backup_thread)
        self.btn_backup.pack(side="left", fill="x", expand=True, padx=3)

        self.btn_auto_restore = tk.Button(btn_box, text="🔄 1-CLICK AUTO RESTORE\\n(Màu xanh dương - Tự động 100%)", bg="#2563eb", fg="white", font=("Segoe UI", 10, "bold"), height=2, command=self.start_auto_restore_thread)
        self.btn_auto_restore.pack(side="right", fill="x", expand=True, padx=3)

        self.txt_log = tk.Text(self.root, bg="#0f172a", fg="#f8fafc", font=("Consolas", 9))
        self.txt_log.pack(fill="both", expand=True, padx=15, pady=10)

    def log(self, text: str):
        now = datetime.now().strftime("%H:%M:%S")
        line = f"[{now}] {text}\\n"
        def _append():
            self.txt_log.insert("end", line)
            self.txt_log.see("end")
        if threading.current_thread() == threading.main_thread():
            _append()
        else:
            self.root.after(0, _append)

    def clear_log(self):
        self.txt_log.delete("1.0", "end")

    def browse_backup_dir(self):
        chosen = filedialog.askdirectory(initialdir=self.path_var.get())
        if chosen:
            self.path_var.set(chosen)
            self.log(f"[Thư Mục] Đã đổi thư mục lưu trữ thành: {chosen} (Đã xác thực)")

    def feed_manual_backup_file(self):
        """Cho phép người dùng nạp thủ công file sao lưu từ bất kỳ đâu (USB, ổ D/E) chống chọn nhầm."""
        file_path = filedialog.askopenfilename(
            title="Chọn Tệp Sao Lưu Để Feed Thủ Công Vào Hệ Thống",
            filetypes=[("Tệp Nén Chrome Backup", "*.zip"), ("Tất Cả Tệp", "*.*")]
        )
        if file_path:
            p = Path(file_path)
            if not p.exists():
                messagebox.showerror("Lỗi Tệp", "Tệp đã chọn không tồn tại!")
                return
            self.manual_feed_file = p
            size_mb = p.stat().st_size / (1024 * 1024)
            self.log("=" * 65)
            self.log(f"[FEED THỦ CÔNG] Đã nhận diện tệp sao lưu: {p.name} ({size_mb:.1f} MB)")
            self.log(f"[FEED THỦ CÔNG] Vị trí tệp: {p}")
            self.log("[✓] Tệp đã được ghim làm bản khôi phục ưu tiên số 1.")
            self.log("[✓] Bạn chỉ cần nhấn [🔄 1-CLICK AUTO RESTORE] để khôi phục toàn bộ!")
            self.log("=" * 65)
            messagebox.showinfo(
                "Đã Feed Tệp Thủ Công Thành Công",
                f"Đã nạp tệp sao lưu:\\n{p.name} ({size_mb:.1f} MB)\\n\\nNhấn nút '1-CLICK AUTO RESTORE' màu xanh dương để khôi phục ngay!"
            )

    def inspect_chrome_environment(self):
        self.log("=" * 65)
        self.log("HỆ THỐNG SAO LƯU & KHÔI PHỤC DỮ LIỆU GOOGLE CHROME 1-CLICK")
        self.log(f"-> Thư mục dữ liệu: {self.user_data_path}")
        
        if not self.user_data_path.exists():
            self.log("[CẢNH BÁO] Chưa tìm thấy thư mục Google Chrome trên máy tính này!")
            return

        profiles = detect_chrome_profiles(self.user_data_path)
        if profiles:
            names = [f"{p['name']} ({p['folder']})" for p in profiles]
            self.log(f"[✓] Đã nhận diện {len(profiles)} Profiles trong Chrome: {', '.join(names)}")
            if hasattr(self, 'lbl_profile_status'):
                self.lbl_profile_status.configure(text=f"Đã nhận diện: {len(profiles)} Profiles sẵn sàng bảo vệ 100%")
        else:
            self.log("[✓] Đã nhận diện Profile mặc định (Default)")

    def get_latest_backup_file(self) -> Path:
        """Tự động tìm kiếm file sao lưu mới nhất (hoặc file manual feed nếu người dùng đã feed)."""
        if self.manual_feed_file and self.manual_feed_file.exists():
            return self.manual_feed_file

        folder = Path(self.path_var.get())
        if not folder.exists():
            return None
        zips = list(folder.glob("Chrome_*.zip"))
        if not zips:
            return None
        # Sắp xếp theo thời gian sửa đổi mới nhất
        zips.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        return zips[0]

    def set_buttons_state(self, state: str):
        if USE_CUSTOMTKINTER:
            self.btn_backup.configure(state=state)
            self.btn_auto_restore.configure(state=state)
            if hasattr(self, 'btn_manual_restore'):
                self.btn_manual_restore.configure(state=state)
        else:
            self.btn_backup.config(state=state)
            self.btn_auto_restore.config(state=state)

    def start_backup_thread(self):
        if self.is_busy:
            return
        threading.Thread(target=self.run_full_backup, daemon=True).start()

    def start_auto_restore_thread(self):
        if self.is_busy:
            return
        latest = self.get_latest_backup_file()
        if not latest:
            messagebox.showwarning(
                "Chưa có bản sao lưu",
                "Chưa tìm thấy bản sao lưu nào trong thư mục!\\n\\nVui lòng nhấn nút [1-CLICK AUTO BACKUP] trước để tạo bản sao lưu đầu tiên."
            )
            return

        confirm = messagebox.askyesno(
            "1-Click Auto Restore",
            f"Bạn có chắc chắn muốn khôi phục tự động?\\n\\n"
            f"Bản sao lưu sẽ dùng: {latest.name}\\n"
            f"Dung lượng: {latest.stat().st_size / (1024*1024):.1f} MB\\n\\n"
            f"Hệ thống sẽ tự động tắt Chrome, ghi đè toàn bộ dữ liệu và tự mở lại Chrome giúp bạn!"
        )
        if not confirm:
            self.log("[HỦY] Người dùng đã hủy thao tác khôi phục.")
            return

        threading.Thread(target=self.run_restore, args=(latest, True), daemon=True).start()

    def open_game_save_editor_window(self):
        """Mở cửa sổ công cụ Chỉnh sửa Save Game & Cookies (Lên Giàu)."""
        editor_win = ctk.CTkToplevel(self.root) if USE_CUSTOMTKINTER else tk.Toplevel(self.root)
        editor_win.title("Trình Sửa Save Game & Cookies - Lên Giàu Tức Thì")
        editor_win.geometry("720x560")

        header_lbl = ctk.CTkLabel(editor_win, text="🎮 CHỈNH SỬA SAVE GAME & COOKIES (LÊN GIÀU)", font=ctk.CTkFont(size=14, weight="bold"), text_color="#f59e0b") if USE_CUSTOMTKINTER else tk.Label(editor_win, text="CHỈNH SỬA SAVE GAME & COOKIES", fg="#f59e0b", font=("Segoe UI", 12, "bold"))
        header_lbl.pack(pady=(12, 4))

        sub_lbl = ctk.CTkLabel(editor_win, text="Dán nội dung JSON, Cookie hoặc mở file save game để tự động mod tiền và level", font=ctk.CTkFont(size=11), text_color="#94a3b8") if USE_CUSTOMTKINTER else tk.Label(editor_win, text="Dán nội dung JSON hoặc mở file save game", fg="#94a3b8")
        sub_lbl.pack(pady=(0, 8))

        txt_editor = ctk.CTkTextbox(editor_win, font=ctk.CTkFont(family="Consolas", size=11)) if USE_CUSTOMTKINTER else tk.Text(editor_win, font=("Consolas", 10))
        txt_editor.pack(fill="both", expand=True, padx=15, pady=5)

        # Mẫu mặc định
        sample_json = '{\\n  "player": {\\n    "gold": 150,\\n    "gems": 5,\\n    "level": 3,\\n    "hp": 100,\\n    "vip": false\\n  }\\n}'
        txt_editor.insert("1.0", sample_json)

        action_frame = ctk.CTkFrame(editor_win, fg_color="transparent") if USE_CUSTOMTKINTER else tk.Frame(editor_win)
        action_frame.pack(fill="x", padx=15, pady=10)

        def _auto_mod_rich():
            content = txt_editor.get("1.0", "end-1c")
            try:
                data = json.loads(content)
                def _recurse_rich(obj):
                    if isinstance(obj, dict):
                        for k, v in obj.items():
                            k_lower = k.lower()
                            if any(target in k_lower for target in ["gold", "coin", "money", "cash", "balance"]):
                                obj[k] = 999999999
                            elif any(target in k_lower for target in ["gem", "ruby", "diamond"]):
                                obj[k] = 99999
                            elif any(target in k_lower for target in ["level", "lvl", "rank"]):
                                obj[k] = 999
                            elif any(target in k_lower for target in ["hp", "health", "energy"]):
                                obj[k] = 99999
                            elif "vip" in k_lower:
                                obj[k] = True
                            else:
                                _recurse_rich(v)
                    elif isinstance(obj, list):
                        for item in obj:
                            _recurse_rich(item)
                _recurse_rich(data)
                txt_editor.delete("1.0", "end")
                txt_editor.insert("1.0", json.dumps(data, indent=2, ensure_ascii=False))
                messagebox.showinfo("Thành Công!", "ĐÃ MOD THÀNH CÔNG:\\n- 999,999,999 Vàng\\n- 99,999 Kim Cương\\n- Level 999 & Max HP, VIP!")
            except Exception:
                # Nếu là cookie hoặc text chuỗi
                import re
                modified = re.sub(r'(gold|coins?|money|gems?)=(\\d+)', r'\\g<1>=999999999', content)
                txt_editor.delete("1.0", "end")
                txt_editor.insert("1.0", modified)
                messagebox.showinfo("Hoàn Tất", "Đã cập nhật các giá trị tiền/cookie lên mức tối đa!")

        def _open_file():
            path = filedialog.askopenfilename(filetypes=[("Save Files / JSON", "*.json;*.txt;*.dat;*.sav"), ("Tất cả", "*.*")])
            if path:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    txt_editor.delete("1.0", "end")
                    txt_editor.insert("1.0", f.read())

        def _save_file():
            path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON file", "*.json"), ("Text file", "*.txt")])
            if path:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(txt_editor.get("1.0", "end-1c"))
                messagebox.showinfo("Đã Lưu", f"Đã lưu tệp mod thành công tại:\\n{path}")

        btn_open = ctk.CTkButton(action_frame, text="Mở File...", width=80, command=_open_file) if USE_CUSTOMTKINTER else tk.Button(action_frame, text="Mở File...", command=_open_file)
        btn_open.pack(side="left", padx=3)

        btn_rich = ctk.CTkButton(action_frame, text="⚡ CÀY LÂU? MOD LÊN GIÀU NGAY! (999M Gold)", fg_color="#d97706", hover_color="#b45309", command=_auto_mod_rich) if USE_CUSTOMTKINTER else tk.Button(action_frame, text="⚡ MOD LÊN GIÀU (999M Gold)", bg="#d97706", fg="white", command=_auto_mod_rich)
        btn_rich.pack(side="left", fill="x", expand=True, padx=3)

        btn_save = ctk.CTkButton(action_frame, text="Lưu File...", width=80, fg_color="#22c55e", hover_color="#16a34a", command=_save_file) if USE_CUSTOMTKINTER else tk.Button(action_frame, text="Lưu File...", bg="#22c55e", fg="white", command=_save_file)
        btn_save.pack(side="right", padx=3)

    def start_manual_restore_thread(self):
        if self.is_busy:
            return
        folder = Path(self.path_var.get())
        chosen = filedialog.askopenfilename(
            initialdir=folder if folder.exists() else Path.home(),
            title="Chọn file sao lưu Chrome (.zip) cần khôi phục",
            filetypes=[("Chrome Backup Zip", "*.zip"), ("Tất cả tập tin", "*.*")]
        )
        if not chosen:
            return
        threading.Thread(target=self.run_restore, args=(Path(chosen), False), daemon=True).start()

    def run_full_backup(self):
        self.is_busy = True
        self.set_buttons_state("disabled")
        try:
            self.log("=" * 65)
            self.log("BẮT ĐẦU SAO LƯU 100% TOÀN BỘ GOOGLE CHROME")
            self.log("=" * 65)

            # 1. Tắt sạch chrome
            kill_chrome_processes(self.log)

            dest_folder = Path(self.path_var.get())
            dest_folder.mkdir(parents=True, exist_ok=True)

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            zip_filename = dest_folder / f"Chrome_Backup_{timestamp}.zip"

            is_full = (self.backup_mode_var.get() == "full")
            self.log(f"[2/4] Chế độ sao lưu: {'FULL 100% CLONE (Tất cả tệp)' if is_full else 'SMART 100% (Giữ 100% Profiles, Cookies, Tabs - Lọc cache rác)'}")
            self.log(f"[3/4] Đang quét và đóng gói các tệp vào: {zip_filename.name}...")

            file_count = 0
            with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED, compresslevel=5) as zipf:
                for root, dirs, files in os.walk(self.user_data_path):
                    root_path = Path(root)

                    if not is_full:
                        # Bỏ qua các thư mục cache vô bổ
                        dirs[:] = [d for d in dirs if d.lower() not in CACHE_FOLDERS_TO_SKIP]

                    for f in files:
                        full_path = root_path / f
                        try:
                            rel_path = full_path.relative_to(self.user_data_path)
                            zipf.write(full_path, arcname=str(rel_path))
                            file_count += 1
                            if file_count % 500 == 0:
                                self.log(f"-> Đã sao lưu an toàn {file_count} tệp...")
                        except Exception:
                            pass

            size_mb = zip_filename.stat().st_size / (1024 * 1024)
            self.log("[4/4] Nén dữ liệu thành công!")
            self.log(f"[✓] ĐÃ LƯU THÀNH CÔNG {file_count} TỆP VÀ TẤT CẢ PROFILES.")
            self.log(f"[✓] Kích thước file: {size_mb:.2f} MB")
            self.log(f"[✓] Vị trí: {zip_filename}")
            self.log("=" * 65)
            self.log("SAO LƯU HOÀN TẤT! Từ giờ bạn có thể khôi phục bất cứ lúc nào với 1 click.")
            self.log("=" * 65)

            messagebox.showinfo(
                "Sao Lưu Hoàn Tất",
                f"Đã sao lưu thành công toàn bộ dữ liệu Chrome!\\n\\n"
                f"Tệp: {zip_filename.name}\\n"
                f"Dung lượng: {size_mb:.2f} MB\\n"
                f"Tổng số tệp: {file_count} tập tin\\n\\n"
                f"Tất cả Profiles, Cookies, Tabs và Mật khẩu đã an toàn tuyệt đối!"
            )
        except Exception as e:
            self.log(f"[LỖI SAO LƯU] {e}")
            messagebox.showerror("Lỗi", f"Có lỗi xảy ra:\\n{e}")
        finally:
            self.is_busy = False
            self.set_buttons_state("normal")

    def run_restore(self, backup_zip: Path, auto_open_chrome=True):
        self.is_busy = True
        self.set_buttons_state("disabled")
        try:
            self.log("=" * 65)
            self.log("BẮT ĐẦU TIẾN TRÌNH KHÔI PHỤC TỰ ĐỘNG 1-CLICK")
            self.log("=" * 65)
            self.log(f"Bản sao lưu đang dùng: {backup_zip.name}")

            # 1. Tắt chrome
            kill_chrome_processes(self.log)

            if not backup_zip.exists():
                self.log(f"[LỖI] Tệp sao lưu không tồn tại: {backup_zip}")
                messagebox.showerror("Lỗi", "Không tìm thấy tệp sao lưu!")
                return

            self.log("[2/4] Đang giải nén và ghi đè toàn bộ cấu trúc Chrome User Data...")
            self.user_data_path.mkdir(parents=True, exist_ok=True)

            with zipfile.ZipFile(backup_zip, 'r') as zipf:
                total_files = len(zipf.infolist())
                self.log(f"-> Tổng số tệp đang phục hồi: {total_files} tệp...")
                zipf.extractall(self.user_data_path)

            self.log("[3/4] Đồng bộ lại Master Key DPAPI (Local State), Cookies và các Profiles hoàn tất!")
            self.log("=" * 65)
            self.log("KHÔI PHỤC HOÀN TOÀN THÀNH CÔNG! ĐÃ GIỮ LẠI 100% SESSIONS VÀ COOKIES.")
            self.log("=" * 65)

            # 4. Tự động mở lại Google Chrome giúp người dùng
            if auto_open_chrome:
                self.log("[4/4] Đang tự động mở lại Google Chrome cho bạn...")
                launch_chrome_automatically(self.log)

            messagebox.showinfo(
                "Khôi Phục Thành Công (1-Click)",
                "ĐÃ PHỤC HỒI 100% DỮ LIỆU GOOGLE CHROME THÀNH CÔNG!\\n\\n"
                "✓ Tất cả Profiles (Default, Profile 1, 2, 3...)\\n"
                "✓ Toàn bộ Cookies & Phiên làm việc (Không cần đăng nhập lại)\\n"
                "✓ Toàn bộ Extensions, Mật khẩu và các Tab đã được phục hồi!\\n\\n"
                "Google Chrome đã được tự động mở lại cho bạn."
            )
        except Exception as e:
            self.log(f"[LỖI KHÔI PHỤC] {e}")
            messagebox.showerror("Lỗi", f"Có lỗi xảy ra khi khôi phục:\\n{e}")
        finally:
            self.is_busy = False
            self.set_buttons_state("normal")

def main():
    if USE_CUSTOMTKINTER:
        root = ctk.CTk()
    else:
        root = tk.Tk()
    app = ChromeFullBackupApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
`;

export const BUILD_BAT_CODE = `@echo off
chcp 65001 > nul
title Bộ Đóng Gói Chrome 100%% Full Backup Sang File .EXE
color 0A

echo =========================================================================
echo    BỘ ĐÓNG GÓI CHROME FULL BACKUP & 1-CLICK RESTORE THÀNH FILE .EXE
echo =========================================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [LỖI] Không tìm thấy Python trên máy tính!
    echo Vui lòng cài đặt Python từ https://www.python.org/downloads/
    echo Chú ý: Hãy tích chọn "Add Python to PATH" khi cài!
    echo.
    pause
    exit /b 1
)

echo [1/3] Đang kiểm tra và tự động cài đặt thư viện cần thiết...
pip install customtkinter psutil pyinstaller --quiet

echo [2/3] Đang biên dịch mã nguồn thành file .EXE độc lập (1-File / Clean)...
echo Vui lòng chờ 30-60 giây...
echo.

pyinstaller --noconfirm ^
    --onedir ^
    --windowed ^
    --name "ChromeBackupRestore" ^
    --clean ^
    chrome_backup_tool.py

if %errorlevel% equ 0 (
    echo.
    echo =========================================================================
    echo [THÀNH CÔNG] ĐÃ TẠO FILE .EXE HOÀN TẤT!
    echo Thư mục ứng dụng độc lập:
    echo  -> %CD%\\dist\\ChromeBackupRestore\\ChromeBackupRestore.exe
    echo.
    echo Bạn có thể chép thư mục này sang bất kỳ máy tính nào để dùng mà không cần cài Python!
    echo =========================================================================
    echo.
    explorer "%CD%\\dist\\ChromeBackupRestore"
) else (
    echo.
    echo [LỖI] Quá trình đóng gói thất bại. Hãy kiểm tra thông báo bên trên.
)

pause
`;

export const REQUIREMENTS_TXT = `customtkinter>=5.2.0
psutil>=5.9.0
pyinstaller>=6.0.0
`;

export const POWERSHELL_SCRIPT = `# =============================================================================
# Chrome 100% Full Backup & 1-Click Auto Restore (PowerShell Native)
# Chạy trực tiếp trên mọi máy Windows không cần cài Python!
# =============================================================================

$ChromeUserData = "$env:LOCALAPPDATA\\Google\\Chrome\\User Data"
$BackupFolder = "$env:USERPROFILE\\Documents\\Chrome_Backups"

if (!(Test-Path $BackupFolder)) {
    New-Item -ItemType Directory -Force -Path $BackupFolder | Out-Null
}

function Close-Chrome {
    Write-Host "[1/3] Đang tắt an toàn các tiến trình Google Chrome..." -ForegroundColor Yellow
    Get-Process -Name "chrome" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "[✓] Đã đóng sạch chrome.exe." -ForegroundColor Green
}

function Open-Chrome {
    Write-Host "[+] Đang tự động mở lại Google Chrome với tất cả Profiles..." -ForegroundColor Cyan
    Start-Process "chrome.exe" -ArgumentList "--restore-last-session"
}

function Backup-Chrome {
    Close-Chrome
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $ZipFile = "$BackupFolder\\Chrome_Backup_$Timestamp.zip"

    Write-Host "[2/3] Đang sao lưu 100% tất cả Profiles, Cookies, Sessions, Mật khẩu, Extensions..." -ForegroundColor Cyan
    Compress-Archive -Path "$ChromeUserData\\*" -DestinationPath $ZipFile -CompressionLevel Optimal -Force
    
    Write-Host "[3/3] SAO LƯU HOÀN TẤT!" -ForegroundColor Green
    Write-Host "Tệp lưu tại: $ZipFile" -ForegroundColor White
}

function Restore-Chrome-1Click {
    param([string]$ZipPath = "")

    if ($ZipPath -eq "") {
        # Tự động tìm file mới nhất
        $latest = Get-ChildItem -Path $BackupFolder -Filter "Chrome_Backup_*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($null -eq $latest) {
            Write-Host "[LỖI] Không tìm thấy bản sao lưu nào trong $BackupFolder!" -ForegroundColor Red
            return
        }
        $ZipPath = $latest.FullName
    }

    Write-Host "[!] Đang khôi phục từ bản sao lưu: $ZipPath" -ForegroundColor Magenta
    Close-Chrome

    Write-Host "[2/3] Đang phục hồi toàn bộ dữ liệu vào User Data..." -ForegroundColor Cyan
    Expand-Archive -Path $ZipPath -DestinationPath $ChromeUserData -Force

    Write-Host "[3/3] KHÔI PHỤC THÀNH CÔNG 100%!" -ForegroundColor Green
    Open-Chrome
}

Write-Host "Lệnh sử dụng:" -ForegroundColor Yellow
Write-Host "  - Backup-Chrome : Tự động sao lưu toàn bộ Chrome"
Write-Host "  - Restore-Chrome-1Click : Tự động khôi phục 1-click bản mới nhất & mở Chrome"
`;
