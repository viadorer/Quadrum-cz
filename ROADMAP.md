# Quadrum.cz — Roadmapa & Sprint plán

> Cíl: posunout web z prezentační statické stránky na **plnohodnotný realitní portál**
> s napojením na PTF backend (multi-tenant `slug=quadrum`), výborným SEO, GDPR
> compliance a měřitelnou konverzí.
>
> Frekvence sprintů: **2 týdny**. Demo na konci každého sprintu, retrospektiva, plán dalšího.

---

## 🎯 North-star metriky (cílový stav po Sprintu 6)

| Metrika | Současný stav | Cíl |
|---|---|---|
| Lighthouse Performance (mobile) | ~50 | **≥ 90** |
| LCP | ~4 s | **< 2.5 s** |
| INP | neměřeno | **< 200 ms** |
| CLS | neměřeno | **< 0.1** |
| Lighthouse Accessibility | ~75 | **≥ 95** |
| Konverzní poměr formuláře | neměří se | **≥ 3 %** |
| Počet aktivních nabídek na webu | 0 | **= count(quadrum tenant v PTF)** |
| Měsíční organická návštěvnost | ? | **+50 % vs. baseline** |
| Indexovaných URL v Google | ~4 | **≥ 50** (blog + nabídky) |

---

## Sprint 0 — Stabilizace & bezpečnost (1 týden, "must-fix before anything else")

> Toto je předpoklad. **Bez dokončení Sprintu 0 nesmí jít na produkci nic dalšího.**

### Stories

| ID | User story | Story points | Status |
|---|---|---|---|
| S0-1 | API klíč Realvisor (`rv_live_…`) odstranit z public JS, rotovat | 3 | ✅ částečně (formulář funkční, klíč ale stále v JS) |
| S0-2 | XSS v chatbotu (innerHTML uživatelského vstupu) | 1 | ✅ hotovo |
| S0-3 | GDPR Consent Mode v2 + tlačítko "Odmítnout vše" | 5 | ✅ hotovo |
| S0-4 | Vytvořit `osobni-udaje.html` (GDPR doložka) | 2 | ✅ hotovo |
| S0-5 | Honeypot + timestamp guard na kontaktní formulář | 2 | ✅ hotovo |
| S0-6 | `.gitignore` + odebrat `node_modules`/`.DS_Store` z repa | 1 | ⏳ `.gitignore` ok, `git rm --cached` čeká na potvrzení |
| S0-7 | Migrace hostingu **GitHub Pages → Vercel** (kvůli serverless API) | 5 | ⏳ vercel.json připraven |
| S0-8 | Vercel serverless proxy pro Realvisor (odstranit veřejný API klíč) | 5 | ⏳ |
| S0-9 | CSP header přes Vercel `vercel.json` (script-src, frame-ancestors) | 2 | ⏳ |

### DoD Sprintu 0
- Žádný citlivý klíč v repu / page source
- Lighthouse "Best Practices" ≥ 90
- Banner se chová v souladu s nařízením ÚOOÚ
- Bez chyb v devtools konzoli

---

## Sprint 1 — Nabídky nemovitostí MVP (2 týdny) 🏠

> Top business priorita: **napojit Quadrum web na PTF backend** a zobrazit reálné nabídky.

### Stories

| ID | User story | SP |
|---|---|---|
| S1-1 | `/api/properties` Vercel function (proxy → PTF backend, tenant=quadrum) | 3 |
| S1-2 | `/api/property` (detail by slug) | 2 |
| S1-3 | `nabidky.html` — listing s filtry (typ, dispozice, cena, lokalita) | 5 |
| S1-4 | `nabidky-detail.html` — detail nemovitosti (galerie, mapa, kontakt) | 5 |
| S1-5 | Vercel rewrites `/nabidky` → `nabidky.html`, `/nabidky/:slug` → `nabidky-detail.html` | 2 |
| S1-6 | Přidat **"Nabídky"** do hlavní navigace + footer | 1 |
| S1-7 | Schema.org `RealEstateListing` JSON-LD per detail | 3 |
| S1-8 | Lokalizovaný formátovač cen (`Intl.NumberFormat('cs-CZ')`) | 1 |
| S1-9 | Fallback UI: prázdný stav, error, loading skeleton | 2 |
| S1-10 | Sticky lead form na detailu (předvyplněný název nemovitosti) | 3 |

