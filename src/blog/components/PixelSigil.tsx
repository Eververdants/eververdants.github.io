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

/** true = inked cell. Bit i of the hash decides column-major cell i. */
function bitmap(seed: string): boolean[][] {
  let h = hash32(seed);
  const grid: boolean[][] = [];
  for (let x = 0; x < HALF; x++) {
    grid[x] = [];
    for (let y = 0; y < CELLS; y++) {
      const bit = h & 1;
      h >>>= 1;
      /* ~45% fill. A sparse grid reads as noise, a dense one as a blob;
         this is the range where it reads as a mark. */
      grid[x][y] = bit === 1 && (h & 3) !== 0;
      h >>>= 2;
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
