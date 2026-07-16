import React, { useRef, useEffect, useCallback } from 'react';

const HeroBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0 });
  const lastMouse = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const prev = mouseRef.current;
    mouseRef.current = {
      x: e.clientX,
      y: e.clientY,
      vx: e.clientX - lastMouse.current.x,
      vy: e.clientY - lastMouse.current.y,
    };
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999, vx: 0, vy: 0 };
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

    const PARTICLE_COUNT = 140;
    const CONNECTION_DIST = 160;
    const MOUSE_RADIUS = 220;
    const TRAIL_LENGTH = 8;
    const isDark = document.documentElement.classList.contains('dark');

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      baseOpacity: number;
      phase: number;
      trail: { x: number; y: number }[];
    }

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 2 + 0.5,
      baseOpacity: Math.random() * 0.35 + 0.2,
      phase: Math.random() * Math.PI * 2,
      trail: [],
    }));

    // Create larger "star" particles for visual interest
    const STARS_COUNT = 6;
    const stars: { x: number; y: number; size: number; phase: number; vx: number; vy: number }[] =
      Array.from({ length: STARS_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 3 + 2,
        phase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
      }));

    let time = 0;

    const draw = () => {
      time += 0.004;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mvx = mouseRef.current.vx;
      const mvy = mouseRef.current.vy;
      const mouseActive = mx > 0 && my > 0;
      const mouseSpeed = Math.sqrt(mvx * mvx + mvy * mvy);

      // ── Update & draw particles ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Subtle wave motion
        p.vx += Math.sin(time + p.phase) * 0.001;
        p.vy += Math.cos(time * 0.7 + p.phase) * 0.0008;

        // Clamp velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.4) {
          p.vx = (p.vx / speed) * 0.4;
          p.vy = (p.vy / speed) * 0.4;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around with margin
        const margin = 40;
        if (p.x < -margin) p.x = w + margin;
        if (p.x > w + margin) p.x = -margin;
        if (p.y < -margin) p.y = h + margin;
        if (p.y > h + margin) p.y = -margin;

        // Mouse interaction — push + velocity influence
        if (mouseActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * 0.08;
            const pushX = (dx / dist) * force * 60;
            const pushY = (dy / dist) * force * 60;
            p.x += pushX;
            p.y += pushY;
            // Add mouse velocity influence — particles "flow" around cursor
            p.vx += mvx * force * 0.02;
            p.vy += mvy * force * 0.02;
          }
        }

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift();

        // Draw trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = isDark
            ? `rgba(200, 195, 190, ${0.03 * mouseSpeed * 0.1})`
            : `rgba(120, 115, 110, ${0.03 * mouseSpeed * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Draw particle with pulse
        const pulse = Math.sin(time * 1.5 + p.phase) * 0.15 + 0.85;
        const particleOpacity = p.baseOpacity * pulse;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(200, 195, 190, ${particleOpacity})`
          : `rgba(120, 115, 110, ${particleOpacity})`;
        ctx.fill();

        // Glow on larger particles
        if (p.size > 1.5) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          glow.addColorStop(0, isDark
            ? `rgba(200, 195, 190, ${p.baseOpacity * 0.08})`
            : `rgba(120, 115, 110, ${p.baseOpacity * 0.06})`);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Star particles (brighter, slow-moving) ──
      for (const s of stars) {
        s.x += s.vx + Math.sin(time * 0.3 + s.phase) * 0.05;
        s.y += s.vy + Math.cos(time * 0.2 + s.phase) * 0.04;
        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
        if (s.y < -20) s.y = h + 20;
        if (s.y > h + 20) s.y = -20;

        const pulse = Math.sin(time + s.phase) * 0.2 + 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(217, 161, 48, ${0.4 * pulse})`
          : `rgba(217, 161, 48, ${0.25 * pulse})`;
        ctx.fill();

        // Star glow
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 6);
        glow.addColorStop(0, isDark
          ? `rgba(217, 161, 48, 0.06)`
          : `rgba(217, 161, 48, 0.04)`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Connections ──
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            // Connection opacity fades with distance + pulses with mouse
            const baseAlpha = (1 - dist / CONNECTION_DIST) * 0.12;
            const mouseBoost = mouseActive
              ? Math.max(0, 1 - Math.sqrt(
                  ((particles[i].x + particles[j].x) / 2 - mx) ** 2 +
                  ((particles[i].y + particles[j].y) / 2 - my) ** 2
                ) / MOUSE_RADIUS) * 0.08
              : 0;
            const alpha = baseAlpha + mouseBoost * mouseSpeed * 0.02;

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(200, 195, 190, ${Math.min(alpha, 0.3)})`
              : `rgba(120, 115, 110, ${Math.min(alpha, 0.2)})`;
            ctx.stroke();
          }
        }
      }

      // ── Mouse glow ──
      if (mouseActive) {
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS);
        glow.addColorStop(0, 'rgba(217, 161, 48, 0.02)');
        glow.addColorStop(0.4, 'rgba(217, 161, 48, 0.01)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // Secondary glow — warmer, smaller
        if (mouseSpeed > 1) {
          const speedGlow = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS * 0.4);
          speedGlow.addColorStop(0, `rgba(217, 161, 48, ${Math.min(mouseSpeed * 0.003, 0.03)})`);
          speedGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = speedGlow;
          ctx.fillRect(0, 0, w, h);
        }
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
