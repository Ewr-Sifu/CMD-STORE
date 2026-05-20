const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://goatbotdb:100078859776449@cluster0.ahxxd2o.mongodb.net";

let client = null;
let collection = null;

async function connectDB() {
  try {
    
    if (!client || (client.topology && client.topology.isDestroyed())) {
      if (client) {
        await client.close().catch(() => {});
      }

      client = new MongoClient(uri, {
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true,
      });

      await client.connect();
      console.log("✅ MongoDB Connected Successfully (New Cluster)");
    }

    if (!collection) {
      const db = client.db("OZADNOOB1");   
      collection = db.collection("myvideos");
    }

    return collection;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw new Error("❌ Database connection failed. Try again later.");
  }
}

module.exports = {
  config: {
    name: "myvideo",
    aliases: ["mvd", "myv", "mv"],
    version: "4.2",
    author: "Raihan × SIFAT",
    role: 0,
    description: "Advanced Video Manager - New MongoDB Cluster + Auto Reconnect",
    category: "media",
    guide: "Reply video → save\nNumber → play\nedit <no> <caption>\ndelete <no>\nsearch <word>\np <page>\nclear"
  },

  onStart: async function({ message, args, event }) {
    const reply = event.messageReply;
    const userID = event.senderID;

    let col;
    try {
      col = await connectDB();
    } catch (e) {
      return message.reply("❌ Database connection error. Please try again in few seconds.");
    }

   
    if (reply?.attachments?.[0]?.url) {
      const caption = args.join(" ") || "No Caption";
      try {
        await col.insertOne({
          url: reply.attachments[0].url,
          caption: caption.trim(),
          user: userID,
          createdAt: new Date()
        });
        return message.reply(`✅ Video saved successfully!\n🎬 ${caption}`);
      } catch (err) {
        return message.reply("❌ Failed to save video.");
      }
    }

    let targetID = userID;
    const mentions = Object.keys(event.mentions || {});
    if (mentions.length) targetID = mentions[0];

    let videos = [];
    try {
      videos = await col.find({ user: targetID }).sort({ createdAt: -1 }).toArray();
    } catch (e) {
      return message.reply("❌ Failed to load videos.");
    }

    if (videos.length === 0) {
      return message.reply(targetID === userID ? "❌ You have no saved videos yet." : "❌ This user has no saved videos.");
    }

    return sendPage({ message, videos, page: 1, targetID, author: userID });
  },

  onReply: async function({ event, Reply, message }) {
    if (event.senderID !== Reply.author) return;

    let col;
    try {
      col = await connectDB();
    } catch (e) {
      return message.reply("❌ Database error. Try again.");
    }

    const body = event.body.trim();
    const lower = body.toLowerCase();

    let videos = [];
    try {
      videos = await col.find({ user: Reply.targetID }).sort({ createdAt: -1 }).toArray();
    } catch (e) {
      return message.reply("❌ Failed to fetch videos.");
    }

    const perPage = 15;

    if (lower.startsWith("search ")) {
      const keyword = body.slice(7).trim().toLowerCase();
      if (!keyword) return message.reply("❌ Search keyword din!");

      const filtered = videos.filter(v => v.caption.toLowerCase().includes(keyword));
      if (!filtered.length) return message.reply(`❌ "${keyword}" er kono video pawa jay ni.`);

      return sendPage({
        message, videos: filtered, page: 1,
        targetID: Reply.targetID, author: Reply.author,
        info: `🔍 Search: ${keyword} (${filtered.length} ta)`
      });
    }

    // Clear All
    if (lower === "clear" || lower === "clear all") {
      await col.deleteMany({ user: Reply.targetID });
      return message.reply(`🗑️ Sob ${videos.length} ta video delete kora hoyeche!`);
    }

  
    if (lower.startsWith("p ")) {
      const page = parseInt(lower.split(" ")[1]);
      if (!page || page < 1) return message.reply("❌ Valid page number din!");
      return sendPage({ message, videos, page, targetID: Reply.targetID, author: Reply.author });
    }

    const start = (Reply.page - 1) * perPage;
    const pageVideos = videos.slice(start, start + perPage);


    if (lower.startsWith("delete ")) {
      const idx = parseInt(lower.split(" ")[1]);
      if (!idx || idx < 1 || idx > pageVideos.length) {
        return message.reply(`❌ 1-${pageVideos.length} er moddhe number din`);
      }
      const vid = pageVideos[idx - 1];
      await col.deleteOne({ _id: vid._id });

      const updated = await col.find({ user: Reply.targetID }).sort({ createdAt: -1 }).toArray();
      return sendPage({
        message, videos: updated, page: Reply.page,
        targetID: Reply.targetID, author: Reply.author,
        info: `🗑️ Deleted: ${vid.caption}`
      });
    }


    if (lower.startsWith("edit ")) {
      const parts = body.split(" ");
      const idx = parseInt(parts[1]);
      const newCap = parts.slice(2).join(" ").trim();

      if (!idx || idx < 1 || idx > pageVideos.length) return message.reply(`❌ 1-${pageVideos.length} number`);
      if (!newCap) return message.reply("❌ Notun caption likhun!");

      const vid = pageVideos[idx - 1];
      await col.updateOne({ _id: vid._id }, { $set: { caption: newCap } });

      const updated = await col.find({ user: Reply.targetID }).sort({ createdAt: -1 }).toArray();
      return sendPage({
        message, videos: updated, page: Reply.page,
        targetID: Reply.targetID, author: Reply.author,
        info: `✏️ Updated: ${newCap}`
      });
    }

    const idx = parseInt(body);
    if (!idx || idx < 1 || idx > pageVideos.length) {
      return message.reply(`❌ Play korar jonno 1-${pageVideos.length} number reply korun.`);
    }

    const video = pageVideos[idx - 1];
    const tempFile = path.join(__dirname, `temp_${Date.now()}.mp4`);

    try {
      const res = await axios.get(video.url, { responseType: "stream", timeout: 15000 });
      const writer = fs.createWriteStream(tempFile);
      res.data.pipe(writer);

      await new Promise((res, rej) => {
        writer.on("finish", res);
        writer.on("error", rej);
      });

      await message.reply({
        attachment: fs.createReadStream(tempFile),
        body: `🎬 ${video.caption}`
      });
    } catch (err) {
      console.error(err);
      message.reply("❌ Video play korte problem hoyeche (link expire hoye thakte pare).");
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  }
};

async function sendPage({ message, videos, page, targetID, author, info = "" }) {
  const perPage = 15;
  const total = videos.length;
  const totalPages = Math.ceil(total / perPage);
  page = Math.max(1, Math.min(page, totalPages || 1));

  const start = (page - 1) * perPage;
  const list = videos.slice(start, start + perPage);

  let msg = info ? `${info}\n━━━━━━━━━━━━━━━\n` : "";
  msg += `📂 Video List (${total} ta)\n`;
  msg += `👤 ${targetID === author ? "Apnar" : "User er"}\n`;
  msg += "━━━━━━━━━━━━━━━\n";

  list.forEach((v, i) => {
    msg += `${start + i + 1}. ${v.caption}\n`;
  });

  msg += "━━━━━━━━━━━━━━━\n";
  msg += `📖 Page ${page}/${totalPages || 1}\n\n`;
  msg += `💡 Reply korun:\n`;
  msg += `   • Number → Video Play\n`;
  msg += `   • edit <number> <notun caption>\n`;
  msg += `   • delete <number>\n`;
  msg += `   • search <keyword>\n`;
  msg += `   • p <page>\n`;
  msg += `   • clear → Sob delete`;

  const sent = await message.reply(msg);

  global.GoatBot.onReply.set(sent.messageID, {
    commandName: "myvideo",
    author,
    targetID,
    page
  });
}
