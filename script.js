// ===== Acid Worms — landing interactions =====
document.addEventListener('DOMContentLoaded', function() {

    /* ---------- Hero parallax (scale only) on the wrapper ---------- */
    const hero = document.querySelector('.hero');
    const heroWrap = document.querySelector('.hero-logo-wrap');
    let parallaxTicking = false;

    if (hero && heroWrap) {
        window.addEventListener('scroll', () => {
            if (parallaxTicking) return;
            parallaxTicking = true;
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const heroHeight = hero.offsetHeight;
                if (scrolled < heroHeight) {
                    const progress = scrolled / heroHeight;
                    const scale = 1 + progress * 0.12;
                    heroWrap.style.transform = `scale(${scale})`;
                }
                parallaxTicking = false;
            });
        }, { passive: true });
    }

    /* ---------- Tag stars inside the inline logo SVG ---------- */
    tagLogoStars();

    /* ---------- Fade-in observers ---------- */
    const observerOptions = { threshold: 0.05, rootMargin: '0px 0px -80px 0px' };

    const observerTranslate = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const observerFade = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.style.opacity = '1';
        });
    }, observerOptions);

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transition = `opacity 0.6s ease ${index * 0.08}s`;
        observerFade.observe(item);
    });

    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
        aboutText.style.opacity = '0';
        aboutText.style.transform = 'translateY(40px)';
        aboutText.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observerTranslate.observe(aboutText);
    }

    /* ---------- Gallery lightbox ---------- */
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;

            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', opacity: 0, transition: 'opacity 0.3s ease'
            });

            const enlargedImg = document.createElement('img');
            enlargedImg.src = img.src;
            Object.assign(enlargedImg.style, {
                maxWidth: '90%', maxHeight: '90%', objectFit: 'contain',
                transform: 'scale(0.85)', transition: 'transform 0.3s ease', borderRadius: '4px'
            });

            overlay.appendChild(enlargedImg);
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                enlargedImg.style.transform = 'scale(1)';
            });

            overlay.addEventListener('click', () => {
                overlay.style.opacity = '0';
                enlargedImg.style.transform = 'scale(0.85)';
                setTimeout(() => overlay.remove(), 300);
            });
        });
    });

    /* ---------- Global cursor follower (acid blob) ---------- */
    initCursorBlob();

    /* ---------- Build your own button — confetti burst ---------- */
    const buildBtn = document.getElementById('build-your-own');
    if (buildBtn) {
        buildBtn.addEventListener('click', (e) => {
            // Analytics placeholder
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'build_your_own_click',
                section: 'acid_worm',
                timestamp: Date.now()
            });
            console.log('[track] build_your_own_click');

            // Burst confetti from the button position
            const rect = buildBtn.getBoundingClientRect();
            const originX = rect.left + rect.width / 2;
            const originY = rect.top + rect.height / 2;
            burstConfetti(originX, originY);
        });
    }

    /* ---------- Acid worm canvas ---------- */
    const wormCanvas = document.getElementById('acid-worm');
    if (wormCanvas) initAcidWorm(wormCanvas);

    console.log('🐛 acid worm online');
});

/* ============================================================
   LOGO STARS — tag small <path> elements inside the inline SVG
   ============================================================ */
function tagLogoStars() {
    const svg = document.querySelector('.hero-logo-svg');
    if (!svg) return;

    requestAnimationFrame(() => {
        const paths = svg.querySelectorAll('path, circle');
        const STAR_MAX = 220;

        paths.forEach(el => {
            let bbox;
            try { bbox = el.getBBox(); } catch (e) { return; }
            if (bbox.width <= STAR_MAX && bbox.height <= STAR_MAX) {
                el.classList.add('star');
                el.style.animationDelay  = (Math.random() * 2).toFixed(2) + 's';
                el.style.animationDuration = (1.8 + Math.random() * 1.6).toFixed(2) + 's';
            }
        });
    });
}

/* ============================================================
   GLOBAL CURSOR BLOB
   ============================================================ */
