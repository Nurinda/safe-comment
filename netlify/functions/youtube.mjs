// Baca & moderasi komentar YouTube (YouTube Data API v3).
const Y = 'https://www.googleapis.com/youtube/v3';
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json' } });
const videoIdOf = (s = '') => (s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/) || [])[1];

async function g(url, opt) {
  const r = await fetch(url, opt);
  if (r.status === 204) return {};
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error?.message || `YouTube error ${r.status}`);
  return d;
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Gunakan metode POST.' }, 405);
  const b = await req.json().catch(() => ({}));
  const key = b.key || process.env.YOUTUBE_API_KEY;
  const token = b.token || process.env.YOUTUBE_ACCESS_TOKEN;
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  try {
    if (b.action === 'ping') {
      if (!key) throw new Error('API key YouTube belum diisi.');
      await g(`${Y}/videos?part=id&chart=mostPopular&maxResults=1&key=${key}`);
      return json({ ok: true });
    }
    if (b.action === 'list') {
      if (!key) throw new Error('API key YouTube belum diisi.');
      const id = videoIdOf(b.video);
      if (!id) throw new Error('Link atau ID video YouTube tidak valid.');
      const v = await g(`${Y}/videos?part=snippet&id=${id}&key=${key}`);
      const title = v.items?.[0]?.snippet?.title || id;
      const comments = [];
      let page = '';
      for (let n = 0; n < Math.min(b.pages || 3, 5); n++) {
        const d = await g(`${Y}/commentThreads?part=snippet&videoId=${id}&maxResults=100&order=time&textFormat=plainText&key=${key}${page}`);
        for (const t of d.items || []) {
          const s = t.snippet.topLevelComment.snippet;
          comments.push({ id: t.snippet.topLevelComment.id, author: s.authorDisplayName, text: s.textDisplay, date: s.publishedAt });
        }
        if (!d.nextPageToken) break;
        page = `&pageToken=${d.nextPageToken}`;
      }
      return json({ title, url: `https://www.youtube.com/watch?v=${id}`, comments });
    }
    if (b.action === 'hide' || b.action === 'delete') {
      if (!token) throw new Error('OAuth access token YouTube belum diisi (dibutuhkan untuk moderasi).');
      if (b.action === 'hide') await g(`${Y}/comments/setModerationStatus?id=${b.id}&moderationStatus=heldForReview`, { method: 'POST', ...auth });
      else await g(`${Y}/comments?id=${b.id}`, { method: 'DELETE', ...auth });
      return json({ ok: true });
    }
    return json({ error: 'Aksi tidak dikenal.' }, 400);
  } catch (e) {
    return json({ error: e.message }, 400);
  }
};
export const config = { path: '/api/youtube' };
