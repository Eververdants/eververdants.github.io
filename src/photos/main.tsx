import { createRoot } from "react-dom/client";
import { initPrefs } from "../shared/prefs";
import { defineTopBar } from "../shared/topbar";
import { App } from "./App";
import "./styles/global.css";

/* Theme + language before first paint (the inline script in photos/index.html
   has already guessed; this confirms it), then the shared navigation bar. */
initPrefs();
defineTopBar();

createRoot(document.getElementById("root")!).render(<App />);
