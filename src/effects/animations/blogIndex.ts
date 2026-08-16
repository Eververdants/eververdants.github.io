import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Blog sub-site hero — mount entrance + scroll-hint exit.
   Self-contained: the global initGsap animates only the main site's
   [data-hero-in] and runs once at App mount; the sub-site mounts later, so
   it owns its own timeline, scoped to its own section.

   No filter-blur in the entrance: a filter tween froze mid-flight in this
   context (the main site's hero entrance is created synchronously at mount
   and survives, but the sub-site's later-created one stalls), leaving text
   permanently soft. The rise + fade reads the same without it. clearProps
   drops the residual transform so the text returns to native subpixel
   rendering once the entrance settles. */

gsap.registerPlugin(ScrollTrigger);

export function initBlogIndex(root: HTMLElement, prefersReduced: boolean): () => void {
  const ctx = gsap.context(() => {
    if (prefersReduced) {
      // CSS hides [data-blog-in] until JS animates it; under reduced motion
      // JS never does, so unhide here (covers JS/CSS mismatch).
      gsap.set("[data-blog-in]", { autoAlpha: 1 });
      return;
    }

    // mount entrance — staggered rise + focus. clearProps after the stagger
    // finishes (not in the vars: it missed the earlier elements under GSAP's
    // individual-transform handling), so the text settles onto native
    // subpixel rendering instead of a residual transform layer.
    gsap.fromTo(
      "[data-blog-in]",
      { y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        onComplete: () => gsap.set("[data-blog-in]", { clearProps: "transform,filter" })
      }
    );

    // scroll hint fades out over the hero's first viewport of scroll
    gsap.fromTo(
      "[data-blog-hint]",
      { opacity: 1 },
      {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-blog-hero]",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      }
    );
  }, root);

  return () => ctx.revert();
}
