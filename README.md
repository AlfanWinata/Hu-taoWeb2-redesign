# Hu Tao SMP — Website

Website resmi Hu Tao SMP, dibangun ulang dengan desain visual bergaya "overworld"
(pixel-friendly, kartun, border tebal ala block) — diadaptasi dari template
desain hutao-smp-website, sambil mempertahankan konten, identitas, dan fitur
asli Hu Tao SMP (rank, top up, leaderboard, rules).

## Struktur halaman

- `index.html` — Beranda: status server live, rank favorit, live chat demo
- `fitur.html` — Daftar fitur server
- `rank.html` — Daftar rank & kalkulator top up Money/Point/Skill
- `leaderboard.html` — Papan peringkat Playtime/Balance/PvP Kills
- `rules.html` — Peraturan server
- `wiki.html` — Panduan pemain baru, command penting, FAQ

## Fitur yang ditambahkan dari desain baru

- Status server live (via mcsrvstat.us) di beranda
- Live chat panel (mode demo, bisa disambungkan ke Discord lewat
  `discordsrv-chat-proxy/` atau `data/chat.json` + GitHub Actions)
- Halaman Wiki & FAQ untuk pemain baru
- Halaman Fitur khusus
- Kalkulator top up dengan stepper qty otomatis hitung total & link WhatsApp

## Menyambungkan live chat ke Discord (opsional)

Dua opsi, dijelaskan lebih detail di dalam `index.html` (bagian script) dan
`discordsrv-chat-proxy/server.js`:

1. **GitHub Actions** (tanpa hosting sendiri) — isi `DISCORD_BOT_TOKEN` dan
   `DISCORD_CHANNEL_ID` sebagai GitHub Secret, workflow di
   `.github/workflows/update-chat.yml` akan update `data/chat.json` tiap 5 menit.
2. **Proxy server sendiri** (lebih real-time) — deploy folder
   `discordsrv-chat-proxy/` ke hosting (Railway/Render/VPS), isi `.env`
   sesuai `.env.example`, lalu isi `CHAT_API_URL` di `index.html`.

Token bot Discord tidak pernah ditaruh langsung di file HTML manapun.

## Kontak & sosial media

- WhatsApp: chat.whatsapp.com/JgSKX5OjKLU30SxYpjv9nX
- Discord: discord.gg/TuKNkSFM5
- TikTok: @hu.tao.smp

Server IP: `hu-tao.nexuscloud.id` · Port: `25502`
