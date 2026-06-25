import React, { useEffect, useRef, useState } from 'react';

const easeOutExpo = (t) => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

class Particle {
  constructor(targetX, targetY, startX, startY, color, duration, delay) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.startX = startX;
    this.startY = startY;
    this.x = startX;
    this.y = startY;
    this.color = color;
    
    this.progress = 0;
    this.duration = duration; // 400-700ms
    this.delay = delay;
    
    this.size = Math.random() * 1.5 + 0.5;
    this.opacity = 0;
    this.state = 'traveling';
  }

  update(deltaTime) {
    if (this.delay > 0) {
      this.delay -= deltaTime;
      return;
    }
    
    if (this.state === 'traveling') {
      this.progress += deltaTime;
      let t = Math.min(this.progress / this.duration, 1);
      
      // Fast fade in
      if (t < 0.1) this.opacity = t / 0.1;
      else this.opacity = 1;

      let easeT = easeOutExpo(t);
      
      this.x = this.startX + (this.targetX - this.startX) * easeT;
      this.y = this.startY + (this.targetY - this.startY) * easeT;

      if (t >= 1) {
        this.state = 'fading';
        this.progress = 0;
        this.x = this.targetX;
        this.y = this.targetY;
      }
    } else if (this.state === 'fading') {
      this.progress += deltaTime;
      let t = Math.min(this.progress / 300, 1); // 300ms fade out
      this.opacity = 1 - t;
    }
  }

  draw(ctx) {
    if (this.opacity <= 0 || this.delay > 0) return;
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

export default function HeroParticleText({ 
  textLines,
  highlightWord
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const spansRef = useRef([]);
  
  const [phase, setPhase] = useState('invisible'); // invisible -> assembling -> finished
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const offscreenCanvasRef = useRef(document.createElement('canvas'));

  const chars = [];
  let charGlobalIndex = 0;
  
  textLines.forEach((line, lineIndex) => {
    const highlightStartIndex = line.indexOf(highlightWord);
    const highlightEndIndex = highlightStartIndex !== -1 ? highlightStartIndex + highlightWord.length : -1;
    
    for (let i = 0; i < line.length; i++) {
      const isHighlight = highlightStartIndex !== -1 && i >= highlightStartIndex && i < highlightEndIndex;
      chars.push({
        char: line[i],
        globalIndex: charGlobalIndex++,
        isHighlight,
        isBr: false
      });
    }
    if (lineIndex < textLines.length - 1) {
      chars.push({ char: '\n', globalIndex: charGlobalIndex++, isHighlight: false, isBr: true });
    }
  });

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      const parent = containerRef.current;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const activeParticles = [];
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.update(deltaTime);
        if (p.opacity > 0 || p.state !== 'fading' || p.progress < 300) {
          p.draw(ctx);
          activeParticles.push(p);
        }
      }
      particlesRef.current = activeParticles;

      animationFrameRef.current = requestAnimationFrame(render);
    };
    
    animationFrameRef.current = requestAnimationFrame(render);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    
    // Give layout a brief moment to stabilize
    const initTimer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      
      const offCanvas = offscreenCanvasRef.current;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      const dpi = 2;
      
      let allTargetPixels = [];

      // Extract pixels for ALL characters simultaneously
      chars.forEach((c, i) => {
        if (c.isBr || c.char === ' ') return;
        
        const span = spansRef.current[i];
        if (!span) return;

        const spanRect = span.getBoundingClientRect();
        const style = window.getComputedStyle(span);
        const fontSize = parseFloat(style.fontSize);
        
        const spanLeft = spanRect.left - containerRect.left;
        const spanTop = spanRect.top - containerRect.top;
        
        const boxSize = fontSize * 2;
        offCanvas.width = boxSize * dpi;
        offCanvas.height = boxSize * dpi;
        
        offCtx.scale(dpi, dpi);
        offCtx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        offCtx.fillStyle = 'white';
        // By drawing from top and offsetting by leading/2, we bypass kerning/shape misalignment completely!
        offCtx.textBaseline = 'top';
        offCtx.textAlign = 'left';
        
        const pad = fontSize * 0.5;
        offCtx.clearRect(0, 0, boxSize, boxSize);
        offCtx.fillText(c.char, pad, pad);
        
        const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;
        const color = c.isHighlight ? '#C084FC' : '#ffffff';
        
        const leading = spanRect.height - fontSize;
        const topOffset = leading / 2;

        for (let y = 0; y < offCanvas.height; y += 2) {
          for (let x = 0; x < offCanvas.width; x += 2) {
            const alpha = imgData[(y * offCanvas.width + x) * 4 + 3];
            if (alpha > 128) {
              const logicalX = x / dpi - pad;
              const logicalY = y / dpi - pad;
              
              allTargetPixels.push({
                x: spanLeft + logicalX,
                y: spanTop + topOffset + logicalY,
                color
              });
            }
          }
        }
      });

      // Downsample to ~2500 particles max to maintain 60 FPS
      const MAX_PARTICLES = 2500;
      const step = Math.max(1, Math.floor(allTargetPixels.length / MAX_PARTICLES));
      
      const newParticles = [];
      
      for (let i = 0; i < allTargetPixels.length; i += step) {
        const px = allTargetPixels[i];
        
        // Spawn from random positions scattered around the entire heading
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 300;
        const startX = px.x + Math.cos(angle) * distance;
        const startY = px.y + Math.sin(angle) * distance + (Math.random() * 100);
        
        const duration = 400 + Math.random() * 300; // 400-700ms
        const delay = Math.random() * 100; // Fast initial burst
        
        newParticles.push(new Particle(px.x, px.y, startX, startY, px.color, duration, delay));
      }

      particlesRef.current = newParticles;
      
      // Start the simultaneous fade-in + formation
      setPhase('assembling');
      
      // Once particles finish forming (max ~800ms), mark as finished
      setTimeout(() => {
        setPhase('finished');
      }, 800);
      
    }, 100);

    return () => clearTimeout(initTimer);
  }, [fontsLoaded]);

  // Construct final DOM for the continuous gradient highlight
  const finalDom = [];
  textLines.forEach((line, lineIndex) => {
    const start = line.indexOf(highlightWord);
    if (start !== -1) {
      finalDom.push(<span key={`t1-${lineIndex}`}>{line.substring(0, start)}</span>);
      finalDom.push(<span key={`h-${lineIndex}`} className="premium-highlight-word">{highlightWord}</span>);
      finalDom.push(<span key={`t2-${lineIndex}`}>{line.substring(start + highlightWord.length)}</span>);
    } else {
      finalDom.push(<span key={`t-${lineIndex}`}>{line}</span>);
    }
    if (lineIndex < textLines.length - 1) finalDom.push(<br key={`br-${lineIndex}`} />);
  });

  return (
    <div className="hero-particle-container" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="hero-particle-canvas"
      />
      
      <h1 className={`hero-particle-text ${phase}`}>
        {phase === 'finished' ? (
          finalDom
        ) : (
          chars.map((c, i) => {
            if (c.isBr) return <br key={i} />;
            
            let className = "particle-char";
            if (c.isHighlight) className += " highlight-char-assembling";

            return (
              <span 
                key={i} 
                ref={el => spansRef.current[i] = el}
                className={className}
              >
                {c.char === ' ' ? '\u00A0' : c.char}
              </span>
            );
          })
        )}
      </h1>
    </div>
  );
}
