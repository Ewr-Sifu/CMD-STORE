const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const cacheDirectory = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "calendar",
    version: "1.0",
    author: "Saimx69x",
    shortDescription: "🗓️ English Calendar",
    longDescription: "Fetches calendar image for Asia/Dhaka",
    category: "utility",
    guide: { en: "{p}calendar" }
  },

  onStart: async function ({ api, event }) {
    try {
      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;

      const response = await axios.get(`${apiBase}/api/calendar`, { responseType: "arraybuffer" });
      const imgBuffer = Buffer.from(response.data, "binary");

      await fs.ensureDir(cacheDirectory);
      const filePath = path.join(cacheDirectory, "calendar.png");
      await fs.writeFile(filePath, imgBuffer);

      api.sendMessage(
        { attachment: fs.createReadStream(filePath) },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("Calendar command error:", err.message);
      api.sendMessage(
        "❌ Failed to fetch calendar image.",
        event.threadID,
        event.messageID
      );
    }
  }
};
