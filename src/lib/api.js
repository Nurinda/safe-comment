const KEYS = {
  analyze: (s) => ({ key: s.openaiKey, model: s.openaiModel, baseUrl: s.openaiBase }),
  youtube: (s) => ({ key: s.ytKey, token: s.ytToken }),
  instagram: (s) => ({ token: s.igToken, igId: s.igId }),
};
export async function call(fn, body, s) {
  const keys = s.keyMode === 'browser' ? KEYS[fn](s) : {};
  const res = await fetch('/api/' + fn, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...keys, ...body }) });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error || `Permintaan gagal (${res.status}). Pastikan aplikasi dijalankan di Netlify atau 'netlify dev'.`);
  return d;
}
