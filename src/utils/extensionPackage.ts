import JSZip from 'jszip';
import {
  EXTENSION_MANIFEST,
  EXTENSION_POPUP_HTML,
  EXTENSION_POPUP_JS,
  EXTENSION_BACKGROUND_JS,
  EXTENSION_STYLE_CSS
} from '../data/extensionFiles';

/**
 * Tạo icon PNG dạng Base64 theo kích thước chuẩn Chrome Extension (16, 32, 48, 128)
 * Vẽ bằng HTML5 Canvas với thiết kế Cyber Shield & Backup hiện đại.
 */
export function generateExtensionIconBase64(size: number): string {
  try {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const cx = size / 2;
        const cy = size / 2;
        const pad = Math.max(1, Math.round(size * 0.06));
        const w = size - pad * 2;
        const h = size - pad * 2;
        const radius = Math.max(2, Math.round(size * 0.22));

        // 1. Nền bo góc với Gradient sang trọng (Navy -> Ocean Blue -> Teal)
        const bgGrad = ctx.createLinearGradient(0, 0, size, size);
        bgGrad.addColorStop(0, '#0284c7'); // Bright sky blue
        bgGrad.addColorStop(0.5, '#0369a1'); // Slate ocean
        bgGrad.addColorStop(1, '#0f172a'); // Deep slate

        ctx.fillStyle = bgGrad;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(pad, pad, w, h, radius);
        } else {
          ctx.rect(pad, pad, w, h);
        }
        ctx.fill();

        // 2. Viền ngoài nổi bật (Accent Border)
        ctx.strokeStyle = '#38bdf8'; // Cyan border
        ctx.lineWidth = Math.max(1, Math.round(size * 0.06));
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(pad, pad, w, h, radius);
        } else {
          ctx.rect(pad, pad, w, h);
        }
        ctx.stroke();

        // 3. Hiệu ứng ánh sáng bóng gương (Gloss effect)
        const gloss = ctx.createLinearGradient(0, pad, 0, cy);
        gloss.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gloss;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(pad, pad, w, h * 0.45, [radius, radius, 0, 0]);
        } else {
          ctx.rect(pad, pad, w, h * 0.45);
        }
        ctx.fill();

        // 4. Biểu tượng trung tâm (Shield + Backup Arrow)
        if (size <= 16) {
          // Tối ưu điểm ảnh cho 16x16 hiển thị cực nét trên toolbar Chrome
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(8, 2);
          ctx.lineTo(13, 4);
          ctx.lineTo(13, 8.5);
          ctx.bezierCurveTo(13, 11.5, 10.5, 13.5, 8, 14.5);
          ctx.bezierCurveTo(5.5, 13.5, 3, 11.5, 3, 8.5);
          ctx.lineTo(3, 4);
          ctx.closePath();
          ctx.fill();

          // Tâm khiên màu xanh
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(8, 8, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Hiển thị chi tiết cao cho 32, 48, 128px
          const scale = size / 48;
          ctx.save();
          ctx.translate(cx, cy);

          // Vẽ hình cái khiên (Shield)
          ctx.beginPath();
          ctx.moveTo(0, -15 * scale);
          ctx.lineTo(13 * scale, -10 * scale);
          ctx.lineTo(13 * scale, 2 * scale);
          ctx.bezierCurveTo(13 * scale, 11 * scale, 7 * scale, 16 * scale, 0, 18 * scale);
          ctx.bezierCurveTo(-7 * scale, 16 * scale, -13 * scale, 11 * scale, -13 * scale, 2 * scale);
          ctx.lineTo(-13 * scale, -10 * scale);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Mũi tên tải / sao lưu màu xanh bên trong
          ctx.fillStyle = '#0284c7';
          const arrW = 3.5 * scale;
          // Thân mũi tên
          ctx.fillRect(-arrW / 2, -6 * scale, arrW, 8 * scale);
          // Đầu mũi tên
          ctx.beginPath();
          ctx.moveTo(-7 * scale, 2 * scale);
          ctx.lineTo(0, 9 * scale);
          ctx.lineTo(7 * scale, 2 * scale);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }

        const dataUrl = canvas.toDataURL('image/png');
        const parts = dataUrl.split(',');
        if (parts.length > 1 && parts[1]) {
          return parts[1];
        }
      }
    }
  } catch (e) {
    console.error('Error generating icon with canvas:', e);
  }

  // Fallback 1x1 transparent PNG base64 nếu canvas không khả dụng
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

