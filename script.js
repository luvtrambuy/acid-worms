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

    /* ---------- Background worm swarm ---------- */
    const wormCanvasEl = document.querySelector('.bg-worms');
    if (wormCanvasEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new BgWormSwarm(wormCanvasEl);
    }

    /* ---------- Confetti system — desktop only ----------
       Mobile phones consistently choked on the canvas redraw cost,
       even after tuning particle caps / fade. Disabled on touch
       devices entirely; the rest of the brand vibe carries it.
       We OR in (max-width: 768px) so the same gate kicks in when
       testing by narrowing a desktop window, not just on real touch
       hardware. */
    const isMobile = window.matchMedia('(hover: none), (max-width: 768px)').matches;
    const confetti = isMobile ? null : new ConfettiSystem();

    if (confetti) {
        const handler = window.PointerEvent ? 'pointerdown' : 'click';
        document.addEventListener(handler, (e) => {
            if (e.target.closest('#acid-worm')) return;
            if (e.target.closest('.confetti-canvas')) return;
            confetti.burst(e.clientX, e.clientY, 16, /*power*/ 0.85);
        });
    }

    /* ---------- Build your own button — mega burst (desktop) ---------- */
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

            if (confetti) {
                const rect = buildBtn.getBoundingClientRect();
                confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 70, /*power*/ 1.25);
            }
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

        // Mobile gets a smaller cap and faster decay so a few enthusiastic
        // taps don't pile up into a permanent confetti graveyard on screen.
        const mobile = window.matchMedia('(hover: none)').matches;
        this.MAX_PARTICLES = mobile ? 300 : 1200;
        this.REST_BEFORE_FADE = mobile ? 0.4 : 1.2;   // seconds at rest before fading
        this.FLOOR_FADE = mobile ? 1.0 : 0.45;        // life lost per second once fading
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
        const FLOOR_FADE = this.FLOOR_FADE;
        const REST_BEFORE_FADE = this.REST_BEFORE_FADE;

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
                if (p.restTime > REST_BEFORE_FADE) {
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

/* ============================================================
   BACKGROUND WORM SWARM — small, slow, drifting chains of circles
   floating across a fixed full-viewport canvas. Replaces the old
   symmetric dot grid. ~25 worms on desktop, ~14 on mobile.
   Each worm = 5–7 segments following a head that eases toward a
   slowly-changing target. Movement is intentionally so slow it
   reads as ambient background motion, not animation.
   ============================================================ */
class BgWormSwarm {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mobile = window.matchMedia('(hover: none)').matches;

        this.count = this.mobile ? 14 : 25;
        this.worms = [];

        this.colors = [
            'rgba(232, 224, 7, 0.85)',   // acid yellow
            'rgba(253, 169, 5, 0.78)',   // orange
            'rgba(251, 211, 1, 0.78)',   // yellow
            'rgba(255, 249, 236, 0.55)', // paper-cream
        ];

        // Worm coordinates live in document space (y measured from the
        // top of the page). Canvas stays viewport-sized for cheap redraw;
        // at draw time we subtract scrollY so worms travel with the page.
        this.scrollY = window.scrollY || 0;
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY || 0;
        }, { passive: true });

        this.resize();
        window.addEventListener('resize', () => this.resize());

        for (let i = 0; i < this.count; i++) this.worms.push(this.makeWorm());

        this.lastFrame = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    // visible range in document space, padded so worms slide in/out
    // smoothly instead of popping at the edge.
    visibleRange() {
        const margin = 100;
        return [this.scrollY - margin, this.scrollY + this.h + margin];
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

    makeWorm() {
        const segCount = 5 + Math.floor(Math.random() * 3); // 5–7
        const segGap   = 4 + Math.random() * 2;             // 4–6 px
        const radius   = 1.6 + Math.random() * 1.0;         // 1.6–2.6 px
        const [top, bottom] = this.visibleRange();
        const x = Math.random() * this.w;
        const y = top + Math.random() * (bottom - top);
        const segments = [];
        for (let i = 0; i < segCount; i++) segments.push({ x: x - i * segGap, y });
        return {
            segments,
            segGap,
            radius,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            target: this.pickTarget(),
            speed: 0.18 + Math.random() * 0.22,
            retargetIn: 60 + Math.random() * 240,
        };
    }

    pickTarget() {
        const margin = 40;
        const [top, bottom] = this.visibleRange();
        return {
            x: -margin + Math.random() * (this.w + 2 * margin),
            y: top + Math.random() * (bottom - top),
        };
    }

    update(dtScale) {
        const [top, bottom] = this.visibleRange();
        for (let i = 0; i < this.worms.length; i++) {
            const worm = this.worms[i];
            worm.retargetIn -= dtScale;
            if (worm.retargetIn <= 0) {
                worm.target = this.pickTarget();
                worm.retargetIn = 60 + Math.random() * 240;
            }
            const head = worm.segments[0];
            const dx = worm.target.x - head.x;
            const dy = worm.target.y - head.y;
            const dist = Math.hypot(dx, dy) || 1;
            const step = Math.min(dist, worm.speed * dtScale);
            head.x += (dx / dist) * step;
            head.y += (dy / dist) * step;

            for (let j = 1; j < worm.segments.length; j++) {
                const prev = worm.segments[j - 1];
                const cur = worm.segments[j];
                const sx = prev.x - cur.x;
                const sy = prev.y - cur.y;
                const sd = Math.hypot(sx, sy) || 1;
                if (sd > worm.segGap) {
                    cur.x = prev.x - (sx / sd) * worm.segGap;
                    cur.y = prev.y - (sy / sd) * worm.segGap;
                }
            }

            // If the whole worm has scrolled / drifted out of sight,
            // recycle it into the current viewport so density stays
            // roughly constant whatever section you're on.
            const tail = worm.segments[worm.segments.length - 1];
            const farAbove = head.y < top - 60 && tail.y < top - 60;
            const farBelow = head.y > bottom + 60 && tail.y > bottom + 60;
            if (farAbove || farBelow) this.worms[i] = this.makeWorm();
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);
        const offsetY = this.scrollY;
        for (const worm of this.worms) {
            ctx.fillStyle = worm.color;
            for (const seg of worm.segments) {
                ctx.beginPath();
                ctx.arc(seg.x, seg.y - offsetY, worm.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    loop(now) {
        // Scale movement to real elapsed time so a tab in background
        // doesn't queue up a long jump on resume.
        const dt = Math.min((now - this.lastFrame) / (1000 / 60), 3);
        this.lastFrame = now;
        this.update(dt);
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }
}
