import { createRoot } from "react-dom/client";
import { initPrefs } from "../shared/prefs";
import { defineTopBar } from "../shared/topbar";
import { definePalette } from "../shared/palette";
import { App } from "./App";
import "./styles/global.css";

/* Theme + language before first paint (the inline script in photos/index.html
   has already guessed; this confirms it), then the shared navigation bar. */
initPrefs();
defineTopBar();
definePalette();

createRoot(document.getElementById("root")!).render(<App />);
