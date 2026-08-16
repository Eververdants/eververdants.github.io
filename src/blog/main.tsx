import { createRoot } from "react-dom/client";
import BlogApp from "./BlogApp";
import "../styles/global.css";

createRoot(document.getElementById("root")!).render(<BlogApp />);
