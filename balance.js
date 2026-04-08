const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const fontDir = path.join(__dirname, 'assets', 'font');
const cacheDir = path.join(__dirname, 'cache');

try {
    if (fs.existsSync(path.join(fontDir, 'NotoSans-Bold.ttf'))) {
        registerFont(path.join(fontDir, 'NotoSans-Bold.ttf'), { family: 'NotoSans', weight: 'bold' });
    }
    if (fs.existsSync(path.join(fontDir, 'NotoSans-SemiBold.ttf'))) {
        registerFont(path.join(fontDir, 'NotoSans-SemiBold.ttf'), { family: 'NotoSans', weight: '600' });
    }
    if (fs.existsSync(path.join(fontDir, 'NotoSans-Regular.ttf'))) {
        registerFont(path.join(fontDir, 'NotoSans-Regular.ttf'), { family: 'NotoSans', weight: 'normal' });
    }
    if (fs.existsSync(path.join(fontDir, 'BeVietnamPro-Bold.ttf'))) {
        registerFont(path.join(fontDir, 'BeVietnamPro-Bold.ttf'), { family: 'BeVietnamPro', weight: 'bold' });
    }
    if (fs.existsSync(path.join(fontDir, 'BeVietnamPro-SemiBold.ttf'))) {
        registerFont(path.join(fontDir, 'BeVietnamPro-SemiBold.ttf'), { family: 'BeVietnamPro', weight: '600' });
    }
} catch (e) {
    console.log("BalanceCard: Using fallback fonts");
}

const CURRENCY_SYMBOL = "$";

// money cdi
function formatMoney(amount) {
    if (!amount || amount === 0) return "0";

    const units = [
        { value: 1e303, symbol: "Ct" },
        { value: 1e100, symbol: "Googol" },
        { value: 1e93,  symbol: "Tg" },
        { value: 1e90,  symbol: "NVg" },
        { value: 1e87,  symbol: "OVg" },
        { value: 1e84,  symbol: "SVg" },
        { value: 1e81,  symbol: "SxVg" },
        { value: 1e78,  symbol: "QVg" },
        { value: 1e75,  symbol: "QaVg" },
        { value: 1e72,  symbol: "TVg" },
        { value: 1e69,  symbol: "DVg" },
        { value: 1e66,  symbol: "UVg" },
        { value: 1e63,  symbol: "V" },
        { value: 1e60,  symbol: "ND" },
        { value: 1e57,  symbol: "OD" },
        { value: 1e54,  symbol: "SD" },
        { value: 1e51,  symbol: "SxD" },
        { value: 1e48,  symbol: "QD" },
        { value: 1e45,  symbol: "QaD" },
        { value: 1e42,  symbol: "TD" },
        { value: 1e39,  symbol: "DD" },
        { value: 1e36,  symbol: "UD" },
        { value: 1e33,  symbol: "Dc" },
        { value: 1e30,  symbol: "No" },
        { value: 1e27,  symbol: "Oc" },
        { value: 1e24,  symbol: "Sp" },
        { value: 1e21,  symbol: "Sx" },
        { value: 1e18,  symbol: "Qa" },
        { value: 1e15,  symbol: "Q" },
        { value: 1e12,  symbol: "T" },
        { value: 1e9,   symbol: "B" },
        { value: 1e6,   symbol: "M" },
        { value: 1e3,   symbol: "K" }
    ];

    for (const unit of units) {
        if (amount >= unit.value) {
            const formatted = (amount / unit.value).toFixed(2).replace(/\.?0+$/, "");
            return formatted + unit.symbol;
        }
    }

    return amount.toLocaleString("en-US");
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.closePath();
}

async function getProfilePicture(uid) {
    try {
        const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const response = await axios.get(avatarURL, { responseType: 'arraybuffer', timeout: 10000 });
        return await loadImage(Buffer.from(response.data));
    } catch (error) {
        console.error("Failed to fetch profile picture:", error.message);
        return null;
    }
}

function drawDefaultAvatar(ctx, x, y, size) {
    const gradient = ctx.createRadialGradient(x + size/2, y + size/2, 0, x + size/2, y + size/2, size/2);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(1, '#16a34a');
    
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2 - 10, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(x + size/2, y + size/2 + 45, 40, 30, 0, Math.PI, 0, true);
    ctx.fill();
}

