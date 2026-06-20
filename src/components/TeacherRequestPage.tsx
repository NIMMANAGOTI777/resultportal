import React, { useState } from 'react';
import { dbService } from '../services/db';
import { useRouter } from './Router';
import type { Language } from '../locales/translations';
import { UserCheck, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Briefcase, Mail, Phone, BookOpen, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeacherRequestPageProps {
  language: Language;
}

export const TeacherRequestPage: React.FC<TeacherRequestPageProps> = ({ language }) => {
  const { navigate } = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    qualification: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.subject.trim() || !formData.qualification.trim()) {
      setError(language === 'te' ? "దయచేసి అన్ని వివరాలను నమోదు చేయండి." : "Please fill in all fields.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      await dbService.submitTeacherRequest({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        qualification: formData.qualification.trim()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', qualification: '' });
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('unique')) {
        setError(language === 'te' ? "ఈ ఈమెయిల్ తో అభ్యర్థన ఇప్పటికే సమర్పించబడింది." : "A request with this email already exists.");
      } else {
        setError(language === 'te' ? "సమర్పణ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి." : "Failed to submit request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-650 mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{language === 'te' ? "తిరిగి వెళ్ళండి" : "Back to Home"}</span>
      </button>

      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex p-4 bg-primary/10 text-primary rounded-3xl border border-primary/20 shadow-inner">
          <UserCheck className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {language === 'te' ? "ఉపాధ్యాయుల రిజిస్ట్రేషన్ అభ్యర్థన" : "Teacher Registration Request"}
        </h2>
        <p className="text-sm text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
          {language === 'te' 
            ? "సరుకులను మరియు మార్కులను నిర్వహించడానికి ఖాతా అభ్యర్థనను సమర్పించండి. అడ్మిన్ ఆమోదం పొందిన తర్వాత మీకు ఖాతా క్రియేట్ చేయబడుతుంది." 
            : "Submit a request to register as a teacher. Accounts will be provisioned once approved by the administrator."}
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

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-green-100 shadow-premium text-center space-y-4"
        >
          <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100 shadow-sm">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">
            {language === 'te' ? "అభ్యర్థన విజయవంతంగా సమర్పించబడింది!" : "Request Submitted Successfully!"}
          </h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {language === 'te'
              ? "మీ అభ్యర్థన సమీక్షలో ఉంది. అడ్మిన్ ఆమోదించిన తర్వాత మీకు లాగిన్ యాక్సెస్ లభిస్తుంది."
              : "Your registration details have been sent to the administrator. Once approved, you will receive login credentials."}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 cursor-pointer"
          >
            {language === 'te' ? "హోమ్ పేజీకి వెళ్ళండి" : "Go to Homepage"}
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-premium space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              {language === 'te' ? "పూర్తి పేరు" : "Full Name"}
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder={language === 'te' ? "ఉదా. రాముడు రావు" : "e.g. Rama Rao"}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-11 pr-4.5 py-3 w-full border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              {language === 'te' ? "ఈమెయిల్ చిరునామా" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="e.g. teacher@school.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-11 pr-4.5 py-3 w-full border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              {language === 'te' ? "ఫోన్ నంబర్" : "Phone Number"}
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="e.g. +91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-11 pr-4.5 py-3 w-full border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                {language === 'te' ? "బోధించే సబ్జెక్ట్" : "Teaching Subject"}
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="pl-11 pr-4.5 py-3 w-full border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                {language === 'te' ? "అర్హత" : "Qualification"}
              </label>
              <div className="relative">
                <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Ed, M.Sc"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="pl-11 pr-4.5 py-3 w-full border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-dark active:scale-[0.99] disabled:bg-slate-200 text-white font-black rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2 mt-8 cursor-pointer text-sm"
          >
            {loading ? (
              language === 'te' ? "సమర్పిస్తోంది..." : "Submitting..."
            ) : (
              <>
                <span>{language === 'te' ? "అభ్యర్థన సమర్పించండి" : "Submit Request"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
