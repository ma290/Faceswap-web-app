import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ===== TELEGRAM CHANNEL SUBSCRIPTION CHECK =====
app.post("/api/check-subscription", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ subscribed: false, error: "Missing userId" });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set in .env");
    return res.status(500).json({ subscribed: false, error: "Server misconfigured" });
  }

  try {
    const apiUrl = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(channelId)}&user_id=${userId}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.ok) {
      const status = data.result.status;
      // "creator", "administrator", "member", "restricted" = subscribed
      // "left", "kicked" = not subscribed
      const subscribed = ["creator", "administrator", "member", "restricted"].includes(status);
      return res.json({ subscribed });
    } else {
      console.error("Telegram API error:", data.description);
      return res.json({ subscribed: false, error: data.description });
    }
  } catch (err) {
    console.error("Error checking subscription:", err.message);
    return res.json({ subscribed: false, error: "Failed to verify" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
