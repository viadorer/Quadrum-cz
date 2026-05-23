// GDPR cookie consent + Google Consent Mode v2 integrace.
// Tagy v <head> jsou defaultně 'denied'; po souhlasu se zde:
//  1) updatuje Consent Mode (gtag),
//  2) emitne event 'consentGranted' s detaily, na který reagují Meta Pixel/Hotjar/analytics.
(function() {
    const STORAGE_KEY = 'cookieConsent';

    function getConsent() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
        catch(e) { return null; }
    }

    function saveConsent(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        applyConsent(state);
    }

    function applyConsent(state) {
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                'ad_storage': state.marketing ? 'granted' : 'denied',
                'ad_user_data': state.marketing ? 'granted' : 'denied',
                'ad_personalization': state.marketing ? 'granted' : 'denied',
                'analytics_storage': state.analytics ? 'granted' : 'denied'
            });
        }
        window.dispatchEvent(new CustomEvent('consentGranted', { detail: state }));

        if (!state.analytics) clearCookies(['_ga', '_gid', '_gat', '_hjSession', '_hjIncludedInSessionSample', '_hjAbsoluteSessionInProgress']);
        if (!state.marketing) clearCookies(['_fbp', '_fbc', 'fr']);
    }

    function clearCookies(prefixes) {
        document.cookie.split(';').forEach(function(c) {
            const name = c.split('=')[0].trim();
            if (prefixes.some(p => name === p || name.startsWith(p))) {
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + location.hostname + ';';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        const existing = getConsent();
        if (existing) {
            applyConsent(existing);
            return;
        }
        createCookieBanner();
    });

    function createCookieBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Souhlas s cookies');

        banner.innerHTML = `
            <div class="cookie-content">
                <p>
                    Používáme cookies pro funkčnost webu, analýzu návštěvnosti a marketing.
                    Více v <a href="/osobni-udaje.html">zásadách ochrany osobních údajů</a>.
                </p>
                <div class="cookie-buttons">
                    <button type="button" class="btn cookie-btn cookie-reject">Odmítnout vše</button>
                    <button type="button" class="btn cookie-btn cookie-settings">Nastavení</button>
                    <button type="button" class="btn cookie-btn cookie-accept">Souhlasím se vším</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        const modal = document.createElement('div');
        modal.className = 'cookie-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Nastavení cookies');
        modal.innerHTML = `
            <div class="cookie-modal-content">
                <button type="button" class="cookie-close" aria-label="Zavřít">&times;</button>
                <h2>Nastavení cookies</h2>
                <div class="cookie-settings-options">
                    <div class="cookie-option">
                        <label class="switch">
                            <input type="checkbox" id="necessaryCookies" checked disabled>
                            <span class="slider"></span>
                        </label>
                        <div class="cookie-option-text">
                            <h3>Nezbytné</h3>
                            <p>Nezbytné pro fungování webu. Nelze vypnout.</p>
                        </div>
                    </div>
                    <div class="cookie-option">
                        <label class="switch">
                            <input type="checkbox" id="analyticsCookies">
                            <span class="slider"></span>
                        </label>
                        <div class="cookie-option-text">
                            <h3>Analytické</h3>
                            <p>Pomáhají nám pochopit, jak návštěvníci web používají (Google Analytics, Hotjar).</p>
                        </div>
                    </div>
                    <div class="cookie-option">
                        <label class="switch">
                            <input type="checkbox" id="marketingCookies">
                            <span class="slider"></span>
                        </label>
                        <div class="cookie-option-text">
                            <h3>Marketingové</h3>
                            <p>Personalizace reklamy a remarketing (Meta Pixel, Google Ads).</p>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn cookie-btn save-preferences">Uložit nastavení</button>
            </div>
        `;
        document.body.appendChild(modal);

        banner.querySelector('.cookie-accept').addEventListener('click', () => {
            saveConsent({ necessary: true, analytics: true, marketing: true });
            banner.remove();
        });
        banner.querySelector('.cookie-reject').addEventListener('click', () => {
            saveConsent({ necessary: true, analytics: false, marketing: false });
            banner.remove();
        });
        banner.querySelector('.cookie-settings').addEventListener('click', () => {
            modal.style.display = 'flex';
        });
        modal.querySelector('.cookie-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        modal.querySelector('.save-preferences').addEventListener('click', () => {
            saveConsent({
                necessary: true,
                analytics: document.getElementById('analyticsCookies').checked,
                marketing: document.getElementById('marketingCookies').checked
            });
            modal.style.display = 'none';
            banner.remove();
        });
    }

    // API pro opětovné otevření nastavení (např. odkaz v patičce)
    window.openCookieSettings = function() {
        let modal = document.querySelector('.cookie-modal');
        if (!modal) {
            createCookieBanner();
            modal = document.querySelector('.cookie-modal');
        }
        const existing = getConsent();
        if (existing) {
            document.getElementById('analyticsCookies').checked = !!existing.analytics;
            document.getElementById('marketingCookies').checked = !!existing.marketing;
        }
        modal.style.display = 'flex';
    };
})();
