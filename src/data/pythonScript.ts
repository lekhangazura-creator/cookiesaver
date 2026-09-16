import { DESKTOP_APP_PYTHON_CODE } from './desktopAppScript';

export const PYTHON_SCRIPT_CODE = DESKTOP_APP_PYTHON_CODE;

export const BUILD_BAT_CODE = `@echo off
title Dong goi Chrome Full Backup & Scheduler sang file .EXE doc lap
color 0a

echo =========================================================================
echo    CHROME FULL BACKUP & AUTO SCHEDULER - DONG GOI SANG FILE .EXE
echo =========================================================================
echo.

set PY_CMD=
where py >nul 2>&1
if %errorlevel% equ 0 set PY_CMD=py -3
if not defined PY_CMD (
    where python >nul 2>&1
    if %errorlevel% equ 0 set PY_CMD=python
)
if not defined PY_CMD (
    where python3 >nul 2>&1
    if %errorlevel% equ 0 set PY_CMD=python3
)

if not defined PY_CMD (
    echo [LOI] Khong tim thay Python tren may tinh!
    echo Vui long cai dat Python tu https://www.python.org/downloads/
    echo Chu y quan trong: Hay tich chon "Add Python to PATH" khi cai dat.
    echo.
    echo TIP: Ban co the mo ngay "CHAY_NGAY_POWERSHELL.bat" ma khong can cai Python!
    echo.
    pause
    exit /b 1
)

echo [1/3] Dang kiem tra va cai dat thu vien (customtkinter, pyinstaller, pystray, pillow)...
%PY_CMD% -m pip install customtkinter pyinstaller psutil pystray Pillow --quiet

echo [2/3] Dang bien dich ma nguon thanh file .EXE doc lap...
echo (Tien trinh se nhung day du System Tray, Auto Scheduler va Profile Selector)...
echo Vui long cho trong 30-60 giay...
echo.

%PY_CMD% -m PyInstaller --noconfirm ^
    --onedir ^
    --windowed ^
    --collect-all customtkinter ^
    --copy-metadata customtkinter ^
    --hidden-import tkinter ^
    --hidden-import pystray ^
    --hidden-import PIL ^
    --name "ChromeBackupRestore" ^
    --clean ^
    chrome_backup_tool.py

if errorlevel 1 goto BUILD_FAIL

echo.
echo =========================================================================
echo [THANH CONG] DA TAO FILE .EXE HOAN TAT!
echo Thu muc ung dung doc lap:
echo  -> %CD%\\dist\\ChromeBackupRestore\\ChromeBackupRestore.exe
echo.
echo Ban co the chep thu muc nay sang bat ky may nao ma khong can cai Python!
echo =========================================================================
echo.
explorer "%CD%\\dist\\ChromeBackupRestore"
pause
exit /b 0

:BUILD_FAIL
echo.
echo =========================================================================
echo [LOI] Qua trinh dong goi gap su co.
echo Ban co the mo truc tiep bang 1 trong 2 cach sau:
echo  -> CHAY_NGAY_POWERSHELL.bat (100%% chay ngay khong can Python)
echo  -> CHAY_NGAY_PYTHON.bat (Chay truc tiep ma nguon Python)
echo =========================================================================
echo.
pause
`;

