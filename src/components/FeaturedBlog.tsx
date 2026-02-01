import React, { useState, useEffect } from 'react';
import { getBlogPosts } from '../services/contentService';
import { BlogPost } from '../types';
import { BookOpen, ArrowRight, Clock, ChevronLeft, Tag, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FeaturedBlog: React.FC = () => {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, t } = useLanguage();

    // Load blog posts from Cloudflare KV
    useEffect(() => {
        const loadPosts = async () => {
            try {
                setLoading(true);
                const data = await getBlogPosts(language);
                setPosts(data.slice(0, 3));
            } catch (err) {
                console.error('Failed to load blog posts:', err);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, [language]);

    const featuredPosts = posts;

    const navigateToAll = () => {
        const event = new CustomEvent('navigate-to', { detail: 'blog' });
        window.dispatchEvent(event);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedPost(null);
            setIsClosing(false);
        }, 300);
    };

    const renderContent = (content: string) => {
        return content.split('\n').map((paragraph, index) => {
            if (!paragraph.trim()) return null;
            if (paragraph.trim().startsWith('##')) {
                return <h2 key={index} className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-slate-900 dark:text-white">{paragraph.replace('##', '').trim()}</h2>;
            }
            return <p key={index} className="mb-6 text-slate-700 dark:text-slate-300 leading-8 text-lg md:text-xl font-serif">{paragraph.trim()}</p>;
        });
    };

    return (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-2xl text-teal-600 dark:text-teal-400">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('sections.blog.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {t('sections.blog.subtitle')}
                        </p>
                    </div>
                </div>

                <button
                    onClick={navigateToAll}
                    className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold group transition-colors"
                >
                    {t('sections.blog.readAll')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                    <article
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="group glass-card rounded-2xl p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full whitespace-nowrap">
                                {post.date}
                            </span>
                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                                <Clock size={12} className="mr-1" /> {post.readTime}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {post.title}
                        </h3>

                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-sm flex-grow line-clamp-3">
                            {post.excerpt}
                        </p>

                        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between mt-auto">
                            <span className="text-xs font-medium text-slate-500">
                                {post.tags[0]}
                            </span>
                            <span className="inline-flex items-center text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:underline decoration-emerald-500 decoration-2 underline-offset-4">
                                Read <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                            </span>
                        </div>
                    </article>
                ))}
            </div>

            <div className="mt-8 md:hidden text-center">
                <button
                    onClick={navigateToAll}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                    {t('sections.blog.readAll')} <ArrowRight size={18} />
                </button>
            </div>

            {selectedPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-50 dark:bg-black">
                    <div className={`min-h-screen w-full bg-white dark:bg-slate-950 absolute inset-0 overflow-y-auto ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>

                        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                            <img
                                src={selectedPost.imageUrl || 'https://picsum.photos/1200/600'}
                                alt={selectedPost.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 to-transparent"></div>

                            <div className="absolute top-4 left-4 md:left-8 right-4 md:right-8 flex justify-between items-center z-10">
                                <button
                                    onClick={handleClose}
                                    className="p-3 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full text-slate-900 dark:text-white hover:bg-white dark:hover:bg-black transition-all shadow-lg group flex items-center gap-2 pr-4"
                                >
                                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-sm font-bold hidden sm:inline">{t('sections.blog.back')}</span>
                                </button>
                            </div>
                        </div>

                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-32 pb-24">
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10">
                                <div className="mb-10 border-b border-slate-100 dark:border-slate-800 pb-10">
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {selectedPost.tags && selectedPost.tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
                                                <Tag size={12} className="mr-1.5" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                        {selectedPost.title}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400 font-medium">
                                        <span className="flex items-center">
                                            <Calendar size={18} className="mr-2 text-slate-400" />
                                            {selectedPost.date}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock size={18} className="mr-2 text-slate-400" />
                                            {selectedPost.readTime}
                                        </span>
                                        <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                        <span className="text-slate-800 dark:text-slate-200">
                                            {t('sections.blog.by')} Eververdants
                                        </span>
                                    </div>
                                </div>

                                <div className="prose prose-lg dark:prose-invert max-w-none prose-emerald prose-headings:font-bold prose-p:text-slate-600 dark:prose-p:text-slate-300">
                                    {renderContent(selectedPost.content)}
                                </div>

                                <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
                                    <button
                                        onClick={handleClose}
                                        className="px-8 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        {t('sections.blog.close')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default FeaturedBlog;