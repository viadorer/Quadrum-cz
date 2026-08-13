// Vercel serverless function — proxy na PTF backend pro výpis blogu.
// Volá: GET /api/blog
// Backend: GET /api/blog?web=quadrum s headerem X-Tenant-Slug
//
// Stejný vzor jako /api/properties: tenant hlavička na serveru, cache
// na hraně, a mapování PŘESNĚ na tvar původního posts.json — výpis
// i detail tak zůstaly vizuálně 1:1 beze změn v render kódu.

const BACKEND = process.env.PTF_BACKEND_URL || 'https://ptf-production.up.railway.app';
// NATVRDO, ne z PTF_TENANT_SLUG: ten je na tomhle webu nastavený na
// 'quadrum' kvůli nabídkám, ale blog žije pod tenantem ptf-reality
// (spravuje se v PTF administraci). Env proměnná by ho tiše rozbila.
const TENANT  = 'ptf-reality';
const WEB     = 'quadrum';

// Filtr na výpisu pracuje s klíči kategorií z posts.json. Sdílené
// články (křížené z davidchoc.cz) mají jiné kategorie → 'other',
// ukážou se jen pod „Vše" — stejně jako dřív nebyly ve výpisu vůbec.
const KATEGORIE_KLICE = {
  'základní témata': 'zakladni',
  'praktické návody a tipy': 'navody',
  'refinancování': 'refinancovani',
  'životní situace': 'situace',
  'trh a sazby': 'trh',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const upstream = await fetch(`${BACKEND}/api/blog?web=${WEB}&limit=50`, {
      headers: { 'X-Tenant-Slug': TENANT, Accept: 'application/json' },
    });
    if (!upstream.ok) return res.status(502).json({ error: 'Backend nedostupný' });
    const data = await upstream.json();

    const posts = (data.data || []).map(p => {
      const datum = (p.publishedAt || p.createdAt || '').slice(0, 10);
      const nazev = p.category?.name || '';
      return {
        id: p.slug,
        title: p.title,
        excerpt: p.excerpt || '',
        category: KATEGORIE_KLICE[nazev.toLowerCase()] || 'other',
        categoryName: nazev,
        image: p.featuredImageUrl || '/images/blog/clanek1.png',
        imageAlt: p.featuredImageAlt || p.title,
        date: datum,
        dateFormatted: datum
          ? new Date(datum).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
          : '',
        readTime: p.readingTimeMinutes || null,
      };
    });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({ posts });
  } catch (err) {
    console.error('Blog proxy error:', err?.message);
    return res.status(502).json({ error: 'Backend nedostupný' });
  }
}
