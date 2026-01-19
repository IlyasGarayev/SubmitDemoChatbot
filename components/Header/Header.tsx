import React from 'react';
import { Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { Language } from '../../types';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useChat();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'az', label: 'AZ', flag: '🇦🇿' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'ru', label: 'RU', flag: '🇷🇺' },
  ];

  return (
    <header className="h-16 px-6 flex items-center justify-end gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 z-10 sticky top-0">
      
      {/* Language Selector */}
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200">
          <Globe size={16} className="text-az-blue" />
          <span className="uppercase">{language}</span>
        </button>
        
        <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
          <div className="p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  language === lang.code
                    ? 'bg-az-blue/10 text-az-blue'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  );
};

export default Header;