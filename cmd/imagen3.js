const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function getApiBase() {
  try {
    const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const rawRes = await axios.get(GITHUB_RAW);
    return rawRes.data.apiv2;
  } catch (e) {
    console.error("Failed to fetch API base:", e.message);
    return null;
  }
}

module.exports = {
  config: {
    name: "imagen3",
    aliases: [],
    version: "1.0",
    author: "Saimx69x (API by Renz)",
    countDown: 5,
    role: 0,
    description: {
      en: "Generate an AI image using the Oculux Imagen3 API",
    },
    category: "image generator",
    guide: {
      en: "{pn} <prompt>\nExample: ${prefix}imagen3 futuristic dragon flying in space",
    },
  },

  onStart: async function ({ message, event, args, api, commandName }) {
    const prefix = global.utils?.getPrefix
      ? global.utils.getPrefix(event.threadID)
      : global.GoatBot?.config?.prefix || "/";

    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply(
        `⚠️ Please provide a prompt.\nExample: ${prefix}${commandName} futuristic dragon flying in space`
      );
    }

    api.setMessageReaction("🎨", event.messageID, () => {}, true);
    const waitingMsg = await message.reply("🎨 Generating your Imagen3 image... Please wait...");

    try {
      const apiBase = await getApiBase();
      if (!apiBase) throw new Error("API base not found!");

      const encodedPrompt = encodeURIComponent(prompt);
      const url = `${apiBase}/api/imagen3?prompt=${encodedPrompt}`;
      const imgPath = path.join(__dirname, "cache", `imagen3_${event.senderID}.png`);

      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, response.data);

      await message.reply(
        {
          body: `✅ Here is your generated ${commandName} image.`,
          attachment: fs.createReadStream(imgPath),
        },
        () => {
          fs.unlinkSync(imgPath);
          if (waitingMsg?.messageID) api.unsendMessage(waitingMsg.messageID);
        }
      );
    } catch (error) {
      console.error("Imagen3 generation error:", error);
      message.reply("⚠️ Failed to generate image. Please try again later.");
      if (waitingMsg?.messageID) api.unsendMessage(waitingMsg.messageID);
    }
  },
};
