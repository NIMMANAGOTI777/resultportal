import React, { useState, useEffect } from 'react';
import type { School, User } from '../services/db';
import { useTranslation } from '../locales/translations';
import { Dashboard } from './Dashboard';
import { StudentManagement } from './StudentManagement';
import { MarksManagement } from './MarksManagement';
import { ExcelUpload } from './ExcelUpload';
import { BrandingSettings } from './BrandingSettings';
import { Analytics } from './Analytics';
import { ReportCards } from './ReportCards';
import { TeacherRequestsPanel } from './TeacherRequestsPanel';
import { 
  School as SchoolIcon, 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Globe, 
  TrendingUp,
  FileText,
  ChevronUp,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StaffDashboardProps {
  role: 'teacher' | 'admin';
  language: 'en' | 'te';
  toggleLanguage: () => void;
  currentUser: User;
  school: School | null;
  onLogout: () => void;
  onBrandingChange?: () => void;
}

type SubView = 'dashboard' | 'students' | 'marks' | 'analytics' | 'upload' | 'reports' | 'settings' | 'requests';

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ 
  role, 
  language, 
  toggleLanguage,
  currentUser, 
  school, 
  onLogout,
  onBrandingChange 
}) => {
  const { t } = useTranslation(language);
  const [activeTab, setActiveTab] = useState<SubView>('dashboard');
  const [showMobileMore, setShowMobileMore] = useState(false);

  // Nav link item configuration based on role
  const navItems = [
    { view: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, roles: ['admin', 'teacher'] },
    { view: 'students', label: t('studentManagement'), icon: Users, roles: ['admin', 'teacher'] },
    { view: 'marks', label: t('marksManagement'), icon: GraduationCap, roles: ['admin', 'teacher'] },
    { view: 'analytics', label: 'Analytics', icon: TrendingUp, roles: ['admin', 'teacher'] },
    { view: 'upload', label: t('excelUpload'), icon: FileSpreadsheet, roles: ['admin', 'teacher'] },
    { view: 'reports', label: 'Report Cards', icon: FileText, roles: ['admin', 'teacher'] },
    { view: 'requests', label: 'Teacher Requests', icon: UserCheck, roles: ['admin'] },
    { view: 'settings', label: t('schoolSettings'), icon: Settings, roles: ['admin'] }
  ].filter(item => item.roles.includes(role)) as { view: SubView; label: string; icon: any; roles: string[] }[];

  // Fallback if tab is not allowed for the role (e.g. standard teacher trying to access settings)
  useEffect(() => {
    if ((activeTab === 'settings' || activeTab === 'requests') && role !== 'admin') {
      setActiveTab('dashboard');
    }
  }, [role, activeTab]);

  const handleTabChange = (view: SubView) => {
    setActiveTab(view);
    setShowMobileMore(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-blue-500/10 selection:text-blue-600 pb-16 md:pb-0">
      
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Info */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => handleTabChange('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity"
            >
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
            
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/80 hover:bg-slate-50 border border-slate-250/50 text-slate-650 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer shadow-sm"
              title="Switch Language"
            >
              <Globe className="h-4 w-4 text-slate-450" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Logged in User Profile & Logout */}
            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</span>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">
                  {currentUser.role === 'admin' ? t('adminRole') : t('teacherRole')}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-600 border border-red-100/50 rounded-xl transition cursor-pointer"
                title={t('logout')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* MAIN DOCK WRAPPER */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 min-w-0">
        
        {/* DOCKED SIDEBAR (Floating Icon Dock for Desktop) */}
        <aside className="w-20 hidden md:flex flex-col items-center gap-6 flex-shrink-0 self-start">
          <nav className="glass-dock p-3 rounded-[24px] flex flex-col gap-3.5 items-center w-full relative">
            {navItems.map(item => {
              const isActive = activeTab === item.view;
              const Icon = item.icon;
              return (
                <div key={item.view} className="relative group">
                  <button
                    onClick={() => handleTabChange(item.view)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-glow'
                        : 'text-slate-400 hover:bg-slate-100/80 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <motion.div 
                        layoutId="activeStaffGlow" 
                        className="absolute -inset-1 rounded-full border border-primary/30 opacity-60 pointer-events-none"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>

                  {/* Tooltip */}
                  <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md whitespace-nowrap z-50">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* CONTENT OUTLET CONTAINER */}
        <main className="flex-1 min-w-0">
          <div className="glass-panel p-6 sm:p-8 rounded-[32px] min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'dashboard' && (
                  <Dashboard language={language} />
                )}

                {activeTab === 'students' && (
                  <StudentManagement language={language} />
                )}

                {activeTab === 'marks' && (
                  <MarksManagement language={language} />
                )}

                {activeTab === 'analytics' && (
                  <Analytics language={language} />
                )}

                {activeTab === 'upload' && (
                  <ExcelUpload language={language} />
                )}

                {activeTab === 'reports' && (
                  <ReportCards language={language} />
                )}

                {activeTab === 'requests' && role === 'admin' && (
                  <TeacherRequestsPanel language={language} />
                )}

                {activeTab === 'settings' && role === 'admin' && onBrandingChange && (
                  <BrandingSettings language={language} onBrandingChange={onBrandingChange} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>

      {/* MOBILE BOTTOM NAVIGATION (Apple Pill Dock) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 flex justify-around items-center px-2 z-40 shadow-[0_-2px_15px_rgba(0,0,0,0.03)] md:hidden">
        {navItems.slice(0, 4).map(item => {
          const isActive = activeTab === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => handleTabChange(item.view)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer relative ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] mt-1 tracking-tight truncate max-w-full font-bold">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}

        {navItems.length > 4 && (
          <button
            onClick={() => setShowMobileMore(!showMobileMore)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${
              showMobileMore ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <ChevronUp className={`h-5 w-5 transition-transform duration-300 ${showMobileMore ? 'rotate-180' : ''}`} />
            <span className="text-[9px] mt-1 font-bold">More</span>
          </button>
        )}
      </nav>

      {/* Mobile Drawer (Apple slide sheet) */}
      <AnimatePresence>
        {showMobileMore && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMore(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 rounded-t-[28px] p-6 z-50 md:hidden space-y-4 shadow-xl"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2" />
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center">More Tools</h3>
              <div className="grid grid-cols-3 gap-3.5 py-2">
                {navItems.slice(4).map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.view}
                      onClick={() => handleTabChange(item.view)}
                      className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200/50 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
                    >
                      <Icon className="h-5 w-5 text-slate-650" />
                      <span className="text-[9.5px] mt-1.5 font-bold text-slate-700 truncate max-w-full">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 pb-20 md:pb-0">
          <p>© {new Date().getFullYear()} {school ? school.school_name : 'ZPHS AGAMOTHKUR'}. All rights reserved.</p>
          <p className="text-[9px] text-slate-600 mt-1">U-DISE Code: {school ? school.school_code : '28160200501'} | Built for Telangana Government School Teachers</p>
        </div>
      </footer>

    </div>
  );
};
