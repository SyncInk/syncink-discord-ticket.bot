import React, { useEffect, useRef } from 'react';

// ─── Easing ───────────────────────────────────────────────────────────────────
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ─── Particle ─────────────────────────────────────────────────────────────────
class Particle {
  constructor() {
    this.x = 0; this.y = 0;
    this.vx = 0; this.vy = 0;
    this.tx = 0; this.ty = 0;
    this.size = 1;
    this.alpha = 0;
    this.color = '#C084FC';
    this.phase = 'idle';   // idle | converging | dissolving | dead
    this.progress = 0;     // ms elapsed in current phase
    this.delay = 0;
    this.noiseX = 0;
  }

  update(dt) {
    if (this.phase === 'idle') {
      this.delay -= dt;
      if (this.delay <= 0) {
        this.delay = 0;
        this.phase = 'converging';
        this.progress = 0;
      }
      return;
    }

    if (this.phase === 'converging') {
      this.progress += dt;

      const dx = this.tx - this.x;
      const dy = this.ty - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Spring attraction with noise curvature
      const spring   = 0.10;
      const friction = 0.80;
      this.vx = (this.vx + dx * spring + this.noiseX) * friction;
      this.vy = (this.vy + dy * spring) * friction;
      this.x += this.vx;
      this.y += this.vy;

      // Fade alpha in over 300ms
      this.alpha = clamp(easeOutExpo(this.progress / 300), 0, 1);

      // Settle check
      if (dist < 0.4 && Math.abs(this.vx) < 0.2 && Math.abs(this.vy) < 0.2) {
        this.x = this.tx; this.y = this.ty;
        this.vx = 0; this.vy = 0;
        this.phase = 'dissolving';
        this.progress = 0;
      }
    }

    if (this.phase === 'dissolving') {
      this.progress += dt;
      const dur = 350;
      this.alpha = clamp(1 - easeOutExpo(this.progress / dur), 0, 1);
      if (this.progress >= dur) this.phase = 'dead';
    }
  }

