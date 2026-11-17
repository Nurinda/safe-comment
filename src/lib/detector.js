import { PACKS, STOP } from './packs.js';

export const CATS = {
  hate: { label: 'Ujaran kebencian', color: '#E8264B', w: 90 },
  abuse: { label: 'Hinaan / kata kasar', color: '#E0701A', w: 55 },
  spam: { label: 'Spam / judol / tautan', color: '#9A7B00', w: 50 },
  sexual: { label: 'Pelecehan / seksual', color: '#3A6FD8', w: 70 },
};
const THR = { longgar: 60, sedang: 40, ketat: 25 };
export const thr = (s) => THR[s?.sensitivity] ?? 40;
export const hasPack = (l) => !!PACKS[l];

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a', $: 's' };
const SCRIPTS = [['ar', /[\u0600-\u06FF]/], ['hi', /[\u0900-\u097F]/], ['ja', /[\u3040-\u30FF]/], ['ko', /[\uAC00-\uD7AF]/], ['zh', /[\u4E00-\u9FFF]/], ['ru', /[\u0400-\u04FF]/], ['th', /[\u0E00-\u0E7F]/]];
const STOPSETS = Object.fromEntries(Object.entries(STOP).map(([k, v]) => [k, new Set(v.split(' '))]));
const strip = (s) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
const collapse = (s) => s.replace(/(.)\1+/g, '$1');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const URLRE = /(https?:\/\/|www\.|bit\.ly|t\.me\/|wa\.me\/)/i;

export function guessLang(raw) {
  for (const [l, re] of SCRIPTS) if (re.test(raw)) return l;
  const toks = raw.toLowerCase().match(/[\p{L}]+/gu) || [];
  let best = 'und', top = 0;
  for (const [l, set] of Object.entries(STOPSETS)) {
    const n = toks.filter((t) => set.has(t)).length;
    if (n > top) { top = n; best = l; }
  }
  return best;
}

const cache = new Map();
function rx(w) {
  if (!cache.has(w)) cache.set(w, new RegExp(`(^|[^a-z0-9])${esc(collapse(strip(w.toLowerCase())))}(?:nya|lah|s|es|ed|er|ing)?(?![a-z0-9])`));
  return cache.get(w);
}
const list = (s = '') => s.split(/[\n,]/).map((x) => x.trim().toLowerCase()).filter(Boolean);

export function detect(text, s = {}) {
  const raw = String(text || '');
  const lang = guessLang(raw);
  const nonLatin = SCRIPTS.some(([l, re]) => re.test(raw) && l !== 'ru');
  let t = raw.toLowerCase();
  if (!nonLatin) {
    t = strip(t)
      .replace(/\b(?:[a-z][.\-_]){3,}[a-z]\b/g, (m) => m.replace(/[.\-_]/g, ''))
      .replace(/(?<=[a-z])[0134578@$](?=[a-z])|(?<=\s)[@$](?=[a-z])/g, (c) => LEET[c]);
    t = collapse(t);
  }
  const white = new Set(list(s.white));
  const packs = nonLatin ? [lang] : [...new Set([lang, 'id', 'en'])];
  const hits = [];
  const test = (w) => (nonLatin ? t.includes(w) : rx(w).test(t));
  for (const p of packs) for (const [cat, words] of Object.entries(PACKS[p] || {})) for (const w of words) if (!white.has(w) && test(w)) hits.push({ cat, w });
  for (const w of list(s.black)) if (!white.has(w) && test(w)) hits.push({ cat: 'abuse', w });
  if (raw.includes('🖕')) hits.push({ cat: 'abuse', w: '🖕' });
  if (URLRE.test(raw)) hits.push({ cat: 'spam', w: 'tautan', weight: 45 });

  let cat = null, severity = 0;
  for (const h of hits) {
    const w = h.weight ?? CATS[h.cat].w;
    if (w > severity) { severity = w; cat = h.cat; }
  }
  if (hits.length > 1) severity = Math.min(100, severity + 8 * (hits.length - 1));
  const letters = raw.replace(/[^A-Za-z]/g, '');
  if (severity && letters.length >= 12 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.7) severity = Math.min(100, severity + 8);
  return { lang, cat, severity, hits: [...new Set(hits.map((h) => h.w))], flagged: severity >= thr(s) };
}

// Gabungkan hasil AI dengan hasil rule-based.
export function applyAI(c, r, s) {
  const none = !r.category || r.category === 'none';
  const sev = none ? (c.severity >= 80 ? c.severity : Number(r.severity) || 0) : Math.max(c.severity, Number(r.severity) || 0);
  const cat = none ? (sev >= 80 ? c.cat : null) : Number(r.severity) >= c.severity ? r.category : c.cat;
  return { ...c, lang: r.lang || c.lang, cat, severity: sev, flagged: sev >= thr(s), reason: r.reason || '', translation: r.translation || '', aiChecked: true };
}
