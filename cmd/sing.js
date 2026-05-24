const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

const SIFAT_CHUDTESE = "https://raw.githubusercontent.com/MYB-SIFU/SIFATChudtese/refs/heads/main/sifatapichudtese.json";
const CACHE_DIR = path.join(__dirname, "..", "cache");
const FAST_MODE = process.env.SIFU_MP3_FAST !== "0";
const LIST_TTL = 5 * 60 * 1000;

const pickerStore = new Map();
const locks = new Map();
let _base = null;

async function getBase() {
    if (_base) return _base;
    try {
        const res = await axios.get(SIFAT_CHUDTESE, { timeout: 10000 });
        const raw = (typeof res.data === "string" ? res.data : JSON.stringify(res.data)).replace(/,\s*([}\]])/g, "$1");
        _base = (JSON.parse(raw).music || "").replace(/\/+$/, "");
    } catch (_) { 
        throw new Error("API base load failed");
    }
    return _base;
}

async function apiGet(urlPath, params) {
    const res = await axios.get(`${await getBase()}${urlPath}`, { params, timeout: 180000, validateStatus: s => s < 300 });
    return res.data;
}

async function streamDown(urlPath, params, savePath) {
    await fs.ensureDir(CACHE_DIR);
    const res = await axios.get(`${await getBase()}${urlPath}`, { 
        params, 
        timeout: 180000, 
        responseType: "stream", 
        validateStatus: s => s < 300 
    });
    const tmp = savePath + ".part";
    await new Promise((ok, fail) => {
        const w = fs.createWriteStream(tmp);
        res.data.pipe(w);
        w.on("finish", ok);
        w.on("error", fail);
        res.data.on("error", fail);
    });
    await fs.move(tmp, savePath, { overwrite: true });
    const st = await fs.stat(savePath);
    let results = [];
    try {
        const e = res.headers["x-search-results"];
        if (e) results = JSON.parse(Buffer.from(e, "base64").toString());
    } catch (_) {}
    return { path: savePath, size: st.size, headers: res.headers, results };
}

const YT_ID = /(?:v=|\/shorts\/|\/embed\/|youtu\.be\/|\/v\/)([A-Za-z0-9_-]{11})/;
const normYT = u => { const m = u && u.match(YT_ID); return m ? `https://www.youtube.com/watch?v=${m[1]}` : u; };
const isYT = u => /youtube\.com|youtu\.be/i.test(u || "");
const fmtDur = s => { if (!s) return "?"; s = Math.floor(s); const m = Math.floor(s/60), ss = s%60; return `${m}:${String(ss).padStart(2,"0")}`; };
const fmtMB = b => b ? (b/1024/1024).toFixed(1) + " ᴍʙ" : "?";
const fmtMs = ms => ms < 1000 ? ms + "ᴍꜱ" : (ms/1000).toFixed(1) + "ꜱ";

const pKey = ctx => `sing:${ctx?.event?.threadID}:${ctx?.event?.senderID}`;
const remember = (ctx, r) => pickerStore.set(pKey(ctx), { r, exp: Date.now() + LIST_TTL });
const recall = ctx => { const e = pickerStore.get(pKey(ctx)); return (e && e.exp > Date.now()) ? e : null; };
const forget = ctx => pickerStore.delete(pKey(ctx));
const lock = uid => { if (!uid) return true; if ((locks.get(uid)||0) > Date.now()) return false; locks.set(uid, Date.now()+120000); return true; };
const unlock = uid => locks.delete(uid);
const react = (ctx, e) => { try { ctx.api?.setMessageReaction(e, ctx.event?.messageID, ()=>{}, true); } catch(_){} };
const reply = (ctx, p) => ctx.reply?.(p);

