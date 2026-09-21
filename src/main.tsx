import { createRoot } from "react-dom/client";
import { initPrefs } from "./shared/prefs";
import { defineTopBar } from "./shared/topbar";
import App from "./hub/App";
import "./hub/hub.css";

/* The inline script in the shared <head> already set the theme and language
   attributes before first paint; initPrefs only reads them back into the
   store the components subscribe to. */
initPrefs();
defineTopBar();

createRoot(document.getElementById("root")!).render(<App />);
