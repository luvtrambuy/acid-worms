// ===== SMOOTH SCROLL ENHANCEMENTS =====
document.addEventListener('DOMContentLoaded', function() {
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    const heroLogo = document.querySelector('.hero-logo');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        if (scrolled < heroHeight) {
            const opacity = 1 - (scrolled / heroHeight);
            const scale = 1 + (scrolled / heroHeight) * 0.2;
            heroLogo.style.opacity = opacity;
            heroLogo.style.transform = `scale(${scale})`;
        }
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });
    
    // Observe about section
    const aboutImage = document.querySelector('.about-image');
    const aboutText = document.querySelector('.about-text');
    
    if (aboutImage && aboutText) {
        [aboutImage, aboutText].forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(40px)';
            element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(element);
        });
    }
    
    // Interactive section - worm click animation
    const wormShape = document.querySelector('.worm-shape');
    const interactiveCta = document.querySelector('.interactive-cta');
    
    if (wormShape) {
        wormShape.addEventListener('click', () => {
            wormShape.style.animation = 'none';
            setTimeout(() => {
                wormShape.style.animation = 'worm-pulse 3s ease-in-out infinite';
            }, 10);
            
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.width = '150px';
            ripple.style.height = '150px';
            ripple.style.borderRadius = '50%';
            ripple.style.border = '3px solid var(--acid-yellow)';
            ripple.style.opacity = '1';
            ripple.style.animation = 'ripple 1s ease-out';
            wormShape.parentElement.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 1000);
        });
    }
    
    // Add ripple animation to CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            100% {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Interactive CTA button - playful interaction
    if (interactiveCta) {
        interactiveCta.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Change text playfully
            const messages = [
                'Soon, soon...',
                'Be patient, worm lover',
                'Coming very soon',
                'I want my worm',
                'Keep the vibe going'
            ];
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            const originalText = interactiveCta.textContent;
            
            interactiveCta.textContent = randomMessage;
            interactiveCta.style.background = 'linear-gradient(25deg, #FBD301 0%, #E7196E 100%)';
            interactiveCta.style.color = '#FFF9EC';
            
            setTimeout(() => {
                interactiveCta.textContent = originalText;
                interactiveCta.style.background = '#FFFFFF';
                interactiveCta.style.color = '#0B0B0C';
            }, 2000);
        });
    }
    
    // Smooth scroll for scroll hint
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('click', () => {
            const aboutSection = document.querySelector('.about');
            aboutSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Gallery item click - simple lightbox effect
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            overlay.style.zIndex = '9999';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.cursor = 'pointer';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            
            // Create enlarged image
            const enlargedImg = document.createElement('img');
            enlargedImg.src = img.src;
            enlargedImg.style.maxWidth = '90%';
            enlargedImg.style.maxHeight = '90%';
            enlargedImg.style.objectFit = 'contain';
            enlargedImg.style.transform = 'scale(0.8)';
            enlargedImg.style.transition = 'transform 0.3s ease';
            
            overlay.appendChild(enlargedImg);
            document.body.appendChild(overlay);
            
            // Trigger animation
            setTimeout(() => {
                overlay.style.opacity = '1';
                enlargedImg.style.transform = 'scale(1)';
            }, 10);
            
            // Close on click
            overlay.addEventListener('click', () => {
                overlay.style.opacity = '0';
                enlargedImg.style.transform = 'scale(0.8)';
                setTimeout(() => overlay.remove(), 300);
            });
        });
    });
    
    // Add custom cursor effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .gallery-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            document.body.style.cursor = 'pointer';
        });
        
        element.addEventListener('mouseleave', () => {
            document.body.style.cursor = 'default';
        });
    });
    
    console.log('🐛 Acid Worms landing page loaded');
    console.log('🎨 Keep the acid flow going');
});
