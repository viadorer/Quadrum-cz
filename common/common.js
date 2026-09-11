// Quadrum.cz – sdílený loader navigace a patičky.
// Stejný pattern jako davidchoc.com – placeholdery #navbar-placeholder a #footer-placeholder.
// Vloží styl chrome (nav+footer) a fonty, pokud ještě nejsou.
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

document.addEventListener('DOMContentLoaded', function() {
    ensureChrome();
    const currentPath = window.location.pathname;
    let commonPath = './common/';

    // Pokud jsme v podadresáři blog/ (vícero úrovní), použijeme relativní cestu nahoru.
    if (currentPath.includes('/blog/')) {
        commonPath = '../common/';
    }

    // Hlavní stránka = root index. Použij navbar-index (kotvy bez "/").
    const isRootIndex = (
        currentPath === '/' ||
        currentPath === '' ||
        /^\/index(\.html)?$/.test(currentPath)
    );
    const navbarFile = isRootIndex ? 'navbar-index.html' : 'navbar.html';

    // ---------- Navbar ----------
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        loadInto(navbarPlaceholder, commonPath + navbarFile)
            .catch(() => loadInto(navbarPlaceholder, altPath(commonPath) + navbarFile))
            .then(() => initMobileNav())
            .catch(err => console.warn('Navbar load error:', err.message));
    }

    // ---------- Footer ----------
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        loadInto(footerPlaceholder, commonPath + 'footer.html')
            .catch(() => loadInto(footerPlaceholder, altPath(commonPath) + 'footer.html'))
            .then(() => initFooter())
            .catch(err => console.warn('Footer load error:', err.message));
    }
});

function altPath(p) { return p === './common/' ? '../common/' : './common/'; }

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
    menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Zvýraznění aktivní stránky
    const path = window.location.pathname;
    menu.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (
            (path === '/' && /^\/?(#|index)/.test(href) && href.startsWith('#')) ||
            (path.startsWith('/nabidky') && href.includes('/nabidky')) ||
            (path.startsWith('/blog') && href.includes('/blog'))
        ) {
            link.classList.add('active');
        }
    });
}

function initFooter() {
    // Dynamický rok
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Back-to-top tlačítko
    const back = document.getElementById('backToTop');
    if (back) {
        const update = () => back.classList.toggle('visible', window.pageYOffset > 300);
        update();
        window.addEventListener('scroll', update, { passive: true });
        back.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Otevření nastavení cookies z patičky (napojeno na cookies.js → window.openCookieSettings)
    const cookieLink = document.getElementById('cookie-settings-link');
    if (cookieLink && typeof window.openCookieSettings === 'function') {
        cookieLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.openCookieSettings();
        });
    }
}
