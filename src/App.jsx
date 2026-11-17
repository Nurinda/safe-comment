import { useEffect, useState } from 'react';
import { DEFAULTS, usePersist, uidOf } from './lib/store.js';
import { analyzeAll } from './lib/analyze.js';
import { call } from './lib/api.js';
import { HELP } from './lib/replies.js';
import Dashboard from './Dashboard.jsx';
import Import from './Import.jsx';
import Settings from './Settings.jsx';

const TABS = [['dasbor', 'Dasbor'], ['impor', 'Impor'], ['pengaturan', 'Pengaturan']];

export default function App() {
  const [tab, setTab] = useState('dasbor');
  const [settings, setSettings] = usePersist('sc_settings', DEFAULTS);
  const [comments, setComments] = usePersist('sc_comments', []);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => { document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 5000); return () => clearTimeout(t); } }, [toast]);

  const patch = (uid, p) => setComments((cs) => cs.map((c) => (c.uid === uid ? { ...c, ...p } : c)));

  async function ingest(raw) {
    const norm = raw.map((c) => ({
      ...c, platform: (c.platform || 'lainnya').toLowerCase(), post: c.post || '(tanpa judul)',
      author: c.author || 'anonim', source: c.source || 'import', status: 'open',
    }));
    setBusy('Menganalisis komentar…');
    const { list, note } = await analyzeAll(norm, settings, (a, b) => setBusy(`Analisis AI ${a}/${b}…`));
    const withUid = list.map((c) => ({ ...c, uid: uidOf(c) }));
    setComments((old) => {
      const m = new Map(old.map((c) => [c.uid, c]));
      withUid.forEach((c) => m.set(c.uid, m.has(c.uid) ? { ...c, status: m.get(c.uid).status } : c));
      return [...m.values()];
    });
    setBusy('');
    setToast(`${list.length} komentar diproses, ${list.filter((c) => c.flagged).length} ditandai.${note ? ' ' + note : ''}`);
    return list.length;
  }

  async function reanalyze() {
    setBusy('Menganalisis ulang…');
    const { list, note } = await analyzeAll(comments, settings, (a, b) => setBusy(`Analisis AI ${a}/${b}…`));
    setComments(list.map((c, i) => ({ ...c, status: comments[i].status })));
    setBusy('');
    setToast(note || 'Analisis ulang selesai.');
  }

  async function act(c, type) {
    try {
      if (type === 'hide' || type === 'delete') {
        if (type === 'delete' && !window.confirm('Hapus komentar ini secara permanen di platform?')) return false;
        await call(c.platform, { action: type, id: c.pid }, settings);
        patch(c.uid, { status: type === 'hide' ? 'hidden' : 'deleted' });
        setToast(type === 'hide' ? 'Komentar disembunyikan.' : 'Komentar dihapus.');
      } else if (type === 'report') {
        window.open(c.url || HELP[c.platform] || 'https://www.google.com/search?q=cara+melaporkan+komentar+' + c.platform, '_blank');
        patch(c.uid, { status: 'reported' });
      } else patch(c.uid, { status: type });
      return true;
    } catch (e) { setToast('Aksi gagal: ' + e.message); return false; }
  }

  return (
    <>
      <header className="top">
        <div className="wrap bar">
          <div className="brand"><span className="mark"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg></span>SafeComment</div>
          <nav>{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</nav>
          <button className="icon" title="Ganti tema" onClick={() => setSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}>{settings.theme === 'dark' ? '☀' : '☾'}</button>
          <img className="klogo" src="/kumparan-logo.webp" alt="kumparan" />
        </div>
      </header>
      <main className="wrap">
        {tab === 'dasbor' && <Dashboard {...{ comments, act, reanalyze, busy, goImport: () => setTab('impor') }} />}
        {tab === 'impor' && <Import {...{ ingest, settings, busy, setToast, done: () => setTab('dasbor') }} />}
        {tab === 'pengaturan' && <Settings {...{ settings, setSettings, comments, clear: () => window.confirm('Hapus semua data komentar di browser ini?') && setComments([]), setToast }} />}
      </main>
      {busy && <div className="busy">{busy}</div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
