import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import type { School } from '../services/db';
import { useTranslation } from '../locales/translations';
import type { Language } from '../locales/translations';
import { calculateStudentSummary, getGradeColor } from '../utils/calculations';
import type { StudentResultSummary } from '../utils/calculations';
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
    
    // Page border
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.6);
    doc.rect(5, 5, 200, 287);

    // Primary Header block
    doc.setFillColor(37, 99, 235);
    doc.rect(6, 6, 198, 34, 'F');

    // Title & Government Board
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("GOVERNMENT OF TELANGANA - SCHOOL EDUCATION DEPARTMENT", 105, 12, { align: "center" });

    doc.setFontSize(15);
    doc.text(sc.school_name.toUpperCase(), 105, 20, { align: "center" });

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(sc.address, 105, 26, { align: "center" });
    doc.text(`U-DISE School Code: ${sc.school_code}  |  Academic Session: ${sc.academic_year}`, 105, 32, { align: "center" });

    // Official Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL PROGRESS REGISTER & CUMULATIVE MARKS CARD", 105, 48, { align: "center" });

    // QR Verification Stamp box
    const qrX = 175;
    const qrY = 44;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.rect(qrX, qrY, 18, 18);

    doc.setFillColor(15, 23, 42);
    doc.rect(qrX + 1, qrY + 1, 4, 4, 'F');
    doc.rect(qrX + 13, qrY + 1, 4, 4, 'F');
    doc.rect(qrX + 1, qrY + 13, 4, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(qrX + 2, qrY + 2, 2, 2, 'F');
    doc.rect(qrX + 14, qrY + 2, 2, 2, 'F');
    doc.rect(qrX + 2, qrY + 14, 2, 2, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(qrX + 2.5, qrY + 2.5, 1, 1, 'F');
    doc.rect(qrX + 14.5, qrY + 2.5, 1, 1, 'F');
    doc.rect(qrX + 2.5, qrY + 14.5, 1, 1, 'F');
    // Random dots
    doc.rect(qrX + 7, qrY + 3, 2, 2, 'F');
    doc.rect(qrX + 10, qrY + 5, 1, 3, 'F');
    doc.rect(qrX + 7, qrY + 8, 3, 1, 'F');
    doc.rect(qrX + 14, qrY + 7, 2, 2, 'F');
    doc.rect(qrX + 7, qrY + 11, 1, 4, 'F');
    doc.rect(qrX + 9, qrY + 13, 4, 1, 'F');
    doc.rect(qrX + 14, qrY + 13, 2, 2, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.6);
    doc.line(10, 64, 200, 64);

    // Student Details
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.text("Student Name:", 10, 71);
    doc.text("Roll Number / ID:", 10, 76);
    doc.text("Class & Section:", 10, 81);
    doc.text("Academic Year:", 10, 86);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(result.studentName, 38, 71);
    doc.text(result.rollNumber, 38, 76);
    doc.text(`Class ${result.class} - Section ${result.section}`, 38, 81);
    doc.text(sc.academic_year, 38, 86);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Father's Name:", 110, 71);
    doc.text("Date of Birth:", 110, 76);
    doc.text("Attendance:", 110, 81);
    doc.text("Class Rank / Status:", 110, 86);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(result.studentId ? (result.remarks && (result as any).father_name || "Parent Name") : "Parent Name", 142, 71);
    doc.text(new Date(dob || '2011-05-15').toLocaleDateString(), 142, 76);
    doc.text(`${result.attendance.percentage}% (${result.attendance.presentDays}/${result.attendance.workingDays} Days)`, 142, 81);
    doc.text(`#${result.rank} of Class / ${result.overallGrade !== 'F' ? 'PASSED' : 'FAILED'}`, 142, 86);

    // Main Marks Register Table
    const tableHeaders = [["Subject", "FA1 (20)", "FA2 (20)", "FA3 (20)", "FA4 (20)", "FA Tot (80)", "SA1 (100)", "SA2 (100)", "Grand Tot (280)", "Grade", "GP"]];
    const tableBody = result.subjectResults.map(sub => {
      const fa1 = sub.marks.fa1 != null ? sub.marks.fa1 : 0;
      const fa2 = sub.marks.fa2 != null ? sub.marks.fa2 : 0;
      const fa3 = sub.marks.fa3 != null ? sub.marks.fa3 : 0;
      const fa4 = sub.marks.fa4 != null ? sub.marks.fa4 : 0;
      const faTotal = fa1 + fa2 + fa3 + fa4;
      const sa1 = sub.marks.sa1 != null ? sub.marks.sa1 : 0;
      const sa2 = sub.marks.sa2 != null ? sub.marks.sa2 : 0;
      const total = faTotal + sa1 + sa2;
      return [
        sub.subjectName,
        sub.marks.fa1 != null ? sub.marks.fa1 : '-',
        sub.marks.fa2 != null ? sub.marks.fa2 : '-',
        sub.marks.fa3 != null ? sub.marks.fa3 : '-',
        sub.marks.fa4 != null ? sub.marks.fa4 : '-',
        faTotal,
        sub.marks.sa1 != null ? sub.marks.sa1 : '-',
        sub.marks.sa2 != null ? sub.marks.sa2 : '-',
        total,
        sub.grade,
        sub.gradePoints
      ];
    });

    (doc as any).autoTable({
      head: tableHeaders,
      body: tableBody,
      startY: 92,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], halign: 'center', fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, halign: 'center' },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', width: 36 },
        5: { fontStyle: 'bold', fillColor: [248, 250, 252] },
        8: { fontStyle: 'bold', fillColor: [240, 246, 255] },
        9: { fontStyle: 'bold' },
        10: { fontStyle: 'bold' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 6;

    // Academic Summary Row (GPA / CGPA / Grade)
    doc.setFillColor(248, 250, 252);
    doc.rect(10, finalY, 190, 18, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(10, finalY, 190, 18, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(`Total Marks Obtained: ${result.totalMarksObtained} / ${result.totalMaxMarks} (${result.overallPercentage}%)`, 15, finalY + 7);
    doc.text(`Grade Point Average (GPA): ${result.gpa.toFixed(2)}`, 15, finalY + 13);
    doc.text(`Overall Grade: ${result.overallGrade}`, 120, finalY + 7);
    doc.text(`Cumulative GPA (CGPA): ${result.cgpa.toFixed(2)}`, 120, finalY + 13);

    // Attendance & Co-curricular tables side by side
    const secondaryY = finalY + 22;
    
    // Attendance Table
    (doc as any).autoTable({
      head: [["Attendance Record", "Days / %"]],
      body: [
        ["Total Working Days", result.attendance.workingDays],
        ["Present Days", result.attendance.presentDays],
        ["Absent Days", result.attendance.absentDays],
        ["Attendance Percentage", `${result.attendance.percentage}%`]
      ],
      startY: secondaryY,
      margin: { left: 10 },
      tableWidth: 92,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5 },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'center' } }
    });

    // Co-Curricular Grade Table
    (doc as any).autoTable({
      head: [["Co-Curricular Domain", "Grade / Rating"]],
      body: [
        ["Sports & Games", result.cocurricular.sports],
        ["Discipline & Morals", result.cocurricular.discipline],
        ["Leadership Qualities", result.cocurricular.leadership],
        ["Co-curricular Participation", result.cocurricular.participation]
      ],
      startY: secondaryY,
      margin: { left: 108 },
      tableWidth: 92,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5 },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'center' } }
    });

    // Teacher Remarks box
    const remarksY = Math.max((doc as any).lastAutoTable.finalY, secondaryY + 34) + 6;
    doc.setFillColor(239, 246, 255); // soft blue
    doc.rect(10, remarksY, 190, 24, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.rect(10, remarksY, 190, 24, 'S');

    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("CLASS TEACHER EVALUATION & ACADEMIC REMARKS", 15, remarksY + 5);

    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Key Strengths: ${result.remarks.strengths}`, 15, remarksY + 10);
    doc.text(`Areas of Improvement: ${result.remarks.improvements}`, 15, remarksY + 15);
    doc.text(`HM/Teacher Suggestions: ${result.remarks.suggestions}`, 15, remarksY + 20);

    // Parent Acknowledgement & Signatures
    const signaturesY = remarksY + 38;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(10, signaturesY, 60, signaturesY);
    doc.line(80, signaturesY, 130, signaturesY);
    doc.line(150, signaturesY, 200, signaturesY);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Parent's Signature", 35, signaturesY + 4, { align: "center" });
    doc.text("Class Teacher's Signature", 105, signaturesY + 4, { align: "center" });
    doc.text("HM Signature & Official Stamp", 175, signaturesY + 4, { align: "center" });

    // Official Stamp Branding
    doc.setFontSize(7);
    doc.text(sc.footer_text, 105, signaturesY + 12, { align: "center", maxWidth: 170 });

    doc.save(`${result.studentName.replace(/\s+/g, '_')}_Government_Report_Card.pdf`);
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
            <div className="bg-white/75 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/50 flex flex-col lg:flex-row gap-6 justify-between items-stretch">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img 
                  src={school?.logo_url || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200"}
                  alt="School Logo"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-250/50 bg-white"
                />
                
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-0.5 bg-blue-50 text-primary border border-blue-100 font-bold rounded-full text-[9px] tracking-wide uppercase">
                      {school ? school.school_name : 'ZPHS AGAMOTHKUR'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[9px] font-bold">
                      Academic Year: {school?.academic_year || '2025-2026'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{result.studentName}</h2>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs font-semibold justify-center sm:justify-start">
                    <span>Roll Number: <strong className="text-slate-800">{result.rollNumber}</strong></span>
                    <span>Class & Section: <strong className="text-slate-800">Class {result.class} - {result.section}</strong></span>
                    <span>Date of Birth: <strong className="text-slate-800">{new Date(dob).toLocaleDateString()}</strong></span>
                    <span>Father's Name: <strong className="text-slate-800">{result.studentId ? (result.remarks && (result as any).father_name || "Parent Name") : "Parent Name"}</strong></span>
                  </div>
                </div>
              </div>

              {/* QR Code stamps */}
              <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-slate-100 pt-5 lg:border-t-0 lg:pt-0">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/50">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1">
                    <QrCode className="h-full w-full text-slate-850" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Verify Report</span>
                    <span className="text-[10px] font-black text-slate-700">Telangana Board</span>
                    <span className="block text-[8px] text-green-600 font-bold">Digital Sealed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white/70 backdrop-blur-md p-4.5 rounded-2xl border border-slate-200/50 shadow-sm text-center">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Overall GPA</div>
                <div className="text-2xl font-black text-primary mt-1">{result.gpa.toFixed(2)}</div>
                <span className="text-[8px] font-bold text-slate-400">10-Point Scale</span>
              </div>
              <div className="bg-white/70 backdrop-blur-md p-4.5 rounded-2xl border border-slate-200/50 shadow-sm text-center">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Overall CGPA</div>
                <div className="text-2xl font-black text-blue-650 mt-1">{result.cgpa.toFixed(2)}</div>
                <span className="text-[8px] font-bold text-slate-400">Cumulative GP</span>
              </div>
              <div className="bg-white/70 backdrop-blur-md p-4.5 rounded-2xl border border-slate-200/50 shadow-sm text-center">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Overall Grade</div>
                <div className="mt-1">
                  <span className={`inline-flex px-3.5 py-0.5 rounded-full text-xs font-black border ${getGradeColor(result.overallGrade)}`}>
                    {result.overallGrade}
                  </span>
                </div>
                <span className="text-[8px] font-bold text-slate-400 mt-1 block">TS Board Standard</span>
              </div>
              <div className="bg-white/70 backdrop-blur-md p-4.5 rounded-2xl border border-slate-200/50 shadow-sm text-center">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Score</div>
                <div className="text-xl font-black text-slate-800 mt-1">{result.totalMarksObtained}<span className="text-xs font-normal text-slate-400">/{result.totalMaxMarks}</span></div>
                <span className="text-[8px] font-bold text-slate-400">Grand Aggregate</span>
              </div>
              <div className="bg-white/70 backdrop-blur-md p-4.5 rounded-2xl border border-slate-200/50 shadow-sm text-center">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Class Rank</div>
                <div className="text-xl font-black text-amber-600 mt-1">#{result.rank}</div>
                <span className="text-[8px] font-bold text-slate-400">Position in Section</span>
              </div>
              <div className="bg-white/70 backdrop-blur-md p-4.5 rounded-2xl border border-slate-200/50 shadow-sm text-center">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Attendance</div>
                <div className="text-xl font-black text-emerald-600 mt-1">{result.attendance.percentage}%</div>
                <span className="text-[8px] font-bold text-slate-400">{result.attendance.presentDays}/{result.attendance.workingDays} Days</span>
              </div>
            </div>

            {/* Subject Cards Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">Subject-Wise Marks Ledger</h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {result.subjectResults.map((sub, idx) => {
                  const theme = getGradeColor(sub.grade);

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
                          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Academic Performance</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${theme}`}>{sub.grade}</span>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-650 font-bold rounded-lg text-[10px]">{sub.gradePoints} GP</span>
                        </div>
                      </div>

                      {/* Marks grids for FAs and SAs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase tracking-wider border-b border-slate-100 pb-1">
                            <span>Formative (FA)</span>
                            <span className="text-slate-700 font-black">
                              {((sub.marks.fa1||0)+(sub.marks.fa2||0)+(sub.marks.fa3||0)+(sub.marks.fa4||0))} / 80
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-center text-xs">
                            <div className="bg-white p-1 rounded border border-slate-200/50">
                              <span className="block text-[8px] text-slate-400 font-bold">FA1</span>
                              <span className="font-bold text-slate-700">{sub.marks.fa1 ?? '-'}</span>
                            </div>
                            <div className="bg-white p-1 rounded border border-slate-200/50">
                              <span className="block text-[8px] text-slate-400 font-bold">FA2</span>
                              <span className="font-bold text-slate-700">{sub.marks.fa2 ?? '-'}</span>
                            </div>
                            <div className="bg-white p-1 rounded border border-slate-200/50">
                              <span className="block text-[8px] text-slate-400 font-bold">FA3</span>
                              <span className="font-bold text-slate-700">{sub.marks.fa3 ?? '-'}</span>
                            </div>
                            <div className="bg-white p-1 rounded border border-slate-200/50">
                              <span className="block text-[8px] text-slate-400 font-bold">FA4</span>
                              <span className="font-bold text-slate-700">{sub.marks.fa4 ?? '-'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase tracking-wider border-b border-slate-100 pb-1">
                            <span>Summative (SA)</span>
                            <span className="text-slate-700 font-black">
                              {((sub.marks.sa1||0)+(sub.marks.sa2||0))} / 200
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-center text-xs">
                            <div className="bg-white p-1.5 rounded border border-slate-200/50">
                              <span className="block text-[8px] text-slate-400 font-bold">SA1</span>
                              <span className="font-bold text-slate-700">{sub.marks.sa1 ?? '-'}</span>
                            </div>
                            <div className="bg-white p-1.5 rounded border border-slate-200/50">
                              <span className="block text-[8px] text-slate-400 font-bold">SA2</span>
                              <span className="font-bold text-slate-700">{sub.marks.sa2 ?? '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* score progress bars */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Total Subject Score:</span>
                          <span className="text-slate-800 font-bold">{sub.total} <span className="text-[9px] font-normal text-slate-400">/ {sub.maxTotal} ({sub.percentage}%)</span></span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 bg-primary`} 
                            style={{ width: `${sub.percentage}%` }} 
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Attendance & Co-Curricular Extra Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attendance Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-slate-900 text-sm">Attendance Register Summary</h3>
                </div>
                <div className="flex items-center gap-6">
                  {/* Attendance Gauge */}
                  <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full">
                    <span className="font-black text-slate-800 text-base">{result.attendance.percentage}%</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 w-full text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">Working Days</span>
                      <strong className="text-slate-850 font-bold">{result.attendance.workingDays} Days</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">Present Days</span>
                      <strong className="text-emerald-700 font-bold">{result.attendance.presentDays} Days</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 col-span-2">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">Absent Days</span>
                      <strong className="text-red-650 font-bold">{result.attendance.absentDays} Days (Excused & Unexcused)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Co-Curricular Rating Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Co-Curricular & Domain Assessment</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <span className="text-slate-500 font-medium">Sports & Games</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg font-black">{result.cocurricular.sports}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <span className="text-slate-500 font-medium">Discipline & Morals</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg font-black">{result.cocurricular.discipline}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <span className="text-slate-500 font-medium">Leadership Qualities</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg font-black">{result.cocurricular.leadership}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <span className="text-slate-500 font-medium">Participation</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg font-black">{result.cocurricular.participation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Evaluation / Teacher Remarks */}
            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-150 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <h3 className="font-bold text-blue-900 flex items-center gap-2 text-xs uppercase tracking-widest">
                <Sparkles className="h-4.5 w-4.5 text-blue-600" />
                Class Teacher Academic Evaluation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white/80 backdrop-blur-sm p-4.5 rounded-2xl border border-white">
                  <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest block mb-2">Key Strengths</span>
                  <p className="text-xs sm:text-sm text-slate-650 font-medium leading-relaxed">{result.remarks.strengths}</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-4.5 rounded-2xl border border-white">
                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block mb-2">Areas of Improvement</span>
                  <p className="text-xs sm:text-sm text-slate-650 font-medium leading-relaxed">{result.remarks.improvements}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-4.5 rounded-2xl border border-white">
                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block mb-2">Suggestions for Parents</span>
                  <p className="text-xs sm:text-sm text-slate-650 font-medium leading-relaxed">{result.remarks.suggestions}</p>
                </div>
              </div>
            </div>

            {/* Official Signature Lines */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-200/70 pt-8 text-center text-xs text-slate-400 font-semibold">
              <div className="space-y-3">
                <div className="h-10 flex items-end justify-center"><span className="text-[10px] text-slate-350 border-b border-dashed border-slate-300 w-2/3 pb-1">Awaiting Signature</span></div>
                <div>Parent Acknowledgement</div>
              </div>
              <div className="space-y-3">
                <div className="h-10 flex items-end justify-center font-bold text-slate-800 text-[10px]"><span className="border-b border-slate-300 w-2/3 pb-1 text-emerald-600">VERIFIED DIGITAL</span></div>
                <div>Class Teacher Signature</div>
              </div>
              <div className="space-y-3">
                <div className="h-10 flex items-end justify-center font-bold text-slate-850 text-[10px]"><span className="border-b border-slate-300 w-2/3 pb-1 text-blue-600">M.S. Rao (Principal)</span></div>
                <div>Headmaster Signature & Stamp</div>
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
