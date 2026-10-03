import { createRoot } from "react-dom/client";
import { initPrefs } from "../shared/prefs";
import { defineTopBar } from "../shared/topbar";
import { definePalette } from "../shared/palette";
import { initFx } from "../shared/fx";
import { initSmoothScroll } from "../shared/smooth";
import App from "./App";
import "./about.css";

initPrefs();
defineTopBar();
definePalette();
initFx();
initSmoothScroll();

createRoot(document.getElementById("root")!).render(<App />);
