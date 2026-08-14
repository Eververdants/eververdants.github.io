import { useEffect } from 'react';
import Background from './components/Background';
import FocusBand from './components/FocusBand';
import HeroScene from './components/HeroScene';
import ResumeScene from './components/ResumeScene';
import Scrollbar from './components/Scrollbar';
import { initLanding } from './effects/landing';

export default function App() {
  useEffect(() => {
    const handle = initLanding();

    const isResume = window.location.pathname.replace(/\/+$/, "") === "/resume";
    const isResumePath = () => window.location.pathname.replace(/\/+$/, "") === "/resume";

    // Deep link: visiting /resume lands directly on the resume screen.
    let timer: number | undefined;
    let ready = !isResume;
    if (isResume) {
      timer = window.setTimeout(() => {
        const resume = document.querySelector("main section:last-of-type");
        if (resume) {
          const y = (resume as HTMLElement).offsetTop;
          if (handle.lenis) handle.lenis.scrollTo(y, { immediate: true });
          else window.scrollTo(0, y);
        }
        ready = true;
      }, 60);
    }

    // Seamless URL following: replaceState on scroll, no reload, no history spam.
    const onScroll = () => {
      if (!ready) return;
      const resume = document.querySelector("main section:last-of-type");
      if (!resume) return;
      const target = window.scrollY >= (resume as HTMLElement).offsetTop - window.innerHeight / 2 ? "/resume" : "/";
      if (isResumePath() !== (target === "/resume")) {
        history.replaceState(null, "", target);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      handle.destroy();
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <Background />
      <main className="relative">
        <HeroScene />
        <ResumeScene />
      </main>
      <FocusBand />
      <Scrollbar />
    </>
  );
}
