
import React, { useEffect, useState } from 'react';
import { ArrowRight, Clock, BookOpen, X, Calendar, Tag, ChevronLeft } from 'lucide-react';
import { getBlogPosts } from '../services/contentService';
import { BlogPost } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Blog: React.FC = () => {
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
                setPosts(data);
            } catch (err) {
                console.error('Failed to load blog posts:', err);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, [language]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handlePostClick = (post: BlogPost) => {
        setSelectedPost(post);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedPost(null);
            setIsClosing(false);
        }, 300);
    };

    // Simple formatter to render paragraphs from text
    const renderContent = (content: string) => {
        return content.split('\n').map((paragraph, index) => {
            if (!paragraph.trim()) return null;

            // Simple header detection
            if (paragraph.trim().startsWith('##')) {
                return <h2 key={index} className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-slate-900 dark:text-white">{paragraph.replace('##', '').trim()}</h2>;
            }

            return <p key={index} className="mb-6 text-slate-700 dark:text-slate-300 leading-8 text-lg md:text-xl font-serif">{paragraph.trim()}</p>;
        });
    };

    return (
        <div className="pt-32 pb-20 min-h-screen relative">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Header */}
                <div className={`transition-opacity duration-300 ${selectedPost ? 'opacity-0 pointer-events-none hidden' : 'opacity-100'}`}>
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
                            <p className="mt-4 text-slate-600 dark:text-slate-400">{t('common.loading') || 'Loading...'}</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-16">
                                <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-6">
                                    <BookOpen size={32} />
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                                    {t('sections.blog.title')}
                                </h1>
                                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                                    {t('sections.blog.subtitle')}
                                </p>
                            </div>

                            {/* Empty State */}
                            {posts.length === 0 && (
                                <div className="text-center py-20">
                                    <div className="inline-flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                        <BookOpen size={48} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        {t('common.noData') || '未发现文章'}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {t('common.noDataDesc') || '暂时没有博客文章'}
                                    </p>
                                </div>
                            )}

                            {/* Blog Posts List */}
                            {posts.length > 0 && (
                                <div className="space-y-8">
                                    {posts.map((post) => (
                                        <article
                                            key={post.id}
                                            onClick={() => handlePostClick(post)}
                                            className="group glass-card rounded-2xl p-6 md:p-10 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6 md:gap-12 md:items-start">

                                                <div className="md:w-1/4 flex-shrink-0 flex md:flex-col flex-row gap-4 items-center md:items-start">
                                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full whitespace-nowrap">
                                                        {post.date}
                                                    </span>
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                        <Clock size={12} className="mr-1" /> {post.readTime}
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-lg">
                                                        {post.excerpt}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <div className="flex gap-2">
                                                            {post.tags && post.tags.slice(0, 2).map(tag => (
                                                                <span key={tag} className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="inline-flex items-center text-sm font-bold text-slate-800 dark:text-slate-200 hover:underline decoration-emerald-500 decoration-2 underline-offset-4">
                                                            {t('sections.blog.readFull')} <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Blog Detail Modal / View */}
            {selectedPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-50 dark:bg-black">
                    {/* Progress Bar (Optional) */}
                    <div className="fixed top-0 left-0 w-full h-1 z-[110]">
                        <div className="h-full bg-emerald-500 w-full origin-left animate-[grow_1s_ease-out]"></div>
                    </div>

                    <div className={`min-h-screen w-full bg-white dark:bg-slate-950 absolute inset-0 overflow-y-auto ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>

                        {/* Hero Image & Navigation */}
                        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                            <img
                                src={selectedPost.imageUrl || 'https://picsum.photos/1200/600'}
                                alt={selectedPost.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 to-transparent"></div>

                            {/* Floating Nav */}
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

                        {/* Content Container */}
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-32 pb-24">
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10">

                                {/* Article Header */}
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

                                {/* Article Body */}
                                <div className="prose prose-lg dark:prose-invert max-w-none prose-emerald prose-headings:font-bold prose-p:text-slate-600 dark:prose-p:text-slate-300">
                                    {renderContent(selectedPost.content)}
                                </div>

                                {/* Footer */}
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
        </div>
    );
};

export default Blog;
