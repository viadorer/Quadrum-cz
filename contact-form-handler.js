// Kontaktní formulář handler – pattern davidchoc.com (vlastní formulář místo ECM widgetu).
// Klíčový rozdíl: POST jde přes /api/contact (Vercel serverless proxy) – API klíč nikdy v public JS.
(function() {
  const CONTAINER_ID = 'quadrum-contact-form';
  const MIN_FORM_TIME_MS = 2500; // bot fill je obvykle < 1 s

  function createForm() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    container.innerHTML = `
      <form id="contact-form" class="contact-form-custom" novalidate>
        <div class="form-group">
          <label for="contact-name">Jméno a příjmení *</label>
          <input type="text" id="contact-name" name="name" required autocomplete="name" placeholder="Jan Novák">
        </div>
        <div class="form-group">
          <label for="contact-email">E-mail *</label>
          <input type="email" id="contact-email" name="email" required autocomplete="email" placeholder="jan@example.com">
        </div>
        <div class="form-group">
          <label for="contact-phone">Telefon</label>
          <input type="tel" id="contact-phone" name="phone" autocomplete="tel" placeholder="+420 123 456 789">
        </div>
        <div class="form-group">
          <label for="contact-message">Zpráva *</label>
          <textarea id="contact-message" name="message" required placeholder="Mám zájem o vaše služby..."></textarea>
        </div>
        <div class="form-group">
          <label class="consent">
            <input type="checkbox" name="gdpr" required>
            Souhlasím se <a href="/osobni-udaje.html" target="_blank" rel="noopener noreferrer">zpracováním osobních údajů</a>.
          </label>
        </div>
        <div class="hp-field" aria-hidden="true">
          <label for="contact-website">Vaše webová stránka (ponechte prázdné)</label>
          <input type="text" id="contact-website" name="website" tabindex="-1" autocomplete="off">
        </div>
        <button type="submit" class="cta-button">Odeslat zprávu</button>
        <div class="form-message" role="status" aria-live="polite" hidden></div>
      </form>
    `;

    injectStyles();
    attachFormHandler();
  }

  function injectStyles() {
    if (document.getElementById('contact-form-style')) return;

    // Tmavý theme jako davidchoc.com (gradient + invertované inputy), Quadrum červená místo zlaté.
    const css = `
      #${CONTAINER_ID} {
        background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
        padding: 32px;
        border: 1px solid #333;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      }
      #${CONTAINER_ID} .form-group { margin-bottom: 20px; }
      #${CONTAINER_ID} label {
        display: block;
        margin-bottom: 8px;
        color: #fff;
        font-weight: 600;
        font-size: 15px;
      }
      #${CONTAINER_ID} input,
      #${CONTAINER_ID} textarea {
        width: 100%;
        box-sizing: border-box;
        border: 2px solid #444;
        border-radius: 12px;
        padding: 14px 16px;
        background: #222;
        color: #fff;
        font: inherit;
        font-size: 15px;
        line-height: 1.5;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
      }
      #${CONTAINER_ID} input::placeholder,
      #${CONTAINER_ID} textarea::placeholder { color: #888; }
      #${CONTAINER_ID} input:focus,
      #${CONTAINER_ID} textarea:focus {
        outline: none;
        border-color: #e73627;
        background: #2a2a2a;
        box-shadow: 0 0 0 3px rgba(231,54,39,0.15);
      }
      #${CONTAINER_ID} textarea { min-height: 120px; resize: vertical; }
      #${CONTAINER_ID} .consent {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 14px;
        color: #ccc;
        font-weight: 400;
      }
      #${CONTAINER_ID} .consent input {
        width: auto;
        margin-top: 4px;
        accent-color: #e73627;
      }
      #${CONTAINER_ID} .consent a { color: #e73627; }
      #${CONTAINER_ID} .cta-button {
        width: 100%;
        background: #e73627;
        color: #fff;
        border: none;
        padding: 16px 24px;
        border-radius: 999px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 6px 20px rgba(231,54,39,0.35);
      }
      #${CONTAINER_ID} .cta-button:hover {
        background: #c12a1d;
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(231,54,39,0.45);
      }
      #${CONTAINER_ID} .cta-button:active { transform: translateY(0); }
      #${CONTAINER_ID} .cta-button:disabled { background: #555; cursor: not-allowed; transform: none; box-shadow: none; }
      #${CONTAINER_ID} .form-message {
        margin-top: 16px;
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
      }
      #${CONTAINER_ID} .form-message.success {
        background: rgba(34,197,94,0.15);
        color: #4ADE80;
        border: 1px solid rgba(34,197,94,0.3);
      }
      #${CONTAINER_ID} .form-message.error {
        background: rgba(239,68,68,0.15);
        color: #FCA5A5;
        border: 1px solid rgba(239,68,68,0.3);
      }
      #${CONTAINER_ID} .hp-field {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
    `;

    const style = document.createElement('style');
    style.id = 'contact-form-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function attachFormHandler() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const formLoadedAt = Date.now();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const messageDiv = form.querySelector('.form-message');
      const originalText = submitBtn.textContent;

      const formData = new FormData(form);
      const honeypot = (formData.get('website') || '').toString().trim();
      const elapsed = Date.now() - formLoadedAt;

      // Anti-spam: honeypot vyplněný NEBO odesláno příliš rychle ⇒ bot. Falešný úspěch.
      if (honeypot || elapsed < MIN_FORM_TIME_MS) {
        messageDiv.className = 'form-message success';
        messageDiv.textContent = 'Děkujeme! Vaše zpráva byla odeslána.';
        messageDiv.hidden = false;
        form.reset();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Odesílám…';
      messageDiv.hidden = true;

      const payload = {
        name: (formData.get('name') || '').toString().trim(),
        email: (formData.get('email') || '').toString().trim(),
        phone: (formData.get('phone') || '').toString().trim(),
        message: (formData.get('message') || '').toString().trim(),
        formType: 'contact',
        website: honeypot
      };

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success !== false) {
          messageDiv.className = 'form-message success';
          messageDiv.textContent = 'Děkujeme! Vaše zpráva byla úspěšně odeslána. Brzy se vám ozveme.';
          messageDiv.hidden = false;
          form.reset();

          if (window.gtag) {
            window.gtag('event', 'contact_submit', {
              event_category: 'contact',
              event_label: 'index_contact_form'
            });
          }
          if (window.fbq) window.fbq('track', 'Contact');
        } else {
          throw new Error(data.error || 'API responded ' + response.status);
        }
      } catch (error) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Omlouváme se, došlo k chybě při odesílání. Zkuste to znovu nebo nás kontaktujte telefonicky na +420 736 483 169.';
        messageDiv.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createForm);
  } else {
    createForm();
  }
})();
