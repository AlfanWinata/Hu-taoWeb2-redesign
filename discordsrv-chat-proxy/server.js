/**
 * Proxy chat DiscordSRV → Website Hu Tao SMP
 * ------------------------------------------
 * Kenapa perlu proxy ini?
 * Discord API butuh "bot token" untuk membaca isi pesan channel. Token itu
 * TIDAK BOLEH ditaruh di file HTML/JS yang berjalan di browser pengunjung,
 * karena siapa pun bisa buka "View Source" dan mencuri token itu, lalu
 * mengendalikan bot Discord-mu sepenuhnya (baca semua channel, kirim pesan
 * atas nama bot, dsb).
 *
 * Server kecil ini menyimpan token dengan aman di sisi server (file .env,
 * tidak pernah dikirim ke browser), lalu mengekspos satu endpoint publik
 * yang HANYA berisi pesan yang sudah dibersihkan (nama, isi pesan, waktu).
 *
 * ------------------------------------------
 * CARA PAKAI
 * ------------------------------------------
 * 1. Install Node.js (v18+) di server/hosting mana pun (VPS, Railway,
 *    Render, Fly.io, dsb — bisa di server yang sama dengan Minecraft-mu
 *    atau terpisah, asal bisa diakses lewat internet).
 *
 * 2. Di folder ini, jalankan:
 *      npm install
 *
 * 3. Buat file ".env" di folder yang sama, isi:
 *      DISCORD_BOT_TOKEN=isi_token_bot_discord_kamu
 *      DISCORD_CHANNEL_ID=id_channel_yang_dijembatani_DiscordSRV
 *      ALLOWED_ORIGIN=https://domain-website-kamu.my.id
 *      PORT=3001
 *
 *    - Token bot: pakai bot Discord yang SAMA dengan yang dipakai DiscordSRV
 *      (lihat plugins/DiscordSRV/config.yml -> "BotToken"), atau buat bot
 *      terpisah khusus untuk baca-saja dan invite ke server Discord-mu.
 *    - Channel ID: klik kanan channel di Discord (mode developer aktif) ->
 *      "Copy Channel ID". Pakai channel yang sama dengan "MinecraftChannel"
 *      di config DiscordSRV supaya pesannya sinkron dengan in-game chat.
 *    - ALLOWED_ORIGIN: alamat website kamu, supaya endpoint ini hanya bisa
 *      dipanggil dari website-mu sendiri (bukan sembarang situs).
 *
 * 4. Jalankan servernya:
 *      node server.js
 *
 * 5. Setelah proxy ini online (misal di https://chat.hu-tao.nexuscloud.id),
 *    buka file HTML website dan isi:
 *      const CHAT_API_URL = 'https://chat.hu-tao.nexuscloud.id/messages';
 *    Website akan otomatis beralih dari "Mode Demo" ke "Live · DiscordSRV".
 *
 * Endpoint yang tersedia:
 *   GET /messages  -> 20 pesan terbaru dari channel, format:
 *     [{ "id":"...", "name":"Steve", "content":"halo semua",
 *        "tag":"DISCORD", "time":"2 menit lalu" }, ...]
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const {
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
  ALLOWED_ORIGIN,
  PORT = 3001,
} = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID) {
  console.error('❌ DISCORD_BOT_TOKEN dan DISCORD_CHANNEL_ID wajib diisi di file .env');
  process.exit(1);
}

app.use(cors({ origin: ALLOWED_ORIGIN || '*' }));

function timeAgo(dateString) {
  const diffSec = Math.max(0, Math.round((Date.now() - new Date(dateString).getTime()) / 1000));
  if (diffSec < 60) return 'baru saja';
  const m = Math.round(diffSec / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.round(m / 60);
  return `${h} jam lalu`;
}

// simple in-memory cache so we don't hammer Discord's API on every page view
let cache = { data: [], fetchedAt: 0 };
const CACHE_MS = 3000;

app.get('/messages', async (req, res) => {
  try {
    if (Date.now() - cache.fetchedAt < CACHE_MS) {
      return res.json(cache.data);
    }

    const discordRes = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages?limit=20`,
      { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
    );

    if (!discordRes.ok) {
      throw new Error(`Discord API error: ${discordRes.status}`);
    }

    const raw = await discordRes.json();

    // sanitize: only send what the front-end actually needs, never the raw
    // Discord payload (avoids leaking IDs, embeds, attachments, etc.)
    const cleaned = raw
      .filter(m => m.content && m.content.trim().length > 0)
      .reverse()
      .map(m => ({
        id: m.id,
        name: m.member?.nick || m.author?.global_name || m.author?.username || 'Pemain',
        content: m.content.slice(0, 200),
        tag: m.webhook_id ? 'DISCORD' : null, // DiscordSRV often relays via webhook
        time: timeAgo(m.timestamp),
      }));

    cache = { data: cleaned, fetchedAt: Date.now() };
    res.json(cleaned);
  } catch (err) {
    console.error('Gagal mengambil pesan Discord:', err.message);
    res.status(502).json({ error: 'Gagal mengambil pesan dari Discord' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy chat DiscordSRV berjalan di http://localhost:${PORT}`);
  console.log(`   Endpoint: http://localhost:${PORT}/messages`);
});
