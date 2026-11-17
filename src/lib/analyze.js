import { detect, applyAI, hasPack } from './detector.js';
import { call } from './api.js';

export async function analyzeAll(list, s, onProg) {
  let out = list.map((c) => ({ ...c, ...detect(c.text, s), reason: '', translation: '', aiChecked: false }));
  let note = '';
  if (s.analysis === 'offline') return { list: out, note };
  if (s.keyMode === 'browser' && !s.openaiKey) return { list: out, note: 'Analisis AI dilewati karena API key OpenAI belum diisi di Pengaturan.' };
  const idx = out.map((_, i) => i).filter((i) => {
    const c = out[i];
    if (s.analysis === 'akurat') return true;
    return !c.flagged && c.text.length > 2 && (!hasPack(c.lang) || c.lang === 'und');
  });
  for (let b = 0; b < idx.length; b += 25) {
    const part = idx.slice(b, b + 25);
    try {
      const d = await call('analyze', { comments: part.map((i, n) => ({ i: n, text: out[i].text.slice(0, 500) })) }, s);
      for (const r of d.results || []) if (part[r.i] != null) out[part[r.i]] = applyAI(out[part[r.i]], r, s);
    } catch (e) { note = 'Analisis AI berhenti: ' + e.message; break; }
    onProg?.(Math.min(b + 25, idx.length), idx.length);
  }
  return { list: out, note };
}
