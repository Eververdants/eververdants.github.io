import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { WorkDetail } from "./components/WorkDetail";
import { getWork } from "./data/works";

type Route = { name: "gallery" } | { name: "work"; slug: string };

const parseHash = (): Route => {
  const h = window.location.hash.replace(/^#/, "");
  const m = h.match(/^\/work\/([\w-]+)$/);
  return m ? { name: "work", slug: m[1] } : { name: "gallery" };
};

export function App() {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const apply = () => {
      const r = parseHash();
      if (r.name === "work" && !getWork(r.slug)) {
        // Bad slug — silently snap back to the gallery without a history entry.
        history.replaceState(null, "", "#/");
        setRoute({ name: "gallery" });
      } else {
        setRoute(r);
      }
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    apply(); // validate the initial route (e.g. a stale deep link)
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  return (
    <div className="shell">
      <Header />
      <hr className="hairline" />
      <main style={{ minHeight: "70vh" }}>
        {route.name === "gallery"
          ? <Gallery />
          : <WorkDetail slug={route.slug} />}
      </main>
      <Footer />
    </div>
  );
}
