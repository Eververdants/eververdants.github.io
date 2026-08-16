import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Blog sub-site hero — mount entrance + scroll-hint exit.
   Self-contained: the global initGsap animates only the main site's
   [data-hero-in] and runs once at App mount; the sub-site mounts later, so
   it owns its own timeline, scoped to its own section. */

gsap.registerPlugin(ScrollTrigger);

export function initBlogIndex(root: HTMLElement, prefersReduced: boolean): () => void {
  const ctx = gsap.context(() => {
    if (prefersReduced) {
      // CSS hides [data-blog-in] until JS animates it; under reduced motion
      // JS never does, so unhide here (covers JS/CSS mismatch).
      gsap.set("[data-blog-in]", { autoAlpha: 1 });
      return;
    }

    // mount entrance — staggered rise + focus
    gsap.fromTo(
      "[data-blog-in]",
      { y: 18, filter: "blur(14px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out"
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
