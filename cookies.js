document.addEventListener('DOMContentLoaded', function() {
    // Vytvoření cookie banneru, pokud uživatel ještě nesouhlasil
    if (!localStorage.getItem('cookiesAccepted')) {
        createCookieBanner();
    }

    function createCookieBanner() {
        const cookieBanner = document.createElement('div');
        cookieBanner.classList.add('cookie-banner');
        cookieBanner.innerHTML = `
            <div class="cookie-content">
                <p>Tento web používá cookies pro zlepšení vašeho zážitku. Kliknutím na "Souhlasím" přijímáte používání všech cookies.</p>
                <div class="cookie-buttons">
                    <button class="btn cookie-btn cookie-accept">Souhlasím</button>
                    <button class="btn cookie-btn cookie-settings">Nastavení cookies</button>
                </div>
            </div>
        `;
        document.body.appendChild(cookieBanner);

        // Přidání cookie modal okna pro nastavení
        const cookieModal = document.createElement('div');
        cookieModal.classList.add('cookie-modal');
        cookieModal.innerHTML = `
            <div class="cookie-modal-content">
                <span class="cookie-close">&times;</span>
                <h2>Nastavení cookies</h2>
                <div class="cookie-settings-options">
                    <div class="cookie-option">
                        <label class="switch">
                            <input type="checkbox" id="necessaryCookies" checked disabled>
                            <span class="slider"></span>
                        </label>
                        <div class="cookie-option-text">
                            <h3>Nezbytné cookies</h3>
                            <p>Tyto cookies jsou nezbytné pro fungování webu a nemohou být vypnuty.</p>
                        </div>
                    </div>
                    <div class="cookie-option">
                        <label class="switch">
                            <input type="checkbox" id="analyticsCookies" checked>
                            <span class="slider"></span>
                        </label>
                        <div class="cookie-option-text">
                            <h3>Analytické cookies</h3>
                            <p>Pomáhají nám pochopit, jak návštěvníci používají náš web.</p>
                        </div>
                    </div>
                    <div class="cookie-option">
                        <label class="switch">
                            <input type="checkbox" id="marketingCookies" checked>
                            <span class="slider"></span>
                        </label>
                        <div class="cookie-option-text">
                            <h3>Marketingové cookies</h3>
                            <p>Používáme je pro zobrazení relevantní reklamy.</p>
                        </div>
                    </div>
                </div>
                <button class="btn cookie-btn save-preferences">Uložit nastavení</button>
            </div>
        `;
        document.body.appendChild(cookieModal);

        // Event listenery pro tlačítka
        document.querySelector('.cookie-accept').addEventListener('click', function() {
            acceptAllCookies();
        });

        document.querySelector('.cookie-settings').addEventListener('click', function() {
            showCookieSettings();
        });

        document.querySelector('.cookie-close').addEventListener('click', function() {
            hideCookieSettings();
        });

        document.querySelector('.save-preferences').addEventListener('click', function() {
            savePreferences();
        });
    }

    function acceptAllCookies() {
        localStorage.setItem('cookiesAccepted', 'true');
        localStorage.setItem('analyticsCookies', 'true');
        localStorage.setItem('marketingCookies', 'true');
        hideCookieBanner();
    }

    function showCookieSettings() {
        document.querySelector('.cookie-modal').style.display = 'flex';
    }

    function hideCookieSettings() {
        document.querySelector('.cookie-modal').style.display = 'none';
    }

    function hideCookieBanner() {
        const cookieBanner = document.querySelector('.cookie-banner');
        if (cookieBanner) {
            cookieBanner.style.display = 'none';
        }
    }

    function savePreferences() {
        localStorage.setItem('cookiesAccepted', 'true');
        localStorage.setItem('analyticsCookies', document.getElementById('analyticsCookies').checked);
        localStorage.setItem('marketingCookies', document.getElementById('marketingCookies').checked);
        hideCookieBanner();
        hideCookieSettings();
    }
});
