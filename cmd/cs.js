const axios = require("axios");

const CMDS_INFO_URL = "https://raw.githubusercontent.com/Ewr-Sifu/CMD-STORE/main/cmdsinfo.json";
const CMDS_URL_JSON = "https://raw.githubusercontent.com/Ewr-Sifu/CMD-STORE/main/cmdsurl.json";
const FONT_URL = "https://raw.githubusercontent.com/Ewr-Sifu/CMD-STORE/main/xfont.json";

const ITEMS_PER_PAGE = 10;
let fontMap = {};

async function loadFont() {
  try {
    if (Object.keys(fontMap).length > 0) return;
    const res = await axios.get(FONT_URL);
    fontMap = res.data || {};
  } catch (err) {
    console.error("Font load failed:", err);
  }
}

function toBold(text) {
  if (!text) return "";
  return text.toString().split("").map(ch => fontMap[ch] || ch).join("");
}

module.exports = {
  config: {
    name: "cs",
    aliases: ["cmdstore", "cmds"],
    version: "2.3",
    author: "SIFAT",
    countDown: 3,
    role: 0,
    category: "owner",
    shortDescription: "Command Store",
    longDescription: "Browse and download commands from CMD Store",
    guide: { en: "cs [search | page]" }
  },

  onStart: async function ({ api, event, args }) {
    await loadFont();
    const query = args.join(" ").trim().toLowerCase();

    try {
      const { data } = await axios.get(CMDS_INFO_URL);
      let commands = data.cmdName || [];

      let filtered = commands;
      let page = 1;

      if (query) {
        if (!isNaN(query)) {
          page = parseInt(query);
        } else if (query.length === 1) {
          filtered = commands.filter(c => c.cmd.toLowerCase().startsWith(query));
        } else {
          filtered = commands.filter(c => 
            c.cmd.toLowerCase().includes(query) || 
            (c.author && c.author.toLowerCase().includes(query))
          );
        }
      }

      if (filtered.length === 0) {
        return api.sendMessage(`❌ ${toBold(`No results found for "${query}"`)}`, event.threadID, event.messageID);
      }

      const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
      if (page < 1 || page > totalPages) {
        return api.sendMessage(`❌ ${toBold(`Invalid page! Use 1-${totalPages}`)}`, event.threadID, event.messageID);
      }

      const start = (page - 1) * ITEMS_PER_PAGE;
      const cmdsToShow = filtered.slice(start, start + ITEMS_PER_PAGE);

      let msg = `╔━━━━━━━━━━━━━━━╗\n`;
      msg += `    🍀 ${toBold("𝐂𝐌𝐃 𝐒𝐓𝐎𝐑𝐄")} 🍀\n`;
      msg += `╚━━━━━━━━━━━━━━━╝\n╔━━━━━━━━━━━━━━━╗\n`;
      msg += `          📑 ${toBold(`Page ${page} of ${totalPages}`)}\n`;
      msg += `   📊 ${toBold(`Total Commands: ${filtered.length}`)}\n`;
      msg += `╚━━━━━━━━━━━━━━━╝\n\n`;

      cmdsToShow.forEach((cmd, i) => {
        msg += `💎 ${toBold(`${start + i + 1}. ${cmd.cmd}`)}\n`;
        msg += `👤 ${toBold(`Author: ${cmd.author || "Unknown"}`)}\n`;
        msg += `🕒 ${toBold(`Updated: ${cmd.update || "N/A"}`)}\n`;
        msg += ` ═━─────────────━═\n`;
      });

      msg += `🔢 ${toBold("Reply with a number to get download link")}\n`;
      msg += `➡️ ${toBold(`Type: cs ${page + 1} for next page`)}`;

      api.sendMessage(msg, event.threadID, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "cs",
          author: event.senderID,
          filteredCmds: filtered,
          currentPage: page
        });
      }, event.messageID);

    } catch (err) {
      console.error(err);
      api.sendMessage(`❌ ${toBold("Failed to connect to CMD Store")}`, event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    await loadFont();
    if (Reply.author !== event.senderID) return;

    const num = parseInt(event.body);
    if (isNaN(num)) return;

    const cmdData = Reply.filteredCmds[num - 1];
    if (!cmdData) return api.sendMessage(toBold("❌ Invalid selection!"), event.threadID, event.messageID);

    try {
      const { data } = await axios.get(CMDS_URL_JSON);
      const link = data[cmdData.cmd];

      if (!link) return api.sendMessage(toBold("❌ Download link not available!"), event.threadID, event.messageID);

      const msg = `╔━═━───────────━═━╗\n`;
      msg += `📘 ${toBold("𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐈𝐍𝐅𝐎")} 📘\n`;
      msg += `═━─────────────━═\n`;
      msg += `🧩 ${toBold(`Command: ${cmdData.cmd}`)}\n`;
      msg += `👤 ${toBold(`Author: ${cmdData.author || "Unknown"}`)}\n`;
      msg += `🔗 ${toBold(`Link: ${link}`)}\n`;
      msg += ` ╚━═━───────────━═━╝`;

      api.sendMessage(msg, event.threadID, event.messageID);
    } catch (err) {
      api.sendMessage(toBold("❌ Failed to fetch link!"), event.threadID, event.messageID);
    }
  }
};
