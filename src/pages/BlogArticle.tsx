import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarBlank, Clock, User, CaretLeft, BookOpen } from '@phosphor-icons/react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useLanguage } from '../contexts/LanguageContext';
import { getBlogPosts } from '../data';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const BlogArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const posts = getBlogPosts(language);
  const post = posts.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-[100dvh] pt-28 pb-20 flex items-center justify-center">
        <motion.div
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <BookOpen size={48} className="mx-auto text-warm-400 mb-4" />
          <h2 className="text-2xl font-bold text-ink mb-4">{t('common.noData')}</h2>
          <p className="text-warm-400 mb-8">{t('common.noDataDesc')}</p>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-forest-500 text-white font-semibold hover:bg-forest-600 transition-colors active:scale-[0.98]"
          >
            <CaretLeft size={18} />
            {t('sections.blog.back')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-[100dvh] pt-28 pb-20"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      {post.imageUrl && (
        <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <motion.article
          className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-warm-200"
          variants={fadeUp}
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-warm-100 text-ink/60"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-ink font-display mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-warm-400 mb-8 pb-6 border-b border-warm-200">
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlank size={15} />
              {post.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={15} />
              {post.readTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User size={15} />
              {t('sections.blog.by')} Eververdants
            </span>
          </div>

          <div className="mb-10">
            <MarkdownRenderer content={post.content} />
          </div>

          <div className="pt-6 border-t border-warm-200">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-warm-100 text-ink/60"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-forest-500 hover:text-forest-600 transition-colors active:scale-[0.98]"
            >
              <CaretLeft size={16} />
              {t('sections.blog.back')}
            </button>
          </div>
        </motion.article>
      </div>
    </motion.div>
  );
};

export default BlogArticle;
