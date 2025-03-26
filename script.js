document.addEventListener('DOMContentLoaded', function() {
    // Initialize hero slider
    initHeroSlider();
    
    // Initialize mobile menu toggle
    initMobileMenu();
});

function initHeroSlider() {
    const sliderContainer = document.querySelector('.hero-slider');
    
    // Images for the slider
    const images = [
        'images/hero/u9534644866_a_young_couple_sitting_on_a_bench_or_low_wall_loo_7dd9c175-7071-4cec-b252-758c2b992aa0_1 ve velké velikosti.png',
        'images/hero/u9534644866_a_woman_in_her_30s_or_40s_on_a_trip_in_Italy_stan_bb14e26a-2791-4658-999a-7c667333b07a_1 ve velké velikosti.png',
        'images/hero/u9534644866_a_multi-generational_family_sitting_together_at_a_2f6bd34a-078a-44dd-815a-ff4bf5b45317_2 ve velké velikosti.png',
        'images/hero/u9534644866_an_elderly_man_and_woman_walking_on_a_countryside_45db2f1c-1d8b-4755-a10c-49777f095b79_1 ve velké velikosti.png',
        'images/hero/u9534644866_a_man_driving_a_vintage_koda_Octavia_cabriolet_Cz_57b1dbb3-89b5-4058-98f2-e3cbc8084e7a_0 ve velké velikosti.png',
        'images/hero/u9534644866_a_man_riding_a_classic_Czech_motorcycle_Jawa_coun_d43cb707-e506-45d3-9fc7-9660c46a8969_0 ve velké velikosti.png',
        'images/hero/u9534644866_a_young_couple_sitting_on_a_wooden_bench_in_umava_2a4765c5-ce73-4030-ae76-163fddb176d5_3 ve velké velikosti.png'
    ];
    
    // Clear any existing content
    sliderContainer.innerHTML = '';
    
    // Preload status tracking
    const preloadStatus = new Array(images.length).fill(false);
    preloadStatus[0] = true; // První obrázek načteme okamžitě
    
    // Vytvořit placeholdery pro všechny obrázky
    for (let i = 0; i < images.length; i++) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'slider-image-container';
        imgContainer.dataset.index = i;
        
        // Pouze první obrázek načteme okamžitě, ostatní až budou potřeba
        if (i === 0) {
            const img = document.createElement('img');
            img.src = images[i];
            img.alt = 'Quadrum services image ' + (i + 1);
            img.className = 'active';
            imgContainer.appendChild(img);
        } else {
            // Pro ostatní obrázky vytvoříme prázdný div
            imgContainer.classList.add('placeholder');
        }
        
        sliderContainer.appendChild(imgContainer);
    }
    
    // Funkce pro načtení dalšího obrázku
    function preloadNextImage(index) {
        if (index >= images.length || preloadStatus[index]) return;
        
        const container = sliderContainer.querySelector(`[data-index="${index}"]`);
        if (!container) return;
        
        // Vytvoření a načtení obrázku
        const img = document.createElement('img');
        img.src = images[index];
        img.alt = 'Quadrum services image ' + (index + 1);
        img.style.opacity = '0'; // Začínáme s neviditelným obrázkem
        
        // Po načtení obrázku odstraníme placeholder
        img.onload = function() {
            container.classList.remove('placeholder');
            img.style.opacity = '1';
            preloadStatus[index] = true;
            
            // Načítáme další obrázek v pořadí (předvídáme)
            setTimeout(() => {
                preloadNextImage((index + 1) % images.length);
            }, 1000);
        };
        
        container.appendChild(img);
    }
    
    // Načteme druhý obrázek s mírným zpožděním po načtení stránky
    setTimeout(() => {
        preloadNextImage(1);
    }, 1000);
    
    // Set up automatic image rotation
    let currentImage = 0;
    
    setInterval(() => {
        const containers = sliderContainer.querySelectorAll('.slider-image-container');
        
        // Skryjeme aktuální obrázek
        containers[currentImage].classList.remove('active');
        if (containers[currentImage].querySelector('img')) {
            containers[currentImage].querySelector('img').classList.remove('active');
        }
        
        // Přejdeme na další obrázek
        currentImage = (currentImage + 1) % containers.length;
        
        // Zobrazíme nový obrázek (a pokud ještě není načtený, načteme ho)
        if (!preloadStatus[currentImage]) {
            preloadNextImage(currentImage);
        }
        
        containers[currentImage].classList.add('active');
        if (containers[currentImage].querySelector('img')) {
            containers[currentImage].querySelector('img').classList.add('active');
        }
        
        // Předem načteme další obrázek v pořadí
        const nextImage = (currentImage + 1) % containers.length;
        if (!preloadStatus[nextImage]) {
            preloadNextImage(nextImage);
        }
    }, 5000); // Change image every 5 seconds
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const ctaButton = document.querySelector('.cta-button');
    
    hamburger.addEventListener('click', () => {
        // Create a mobile menu if it doesn't exist
        if (!document.querySelector('.mobile-menu')) {
            const mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-menu';
            
            // Clone the navigation links and CTA button for mobile
            const navClone = navLinks.cloneNode(true);
            const ctaClone = ctaButton.cloneNode(true);
            
            mobileMenu.appendChild(navClone);
            mobileMenu.appendChild(ctaClone);
            
            // Add close button
            const closeBtn = document.createElement('div');
            closeBtn.className = 'close-menu';
            closeBtn.innerHTML = '&times;';
            mobileMenu.appendChild(closeBtn);
            
            // Add mobile menu to the body
            document.body.appendChild(mobileMenu);
            
            // Add styling for mobile menu
            const style = document.createElement('style');
            style.textContent = `
                .mobile-menu {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100vh;
                    background-color: white;
                    z-index: 1001;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    transform: translateY(-100%);
                    transition: transform 0.3s ease;
                }
                
                .mobile-menu.active {
                    transform: translateY(0);
                }
                
                .mobile-menu .nav-links {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .mobile-menu .nav-links li a {
                    font-size: 1.5rem;
                }
                
                .close-menu {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    font-size: 2rem;
                    cursor: pointer;
                }
            `;
            
            document.head.appendChild(style);
            
            // Set up close button functionality
            closeBtn.addEventListener('click', () => {
                document.querySelector('.mobile-menu').classList.remove('active');
            });
        }
        
        // Toggle mobile menu visibility
        document.querySelector('.mobile-menu').classList.add('active');
    });
}

// Add scroll event to change navigation style on scroll
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.floating-nav');
    if (window.scrollY > 50) {
        nav.style.padding = '10px 25px';
    } else {
        nav.style.padding = '15px 30px';
    }
});
