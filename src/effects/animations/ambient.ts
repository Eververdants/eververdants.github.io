import gsap from "gsap";

/* Ambient textures: the film-grain flicker that runs over everything. */

export function initFilmGrain() {
  gsap.to("[data-film-grain]", {
    backgroundPosition: "300px 300px",
    duration: 1.2,
    ease: "none",
    repeat: -1,
  });
}
