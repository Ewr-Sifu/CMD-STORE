const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mistake",
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Funny mistake meme generator",
    longDescription: "Tag or reply to someone to create a mistake meme.",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply" && !targetID) {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐬𝐨𝐦𝐞𝐨𝐧𝐞 𝐭𝐨 𝐜𝐫𝐞𝐚𝐭𝐞 𝐚 𝐦𝐢𝐬𝐭𝐚𝐤𝐞 𝐦𝐞𝐦𝐞!");
    }

    try {
      const githubRawUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const apiRes = await axios.get(githubRawUrl);
      const baseUrl = apiRes.data.apiv1;

      const API_URL = `${baseUrl}/api/mistake?uid=${targetID}`;
      const tmp = path.join(__dirname, "..", "cache");
      await fs.ensureDir(tmp);
      const outputPath = path.join(tmp, `mistake_${targetID}_${Date.now()}.png`);

      const response = await axios.get(API_URL, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data);
      await fs.writeFile(outputPath, imageBuffer);

      const userInfo = await api.getUserInfo(targetID);
      const tagName = userInfo[targetID]?.name || "Someone";

      await message.reply({
        body: `@${tagName}`,
        mentions: [{ tag: `@${tagName}`, id: targetID }],
        attachment: fs.createReadStream(outputPath),
      });

      await fs.unlink(outputPath);
    } catch (err) {
      console.error("❌ Mistake Command Error:", err);
      message.reply("⚠️ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.");
    }
  },
};
