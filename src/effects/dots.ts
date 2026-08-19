/* 2D dot-grid background — migrated from Astro src/scripts/landing.js. */

interface Dot {
  restX: number;
  restY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function initDots(
  canvas: HTMLCanvasElement,
  prefersReduced: boolean,
): (() => void) | null {
  if (!canvas) return null;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches)
    return null;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const c2d: CanvasRenderingContext2D = ctx;

  const LINE_COLOR = "rgba(255, 255, 255,";
  const DOT_COLOR = "rgba(255, 255, 255,";
  const LINE_OPACITY = 0.08;
  const DOT_OPACITY = 0.16;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let dots: Dot[] = [];
  let cols = 0;
  let rows = 0;
  let w = 0;
  let h = 0;
  let rafId = 0;
  let last = 0;
  const THROTTLE = 1000 / 30;
  let resizeTimer: number | undefined;
  let still = true;
  const mouse = { x: NaN, y: NaN };

  function build() {
    cols = Math.ceil(w / 90) + 1;
    rows = Math.ceil(h / 90) + 1;
    const offX = (w - (cols - 1) * 90) / 2;
    const offY = (h - (rows - 1) * 90) / 2;
    dots = [];
    for (let n = 0; n < rows; n++) {
      for (let r = 0; r < cols; r++) {
        const x = offX + 90 * r;
        const y = offY + 90 * n;
        dots.push({ restX: x, restY: y, x, y, vx: 0, vy: 0 });
      }
    }
  }

  function size() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  size();

  function wake() {
    if (still) {
      still = false;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    }
  }

  function onMouse(e: MouseEvent) {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    wake();
  }

  window.addEventListener("mousemove", onMouse);

  function onResize() {
    const cw = canvas.clientWidth;
    if (cw > 0 && cw !== w) {
      size();
      wake();
    }
  }

  window.addEventListener("resize", onResize);

  function draw(now: number): "skip" | "stop" | "go" {
    if (now - last < THROTTLE) return "skip";
    last = now - ((now - last) % THROTTLE);

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw !== w || ch !== h) {
      w = cw;
      h = ch;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (resizeTimer !== undefined) clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    }

    c2d.clearRect(0, 0, w, h);

    const mx = mouse.x;
    const my = mouse.y;
    let maxVel = 0;

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const dx = d.x - mx;
      const dy = d.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140 && dist > 0.1) {
        const f = (1 - dist / 140) * 30;
        const ux = dx / dist;
        const uy = dy / dist;
        d.vx += ux * f * 0.1;
        d.vy += uy * f * 0.1;
      }
      const rx = d.restX - d.x;
      const ry = d.restY - d.y;
      d.vx += 0.05 * rx;
      d.vy += 0.05 * ry;
      d.vx *= 0.85;
      d.vy *= 0.85;
      d.x += d.vx;
      d.y += d.vy;
      const vel = Math.abs(d.vx) + Math.abs(d.vy);
      if (vel > maxVel) maxVel = vel;
    }

    c2d.strokeStyle = LINE_COLOR + " " + LINE_OPACITY + ")";
    c2d.lineWidth = 0.5;

    for (let n = 0; n < rows; n++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = dots[n * cols + c];
        const b = dots[n * cols + c + 1];
        const ox = b.x - a.x;
        const oy = b.y - a.y;
        const l = Math.sqrt(ox * ox + oy * oy);
        if (l < 20) continue;
        const ux2 = ox / l;
        const uy2 = oy / l;
        c2d.beginPath();
        c2d.moveTo(a.x + 10 * ux2, a.y + 10 * uy2);
        c2d.lineTo(b.x - 10 * ux2, b.y - 10 * uy2);
        c2d.stroke();
      }
    }
    for (let c2 = 0; c2 < cols; c2++) {
      for (let n2 = 0; n2 < rows - 1; n2++) {
        const a2 = dots[n2 * cols + c2];
        const b2 = dots[(n2 + 1) * cols + c2];
        const ox2 = b2.x - a2.x;
        const oy2 = b2.y - a2.y;
        const l2 = Math.sqrt(ox2 * ox2 + oy2 * oy2);
        if (l2 < 20) continue;
        const ux3 = ox2 / l2;
        const uy3 = oy2 / l2;
        c2d.beginPath();
        c2d.moveTo(a2.x + 10 * ux3, a2.y + 10 * uy3);
        c2d.lineTo(b2.x - 10 * ux3, b2.y - 10 * uy3);
        c2d.stroke();
      }
    }

    c2d.fillStyle = DOT_COLOR + " " + DOT_OPACITY + ")";
    for (let i2 = 0; i2 < dots.length; i2++) {
      const d2 = dots[i2];
      let r2 = 1.8;
      let a3 = DOT_OPACITY;
      if (!isNaN(mx) && !isNaN(my)) {
        const dx2 = d2.x - mx;
        const dy2 = d2.y - my;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        const f2 = Math.max(0, 1 - dist2 / 140);
        r2 = 1.8 + 2 * f2;
        a3 = DOT_OPACITY + 0.4 * f2;
      }
      c2d.globalAlpha = a3;
      const s = 2 * r2;
      c2d.fillRect(d2.x - r2, d2.y - r2, s, s);
    }
    c2d.globalAlpha = 1;

    return maxVel < 0.01 ? "stop" : "go";
  }

  function tick(now: number) {
    const s = draw(now);
    if (s === "stop") {
      still = true;
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  if (prefersReduced) {
    draw(performance.now() + 1);
  } else {
    rafId = requestAnimationFrame(tick);
  }

  return function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    if (resizeTimer !== undefined) clearTimeout(resizeTimer);
    window.removeEventListener("mousemove", onMouse);
    window.removeEventListener("resize", onResize);
  };
}
