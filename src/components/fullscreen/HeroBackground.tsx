import React, { useRef, useEffect, useCallback } from 'react';

const HeroBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    const PARTICLE_COUNT = 100;
    const CONNECTION_DIST = 150;
    const MOUSE_RADIUS = 180;
    const isDark = document.documentElement.classList.contains('dark');

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      opacity: number;
      phase: number;
    }

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mx > 0 && my > 0;

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.x += Math.sin(time + p.phase) * 0.08;
        p.y += Math.cos(time * 0.7 + p.phase) * 0.06;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        if (mouseActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * 0.06;
            p.x += (dx / dist) * force * 60;
            p.y += (dy / dist) * force * 60;
          }
        }

        const pulse = Math.sin(time * 2 + p.phase) * 0.1 + 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(200, 195, 190, ${p.opacity * pulse})`
          : `rgba(120, 115, 110, ${p.opacity * pulse})`;
        ctx.fill();
      }

      // Connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(200, 195, 190, ${alpha})`
              : `rgba(120, 115, 110, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // Mouse glow
      if (mouseActive) {
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS);
        glow.addColorStop(0, 'rgba(217, 161, 48, 0.015)');
        glow.addColorStop(0.5, 'rgba(217, 161, 48, 0.008)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 0 }}
    />
  );
};

export default HeroBackground;