async function createBalanceCard(userData, userID, balance) {
    const width = 950;
    const height = 520;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Bg cdi
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0f0d');
    gradient.addColorStop(0.35, '#0d1f17');
    gradient.addColorStop(0.65, '#0f2a1d');
    gradient.addColorStop(1, '#0a0f0d');

    drawRoundedRect(ctx, 0, 0, width, height, 25);
    ctx.fillStyle = gradient;
    ctx.fill();

    // noise cdi 
    ctx.save();
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.2 + 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.25 + 0.08})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // BOARD CDI
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 14, 14, width - 28, height - 28, 22);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, 22, 22, width - 44, height - 44, 18);
    ctx.stroke();

  
    const glowGradient = ctx.createLinearGradient(0, 0, 380, 0);
    glowGradient.addColorStop(0, 'rgba(34, 197, 94, 0.18)');
    glowGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, 380, height);

    // Title
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
    ctx.shadowBlur = 12;
    ctx.fillText('WALLET BALANCE', 52, 68);
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.font = '600 15px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('Digital Payment Card', 52, 98);

    // Available Balance Label
    ctx.font = '600 15px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillStyle = 'rgba(187, 247, 208, 0.75)';
    ctx.fillText('AVAILABLE BALANCE', 52, 172);

    const formattedBalance = formatMoney(balance);

   
    ctx.save();
    for (let i = 8; i > 0; i--) {
        ctx.fillStyle = `rgba(34, 197, 94, ${0.018 * i})`;
        ctx.font = `bold ${72 + i * 0.6}px "NotoSans", "BeVietnamPro", sans-serif`;
        ctx.fillText(`${CURRENCY_SYMBOL}${formattedBalance}`, 52 + (8 - i) * 0.15, 255 + (8 - i) * 0.15);
    }
    ctx.restore();

    // Main Balance
    const balanceGradient = ctx.createLinearGradient(50, 205, 480, 265);
    balanceGradient.addColorStop(0, '#86efac');
    balanceGradient.addColorStop(0.5, '#4ade80');
    balanceGradient.addColorStop(1, '#22c55e');

    ctx.fillStyle = balanceGradient;
    ctx.font = 'bold 72px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillText(`${CURRENCY_SYMBOL}${formattedBalance}`, 52, 255);

   
    ctx.font = '600 14px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillStyle = 'rgba(187, 247, 208, 0.75)';
    ctx.fillText('CARD HOLDER', 52, 325);

    ctx.font = 'bold 27px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillStyle = '#ffffff';
    const displayName = (userData.name || 'Unknown').toUpperCase().slice(0, 24);
    ctx.fillText(displayName, 52, 362);

   
    ctx.font = '600 14px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillStyle = 'rgba(187, 247, 208, 0.75)';
    ctx.fillText('USER ID', 52, 415);

    ctx.font = 'bold 19px "NotoSans", "BeVietnamPro", monospace';
    ctx.fillStyle = '#bbf7d0';
    ctx.fillText(userID, 52, 450);

 
    const picSize = 138;
    const picX = width - picSize - 52;
    const picY = 52;

  
    ctx.save();
    for (let i = 16; i > 0; i--) {
        ctx.beginPath();
        ctx.arc(picX + picSize / 2, picY + picSize / 2, picSize / 2 + i, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${0.014 * i})`;
        ctx.fill();
    }
    ctx.restore();

    const profilePic = await getProfilePicture(userID);

    if (profilePic) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(picX + picSize / 2, picY + picSize / 2, picSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(profilePic, picX, picY, picSize, picSize);
        ctx.restore();
    } else {
        drawDefaultAvatar(ctx, picX, picY, picSize);
    }

    
    ctx.beginPath();
    ctx.arc(picX + picSize / 2, picY + picSize / 2, picSize / 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(picX + picSize / 2, picY + picSize / 2, picSize / 2 + 9, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

   
    const statusX = picX + picSize - 10;
    const statusY = picY + picSize - 10;
    ctx.beginPath();
    ctx.arc(statusX, statusY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.strokeStyle = '#0a0f0d';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    
    const boxY = height - 118;
    const boxWidth = 155;
    const boxHeight = 82;

   
    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.09)';
    drawRoundedRect(ctx, width - 195, boxY, boxWidth, boxHeight, 13);
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '600 11.5px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillStyle = 'rgba(187, 247, 208, 0.65)';
    ctx.textAlign = 'center';
    ctx.fillText('CARD STATUS', width - 117, boxY + 24);
    
    ctx.font = 'bold 17px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('ACTIVE', width - 117, boxY + 53);
    ctx.restore();

 
    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.09)';
    drawRoundedRect(ctx, width - 375, boxY, boxWidth, boxHeight, 13);
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '600 11.5px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillStyle = 'rgba(187, 247, 208, 0.65)';
    ctx.textAlign = 'center';
    ctx.fillText('CARD TYPE', width - 297, boxY + 24);
    
    ctx.font = 'bold 17px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('PREMIUM', width - 297, boxY + 53);
    ctx.restore();

    // Chip
    const chipX = width - 185;
    const chipY = 205;
    const chipGradient = ctx.createLinearGradient(chipX, chipY, chipX + 68, chipY + 52);
    chipGradient.addColorStop(0, '#e0c070');
    chipGradient.addColorStop(0.4, '#f5e8b3');
    chipGradient.addColorStop(0.7, '#d4af37');
    chipGradient.addColorStop(1, '#b38b00');

    drawRoundedRect(ctx, chipX, chipY, 68, 52, 7);
    ctx.fillStyle = chipGradient;
    ctx.fill();

    ctx.strokeStyle = '#8c6f00';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(chipX + 6, chipY + 11 + i * 10);
        ctx.lineTo(chipX + 62, chipY + 11 + i * 10);
        ctx.stroke();
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    ctx.save();
    ctx.font = '600 11px "NotoSans", "BeVietnamPro", sans-serif';
    ctx.fillStyle = 'rgba(187, 247, 208, 0.45)';
    ctx.textAlign = 'right';
    ctx.fillText(`Generated: ${dateStr}`, width - 48, height - 16);
    ctx.restore();

    return canvas.toBuffer('image/png', { quality: 1.0 });
}

module.exports = {
    config: {
        name: "balancec",
        aliases: ["bal", "wallet", "mybalance", "wcard"],
        version: "2.1.0",
        author: "Neoaz x SIFAT ゐ",
        countDown: 10,
        role: 0,
        description: "Display your wallet balance with a clean & professional card",
        category: "economy",
        guide: `{pn} - View your balance card\n{pn} @tag - View tagged user's balance card`
    },

    onStart: async function({ message, event, usersData, args }) {
        try {
            message.reaction("⏳", event.messageID);

            await fs.ensureDir(cacheDir);

            let targetID = event.senderID;
            
            if (event.messageReply) {
                targetID = event.messageReply.senderID;
            } else if (Object.keys(event.mentions).length > 0) {
                targetID = Object.keys(event.mentions)[0];
            } else if (args[0] && !isNaN(args[0])) {
                targetID = args[0];
            }

            const userData = await usersData.get(targetID);
            
            if (!userData) {
                message.reaction("❌", event.messageID);
                return message.reply("User not found in database!");
            }

            const balance = userData.money || 0;

            const buffer = await createBalanceCard(userData, targetID, balance);
            const imagePath = path.join(cacheDir, `balancecard_${targetID}_${Date.now()}.png`);
            
            await fs.writeFile(imagePath, buffer);

            const isOwn = targetID === event.senderID;
            const msgBody = isOwn 
                ? `${userData.name}\nBalance: ${CURRENCY_SYMBOL}${formatMoney(balance)}`
                : `WALLET CARD\n━━━━━━━━━━━━━━━━━━\n${userData.name}\nBalance: ${CURRENCY_SYMBOL}${formatMoney(balance)}`;

            await message.reply({
                body: msgBody,
                attachment: fs.createReadStream(imagePath)
            });

            message.reaction("✅", event.messageID);

            setTimeout(async () => {
                try {
                    if (await fs.pathExists(imagePath)) {
                        await fs.unlink(imagePath);
                    }
                } catch (e) {}
            }, 6000);

        } catch (error) {
            console.error("Balance Card Error:", error);
            message.reaction("❌", event.messageID);
            return message.reply("An error occurred while generating your balance card. Please try again.");
        }
    }
};
