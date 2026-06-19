import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import type { School } from '../services/db';
import { useTranslation } from '../locales/translations';
import type { Language } from '../locales/translations';
import { calculateStudentSummary } from '../utils/calculations';
import type { StudentResultSummary } from '../utils/calculations';
import { generateAIInsights } from '../utils/insights';
import { 
  Search, 
  Calendar, 
  Award, 
  BookOpen, 
  Download, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  CheckCircle, 
  QrCode, 
  Users,
  Sparkles,
  BookOpenCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

interface PublicResultPortalProps {
  language: Language;
}

export const PublicResultPortal: React.FC<PublicResultPortalProps> = ({ language }) => {
  const { t } = useTranslation(language);
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [school, setSchool] = useState<School | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<StudentResultSummary | null>(null);

  // Simulated AI loading steps
  const [loadingStep, setLoadingStep] = useState(0);

  // Stats for the landing hero
  const [stats, setStats] = useState({
    studentsCount: 0,
    classesCount: 0,
    publishedCount: 0,
    avgPercent: 80
  });

  useEffect(() => {
    async function loadSchoolAndStats() {
      try {
        const data = await dbService.getSchoolSettings();
        setSchool(data);

        const statsData = await dbService.getPortalStats();
        setStats(statsData);
      } catch (err) {
        console.error(err);
      }
    }
    loadSchoolAndStats();

    const params = new URLSearchParams(window.location.search);
    const urlRoll = params.get('roll');
    const urlDob = params.get('dob');
    if (urlRoll && urlDob) {
      setRollNumber(urlRoll);
      setDob(urlDob);
      handleSearchDirect(urlRoll, urlDob);
    }
  }, []);

  const handleSearchDirect = async (r: string, d: string) => {
    setLoading(true);
    setErrorMsg('');
    setSearched(true);
    setResult(null);
    setLoadingStep(1);

    try {
      // Step 1: Connecting
      await new Promise(resolve => setTimeout(resolve, 350));
      setLoadingStep(2);
      
      // Step 2: Querying
      const lookup = await dbService.findStudentWithMarks(r, d);
      await new Promise(resolve => setTimeout(resolve, 350));
      
      if (lookup) {
        setLoadingStep(3);
        const summary = calculateStudentSummary(lookup.currentWithMarks, lookup.classStudents);
        
        // Step 3: AI Synthesis
        await new Promise(resolve => setTimeout(resolve, 350));
        setLoadingStep(4);
        await new Promise(resolve => setTimeout(resolve, 250));
        
        setResult(summary);
      } else {
        setErrorMsg(t('searchError'));
        setSearched(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred during lookup.");
      setSearched(false);
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber || !dob) {
      setErrorMsg("Please enter both Roll Number and Date of Birth.");
      return;
    }
    handleSearchDirect(rollNumber, dob);
  };

  const handleReset = () => {
    setRollNumber('');
    setDob('');
    setSearched(false);
    setResult(null);
    setErrorMsg('');
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // --- PDF REPORT CARD GENERATOR ---
  const handleDownloadPDF = () => {
    if (!result || !school) return;

    const doc = new jsPDF();
    const sc = school;
    
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(sc.school_name.toUpperCase(), 105, 16, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(sc.address, 105, 23, { align: "center" });
    doc.text(`U-DISE School Code: ${sc.school_code}  |  Academic Session: ${sc.academic_year}`, 105, 29, { align: "center" });
    doc.text(`Government of Telangana School Education Board`, 105, 35, { align: "center" });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL CUMULATIVE MARKS CARD & PROGRESS REPORT", 105, 52, { align: "center" });

    const qrX = 175;
    const qrY = 48;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.rect(qrX, qrY, 20, 20);

    doc.setFillColor(15, 23, 42);
    doc.rect(qrX + 1, qrY + 1, 5, 5, 'F');
    doc.rect(qrX + 14, qrY + 1, 5, 5, 'F');
    doc.rect(qrX + 1, qrY + 14, 5, 5, 'F');

    doc.setFillColor(255, 255, 255);
    doc.rect(qrX + 2, qrY + 2, 3, 3, 'F');
    doc.rect(qrX + 15, qrY + 2, 3, 3, 'F');
    doc.rect(qrX + 2, qrY + 15, 3, 3, 'F');

    doc.setFillColor(15, 23, 42);
    doc.rect(qrX + 3, qrY + 3, 1, 1, 'F');
    doc.rect(qrX + 16, qrY + 3, 1, 1, 'F');
    doc.rect(qrX + 3, qrY + 16, 1, 1, 'F');

    doc.rect(qrX + 8, qrY + 3, 2, 2, 'F');
    doc.rect(qrX + 11, qrY + 5, 1, 3, 'F');
    doc.rect(qrX + 8, qrY + 9, 3, 1, 'F');
    doc.rect(qrX + 15, qrY + 8, 2, 2, 'F');
    doc.rect(qrX + 14, qrY + 11, 2, 1, 'F');
    doc.rect(qrX + 8, qrY + 12, 1, 4, 'F');
    doc.rect(qrX + 10, qrY + 15, 4, 1, 'F');
    doc.rect(qrX + 15, qrY + 15, 2, 2, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.8);
    doc.line(15, 57, 195, 57);

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.text("Student Name:", 15, 66);
    doc.text("Roll Number / ID:", 15, 72);
    doc.text("Class & Section:", 15, 78);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(result.studentName, 45, 66);
    doc.text(result.rollNumber, 45, 72);
    doc.text(`Class ${result.class} - Section ${result.section}`, 45, 78);

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.text("Father's Name:", 115, 66);
    doc.text("Date of Birth:", 115, 72);
    doc.text("Class Rank:", 115, 78);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(result.studentId ? "Parent Name" : "Parent Name", 145, 66);
    doc.text(new Date(dob || '2011-05-15').toLocaleDateString(), 145, 72);
    doc.text(`#${result.rank} of Class`, 145, 78);

    const tableHeaders = [["Subject", "FA1 (50)", "FA2 (50)", "FA3 (50)", "FA4 (50)", "SA1 (100)", "SA2 (100)", "Total", "Grade"]];
    const tableBody = result.subjectResults.map(sub => [
      sub.subjectName,
      sub.marks.fa1 != null ? sub.marks.fa1 : '-',
      sub.marks.fa2 != null ? sub.marks.fa2 : '-',
      sub.marks.fa3 != null ? sub.marks.fa3 : '-',
      sub.marks.fa4 != null ? sub.marks.fa4 : '-',
      sub.marks.sa1 != null ? sub.marks.sa1 : '-',
      sub.marks.sa2 != null ? sub.marks.sa2 : '-',
      sub.total,
      sub.grade
    ]);

    (doc as any).autoTable({
      head: tableHeaders,
      body: tableBody,
      startY: 88,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], halign: 'center', fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: {
        0: { fontStyle: 'bold', width: 38 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center', fontStyle: 'bold' },
        8: { halign: 'center', fontStyle: 'bold' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFillColor(248, 250, 252);
    doc.rect(15, finalY, 180, 26, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, finalY, 180, 26, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`Total Marks: ${result.totalMarksObtained} / ${result.totalMaxMarks}`, 25, finalY + 10);
    doc.text(`Overall Percentage: ${result.overallPercentage}%`, 25, finalY + 18);
    doc.text(`Overall Grade: ${result.overallGrade}`, 115, finalY + 10);
    doc.text(`Result Status: ${result.overallGrade !== 'F' ? 'PASSED' : 'FAILED'}`, 115, finalY + 18);

    const insights = generateAIInsights(result, 'en');
    const insightsY = finalY + 36;
    doc.setFillColor(239, 246, 255);
    doc.rect(15, insightsY, 180, 42, 'F');
    
    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("AI ACADEMIC ASSESSMENT & PERFORMANCE METRICS", 20, insightsY + 8);
    
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "bold");
    doc.text("Strengths:", 20, insightsY + 16);
    doc.setFont("helvetica", "normal");
    doc.text(insights.strengths, 48, insightsY + 16, { maxWidth: 140 });

    doc.setFont("helvetica", "bold");
    doc.text("Improvements:", 20, insightsY + 24);
    doc.setFont("helvetica", "normal");
    doc.text(insights.improvements, 48, insightsY + 24, { maxWidth: 140 });

    doc.setFont("helvetica", "bold");
    doc.text("Advice & Tips:", 20, insightsY + 32);
    doc.setFont("helvetica", "normal");
    doc.text(insights.advice, 48, insightsY + 32, { maxWidth: 140 });

    const footerY = 252;
    doc.setDrawColor(203, 213, 225);
    doc.line(15, footerY, 70, footerY);
    doc.line(140, footerY, 195, footerY);

    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Class Teacher Signature", 42, footerY + 5, { align: "center" });
    doc.text("HM Signature & Official Stamp", 167, footerY + 5, { align: "center" });

    doc.text(sc.footer_text, 105, 276, { align: "center", maxWidth: 180 });

    doc.save(`${result.studentName.replace(/\s+/g, '_')}_Report_Card.pdf`);
  };

  const handleWhatsAppShare = () => {
    if (!result) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?roll=${result.rollNumber}&dob=${dob}`;
    const textMsg = `*${school ? school.school_name : 'ZPHS AGAMOTHKUR'} - Exam Results*\n\n` +
      `Student Name: *${result.studentName}*\n` +
      `Roll Number: *${result.rollNumber}*\n` +
      `Class & Section: *${result.class} - ${result.section}*\n\n` +
      `*Academic Summary:*\n` +
      `- Total Score: *${result.totalMarksObtained} / ${result.totalMaxMarks}*\n` +
      `- Percentage: *${result.overallPercentage}%*\n` +
      `- Overall Grade: *${result.overallGrade}*\n` +
      `- Rank: *#${result.rank}*\n\n` +
      `View detailed subject-wise marks card and AI academic insights here:\n${shareUrl}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`, '_blank');
  };

  const aiInsights = result ? generateAIInsights(result, language) : null;

  return (
    <div className="space-y-12">
      <AnimatePresence mode="wait">
        
        {/* Loading / Processing screen */}
        {loading && (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-6 max-w-md mx-auto"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse-glow" />
            </div>
            
            <div className="w-full space-y-3.5 text-center">
              <h3 className="font-black text-slate-800 text-lg">Analyzing Academic Profile</h3>
              
              <div className="space-y-2 text-left bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${loadingStep >= 1 ? 'bg-green-500' : 'bg-slate-350'}`} />
                  <span className={loadingStep >= 1 ? 'text-slate-850 font-bold' : ''}>Connecting to secure student registry...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${loadingStep >= 2 ? 'bg-green-500' : 'bg-slate-350'}`} />
                  <span className={loadingStep >= 2 ? 'text-slate-850 font-bold' : ''}>Retrieving transcript records...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${loadingStep >= 3 ? 'bg-green-500' : 'bg-slate-350'}`} />
                  <span className={loadingStep >= 3 ? 'text-slate-850 font-bold' : ''}>Computing class rankings...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${loadingStep >= 4 ? 'bg-green-500' : 'bg-slate-350'}`} />
                  <span className={loadingStep >= 4 ? 'text-slate-850 font-bold' : ''}>Synthesizing AI Academic Insights...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Landing / Search Screen */}
        {!searched && !loading && (
          <motion.div 
            key="search-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12"
          >
            {/* Hero Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
              <span className="inline-flex px-3.5 py-1.5 bg-blue-50/70 border border-blue-100 text-primary font-bold rounded-full text-xs tracking-wide">
                {school ? school.school_name : 'ZPHS AGAMOTHKUR'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                {t('portalTitle')}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 font-medium max-w-md mx-auto">
                Securely lookup academic progress, class rankings, subject averages, and progress report cards.
              </p>
            </div>

            {/* Centered glassmorphic search card */}
            <div className="max-w-md mx-auto relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-blue-500/10 to-indigo-500/5 blur-3xl opacity-60 rounded-3xl" />
              
              <div className="relative bg-white/75 backdrop-blur-md rounded-3xl border border-slate-200/55 p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-black text-slate-900">Search Student Ledger</span>
                  <BookOpenCheck className="h-5 w-5 text-primary" />
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-2.5 text-xs font-semibold mb-5">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSearch} className="space-y-4">
                  {/* Roll Number */}
                  <div className="space-y-1.5">
                    <label htmlFor="rollNumber" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {t('rollNumber')}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="rollNumber"
                        name="rollNumber"
                        type="text"
                        required
                        placeholder={t('rollNumberPlaceholder')}
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="pl-11 pr-4 py-3 w-full border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition bg-slate-50/20"
                      />
                    </div>
                  </div>

                  {/* DOB */}
                  <div className="space-y-1.5">
                    <label htmlFor="dob" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {t('dob')}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="dob"
                        name="dob"
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="pl-11 pr-4 py-3 w-full border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition bg-slate-50/20"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-bold rounded-2xl shadow-md shadow-blue-500/10 transition flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm"
                  >
                    <Sparkles className="h-4 w-4 text-blue-200" />
                    Query Results
                  </button>
                </form>

                {/* tips */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400 leading-normal font-semibold">
                  <div className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded">Demo Hint</div>
                  <p>Enter Roll: <strong className="text-slate-650">700</strong> and DOB: <strong className="text-slate-650">2012-06-01</strong> to see card results.</p>
                </div>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
              <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 shadow-sm flex items-center space-x-3.5 hover:-translate-y-0.5 transition duration-300">
                <div className="p-3 bg-blue-50 text-primary rounded-xl"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('totalStudents')}</p>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{stats.studentsCount}</h3>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 shadow-sm flex items-center space-x-3.5 hover:-translate-y-0.5 transition duration-300">
                <div className="p-3 bg-purple-50 text-purple-650 rounded-xl"><BookOpen className="h-5 w-5" /></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('totalClasses')}</p>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{stats.classesCount}</h3>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 shadow-sm flex items-center space-x-3.5 hover:-translate-y-0.5 transition duration-300">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle className="h-5 w-5" /></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('resultsPublished')}</p>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{stats.publishedCount}</h3>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 shadow-sm flex items-center space-x-3.5 hover:-translate-y-0.5 transition duration-300">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Award className="h-5 w-5" /></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('avgPercentage')}</p>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{stats.avgPercent}%</h3>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* Results Screen */}
        {searched && !loading && result && (
          <motion.div 
            key="result-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8 pb-12"
          >
            {/* Header action menu */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-150">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 hover:bg-slate-50 text-slate-650 hover:text-slate-900 rounded-xl transition text-xs sm:text-sm font-semibold border border-slate-200 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Search Again
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl transition font-bold shadow-sm cursor-pointer text-xs sm:text-sm"
                >
                  <Send className="h-4 w-4" />
                  {t('shareWhatsApp')}
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl transition font-bold shadow-sm cursor-pointer text-xs sm:text-sm"
                >
                  <Download className="h-4 w-4" />
                  {t('downloadPDF')}
                </button>
              </div>
            </div>

            {/* Profile Card & Verification QR */}
            <div className="bg-white/75 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/50 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-400 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-sm">
                  {result.studentName.split(' ').filter(n => n.length > 0).slice(-1)[0]?.charAt(0) || result.studentName.charAt(0)}
                </div>
                
                <div className="space-y-1.5">
                  <span className="px-3 py-1 bg-blue-50 text-primary border border-blue-100 font-bold rounded-full text-[9px] tracking-wide uppercase">
                    {school ? school.school_name : 'ZPHS AGAMOTHKUR'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{result.studentName}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs font-semibold">
                    <span>Roll: <strong className="text-slate-800">{result.rollNumber}</strong></span>
                    <span>Class: <strong className="text-slate-800">{result.class} - {result.section}</strong></span>
                    <span>DOB: <strong className="text-slate-800">{new Date(dob).toLocaleDateString()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-6 w-full md:w-auto border-t border-slate-100 pt-6 md:border-t-0 md:pt-0">
                <div className="flex gap-3">
                  <div className="text-center px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/50 min-w-[76px]">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total</div>
                    <div className="text-base font-black text-slate-800 mt-0.5">{result.totalMarksObtained}<span className="text-[9px] font-normal text-slate-400">/{result.totalMaxMarks}</span></div>
                  </div>
                  
                  <div className="text-center px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/50 min-w-[76px]">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Percent</div>
                    <div className="text-base font-black text-slate-800 mt-0.5">{result.overallPercentage}%</div>
                  </div>

                  <div className="text-center px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/50 min-w-[76px]">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rank</div>
                    <div className="text-base font-black text-primary mt-0.5">#{result.rank}</div>
                  </div>
                </div>

                {/* QR Code stamps */}
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200/50">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1">
                    <QrCode className="h-full w-full text-slate-850" />
                  </div>
                  <div className="text-left pr-2">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verify Report</span>
                    <span className="text-[10px] font-bold text-slate-700">Official Stamp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Cards Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">{t('marksCard')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.subjectResults.map((sub, idx) => {
                  const getTheme = (gradeStr: string) => {
                    switch(gradeStr) {
                      case 'A+': return { bg: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-50 border-emerald-100', progressBg: 'bg-emerald-100' };
                      case 'A': return { bg: 'bg-green-500', text: 'text-green-700 bg-green-50 border-green-100', progressBg: 'bg-green-100' };
                      case 'B': return { bg: 'bg-blue-500', text: 'text-blue-700 bg-blue-50 border-blue-100', progressBg: 'bg-blue-100' };
                      case 'C': return { bg: 'bg-yellow-500', text: 'text-yellow-700 bg-yellow-50 border-yellow-100', progressBg: 'bg-yellow-100' };
                      case 'D': return { bg: 'bg-orange-500', text: 'text-orange-700 bg-orange-50 border-orange-100', progressBg: 'bg-orange-100' };
                      default: return { bg: 'bg-red-500', text: 'text-red-700 bg-red-50 border-red-100', progressBg: 'bg-red-100' };
                    }
                  };

                  const theme = getTheme(sub.grade);

                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-5 rounded-2xl border border-slate-200/55 shadow-sm space-y-4 hover:border-slate-350 transition flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{sub.subjectName}</h4>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Subject Standings</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${theme.text}`}>{sub.grade}</span>
                      </div>

                      {/* Marks grids */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase">FA1-FA2</span>
                          <span className="font-semibold text-slate-700">{(sub.marks.fa1 || 0) + (sub.marks.fa2 || 0)} <span className="text-[8px] text-slate-400 font-normal">/100</span></span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase">FA3-FA4</span>
                          <span className="font-semibold text-slate-700">{(sub.marks.fa3 || 0) + (sub.marks.fa4 || 0)} <span className="text-[8px] text-slate-400 font-normal">/100</span></span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase">SA1-SA2</span>
                          <span className="font-semibold text-slate-700">{(sub.marks.sa1 || 0) + (sub.marks.sa2 || 0)} <span className="text-[8px] text-slate-400 font-normal">/200</span></span>
                        </div>
                      </div>

                      {/* score progress bars */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Total Score:</span>
                          <span className="text-slate-800 font-bold">{sub.total} <span className="text-[9px] font-normal text-slate-400">/ {sub.maxTotal} ({sub.percentage}%)</span></span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${theme.progressBg}`}>
                          <div className={`h-full rounded-full transition-all duration-700 ${theme.bg}`} style={{ width: `${sub.percentage}%` }} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* AI Insights Card */}
            {aiInsights && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-150 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5"
              >
                <h3 className="font-bold text-blue-900 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <Sparkles className="h-4.5 w-4.5 text-blue-600" />
                  {t('aiInsightsTitle')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white/80 backdrop-blur-sm p-4.5 rounded-2xl border border-white">
                    <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest block mb-2">{t('strengths')}</span>
                    <p className="text-xs sm:text-sm text-slate-650 font-medium leading-relaxed">{aiInsights.strengths}</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm p-4.5 rounded-2xl border border-white">
                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block mb-2">{t('improvements')}</span>
                    <p className="text-xs sm:text-sm text-slate-650 font-medium leading-relaxed">{aiInsights.improvements}</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-4.5 rounded-2xl border border-white">
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block mb-2">{t('advice')}</span>
                    <p className="text-xs sm:text-sm text-slate-650 font-medium leading-relaxed">{aiInsights.advice}</p>
                  </div>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
