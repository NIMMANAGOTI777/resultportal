import React, { useState } from 'react';
import { dbService } from '../services/db';
import { useRouter } from './Router';
import { useTranslation } from '../locales/translations';
import type { Language } from '../locales/translations';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeacherLoginProps {
  language: Language;
}

export const TeacherLogin: React.FC<TeacherLoginProps> = ({ language }) => {
  const { t } = useTranslation(language);
  const { navigate } = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await dbService.login(email, password);
      
      if (user.role === 'admin') {
        // Admins can log in here but will be redirected to the admin dashboard
        navigate('/admin/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        setError("Unauthorized role definition.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex p-4 bg-blue-500/10 text-blue-600 rounded-3xl border border-blue-500/20 shadow-inner">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {language === 'te' ? "ఉపాధ్యాయుల లాగిన్" : "Teacher Login"}
        </h2>
        <p className="text-sm text-slate-400 font-medium">
          {language === 'te' 
            ? "విద్యార్థుల వివరాలు మరియు మార్కులను నమోదు చేయడానికి లాగిన్ అవ్వండి." 
            : "Access student registers and marks dashboard securely."}
        </p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 text-xs font-semibold mb-6"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-premium space-y-5">
        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {t('email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="teacher@zphs.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4.5 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {t('password')}
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4.5 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary hover:bg-primary-dark active:scale-[0.99] disabled:bg-slate-200 text-white font-black rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2 mt-8 cursor-pointer text-sm"
        >
          {loading ? (
            t('loading')
          ) : (
            <>
              <span>{t('signIn')}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
