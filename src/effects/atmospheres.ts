/* Per-screen background atmospheres.

   The fluid's palette, light, and glow are keyframed across the page instead
   of one cyan→orange sweep: each section owns a tint, so the backdrop shifts
   hero → resume → works → journal → outro as the user scrolls. Stops are
   anchored to DOM sections and re-measured in fluid.ts (fonts.ready / resize
   / load), because the handscroll sets its height late. */

export interface Atmosphere {
  /* 5-stop color ramp: dark → mid → bright → mid → dark. */
  colors: string[];
  /* 3 glow stops: bright → mid → deep. */
  glowColors: string[];
  lightX: number;
  lightY: number;
  lightCore: number;
  lightHalo: number;
  glowIntensity: number;
  bloomStrength: number;
  vignette: number;
}

export interface AtmosphereStop {
  /* Element selector; "" anchors to the page top (y = 0). */
  sel: string;
  anchor: "top" | "center" | "bottom";
  atmosphere: Atmosphere;
}

/* Site tint identity: cyan (hero) → deeper teal (resume) → sand-orange
   (works, the 国风流沙 tone) → warm amber (journal) → near-black (outro). */
export const ATMOSPHERE_STOPS: AtmosphereStop[] = [
  {
    sel: "",
    anchor: "top",
    atmosphere: {
      colors: ["#000000", "#0b3a45", "#10AEC2", "#7adfe8", "#000000"],
      glowColors: ["#c9f6ff", "#10AEC2", "#0a6a75"],
      lightX: 0.89,
      lightY: 0.46,
      lightCore: 0.14,
      lightHalo: 0.2,
      glowIntensity: 0.06,
      bloomStrength: 0.4,
      vignette: 0.38,
    },
  },
  {
    sel: "[data-masthead]",
    anchor: "center",
    atmosphere: {
      /* Deeper, more saturated teal — the resume reads cooler than the hero. */
      colors: ["#000000", "#06282f", "#0a8296", "#4fd4e4", "#000000"],
      glowColors: ["#bfeef6", "#0a8fa3", "#07505b"],
      lightX: 0.85,
      lightY: 0.4,
      lightCore: 0.1,
      lightHalo: 0.16,
      glowIntensity: 0.05,
      bloomStrength: 0.32,
      vignette: 0.4,
    },
  },
  {
    sel: "[data-works]",
    anchor: "top",
    atmosphere: {
      colors: ["#000000", "#331d00", "#c97f1e", "#d69a55", "#000000"],
      glowColors: ["#e0b070", "#b06a12", "#4a2b00"],
      lightX: 0.82,
      lightY: 0.5,
      lightCore: 0.09,
      lightHalo: 0.14,
      glowIntensity: 0.05,
      bloomStrength: 0.28,
      vignette: 0.42,
    },
  },
  {
    sel: "[data-blog]",
    anchor: "top",
    atmosphere: {
      /* Editorial warm amber — a touch redder and brighter than the works. */
      colors: ["#000000", "#3a1e05", "#d98a2a", "#f0b877", "#000000"],
      glowColors: ["#f4cf9a", "#e08a1e", "#5a3506"],
      lightX: 0.87,
      lightY: 0.42,
      lightCore: 0.11,
      lightHalo: 0.17,
      glowIntensity: 0.055,
      bloomStrength: 0.34,
      vignette: 0.4,
    },
  },
  {
    sel: "[data-outro]",
    anchor: "top",
    atmosphere: {
      /* Quiet near-black — the finale empties out before the black cover. */
      colors: ["#000000", "#0a0a0a", "#121212", "#1a1510", "#000000"],
      glowColors: ["#1c1815", "#0a0a0a", "#000000"],
      lightX: 0.5,
      lightY: 0.5,
      lightCore: 0.02,
      lightHalo: 0.04,
      glowIntensity: 0.02,
      bloomStrength: 0.08,
      vignette: 0.55,
    },
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const to = (v: number) =>
    Math.round(Math.max(0, Math.min(1, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function lerpHex(a: string, b: string, t: number): string {
  return rgbToHex(mixRgb(hexToRgb(a), hexToRgb(b), t));
}

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function lerpAtmosphere(a: Atmosphere, b: Atmosphere, t: number): Atmosphere {
  return {
    colors: a.colors.map((c, i) =>
      lerpHex(c, b.colors[i] ?? b.colors[b.colors.length - 1], t),
    ),
    glowColors: a.glowColors.map((c, i) =>
      lerpHex(c, b.glowColors[i] ?? b.glowColors[b.glowColors.length - 1], t),
    ),
    lightX: a.lightX + (b.lightX - a.lightX) * t,
    lightY: a.lightY + (b.lightY - a.lightY) * t,
    lightCore: a.lightCore + (b.lightCore - a.lightCore) * t,
    lightHalo: a.lightHalo + (b.lightHalo - a.lightHalo) * t,
    glowIntensity: a.glowIntensity + (b.glowIntensity - a.glowIntensity) * t,
    bloomStrength: a.bloomStrength + (b.bloomStrength - a.bloomStrength) * t,
    vignette: a.vignette + (b.vignette - a.vignette) * t,
  };
}

/* Interpolate the atmosphere at a document-Y position. `stops` is the
   measured, Y-sorted keyframe list from fluid.ts. */
export function sampleAtmosphere(
  stops: { y: number; atmosphere: Atmosphere }[],
  y: number,
): Atmosphere {
  if (!stops.length) return ATMOSPHERE_STOPS[0].atmosphere;
  if (y <= stops[0].y) return stops[0].atmosphere;
  const last = stops[stops.length - 1];
  if (y >= last.y) return last.atmosphere;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (y >= a.y && y <= b.y) {
      const span = b.y - a.y;
      const t = span > 0 ? smoothstep((y - a.y) / span) : 1;
      return lerpAtmosphere(a.atmosphere, b.atmosphere, t);
    }
  }
  return last.atmosphere;
}