module.exports = {
    meta: { 
        name: "sing", 
        aliases: ["music"], 
        version: "1.0", 
        author: "SIFAT", // author cng korle tui gay 🫦
        category: "media", 
        cooldown: 4,
        description: "Search & download MP3", 
        usage: "{p}sing [song|URL] [-q 128|192|320] [-list or l]" 
    },

    onRun: async function ({ args, ctx }) {
        const uid = ctx?.event?.senderID || null;

      
        if (ctx?.event?.messageReply) {
            let input = args.join(" ").trim().toLowerCase();
            let numberMatch = input.match(/\b(\d+)\b/);
            if (numberMatch) {
                const saved = recall(ctx);
                if (saved) {
                    args = ["sing pick", numberMatch[1]];
                }
            }
        }

        let quality = "128", mode = "search", pickIdx = null, query = "";
        const rest = [];

        for (let i = 0; i < args.length; i++) {
            const a = args[i].toLowerCase();
            if ((a === "-q" || a === "--quality") && ["128","192","320"].includes(args[i+1])) {
                quality = args[++i]; 
                continue; 
            }
            if (a === "-list" || a === "list" || a === "l") { 
                mode = "list"; 
                continue; 
            }
            if ((a === "sing pick" || a === "-pick") && /^\d+$/.test(args[i+1]||"")) { 
                mode = "sing pick"; 
                pickIdx = parseInt(args[++i]); 
                continue; 
            }
            if (a === "-h" || a === "help") { 
                mode = "help"; 
                continue; 
            }
            rest.push(args[i]);
        }
        query = rest.join(" ").trim();

        if (mode === "help") {
            return reply(ctx, "sing <song> | -q 128|192|320 | -list or l");
        }

        if (mode === "list") {
            if (!query) return reply(ctx, "⚠️ Example: sing zara zara -list");
            react(ctx, "🔍");
            try {
                const imgPath = path.join(CACHE_DIR, `sing_${Date.now()}.png`);
                const res = await streamDown("/api/video/search-image", { q: query, limit: 6, cmd: "Reply with sing pick <num>" }, imgPath);
                
                if (!res.results?.length) { 
                    return react(ctx, "❌❌❌🫦❌❌❌"); 
                }

                remember(ctx, res.results);
                react(ctx, "🫦💞📥📥📥💞🫦");

                await reply(ctx, { 
                    attachment: fs.createReadStream(res.path),
                    body: " " 
                });

                setTimeout(() => fs.unlink(res.path).catch(()=>{}), 60000);
            } catch (e) { 
                react(ctx, "❌❌❌🫦❌❌❌"); 
            }
            return;
        }

        if (!lock(uid)) return; 

        try {
            let url, title, artist, dur;

            if (mode === "pick") {
                const saved = recall(ctx);
                if (!saved) return;
                if (pickIdx < 1 || pickIdx > saved.r.length) return;
                const p = saved.r[pickIdx - 1];
                url = normYT(p.url); 
                title = p.title; 
                artist = p.uploader; 
                dur = p.duration;
                forget(ctx); 
                react(ctx, "🎀💞📥📥📥💞🎀");
            } else {
                if (!query) return;
                if (isYT(query)) {
                    url = normYT(query); 
                    react(ctx, "🫦🎀📥📥📥🎀🫦");
                } else {
                    react(ctx, "🔍");
                    const data = await apiGet("/api/music/search", { q: query, limit: 1 });
                    const top = (data?.results || [])[0];
                    if (!top) { 
                        return react(ctx, "❌❌❌🫦❌❌❌"); 
                    }
                    url = normYT(top.url); 
                    title = top.title; 
                    artist = top.uploader; 
                    dur = top.duration;
                    react(ctx, "🫦🎀📥📥📥🎀🫦");
                }
            }

            const vid = (url.match(YT_ID)||[])[1];
            const tag = `${quality}${FAST_MODE?"f":""}`;
            const savePath = path.join(CACHE_DIR, `${vid||"tmp_"+Date.now()}_${tag}.mp3`);
            const params = { url, quality };
            if (FAST_MODE) params.fast = "1";

            const res = await streamDown("/api/music/download", params, savePath);
            const h = res.headers || {};

            if (h["x-track-title"]) title = decodeURIComponent(h["x-track-title"]);
            if (h["x-track-artist"]) artist = decodeURIComponent(h["x-track-artist"]);
            if (!dur && h["x-track-duration"]) dur = Number(h["x-track-duration"]) || null;

            if (res.size < 1024) { 
                await fs.unlink(res.path).catch(()=>{}); 
                return react(ctx, "❌❌❌❌❌❌❌❌❌"); 
            }
            if (res.size > 25*1024*1024) { 
                return react(ctx, "❌❌❌❌❌❌❌❌❌"); 
            }

            react(ctx, "🎀✅✅✅✅✅✅🎀");
            await reply(ctx, {
                body: [
                    "╔━━━━━━━━━━━━━━━╗",
                    "┣ AUDIO DOWNLOADED",
                    "╚━━━━━━━━━━━━━━━╝",
                    `┣ 🎵 ${title||"?"}`,
                    artist ? `┣ 👤 ${artist}` : null,
                    dur ? `┣ ⏱ ${fmtDur(dur)}` : null,
                    `┣ 🎚 ${quality}kbps · 📦 ${fmtMB(res.size)}`,
                    "╚━━━━━━━━━━━━━━━╝",
                ].filter(Boolean).join("\n"),
                attachment: fs.createReadStream(res.path),
            });
        } catch (e) { 
            react(ctx, "❌❌❌🫦❌❌❌"); 
        } finally { 
            unlock(uid); 
        }
    },
};