export const RUN_PYTHON_BAT = `@echo off
title Khoi chay Chrome 100 Full Backup & Scheduler Tool
color 0b

echo =========================================================================
echo   DANG KHOI CHAY CHROME FULL BACKUP TOOL (PYTHON)...
echo =========================================================================
echo.

set PY_CMD=
where py >nul 2>&1
if %errorlevel% equ 0 (
    set PY_CMD=py -3
    goto EXEC_PY
)

where python >nul 2>&1
if %errorlevel% equ 0 (
    set PY_CMD=python
    goto EXEC_PY
)

where python3 >nul 2>&1
if %errorlevel% equ 0 (
    set PY_CMD=python3
    goto EXEC_PY
)

echo [LOI] Khong tim thay Python trong he thong PATH cua Windows!
echo.
echo GIAI PHAP 1 (Khuyen dung - Chay ngay khong can cai dat):
echo  -> Hay click dup vao file "CHAY_NGAY_POWERSHELL.bat"
echo.
echo GIAI PHAP 2:
echo  -> Cai dat Python tu https://www.python.org/downloads/
echo  -> Nho tich chon "Add Python to PATH" khi cai dat.
echo.
pause
exit /b 1

:EXEC_PY
echo [OK] Dang su dung trinh thuc thi: %PY_CMD%
%PY_CMD% chrome_backup_tool.py
if errorlevel 1 goto RUN_ERROR
exit /b 0

:RUN_ERROR
echo.
echo =========================================================================
echo [THONG BAO] Ung dung Python chua mo duoc.
echo Nguyen nhan pho bien: Chua cai thu vien giao dien customtkinter hoac pystray.
echo.
echo HUONG DAN XU LY NHANH:
echo 1. Click dup vao file "CHAY_NGAY_POWERSHELL.bat" de chay ngay 100%% khong loi!
echo 2. Hoac click dup vao "build_exe.bat" de tu dong cai thu vien va tao file .exe
echo =========================================================================
echo.
pause
`;

export const RUN_POWERSHELL_BAT = `@echo off
title Chrome 100 Full Backup - PowerShell Native
color 0a

echo =========================================================================
echo   CHROME 100 PERCENT FULL BACKUP (POWERSHELL NATIVE CUA WINDOWS)
echo   Chay ngay tren 100%% may Windows - Khong can cai dat Python hay thu vien
echo =========================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup_chrome.ps1"
if errorlevel 1 goto PS_ERROR
exit /b 0

:PS_ERROR
echo.
echo [THONG BAO] Neu gap bao ve ExecutionPolicy, ban hay click chuot phai vao
echo file backup_chrome.ps1 chon "Run with PowerShell".
echo.
pause
`;

export const UNINSTALL_BAT_CODE = `@echo off
title Go cai dat Chrome Full Backup Tool (Uninstall)
color 0c

echo =========================================================================
echo       GO CAI DAT CHROME 100 PERCENT FULL BACKUP TOOL (UNINSTALL)
echo =========================================================================
echo.
echo Ban co chac chan muon go cai dat va don dep cong cu nay khoi may tinh?
echo  - Se xoa sach tep cau hinh ghi nho (config.json)
echo  - Se don dep cac thu muc dong goi (dist, build, __pycache__, .spec)
echo.
echo LUU Y AN TOAN:
echo  - Tat ca cac tep sao luu .zip cua ban trong thu muc sao luu VAN DUOC GIU AN TOAN!
echo.
set /p CONFIRM="Ban co muon tiep tuc khong? (Nhap Y de dong y, N de huy): "
if /i "%CONFIRM%" neq "Y" goto CANCEL_UNINSTALL

echo.
echo Dang tien hanh go cai dat va don dep sach se...

if exist "%~dp0config.json" del /f /q "%~dp0config.json" >nul 2>&1
if exist "%APPDATA%\\ChromeBackupTool\\config.json" del /f /q "%APPDATA%\\ChromeBackupTool\\config.json" >nul 2>&1

if exist "%~dp0dist" rmdir /s /q "%~dp0dist" >nul 2>&1
if exist "%~dp0build" rmdir /s /q "%~dp0build" >nul 2>&1
if exist "%~dp0__pycache__" rmdir /s /q "%~dp0__pycache__" >nul 2>&1
for %%f in ("%~dp0*.spec") do del /f /q "%%f" >nul 2>&1

echo.
echo =========================================================================
echo [THANH CONG] DA GO CAI DAT VA DON DEP SACH SE 100%%!
echo - Da xoa toan bo cau hinh va bo nho dem cua app.
echo - Cac tep sao luu .zip cua ban van an toan.
echo Bay gio ban co the xoa toan bo thu muc nay khoi may tinh neu muon.
echo =========================================================================
echo.
pause
exit /b 0

:CANCEL_UNINSTALL
echo.
echo Da huy qua trinh go cai dat. Khong co tep nao bi xoa.
echo.
pause
exit /b 0
`;

export const REQUIREMENTS_TXT = `customtkinter>=5.2.0
psutil>=5.9.0
pyinstaller>=6.0.0
pystray>=0.19.5
Pillow>=9.0.0
`;

