import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const FullScreenSite = lazy(() => import('../pages/FullScreenSite'));
const Projects = lazy(() => import('../pages/Projects'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail'));
const Blog = lazy(() => import('../pages/Blog'));
const BlogArticle = lazy(() => import('../pages/BlogArticle'));
const Videos = lazy(() => import('../pages/Videos'));
const VideoDetail = lazy(() => import('../pages/VideoDetail'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<FullScreenSite />} />
      <Route element={<MainLayout />}>
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogArticle />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/video/:id" element={<VideoDetail />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
