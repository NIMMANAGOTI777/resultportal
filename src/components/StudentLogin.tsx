import React, { useState } from 'react';
import { dbService } from '../services/db';
import { useRouter } from './Router';
import type { Language } from '../locales/translations';
import { GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentLoginProps {
  language: Language;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ language }) => {
  const { navigate } = useRouter();
  
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean and validate admission number (must be 4 digits)
    const cleanAdmission = admissionNumber.trim();
    if (!cleanAdmission) {
      setError(language === 'te' ? "దయచేసి అన్ని వివరాలను నమోదు చేయండి." : "Please fill in all fields.");
      return;
    }

    if (!/^\d{4}$/.test(cleanAdmission)) {
      setError(language === 'te' ? "అడ్మిషన్ నంబర్ ఖచ్చితంగా 4 అంకెలు ఉండాలి." : "Admission Number must be exactly 4 digits.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Look up student in Supabase or local storage via admission number only
      const studentData = await dbService.findStudentByAdmission(cleanAdmission);
      if (studentData) {
        // Save student profile in sessionStorage
        dbService.saveStudentSession({
          id: studentData.id,
          name: studentData.student_name,
          role: 'student',
          admissionNumber: studentData.admission_number
        });
        
        // Redirect to student dashboard
        navigate('/student/dashboard');
      } else {
        setError(
          language === 'te' 
            ? "సరికాని అడ్మిషన్ నంబర్. దయచేసి మళ్లీ ప్రయత్నించండి." 
            : "Invalid Admission Number. Please try again."
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(
        language === 'te'
          ? "ధృవీకరణ సమయంలో లోపం సంభవించింది. దయచేసి మళ్లీ ప్రయత్నించండి."
          : "An error occurred during verification. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex p-4 bg-blue-500/10 text-blue-600 rounded-3xl border border-blue-500/20 shadow-inner">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {language === 'te' ? "విద్యార్థి లాగిన్" : "Student Login"}
        </h2>
        <p className="text-sm text-slate-400 font-medium">
          {language === 'te' 
            ? "మీ అడ్మిషన్ నంబర్ ఉపయోగించి లాగిన్ చేయండి." 
            : "Access your report card and marks using Admission Number."}
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

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-premium space-y-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {language === 'te' ? "అడ్మిషన్ నంబర్ (4 అంకెలు)" : "Admission Number (4 digits)"}
          </label>
          <input
            type="text"
            required
            maxLength={4}
            placeholder="e.g. 7001"
            value={admissionNumber}
            onChange={(e) => setAdmissionNumber(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4.5 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-[#2563eb] hover:bg-[#1e40af] active:scale-[0.99] disabled:bg-slate-200 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer text-sm"

        >
          {loading ? (
            language === 'te' ? "ధృవీకరిస్తోంది..." : "Verifying..."
          ) : (
            <>
              <span>{language === 'te' ? "లాగిన్ అవ్వండి" : "Access Result"}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