  draw(ctx) {
    if (this.phase === 'idle' || this.phase === 'dead' || this.alpha <= 0) return;
    ctx.globalAlpha  = this.alpha;
    ctx.fillStyle    = this.color;
    ctx.shadowBlur   = 7;
    ctx.shadowColor  = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HeroParticleText({ textLines, highlightWord }) {
  const canvasRef = useRef(null);
  const h1Ref     = useRef(null);
  const spansRef  = useRef([]);  // indexed by flat chars[] index

  // Build a flat chars array — same structure used in both render + extraction
  const chars = [];
  textLines.forEach((line, li) => {
    const hStart = line.indexOf(highlightWord);
    const hEnd   = hStart >= 0 ? hStart + highlightWord.length : -1;
    for (let i = 0; i < line.length; i++) {
      chars.push({
        char: line[i],
        isHighlight: hStart >= 0 && i >= hStart && i < hEnd,
        isBr: false,
      });
    }
    if (li < textLines.length - 1)
      chars.push({ char: '\n', isHighlight: false, isBr: true });
  });

  // ── Engine ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const h1     = h1Ref.current;
    if (!canvas || !h1) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    let raf;
    let last = 0;
    let paused = false;
    let particles = [];
    let animating = false;

    // ── Size canvas ───────────────────────────────────────────────────────────
    function resize() {
      const r = h1.getBoundingClientRect();
      canvas.width  = Math.ceil(r.width  * dpr);
      canvas.height = Math.ceil(r.height * dpr);
      canvas.style.width  = r.width  + 'px';
      canvas.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ── Extract pixel targets from real rendered spans ─────────────────────
    async function extractTargets() {
      await document.fonts.ready;
      resize();

      const containerRect = h1.getBoundingClientRect();
      const off    = document.createElement('canvas');
      const offCtx = off.getContext('2d', { willReadFrequently: true });
      const pxDpr  = 3; // high-res sampling

      const targets = []; // { x, y, color }

      spansRef.current.forEach((span, ci) => {
        if (!span) return;
        const c = chars[ci];
        if (!c || c.isBr || c.char === ' ') return;

        const sr = span.getBoundingClientRect();
        const cs = getComputedStyle(span);
        const fSize  = parseFloat(cs.fontSize);
        const fw     = cs.fontWeight;
        const ff     = cs.fontFamily;

        // Offscreen canvas: large enough to capture the full glyph
        const W = Math.ceil(sr.width  * pxDpr) + 20;
        const H = Math.ceil(sr.height * pxDpr) + 20;
        off.width  = W;
        off.height = H;
        offCtx.clearRect(0, 0, W, H);

        offCtx.font         = `${fw} ${fSize * pxDpr}px ${ff}`;
        offCtx.fillStyle    = 'white';
        offCtx.textBaseline = 'top';
        offCtx.textAlign    = 'left';
        offCtx.fillText(c.char, 10, 8);

        const data = offCtx.getImageData(0, 0, W, H).data;

        // Accent white sparkles mixed in for non-highlight chars
        const baseColor = c.isHighlight ? '#C084FC' : '#A855F7';
        const sparkle   = !c.isHighlight && Math.random() < 0.2;
        const color     = sparkle ? '#ffffff' : baseColor;

        // Map each sampled pixel back to screen space
        for (let py = 0; py < H; py += pxDpr) {
          for (let px = 0; px < W; px += pxDpr) {
            if (data[(py * W + px) * 4 + 3] > 100) {
              targets.push({
                x: (sr.left - containerRect.left) + (px - 10) / pxDpr,
                y: (sr.top  - containerRect.top)  + (py -  8) / pxDpr,
                color,
              });
            }
          }
        }
      });

      return targets;
    }

    // ── Build particle pool ────────────────────────────────────────────────
    async function buildParticles() {
      const targets = await extractTargets();

      const MAX  = 2800;
      const step = Math.max(1, Math.floor(targets.length / MAX));

      particles = [];
      for (let i = 0; i < targets.length; i += step) {
        const t = targets[i];
        const p = new Particle();

        // Spawn in a cloud around the heading
        const ang  = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 280;
        p.x  = t.x + Math.cos(ang) * dist;
        p.y  = t.y + Math.sin(ang) * dist - Math.random() * 100;
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = (Math.random() - 0.5) * 3;
        p.tx    = t.x;
        p.ty    = t.y;
        p.color = t.color;
        p.size  = 0.5 + Math.random() * 1.6;
        p.alpha = 0;
        p.phase = 'idle';
        p.delay = Math.random() * 100; // 0-100ms stagger burst
        p.noiseX = (Math.random() - 0.5) * 0.35;

        particles.push(p);
      }
    }

    // ── Text alpha ramp ───────────────────────────────────────────────────
    function fadeTextIn() {
      const start = performance.now();
      const dur   = 650;
      function step(now) {
        const t = clamp((now - start) / dur, 0, 1);
        h1.style.opacity = String(easeOutExpo(t));
        if (t < 1) requestAnimationFrame(step);
        else h1.style.opacity = '1';
      }
      requestAnimationFrame(step);
    }

    // ── Main loop ─────────────────────────────────────────────────────────
    function loop(ts) {
      raf = requestAnimationFrame(loop);
      if (paused || !animating) return;

      const dt = clamp(ts - last, 0, 50);
      last = ts;

      const logW = canvas.width  / dpr;
      const logH = canvas.height / dpr;
      ctx.clearRect(0, 0, logW, logH);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      let allDone = true;
      for (const p of particles) {
        p.update(dt);
        if (p.phase !== 'dead') {
          allDone = false;
          p.draw(ctx);
        }
      }

      ctx.restore();
      if (allDone) animating = false;
    }

    // ── Visibility pause ──────────────────────────────────────────────────
    const onViz = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onViz);

    // ── ResizeObserver ────────────────────────────────────────────────────
    const ro = new ResizeObserver(resize);
    ro.observe(h1);

    // ── Kick off ──────────────────────────────────────────────────────────
    h1.style.opacity = '0';
    last = performance.now();
    raf  = requestAnimationFrame(loop);

    buildParticles().then(() => {
      animating = true;
      fadeTextIn();
      // Trigger dissolve after 750ms — particles finish and text is solid
      setTimeout(() => {
        for (const p of particles) {
          if (p.phase !== 'dead') {
            p.phase    = 'dissolving';
            p.progress = 0;
          }
        }
      }, 750);
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onViz);
      ro.disconnect();
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  //
  // Each char gets a <span> ref'd by its index in the flat chars[] array.
  // The highlight word is wrapped once more so the gradient span can be used
  // in the finished state without switching to a different DOM structure.

  let flatIndex = 0;
  const renderedLines = textLines.map((line, li) => {
    const hStart = line.indexOf(highlightWord);
    const hEnd   = hStart >= 0 ? hStart + highlightWord.length : -1;
    const nodes  = [];

    for (let i = 0; i < line.length; i++) {
      const fi = flatIndex++;          // capture current flat index
      const ch = line[i];
      const isH = hStart >= 0 && i >= hStart && i < hEnd;

      nodes.push(
        <span
          key={`${li}-${i}`}
          ref={el => { spansRef.current[fi] = el; }}
          className={isH ? 'hpc-highlight-char' : 'hpc-char'}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      );
    }

    // Advance flatIndex past the <br> placeholder in chars[]
    if (li < textLines.length - 1) flatIndex++;

    return (
      <React.Fragment key={li}>
        {nodes}
        {li < textLines.length - 1 && <br />}
      </React.Fragment>
    );
  });

  return (
    <div className="hpc-root">
      <canvas ref={canvasRef} className="hpc-canvas" />
      <h1 ref={h1Ref} className="hpc-heading">
        {renderedLines}
      </h1>
    </div>
  );
}
