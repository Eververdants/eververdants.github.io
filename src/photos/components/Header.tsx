import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="site-header">
      <a className="site-mark" href="#/" aria-label="Photographs — back to gallery">
        <span>Photographs</span>
        <span className="mark-dot" aria-hidden />
        <span className="mark-name">Eververdants</span>
      </a>
      <ThemeToggle />
    </header>
  );
}
