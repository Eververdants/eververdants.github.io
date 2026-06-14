import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { CaretLeft } from '@phosphor-icons/react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display font-bold text-forest-500/20 dark:text-forest-500/10 mb-6">
          404
        </div>
        <h1 className="text-2xl font-bold mb-3">
          {language === 'zh' ? '页面未找到' : 'Page Not Found'}
        </h1>
        <p className="text-warm-400 dark:text-warm-400 mb-8">
          {language === 'zh'
            ? '您要查找的页面不存在或已被移动。'
            : 'The page you\'re looking for doesn\'t exist or has been moved.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-500 text-white font-semibold hover:bg-forest-600 transition-colors"
        >
          <CaretLeft size={18} />
          {language === 'zh' ? '返回首页' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
