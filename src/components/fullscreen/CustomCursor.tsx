import React, { useEffect, useRef, useCallback } from 'react';

const CustomCursor: React.FC = () => {
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const ringState = useRef({ size: 36, opacity: 0.35, borderR: 0, borderG: 0, borderB: 0 });
  const rafRef = useRef(0);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailPoints = useRef<{ x: number; y: number; age: number }[]>([]);
  const hoverRef = useRef(false);
  const magneticTarget = useRef<{ el: HTMLElement; strength: number } | null>(null);

  // Expose setter
  useEffect(() => {
    (window as any).__setCursor = (hover: boolean) => {
      hoverRef.current = hover;
    };
    return () => { delete (window as any).__setCursor; };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };

    // Check for magnetic elements
    const target = e.target as HTMLElement;
    const magnetic = target.closest('[data-magnetic]') as HTMLElement | null;
    if (magnetic) {
      const rect = magnetic.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const strength = parseFloat(magnetic.dataset.magnetic || '0.15');
      magneticTarget.current = { el: magnetic, strength };
    } else {
      magneticTarget.current = null;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Hide default cursor
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  // Animation loop — all interpolation here
  useEffect(() => {
    const tick = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hover = hoverRef.current;

      // Magnetic pull
      let targetX = mx;
      let targetY = my;
      if (magneticTarget.current) {
        const rect = magneticTarget.current.el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;
        if (dist < maxDist && dist > 0) {
          const strength = (1 - dist / maxDist) * magneticTarget.current.strength;
          targetX += dx * strength;
          targetY += dy * strength;
        }
      }

      // Smooth follow for ring position
      smoothMouse.current.x += (targetX - smoothMouse.current.x) * 0.12;
      smoothMouse.current.y += (targetY - smoothMouse.current.y) * 0.12;

      // Cursor dot — direct follow
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
      }

      // Cursor ring — smooth size interpolation (non-linear)
      const rs = ringState.current;
      const targetSize = hover ? 56 : 32;
      const targetOpacity = hover ? 0.5 : 0.25;
      const easeFactor = hover ? 0.08 : 0.05;
      rs.size += (targetSize - rs.size) * easeFactor;
      rs.opacity += (targetOpacity - rs.opacity) * easeFactor;

      if (cursorRingRef.current) {
        const half = rs.size / 2;
        cursorRingRef.current.style.transform = `translate(${smoothMouse.current.x - half}px, ${smoothMouse.current.y - half}px)`;
        cursorRingRef.current.style.width = `${rs.size}px`;
        cursorRingRef.current.style.height = `${rs.size}px`;
        cursorRingRef.current.style.opacity = `${rs.opacity}`;
      }

      // Area glow
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform = `translate(${mx - 150}px, ${my - 150}px)`;
      }

      // Trail
      trailPoints.current.push({ x: mx, y: my, age: 0 });
      if (trailPoints.current.length > 20) trailPoints.current.shift();

      const canvas = trailCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          trailPoints.current.forEach((p) => {
            p.age++;
            const alpha = Math.max(0, 1 - p.age / 20);
            const size = 1.5 * alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(45, 106, 79, ${alpha * 0.2})`;
            ctx.fill();
          });

          trailPoints.current = trailPoints.current.filter(p => p.age < 20);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      {/* Cursor dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        <div className="w-[10px] h-[10px] rounded-full bg-ink/80 dark:bg-warm-50/80 shadow-[0_0_0_1.5px_rgba(255,255,255,0.85)]" />
      </div>

      {/* Cursor ring */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full"
        style={{
          willChange: 'transform, width, height, opacity',
          width: 32,
          height: 32,
          border: '1.5px solid rgba(10, 10, 10, 0.4)',
          opacity: 0.25,
          transition: 'border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Area glow */}
      <div
        ref={cursorGlowRef}
        className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-[1] opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, rgba(45,106,79,0.4) 0%, transparent 70%)',
          willChange: 'transform',
          transition: 'transform 0.15s ease-out',
        }}
      />

      {/* Trail canvas */}
      <canvas
        ref={trailCanvasRef}
        className="fixed inset-0 z-[9997] pointer-events-none"
      />
    </>
  );
};

export default CustomCursor;