function initCursorBlob() {
    if (window.matchMedia('(hover: none)').matches) return;

    const blob = document.createElement('div');
    blob.className = 'cursor-blob';
    document.body.appendChild(blob);

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;
    let visible = false;

    document.addEventListener('mousemove', e => {
        tx = e.clientX; ty = e.clientY;
        if (!visible) {
            visible = true;
            blob.classList.remove('hide');
        }
    });

    document.addEventListener('mouseleave', () => {
        blob.classList.add('hide');
        visible = false;
    });

    const wormCanvas = document.getElementById('acid-worm');
    if (wormCanvas) {
        wormCanvas.addEventListener('mouseenter', () => blob.classList.add('hide'));
        wormCanvas.addEventListener('mouseleave', () => blob.classList.remove('hide'));
    }

    function tick() {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        blob.style.left = cx + 'px';
        blob.style.top = cy + 'px';
        requestAnimationFrame(tick);
    }
    tick();
}

/* ============================================================
   CONFETTI — pixel-square burst with gravity, originates from (x,y).
   ============================================================ */
function burstConfetti(originX, originY) {
    const COLORS  = ['#E8E007', '#FBD301', '#FDA905', '#E7196E', '#AA1150', '#1FD67E', '#FFF9EC'];
    const COUNT   = 70;
    const GRAVITY = 1400; // px / s²

    const layer = document.createElement('div');
    layer.className = 'confetti-layer';
    document.body.appendChild(layer);

    for (let i = 0; i < COUNT; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        const size = 8 + Math.random() * 14;
        piece.style.width  = size + 'px';
        piece.style.height = size + 'px';
        piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
        piece.style.left = originX + 'px';
        piece.style.top  = originY + 'px';
        if (Math.random() < 0.3) piece.style.borderRadius = '50%';

        // Random launch — mostly upward (-π/2 ± π/3) with some sideways spread
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 1.6);
        const speed = 380 + Math.random() * 520;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const duration = 1100 + Math.random() * 700; // ms
        const t = duration / 1000;
        // Final position with simple ballistic physics:
        // x = vx * t, y = vy * t + 0.5 * g * t²
        const endX = vx * t;
        const endY = vy * t + 0.5 * GRAVITY * t * t;
        const rotation = (Math.random() - 0.5) * 1440; // up to 4 full spins

        layer.appendChild(piece);

        piece.animate(
            [
                { transform: `translate(-50%, -50%) translate(0px, 0px) rotate(0deg)`,           opacity: 1 },
                { transform: `translate(-50%, -50%) translate(${endX * 0.5}px, ${vy * t * 0.5}px) rotate(${rotation * 0.5}deg)`, opacity: 1, offset: 0.5 },
                { transform: `translate(-50%, -50%) translate(${endX}px, ${endY}px) rotate(${rotation}deg)`, opacity: 0 }
            ],
            { duration, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)', fill: 'forwards' }
        );
    }

    // Cleanup after the longest possible piece finishes
    setTimeout(() => layer.remove(), 2200);
}

/* ============================================================
   ACID WORM — pixel snake in canvas.
   ============================================================ */
