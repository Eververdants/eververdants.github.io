import React, { useEffect, useState } from 'react';
import { getCalligraphy } from '../services/contentService';
import { ArtItem } from '../types';
import { PenTool, X, Download, Maximize2, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Calligraphy: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<ArtItem | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [items, setItems] = useState<ArtItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, t } = useLanguage();

    // Load calligraphy from Cloudflare KV
    useEffect(() => {
        const loadCalligraphy = async () => {
            try {
                setLoading(true);
                const data = await getCalligraphy(language);
                setItems(data);
            } catch (err) {
                console.error('Failed to load calligraphy:', err);
            } finally {
                setLoading(false);
            }
        };
        loadCalligraphy();
    }, [language]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 阻止背景滚动
    useEffect(() => {
        if (selectedItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedItem]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedItem(null);
            setIsClosing(false);
        }, 300);
    };

    const handleDownload = async (item: ArtItem) => {
        setIsDownloading(true);
        try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            const filename = `${item.title.toLowerCase().replace(/\s+/g, '-')}-calligraphy.jpg`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(item.url, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="pt-32 pb-20 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 mb-6">
                        <PenTool size={32} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                        {t('sections.calligraphy.galleryTitle')}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {t('sections.calligraphy.gallerySubtitle')}
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-500 border-t-transparent"></div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">{t('common.loading') || 'Loading...'}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && items.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                            <PenTool size={48} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {t('common.noData') || '未发现作品'}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            {t('common.noDataDesc') || '暂时没有书法作品'}
                        </p>
                    </div>
                )}

                {/* Masonry Layout */}
                {!loading && items.length > 0 && (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="break-inside-avoid group relative cursor-pointer"
                            >

                                {/* Paper Mounting Frame */}
                                <div className="bg-[#fdfbf7] dark:bg-slate-200 p-4 shadow-xl rounded-sm transform transition-transform duration-500 group-hover:-translate-y-2 relative border border-slate-200 dark:border-slate-400">

                                    {/* Decorative Pattern overlay */}
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none mix-blend-multiply"></div>

                                    <div className="relative bg-white border-2 border-slate-100 dark:border-slate-300 overflow-hidden shadow-inner">
                                        <img
                                            src={item.url}
                                            alt={item.title}
                                            className="w-full h-auto object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-700 block"
                                        />

                                        {item.content && (
                                            <div className="absolute top-2 right-2 opacity-30 pointer-events-none writing-vertical-rl text-lg font-serif text-black/40 font-bold select-none">
                                                {item.content}
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="bg-white/90 p-3 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300 text-slate-800">
                                                <Maximize2 size={24} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 text-center relative z-10">
                                        <div>
                                            <h3 className="text-slate-900 font-serif text-xl italic">{item.title}</h3>
                                            {item.content && (
                                                <div className="text-2xl font-serif text-slate-800 my-2 font-bold tracking-widest">
                                                    「{item.content}」
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Subtle drop shadow behind the paper */}
                                <div className="absolute top-4 left-4 right-[-4px] bottom-[-8px] bg-black/10 dark:bg-black/40 -z-10 rounded-sm blur-sm"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-slate-900/90 backdrop-blur-xl transition-opacity ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                        onClick={handleClose}
                    ></div>

                    {/* Container */}
                    <div className={`relative w-full h-full max-w-6xl max-h-[95vh] bg-[#fdfbf7] dark:bg-slate-900 md:rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row ring-1 ring-white/10 ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>

                        {/* Close Button Mobile */}
                        <button
                            onClick={handleClose}
                            className="lg:hidden absolute top-4 right-4 z-20 p-2 bg-black/10 text-slate-800 dark:text-white rounded-full backdrop-blur-sm"
                        >
                            <X size={24} />
                        </button>

                        {/* Main Image Area */}
                        <div className="flex-grow lg:w-2/3 bg-[#e5e5e5] dark:bg-black relative flex items-center justify-center overflow-hidden p-4 md:p-8">
                            {/* Paper Texture Background for the mounting area */}
                            <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>

                            <div className="relative shadow-2xl border-8 border-white dark:border-slate-800 max-h-full max-w-full">
                                <img
                                    src={selectedItem.url}
                                    alt={selectedItem.title}
                                    className="max-w-full max-h-[85vh] object-contain block filter grayscale contrast-125"
                                />
                            </div>
                        </div>

                        {/* Sidebar Details */}
                        <div className="lg:w-1/3 w-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">

                            <div className="p-8 md:p-12 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2 block">{t('sections.calligraphy.galleryTitle')}</span>
                                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2 italic">{selectedItem.title}</h2>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="hidden lg:block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="flex-grow">
                                    {selectedItem.content && (
                                        <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden group">
                                            <div className="text-sm text-slate-400 uppercase tracking-wider mb-4">{t('sections.calligraphy.originalText')}</div>
                                            <div className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white font-bold tracking-widest leading-relaxed py-4">
                                                {selectedItem.content}
                                            </div>
                                            {/* Decorative Stamp Effect */}
                                            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-4 border-red-800/20 rounded-lg opacity-50 rotate-12 pointer-events-none"></div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h3 className="flex items-center text-sm font-bold uppercase tracking-wider text-slate-400">
                                            <Info size={14} className="mr-2" /> {t('sections.calligraphy.meaning')}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-serif text-lg">
                                            {selectedItem.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-900">
                                    <button
                                        onClick={() => handleDownload(selectedItem)}
                                        disabled={isDownloading}
                                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                    >
                                        {isDownloading ? (
                                            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
                                                {t('sections.calligraphy.download')}
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-slate-400 mt-4">
                                        {t('sections.calligraphy.license')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calligraphy;