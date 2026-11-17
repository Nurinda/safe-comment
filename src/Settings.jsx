import { useState } from 'react';
import { call } from './lib/api.js';
import { PACK_NAMES } from './lib/packs.js';

export default function Settings({ settings: s, setSettings, comments, clear, setToast }) {
  const set = (k) => (e) => setSettings({ ...s, [k]: e.target.value });
  const [testing, setTesting] = useState('');
  const test = async (fn, body, label) => {
    setTesting(label);
    try { await call(fn, body, s); setToast(`${label}: koneksi berhasil ✓`); } catch (e) { setToast(`${label}: ${e.message}`); }
    setTesting('');
  };
  const Field = ({ k, label, type = 'text', ph }) => <label>{label}<input type={type} value={s[k]} onChange={set(k)} placeholder={ph} autoComplete="off" /></label>;

  return (
    <section>
      <h1 className="h2">Pengaturan</h1>

      <div className="panel">
        <h3>Penyimpanan kunci API</h3>
        <label>Cara kunci dipakai
          <select value={s.keyMode} onChange={set('keyMode')}>
            <option value="browser">Isi di sini (disimpan di browser, dikirim ke server hanya sebagai perantara)</option>
            <option value="server">Kunci disimpan di server (environment variable Netlify)</option>
          </select>
        </label>
        <p className="mut">Jika situs ini bisa dibuka orang lain, pilih mode server dan lindungi situs dengan password Netlify. Kolom di bawah tidak dipakai pada mode server.</p>
      </div>

      <div className="grid2">
        <div className="panel">
          <h3>AI (OpenAI)</h3>
          <Field k="openaiKey" label="API key" type="password" ph="sk-…" />
          <Field k="openaiModel" label="Model" ph="gpt-4o-mini" />
          <Field k="openaiBase" label="Base URL (opsional, API yang kompatibel OpenAI)" ph="https://api.openai.com/v1" />
          <button className="btn ghost sm" disabled={!!testing} onClick={() => test('analyze', { comments: [{ i: 0, text: 'tes koneksi' }] }, 'OpenAI')}>Tes koneksi</button>
        </div>
        <div className="panel">
          <h3>YouTube</h3>
          <Field k="ytKey" label="API key (untuk membaca komentar)" type="password" />
          <Field k="ytToken" label="OAuth access token (untuk sembunyikan / hapus)" type="password" />
          <button className="btn ghost sm" disabled={!!testing} onClick={() => test('youtube', { action: 'ping' }, 'YouTube')}>Tes koneksi</button>
        </div>
        <div className="panel">
          <h3>Instagram</h3>
          <Field k="igToken" label="Access token" type="password" />
          <Field k="igId" label="Instagram Business Account ID" ph="17841400000000000" />
          <button className="btn ghost sm" disabled={!!testing} onClick={() => test('instagram', { action: 'ping' }, 'Instagram')}>Tes koneksi</button>
          <p className="mut">TikTok dan platform lain memakai impor manual.</p>
        </div>
        <div className="panel">
          <h3>Deteksi</h3>
          <label>Mode analisis
            <select value={s.analysis} onChange={set('analysis')}>
              <option value="hemat">Hemat: aturan dulu, AI untuk bahasa tanpa paket</option>
              <option value="akurat">Akurat: semua komentar lewat AI</option>
              <option value="offline">Offline: aturan saja, tanpa AI</option>
            </select>
          </label>
          <label>Sensitivitas
            <select value={s.sensitivity} onChange={set('sensitivity')}>
              <option value="longgar">Longgar (hanya yang jelas)</option>
              <option value="sedang">Sedang</option>
              <option value="ketat">Ketat (tandai lebih banyak)</option>
            </select>
          </label>
          <label>Kata terlarang tambahan (pisahkan dengan koma atau baris baru)<textarea rows="3" value={s.black} onChange={set('black')} /></label>
          <label>Kata yang selalu dianggap aman<textarea rows="2" value={s.white} onChange={set('white')} /></label>
          <p className="mut">Paket bahasa bawaan: {Object.values(PACK_NAMES).join(', ')}. Bahasa lain dianalisis oleh AI. Klik “Analisis ulang” di Dasbor setelah mengubah pengaturan.</p>
        </div>
      </div>

      <div className="panel">
        <h3>Data</h3>
        <p className="mut">{comments.length} komentar tersimpan di browser ini. Hasil deteksi otomatis bisa keliru, jadi tinjau sebelum menghapus.</p>
        <button className="btn danger sm" onClick={clear}>Hapus semua data</button>
      </div>
    </section>
  );
}
