import { createRoot } from "react-dom/client";
import { initPrefs } from "../shared/prefs";
import { initFx, registerEntryBoot } from "../shared/fx";
import { initSmoothScroll } from "../shared/smooth";
import BlogApp from "./BlogApp";
import "../styles/global.css";
import "./blog.css";

initPrefs();
initFx();
initSmoothScroll();

/* Re-entrant mount: the iris router swaps this document's body for
   another entry's and then asks for the arriving entry's handle by
   name. The top-level call below covers the first visit — either a
   real page load or a dynamic import after a swap (in both cases the
   container is already the one this entry should own). */
const mount = () => {
  createRoot(document.getElementById("root")!).render(<BlogApp />);
};
registerEntryBoot("/blog/", mount);
mount();