export const POWERSHELL_SCRIPT = `# =============================================================================
# Chrome 100% Full Backup & 1-Click Auto Restore (PowerShell Native)
# Tự động ghi nhớ vị trí lưu • Thanh tiến trình % • Cảnh báo an toàn
# =============================================================================

$ConfigFile = "$env:APPDATA\\ChromeBackupTool\\config.json"
$DefaultBackupFolder = "$env:USERPROFILE\\Documents\\Chrome_Backups"
$BackupFolder = $DefaultBackupFolder

if (Test-Path $ConfigFile) {
    try {
        $cfg = Get-Content $ConfigFile -Raw | ConvertFrom-Json
        if ($cfg.saved_backup_dir -and (Test-Path $cfg.saved_backup_dir)) {
            $BackupFolder = $cfg.saved_backup_dir
        }
    } catch {}
}

$ChromeDir = "$env:LOCALAPPDATA\\Google\\Chrome"
$ChromeUserData = "$ChromeDir\\User Data"

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

    Write-Host "[!] CANH BAO QUAN TRONG: DANG SAO LUU DU LIEU - TUYET DOI DUNG TAT APP HOAC DONG CUA SO NAY!" -ForegroundColor Red
    Write-Host "[2/3] Đang sao lưu toàn bộ thư mục Chrome vào vị trí đã nhớ ($BackupFolder)..." -ForegroundColor Cyan
    Compress-Archive -Path "$ChromeDir\\*" -DestinationPath $ZipFile -CompressionLevel Optimal -Force
    
    Write-Host "[3/3] SAO LƯU HOÀN TẤT 100%!" -ForegroundColor Green
    Write-Host "Tệp lưu tại: $ZipFile" -ForegroundColor White
}

function Restore-Chrome-1Click {
    param([string]$ZipPath = "")

    if ($ZipPath -eq "") {
        $latest = Get-ChildItem -Path $BackupFolder -Filter "Chrome_Backup_*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($null -eq $latest) {
            Write-Host "[LỖI] Không tìm thấy bản sao lưu nào trong $BackupFolder!" -ForegroundColor Red
            return
        }
        $ZipPath = $latest.FullName
    }

    Write-Host "[!] Đang khôi phục từ bản sao lưu: $ZipPath" -ForegroundColor Magenta
    Close-Chrome

    Write-Host "[2/3] Đang giải nén và phục hồi toàn bộ thư mục Chrome..." -ForegroundColor Cyan
    Expand-Archive -Path $ZipPath -DestinationPath $ChromeDir -Force

    Get-ChildItem -Path "$ChromeUserData\\*\\Preferences" -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $content = Get-Content $_.FullName -Raw -Encoding UTF8
            $json = ConvertFrom-Json $content
            if ($json.profile) {
                $json.profile.exit_type = "Normal"
                $json.profile.exited_cleanly = $true
                $json | ConvertTo-Json -Depth 30 | Set-Content $_.FullName -Encoding UTF8
            }
        } catch {}
    }

    Write-Host "[3/3] KHÔI PHỤC THÀNH CÔNG 100%!" -ForegroundColor Green
    Open-Chrome
}
`;

export const RUN_MACOS_COMMAND = `#!/usr/bin/env bash
# =============================================================================
# Chrome 100% Full Backup & 1-Click Restore - macOS Launcher
# Tự động ghi nhớ vị trí lưu • Thanh tiến trình % • Hỗ trợ Apple Silicon & Intel
# =============================================================================

cd "$(dirname "$0")" || exit 1

echo "========================================================================="
echo "   CHROME 100% FULL BACKUP & RESTORE TOOL (macOS / Apple Silicon & Intel)"
echo "========================================================================="
echo ""

PYTHON_BIN=""
if command -v python3 &>/dev/null; then
    PYTHON_BIN="python3"
elif command -v python &>/dev/null; then
    PYTHON_BIN="python"
fi

echo "HỆ THỐNG PHÁT HIỆN: macOS ($(uname -m))"
echo "Đường dẫn Chrome: ~/Library/Application Support/Google/Chrome"
echo ""

if [ -n "$PYTHON_BIN" ]; then
    echo "[1] Mở giao diện đồ họa Python GUI..."
    $PYTHON_BIN -m pip install customtkinter psutil pyinstaller pystray Pillow --quiet 2>/dev/null
    $PYTHON_BIN chrome_backup_tool.py
    if [ $? -eq 0 ]; then
        exit 0
    fi
    echo "[!] Không thể mở GUI đồ họa, tự động chuyển sang chế độ Bash Script gốc..."
fi

echo "Khởi động chế độ sao lưu Bash Native cho macOS..."
chmod +x ./backup_chrome_unix.sh 2>/dev/null
./backup_chrome_unix.sh
`;

