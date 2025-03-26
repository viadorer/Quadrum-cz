/**
 * Quadrum.cz - Analytics and tracking module
 * Implementuje pokročilé sledování chování uživatelů, konverzí a výkonnosti webu
 */

// Konfigurace a inicializace
document.addEventListener('DOMContentLoaded', function() {
    // Inicializace datové vrstvy pro GTM, pokud ještě není inicializována
    window.dataLayer = window.dataLayer || [];
    
    // Pomocná funkce pro odesílání událostí do Google Analytics
    function trackEvent(category, action, label, value) {
        if (typeof gtag === 'function') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label,
                'value': value
            });
        }
        
        // Zároveň odešleme událost do dataLayer pro GTM
        window.dataLayer.push({
            'event': 'custom_event',
            'event_category': category,
            'event_action': action,
            'event_label': label,
            'event_value': value
        });
    }
    
    // Inicializace sledování odkazů (konverzní a externí odkazy)
    function initLinkTracking() {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            // Přidáme posluchač události pro všechny odkazy
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const isExternal = href.indexOf('http') === 0 && href.indexOf('quadrum.cz') === -1;
                
                // Sledování externích odkazů
                if (isExternal) {
                    trackEvent('Outbound Link', 'Click', href);
                    
                    // Pro externí odkazy můžeme chtít zpozdit přesměrování pro ujištění, že se tracking odešle
                    if (!this.target || this.target !== '_blank') {
                        e.preventDefault();
                        setTimeout(() => {
                            window.location.href = href;
                        }, 100);
                    }
                }
                
                // Sledování konverzních tlačítek
                if (this.classList.contains('cta-button') || this.closest('.cta-content')) {
                    trackEvent('Conversion', 'CTA Click', this.innerText || 'CTA Button');
                }
                
                // Sledování interakcí v kontaktní sekci
                if (this.closest('.contact-section')) {
                    trackEvent('Contact', 'Contact Link Click', this.innerText || href);
                }
            });
        });
    }
    
    // Sledování scrollování na stránce pro měření engagementu
    function initScrollTracking() {
        let scrollMarks = [25, 50, 75, 90];
        let scrollMarksReached = {};
        
        // Inicializace sledovaných značek
        scrollMarks.forEach(mark => {
            scrollMarksReached[mark] = false;
        });
        
        // Funkce pro kontrolu scrollování
        function checkScrollDepth() {
            const scrollPercentage = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
            
            scrollMarks.forEach(mark => {
                if (scrollPercentage >= mark && !scrollMarksReached[mark]) {
                    scrollMarksReached[mark] = true;
                    trackEvent('Scroll Depth', 'Scroll', `${mark}%`, mark);
                }
            });
        }
        
        // Nastavení posluchače události pro scrollování s throttlingem
        let throttleTimer;
        window.addEventListener('scroll', function() {
            if (!throttleTimer) {
                throttleTimer = setTimeout(function() {
                    checkScrollDepth();
                    throttleTimer = null;
                }, 500);
            }
        });
    }
    
    // Měření času stráveného na stránce
    function initTimeTracking() {
        const startTime = new Date();
        let timeMarks = [30, 60, 120, 300]; // v sekundách
        let timeMarksReached = {};
        
        // Inicializace sledovaných časových značek
        timeMarks.forEach(mark => {
            timeMarksReached[mark] = false;
        });
        
        // Kontrola času v pravidelných intervalech
        setInterval(function() {
            const currentTime = new Date();
            const timeSpent = Math.floor((currentTime - startTime) / 1000); // v sekundách
            
            timeMarks.forEach(mark => {
                if (timeSpent >= mark && !timeMarksReached[mark]) {
                    timeMarksReached[mark] = true;
                    trackEvent('Time on Page', 'Milestone', `${mark} seconds`, mark);
                }
            });
        }, 10000); // kontrola každých 10 sekund
    }
    
    // Sledování formulářů a jejich odesílání
    function initFormTracking() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const formId = this.id || 'unknown-form';
                trackEvent('Form', 'Submit', formId);
            });
            
            // Sledování interakcí s formulářovými poli
            const formInputs = form.querySelectorAll('input, select, textarea');
            formInputs.forEach(input => {
                input.addEventListener('focus', function() {
                    const fieldName = this.name || this.id || 'unknown-field';
                    trackEvent('Form', 'Field Focus', fieldName);
                });
            });
        });
    }
    
    // Sledování doby načítání stránky a výkonnostních metrik
    function trackPagePerformance() {
        window.addEventListener('load', function() {
            setTimeout(function() {
                if (window.performance && window.performance.timing) {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const domReadyTime = perfData.domInteractive - perfData.navigationStart;
                    
                    trackEvent('Performance', 'Page Load Time', 'Total', pageLoadTime);
                    trackEvent('Performance', 'DOM Ready Time', 'Interactive', domReadyTime);
                    
                    // Core Web Vitals metriky - pokud jsou k dispozici
                    if (window.performance && typeof window.performance.getEntriesByType === 'function') {
                        const paintMetrics = window.performance.getEntriesByType('paint');
                        if (paintMetrics && paintMetrics.length) {
                            for (let i = 0; i < paintMetrics.length; i++) {
                                const metric = paintMetrics[i];
                                if (metric.name === 'first-contentful-paint') {
                                    trackEvent('Performance', 'FCP', 'First Contentful Paint', Math.round(metric.startTime));
                                }
                            }
                        }
                    }
                }
            }, 0);
        });
    }
    
    // Inicializace všech sledovacích mechanismů
    initLinkTracking();
    initScrollTracking();
    initTimeTracking();
    initFormTracking();
    trackPagePerformance();
    
    // Vlastní sledování událostí pro specifické elementy stránky
    function initCustomTracking() {
        // Sledování kliknutí na obrázky v hero sekci
        const heroImages = document.querySelectorAll('.hero-slider img');
        heroImages.forEach((img, index) => {
            img.addEventListener('click', function() {
                trackEvent('Engagement', 'Hero Image Click', `Image ${index + 1}`);
            });
        });
        
        // Sledování interakcí s mobilním menu
        const hamburger = document.querySelector('.hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', function() {
                trackEvent('Navigation', 'Mobile Menu', 'Open');
            });
        }
        
        const closeBtn = document.querySelector('.close-menu');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                trackEvent('Navigation', 'Mobile Menu', 'Close');
            });
        }
    }
    
    // Inicializace vlastního sledování
    initCustomTracking();
});

// Funkce pro měření konverzí
function trackConversion(type, value) {
    // Odesílání informací o konverzi do Google Analytics
    if (typeof gtag === 'function') {
        gtag('event', 'conversion', {
            'send_to': 'AW-XXXXXXXXXX/XXXXXXXXXX',
            'value': value,
            'currency': 'CZK',
            'transaction_id': ''
        });
    }
    
    // Odesílání informací o konverzi do Facebook Pixel
    if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
            content_name: type,
            value: value,
            currency: 'CZK'
        });
    }
    
    // Sledování konverzí v dataLayer pro GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'conversion',
        'conversion_type': type,
        'conversion_value': value
    });
}

// Export funkcí pro použití v dalších skriptech
window.QuadrumAnalytics = {
    trackEvent: function(category, action, label, value) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'custom_event',
            'event_category': category,
            'event_action': action,
            'event_label': label,
            'event_value': value
        });
    },
    trackConversion: trackConversion
};
