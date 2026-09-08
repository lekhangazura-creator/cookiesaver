import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initializer cho Gemini AI
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// AI Edit Endpoint: Chuyên phân tích & chỉnh sửa Cookies, Game Save Data, LocalStorage, JSON
app.post("/api/ai-edit", async (req, res) => {
  try {
    const { content, prompt, fileType } = req.body;

    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "Nội dung tệp hoặc cookie không được để trống." });
      return;
    }

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Yêu cầu chỉnh sửa của bạn không được để trống." });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `Bạn là Chuyên gia Kỹ thuật Hệ thống & Modding Game/Web Data (Cookies, Save Files, LocalStorage, JSON, Key-Value).
Nhiệm vụ của bạn là nhận vào nội dung tệp (JSON save game, cookie format, key-value, hoặc text dữ liệu) và yêu cầu chỉnh sửa của người dùng (ví dụ: "hack tiền lên 99,999,999", "max cấp 999", "mở khóa tất cả đồ", "kéo dài hạn cookie", "thêm 99,999 kim cương").

QUY TẮC BẮT BUỘC:
1. Phân tích cấu trúc dữ liệu đầu vào. Giữ nguyên 100% cú pháp gốc (nếu là JSON thì phải trả về JSON hợp lệ, nếu là Cookie dạng name=val; name2=val2 thì giữ nguyên định dạng đó).
2. Tìm kiếm chính xác các trường liên quan đến yêu cầu:
   - Tiền, vàng, bạc, xu: gold, coin, coins, money, cash, currency, credit, balance, funds...
   - Kim cương, ngọc: gems, diamond, diamonds, rubies, crystals...
   - Cấp độ, kinh nghiệm: level, lvl, exp, xp, experience, rank, stage...
   - Máu, năng lượng: hp, max_hp, health, stamina, energy, mana, mp...
   - Túi đồ, trang bị: inventory, items, weapons, unlocked, skins, relics...
   - Cookies: expires, Max-Age, session, role, isAdmin, permission...
3. Thay đổi giá trị theo đúng mong muốn của người dùng (ví dụ lên giàu: 999999999, level 999, v.v.).
4. Trả về định dạng JSON hợp lệ duy nhất với cấu trúc:
{
  "modifiedContent": "toàn bộ chuỗi nội dung sau khi đã chỉnh sửa chuẩn xác",
  "explanation": "Giải thích ngắn gọn, thân thiện bằng tiếng Việt những gì bạn đã chỉnh sửa",
  "changes": [
    "Danh sách các thay đổi cụ thể, ví dụ: 'Đã tăng gold từ 120 lên 999,999,999'",
    "Đã đặt level thành 999 và mở khóa tất cả item trong inventory"
  ]
}
Chỉ trả về chuỗi JSON thuần túy, không bọc markdown \`\`\`json ở ngoài nếu có thể, hoặc đảm bảo JSON parse được.`;

    const userPrompt = `Định dạng dự kiến: ${fileType || "Tự động nhận diện"}
Yêu cầu người dùng: "${prompt}"

DỮ LIỆU ĐẦU VÀO CẦN SỬA:
${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      modifiedContent: parsedResult.modifiedContent || content,
      explanation: parsedResult.explanation || "Đã xử lý tệp theo yêu cầu.",
      changes: parsedResult.changes || [],
    });
  } catch (error: any) {
    console.error("Lỗi khi xử lý AI edit:", error);
    res.status(500).json({
      error: error?.message || "Không thể xử lý yêu cầu chỉnh sửa bằng AI.",
    });
  }
});

// Endpoint chuyên dụng: Phân tích Web Game / Web Cookies / Màn hình (Screenshot) & Sinh Lệnh Chrome Console (F12)
app.post("/api/ai-web-console", async (req, res) => {
  try {
    const { prompt, gameNameOrUrl, dataInput, screenshotBase64, screenshotMime } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Vui lòng nhập mong muốn bạn cần AI hỗ trợ (ví dụ: hack 999M vàng, max cấp, sửa cookie)." });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `Bạn là Chuyên Gia Kỹ Thuật Web Browser & Reverse Engineering Web Games (HTML5, Canvas, LocalStorage, Cookies, Chrome DevTools).
