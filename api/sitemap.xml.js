// Vercel serverless function – dynamický sitemap.xml.
// Stáhne aktivní/rezervované nabídky z PTF backendu (tenant=quadrum) a vrátí XML.
// Statické URL (homepage, blog, nabídky, landing pages) jsou hardcoded.
// Routing: vercel.json rewrite /sitemap.xml → /api/sitemap.xml

const BACKEND = process.env.PTF_BACKEND_URL || 'https://ptf-reality-production.up.railway.app';
const TENANT  = process.env.PTF_TENANT_SLUG || 'quadrum';
const SITE    = 'https://www.quadrum.cz';

const STATIC_URLS = [
  { loc: '/',                            priority: '1.0', changefreq: 'weekly' },
  { loc: '/nabidky',                     priority: '0.95', changefreq: 'daily' },
  { loc: '/blog/',                       priority: '0.9',  changefreq: 'weekly' },
  { loc: '/hypoteka-praha',              priority: '0.85', changefreq: 'monthly' },
  { loc: '/hypoteka-plzen',              priority: '0.85', changefreq: 'monthly' },
  { loc: '/realitni-makler-plzen',       priority: '0.85', changefreq: 'monthly' },
  { loc: '/osobni-udaje.html',           priority: '0.3',  changefreq: 'yearly' },
];

const BLOG_POSTS = [
  '10-otazek-ktere-byste-meli-polozit-svemu-hypotecnimu-poradci',
  '10-strategii-uspesny-pronajem-nemovitosti',
  'dum-nebo-byt-co-je-lepsi-investice',
  'home-staging-jak-pripravit-nemovitost-na-prodej',
  'hypotecni-slovnicek-pro-laiky',
  'hypoteka-versus-najem-kdy-se-vyplati-koupit-a-kdy-zustat-v-pronajmu',
  'jak-prodat-dum-nejlepsi-cena-kompletni-strategie',
  'kdy-dava-smysl-hypoteka',
  'klic-k-uspechu-prodeje-presny-odhad-trzni-ceny-nemovitosti',
  'nejlepsi-pomer-cena-vykon-jak-drobne-upravy-zvysuji-hodnotu-nemovitosti',
  'nez-zacnete-rekonstruovat-proc-nikdy-nedelat-upravy-pred-prodejem-bez-konzultace',
  'proc-je-premrstena-cena-vasi-nemovitosti-cesta-do-pekel',
  'proc-stav-nemovitosti-hraje-klicovou-roli-v-jeji-cene',
  'prodej-za-premiovou-cenu-mytus-nebo-realita',
  'spravne-oceneni-nemovitosti',
];

function xmlEscape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlBlock({ loc, lastmod, priority, changefreq }) {
  const parts = [
    `    <loc>${xmlEscape(SITE + loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
  ].filter(Boolean).join('\n');
  return `  <url>\n${parts}\n  </url>`;
}

async function fetchProperties() {
  try {
    const res = await fetch(`${BACKEND}/api/properties?status=active,reserved&limit=500`, {
      headers: {
        'X-Tenant-Slug': TENANT,
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Sitemap PTF fetch error:', err);
    return [];
  }
}

export default async function handler(req, res) {
  const today = new Date().toISOString().slice(0, 10);

  const properties = await fetchProperties();

  const urls = [];

  for (const u of STATIC_URLS) {
    urls.push(urlBlock({ ...u, lastmod: today }));
  }

  for (const slug of BLOG_POSTS) {
    urls.push(urlBlock({
      loc: `/blog/posts/${slug}.html`,
      lastmod: '2025-07-12',
      changefreq: 'monthly',
      priority: '0.7',
    }));
  }

  for (const p of properties) {
    if (!p.slug) continue;
    const lastmod = (p.updated_at || p.created_at || '').slice(0, 10) || today;
    urls.push(urlBlock({
      loc: `/nabidky/${encodeURIComponent(p.slug)}`,
      lastmod,
      changefreq: 'weekly',
      priority: '0.8',
    }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
