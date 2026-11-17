import { useState } from 'react';
import { fromFile } from './lib/csv.js';
import { call } from './lib/api.js';

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'x', 'facebook', 'lainnya'];

export default function Import({ ingest, settings, busy, setToast, done }) {
  const [post, setPost] = useState('');
  const [platform, setPlatform] = useState('tiktok');
  const [text, setText] = useState('');
  const [yt, setYt] = useState('');
  const [igN, setIgN] = useState(10);

  const run = async (fn) => { try { const n = await fn(); if (n) done(); } catch (e) { setToast('Gagal: ' + e.message); } };

  const paste = () => run(() => {
    const lines = text.split('\n').map((x) => x.trim()).filter(Boolean);
    if (!lines.length) throw new Error('Tempel minimal satu komentar (satu baris per komentar).');
    return ingest(lines.map((t, i) => ({ text: t, post, platform, pid: 'p' + Date.now() + i })));
  });

  const file = (f) => f && run(async () => {
    const rows = fromFile(f.name.toLowerCase(), await f.text());
    if (!rows.length) throw new Error('Tidak ada komentar terbaca. Pastikan ada kolom "komentar".');
    return ingest(rows.map((r) => ({ ...r, platform: r.platform || platform, post: r.post || f.name })));
  });

  const ytGo = () => run(async () => {
    const d = await call('youtube', { action: 'list', video: yt, pages: 3 }, settings);
    return ingest(d.comments.map((c) => ({ text: c.text, author: c.author, date: c.date, pid: c.id, post: d.title, platform: 'youtube', source: 'api', url: `${d.url}&lc=${c.id}` })));
  });

  const igGo = () => run(async () => {
    const d = await call('instagram', { action: 'list', limit: igN }, settings);
    const rows = d.posts.flatMap((p) => p.comments.map((c) => ({ text: c.text, author: c.author, date: c.date, pid: c.id, post: p.title, platform: 'instagram', source: 'api', url: p.url })));
    if (!rows.length) throw new Error('Tidak ada komentar ditemukan di postingan terbaru.');
    return ingest(rows);
  });

  return (
    <section>
      <h1 className="h2">Impor komentar</h1>
      <p className="mut">Pilih cara yang paling mudah. Analisis berjalan di browser; AI hanya menerima teks komentar jika kamu mengaktifkannya.</p>
      <div className="grid2">
        <div className="panel">
          <h3>Tempel teks</h3>
          <label>Nama / link postingan<input value={post} onChange={(e) => setPost(e.target.value)} placeholder="Contoh: Video liputan banjir" /></label>
          <label>Platform<select value={platform} onChange={(e) => setPlatform(e.target.value)}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select></label>
          <label>Komentar (satu baris satu komentar)<textarea rows="6" value={text} onChange={(e) => setText(e.target.value)} placeholder={'Bagus banget beritanya\nDasar goblok semua\nSlot gacor maxwin klik link bio'} /></label>
          <button className="btn" disabled={!!busy} onClick={paste}>Analisis komentar</button>
        </div>
        <div className="panel">
          <h3>Unggah CSV atau JSON</h3>
          <p className="mut">Kolom yang dikenali: komentar, postingan, platform, penulis, tanggal, id. Baris pertama harus berisi nama kolom, dan komentar yang mengandung koma sebaiknya diapit tanda kutip.</p>
          <input type="file" accept=".csv,.json,.tsv,.txt" disabled={!!busy} onChange={(e) => file(e.target.files[0])} />
          <p className="mut">Dipakai untuk TikTok, X, Facebook, dan platform lain tanpa API komentar terbuka.</p>
        </div>
        <div className="panel">
          <h3>Ambil dari YouTube</h3>
          <label>Link atau ID video<input value={yt} onChange={(e) => setYt(e.target.value)} placeholder="https://youtu.be/…" /></label>
          <button className="btn" disabled={!!busy || !yt} onClick={ytGo}>Ambil komentar</button>
          <p className="mut">Butuh API key YouTube di Pengaturan. Maksimal sekitar 300 komentar terbaru per video.</p>
        </div>
        <div className="panel">
          <h3>Ambil dari Instagram</h3>
          <label>Jumlah postingan terbaru<input type="number" min="1" max="25" value={igN} onChange={(e) => setIgN(+e.target.value)} /></label>
          <button className="btn" disabled={!!busy} onClick={igGo}>Ambil komentar</button>
          <p className="mut">Butuh access token dan Business Account ID di Pengaturan. Hanya untuk akun milikmu sendiri.</p>
        </div>
      </div>
    </section>
  );
}