/**
 * Đóng gói trọn vẹn tệp ZIP tiện ích mở rộng Chrome Extension Manifest V3
 * Đảm bảo 100% đầy đủ các tệp và thư mục icons/ (16.png, 32.png, 48.png, 128.png)
 * tránh triệt để lỗi "Could not load icon icons/16.png specified in action".
 */
export async function createExtensionZipBundle(): Promise<JSZip> {
  const zip = new JSZip();

  // 1. Các tệp mã nguồn cốt lõi
  zip.file("manifest.json", EXTENSION_MANIFEST);
  zip.file("popup.html", EXTENSION_POPUP_HTML);
  zip.file("popup.js", EXTENSION_POPUP_JS);
  zip.file("background.js", EXTENSION_BACKGROUND_JS);
  zip.file("style.css", EXTENSION_STYLE_CSS);

  // 2. Thư mục icons/ với đầy đủ 4 kích cỡ chuẩn Google Chrome Extension
  const iconSizes = [16, 32, 48, 128];
  for (const sz of iconSizes) {
    const base64Data = generateExtensionIconBase64(sz);
    zip.file(`icons/${sz}.png`, base64Data, { base64: true });
  }

  // 3. Tệp hướng dẫn cài đặt tiếng Việt chi tiết từng bước
  const readme = `=============================================================================
HƯỚNG DẪN CÀI ĐẶT CHROME FULL BACKUP EXTENSION V5 (CHỈ MẤT 10 GIÂY)
=============================================================================

1. CẤU TRÚC GÓI TIỆN ÍCH CHUẨN GOOGLE CHROME:
   ├── manifest.json   : Cấu hình Manifest V3 chuẩn Chrome Web Store
   ├── popup.html      : Giao diện trực quan hiện đại (Có bar %, cảnh báo, nhớ vị trí)
   ├── popup.js        : Xử lý sao lưu & khôi phục 100% Cookies, Tabs, Bookmarks
   ├── background.js   : Service worker chạy ngầm độc lập
   ├── style.css       : Phong cách giao diện Cyber Slate Dark hiện đại
   ├── HUONG_DAN...txt : Tệp hướng dẫn này
   └── icons/          : Đầy đủ bộ biểu tượng hợp lệ theo chuẩn Chrome
       ├── 16.png      : Icon thanh công cụ (Toolbar favicon)
       ├── 32.png      : Icon độ phân giải cao màn hình Retina/Windows
       ├── 48.png      : Icon quản lý tiện ích chrome://extensions
       └── 128.png     : Icon cửa hàng và cài đặt Chrome

2. CÁCH CÀI ĐẶT LÊN GOOGLE CHROME (HOẶC BRAVE, EDGE, CỐC CỐC):
   Bước 1: Giải nén tệp zip này ra một thư mục trên máy tính của bạn
           (Ví dụ: D:\\Chrome_Full_Backup_Extension hoặc C:\\Extensions\\Chrome_Backup).
   
   Bước 2: Mở Google Chrome, nhập địa chỉ sau vào thanh URL:
           chrome://extensions/
   
   Bước 3: Gạt công tắc [Chế độ cho nhà phát triển] (Developer mode) 
           ở góc trên bên phải sang trạng thái BẬT (ON).
   
   Bước 4: Nhấn nút [Tải tiện ích đã giải nén] (Load unpacked) ở góc trái trên cùng.
   
   Bước 5: Chọn thư mục bạn vừa giải nén ở Bước 1.
   
   🎉 XONG! Tiện ích sẽ được kích hoạt ngay lập tức mà không gặp bất kỳ lỗi icon nào!
   Bạn có thể ghim biểu tượng hình chiếc khiên bảo vệ lên thanh công cụ để dùng 1-Click bất cứ lúc nào.

3. TÍNH NĂNG TỰ ĐỘNG GHI NHỚ VỊ TRÍ & BẢO VỆ DỮ LIỆU:
   ✓ Tự động ghi nhớ thư mục lưu trữ trong Downloads (mặc định: Downloads/Chrome_Backups/).
   ✓ Không cần chọn lại vị trí mỗi khi mở hay đóng app!
   ✓ Có thanh Bar % và cảnh báo khẩn: Đang sao lưu thì ĐỪNG TẮT APP/TRÌNH DUYỆT!
`;

  zip.file("HUONG_DAN_CAI_DAT.txt", readme);

  return zip;
}

/**
 * Tải trực tiếp gói tiện ích Chrome Extension ZIP về máy người dùng
 */
export async function downloadExtensionZipPackage(fileName = "Chrome_Full_Backup_Extension_v5.zip"): Promise<void> {
  const zip = await createExtensionZipBundle();
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