Nhiệm vụ của bạn:
1. Nếu người dùng cung cấp ảnh chụp màn hình (screenshot web/game): Phân tích giao diện, nhận diện các chỉ số đang hiển thị trên màn hình (vàng, tiền, kim cương, level, điểm số, tên game).
2. Nếu người dùng cung cấp Cookie hoặc LocalStorage dump: Tìm các key lưu trữ tiền tệ/level/phiên đăng nhập.
3. Tạo ra ĐOẠN LỆNH JAVASCRIPT ĐẶC BIỆT để người dùng chỉ cần copy và paste thẳng vào CHROME DEVTOOLS CONSOLE (phím F12 -> Console -> Enter):
   - Đoạn lệnh phải an toàn, bọc trong IIFE: (() => { try { ... } catch (e) { console.error(e); } })();
   - Tự động quét và cập nhật localStorage (cả dạng JSON parse/stringify lẫn key-value thô).
   - Tự động cập nhật sessionStorage và document.cookie nếu có liên quan.
   - Quét tìm các biến toàn cục phổ biến trên window (như window.game, window.player, window.data, window.score, window.coins...).
   - In ra thông báo màu đẹp mắt bằng console.log('%c...', 'color: #10b981; font-size: 14px; font-weight: bold') báo thành công.
   - Thêm dòng thông báo hỏi người dùng F5 tải lại trang để thấy kết quả.

QUY ĐỊNH ĐỊNH DẠNG ĐẦU RA (JSON chuẩn duy nhất):
{
  "consoleScript": "Đoạn mã JavaScript hoàn chỉnh sẵn sàng copy dán vào Chrome Console",
  "screenAnalysis": "Nhận xét chi tiết về các chỉ số nhận diện được từ ảnh màn hình (nếu có ảnh)",
  "targetVariables": ["Danh sách các biến/key mà script sẽ can thiệp, ví dụ: 'localStorage.gold', 'window.player.money'"],
  "guideSteps": [
    "1. Mở trang web game trên Google Chrome",
    "2. Nhấn phím F12 trên bàn phím (hoặc chuột phải -> Inspect / Kiểm tra)",
    "3. Chọn thẻ 'Console'",
    "4. Dán đoạn mã trên (Ctrl + V) và nhấn Enter",
    "5. Nhấn F5 để tải lại trang và nhận thành quả!"
  ],
  "explanation": "Giải thích cơ chế hoạt động của lệnh một cách ngắn gọn, rõ ràng, dễ hiểu"
}`;

    const parts: any[] = [];

    // Nếu người dùng có gửi kèm ảnh màn hình (screenshot base64)
    if (screenshotBase64 && typeof screenshotBase64 === "string") {
      const cleanBase64 = screenshotBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: screenshotMime || "image/png",
        },
      });
    }

    const textPrompt = `YÊU CẦU CỦA NGƯỜI DÙNG:
"${prompt}"

TÊN HOẶC ĐƯỜNG DẪN WEB/GAME (nếu có):
${gameNameOrUrl || "Chưa xác định - Hãy viết script quét tự động thông minh (smart auto-detect)"}

DỮ LIỆU BỔ SUNG (Cookie / LocalStorage / Biến nếu có):
${dataInput || "Không có dữ liệu thô, hãy quét tự động các key lưu trữ thông dụng trên trình duyệt"}`;

    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      consoleScript: parsedResult.consoleScript || "// Không tạo được script",
      screenAnalysis: parsedResult.screenAnalysis || null,
      targetVariables: parsedResult.targetVariables || [],
      guideSteps: parsedResult.guideSteps || [
        "1. Nhấn F12 trên Chrome",
        "2. Chuyển sang thẻ Console",
        "3. Dán lệnh và nhấn Enter",
      ],
      explanation: parsedResult.explanation || "Script can thiệp bộ nhớ trình duyệt.",
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo Chrome Console script:", error);
    res.status(500).json({
      error: error?.message || "Không thể tạo Chrome Console script.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
  });
}

startServer();
