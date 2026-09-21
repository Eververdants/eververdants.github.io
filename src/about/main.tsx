import { createRoot } from "react-dom/client";
import { initPrefs } from "../shared/prefs";
import { defineTopBar } from "../shared/topbar";
import App from "./App";
import "./about.css";

initPrefs();
defineTopBar();

createRoot(document.getElementById("root")!).render(<App />);
