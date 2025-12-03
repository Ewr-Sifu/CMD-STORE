const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "duck",
    author: "Saimx69x",
    category: "image",
    version: "1.0",
    role: 0,
    shortDescription: { en: "🦆 Send a random duck image" },
    longDescription: { en: "Fetches a random duck image." },
    guide: { en: "{p}{n} — Shows a random duck image" }
  },

  onStart: async function({ api, event }) {
    try {
      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;

      const apiUrl = `${apiBase}/api/duck`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const tempPath = path.join(cacheDir, `duck_${Date.now()}.jpg`);
      await fs.writeFile(tempPath, buffer);

      await api.sendMessage(
        {
          body: "🦆 Here's a random duck for you!",
          attachment: fs.createReadStream(tempPath)
        },
        event.threadID,
        () => fs.unlinkSync(tempPath),
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to fetch duck image.\n" + err.message, event.threadID, event.messageID);
    }
  }
};
