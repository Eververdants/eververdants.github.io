import React, { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './contexts/LanguageContext';
import AppRoutes from './routes';

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-ink">
    <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-warm-50 dark:bg-ink text-ink dark:text-warm-50 selection:bg-forest-500/20 selection:text-forest-700 dark:selection:bg-forest-500/30 dark:selection:text-warm-50">
          <Suspense fallback={<LoadingFallback />}>
            <AppRoutes />
          </Suspense>
        </div>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
