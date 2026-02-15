import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Projects from './components/Projects';
import ProjectDetailPage from './components/ProjectDetailPage';
import Photography from './components/Photography';
import Calligraphy from './components/Calligraphy';
import Blog from './components/Blog';
import Footer from './components/Footer';
import { LanguageProvider } from './contexts/LanguageContext';

type ViewState = 'home' | 'projects' | 'project-detail' | 'photography' | 'calligraphy' | 'blog';
type ProjectDetailSource = 'home' | 'projects';
type NavigateDetail =
  | ViewState
  | {
      view: ViewState;
      hash?: string;
      projectId?: string;
      from?: ProjectDetailSource;
    };
const VALID_VIEWS: ViewState[] = ['home', 'projects', 'project-detail', 'photography', 'calligraphy', 'blog'];

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [projectDetailId, setProjectDetailId] = useState<string | null>(null);
  const [projectDetailSource, setProjectDetailSource] = useState<ProjectDetailSource>('projects');

  const handleNavigate = (view: ViewState, hash?: string) => {
    if (view !== 'project-detail') {
      setProjectDetailId(null);
    }
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

  const navigateToProjectDetail = (projectId: string, from: ProjectDetailSource = 'projects') => {
    setProjectDetailId(projectId);
    setProjectDetailSource(from);
    setCurrentView('project-detail');
    window.scrollTo(0, 0);
  };

  useEffect(() => {
      // Listen for custom navigation events
      const handleCustomNav = (e: Event) => {
          const detail = (e as CustomEvent<NavigateDetail>).detail;

          if (typeof detail === 'string' && VALID_VIEWS.includes(detail as ViewState)) {
              handleNavigate(detail as ViewState);
              return;
          }

          if (detail && typeof detail === 'object' && VALID_VIEWS.includes(detail.view)) {
              if (detail.view === 'project-detail') {
                  if (detail.projectId) {
                    navigateToProjectDetail(detail.projectId, detail.from || 'projects');
                  } else {
                    handleNavigate('projects');
                  }
                  return;
              }

              handleNavigate(detail.view, detail.hash);
          }
      };
      window.addEventListener('navigate-to', handleCustomNav);
      return () => window.removeEventListener('navigate-to', handleCustomNav);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'projects':
        return <Projects />;
      case 'project-detail':
        if (!projectDetailId) {
          return <Projects />;
        }
        return (
          <ProjectDetailPage
            projectId={projectDetailId}
            onBack={() => {
              if (projectDetailSource === 'home') {
                handleNavigate('home', '#featured-projects');
                return;
              }
              handleNavigate('projects');
            }}
          />
        );
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
        {currentView !== 'project-detail' && (
          <Navigation currentView={currentView} onNavigate={handleNavigate} />
        )}
        
        <main className="flex-grow">
          {renderView()}
        </main>
        
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;
