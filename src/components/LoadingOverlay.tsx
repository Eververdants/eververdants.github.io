import { useEffect, useState } from "react";

/* The two halves of the main site ↔ blog sub-site loading cover.

   Outgoing side: the site-nav interceptor fires "site-nav-start" right before
   it navigates; this fades the 米白 cover in and holds it opaque until the
   page swaps (it never fades out here — that would reveal the old site again).

   Incoming side: the inline script in each index.html shell set
   body.nav-loading BEFORE first paint, so the fresh page is already covered
   with the same 米白 screen the moment it paints. This component only adds
   body.nav-reveal once React has mounted so the CSS transition fades the
   cover out and reveals the new site — one continuous loading feel. */
export default function LoadingOverlay() {
  const [covering, setCovering] = useState(false);

  useEffect(() => {
    if (document.body.classList.contains("nav-loading")) {
      // Let the first frame settle, then fade the static cover out.
      const t = window.setTimeout(() => {
        document.body.classList.add("nav-reveal");
        window.setTimeout(() => {
          document.body.classList.remove("nav-loading", "nav-reveal");
        }, 600);
      }, 60);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const onNav = () => setCovering(true);
    window.addEventListener("site-nav-start", onNav);
    return () => window.removeEventListener("site-nav-start", onNav);
  }, []);

  if (!covering) return null;
  return (
    <div
      className="overlay-transition overlay-cover fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4"
      aria-hidden
    >
      <span className="text-[10px] font-semibold tracking-[0.45em] text-[var(--faint)]">
        LOADING
      </span>
      <span className="relative h-[2px] w-28 overflow-hidden bg-[var(--border-faint)]">
        <span className="overlay-bar absolute inset-0 origin-left bg-[var(--accent)]" />
      </span>
    </div>
  );
}
