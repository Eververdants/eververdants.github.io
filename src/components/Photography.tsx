import React, { useEffect, useState } from 'react';
import { getPhotography } from '../services/contentService';
import { ArtItem } from '../types';
import { ZoomIn, Aperture, MapPin, X, Download, Calendar, Camera, Info, Maximize2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Photography: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<ArtItem | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [photos, setPhotos] = useState<ArtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  // Load photography from Cloudflare KV
  useEffect(() => {
    const loadPhotography = async () => {
      try {
        setLoading(true);
        const data = await getPhotography(language);
        setPhotos(data);
      } catch (err) {
        console.error('Failed to load photography:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPhotography();
  }, [language]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prevent body scroll when modal is open
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

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to finish (300ms)
    setTimeout(() => {
      setSelectedPhoto(null);
      setIsClosing(false);
    }, 300);
  };

  const handleDownload = async (item: ArtItem) => {
    setIsDownloading(true);
    try {
      // Create a fetch request to get the blob
      // Note: This works for same-origin or CORS-enabled images. 
      // Picsum generally supports CORS.
      const response = await fetch(item.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      // Clean filename
      const filename = `${item.title.toLowerCase().replace(/\s+/g, '-')}-original.jpg`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: Open in new tab
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
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-6">
            <Aperture size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            {t('sections.photography.galleryTitle')}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('sections.photography.gallerySubtitle')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">{t('common.loading') || 'Loading...'}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && photos.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Aperture size={48} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t('common.noData') || '未发现照片'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('common.noDataDesc') || '暂时没有摄影作品'}
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && photos.length > 0 && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {photos.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Glass Overlay */}
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
      </div>

      {/* Detail Modal Overlay */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
            onClick={handleClose}
          ></div>

          {/* Container */}
          <div className={`relative w-full max-w-7xl h-[95vh] bg-black md:rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden ring-1 ring-white/10 ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>

            {/* Close Button - Fixed */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm border border-white/10"
            >
              <X size={24} />
            </button>

            {/* Main Image Area - Fixed, No Scroll */}
            <div className="w-full lg:w-3/4 h-64 lg:h-full bg-black relative flex items-center justify-center flex-shrink-0">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
            </div>

            {/* Sidebar Details - Scrollable */}
            <div className="w-full lg:w-1/4 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 overflow-y-auto flex flex-col">

              <div className="p-8 flex flex-col h-full">
                {/* Header Details */}
                <div className="border-b border-slate-100 dark:border-slate-900 pb-8">
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

                {/* Technical Details (EXIF) */}
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
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{t('sections.photography.iso')}</span>
                        <span className="text-slate-900 dark:text-white font-medium">{selectedPhoto.technicalDetails.iso}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{t('sections.photography.shutter')}</span>
                        <span className="text-slate-900 dark:text-white font-medium">{selectedPhoto.technicalDetails.shutterSpeed}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{t('sections.photography.lens')}</span>
                        <span className="text-slate-900 dark:text-white font-medium">{selectedPhoto.technicalDetails.lens}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
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
                  <p className="text-center text-xs text-slate-400 mt-4">
                    {t('sections.photography.license')}
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

export default Photography;