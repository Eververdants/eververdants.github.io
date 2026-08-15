# AWARD Section — Ceremony Redesign

Date: 2026-08-15

## Goal

Redesign the AWARDS act of the RESUME section. Current design reads as a
generic list (5-line contest-name block + compact indexed rows) — "俗套",
"闷", "挤". Target: cinematic award-ceremony mood with giant display type,
airy spacing, no crowding.

## Direction (user-approved)

- **Mood**: award-ceremony moment ("颁奖典礼时刻") — contest name as a giant
  white title card; prizes like a trophy/winners list; each prize its own
  giant display moment; ceremony feel of items being presented in sequence.
- **Prize form**: giant ranking list ("巨型名次名单") — each prize a
  full-width giant rank row led by a giant number 01/02.

## Layout — two acts under the sticky curtain

### Act 0 — curtain (unchanged)

Keep the sticky giant italic `01` (clamp(90px,20vw,320px), font-light italic,
text-stroke) + small `AWARDS` label. It stays pinned as a background curtain
behind the scroll-over content — layered depth, not a number collision
(resolve via existing z-index layering: sticky z-[1], content z-[2]).

### Act 1 — title card

Restructure the contest name from 5 lines to 3 (rhythm 2/2/2), solid white
font-medium serif, same spec as the EDUCATION school line:

```
National Youth
Communication Technology
Innovation Competition
```

- Class: `font-fraunces font-medium leading-[1.06] tracking-[-0.01em] text-white text-[clamp(25px,6.9vw,104px)]`
  (min 25px / 6.9vw, not 38px/7.5vw, so "Communication Technology" holds its
  line from ~375px up. Fraunces optical sizing makes glyph width non-linear
  in font size, so 6.9vw was tuned empirically; at the old 38px/7.5vw the
  long line wraps into a dense mobile wall.)
- Same `.line-mask` staggered rise reveal (unchanged).
- `event` stays as the ceremony subtitle: small muted line, larger top gap.

### Act 2 — giant ranking list

Two prize rows, each full-width, trophy-list style:

```
01   First Prize
     Jiangsu Provincial
────
02   Third Prize
     National Finals
```

- Hairline `border-t` separator per row (existing).
- Leading number: `font-fraunces italic text-white/20`, giant
  (`clamp(40px,6vw,96px)` class region), ghost behind the tier text.
- Tier (rank): solid white medium serif, giant
  (`clamp(32px,6.5vw,96px)` class region), title case — NOT uppercase.
  Uppercase/gradient read as cheap (see prior commits).
- Scope: small muted detail line (`text-[13px]`, #6f6f6f) under the tier,
  aligned to the tier's left edge.
- Generous vertical padding per row (`clamp(48px,10vh,96px)` class region)
  and large gap before the list — airy, not cramped.

## Motion

- Title card: existing `.line-mask` line rise (unchanged).
- Prize rows: new left-to-right curtain wipe (clip-path) per row, staggered —
  a ceremony spotlight. Add `[data-row-wipe]` elements and a GSAP block:
  clip-path `inset(0 100% 0 0)` → `inset(0 0% 0 0)`, triggered per row
  (`start: "top 92%"`, `once: true`), stagger 0.12s. Reuses the `data-wipe`
  clip-path idiom but triggers on the row itself, not the act container.

## Data change

`src/data/resume.ts` — split rank and scope into explicit fields:

```ts
// interface
results: Array<{ tier: string; scope: string }>;

// data
results: [
  { tier: "First Prize", scope: "Jiangsu Provincial" },
  { tier: "Third Prize", scope: "National Finals" },
];
```

Copy values preserved; only structure changes.

## Files touched

1. `src/data/resume.ts` — `Resume` interface + award results shape.
2. `src/components/ResumeScene.tsx` — `Awards` component: title card line
   splits, giant ranking rows, event caption spacing.
3. `src/effects/gsap.ts` — `[data-row-wipe]` curtain-wipe reveal block.

No new CSS utilities; reuse `line-mask`, `text-stroke`, existing hairline
borders. Reduced-motion path already safe (rows sit visible under
prefers-reduced-motion; GSAP block skipped).
