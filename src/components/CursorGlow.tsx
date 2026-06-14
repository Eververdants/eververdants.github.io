import React, { useEffect, useRef } from 'react';

const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only show on desktop
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (glowRef.current) {
        glowRef.current.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      if (glowRef.current) {
        glowRef.current.style.opacity = '0';
      }
    };

    let animId: number;
    const animate = () => {
      glowPos.current.x += (mouseRef.current.x - glowPos.current.x) * 0.08;
      glowPos.current.y += (mouseRef.current.y - glowPos.current.y) * 0.08;

      if (glowRef.current) {
        glowRef.current.style.left = `${glowPos.current.x}px`;
        glowRef.current.style.top = `${glowPos.current.y}px`;
      }
      animId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    animId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed w-[300px] h-[300px] rounded-full pointer-events-none z-[9999] opacity-0 transition-opacity duration-300 hidden md:block"
      style={{
        background: 'radial-gradient(circle, rgba(10,10,10,0.03) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};

export default CursorGlow;
