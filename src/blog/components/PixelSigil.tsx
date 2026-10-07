/* A per-post pixel sigil — the essay's cover.
 *
 * There are no cover photographs on this blog, and inventing stock art
 * for eight essays would be worse than having none. So each post gets a
 * mark generated from its own slug: a 5×5 bitmap with mirror symmetry,
 * hashed deterministically so the same essay always carries the same
 * sigil on every visit, in every language, in the prerendered HTML and
 * in the live DOM alike.
 *
 * Why a sigil rather than a gradient or an initial: it is the only cover
 * the site's own visual language can produce. Square cells, two colours,
 * no curves — the same vocabulary as the notched corners and the dither
 * ground. And it costs nothing: thirty bytes of markup, no request, no
 * layout shift, and it scales to any size without a second asset.
 *
 * Decorative by definition — the title and the date are right beside it
 * and say the same thing in words. */

import type { ReactElement } from "react";

const CELLS = 5;
/** Columns taken from the hash; the rest are mirrored. */
const HALF = Math.ceil(CELLS / 2);

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* FNV-1a barely avalanches into its low bits, and bitmap() reads only three
   of them. Without this finalizer the cells of similar slugs agree with each
   other and 5,000 distinct slugs collapse into 8 distinct marks. */
function avalanche(h: number): number {
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/** true = inked cell. Each cell hashes its own position, so no cell can run
 * the entropy dry for the ones after it. */
function bitmap(seed: string): boolean[][] {
  const grid: boolean[][] = [];
  for (let x = 0; x < HALF; x++) {
    grid[x] = [];
    for (let y = 0; y < CELLS; y++) {
      /* ~37% fill: the low bit gates off half the cells, and the pair above
         it a quarter of the rest. A sparse grid reads as noise, a dense one
         as a blob; this is the range where it reads as a mark. */
      const h = avalanche(hash32(`${seed}:${x}:${y}`));
      grid[x][y] = (h & 1) === 1 && (h & 6) !== 0;
    }
  }
  /* Mirror the left half onto the right — symmetry is what makes it read
     as a designed mark rather than as static. */
  for (let x = HALF; x < CELLS; x++) {
    grid[x] = grid[CELLS - 1 - x];
  }
  return grid;
}

export default function PixelSigil({
  seed,
  className = "",
}: {
  seed: string;
  className?: string;
}) {
  const grid = bitmap(seed);
  const rects: ReactElement[] = [];
  for (let x = 0; x < CELLS; x++) {
    for (let y = 0; y < CELLS; y++) {
      if (!grid[x][y]) continue;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={(x + y) % 3 === 0 ? "var(--accent)" : "var(--accent-2)"}
          opacity={(x + y) % 3 === 0 ? 1 : 0.75}
        />,
      );
    }
  }
  return (
    <svg
      viewBox={`0 0 ${CELLS} ${CELLS}`}
      width={CELLS * 8}
      height={CELLS * 8}
      /* shape-rendering is the whole point: without it a 1×1 cell scaled
         ×8 gets antialiased into a grey blur, and the sigil stops being
         pixel art. */
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {rects}
    </svg>
  );
}