### DoD Sprintu 1
- Nabídky se reálně načítají z PTF backendu (i s obrázky z R2)
- URL `/nabidky?offer_type=prodej&city=Praha` funguje a je sdílitelná
- Sitemap obsahuje nabídky (dynamicky, ne hardcoded)
- Lighthouse SEO ≥ 95 na detail stránce

---

## Sprint 2 — Performance & vizuální polish (2 týdny) ⚡

| ID | User story | SP |
|---|---|---|
| S2-1 | Konverze hero JPG → AVIF + WebP, `<picture>` se srcset | 3 |
| S2-2 | Konverze `Obr*.png` (18 ks) → WebP + lazy + correct sizes | 3 |
| S2-3 | Reálný `og-image.png` 1200×630 (nyní 1 bajt) | 1 |
| S2-4 | Self-host Montserrat (`.woff2`) místo Google Fonts | 2 |
| S2-5 | Sjednotit Font Awesome (jen 1 verze, subset SVG) | 2 |
| S2-6 | Inline critical CSS, defer zbytku | 5 |
| S2-7 | Image processing pipeline (script `npm run build:images`) | 3 |
| S2-8 | CLS audit — definovat `width`/`height` na všech `<img>` | 2 |
| S2-9 | Tailwind CDN v blogu → buildnutý CSS s purge | 5 |
| S2-10 | Footer cleanup — duplicitní CSS, magic numbers → CSS custom props | 2 |

### DoD Sprintu 2
- Lighthouse Performance mobile ≥ 90
- LCP < 2.5 s na mobile 3G simulaci
- Žádný layout shift při načítání hero
- Web nesouvisí na žádném 3rd-party CSS frameworku v produkci

---

## Sprint 3 — SEO & content (2 týdny) 🔍

| ID | User story | SP |
|---|---|---|
| S3-1 | Per-property `<title>` + meta description (z dat PTF) | 2 |
| S3-2 | Per-blog-článek strukturovaný meta (autor, datum, hreflang) | 3 |
| S3-3 | Dynamický `sitemap.xml` (Vercel function, refresh každých 6 h) | 5 |
| S3-4 | `robots.txt` + linkování sitemap | 1 |
| S3-5 | **Local SEO landing pages**: `/hypoteka-praha`, `/hypoteka-plzen`, `/realitni-makler-plzen` | 8 |
| S3-6 | Schema.org `FAQPage` na hlavní stránku (Q&A o hypotékách) | 2 |
| S3-7 | Schema.org `BreadcrumbList` na všech podstránkách | 1 |
| S3-8 | Search Console — submission, fix indexing chyb | 1 |
| S3-9 | Interlinking strategie blog → služby → nabídky | 3 |
| S3-10 | hreflang (pokud bude SK verze) — minimálně `cs-CZ` self-reference | 1 |

### DoD Sprintu 3
- Lighthouse SEO ≥ 95 na všech veřejných URL
- Google Search Console: ≥ 50 indexovaných URL bez chyb
- Měřitelný nárůst impressions vs. baseline (snapshot na začátku)

---

## Sprint 4 — Lead capture & marketing automation (2 týdny) 📈

