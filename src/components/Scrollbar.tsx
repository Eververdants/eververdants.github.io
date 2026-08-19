import { useState } from "react";

export default function Scrollbar() {
  /* Mobile uses the native scrollbar; the custom overlay strip is desktop
     chrome only (it also renders as a stray right-edge bar on touch). */
  const [coarse] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none), (pointer: coarse)").matches,
  );
  if (coarse) return null;
  return (
    <div
      id="scrollbar"
      className="group fixed right-0 top-0 bottom-0 z-50 w-[clamp(10px,0.9vw,14px)] border-l border-white/[0.07] bg-white/5 opacity-50 transition-opacity duration-200 hover:opacity-100 [&.dragging]:opacity-100"
      aria-hidden="true"
    >
      <div
        id="scrollbar-thumb"
        className="absolute left-0.5 right-0.5 top-0 rounded-full bg-white/20 transition-colors duration-200 hover:bg-white/50 group-[.dragging]:bg-white/50"
      />
    </div>
  );
}
