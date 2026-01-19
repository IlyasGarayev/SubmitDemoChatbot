import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, ArrowRight, Globe, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-az-blue/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-az-red/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-az-green/20 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-4xl px-6 flex flex-col md:flex-row items-center gap-12 md:gap-20">
        
        {/* Left Side: Text */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 animate-slide-down">
            <Sparkles size={14} className="text-az-blue" />
            <span>AI ilə Xaricdə Təhsil</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Gələcəyini <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-az-blue via-az-red to-az-green">
              Kəşf Et
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto md:mx-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Azərbaycanlı tələbələr üçün xüsusi hazırlanmış süni intellekt bələdçisi. Universitetlər, təqaüdlər və ixtisaslar haqqında ən doğru məlumatı anında əldə edin.
          </p>

          <div className="pt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={login}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-az-blue/20 transition-all duration-300 active:scale-95"
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
                className="w-6 h-6" 
              />
              <span>Google ilə Başla</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-6 pt-6 text-sm text-slate-500 animate-slide-up" style={{ animationDelay: '0.4s' }}>
             <div className="flex items-center gap-2">
                <Globe size={16} />
                <span>Qlobal Məlumat Bazası</span>
             </div>
             <div className="flex items-center gap-2">
                <GraduationCap size={16} />
                <span>Təqaüd İmkanları</span>
             </div>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div className="flex-1 relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="relative z-10 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
             {/* Mock Chat Interface */}
             <div className="space-y-4">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-xs">👤</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 dark:text-slate-200 max-w-[80%]">
                        Salam! Almaniyada magistr təhsili üçün hansı təqaüdlər var?
                    </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-az-blue to-az-green flex items-center justify-center">
                        <GraduationCap size={14} className="text-white" />
                     </div>
                     <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tr-none text-sm text-slate-700 dark:text-slate-200 shadow-sm max-w-[90%]">
                        <p>Salam! Almaniyada ən populyar təqaüd proqramı <strong>DAAD</strong>-dir. Bundan əlavə, universitetlərin daxili təqaüdləri və <strong>Erasmus+</strong> proqramı da mövcuddur.</p>
                     </div>
                </div>
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-xs">👤</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 dark:text-slate-200 max-w-[80%]">
                        Bəs qəbul şərtləri nələrdir?
                    </div>
                </div>
             </div>
          </div>
          
          {/* Floating badges */}
          <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg animate-bounce duration-[3000ms]">
             <span className="text-2xl">🇩🇪</span>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg animate-bounce duration-[4000ms] delay-700">
             <span className="text-2xl">🇺🇸</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;