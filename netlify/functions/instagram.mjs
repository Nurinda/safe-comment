// Baca & moderasi komentar Instagram (Instagram Graph API, akun Business/Creator).
const G = 'https://graph.facebook.com/v21.0';
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json' } });

async function g(url, opt) {
  const r = await fetch(url, opt);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error?.message || `Instagram error ${r.status}`);
  return d;
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Gunakan metode POST.' }, 405);
  const b = await req.json().catch(() => ({}));
  const token = encodeURIComponent(b.token || process.env.INSTAGRAM_ACCESS_TOKEN || '');
  const igId = b.igId || process.env.INSTAGRAM_BUSINESS_ID;
  try {
    if (!token) throw new Error('Access token Instagram belum diisi.');
    if (b.action === 'ping') {
      if (!igId) throw new Error('Instagram Business Account ID belum diisi.');
      const d = await g(`${G}/${igId}?fields=username&access_token=${token}`);
      return json({ ok: true, username: d.username });
    }
    if (b.action === 'list') {
      if (!igId) throw new Error('Instagram Business Account ID belum diisi.');
      const n = Math.min(b.limit || 10, 25);
      const d = await g(`${G}/${igId}/media?fields=id,caption,permalink,comments.limit(50){id,text,username,timestamp}&limit=${n}&access_token=${token}`);
      const posts = (d.data || []).map((m) => ({
        id: m.id, url: m.permalink, title: (m.caption || 'Postingan Instagram').slice(0, 90),
        comments: (m.comments?.data || []).map((c) => ({ id: c.id, author: c.username, text: c.text, date: c.timestamp })),
      }));
      return json({ posts });
    }
    if (b.action === 'hide') {
      await g(`${G}/${b.id}?hide=true&access_token=${token}`, { method: 'POST' });
      return json({ ok: true });
    }
    if (b.action === 'delete') {
      await g(`${G}/${b.id}?access_token=${token}`, { method: 'DELETE' });
      return json({ ok: true });
    }
    return json({ error: 'Aksi tidak dikenal.' }, 400);
  } catch (e) {
    return json({ error: e.message }, 400);
  }
};
export const config = { path: '/api/instagram' };
