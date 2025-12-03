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
    name: "pinterest",
    aliases: ["pin"],
    version: "1.0",
    author: "Saimx69x",
    role: 0,
    countDown: 5,
    description: {
      en: "Search or get images from Pinterest.",
    },
    category: "image",
    guide: {
      en: "{pn} <search query> - <number of images>\nExample: /pin Naruto Uzumaki - 10",
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const input = args.join(" ").trim();
      if (!input) {
        return api.sendMessage(
          `❌ Please provide a search query.\nExample: /pin Naruto Uzumaki - 10`,
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

      if (count > 20) count = 20;

      const apiBase = await getApiBase();
      if (!apiBase) {
        return api.sendMessage(
          "❌ Failed to fetch API base. Try again later.",
          event.threadID,
          event.messageID
        );
      }

      const apiUrl = `${apiBase}/api/pin?text=${encodeURIComponent(query)}&count=${count}`;
      const res = await axios.get(apiUrl);
      const data = res.data?.data || [];

      if (data.length === 0) {
        return api.sendMessage(
          `❌ No images found for "${query}". Try a different search.`,
          event.threadID,
          event.messageID
        );
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imagesData = await Promise.all(
        data.map(async (url, i) => {
          try {
            const imgRes = await axios.get(url, { responseType: "arraybuffer" });
            const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
            await fs.promises.writeFile(imgPath, imgRes.data);
            return fs.createReadStream(imgPath);
          } catch (err) {
            console.error(`Failed to fetch image: ${url}`, err.message);
            return null;
          }
        })
      );

      const validImages = imagesData.filter(Boolean);
      if (validImages.length === 0) {
        return api.sendMessage(
          `❌ Failed to fetch any images for "${query}".`,
          event.threadID,
          event.messageID
        );
      }

      await api.sendMessage(
        { body: `✅ Here's your images for "${query}"`, attachment: validImages },
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
