// Quadrum.cz – sdílená navigace a patička pro blog (kontejnery #nav-container / #footer-container).
// Od redesignu 2026 tahá stejné soubory jako podstránky (common/navbar.html, common/footer.html)
// a vkládá common/chrome.css, aby byl vzhled 1:1 s celým webem.

(function() {
  function ensureChrome() {
    if (!document.getElementById('q-chrome')) {
      const l = document.createElement('link');
      l.id = 'q-chrome'; l.rel = 'stylesheet'; l.href = '/common/chrome.css';
      document.head.appendChild(l);
    }
    if (!document.getElementById('q-fonts')) {
      const f = document.createElement('link');
      f.id = 'q-fonts'; f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800&family=Montserrat:wght@600&display=swap';
      document.head.appendChild(f);
    }
  }

  function loadInto(el, url) {
    return fetch(url).then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' @ ' + url);
      return res.text();
    }).then(html => { el.innerHTML = html; });
  }

  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('active');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    const path = window.location.pathname;
    menu.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (path.startsWith('/blog') && href.includes('/blog')) link.classList.add('active');
    });
  }

  function initFooter() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    const cookieLink = document.getElementById('cookie-settings-link');
    if (cookieLink && typeof window.openCookieSettings === 'function') {
      cookieLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.openCookieSettings();
      });
    }
  }

  function boot() {
    ensureChrome();
    const nav = document.getElementById('nav-container');
    if (nav) loadInto(nav, '/common/navbar.html').then(initMobileNav).catch(e => console.warn('Navbar:', e.message));
    const footer = document.getElementById('footer-container');
    if (footer) loadInto(footer, '/common/footer.html').then(initFooter).catch(e => console.warn('Footer:', e.message));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
