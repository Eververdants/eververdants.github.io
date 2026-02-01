import React, { useState, useEffect } from 'react';
import { getPhotography } from '../services/contentService';
import { ArtItem } from '../types';
import { Aperture, ArrowRight, MapPin, Maximize2, X, Info, Calendar, Camera, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FeaturedPhotography: React.FC = () => {
    const [selectedPhoto, setSelectedPhoto] = useState<ArtItem | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [photos, setPhotos] = useState<ArtItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, t } = useLanguage();

    // Load photography from Cloudflare KV
    useEffect(() => {
        const loadPhotography = async () => {
            try {
                setLoading(true);
                const data = await getPhotography(language);
                setPhotos(data.slice(0, 3));
            } catch (err) {
                console.error('Failed to load photography:', err);
            } finally {
                setLoading(false);
            }
        };
        loadPhotography();
    }, [language]);

    const featuredPhotos = photos;

    // 阻止背景滚动
    useEffect(() => {
        if (selectedPhoto) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedPhoto]);

    const navigateToAll = () => {
        const event = new CustomEvent('navigate-to', { detail: 'photography' });
        window.dispatchEvent(event);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedPhoto(null);
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
            const filename = `${item.title.toLowerCase().replace(/\s+/g, '-')}-original.jpg`;
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
                    <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400">
                        <Aperture size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('sections.photography.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {t('sections.photography.subtitle')}
                        </p>
                    </div>
                </div>

                <button
                    onClick={navigateToAll}
                    className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold group transition-colors"
                >
                    {t('sections.photography.viewGallery')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredPhotos.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedPhoto(item)}
                            className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-80 md:h-96"
                        >
                            <img
                                src={item.url}
                                alt={item.title}
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                                <div className="w-full flex justify-between items-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="text-left">
                                        <h3 className="text-white text-lg font-semibold leading-tight">{item.title}</h3>
                                        {item.location && (
                                            <div className="flex items-center text-emerald-200 text-xs mt-1 font-medium">
                                                <MapPin size={12} className="mr-1" />
                                                {item.location}
                                            </div>
                                        )}
                                    </div>
                                    <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                                        <Maximize2 size={18} />
                                    </button>
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
                    {t('sections.photography.viewGallery')} <ArrowRight size={18} />
                </button>
            </div>

            {selectedPhoto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden">
                    <div
                        className={`absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                        onClick={handleClose}
                    ></div>

                    <div className={`relative w-full h-full max-w-7xl max-h-[95vh] bg-black md:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row ring-1 ring-white/10 ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
                        <button
                            onClick={handleClose}
                            className="lg:hidden absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm border border-white/10"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-grow lg:w-3/4 bg-black relative flex items-center justify-center overflow-hidden group">
                            <img
                                src={selectedPhoto.url}
                                alt={selectedPhoto.title}
                                className="max-w-full max-h-full object-contain shadow-2xl"
                            />
                        </div>

                        <div className="lg:w-1/4 w-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-900">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedPhoto.title}</h2>
                                        {selectedPhoto.location && (
                                            <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                                <MapPin size={16} className="mr-1.5" />
                                                {selectedPhoto.location}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="hidden lg:block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {selectedPhoto.description && (
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-4">
                                        {selectedPhoto.description}
                                    </p>
                                )}

                                {selectedPhoto.date && (
                                    <div className="flex items-center text-slate-500 text-xs mt-4 font-mono">
                                        <Calendar size={14} className="mr-2" />
                                        {selectedPhoto.date}
                                    </div>
                                )}
                            </div>

                            {selectedPhoto.technicalDetails && (
                                <div className="p-8 border-b border-slate-100 dark:border-slate-900">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center">
                                        <Info size={14} className="mr-2" /> {t('sections.photography.techDetails')}
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 flex items-center"><Camera size={16} className="mr-2 opacity-70" /> {t('sections.photography.camera')}</span>
                                            <span className="text-slate-900 dark:text-white font-medium">{selectedPhoto.technicalDetails.camera}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 flex items-center"><Aperture size={16} className="mr-2 opacity-70" /> {t('sections.photography.aperture')}</span>
                                            <span className="text-slate-900 dark:text-white font-medium">{selectedPhoto.technicalDetails.aperture}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-8 mt-auto bg-slate-50 dark:bg-slate-950/50">
                                <button
                                    onClick={() => handleDownload(selectedPhoto)}
                                    disabled={isDownloading}
                                    className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isDownloading ? (
                                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <Download size={20} />
                                            {t('sections.photography.download')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default FeaturedPhotography;