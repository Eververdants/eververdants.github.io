import React, { useState, useCallback } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import { generateMuseThought } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const AICreativeMuse: React.FC = () => {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'ai', text: string }>>([
    { role: 'ai', text: t('sections.aiMuse.greeting') }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInspireMe = useCallback(async () => {
    if (!prompt.trim()) return;

    const userPrompt = prompt;
    setPrompt('');
    setHistory(prev => [...prev, { role: 'user', text: userPrompt }]);
    setIsLoading(true);

    try {
      const thought = await generateMuseThought(userPrompt);
      setHistory(prev => [...prev, { role: 'ai', text: thought }]);
    } catch (error) {
      setHistory(prev => [...prev, { role: 'ai', text: t('sections.aiMuse.error') }]);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  return (
    <section id="muse" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-2xl sm:rounded-[2rem] p-1 md:p-2 overflow-hidden shadow-2xl relative">

          {/* Header/Banner */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>

          <div className="relative z-10 p-4 sm:p-6 md:p-10">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg text-purple-500">
                <Sparkles size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('sections.aiMuse.title')}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">{t('sections.aiMuse.poweredBy')}</p>
              </div>
            </div>

            {/* Chat Area */}
            <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 h-[300px] sm:h-[350px] md:h-[400px] overflow-y-auto mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 border border-white/20 shadow-inner custom-scrollbar">
              {history.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200' : 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-white'
                    }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                  </div>
                  <div className={`py-3 px-5 rounded-2xl max-w-[80%] text-sm md:text-base leading-relaxed ${msg.role === 'user'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-tr-none'
                    : 'glass-panel text-slate-800 dark:text-slate-100 rounded-tl-none border-none shadow-sm'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="glass-panel py-3 px-5 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInspireMe()}
                placeholder={t('sections.aiMuse.placeholder')}
                className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-5 pr-14 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-sm transition-all"
              />
              <button
                onClick={handleInspireMe}
                disabled={isLoading || !prompt.trim()}
                className="absolute right-2 top-2 bottom-2 p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AICreativeMuse;