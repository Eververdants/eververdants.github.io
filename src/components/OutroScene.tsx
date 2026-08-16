/* Dissolving finale — the site ends by emptying out.

   Three stages dissolve into each other as the user keeps scrolling past the
   journal: three big lines, then a tiny name, then one quiet sentence and a
   faint ↗ back to the top. The solid black layer covers the fixed ambient
   canvas, so the finale lands on clean black. gsap scrubs it (outro.ts);
   reduced motion collapses straight to the last state in CSS. */

export default function OutroScene() {
  return (
    <section className="relative h-screen overflow-hidden" data-outro>
      {/* Clean-black layer: fades in over the ambient fluid so the end of the
          site is quiet. Sits above the fixed background (later in the DOM). */}
      <div className="absolute inset-0 bg-[#050505]" data-outro-black aria-hidden="true" />

      <div className="relative z-10 grid h-full place-items-center px-[clamp(16px,3vw,32px)] text-center">
        {/* Stage 1 — the richest moment: three Fraunces italic lines. */}
        <div
          className="flex flex-col items-center gap-[clamp(4px,1vh,10px)]"
          data-outro-stage1
        >
          <p
            className="font-fraunces italic leading-[1.08] tracking-[-0.01em] text-white text-[clamp(30px,5.6vw,80px)]"
            data-outro-line
          >
            Things I&rsquo;ve made.
          </p>
          <p
            className="font-fraunces italic leading-[1.08] tracking-[-0.01em] text-white text-[clamp(30px,5.6vw,80px)]"
            data-outro-line
          >
            Things I&rsquo;ve seen.
          </p>
          <p
            className="font-fraunces italic leading-[1.08] tracking-[-0.01em] text-white text-[clamp(30px,5.6vw,80px)]"
            data-outro-line
          >
            Things I&rsquo;m still figuring out.
          </p>
        </div>

        {/* Stage 2 — a very small name. */}
        <p
          className="font-fraunces text-[clamp(13px,1.5vw,18px)] tracking-[0.42em] indent-[0.42em] text-white/45"
          data-outro-name
        >
          Eververdants
        </p>

        {/* Stage 3 — one sentence, and a light ↗ home. */}
        <div className="flex flex-col items-center gap-[clamp(22px,4vh,42px)]">
          <p
            className="font-fraunces italic leading-[1.2] text-white/85 text-[clamp(19px,3vw,42px)]"
            data-outro-end
          >
            The story continues elsewhere.
          </p>
          <button
            type="button"
            className="text-[clamp(15px,1.7vw,20px)] leading-none text-white/30 transition-colors duration-300 hover:text-white/75"
            data-outro-home
            aria-label="Back to top"
          >
            ↗
          </button>
        </div>
      </div>
    </section>
  );
}
