import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageLoader from '../components/PageLoader';
import CursorGlow from '../components/CursorGlow';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PageLoader />
      <CursorGlow />
      <Navigation />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
