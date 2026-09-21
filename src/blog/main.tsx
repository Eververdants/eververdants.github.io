import { createRoot } from "react-dom/client";
import { initPrefs } from "../shared/prefs";
import BlogApp from "./BlogApp";
import "../styles/global.css";
import "./blog.css";

initPrefs();

createRoot(document.getElementById("root")!).render(<BlogApp />);