export const RUN_LINUX_SH = `#!/usr/bin/env bash
# =============================================================================
# Chrome 100% Full Backup & 1-Click Restore - Linux Launcher
# Tương thích Ubuntu, Debian, Fedora, Arch, Manjaro, RedHat, Linux Mint
# =============================================================================

cd "$(dirname "$0")" || exit 1

echo "========================================================================="
echo "   CHROME 100% FULL BACKUP & RESTORE TOOL (Linux Universal)"
echo "========================================================================="
echo ""

PYTHON_BIN=""
if command -v python3 &>/dev/null; then
    PYTHON_BIN="python3"
elif command -v python &>/dev/null; then
    PYTHON_BIN="python"
fi

echo "HỆ THỐNG: Linux ($(uname -s) - $(uname -m))"
echo ""

if [ -n "$PYTHON_BIN" ]; then
    echo "[*] Đang khởi chạy giao diện GUI..."
    $PYTHON_BIN chrome_backup_tool.py
    if [ $? -eq 0 ]; then
        exit 0
    fi
fi

echo "[*] Đang chạy qua script sao lưu Native Bash cho Linux..."
chmod +x ./backup_chrome_unix.sh 2>/dev/null
./backup_chrome_unix.sh
`;

export const BACKUP_CHROME_UNIX_SH = `#!/usr/bin/env bash
# =============================================================================
# Universal Native Chrome Backup & Restore for macOS & Linux (POSIX Compliant)
# Tự động ghi nhớ vị trí • Đóng Chrome an toàn • Vá cờ Normal Exit
# =============================================================================

CONFIG_DIR="$HOME/.config/ChromeBackupTool"
CONFIG_FILE="$CONFIG_DIR/config.json"
DEFAULT_BACKUP_DIR="$HOME/Documents/Chrome_Backups"
BACKUP_DIR="$DEFAULT_BACKUP_DIR"

mkdir -p "$CONFIG_DIR" 2>/dev/null
mkdir -p "$DEFAULT_BACKUP_DIR" 2>/dev/null

if [ -f "$CONFIG_FILE" ]; then
    SAVED=$(grep -o '"saved_backup_dir": "[^"]*' "$CONFIG_FILE" | grep -o '[^"]*$')
    if [ -n "$SAVED" ] && [ -d "$SAVED" ]; then
        BACKUP_DIR="$SAVED"
    fi
fi

if [ "$(uname)" = "Darwin" ]; then
    CHROME_DIR="$HOME/Library/Application Support/Google/Chrome"
    OS_NAME="macOS"
else
    CHROME_DIR="$HOME/.config/google-chrome"
    if [ ! -d "$CHROME_DIR" ] && [ -d "$HOME/.config/chromium" ]; then
        CHROME_DIR="$HOME/.config/chromium"
    fi
    OS_NAME="Linux"
fi

close_chrome_safely() {
    echo "🚨 [1/4] Đang đóng sạch các tiến trình Google Chrome..."
    if [ "$OS_NAME" = "Darwin" ]; then
        killall "Google Chrome" 2>/dev/null
        pkill -f "Google Chrome" 2>/dev/null
    else
        killall "chrome" 2>/dev/null
        killall "google-chrome" 2>/dev/null
        pkill -f "chrome" 2>/dev/null
    fi
    sleep 2
    echo "✓ [OK] Đã giải phóng hoàn toàn khóa tệp SQLite."
}

open_chrome() {
    echo "🚀 [4/4] Đang tự động mở lại Google Chrome với tất cả Profiles..."
    if [ "$OS_NAME" = "Darwin" ]; then
        open -a "Google Chrome" --args --restore-last-session
    else
        if command -v google-chrome &>/dev/null; then
            google-chrome --restore-last-session &
        elif command -v chromium &>/dev/null; then
            chromium --restore-last-session &
        fi
    fi
}

fix_normal_exit() {
    echo "[+] Đang chuẩn hóa cờ Normal Clean Exit..."
    find "$CHROME_DIR" -name "Preferences" -type f 2>/dev/null | while read -r pref; do
        if command -v sed &>/dev/null; then
            sed -i.bak 's/"exit_type":"[^"]*"/"exit_type":"Normal"/g' "$pref" 2>/dev/null
            sed -i.bak 's/"exited_cleanly":false/"exited_cleanly":true/g' "$pref" 2>/dev/null
            rm -f "\${pref}.bak"
        fi
    done
}

backup_now() {
    echo "========================================================================="
    echo "  BẮT ĐẦU SAO LƯU 100% DỮ LIỆU GOOGLE CHROME ($OS_NAME)"
    echo "========================================================================="
    
    if [ ! -d "$CHROME_DIR" ]; then
        echo "❌ [LỖI] Không tìm thấy thư mục dữ liệu Chrome tại: $CHROME_DIR"
        exit 1
    fi

    close_chrome_safely

    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    ARCHIVE_NAME="Chrome_\${OS_NAME}_Backup_\${TIMESTAMP}.zip"
    DEST_FILE="$BACKUP_DIR/$ARCHIVE_NAME"

    echo "📦 [2/4] Đang nén Profiles, Cookies SQLite, Passwords và Extensions..."
    (cd "$CHROME_DIR" && zip -r -q "$DEST_FILE" . -x "*Cache*" "*Code Cache*" "*GPUCache*" "*crashpad*")

    if [ -f "$DEST_FILE" ]; then
        SIZE=$(du -h "$DEST_FILE" | cut -f1)
        echo "✓ [3/4] SAO LƯU HOÀN TẤT 100%!"
        echo "   -> File: $DEST_FILE ($SIZE)"
        echo "{\\"saved_backup_dir\\": \\"$BACKUP_DIR\\"}" > "$CONFIG_FILE"
    else
        echo "❌ [LỖI] Tạo tệp sao lưu thất bại."
    fi
}

restore_now() {
    LATEST_ZIP=$(ls -t "$BACKUP_DIR"/*.zip 2>/dev/null | head -n 1)
    if [ -z "$LATEST_ZIP" ]; then
        echo "❌ Không tìm thấy bản sao lưu nào trong $BACKUP_DIR!"
        exit 1
    fi

    echo "-> Khôi phục từ: $LATEST_ZIP"
    read -p "⚠️ CẢNH BÁO: Thao tác sẽ thay thế Profiles hiện tại. Tiếp tục? (y/N): " CONFIRM
    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
        exit 0
    fi

    close_chrome_safely
    mkdir -p "$CHROME_DIR"
    unzip -q -o "$LATEST_ZIP" -d "$CHROME_DIR"
    fix_normal_exit
    open_chrome
}

echo "CHỌN THAO TÁC:"
echo "  1) ⚡ 1-Click Sao Lưu"
echo "  2) 🔄 1-Click Khôi Phục"
echo "  3) ❌ Thoát"
read -p "Nhập (1-3): " CHOICE
case "$CHOICE" in
    1) backup_now ;;
    2) restore_now ;;
    *) exit 0 ;;
esac
`;

export const UNINSTALL_UNIX_SH = `#!/usr/bin/env bash
CONFIG_DIR="$HOME/.config/ChromeBackupTool"
echo "Đang gỡ cài đặt sạch sẽ cấu hình Chrome Backup Tool..."
rm -rf "$CONFIG_DIR" 2>/dev/null
rm -f "$HOME/.chrome_backup_config.json" 2>/dev/null
echo "✓ ĐÃ GỠ CÀI ĐẶT THÀNH CÔNG! Các file .zip của bạn vẫn an toàn."
`;
