# SafeComment

Aplikasi pendeteksi komentar negatif (ujaran kebencian, hinaan, spam/judol, pelecehan) dalam banyak bahasa, dibuat untuk tim kumparan. Menampilkan postingan mana yang punya komentar negatif, lengkap dengan tombol aksi.

## Fitur
- Impor: tempel teks, unggah CSV/JSON, ambil dari YouTube dan Instagram (API)
- Deteksi tiga lapis: normalisasi (leetspeak, huruf berulang) → paket bahasa (Indonesia, Melayu, Inggris, Spanyol, Portugis, Prancis, Jerman, Arab, Hindi, Jepang, Korea, Mandarin) → AI OpenAI untuk bahasa lain, sindiran, dan campuran bahasa
- Mode analisis: Hemat, Akurat, Offline. Sensitivitas: Longgar, Sedang, Ketat
- Dasbor: statistik, sebaran kategori, filter platform/bahasa/kategori, postingan diurutkan dari komentar negatif terbanyak
- Aksi: sembunyikan, hapus (YouTube/Instagram), laporkan (platform lain), tinjau, abaikan, salin balasan sesuai bahasa, buka komentar asli, ekspor CSV

## Cara pakai lokal
```bash
npm install
npm install -g netlify-cli
netlify dev        # buka http://localhost:8888 (Functions ikut jalan)
```
`npm run dev` saja hanya menjalankan tampilan; fitur API butuh `netlify dev`.

## Upload ke GitHub
1. Buat repository baru di github.com (kosong, tanpa README).
2. Ekstrak zip ini, lalu di foldernya jalankan:
```bash
git init && git add . && git commit -m "SafeComment pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/safecomment.git
git push -u origin main
```
Atau lewat web: **Add file → Upload files**, tarik semua isi folder (kecuali `node_modules`).

## Deploy ke Netlify
1. Netlify → **Add new site → Import an existing project** → pilih repo GitHub.
2. Pengaturan build terisi otomatis dari `netlify.toml` (build `npm run build`, publish `dist`, functions `netlify/functions`).
3. Klik **Deploy**. Selesai.

## Mengisi API key
**Cara A: lewat Pengaturan aplikasi** (mode "Isi di sini"). Kunci tersimpan di browser dan dikirim ke Function hanya sebagai perantara.
**Cara B: environment variable Netlify** (lebih aman jika situs dipakai banyak orang). Isi variabel dari `.env.example` di *Site configuration → Environment variables*, lalu pilih mode "Kunci disimpan di server" di Pengaturan. Lindungi situs dengan password Netlify, karena siapa pun yang membuka situs bisa memakai kuota kunci server.

| Layanan | Yang dibutuhkan |
|---|---|
| OpenAI | API key dari platform.openai.com. Model default `gpt-4o-mini`, bisa diganti |
| YouTube baca komentar | API key (Google Cloud Console → aktifkan YouTube Data API v3) |
| YouTube sembunyikan/hapus | OAuth access token dengan scope `https://www.googleapis.com/auth/youtube.force-ssl`. Cara cepat: Google OAuth 2.0 Playground (token berlaku sekitar 1 jam). Hanya untuk channel milikmu |
| Instagram | Akun Business/Creator terhubung ke Halaman Facebook, Facebook App dengan izin `instagram_basic`, `instagram_manage_comments`, `pages_show_list`. Isi access token dan Instagram Business Account ID. Token long-lived berlaku sekitar 60 hari |
| TikTok & lainnya | Tidak ada API komentar terbuka, gunakan impor CSV atau tempel teks |

## Format CSV
```csv
komentar,postingan,platform,penulis,tanggal
"Dasar goblok",Video banjir,tiktok,user1,2026-11-17
```

## Batasan
- Data komentar disimpan di browser (localStorage, sekitar 5 MB). Ekspor CSV untuk arsip.
- Netlify Function punya batas waktu singkat, jadi analisis AI dipecah per 25 komentar.
- Hasil otomatis bisa keliru dan tidak merata antar bahasa. Tinjau sebelum menghapus.
- Gunakan hanya untuk memoderasi akun milik organisasimu sendiri.

## Pindah ke hosting lain
Logika server ada di `netlify/functions/*.mjs` dan hanya berisi `fetch` standar, jadi mudah dipindah ke Express di Railway/Render jika nanti butuh database atau auto-scan terjadwal.
