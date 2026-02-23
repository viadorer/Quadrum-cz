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
        display:block; 
        margin-bottom: 8px; 
        color:#fff; 
        font-weight:600; 
        font-size: 15px; 
      }
      #${CONTAINER_ID} input, #${CONTAINER_ID} textarea, #${CONTAINER_ID} select { 
        width:100%; 
        box-sizing:border-box; 
        border:2px solid #444; 
        border-radius:12px; 
        padding:14px 16px; 
        background:#222; 
        color:#fff; 
        font: inherit; 
        font-size: 15px;
        line-height:1.5; 
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
      }
      #${CONTAINER_ID} input::placeholder, #${CONTAINER_ID} textarea::placeholder {
        color: #888;
      }
      #${CONTAINER_ID} textarea { min-height: 140px; resize: vertical; }
      #${CONTAINER_ID} input:focus, #${CONTAINER_ID} textarea:focus { 
        outline:none; 
        border-color:#FFBF00; 
        background:#2a2a2a;
        box-shadow: 0 0 0 4px rgba(255,191,0,0.15), inset 0 2px 4px rgba(0,0,0,0.2); 
      }
      #${CONTAINER_ID} .consent { 
        display: flex; 
        align-items: flex-start; 
        gap: 10px; 
        font-size: 14px; 
        color: #ccc; 
        font-weight: normal;
        line-height: 1.5;
      }
      #${CONTAINER_ID} .consent input[type="checkbox"] { 
        width: auto; 
        margin-top: 4px;
        flex-shrink: 0;
        cursor: pointer;
      }
      #${CONTAINER_ID} .consent a { color: #FFBF00; text-decoration: underline; }
      #${CONTAINER_ID} .consent a:hover { color: #ffd700; }
      #${CONTAINER_ID} button[type="submit"] {
        width: 100%;
        margin-top: 12px;
        background: #FFBF00;
        color: #000;
        border: none;
        padding: 16px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(255,191,0,0.3);
      }
      #${CONTAINER_ID} button[type="submit"]:hover {
        background: #ffd700;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255,191,0,0.4);
      }
      #${CONTAINER_ID} button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      #${CONTAINER_ID} .form-message {
        padding: 16px;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 500;
      }
      #${CONTAINER_ID} .form-message.success {
        background: rgba(76, 175, 80, 0.15);
        color: #4caf50;
        border: 2px solid #4caf50;
      }
      #${CONTAINER_ID} .form-message.error {
        background: rgba(244, 67, 54, 0.15);
        color: #f44336;
        border: 2px solid #f44336;
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
