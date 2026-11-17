import { useMemo, useState } from 'react';
import { CATS } from './lib/detector.js';
import { replyFor } from './lib/replies.js';

const STATUS = { open: '', hidden: 'Disembunyikan', deleted: 'Dihapus', review: 'Perlu ditinjau', ignored: 'Diabaikan', reported: 'Dilaporkan' };
const isNeg = (c) => c.flagged && c.status !== 'ignored';
const canApi = (c) => c.source === 'api' && (c.platform === 'youtube' || c.platform === 'instagram');

function exportCSV(rows) {
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['Platform', 'Postingan', 'Penulis', 'Komentar', 'Kategori', 'Keparahan', 'Bahasa', 'Status', 'Tautan'];
  const body = rows.map((c) => [c.platform, c.post, c.author, c.text, CATS[c.cat]?.label || '', c.severity, c.lang, STATUS[c.status] || 'Terbuka', c.url || ''].map(q).join(','));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + [head.join(','), ...body].join('\n')], { type: 'text/csv' }));
  a.download = `laporan-komentar-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

function Card({ c, act }) {
  const cat = CATS[c.cat];
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(replyFor(c.lang)); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const done = c.status !== 'open';
  return (
    <article className={'cm' + (done ? ' done' : '')}>
      <div className="cm-h">
        <b>{c.author}</b>
        <span className="chip">{c.platform}</span>
        <span className="chip">{(c.lang || '?').toUpperCase()}</span>
        {cat && <span className="chip" style={{ background: cat.color, color: '#fff' }}>{cat.label} · {c.severity}</span>}
        {done && <span className="chip st">{STATUS[c.status]}</span>}
      </div>
      <p className="txt">{c.text}</p>
      {c.translation && <p className="mut">Terjemahan: {c.translation}</p>}
      {(c.reason || c.hits?.length > 0) && <p className="mut">{c.reason}{c.hits?.length > 0 && ` Pemicu: ${c.hits.join(', ')}`}</p>}
      <div className="acts">
        {canApi(c) ? <><button onClick={() => act(c, 'hide')} disabled={c.status === 'hidden'}>Sembunyikan</button><button className="danger" onClick={() => act(c, 'delete')} disabled={c.status === 'deleted'}>Hapus</button></>
          : <button onClick={() => act(c, 'report')}>Laporkan di platform</button>}
        <button onClick={() => act(c, 'review')}>Tinjau</button>
        {c.status === 'ignored' ? <button onClick={() => act(c, 'open')}>Pulihkan</button> : <button onClick={() => act(c, 'ignored')}>Abaikan</button>}
        <button onClick={copy}>{copied ? 'Tersalin ✓' : 'Salin balasan'}</button>
        {c.url && <a href={c.url} target="_blank" rel="noreferrer">Buka asli</a>}
      </div>
    </article>
  );
}

export default function Dashboard({ comments, act, reanalyze, busy, goImport }) {
  const [plat, setPlat] = useState('');
  const [lang, setLang] = useState('');
  const [cat, setCat] = useState('');
  const [sel, setSel] = useState(null);
  const [all, setAll] = useState(false);

  const data = useMemo(() => comments.filter((c) => (!plat || c.platform === plat) && (!lang || c.lang === lang) && (!cat || c.cat === cat)), [comments, plat, lang, cat]);
  const neg = data.filter(isNeg);
  const posts = useMemo(() => {
    const m = new Map();
    data.forEach((c) => { const k = c.platform + '::' + c.post; if (!m.has(k)) m.set(k, { k, title: c.post, platform: c.platform, url: c.url, all: [], neg: [] }); const p = m.get(k); p.all.push(c); if (isNeg(c)) p.neg.push(c); });
    return [...m.values()].sort((a, b) => b.neg.length - a.neg.length || b.all.length - a.all.length);
  }, [data]);
  const opts = (key) => [...new Set(comments.map((c) => c[key]).filter(Boolean))].sort();
  const post = sel && posts.find((p) => p.k === sel);

  if (!comments.length) return (
    <section className="empty">
      <h1>Cari komentar negatif di semua postinganmu.</h1>
      <p>Impor komentar dari CSV, tempel teks, atau ambil langsung dari YouTube dan Instagram. SafeComment menandai ujaran kebencian, hinaan, spam, dan pelecehan dalam berbagai bahasa.</p>
      <button className="btn" onClick={goImport}>Impor komentar pertama</button>
    </section>
  );

  if (post) {
    const rows = (all ? post.all : post.neg).slice().sort((a, b) => b.severity - a.severity);
    const bulk = post.neg.filter((c) => canApi(c) && c.status === 'open');
    return (
      <section>
        <button className="link" onClick={() => setSel(null)}>‹ Kembali ke daftar postingan</button>
        <h1 className="h2">{post.title}</h1>
        <p className="mut">{post.platform} · {post.all.length} komentar · {post.neg.length} ditandai</p>
        <div className="row">
          <label className="chk"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Tampilkan juga komentar yang aman</label>
          {bulk.length > 0 && <button className="btn sm" onClick={async () => { if (window.confirm(`Sembunyikan ${bulk.length} komentar ditandai di platform?`)) for (const c of bulk) await act(c, 'hide'); }}>Sembunyikan {bulk.length} komentar ditandai</button>}
        </div>
        {rows.length ? rows.map((c) => <Card key={c.uid} c={c} act={act} />) : <p className="mut">Tidak ada komentar negatif di postingan ini.</p>}
      </section>
    );
  }

  const byCat = Object.keys(CATS).map((k) => [k, neg.filter((c) => c.cat === k).length]);
  const maxCat = Math.max(1, ...byCat.map((x) => x[1]));
  const bad = posts.filter((p) => p.neg.length).length;
  return (
    <section>
      <div className="stats">
        <div className="stat"><span>Total komentar</span><b>{data.length}</b></div>
        <div className="stat red"><span>Ditandai negatif</span><b>{neg.length}</b></div>
        <div className="stat"><span>Persentase negatif</span><b>{data.length ? Math.round((neg.length / data.length) * 100) : 0}%</b></div>
        <div className="stat"><span>Postingan bermasalah</span><b>{bad}</b></div>
      </div>
      <div className="panel">
        <h3>Sebaran kategori</h3>
        {byCat.map(([k, n]) => <div className="bar" key={k}><span>{CATS[k].label}</span><i><u style={{ width: (n / maxCat) * 100 + '%', background: CATS[k].color }} /></i><b>{n}</b></div>)}
      </div>
      <div className="row filters">
        <select value={plat} onChange={(e) => setPlat(e.target.value)}><option value="">Semua platform</option>{opts('platform').map((x) => <option key={x}>{x}</option>)}</select>
        <select value={lang} onChange={(e) => setLang(e.target.value)}><option value="">Semua bahasa</option>{opts('lang').map((x) => <option key={x} value={x}>{x.toUpperCase()}</option>)}</select>
        <select value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Semua kategori</option>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
        <span className="grow" />
        <button className="btn ghost sm" disabled={!!busy} onClick={reanalyze}>Analisis ulang</button>
        <button className="btn ghost sm" onClick={() => exportCSV(neg)}>Ekspor laporan CSV</button>
      </div>
      <h2 className="h2">Postingan dengan komentar negatif</h2>
      {posts.map((p) => (
        <button key={p.k} className="post" onClick={() => setSel(p.k)}>
          <div><b>{p.title}</b><span className="mut">{p.platform} · {p.all.length} komentar</span></div>
          <span className={'badge' + (p.neg.length ? ' red' : '')}>{p.neg.length} negatif</span>
        </button>
      ))}
    </section>
  );
}
