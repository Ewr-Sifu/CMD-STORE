const axios = require("axios");
const path = require("path");
const fs = require("fs");

async function getApiBase() {
  try {
    const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const res = await axios.get(GITHUB_RAW);
    return res.data.apiv1;
  } catch (e) {
    console.error("GitHub raw fetch error:", e.message);
    return null;
  }
}

module.exports = {
  config: {
    name: "gif",
    aliases: ["tenor"],
    version: "1.0",
    author: "Saimx69x",
    role: 0,
    countDown: 5,
    description: {
      en: "Search or get GIFs from Tenor.",
    },
    category: "image",
    guide: {
      en: "{pn} <search query> - <number of GIFs>\nExample: /gif Naruto Uzumaki - 10",
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const input = args.join(" ").trim();
      if (!input) {
        return api.sendMessage(
          `❌ Please provide a search query.\nExample: /gif Naruto Uzumaki - 10`,
          event.threadID,
          event.messageID
        );
      }

      let query = input;
      let count = 5;

      if (input.includes("-")) {
        const parts = input.split("-");
        query = parts[0].trim();
        count = parseInt(parts[1].trim()) || 5;
      }

      if (count > 25) count = 25;

      const apiBase = await getApiBase();
      if (!apiBase) {
        return api.sendMessage(
          "❌ Failed to fetch API base. Try again later.",
          event.threadID,
          event.messageID
        );
      }

      const apiUrl = `${apiBase}/api/gif?query=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl);
      const data = res.data?.gifs || [];

      if (data.length === 0) {
        return api.sendMessage(
          `❌ No GIFs found for "${query}". Try a different search.`,
          event.threadID,
          event.messageID
        );
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const gifData = await Promise.all(
        data.slice(0, count).map(async (url, i) => {
          try {
            const gifResponse = await axios.get(url, { responseType: "arraybuffer" });
            const gifPath = path.join(cacheDir, `${i + 1}.gif`);
            await fs.promises.writeFile(gifPath, gifResponse.data);
            return fs.createReadStream(gifPath);
          } catch (err) {
            console.error(`Failed to fetch GIF: ${url}`, err.message);
            return null;
          }
        })
      );

      const validGifData = gifData.filter(Boolean);
      if (validGifData.length === 0) {
        return api.sendMessage(
          `❌ Failed to fetch any GIFs for "${query}".`,
          event.threadID,
          event.messageID
        );
      }

      await api.sendMessage(
        { body: `✅ Here's your GIF for "${query}"`, attachment: validGifData },
        event.threadID,
        event.messageID
      );

      if (fs.existsSync(cacheDir)) {
        await fs.promises.rm(cacheDir, { recursive: true, force: true });
      }

    } catch (error) {
      console.error(error);
      return api.sendMessage(
        "❌ Something went wrong. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
