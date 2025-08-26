// Inject Quadrum header and footer into pages that include this script
// This file is primarily used by the blog pages to keep consistent navigation and footer

(function() {
  const isBlog = /\/blog\//.test(location.pathname);
  const prefix = isBlog ? '..' : '.';
  const rootPrefix = isBlog ? '..' : '.'; // for index anchors
  function renderHeader() {
    const nav = document.getElementById('nav-container');
    if (!nav) return;
    nav.innerHTML = `
    <header>
      <div class="nav-container">
        <nav class="floating-nav">
          <div class="logo">
            <a href="${rootPrefix}/index.html">
              <img src="${rootPrefix}/logo.png" alt="Quadrum logo">
              <span class="logo-text" style="color: #e73627; margin-left: 10px; font-size: 22px;">Quadrum</span>
            </a>
          </div>
          <ul class="nav-links">
            <li><a href="${rootPrefix}/index.html#sluzby">Služby</a></li>
            <li><a href="${rootPrefix}/index.html#jak-pracujeme">Jak pracujeme</a></li>
            <li><a href="${rootPrefix}/index.html#kontakt">Kontakt</a></li>
            <li><a href="${prefix}/blog/index.html">Blog</a></li>
          </ul>
          <div class="cta-button">
            <a href="${rootPrefix}/index.html#kontakt" class="btn">Domluvit schůzku</a>
          </div>
          <div class="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </div>
    </header>
    `;
  }

  function renderFooter() {
    const footer = document.getElementById('footer-container');
    if (!footer) return;
    footer.innerHTML = `
    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo">
              <img src="${rootPrefix}/logo.png" alt="Quadrum logo">
            </div>
            <h3 class="footer-tagline">Quadrum. Kvůli Vám</h3>
            <p class="footer-desc">Komplexní služby v oblasti financí a nemovitostí pro váš klidný a svobodný život.</p>
            <div class="social-links">
              <a href="https://www.facebook.com/quadrum.cz" target="_blank" class="social-link"><i class="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/quadrum_kvuli_vam/" target="_blank" class="social-link"><i class="fab fa-instagram"></i></a>
              <a href="https://www.linkedin.com/company/quadrumcz" target="_blank" class="social-link"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div class="footer-locations">
            <h3>Kde nás najdete</h3>
            <div class="locations-grid">
              <div class="location">
                <h4>Plzeň</h4>
                <address>
                  QUADRUM s.r.o.<br>
                  Dřevěná 99/3<br>
                  301 00 Plzeň
                </address>
              </div>
              <div class="location">
                <h4>Praha</h4>
                <address>
                  QUADRUM s.r.o.<br>
                  Pod turnovskou tratí 182/18<br>
                  198 00 Praha - Hloubětín
                </address>
              </div>
            </div>
          </div>
          <div class="footer-contact">
            <h3>Kontaktujte nás</h3>
            <ul class="contact-list">
              <li><i class="fas fa-envelope"></i> Email: <a href="mailto:info@quadrum.cz">info@quadrum.cz</a></li>
              <li><i class="fas fa-phone"></i> Telefon: <a href="tel:+420736483169">+420 736 483 169</a></li>
            </ul>
            <a href="${rootPrefix}/index.html#kontakt" class="btn footer-btn">Nezávazná schůzka</a>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-nav">
            <a href="${rootPrefix}/index.html#sluzby">Služby</a>
            <a href="${rootPrefix}/index.html#jak-pracujeme">Jak pracujeme</a>
            <a href="${rootPrefix}/index.html#kontakt">Kontakt</a>
            <a href="${prefix}/blog/index.html">Blog</a>
          </div>
          <p class="copyright">&copy; 2020 - 2025 Quadrum. Všechna práva vyhrazena.</p>
        </div>
        <div class="legal-disclaimer">
          <p>Jsme partnerem servisní společnosti SAB servis.</p>
          <p>„Finanční služby zde propagované a nabízené poskytují na tomto webu uvedení poradci jako fyzické osoby, a to v roli vázaných zástupců pro investičního/ samostatného zprostředkovatele SAB servis s.r.o., IČO: 24704008, se sídlem Jungmannova 748/30, 110 00 Praha 1, v následujících finančních oblastech: investice podle zákona č. 256/2004 Sb., spotřebitelské úvěry dle zákona č. 257/2016 Sb., pojištění dle zákona č. 170/2018 Sb., doplňkové penzijní spoření dle zákona č. 427/2011 Sb. Jejich oprávnění je možné ověřit v Seznamu regulovaných a registrovaných subjektů finančního trhu České národní banky na <a href="http://www.cnb.cz/cnb/jerrs" target="_blank">http://www.cnb.cz/cnb/jerrs</a>, kde také najdete aktuální informace a podrobnosti o jejich registraci a rozsahu jejich oprávnění. QUADRUM s.r.o. ve zmíněných oblastech finanční služby neposkytuje."</p>
          <p>Detailní právní informace k nabízeným službám a produktům (včetně reklamačního řádu, možnosti podání stížnosti, řešení sporů, orgánu dohledu, udržitelnosti atd.) najdete na <a href="https://sabservis.cz/informace" target="_blank">https://sabservis.cz/informace</a>.</p>
        </div>
      </div>
    </footer>`;
  }

  // Execute after DOM load just in case
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      renderHeader();
      renderFooter();
    });
  } else {
    renderHeader();
    renderFooter();
  }
})();
