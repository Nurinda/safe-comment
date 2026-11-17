import { useEffect, useState } from 'react';

export const DEFAULTS = {
  keyMode: 'browser', analysis: 'hemat', sensitivity: 'sedang', theme: 'light',
  openaiKey: '', openaiModel: 'gpt-4o-mini', openaiBase: '',
  ytKey: '', ytToken: '', igToken: '', igId: '', black: '', white: '',
};

export function usePersist(key, init) {
  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      if (!s) return init;
      const p = JSON.parse(s);
      return Array.isArray(init) ? p : { ...init, ...p };
    } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* penyimpanan penuh */ } }, [key, v]);
  return [v, setV];
}

export const uidOf = (c) => [c.platform, c.post, c.pid || `${c.author}|${c.text.slice(0, 80)}`].join('::');
