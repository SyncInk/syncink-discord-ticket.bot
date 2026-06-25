import React, { useEffect, useRef, useState } from 'react';

// Spring easing for particles
const springEase = (t) => {
  return 1 - Math.pow(Math.E, -5 * t) * Math.cos(8 * t);
};

class Particle {
  constructor(targetX, targetY, startX, startY, color, delay) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.startX = startX;
    this.startY = startY;
    this.x = startX;
    this.y = startY;
    this.color = color;
    
    this.progress = 0;
    // 2x faster: 300-500ms (was 600-1000ms)
    this.duration = 300 + Math.random() * 200; 
    this.delay = delay;
    
    // Physics swirl
    this.swirlX = (Math.random() - 0.5) * 100;
    this.swirlY = (Math.random() - 0.5) * 100;
    
    this.size = Math.random() * 1.5 + 0.5;
    this.opacity = 0;
    this.state = 'traveling'; // traveling -> settled -> fading
  }

  update(deltaTime) {
    if (this.delay > 0) {
      this.delay -= deltaTime;
      return;
    }
    
    if (this.state === 'traveling') {
      this.progress += deltaTime;
      let t = Math.min(this.progress / this.duration, 1);
      
      if (t < 0.2) this.opacity = t / 0.2;
      else this.opacity = 1;

      let easeT = springEase(t);
      
      let swirl = Math.sin(t * Math.PI * 3) * (1 - t);
      
      this.x = this.startX + (this.targetX - this.startX) * easeT + this.swirlX * swirl;
      this.y = this.startY + (this.targetY - this.startY) * easeT + this.swirlY * swirl;

      if (t >= 1) {
        this.state = 'settled';
        this.progress = 0;
        this.x = this.targetX;
        this.y = this.targetY;
      }
    } else if (this.state === 'settled') {
      // stay settled until external trigger sets state to fading
    } else if (this.state === 'fading') {
      this.progress += deltaTime;
      // 2x faster fade: 150ms (was 300ms)
      let t = Math.min(this.progress / 150, 1); 
      this.opacity = 1 - t;
    }
  }

  draw(ctx) {
    if (this.opacity <= 0 || this.delay > 0) return;
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
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
  
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
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
        if (p.opacity > 0 || p.state !== 'fading') {
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

    let timeoutId;
    let currentIndex = -1;
    setIsTyping(true);

    const typeNextChar = () => {
      currentIndex++;
      
      if (currentIndex >= chars.length) {
        setIsTyping(false);
        return;
      }

      const currentChar = chars[currentIndex];
      
      if (currentChar.isBr || currentChar.char === ' ') {
        setRevealedIndex(currentIndex);
        // 2x faster: 20ms delay for spaces
        timeoutId = setTimeout(typeNextChar, currentChar.isBr ? 0 : 20);
        return;
      }

      const span = spansRef.current[currentIndex];
      if (!span || !containerRef.current || !canvasRef.current) {
        // 2x faster: 25ms fallback delay
        timeoutId = setTimeout(typeNextChar, 25);
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const spanRect = span.getBoundingClientRect();
      const style = window.getComputedStyle(span);
      
      const spanLeft = spanRect.left - containerRect.left;
      const spanTop = spanRect.top - containerRect.top;
      
      const offCanvas = offscreenCanvasRef.current;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      
      offCanvas.width = 200;
      offCanvas.height = 200;
      
      offCtx.clearRect(0, 0, 200, 200);
      offCtx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      offCtx.fillStyle = 'white';
      offCtx.textBaseline = 'alphabetic';
      offCtx.fillText(currentChar.char, 50, 150); // draw somewhere safe
      
      const imgData = offCtx.getImageData(0, 0, 200, 200).data;
      const targetPixels = [];
      
      let minX = 200, maxX = 0, minY = 200, maxY = 0;
      
      for (let y = 0; y < 200; y += 2) {
        for (let x = 0; x < 200; x += 2) {
          const alpha = imgData[(y * 200 + x) * 4 + 3];
          if (alpha > 128) {
            targetPixels.push({ x, y });
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const pixelWidth = maxX - minX;
      const pixelHeight = maxY - minY;
      
      const offsetX = spanLeft + (spanRect.width - pixelWidth) / 2;
      const offsetY = spanTop + (spanRect.height - pixelHeight) / 2;

      const color = currentChar.isHighlight ? '#C084FC' : '#ffffff';
      
      const newParticles = [];
      const MAX_PARTICLES = 80;
      const step = Math.max(1, Math.floor(targetPixels.length / MAX_PARTICLES));
      
      for (let i = 0; i < targetPixels.length; i += step) {
        const px = targetPixels[i];
        const targetX = offsetX + (px.x - minX);
        const targetY = offsetY + (px.y - minY);
        
        const startX = targetX + (Math.random() - 0.5) * 300;
        const startY = targetY + 100 + Math.random() * 200; // Come from bottom
        
        // 2x faster start delay: 0-50ms (was 0-100ms)
        newParticles.push(new Particle(targetX, targetY, startX, startY, color, Math.random() * 50));
      }

      particlesRef.current.push(...newParticles);

      // Wait for particles to assemble the letter perfectly
      setTimeout(() => {
        // Reveal the actual DOM letter instantly (no opacity transition)
        setRevealedIndex(currentIndex);
        
        // Command particles to fade away
        newParticles.forEach(p => {
          if (p.state === 'settled') p.state = 'fading';
        });

        // Trigger next letter - 2x faster: 25ms delay (was 50ms)
        timeoutId = setTimeout(typeNextChar, 25);
      }, 550); // 2x faster: 550ms wait for the 300-500ms duration particles to settle (was 1100ms)
      
    };

    // 2x faster start delay
    timeoutId = setTimeout(typeNextChar, 250);

    return () => clearTimeout(timeoutId);
  }, [fontsLoaded]);

  return (
    <div className="hero-particle-container" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="hero-particle-canvas"
      />
      
      <h1 className="hero-particle-text">
        {chars.map((c, i) => {
          if (c.isBr) return <br key={i} />;
          
          const isRevealed = i <= revealedIndex;
          
          let className = "particle-char";
          if (c.isHighlight) className += " highlight-char";
          if (isRevealed) className += " revealed";

          return (
            <span 
              key={i} 
              ref={el => spansRef.current[i] = el}
              className={className}
            >
              {c.char === ' ' ? '\u00A0' : c.char}
            </span>
          );
        })}
        {isTyping && <span className="particle-cursor" />}
      </h1>
    </div>
  );
}
