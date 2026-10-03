import { createRoot } from "react-dom/client";
import { initPrefs } from "../shared/prefs";
import { defineTopBar } from "../shared/topbar";
import { definePalette } from "../shared/palette";
import { initFx, registerEntryBoot } from "../shared/fx";
import { initSmoothScroll } from "../shared/smooth";
import App from "./App";
import "./about.css";

initPrefs();
defineTopBar();
definePalette();
initFx();
initSmoothScroll();

/* Re-entrant mount: the iris router swaps this document's body for
   another entry's and then asks for the arriving entry's handle by
   name. The top-level call below covers the first visit — either a
   real page load or a dynamic import after a swap. */
const mount = () => {
  createRoot(document.getElementById("root")!).render(<App />);
};
registerEntryBoot("/about/", mount);
mount();