| ID | User story | SP |
|---|---|---|
| S4-1 | "Pošli mi podobné nabídky" — saved search → PTF webhook | 5 |
| S4-2 | Newsletter signup (Ecomail / Mailchimp) s double opt-in | 3 |
| S4-3 | Sticky CTA bar (mobile-only) — "Zavolat zdarma" | 2 |
| S4-4 | Mailto fallback + WhatsApp Click-to-Chat | 2 |
| S4-5 | Předvyplněný formulář z URL parametrů (utm, slug nemovitosti) | 2 |
| S4-6 | A/B test 2 variant hero CTA (Optimizely / GrowthBook / Vercel Edge) | 5 |
| S4-7 | Konverzní eventy: `view_property`, `lead_submit`, `phone_click` | 3 |
| S4-8 | Facebook Pixel + GA4 enhanced conversions | 3 |
| S4-9 | LinkedIn Insight Tag (B2B sledování firemních leadů) | 1 |

### DoD Sprintu 4
- 100 % leadů z webu se objevuje v PTF CRM
- Nastavený funnel v GA4 (impressions → detail → lead)
- První A/B test má statistickou významnost (2× std error)

---

## Sprint 5 — Hypoteční nástroje & UX (2 týdny) 🧮

| ID | User story | SP |
|---|---|---|
| S5-1 | Hypoteční kalkulačka (úroková sazba, splátka, LTV) | 5 |
| S5-2 | "Cenový odhad nemovitosti" widget (proxy → Nemovizor API) | 5 |
| S5-3 | Mapa nabídek (Mapbox / Maptiler) — clustering | 8 |
| S5-4 | Favorite nabídek (localStorage) | 3 |
| S5-5 | Compare nabídek (side-by-side až 3) | 3 |
| S5-6 | Tisk-friendly PDF nabídky (Vercel function s Puppeteer) | 5 |
| S5-7 | Foto-galerie s touch swipe + plné zobrazení | 3 |

### DoD Sprintu 5
- Hypoteční kalkulačka generuje min. 20 leadů / měsíc
- Mapa funguje na všech device sizes
- Tisk PDF reflektuje vizuální brand

---

## Sprint 6 — Růst a expanze (2 týdny) 🚀

| ID | User story | SP |
|---|---|---|
| S6-1 | Profil-stránky makléřů (Michaela, David, …) — schema.org `RealEstateAgent` | 3 |
| S6-2 | Recenze zákazníků (Google My Business import) + schema.org `Review` | 5 |
| S6-3 | "Případové studie" — formát blog + kvantifikované výsledky (uspořeno X Kč) | 3 |
| S6-4 | Video content embedding (YouTube, lazy iframe) | 2 |
| S6-5 | Chatbot nahrazen LLM-poháněným (Claude API přes Vercel function) | 8 |
| S6-6 | Webinar landing page (registrace + email reminders) | 5 |
| S6-7 | Affiliate / referral systém ("Doporučte známého") | 5 |
| S6-8 | Multi-jazyk (EN expanze pro expats) | 8 |

---

## 🏗️ Architektonická rozhodnutí

### Hosting
- **GitHub Pages → Vercel** (Sprint 0). Důvody: serverless functions, edge cache, CSP headers, image optimization, A/B testing.
- DNS: `quadrum.cz` přesměrovat z GitHub Pages na Vercel (CNAME nebo Vercel nameservers).
- Branch: `main` → production, `staging` → preview deployments.

### Data flow pro nabídky
```
Browser → /api/properties (Vercel function)
       → PTF backend (Railway, multi-tenant header X-Tenant-Slug: quadrum)
       → Supabase Postgres
       → R2 CDN pro obrázky
```

### Tech stack — co zachovat, co vyměnit
| Vrstva | Aktuální | Doporučené |
|---|---|---|
| HTML | vanilla statické | **zachovat** (rychlost, SEO) |
| CSS | vanilla styles.css | **zachovat** + design tokens |
| JS | vanilla, jQuery-less | **zachovat** + module pattern |
| Blog | Tailwind CDN + Alpine | Tailwind buildnutý, Alpine pinned |
| API | žádné | Vercel serverless (Node 20) |
| Tracking | inline | Consent Mode v2 + gtag |
| Forms | Realvisor API direct | Vercel proxy + honeypot |
| Hosting | GitHub Pages | Vercel |

