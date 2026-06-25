import React, { useEffect, useRef, useState } from 'react';

// Physics easing for smooth particle movement
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

class Particle {
  constructor(targetX, targetY, startX, startY, color, delay) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.startX = startX;
    this.startY = startY;
    this.x = startX;
    this.y = startY;
    this.color = color;
    
    // Physics properties
    this.progress = 0;
    this.duration = 400 + Math.random() * 300; // 400-700ms travel time
    this.delay = delay;
    
    // Swirl offset parameters
    this.swirlAmplitudeX = (Math.random() - 0.5) * 60;
    this.swirlAmplitudeY = (Math.random() - 0.5) * 60;
    
    this.size = 1 + Math.random() * 2;
    this.opacity = 0;
    this.dead = false;
  }

  update(deltaTime) {
    if (this.delay > 0) {
      this.delay -= deltaTime;
      return;
    }
    
    this.progress += deltaTime;
    let t = Math.min(this.progress / this.duration, 1);
    
    // Fade in quickly, fade out at the very end
    if (t < 0.2) this.opacity = t / 0.2;
    else if (t > 0.8) this.opacity = 1 - ((t - 0.8) / 0.2);
    else this.opacity = 1;

    let easeT = easeOutCubic(t);
    
    // Add swirl motion that reduces to 0 as it reaches target
    let swirlX = Math.sin(t * Math.PI * 2) * this.swirlAmplitudeX * (1 - easeT);
    let swirlY = Math.cos(t * Math.PI * 2) * this.swirlAmplitudeY * (1 - easeT);

    this.x = this.startX + (this.targetX - this.startX) * easeT + swirlX;
    this.y = this.startY + (this.targetY - this.startY) * easeT + swirlY;

    if (t >= 1) {
      this.dead = true;
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

export default function SandTypewriter({ 
  textLines,
  highlightWord, 
  typingSpeedMin = 30, 
  typingSpeedMax = 70 
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const spansRef = useRef([]);
  
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Flatten text into array of chars while remembering line breaks and highlight
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
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Animation Loop
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
        if (!p.dead) {
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

  // Typewriter Loop
  useEffect(() => {
    if (isReducedMotion) {
      setRevealedIndex(chars.length);
      setIsFinished(true);
      return;
    }

    let timeoutId;
    let currentIndex = -1;
    setIsTyping(true);

    const typeNextChar = () => {
      currentIndex++;
      
      if (currentIndex >= chars.length) {
        setIsTyping(false);
        setIsFinished(true);
        return;
      }

      const currentChar = chars[currentIndex];
      
      // Spawn particles
      if (!currentChar.isBr && currentChar.char !== ' ' && containerRef.current && canvasRef.current) {
        const span = spansRef.current[currentIndex];
        if (span) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const spanRect = span.getBoundingClientRect();
          
          const spanLeft = spanRect.left - containerRect.left;
          const spanTop = spanRect.top - containerRect.top;
          const spanWidth = spanRect.width;
          const spanHeight = spanRect.height;

          // Spawn 15-25 particles per letter
          const numParticles = Math.floor(15 + Math.random() * 10);
          for (let i = 0; i < numParticles; i++) {
            const targetX = spanLeft + Math.random() * spanWidth;
            const targetY = spanTop + Math.random() * spanHeight;
            
            // Particles emerge from the bottom centerish area
            const startX = spanLeft + (Math.random() - 0.5) * 150;
            const startY = spanTop + 40 + Math.random() * 80;
            
            const color = currentChar.isHighlight ? '#C084FC' : '#ffffff';
            
            particlesRef.current.push(new Particle(targetX, targetY, startX, startY, color, Math.random() * 80));
          }
        }
      }

      setRevealedIndex(currentIndex);

      // Delay for next char
      const delay = currentChar.char === ' ' ? 20 : (typingSpeedMin + Math.random() * (typingSpeedMax - typingSpeedMin));
      timeoutId = setTimeout(typeNextChar, currentChar.isBr ? 0 : delay);
    };

    // Wait a brief moment before starting
    timeoutId = setTimeout(typeNextChar, 400);

    return () => clearTimeout(timeoutId);
  }, [isReducedMotion]);

  // Construct final DOM for finished state to allow smooth continuous gradients
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
    <div className="sand-typewriter-container" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="sand-typewriter-canvas"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 10 }}
      />
      
      <h1 className="sand-typewriter-text">
        {isFinished && !isReducedMotion ? (
          finalDom
        ) : (
          <>
            {chars.map((c, i) => {
              if (c.isBr) return <br key={i} />;
              
              const isRevealed = i <= revealedIndex || isReducedMotion;
              
              let className = "sand-char";
              if (c.isHighlight) className += " highlight-char-typing";
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
            {isTyping && <span className="sand-cursor" />}
          </>
        )}
      </h1>
    </div>
  );
}
