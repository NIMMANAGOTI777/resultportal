import React from 'react';
import { useRouter } from './Router';
import type { School } from '../services/db';
import { useTranslation } from '../locales/translations';
import type { Language } from '../locales/translations';
import { GraduationCap, Lock, School as SchoolIcon, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  language: Language;
  toggleLanguage: () => void;
  school: School | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ language, toggleLanguage, school }) => {
  const { t } = useTranslation(language);
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-blue-500/10 selection:text-blue-600">
      
      {/* PUBLIC HEADER */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5">
              {school?.logo_url ? (
                <img 
                  src={school.logo_url} 
                  alt="School Logo" 
                  className="w-9 h-9 rounded-xl object-contain border border-slate-200 p-0.5 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200";
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100 shadow-sm">
                  <SchoolIcon className="h-5 w-5" />
                </div>
              )}
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-none">
                  {school ? school.school_name : t('portalTitle')}
                </h1>
                <span className="text-[9px] text-slate-400 font-extrabold tracking-widest uppercase mt-0.5 block">
                  {school ? `${school.address.split(',')[1] || 'Madugulapally'}, ${school.address.split(',')[2] || 'Nalgonda'}` : 'Telangana'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/80 hover:bg-slate-50 border border-slate-250/50 text-slate-650 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer shadow-sm"
            >
              <Globe className="h-4 w-4 text-slate-450" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* HERO SECTION & PORTAL PORTLETS */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col justify-center items-center space-y-12">
        
        <div className="text-center max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-extrabold uppercase tracking-wider rounded-full">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>{school?.academic_year || '2025-2026'} Academic Portal</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'te' 
              ? "అకడమిక్ రిజల్ట్స్ & మార్క్స్ మేనేజ్‌మెంట్ పోర్టల్" 
              : "ZPHS Academic Results & Staff Records Portal"}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-semibold leading-relaxed">
            {language === 'te'
              ? "విద్యార్థులు తమ ప్రగతి పత్రాలను పొందవచ్చు. ఉపాధ్యాయులు మార్కులను నమోదు చేయవచ్చు."
              : "Secure educational framework. Students can download state board cumulative progress cards, and authorized educators can manage registers."}
          </p>
        </div>

        {/* Portal Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          
          {/* Student Entry Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 flex flex-col justify-between h-[300px] border border-slate-200/60 shadow-lg hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer overflow-hidden"
            onClick={() => navigate('/student-login')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-all duration-300" />
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 text-blue-600 w-fit rounded-2xl border border-blue-100 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {language === 'te' ? "విద్యార్థి పోర్టల్" : "Student Result Portal"}
                </h3>
                <p className="text-xs text-slate-400 font-semibold leading-normal">
                  {language === 'te'
                    ? "మీ అడ్మిషన్ నంబర్ మరియు విద్యార్థి పేరు ద్వారా మీ మార్కులు, హాజరు మరియు ప్రగతి పత్రాన్ని చూడండి."
                    : "Check evaluation metrics, grades, and download official academic cumulative progress cards using Admission Number & Student Name."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black text-primary group-hover:translate-x-1.5 transition-transform duration-300">
              <span>{language === 'te' ? "ఫలితాలు చూడండి" : "Access Student Portal"}</span>
              <span>&rarr;</span>
            </div>
          </motion.div>

          {/* Teacher Entry Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 flex flex-col justify-between h-[300px] border border-slate-200/60 shadow-lg hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer overflow-hidden"
            onClick={() => navigate('/teacher-login')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-all duration-300" />

            <div className="space-y-4">
              <div className="p-4 bg-purple-50 text-purple-600 w-fit rounded-2xl border border-purple-100 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Lock className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {language === 'te' ? "ఉపాధ్యాయుల లాగిన్" : "Staff Directory Portal"}
                </h3>
                <p className="text-xs text-slate-400 font-semibold leading-normal">
                  {language === 'te'
                    ? "ఉపాధ్యాయులు మరియు సిబ్బంది విద్యార్థుల వివరాలను, మార్కులను నిర్వహించడానికి మరియు నివేదికలను రూపొందించడానికి ఇక్కడ లాగిన్ అవ్వండి."
                    : "Educator dashboard to manage rosters, perform marks entry, bulk uploads, generate rankings, and audit logs."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full text-xs font-black">
              <div className="flex items-center gap-1.5 text-purple-650 group-hover:translate-x-1.5 transition-transform duration-300">
                <span>{language === 'te' ? "సిబ్బంది లాగిన్" : "Access Teacher Portal"}</span>
                <span>&rarr;</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/teacher-request');
                }}
                className="text-[10px] text-slate-400 hover:text-primary underline font-bold transition cursor-pointer"
              >
                {language === 'te' ? "ఖాతా అభ్యర్థన" : "Request Access"}
              </button>
            </div>
          </motion.div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} {school ? school.school_name : 'ZPHS AGAMOTHKUR'}. All rights reserved.</p>
          <p className="text-[9px] text-slate-650 mt-1">U-DISE Code: {school ? school.school_code : '28160200501'} | Telangana Secondary Education Portal</p>
        </div>
      </footer>

    </div>
  );
};
