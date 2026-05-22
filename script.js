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
                } else {
                    heroWrap.style.transform = 'scale(1.12)';
                }
                parallaxTicking = false;
            });
        }, { passive: true });

        // Mobile: hold the logo to make it buzz, release to stop.
        // Also ping the haptics API where available (Android Chrome / Firefox).
        const startBuzz = () => {
            heroWrap.classList.add('is-buzzing');
            if (navigator.vibrate) navigator.vibrate(20);
        };
        const stopBuzz  = () => heroWrap.classList.remove('is-buzzing');
        heroWrap.addEventListener('touchstart',  startBuzz, { passive: true });
        heroWrap.addEventListener('touchend',    stopBuzz);
        heroWrap.addEventListener('touchcancel', stopBuzz);
    }

    /* ---------- Tag stars inside the inline logo SVG ---------- */
    tagLogoStars();

    /* ---------- Fade-in observers ---------- */
    const observerOptions = { threshold: 0.01, rootMargin: '0px' };
    const supportsIO = 'IntersectionObserver' in window;

    const revealTranslate = (el) => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    };
    const revealFade = (el) => { el.style.opacity = '1'; };

    const observerTranslate = supportsIO ? new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                revealTranslate(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions) : null;

    const observerFade = supportsIO ? new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                revealFade(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions) : null;

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.style.opacity = '0';
        // Keep the same transform/box-shadow timing as in CSS so the
        // polaroid hover doesn't snap (inline style would otherwise
        // override the CSS transition rule).
        item.style.transition =
            `opacity 0.6s ease ${(index * 0.08).toFixed(2)}s, ` +
            `transform 1.0s cubic-bezier(0.22, 0.9, 0.3, 1), ` +
            `box-shadow 1.0s ease`;
        if (observerFade) observerFade.observe(item);
        else revealFade(item);
    });

    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
        aboutText.style.opacity = '0';
        aboutText.style.transform = 'translateY(40px)';
        aboutText.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        if (observerTranslate) observerTranslate.observe(aboutText);
        else revealTranslate(aboutText);
    }

    // Safety net: if iOS Safari fumbles IntersectionObserver (known on
    // short pages / fast scrolls), force-reveal anything still hidden
    // after 2s so the gallery never stays invisible.
    setTimeout(() => {
        galleryItems.forEach(item => {
            if (item.style.opacity === '0') revealFade(item);
        });
        if (aboutText && aboutText.style.opacity === '0') revealTranslate(aboutText);
    }, 2000);

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

    /* ---------- Confetti system — global, bouncing physics ---------- */
    const confetti = new ConfettiSystem();

    // Any tap/click anywhere = small burst at the point.
    // Skip the worm canvas (its own worm lives there) and lightbox overlays.
    // pointerdown fires reliably for both mouse and touch; click is kept as a
    // fallback for environments without Pointer Events, with a small dedupe
    // window so we don't double-burst when both fire on the same tap.
    let lastBurstTs = 0;
    const burstAt = (e) => {
        if (e.target.closest('#acid-worm')) return;
        if (e.target.closest('.confetti-canvas')) return;
        const now = performance.now();
        if (now - lastBurstTs < 300) return;
        lastBurstTs = now;
        confetti.burst(e.clientX, e.clientY, 16, /*power*/ 0.85);
    };
    document.addEventListener('pointerdown', burstAt);
    document.addEventListener('click', burstAt);

    /* ---------- Build your own button — mega burst ---------- */
    const buildBtn = document.getElementById('build-your-own');
    if (buildBtn) {
        buildBtn.addEventListener('click', () => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'build_your_own_click',
                section: 'acid_worm',
                timestamp: Date.now()
            });
            console.log('[track] build_your_own_click');

            const rect = buildBtn.getBoundingClientRect();
            confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 70, /*power*/ 1.25);
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
   CONFETTI SYSTEM — single full-screen canvas, particles with
   gravity, bouncing off viewport walls, accumulating until they
   come to rest and slowly fade away.
   ============================================================ */
class ConfettiSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'confetti-canvas';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.particles = [];
        this.running = false;
        this.lastTime = 0;

        this.colors = ['#E8E007', '#FBD301', '#FDA905', '#E7196E', '#AA1150', '#1FD67E', '#FFF9EC'];

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Hard cap so we don't melt the laptop if the user really goes nuts
        this.MAX_PARTICLES = 1200;
    }

    resize() {
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width  = Math.floor(this.w * this.dpr);
        this.canvas.height = Math.floor(this.h * this.dpr);
        this.canvas.style.width  = this.w + 'px';
        this.canvas.style.height = this.h + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    burst(x, y, count = 20, power = 1) {
        for (let i = 0; i < count; i++) {
            // Random direction, biased slightly upward
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6;
            const speed = (260 + Math.random() * 520) * power;

            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 6 + Math.random() * 12,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 14,
                bounce: 0.5 + Math.random() * 0.2,
                shape: Math.random() < 0.35 ? 'circle' : 'square',
                life: 1,
                restTime: 0
            });
        }
        // Drop the oldest if we're over the cap
        while (this.particles.length > this.MAX_PARTICLES) this.particles.shift();

        if (!this.running) this.start();
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        const loop = () => {
            if (!this.running) return;
            const now = performance.now();
            const dt = Math.min((now - this.lastTime) / 1000, 0.05);
            this.lastTime = now;

            this.update(dt);
            this.draw();

            if (this.particles.length === 0) {
                this.running = false;
                this.ctx.clearRect(0, 0, this.w, this.h);
                return;
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update(dt) {
        const GRAVITY  = 1500;
        const AIR_DRAG = 0.992;
        const W = this.w;
        const H = this.h;
        const FLOOR_FADE = 0.45; // when resting, life drops this fast per second

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.vy += GRAVITY * dt;
            p.vx *= AIR_DRAG;
            p.vy *= AIR_DRAG;
            p.x  += p.vx * dt;
            p.y  += p.vy * dt;
            p.rot += p.vrot * dt;

            // Walls — bounce with damping
            if (p.x < 0)      { p.x = 0;      p.vx = -p.vx * p.bounce; p.vrot *= 0.85; }
            else if (p.x > W) { p.x = W;      p.vx = -p.vx * p.bounce; p.vrot *= 0.85; }

            if (p.y < 0)      { p.y = 0;      p.vy = -p.vy * p.bounce; }
            else if (p.y > H) {
                p.y = H;
                p.vy = -p.vy * p.bounce;
                p.vx *= 0.82;          // floor friction on x
                p.vrot *= 0.6;
            }

            // Detect "at rest" on the floor — then start fading
            const nearFloor = p.y >= H - 4;
            const slow = Math.abs(p.vx) < 18 && Math.abs(p.vy) < 30;
            if (nearFloor && slow) {
                p.restTime += dt;
                if (p.restTime > 1.2) {
                    p.life -= FLOOR_FADE * dt;
                }
            } else {
                p.restTime = 0;
            }

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
            ctx.restore();
        }
    }
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
        canvas.addEventListener('touchstart', (e) => {
            const t = e.touches[0]; if (!t) return;
            const rect = canvas.getBoundingClientRect();
            target = { x: t.clientX - rect.left, y: t.clientY - rect.top };
            mouseInside = true;
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            const t = e.touches[0]; if (!t) return;
            const rect = canvas.getBoundingClientRect();
            target = { x: t.clientX - rect.left, y: t.clientY - rect.top };
            mouseInside = true;
            e.preventDefault();
        }, { passive: false });
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
