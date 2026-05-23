document.addEventListener('DOMContentLoaded', function() {
    initHeroSlider();
    initMobileMenu();
    initNavScroll();
    initDynamicYear();
});

function initHeroSlider() {
    const sliderContainer = document.querySelector('.hero-slider');
    if (!sliderContainer) return;

    const images = [
        'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/quadrum/hero/hero1.jpg',
        'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/quadrum/hero/hero2.jpg',
        'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/quadrum/hero/hero3.jpg',
        'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/quadrum/hero/hero4.jpg',
        'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/quadrum/hero/hero5.jpg',
        'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/quadrum/hero/hero6.jpg',
        'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/quadrum/hero/hero7.jpg'
    ];

    sliderContainer.innerHTML = '';

    const preloadStatus = new Array(images.length).fill(false);
    preloadStatus[0] = true;

    for (let i = 0; i < images.length; i++) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'slider-image-container';
        imgContainer.dataset.index = i;

        if (i === 0) {
            const img = document.createElement('img');
            img.src = images[i];
            img.alt = '';
            img.setAttribute('aria-hidden', 'true');
            img.fetchPriority = 'high';
            img.className = 'active';
            imgContainer.appendChild(img);
            imgContainer.classList.add('active');
        } else {
            imgContainer.classList.add('placeholder');
        }

        sliderContainer.appendChild(imgContainer);
    }

    function preloadNextImage(index) {
        if (index >= images.length || preloadStatus[index]) return;

        const container = sliderContainer.querySelector(`[data-index="${index}"]`);
        if (!container) return;

        const img = document.createElement('img');
        img.src = images[index];
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.loading = 'lazy';
        img.style.opacity = '0';

        img.onload = function() {
            container.classList.remove('placeholder');
            img.style.opacity = '1';
            preloadStatus[index] = true;

            setTimeout(() => {
                preloadNextImage((index + 1) % images.length);
            }, 1000);
        };

        container.appendChild(img);
    }

    setTimeout(() => {
        preloadNextImage(1);
    }, 1000);

    let currentImage = 0;
    let intervalId = null;

    function rotate() {
        const containers = sliderContainer.querySelectorAll('.slider-image-container');

        containers[currentImage].classList.remove('active');
        const currImg = containers[currentImage].querySelector('img');
        if (currImg) currImg.classList.remove('active');

        currentImage = (currentImage + 1) % containers.length;

        if (!preloadStatus[currentImage]) {
            preloadNextImage(currentImage);
        }

        containers[currentImage].classList.add('active');
        const nextImg = containers[currentImage].querySelector('img');
        if (nextImg) nextImg.classList.add('active');

        const nextIndex = (currentImage + 1) % containers.length;
        if (!preloadStatus[nextIndex]) {
            preloadNextImage(nextIndex);
        }
    }

    function start() {
        if (intervalId) return;
        intervalId = setInterval(rotate, 5000);
    }

    function stop() {
        if (!intervalId) return;
        clearInterval(intervalId);
        intervalId = null;
    }

    start();

    // Šetříme baterii: pauza, když je tab v pozadí.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') stop();
        else start();
    });
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const ctaButton = document.querySelector('.cta-button');
    if (!hamburger || !navLinks) return;

    let mobileMenu = null;

    function buildMenu() {
        if (mobileMenu) return mobileMenu;

        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.setAttribute('role', 'dialog');
        mobileMenu.setAttribute('aria-modal', 'true');
        mobileMenu.setAttribute('aria-label', 'Hlavní menu');

        const navClone = navLinks.cloneNode(true);
        mobileMenu.appendChild(navClone);

        if (ctaButton) {
            const ctaClone = ctaButton.cloneNode(true);
            mobileMenu.appendChild(ctaClone);
        }

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'close-menu';
        closeBtn.setAttribute('aria-label', 'Zavřít menu');
        closeBtn.innerHTML = '&times;';
        mobileMenu.appendChild(closeBtn);

        document.body.appendChild(mobileMenu);

        // Zavřít po kliknutí na jakýkoli odkaz v menu (UX bug fix).
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        closeBtn.addEventListener('click', closeMenu);

        if (!document.getElementById('mobile-menu-style')) {
            const style = document.createElement('style');
            style.id = 'mobile-menu-style';
            style.textContent = `
                .mobile-menu { position: fixed; inset: 0; background: #fff; z-index: 1001; display: flex; flex-direction: column; justify-content: center; align-items: center; transform: translateY(-100%); transition: transform 0.3s ease; }
                .mobile-menu.active { transform: translateY(0); }
                .mobile-menu .nav-links { display: flex; flex-direction: column; align-items: center; gap: 20px; margin-bottom: 30px; }
                .mobile-menu .nav-links li a { font-size: 1.5rem; }
                .close-menu { position: absolute; top: 20px; right: 20px; font-size: 2rem; background: none; border: none; cursor: pointer; padding: 0.4rem 0.8rem; }
            `;
            document.head.appendChild(style);
        }

        return mobileMenu;
    }

    function openMenu() {
        const m = buildMenu();
        m.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        if (mobileMenu) mobileMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.setAttribute('role', 'button');
    hamburger.setAttribute('tabindex', '0');
    hamburger.setAttribute('aria-label', 'Otevřít menu');
    hamburger.setAttribute('aria-expanded', 'false');

    hamburger.addEventListener('click', openMenu);
    hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openMenu();
        }
    });
}

function initNavScroll() {
    const nav = document.querySelector('.floating-nav');
    if (!nav) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            nav.style.padding = window.scrollY > 50 ? '10px 25px' : '15px 30px';
            ticking = false;
        });
    }, { passive: true });
}

function initDynamicYear() {
    const el = document.getElementById('current-year');
    if (el) el.textContent = new Date().getFullYear();
}
