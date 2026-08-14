import { useEffect } from 'react';
import Background from './components/Background';
import HeroScene from './components/HeroScene';
import ResumeScene from './components/ResumeScene';
import Scrollbar from './components/Scrollbar';
import { initLanding } from './effects/landing';

export default function App() {
  useEffect(() => {
    const destroy = initLanding();
    return destroy;
  }, []);

  return (
    <>
      <Background />
      <main className="relative z-[1]">
        <HeroScene />
        <ResumeScene />
      </main>
      <Scrollbar />
    </>
  );
}
