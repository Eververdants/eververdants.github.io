import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Projects from './components/Projects';
import Photography from './components/Photography';
import Calligraphy from './components/Calligraphy';
import Blog from './components/Blog';
import Footer from './components/Footer';
import { LanguageProvider } from './contexts/LanguageContext';

type ViewState = 'home' | 'projects' | 'photography' | 'calligraphy' | 'blog';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');

  const handleNavigate = (view: ViewState, hash?: string) => {
    setCurrentView(view);
    
    // Handle scrolling
    if (view === 'home' && hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
      // Listen for custom navigation events
      const handleCustomNav = (e: any) => {
          // Allow navigation to any valid view
          if (['home', 'projects', 'photography', 'calligraphy', 'blog'].includes(e.detail)) {
              handleNavigate(e.detail as ViewState);
          }
      };
      window.addEventListener('navigate-to', handleCustomNav);
      return () => window.removeEventListener('navigate-to', handleCustomNav);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'projects':
        return <Projects />;
      case 'photography':
        return <Photography />;
      case 'calligraphy':
        return <Calligraphy />;
      case 'blog':
        return <Blog />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen relative selection:bg-emerald-300 selection:text-emerald-900 dark:selection:bg-emerald-700 dark:selection:text-white flex flex-col">
        <Navigation currentView={currentView} onNavigate={handleNavigate} />
        
        <main className="flex-grow">
          {renderView()}
        </main>
        
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;