export function parseCSV(text) {
  const first = text.split('\n')[0] || '';
  const d = [',', ';', '\t'].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows = [];
  let r = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === d) { r.push(f); f = ''; }
    else if (c === '\n') { r.push(f); rows.push(r); r = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  return rows.filter((x) => x.some((y) => y.trim()));
}

const ALIAS = {
  text: ['komentar', 'comment', 'text', 'teks', 'isi'],
  post: ['postingan', 'post', 'judul', 'title', 'url', 'link', 'video'],
  platform: ['platform', 'sumber', 'source'],
  author: ['penulis', 'author', 'username', 'user', 'nama'],
  date: ['tanggal', 'date', 'waktu', 'timestamp'],
  pid: ['id', 'comment_id'],
  url: ['url_komentar', 'comment_url'],
};
const pick = (o, keys) => { for (const k of keys) if (o[k] != null && String(o[k]).trim()) return String(o[k]).trim(); return ''; };

export function toComments(objs) {
  return objs.map((o) => {
    const l = Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toLowerCase().trim(), v]));
    return Object.fromEntries(Object.entries(ALIAS).map(([k, a]) => [k, pick(l, a)]));
  }).filter((c) => c.text);
}

export function fromFile(name, text) {
  if (name.endsWith('.json')) { const j = JSON.parse(text); return toComments(Array.isArray(j) ? j : j.comments || []); }
  const rows = parseCSV(text);
  const head = rows.shift() || [];
  return toComments(rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]]))));
}
