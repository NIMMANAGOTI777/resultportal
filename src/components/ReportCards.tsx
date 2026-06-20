import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import type { Student, Subject, Mark, School } from '../services/db';
import { calculateStudentSummary } from '../utils/calculations';
import type { StudentResultSummary } from '../utils/calculations';
import { generateAIInsights } from '../utils/insights';
import { useTranslation } from '../locales/translations';
import type { Language } from '../locales/translations';
import { Search, Download, Award, X, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportCardsProps {
  language: Language;
}

export const ReportCards: React.FC<ReportCardsProps> = ({ language }) => {
  const { t } = useTranslation(language);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState('8');
  const [selectedSection, setSelectedSection] = useState('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentSummary, setSelectedStudentSummary] = useState<StudentResultSummary | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const studList = await dbService.getStudents();
        const subList = await dbService.getSubjects();
        const markList = await dbService.getAllMarks();
        const schoolData = await dbService.getSchoolSettings();

        setStudents(studList);
        setSubjects(subList);
        setMarks(markList);
        setSchool(schoolData);
      } catch (err) {
        console.error("Error loading report cards data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="text-slate-400 font-medium">{t('loading')}</span>
      </div>
    );
  }

  // --- FILTER CLASS & SECTION STUDENTS ---
  const classStudents = students.filter(s => s.class === selectedClass && s.section === selectedSection);

  // Map each student to their computed summary
  const studentSummaries: StudentResultSummary[] = classStudents.map(student => {
    // build student marks object
    const studentMarks: { [subjectName: string]: any } = {};
    subjects.forEach(sub => {
      const record = marks.find(m => m.student_id === student.id && m.subject_id === sub.id);
      if (record) {
        studentMarks[sub.subject_name] = record;
      }
    });

    const studentWithMarksObj = {
      studentId: student.id,
      studentName: student.student_name,
      admissionNumber: student.admission_number,
      class: student.class,
      section: student.section,
      subjects: studentMarks
    };

    // Calculate rank inside classStudents
    const allStudentsMapped = classStudents.map(cs => {
      const csMarks: { [subName: string]: any } = {};
      subjects.forEach(sub => {
        const r = marks.find(m => m.student_id === cs.id && m.subject_id === sub.id);
        if (r) csMarks[sub.subject_name] = r;
      });
      return {
        studentId: cs.id,
        studentName: cs.student_name,
        admissionNumber: cs.admission_number,
        class: cs.class,
        section: cs.section,
        subjects: csMarks
      };
    });

    return calculateStudentSummary(studentWithMarksObj, allStudentsMapped);
  });

  // Sort summaries by Rank (ascending)
  studentSummaries.sort((a, b) => a.rank - b.rank);

  const filteredSummaries = studentSummaries.filter(summary => 
    summary.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.admissionNumber.includes(searchQuery)
  );

  const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort();
  const uniqueSections = Array.from(new Set(students.map(s => s.section))).sort();

  const handleOpenCard = (summary: StudentResultSummary) => {
    setSelectedStudentSummary(summary);
    setShowModal(true);
  };

  // --- PDF REPORT CARD GENERATOR ---
  const handleDownloadPDF = (summary: StudentResultSummary) => {
    if (!summary || !school) return;

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
    doc.text("Admission Number / ID:", 10, 76);
    doc.text("Class & Section:", 10, 81);
    doc.text("Academic Year:", 10, 86);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(summary.studentName, 38, 71);
    doc.text(summary.admissionNumber, 38, 76);
    doc.text(`Class ${summary.class} - Section ${summary.section}`, 38, 81);
    doc.text(sc.academic_year, 38, 86);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Father's Name:", 110, 71);
    doc.text("Phone Number:", 110, 76);
    doc.text("Attendance:", 110, 81);
    doc.text("Class Rank / Status:", 110, 86);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const matchStud = students.find(s => s.id === summary.studentId);
    doc.text(matchStud ? (matchStud.father_name || "Parent Name") : "Parent Name", 142, 71);
    doc.text(matchStud ? (matchStud.phone || '—') : '—', 142, 76);
    doc.text(`${summary.attendance.percentage}% (${summary.attendance.presentDays}/${summary.attendance.workingDays} Days)`, 142, 81);
    doc.text(`#${summary.rank} of Class / ${summary.overallGrade !== 'F' ? 'PASSED' : 'FAILED'}`, 142, 86);

    // Main Marks Register Table
    const tableHeaders = [["Subject", "FA1 (20)", "FA2 (20)", "FA3 (20)", "FA4 (20)", "FA Tot (80)", "SA1 (100)", "SA2 (100)", "Grand Tot (280)", "Grade", "GP"]];
    const tableBody = summary.subjectResults.map(sub => {
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

    autoTable(doc, {
      head: tableHeaders,
      body: tableBody,
      startY: 92,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], halign: 'center', fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, halign: 'center' },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 36 },
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
    doc.text(`Total Marks Obtained: ${summary.totalMarksObtained} / ${summary.totalMaxMarks} (${summary.overallPercentage}%)`, 15, finalY + 7);
    doc.text(`Grade Point Average (GPA): ${summary.gpa.toFixed(2)}`, 15, finalY + 13);
    doc.text(`Overall Grade: ${summary.overallGrade}`, 120, finalY + 7);
    doc.text(`Cumulative GPA (CGPA): ${summary.cgpa.toFixed(2)}`, 120, finalY + 13);

    // Attendance & Co-curricular tables side by side
    const secondaryY = finalY + 22;
    
    // Attendance Table
    autoTable(doc, {
      head: [["Attendance Record", "Days / %"]],
      body: [
        ["Total Working Days", summary.attendance.workingDays],
        ["Present Days", summary.attendance.presentDays],
        ["Absent Days", summary.attendance.absentDays],
        ["Attendance Percentage", `${summary.attendance.percentage}%`]
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
    autoTable(doc, {
      head: [["Co-Curricular Domain", "Grade / Rating"]],
      body: [
        ["Sports & Games", summary.cocurricular.sports],
        ["Discipline & Morals", summary.cocurricular.discipline],
        ["Leadership Qualities", summary.cocurricular.leadership],
        ["Co-curricular Participation", summary.cocurricular.participation]
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
    doc.text(`Key Strengths: ${summary.remarks.strengths}`, 15, remarksY + 10);
    doc.text(`Areas of Improvement: ${summary.remarks.improvements}`, 15, remarksY + 15);
    doc.text(`HM/Teacher Suggestions: ${summary.remarks.suggestions}`, 15, remarksY + 20);

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

    doc.save(`${summary.studentName.replace(/\s+/g, '_')}_Government_Report_Card.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Report Card Directory</h1>
          <p className="text-sm text-slate-400 font-medium">Browse, view progress reports, and download PDF report cards for students.</p>
        </div>

        {/* Filter selectors */}
        <div className="flex gap-2.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/40">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            {uniqueSections.map(sec => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory search control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3.5 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search students in this class by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10.5 pr-4 py-2.5 w-full border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-sm text-slate-800 font-medium transition bg-slate-50/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Grid of Student standouts */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredSummaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="py-4.5 px-6">Rank</th>
                  <th className="py-4.5 px-6">Admission Number</th>
                  <th className="py-4.5 px-6">Student Name</th>
                  <th className="py-4.5 px-6 text-center">Score</th>
                  <th className="py-4.5 px-6 text-center">Percentage</th>
                  <th className="py-4.5 px-6 text-center">Grade</th>
                  <th className="py-4.5 px-6 text-center">Report Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredSummaries.map((summary) => {
                  const getRankBadgeColor = (r: number) => {
                    if (r === 1) return 'bg-amber-50 text-amber-600 border-amber-100';
                    if (r === 2) return 'bg-slate-100 text-slate-600 border-slate-200';
                    if (r === 3) return 'bg-orange-50 text-orange-600 border-orange-100';
                    return 'bg-slate-50 text-slate-400 border-slate-100';
                  };

                  return (
                    <tr key={summary.studentId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6 font-black">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black border ${getRankBadgeColor(summary.rank)}`}>
                          {summary.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">{summary.admissionNumber}</td>
                      <td className="py-4 px-6 font-bold text-slate-900 group-hover:text-primary transition-colors">{summary.studentName}</td>
                      <td className="py-4 px-6 text-center font-bold text-slate-700">{summary.totalMarksObtained} <span className="text-[10px] font-medium text-slate-400">/{summary.totalMaxMarks}</span></td>
                      <td className="py-4 px-6 text-center font-black text-slate-700">{summary.overallPercentage}%</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                          summary.overallGrade === 'A+' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                          summary.overallGrade === 'A' ? 'text-green-700 bg-green-50 border-green-100' :
                          summary.overallGrade === 'B' ? 'text-blue-700 bg-blue-50 border-blue-100' :
                          summary.overallGrade === 'C' ? 'text-yellow-700 bg-yellow-50 border-yellow-100' :
                          summary.overallGrade === 'D' ? 'text-orange-700 bg-orange-50 border-orange-100' :
                          'text-red-700 bg-red-50 border-red-100'
                        }`}>
                          {summary.overallGrade}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenCard(summary)}
                            className="flex items-center gap-1 px-3 py-1.5 hover:bg-primary/5 text-primary rounded-lg border border-primary/20 hover:border-primary/40 font-bold transition text-xs cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View Card
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(summary)}
                            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg transition-custom cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <p className="text-slate-450 font-bold">No students found in Class {selectedClass} - {selectedSection}</p>
            <p className="text-xs text-slate-400 mt-1">Please seed students or upload an Excel sheet to view records.</p>
          </div>
        )}
      </div>

      {/* --- FLOATING MODAL CARD COMPONENT --- */}
      <AnimatePresence>
        {showModal && selectedStudentSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4.5 bg-slate-50 border-b border-slate-100 rounded-t-3xl">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-bold text-slate-900">Student Progress Report Card</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPDF(selectedStudentSummary)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1.5 hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Profile Card & Verification QR */}
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/50 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-primary to-blue-400 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-sm">
                      {selectedStudentSummary.studentName.split(' ').filter(n => n.length > 0).slice(-1)[0]?.charAt(0) || selectedStudentSummary.studentName.charAt(0)}
                    </div>
                    
                    <div className="space-y-1">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">{selectedStudentSummary.studentName}</h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-slate-500 text-xs font-semibold">
                        <span>Admission Number: <strong className="text-slate-800">{selectedStudentSummary.admissionNumber}</strong></span>
                        <span>Class: <strong className="text-slate-800">{selectedStudentSummary.class} - {selectedStudentSummary.section}</strong></span>
                        <span>Rank: <strong className="text-primary">#{selectedStudentSummary.rank}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Scores block */}
                  <div className="flex gap-3">
                    <div className="text-center px-3.5 py-2 bg-white rounded-xl border border-slate-200/50 min-w-[70px]">
                      <div className="text-[8px] text-slate-400 font-bold uppercase">Total</div>
                      <div className="text-sm font-black text-slate-800 mt-0.5">{selectedStudentSummary.totalMarksObtained}<span className="text-[9px] font-normal text-slate-400">/{selectedStudentSummary.totalMaxMarks}</span></div>
                    </div>
                    
                    <div className="text-center px-3.5 py-2 bg-white rounded-xl border border-slate-200/50 min-w-[70px]">
                      <div className="text-[8px] text-slate-400 font-bold uppercase">Percent</div>
                      <div className="text-sm font-black text-slate-800 mt-0.5">{selectedStudentSummary.overallPercentage}%</div>
                    </div>

                    <div className="text-center px-3.5 py-2 bg-white rounded-xl border border-slate-200/50 min-w-[70px]">
                      <div className="text-[8px] text-slate-400 font-bold uppercase">Grade</div>
                      <div className="text-sm font-black text-primary mt-0.5">{selectedStudentSummary.overallGrade}</div>
                    </div>
                  </div>
                </div>

                {/* Subject Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStudentSummary.subjectResults.map((sub, idx) => {
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
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-slate-300 transition flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">{sub.subjectName}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Subject Performance</span>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${theme.text}`}>
                            {sub.grade}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                          <div>
                            <span className="block text-[8px] text-slate-400 font-bold uppercase">FA1-FA2</span>
                            <span className="font-semibold text-slate-700">{(sub.marks.fa1 || 0) + (sub.marks.fa2 || 0)} <span className="text-[8px] text-slate-400">/100</span></span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400 font-bold uppercase">FA3-FA4</span>
                            <span className="font-semibold text-slate-700">{(sub.marks.fa3 || 0) + (sub.marks.fa4 || 0)} <span className="text-[8px] text-slate-400">/100</span></span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400 font-bold uppercase">SA1-SA2</span>
                            <span className="font-semibold text-slate-700">{(sub.marks.sa1 || 0) + (sub.marks.sa2 || 0)} <span className="text-[8px] text-slate-400">/200</span></span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-400">Total Score:</span>
                            <span className="text-slate-800 font-bold">{sub.total} <span className="text-[9px] font-normal text-slate-400">/ {sub.maxTotal} ({sub.percentage}%)</span></span>
                          </div>

                          <div className={`w-full h-2 rounded-full overflow-hidden ${theme.progressBg}`}>
                            <div className={`h-full rounded-full transition-all duration-700 ${theme.bg}`} style={{ width: `${sub.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Insights */}
                {generateAIInsights(selectedStudentSummary, 'en') && (() => {
                  const insights = generateAIInsights(selectedStudentSummary, language);
                  return (
                    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-100 rounded-2xl p-5 shadow-sm space-y-4">
                      <h3 className="font-bold text-blue-900 flex items-center gap-2 text-xs uppercase tracking-widest">
                        <Award className="h-4 w-4 text-blue-600" />
                        AI Assessment Recommendation
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white">
                          <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest block mb-1">Key Strengths</span>
                          <p className="text-xs text-slate-650 font-medium leading-relaxed">{insights.strengths}</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white">
                          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block mb-1">Improvement Areas</span>
                          <p className="text-xs text-slate-650 font-medium leading-relaxed">{insights.improvements}</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white">
                          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block mb-1">HM/Teacher Advice</span>
                          <p className="text-xs text-slate-650 font-medium leading-relaxed">{insights.advice}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
