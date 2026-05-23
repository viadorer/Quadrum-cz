// Vercel serverless function — detail nemovitosti (tenant: quadrum).
// GET /api/property?slug=<slug>

const BACKEND = process.env.PTF_BACKEND_URL || 'https://ptf-reality-production.up.railway.app';
const TENANT  = process.env.PTF_TENANT_SLUG || 'quadrum';

const ALLOWED_ORIGINS = [
  'https://www.quadrum.cz',
  'https://quadrum.cz',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:5500',
];

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const slug = (req.query?.slug || '').toString().trim();
  if (!slug || !/^[a-z0-9-]{1,200}$/i.test(slug)) {
    return res.status(400).json({ error: 'Neplatný slug' });
  }

  const url = `${BACKEND}/api/properties/${encodeURIComponent(slug)}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        'X-Tenant-Slug': TENANT,
        'Accept': 'application/json',
      },
    });

    if (upstream.status === 404) {
      return res.status(404).json({ error: 'Nemovitost nenalezena' });
    }
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      console.error('PTF backend error:', upstream.status, text.slice(0, 200));
      return res.status(502).json({ error: 'Backend nedostupný', status: upstream.status });
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Property proxy error:', err);
    return res.status(500).json({ error: 'Chyba při načítání detailu' });
  }
}
