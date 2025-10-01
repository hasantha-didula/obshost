// api/video.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { file_id } = req.query;

  if (!file_id) {
    return res.status(400).json({ error: "Missing file_id" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  try {
    // Step 1: Get file path from Telegram
    const fileInfo = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file_id}`
    ).then(r => r.json());

    if (!fileInfo.ok) {
      return res.status(500).json({ error: "Telegram getFile failed", fileInfo });
    }

    const filePath = fileInfo.result.file_path;

    // Step 2: Fetch file stream
    const tgFileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    const tgResponse = await fetch(tgFileUrl);

    if (!tgResponse.ok) {
      return res.status(500).json({ error: "Failed to fetch file from Telegram" });
    }

    // Stream video response
    res.setHeader("Content-Type", "video/mp4");
    tgResponse.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
