const axios = require("axios");

module.exports = {
  config: {
    name: "bmdp",
    aliases: ["boysmatchingdp"],
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Random Boys Matching DP",
    longDescription: "Send random Boys Matching DP",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const githubRawUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const apiRes = await axios.get(githubRawUrl);
      const baseUrl = apiRes.data.apiv1;

      const res = await axios.get(`${baseUrl}/api/bmdp`);
      const { boy, boy2 } = res.data;

      api.sendMessage(
        {
          body: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐛𝐦𝐝𝐩! 🥰✨️",
          attachment: await Promise.all([
            global.utils.getStreamFromURL(boy),
            global.utils.getStreamFromURL(boy2)
          ])
        },
        event.threadID,
        event.messageID
      );

    } catch (e) {
      api.sendMessage("❌ 𝐎𝐩𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.", event.threadID, event.messageID);
      console.error(e.message);
    }
  }
};
