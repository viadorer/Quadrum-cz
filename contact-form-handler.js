// Kontaktní formulář handler - nahrazuje ECM Widget
(function() {
  const CONTAINER_ID = 'quadrum-contact-form';
  
  function createForm() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    container.innerHTML = `
      <form id="contact-form" class="contact-form-custom">
        <div class="form-group">
          <label for="contact-name">Jméno a příjmení *</label>
          <input type="text" id="contact-name" name="name" required placeholder="Jan Novák">
        </div>
        
        <div class="form-group">
          <label for="contact-email">E-mail *</label>
          <input type="email" id="contact-email" name="email" required placeholder="jan@example.com">
        </div>
        
        <div class="form-group">
          <label for="contact-phone">Telefon</label>
          <input type="tel" id="contact-phone" name="phone" placeholder="+420 123 456 789">
        </div>
        
        <div class="form-group">
          <label for="contact-message">Zpráva *</label>
          <textarea id="contact-message" name="message" required placeholder="Mám zájem o vaše služby..."></textarea>
        </div>
        
        <div class="form-group">
          <label class="consent">
            <input type="checkbox" name="gdpr" required>
            Souhlasím se zpracováním osobních údajů podle <a href="/osobni-udaje.html" target="_blank">zásad ochrany osobních údajů</a>
          </label>
        </div>
        
        <button type="submit" class="cta-button">Odeslat zprávu</button>
        
        <div class="form-message" style="display:none; margin-top: 1rem;"></div>
      </form>
    `;

    injectStyles();
    attachFormHandler();
  }

  function injectStyles() {
    if (document.getElementById('contact-form-style')) return;
    
    
    const style = document.createElement('style');
    style.id = 'contact-form-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function attachFormHandler() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const API_URL = 'https://api-production-88cf.up.railway.app/api/v1/public/api-leads/submit';
    const API_KEY = 'rv_live_416239f20b707fb68f043bd8ff6023ccad121a67e540ac8d';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const messageDiv = form.querySelector('.form-message');
      const originalText = submitBtn.textContent;
      
      // Disable form
      submitBtn.disabled = true;
      submitBtn.textContent = 'Odesílám...';
      messageDiv.style.display = 'none';
      
      // Get form data
      const formData = new FormData(form);
      const name = formData.get('name').trim();
      const email = formData.get('email').trim();
      const phone = formData.get('phone').trim();
      const message = formData.get('message').trim();

      // Split name into firstName + lastName
      const parts = name.split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      const payload = {
        firstName,
        lastName,
        email,
        phone,
        message,
        data: {
          source: 'quadrum.cz',
          campaign: 'davidchoc-website',
          pipeline: 'kontaktni-formu-75540'
        }
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          // Success
          messageDiv.className = 'form-message success';
          messageDiv.textContent = 'Děkujeme! Vaše zpráva byla úspěšně odeslána. Brzy se vám ozveme.';
          messageDiv.style.display = 'block';
          
          // Reset form
          form.reset();
          
          // Google Analytics event
          if (window.gtag) {
            window.gtag('event', 'contact_submit', {
              event_category: 'contact',
              event_label: 'index_contact_form'
            });
          }
          
          // Facebook Pixel event
          if (window.fbq) {
            window.fbq('track', 'Contact');
          }
        } else {
          const errorData = await response.json();
          console.error('API error:', errorData);
          throw new Error('API error');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Omlouváme se, došlo k chybě při odesílání. Zkuste to prosím znovu nebo nás kontaktujte telefonicky.';
        messageDiv.style.display = 'block';
      } finally {
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createForm);
  } else {
    createForm();
  }
})();