---

## 🧪 QA & release proces

- **Branch strategy**: `main` (prod), `staging` (preview), feature branches `feat/sprint-X-storyId`
- **Code review**: každý PR review aspoň 1 reviewer + automatický Lighthouse CI
- **Automatizované testy**:
  - HTML validator (W3C) v CI
  - Lighthouse CI thresholds (Perf ≥ 90, SEO ≥ 95, A11y ≥ 95)
  - Broken link checker
  - Visual regression (Percy / Chromatic) na nabídky
- **Pre-deploy checklist**: viz `DEPLOY_CHECKLIST.md` (do připravit ve Sprintu 0)

---

## 📅 Timeline (rough)

```
Sprint 0   ░░░░░░░ (1 týden)  — bezpečnost, hosting migrace
Sprint 1   ░░░░░░░░░░░░░░ (2 týdny) — Nabídky MVP        ← KICKOFF
Sprint 2   ░░░░░░░░░░░░░░ (2 týdny) — Performance & polish
Sprint 3   ░░░░░░░░░░░░░░ (2 týdny) — SEO & content
Sprint 4   ░░░░░░░░░░░░░░ (2 týdny) — Lead capture
Sprint 5   ░░░░░░░░░░░░░░ (2 týdny) — Hypoteční nástroje
Sprint 6   ░░░░░░░░░░░░░░ (2 týdny) — Růst & expanze
                                                        
Celkem: 13 týdnů (~3 měsíce) pro plný rollout.
```

---

## 🚨 Risk register

| Riziko | Pravděpodobnost | Dopad | Mitigation |
|---|---|---|---|
| PTF backend down → nabídky 502 | střední | vysoký | Edge cache 60 s + stale-while-revalidate 5 min + graceful error UI |
| Realvisor klíč zneužit před rotací | vysoká | střední | Sprint 0 priorita; pre-rotation monitoring volání |
| Vercel migrace rozbije DNS / SSL | nízká | vysoký | Staging deploy, DNS cutover mimo špičku, 24h plán rollbacku |
| GDPR pokuta za pre-consent tracking | střední | velmi vysoký | Sprint 0 (Consent Mode v2) — již dořešeno |
| Změna PTF API kontraktu | nízká | střední | API verzování (`/api/v1/`), kontrolní testy v CI |
| SEO penalizace za duplicitní content (sousední tenanty) | nízká | střední | `rel=canonical`, různé titlestyle / texty na quadrum vs. ptf |

---

## 👥 Role v týmu (doporučení)

- **Product owner** — David Choc (priority, content, business)
- **Tech lead / fullstack** — 1 osoba (Vercel, PTF napojení, Vercel functions)
- **Frontend / UI** — 1 osoba (HTML/CSS/JS, design system)
- **SEO / content** — externí (každý sprint)
- **QA / testing** — sdíleno, manuální + automatický CI

---

## 📋 Open questions pro PO

1. **Doména**: zůstaneme na `www.quadrum.cz`, nebo přesun na `quadrum.cz` bez www?
2. **Vercel účet**: existuje firemní účet, nebo zakládáme nový?
3. **Realvisor**: chceme i nadále nebo přejít na PTF leads endpoint (sjednocení s nabídkami)?
4. **Brand**: zůstává Quadrum červená (#e73627) jako primární, nebo posun směrem k davidchoc gold pro nabídkovou sekci?
5. **Makléři**: kolik jich má profil-stránku ve Sprintu 6? (Michaela, David, kdo další?)
6. **Newsletter**: jaký provider (Ecomail / Mailchimp / Brevo)?
7. **Foto-content**: kdo dodá hero obrázky ve vyšší kvalitě / AVIF?