function initAcidWorm(canvas) {
    const ctx = canvas.getContext('2d');
    const PIXEL = 14;
    const SEGMENT_COUNT = 22;
    const SEGMENT_GAP = 16;
    const COLORS = ['#E8E007', '#FBD301', '#FDA905', '#E7196E', '#AA1150', '#1FD67E'];

    let w = 0, h = 0, dpr = 1;
    const segments = [];
    let target = { x: 0, y: 0 };
    let mouseInside = false;
    let idleTimer = 0;
    let tick = 0;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));
        w = rect.width;
        h = rect.height;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;
    }

    function pickIdleTarget() {
        const margin = 60;
        target = {
            x: margin + Math.random() * Math.max(1, w - margin * 2),
            y: margin + Math.random() * Math.max(1, h - margin * 2)
        };
        idleTimer = 60 + Math.random() * 140;
    }

    function init() {
        resize();
        const cx = w / 2;
        const cy = h / 2;
        segments.length = 0;
        for (let i = 0; i < SEGMENT_COUNT; i++) {
            segments.push({ x: cx - i * SEGMENT_GAP, y: cy });
        }
        target = { x: cx, y: cy };
        pickIdleTarget();
    }

    function bindEvents() {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            target = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            mouseInside = true;
        });
        canvas.addEventListener('mouseleave', () => { mouseInside = false; });
        canvas.addEventListener('touchmove', (e) => {
            const t = e.touches[0]; if (!t) return;
            const rect = canvas.getBoundingClientRect();
            target = { x: t.clientX - rect.left, y: t.clientY - rect.top };
            mouseInside = true;
        }, { passive: true });
        canvas.addEventListener('touchend', () => { mouseInside = false; });
        window.addEventListener('resize', () => { resize(); });
    }

    function update() {
        if (!mouseInside) {
            idleTimer--;
            if (idleTimer <= 0) pickIdleTarget();
        }

        const head = segments[0];
        const dx = target.x - head.x;
        const dy = target.y - head.y;
        const dist = Math.hypot(dx, dy);
        const speed = Math.min(dist * 0.18, 7);
        if (dist > 0.5) {
            head.x += (dx / dist) * speed;
            head.y += (dy / dist) * speed;
        }

        for (let i = 1; i < segments.length; i++) {
            const prev = segments[i - 1];
            const cur = segments[i];
            const sx = prev.x - cur.x;
            const sy = prev.y - cur.y;
            const sd = Math.hypot(sx, sy);
            if (sd > SEGMENT_GAP) {
                cur.x = prev.x - (sx / sd) * SEGMENT_GAP;
                cur.y = prev.y - (sy / sd) * SEGMENT_GAP;
            }
        }
    }

    function drawPixelSquare(x, y, size, color) {
        const half = size / 2;
        const px = Math.round((x - half) / PIXEL) * PIXEL;
        const py = Math.round((y - half) / PIXEL) * PIXEL;
        const sz = Math.max(PIXEL, Math.round(size / PIXEL) * PIXEL);
        ctx.fillStyle = color;
        ctx.fillRect(px, py, sz, sz);
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(255,249,236,0.025)';
        for (let x = 0; x < w; x += PIXEL) ctx.fillRect(x, 0, 1, h);
        for (let y = 0; y < h; y += PIXEL) ctx.fillRect(0, y, w, 1);

        for (let i = segments.length - 1; i >= 1; i--) {
            const s = segments[i];
            const color = COLORS[(i + Math.floor(tick / 6)) % COLORS.length];
            drawPixelSquare(s.x, s.y, PIXEL * 1.7, color);
        }

        const head = segments[0];
        drawPixelSquare(head.x, head.y, PIXEL * 2.3, '#E8E007');

        const next = segments[1];
        const dxh = head.x - next.x;
        const dyh = head.y - next.y;
        const len = Math.hypot(dxh, dyh) || 1;
        const nx = dxh / len, ny = dyh / len;
        const perpX = -ny, perpY = nx;
        const eyeForward = PIXEL * 0.4;
        const eyeSpread = PIXEL * 0.55;
        const eyeSize = PIXEL * 0.45;

        const ex1 = head.x + nx * eyeForward + perpX * eyeSpread;
        const ey1 = head.y + ny * eyeForward + perpY * eyeSpread;
        const ex2 = head.x + nx * eyeForward - perpX * eyeSpread;
        const ey2 = head.y + ny * eyeForward - perpY * eyeSpread;

        ctx.fillStyle = '#0b0b0c';
        const epx1 = Math.round((ex1 - eyeSize / 2) / 2) * 2;
        const epy1 = Math.round((ey1 - eyeSize / 2) / 2) * 2;
        const epx2 = Math.round((ex2 - eyeSize / 2) / 2) * 2;
        const epy2 = Math.round((ey2 - eyeSize / 2) / 2) * 2;
        ctx.fillRect(epx1, epy1, eyeSize, eyeSize);
        ctx.fillRect(epx2, epy2, eyeSize, eyeSize);
    }

    function loop() {
        tick++;
        update();
        draw();
        requestAnimationFrame(loop);
    }

    init();
    bindEvents();
    loop();
}
