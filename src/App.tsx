import { useEffect } from 'react';
import Background from './components/Background';
import FocusBand from './components/FocusBand';
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
      <main className="relative">
        <HeroScene />
        <ResumeScene />
      </main>
      <FocusBand />
      <Scrollbar />
    </>
  );
}
