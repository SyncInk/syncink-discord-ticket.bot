import React, { useEffect, useRef } from 'react';
import './HeroParticleReveal.css';

// ─── Tuning constants ─────────────────────────────────────────────────────────
const SPRING       = 0.065;   // spring attraction strength
const DAMPING      = 0.83;    // velocity damping per frame (< 1)
const MAX_PARTICLES = 3000;
const SAMPLE_SCALE = 3;       // offscreen canvas resolution multiplier
const TEXT_FADE_MS = 650;     // text opacity ramp
const DISSOLVE_AT  = 750;     // ms before particles begin dissolving
const DISSOLVE_MS  = 400;     // particle fadeout duration
const STAGGER_MS   = 80;      // max initial spawn delay
const DIST_MIN     = 60;      // min spawn distance from target
const DIST_MAX     = 240;     // max spawn distance from target

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HeroParticleReveal({ textLines, highlightWord }) {
  const canvasRef = useRef(null);
  const h1Ref     = useRef(null);
  const spansRef  = useRef([]);

  // ── Flat character list (stable; used for both DOM + extraction) ─────────
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

  // Keep a ref so the effect closure can access the latest chars
  const charsRef = useRef(chars);
  charsRef.current = chars;

  // ── Engine (runs once on mount) ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const h1     = h1Ref.current;
    if (!canvas || !h1) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // ── Pre-allocated particle pool (no GC during animation) ──────────────
    const pool = new Array(MAX_PARTICLES);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      pool[i] = {
        x: 0, y: 0, vx: 0, vy: 0,
        tx: 0, ty: 0,
        alpha: 0, size: 1, color: '#C084FC',
        active: false, settled: false,
        dissolving: false, dissolveT: 0,
        delay: 0,
      };
    }

    let activeCount = 0;
    let phase       = 'idle';   // idle → reveal → dissolve → done
    let revealStart = 0;
    let lastTime    = 0;
    let paused      = false;
    let raf         = 0;

    // ── Size the visible canvas to match the heading ──────────────────────
    function resize() {
      const r = h1.getBoundingClientRect();
      canvas.width  = Math.ceil(r.width  * dpr);
      canvas.height = Math.ceil(r.height * dpr);
      canvas.style.width  = r.width  + 'px';
      canvas.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ── Extract text-pixel targets from the real rendered DOM ─────────────
    async function extractTargets() {
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 60)); // let layout settle
      resize();

      const chars = charsRef.current;
      const cRect = h1.getBoundingClientRect();
      const off    = document.createElement('canvas');
      const offCtx = off.getContext('2d', { willReadFrequently: true });
      const targets = [];

      for (let ci = 0; ci < chars.length; ci++) {
        const c = chars[ci];
        if (c.isBr || c.char === ' ') continue;

        const span = spansRef.current[ci];
        if (!span) continue;

        const sr = span.getBoundingClientRect();
        const cs = getComputedStyle(span);
        const fSize = parseFloat(cs.fontSize);

        // Render glyph at SAMPLE_SCALE× resolution
        const W = Math.ceil(sr.width  * SAMPLE_SCALE) + 16;
        const H = Math.ceil(sr.height * SAMPLE_SCALE) + 16;
        off.width  = W;
        off.height = H;
        offCtx.clearRect(0, 0, W, H);
        offCtx.font         = `${cs.fontWeight} ${fSize * SAMPLE_SCALE}px ${cs.fontFamily}`;
        offCtx.fillStyle    = '#fff';
        offCtx.textBaseline = 'top';
        offCtx.textAlign    = 'left';
        offCtx.fillText(c.char, 8, 6);

        const data = offCtx.getImageData(0, 0, W, H).data;

        // Particle colour — mostly purple, occasional white sparkle
        let color;
        if (c.isHighlight) {
          color = Math.random() < 0.3 ? '#A855F7' : '#C084FC';
        } else {
          color = Math.random() < 0.12 ? '#ffffff' : '#A855F7';
        }

        // Map sampled pixels back to screen‑space coordinates
        for (let py = 0; py < H; py += SAMPLE_SCALE) {
          for (let px = 0; px < W; px += SAMPLE_SCALE) {
            if (data[(py * W + px) * 4 + 3] > 80) {
              targets.push({
                x: (sr.left - cRect.left) + (px - 8) / SAMPLE_SCALE,
                y: (sr.top  - cRect.top)  + (py - 6) / SAMPLE_SCALE,
                color,
              });
            }
          }
        }
      }

      return targets;
    }

    // ── Build particles from extracted targets ────────────────────────────
    async function init() {
      const targets = await extractTargets();
      const step = Math.max(1, Math.floor(targets.length / MAX_PARTICLES));
      let count = 0;

      for (let i = 0; i < targets.length && count < MAX_PARTICLES; i += step) {
        const t = targets[i];
        const p = pool[count];

        // Spawn in a scattered cloud around the heading
        const angle = Math.random() * Math.PI * 2;
        const dist  = DIST_MIN + Math.random() * (DIST_MAX - DIST_MIN);

        p.x     = t.x + Math.cos(angle) * dist;
        p.y     = t.y + Math.sin(angle) * dist;
        p.vx    = (Math.random() - 0.5) * 2;
        p.vy    = (Math.random() - 0.5) * 2;
        p.tx    = t.x;
        p.ty    = t.y;
        p.color = t.color;
        p.size  = 0.5 + Math.random() * 1.5;
        p.alpha = 0;
        p.active     = true;
        p.settled    = false;
        p.dissolving = false;
        p.dissolveT  = 0;
        p.delay = Math.random() * STAGGER_MS;

        count++;
      }

      activeCount = count;
      phase       = 'reveal';
      revealStart = performance.now();

      // Schedule dissolve phase
      setTimeout(() => { if (phase === 'reveal') phase = 'dissolve'; }, DISSOLVE_AT);
    }

    // ── RAF loop (no React state, no allocations) ─────────────────────────
    function loop(ts) {
      raf = requestAnimationFrame(loop);
      if (paused || phase === 'idle' || phase === 'done') return;

      const dt = Math.min(ts - lastTime, 33); // cap to ~30 fps minimum
      lastTime = ts;

      const logW = canvas.width  / dpr;
      const logH = canvas.height / dpr;
      ctx.clearRect(0, 0, logW, logH);

      // ── Text opacity (imperative DOM update) ───────────────────────────
      const elapsed = ts - revealStart;
      h1.style.opacity = String(easeOutExpo(Math.min(elapsed / TEXT_FADE_MS, 1)));

      // ── Particle physics + render ──────────────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = 'lighter'; // additive blending = natural bloom

      let anyActive = false;

      for (let i = 0; i < activeCount; i++) {
        const p = pool[i];
        if (!p.active) continue;

        // Spawn delay
        if (p.delay > 0) {
          p.delay -= dt;
          anyActive = true;
          continue;
        }

        // ── Spring attraction physics ────────────────────────────────────
        if (!p.settled) {
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          p.vx = (p.vx + dx * SPRING) * DAMPING;
          p.vy = (p.vy + dy * SPRING) * DAMPING;
          p.x += p.vx;
          p.y += p.vy;

          // Fade in
          if (p.alpha < 1) p.alpha = Math.min(p.alpha + dt * 0.006, 1);

          // Settle when close + slow
          if (dx * dx + dy * dy < 0.16 && p.vx * p.vx + p.vy * p.vy < 0.04) {
            p.x = p.tx;
            p.y = p.ty;
            p.settled = true;
          }
        }

        // ── Dissolve phase ───────────────────────────────────────────────
        if (phase === 'dissolve' && p.settled && !p.dissolving) {
          p.dissolving = true;
          p.dissolveT  = 0;
        }

        if (p.dissolving) {
          p.dissolveT += dt;
          p.alpha = Math.max(0, 1 - easeOutExpo(p.dissolveT / DISSOLVE_MS));
          if (p.alpha <= 0) { p.active = false; continue; }
        }

        // ── Draw: soft halo + solid core (bloom via additive blending) ───
        if (p.alpha > 0.01) {
          anyActive = true;

          // Halo (large, translucent)
          ctx.globalAlpha = p.alpha * 0.2;
          ctx.fillStyle   = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, 6.283);
          ctx.fill();

          // Core (small, solid)
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, 6.283);
          ctx.fill();
        }
      }

      ctx.restore();

      if (!anyActive && phase === 'dissolve') {
        phase = 'done';
        h1.style.opacity = '1';
      }
    }

    // ── Visibility API pause ──────────────────────────────────────────────
    const onViz = () => {
      paused = document.hidden;
      if (!document.hidden) lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', onViz);

    // ── Responsive resize ─────────────────────────────────────────────────
    const ro = new ResizeObserver(resize);
    ro.observe(h1);

    // ── Launch ────────────────────────────────────────────────────────────
    h1.style.opacity = '0';
    lastTime = performance.now();
    raf = requestAnimationFrame(loop);
    init();

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onViz);
      ro.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── DOM (rendered once — never re-renders during animation) ─────────────
  let fi = 0;
  const lineNodes = textLines.map((line, li) => {
    const nodes = [];
    for (let i = 0; i < line.length; i++) {
      const idx = fi++;
      const c = chars[idx];
      nodes.push(
        <span
          key={idx}
          ref={el => { spansRef.current[idx] = el; }}
          className={c.isHighlight ? 'hpr-hl' : undefined}
        >
          {line[i] === ' ' ? '\u00A0' : line[i]}
        </span>
      );
    }
    if (li < textLines.length - 1) fi++; // skip <br> placeholder in chars[]
    return (
      <React.Fragment key={li}>
        {nodes}
        {li < textLines.length - 1 && <br />}
      </React.Fragment>
    );
  });

  return (
    <div className="hpr-root">
      <canvas ref={canvasRef} className="hpr-canvas" />
      <h1 ref={h1Ref} className="hpr-heading">{lineNodes}</h1>
    </div>
  );
}
