import React, { useState, useEffect } from 'react';
import { getCalligraphy } from '../services/contentService';
import { ArtItem } from '../types';
import { PenTool, ArrowRight, Maximize2, X, Info, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FeaturedCalligraphy: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<ArtItem | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [items, setItems] = useState<ArtItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, t } = useLanguage();

    // Load calligraphy from Cloudflare KV
    useEffect(() => {
        const loadCalligraphy = async () => {
            try {
                setLoading(true);
                const data = await getCalligraphy(language);
                setItems(data.slice(0, 3));
            } catch (err) {
                console.error('Failed to load calligraphy:', err);
            } finally {
                setLoading(false);
            }
        };
        loadCalligraphy();
    }, [language]);

    const featuredItems = items;

    // Prevent body scroll when modal is open
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

    const navigateToAll = () => {
        const event = new CustomEvent('navigate-to', { detail: 'calligraphy' });
        window.dispatchEvent(event);
    };

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
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-700 dark:text-amber-500">
                        <PenTool size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('sections.calligraphy.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {t('sections.calligraphy.subtitle')}
                        </p>
                    </div>
                </div>

                <button
                    onClick={navigateToAll}
                    className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold group transition-colors"
                >
                    {t('sections.calligraphy.viewCollection')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="group relative cursor-pointer"
                        >
                            <div className="bg-[#fdfbf7] dark:bg-slate-200 p-3 shadow-lg rounded-sm transform transition-transform duration-500 group-hover:-translate-y-2 relative border border-slate-200 dark:border-slate-400">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none mix-blend-multiply"></div>

                                <div className="relative bg-white border-2 border-slate-100 dark:border-slate-300 overflow-hidden shadow-inner h-64 md:h-80">
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-700 block"
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="bg-white/90 p-2 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300 text-slate-800">
                                            <Maximize2 size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 text-center relative z-10">
                                    <h3 className="text-slate-900 font-serif text-lg italic">{item.title}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 md:hidden text-center">
                <button
                    onClick={navigateToAll}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                    {t('sections.calligraphy.viewCollection')} <ArrowRight size={18} />
                </button>
            </div>

            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden">
                    <div
                        className={`absolute inset-0 bg-slate-900/90 backdrop-blur-xl transition-opacity ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                        onClick={handleClose}
                    ></div>

                    <div className={`relative w-full max-w-6xl h-[95vh] bg-[#fdfbf7] dark:bg-slate-900 md:rounded-xl shadow-2xl flex flex-col lg:flex-row overflow-hidden ring-1 ring-white/10 ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
                        {/* Close Button - Fixed */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-20 p-2 bg-black/10 hover:bg-black/20 text-slate-800 dark:text-white rounded-full backdrop-blur-sm"
                        >
                            <X size={24} />
                        </button>

                        {/* Main Image Area - Fixed, No Scroll */}
                        <div className="w-full lg:w-2/3 h-64 lg:h-full bg-[#e5e5e5] dark:bg-black relative flex items-center justify-center p-4 md:p-8 flex-shrink-0">
                            <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>
                            <div className="relative shadow-2xl border-8 border-white dark:border-slate-800 max-h-full max-w-full">
                                <img
                                    src={selectedItem.url}
                                    alt={selectedItem.title}
                                    className="max-w-full max-h-full object-contain block filter grayscale contrast-125"
                                />
                            </div>
                        </div>

                        {/* Sidebar Details - Scrollable */}
                        <div className="w-full lg:w-1/3 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 overflow-y-auto flex flex-col">
                            <div className="p-8 md:p-12 flex flex-col">
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default FeaturedCalligraphy;