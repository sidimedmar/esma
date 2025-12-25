
import React, { useState } from 'react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../constants';

interface HeaderProps {
  lang: Language;
  toggleLang: () => void;
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  currentView: 'editor' | 'gallery';
  onViewChange: (view: 'editor' | 'gallery') => void;
}

const Header: React.FC<HeaderProps> = ({ lang, toggleLang, user, onLoginClick, onLogout, currentView, onViewChange }) => {
  const t = TRANSLATIONS[lang];
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    if (user) return; // Déjà connecté
    const newClicks = logoClicks + 1;
    if (newClicks >= 5) {
      onLoginClick();
      setLogoClicks(0);
    } else {
      setLogoClicks(newClicks);
      // Reset après 2 secondes d'inactivité
      setTimeout(() => setLogoClicks(0), 2000);
    }
  };

  return (
    <header className="w-full px-6 py-5 flex justify-between items-center bg-[#0d0d0d] border-b border-white/5 z-50 shadow-2xl">
      <div className="flex items-center gap-10">
        <div 
          onClick={handleLogoClick} 
          className="flex items-center gap-4 group cursor-pointer select-none"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20 group-hover:rotate-12 transition-all duration-500">
            <i className="fa-solid fa-wand-magic-sparkles text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block">
            {t.title}<span className="text-purple-500">{t.subtitle}</span>
          </h1>
        </div>

        {user?.isAdmin && (
          <nav className="flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => onViewChange('gallery')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${currentView === 'gallery' ? 'bg-white text-black shadow-2xl scale-105' : 'text-gray-500 hover:text-white'}`}
            >
              {t.viewGallery}
            </button>
            <button 
              onClick={() => onViewChange('editor')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${currentView === 'editor' ? 'bg-white text-black shadow-2xl scale-105' : 'text-gray-500 hover:text-white'}`}
            >
              {t.backToEditor}
            </button>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleLang} 
          className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest group"
        >
          <i className="fa-solid fa-earth-africa text-purple-400 group-hover:rotate-180 transition-all duration-1000"></i>
          <span>{lang === 'fr' ? 'AR' : 'FR'}</span>
        </button>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end">
               <span className="text-[10px] font-black text-white uppercase">{user.name}</span>
               <span className="text-[8px] font-bold text-purple-500 uppercase">Administrateur</span>
            </div>
            <button 
              onClick={onLogout}
              className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg"
              title={t.logout}
            >
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
