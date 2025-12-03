const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "time",
    version: "1.0",
    author: "Saimx69x",
    role: 0,
    countDown: 3,
    shortDescription: "Fetches stylish time card from API",
    category: "tools",
    guide: "/time - Get current neon time card"
  },

  onStart: async ({ message }) => {
    try {
      const wait = await message.reply("⚡ Fetching time card...");

      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;

      const response = await axios.get(`${apiBase}/api/time`, { responseType: "stream" });

      const tmpDir = path.join(__dirname, "cache");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const filePath = path.join(tmpDir, `time_card_${Date.now()}.png`);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await message.unsend(wait.messageID);
      return message.reply({ attachment: fs.createReadStream(filePath) });

    } catch (err) {
      console.error("Time command error:", err.message);
      return message.reply("❌ Failed to fetch time card.");
    }
  }
};
