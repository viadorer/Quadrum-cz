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
        'u9534644866_A_peaceful_cozy_interior_of_a_contemporary_family_d06c5471-f94e-4668-9d8f-819c80acbe48_2 ve střední velikosti.png',

        'u9534644866_A_happy_elderly_couple_strolling_hand-in-hand_thr_df2a7137-010c-46c7-9799-2a00cf14e038_1 ve střední velikosti.png',
        'u9534644866_Young_woman_confidently_traveling_and_exploring_a_9bf97a29-c18c-436f-bd9c-d74e3c3dd0da_2 ve střední velikosti.png',
        'u9534644866_A_relaxed_carefree_couple_enjoying_a_sunny_aftern_6e428142-8b59-4393-99c7-35a02a007c68_1 ve střední velikosti.png'
    ];
    
    // Clear any existing content
    sliderContainer.innerHTML = '';
    
    // Create image elements and add to slider
    images.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Quadrum services image ' + (index + 1);
        img.className = index === 0 ? 'active' : '';
        sliderContainer.appendChild(img);
    });
    
    // Set up automatic image rotation
    let currentImage = 0;
    
    setInterval(() => {
        const imgElements = sliderContainer.querySelectorAll('img');
        
        // Remove active class from current image
        imgElements[currentImage].classList.remove('active');
        
        // Move to next image or back to first
        currentImage = (currentImage + 1) % imgElements.length;
        
        // Add active class to new current image
        imgElements[currentImage].classList.add('active');
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
