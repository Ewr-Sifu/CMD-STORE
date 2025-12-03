const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "calculator",
    version: "1.0",
    author: "Saimx69x",
    role: 0,
    usePrefix: true,
    shortDescription: "Stylish calculator image via API",
    longDescription: "Generate a stylish calculator image with your expression via API",
    category: "tools",
    guide: "{pn} [expression] → e.g. {pn} 123+456",
    countDown: 3
  },

  onStart: async ({ message, args }) => {
    try {
      if (!args.length || !args.join("").match(/^[0-9+\-*/().\s]+$/)) {
        return message.reply(
          "⚠️ You used the calculator command incorrectly!\n\n" +
          "✅ Correct usage examples:\n" +
          "`/calculator 123+456` → Add numbers\n" +
          "`/calculator (12*3)-5` → Complex expression\n\n" +
          "💡 Only use numbers and operators (+, -, *, /, (, )) in the expression."
        );
      }

      const expression = args.join(" ").trim();

      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, "calculator.png");

      const apiUrl = `${apiBase}/api/calculator?calculate=${encodeURIComponent(expression)}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      await fs.writeFile(filePath, buffer);

      return message.reply({ attachment: fs.createReadStream(filePath) });

    } catch (err) {
      console.error("❌ Calculator command error:", err.message);
      return message.reply(
        "❌ Failed to generate calculator image.\n💬 Contact author for help: https://m.me/ye.bi.nobi.tai.244493"
      );
    }
  }
};
