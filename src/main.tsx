import { createRoot } from "react-dom/client";
import { initPrefs } from "./shared/prefs";
import { defineTopBar } from "./shared/topbar";
import { definePalette } from "./shared/palette";
import { initFx } from "./shared/fx";
import { initSmoothScroll } from "./shared/smooth";
import App from "./hub/App";
import "./hub/hub.css";

/* The inline script in the shared <head> already set the theme and language
   attributes before first paint; initPrefs only reads them back into the
   store the components subscribe to. initFx wires the motion layer (a
   no-op for reduced-motion readers).

   Smooth scrolling starts AFTER the motion layer and after React's own
   first paint is scheduled: it must not be the thing that delays LCP,
   and it must not run before the document has its real height. */
initPrefs();
defineTopBar();
definePalette();
initFx();
initSmoothScroll();

createRoot(document.getElementById("root")!).render(<App />);
