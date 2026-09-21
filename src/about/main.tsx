import { createRoot } from "react-dom/client";
import { initPrefs } from "../shared/prefs";
import { defineTopBar } from "../shared/topbar";
import { definePalette } from "../shared/palette";
import App from "./App";
import "./about.css";

initPrefs();
defineTopBar();
definePalette();

createRoot(document.getElementById("root")!).render(<App />);
