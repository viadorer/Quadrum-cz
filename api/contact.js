// Vercel serverless function — kontaktní formulář proxy (skrývá Realvisor API klíč)
// ENV (Vercel):
//   REALVISOR_API_KEY = <rotated key, ne ten co byl public v contact-form-handler.js>

const ALLOWED_ORIGINS = [
  'https://www.quadrum.cz',
  'https://quadrum.cz',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:5500',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_RE = /^[+0-9 ()\-]{6,20}$/;

const buckets = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

function rateLimit(ip) {
  const now = Date.now();
  const arr = (buckets.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  arr.push(now);
  buckets.set(ip, arr);
  return arr.length <= RATE_MAX;
}

function sanitize(str, max = 2000) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, max);
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.quadrum.cz';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').toString().split(',')[0].trim();
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Příliš mnoho požadavků. Zkuste to za chvíli.' });
  }

  const body = req.body || {};

  // Honeypot — bot vyplnil pole "website"
  if (typeof body.website === 'string' && body.website.length > 0) {
    return res.status(200).json({ success: true });
  }

  const name = sanitize(body.name, 100);
  const email = sanitize(body.email, 200);
  const phone = sanitize(body.phone, 30);
  const message = sanitize(body.message, 5000);
  const formType = sanitize(body.formType, 50) || 'contact';
  const propertySlug = sanitize(body.propertySlug, 200);
  const propertyTitle = sanitize(body.propertyTitle, 300);

  if (!name || (!email && !phone) || !message) {
    return res.status(400).json({ error: 'Chybí povinná pole (jméno, e-mail nebo telefon, zpráva)' });
  }
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Neplatný formát e-mailu' });
  }
  if (phone && !PHONE_RE.test(phone)) {
    return res.status(400).json({ error: 'Neplatný formát telefonu' });
  }

  try {
    const realvisorApiKey = process.env.REALVISOR_API_KEY;
    if (!realvisorApiKey) {
      console.error('Realvisor API key není nastaven');
      return res.status(500).json({ error: 'Konfigurace serveru není kompletní' });
    }

    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const pipeline = formType === 'property' ? 'kontaktni-formu-75540'
                   : formType === 'newsletter' ? 'newsletter-prih-96266'
                   : 'kontaktni-formu-75540';

    const response = await fetch('https://api-production-88cf.up.railway.app/api/v1/public/api-leads/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': realvisorApiKey,
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email: email || '',
        phone: phone || '',
        message,
        data: {
          source: 'quadrum.cz',
          formType,
          pipeline,
          propertySlug: propertySlug || undefined,
          propertyTitle: propertyTitle || undefined,
          ip,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Realvisor API error:', response.status, errorText);
      return res.status(502).json({ error: 'Nepodařilo se odeslat zprávu' });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      message: 'Zpráva byla úspěšně odeslána',
      leadId: data.leadId,
      contactId: data.contactId,
    });
  } catch (error) {
    console.error('Error sending to Realvisor:', error);
    return res.status(500).json({ error: 'Došlo k chybě při odesílání zprávy' });
  }
}
