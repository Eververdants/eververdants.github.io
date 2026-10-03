import { createRoot } from "react-dom/client";
import { initPrefs } from "../shared/prefs";
import { initFx } from "../shared/fx";
import { initSmoothScroll } from "../shared/smooth";
import BlogApp from "./BlogApp";
import "../styles/global.css";
import "./blog.css";

initPrefs();
initFx();
initSmoothScroll();

createRoot(document.getElementById("root")!).render(<BlogApp />);
