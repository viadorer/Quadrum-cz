# Deployment Guide – Quadrum.cz (Vercel)

> Web je statický (HTML + CSS + JS) **+ Vercel serverless functions** pro:
> - `/api/properties` – proxy na PTF backend (nabídky nemovitostí)
> - `/api/property` – detail nabídky
> - `/api/contact` – kontaktní formulář (skrývá Realvisor API klíč)
>
> Stejný pattern jako [davidchoc.com](https://www.davidchoc.cz).

---

## Quick Deploy

```bash
# 1. Nainstaluj Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. První deploy (vytvoří projekt)
vercel

# 4. Production deploy
vercel --prod
```

---

## Krok za krokem

### 1. Příprava před prvním deployem

Zkontroluj, že máš:

- ✅ Quadrum tenant v PTF backendu (`slug=quadrum`) – migrace `010_add_quadrum_tenant.sql` spuštěná v Supabase
- ✅ **Rotovaný** Realvisor API klíč (starý `rv_live_416239f20b…` byl v gitu, musí být revokován)
- ✅ R2 přístupy pro obrázky (pokud budete migrovat)
- ✅ `node_modules` smazaný z gitu (`.gitignore` aktivní)

### 2. První deploy

```bash
cd /Users/davidchoc/Downloads/Cascade/Quadrum.cz
vercel
```

Průvodce:

```
? Set up and deploy? [Y/n] y
? Which scope? [vyber účet]
? Link to existing project? [N/y] n
? What's your project's name? quadrum-cz
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

### 3. Environment variables

V Vercel Dashboard → `quadrum-cz` → **Settings → Environment Variables**:

| Klíč | Hodnota | Použití |
|---|---|---|
| `PTF_BACKEND_URL` | `https://ptf-production.up.railway.app` | API `/api/properties`, `/api/property` |
| `PTF_TENANT_SLUG` | `quadrum` | Filtruje nabídky jen pro Quadrum tenant |
| `REALVISOR_API_KEY` | *(rotovaný klíč)* | Kontaktní formulář `/api/contact` |

Nebo přes CLI:

```bash
vercel env add PTF_BACKEND_URL
vercel env add PTF_TENANT_SLUG
vercel env add REALVISOR_API_KEY
```

Pro každou proměnnou vyber **Production, Preview, Development**.

### 4. Production deploy

```bash
vercel --prod
```

Vercel vrátí URL: `https://quadrum-cz.vercel.app`.

### 5. Custom doména

**V Vercel Dashboard:**

1. `quadrum-cz` → Settings → Domains
2. Add domain: `quadrum.cz`
3. Add domain: `www.quadrum.cz`
4. Nastav 1 jako primary (doporučeno: `www.quadrum.cz`).

**DNS u registrátora:**

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

⚠️ **Před DNS cutoverem**:
- Vypnout/upravit GitHub Pages (CNAME soubor v repu na `www.quadrum.cz` zachovat OK)
- Mít připravený rollback plán (DNS TTL 5 min ideálně)
- Spustit cutover mimo špičku

### 6. CORS na PTF backendu

V `ptf-reality` projektu (Railway) přidej origin do whitelistu:

```
https://www.quadrum.cz
https://quadrum.cz
```

Bez toho preflight `OPTIONS` selže a nabídky se nenačtou.

---

## Lokální vývoj

```bash
npm i -g vercel
vercel link             # napojí na existující projekt
vercel env pull         # stáhne ENV vars do .env.local
vercel dev              # spustí http://localhost:3000 s funkčními /api/*
```

Bez `vercel dev` (např. `python3 -m http.server`) jsou `/api/*` mrtvé – nabídky zobrazí error stav.

---

## Struktura projektu

```
Quadrum.cz/
├── api/                  # Vercel serverless functions
│   ├── properties.js     # GET /api/properties (listing)
│   ├── property.js       # GET /api/property?slug=…
│   └── contact.js        # POST /api/contact (lead form proxy)
├── common/               # Sdílená navigace a patička (loaded dynamicky)
│   ├── common.js         # Loader
│   ├── navbar-index.html # Nav pro homepage (kotvy #sluzby, #kontakt)
│   ├── navbar.html       # Nav pro podstránky (/nabidky, /blog/…)
│   └── footer.html
├── blog/                 # Blog (Tailwind CDN + Alpine.js)
├── images/               # Statické obrázky
├── index.html            # Homepage
├── nabidky.html          # Listing nemovitostí (/nabidky)
├── nabidky-detail.html   # Detail (/nabidky/:slug, rewrite ve vercel.json)
├── osobni-udaje.html     # GDPR doložka
├── styles.css            # Globální styly
├── script.js             # Hero slider, mobile menu, scroll
├── chatbot.js            # Floating chat + phone/email tlačítka
├── contact-form-handler.js # Kontaktní formulář (POST /api/contact)
├── cookies.js            # GDPR Consent Mode v2 banner
├── analytics.js          # Vlastní tracking (load až po souhlasu)
├── vercel.json           # Rewrites, headers (HSTS, CSP-like, cache)
├── package.json
├── sitemap.xml
├── robots.txt
└── DEPLOY.md             # ← tento dokument
```

---

## Vercel routing (z `vercel.json`)

| URL | Cíl |
|---|---|
| `/` | `index.html` |
| `/nabidky` | `nabidky.html` |
| `/nabidky/byt-3kk-praha-5` | `nabidky-detail.html` (rewrite) |
| `/blog/` | `blog/index.html` |
| `/osobni-udaje.html` | static |
| `/api/properties?…` | `api/properties.js` (Node 20) |
| `/api/property?slug=…` | `api/property.js` |
| `/api/contact` | `api/contact.js` |
| `/kontakt` (legacy) | redirect → `/#kontakt` |

---

## Continuous deployment (volitelné)

V Vercel Dashboard → `quadrum-cz` → Settings → Git:

1. Connect repository: `viadorer/quadrum.cz` (nebo aktuální origin).
2. Production branch: `main` → každý push automatický prod deploy.
3. Preview branches: každý feature branch → preview URL.

Doporučené nastavení:

```
Production Branch: main
Auto-deploy: enabled
Comments on PR: enabled
Ignored Build Step: žádný (statický web, žádný build krok)
```

---

## Checklist před prvním produkčním pushem

- [ ] `git rm --cached -r node_modules` (jen pokud bylo committed)
- [ ] `.env.local` v `.gitignore` (ne `.env`)
- [ ] Realvisor klíč rotován + starý revokován
- [ ] `vercel env add REALVISOR_API_KEY` v Production
- [ ] PTF backend povolil `https://www.quadrum.cz` v CORS
- [ ] `images/og-image.png` má reálných ~50–100 KB (ne 1 bajt)
- [ ] Quadrum tenant existuje v Supabase (migrace 010)
- [ ] DNS A/CNAME hotové (TTL 5 min předem snížený)
- [ ] Search Console: `quadrum.cz` verifikovaná
- [ ] Sitemap submitted (`/sitemap.xml`)
- [ ] GA4 + GTM ID jsou produkční, ne test

---

## Troubleshooting

### Nabídky nezobrazují, listing hlásí "Backend nedostupný"

1. Otevři DevTools → Network → `/api/properties` → zkontroluj status:
   - **404** → endpoint není deployed (chybí `api/properties.js`)
   - **502** → PTF backend padá nebo není dostupný (`PTF_BACKEND_URL`)
   - **500** → ENV var chybí
2. Zkontroluj Vercel logs: `vercel logs <deployment-url>`
3. Test přímo PTF: `curl -H "X-Tenant-Slug: quadrum" https://ptf-production.up.railway.app/api/properties?limit=5`

### Kontaktní formulář vrací 500

→ `REALVISOR_API_KEY` v Vercel env vars chybí nebo má překlep. Nastav přes Dashboard nebo `vercel env add`.

### CORS chyba v konzoli

→ PTF backend nepovoluje `https://www.quadrum.cz`. Přidej origin do allowlistu na Railway.

### `/api/*` nefunguje lokálně

→ Pouštíš statický server, ne `vercel dev`. `python3 -m http.server` neumí serverless. Použij `vercel dev`.

### Stránka přesměrovává sama na sebe

→ Pravděpodobně `trailingSlash` konflikt. V `vercel.json` máme `"trailingSlash": false` – odkazy v navbaru musí být bez `/` na konci (`/nabidky`, ne `/nabidky/`).
