import React from 'react';
import Hero from './Hero';
import FeaturedProjects from './FeaturedProjects';
import FeaturedPhotography from './FeaturedPhotography';
import FeaturedCalligraphy from './FeaturedCalligraphy';
import FeaturedBlog from './FeaturedBlog';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <div className="bg-slate-50/50 dark:bg-black/20">
        <FeaturedPhotography />
      </div>
      <FeaturedCalligraphy />
      <div className="bg-slate-50/50 dark:bg-black/20">
        <FeaturedBlog />
      </div>
    </>
  );
};

export default Home;