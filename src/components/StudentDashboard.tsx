import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import type { School } from '../services/db';
import { useRouter } from './Router';
import { 
  calculateStudentSummary, 
  getGradeColor
} from '../utils/calculations';
import type { StudentResultSummary } from '../utils/calculations';
import { 
  Award, 
  BookOpen, 
  Download, 
  AlertCircle, 
  TrendingUp, 
  Trophy, 
  Activity, 
  UserCheck, 
  LogOut,
  Calendar,
  Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentDashboardProps {
  language: 'en' | 'te';
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ language }) => {
  const { navigate } = useRouter();
  
  const [loadedStudent, setLoadedStudent] = useState<any>(null);
  const [result, setResult] = useState<StudentResultSummary | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const schoolData = await dbService.getSchoolSettings();
        setSchool(schoolData);

        const currentStudent = await dbService.getCurrentUser();
        if (!currentStudent || currentStudent.role !== 'student') {
          navigate('/student-login');
          return;
        }

        // Fetch marks and classmate records for ranking via secure RPC
        const admissionNum = currentStudent.admissionNumber || '';
        const nameVal = currentStudent.name || '';
        const lookup = await dbService.findStudentWithMarks(admissionNum, nameVal);
        
        if (lookup) {
          setLoadedStudent(lookup.student);
          const summary = calculateStudentSummary(lookup.currentWithMarks, lookup.classStudents);
          setResult(summary);
        } else {
          setError("Failed to locate marks record in database.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading your profile.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    await dbService.logout();
    navigate('/student-login');
  };

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

    // Student profile metadata block
    doc.setFillColor(248, 250, 252);
    doc.rect(8, 54, 194, 32, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(8, 54, 194, 32);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    
    // Column 1
    doc.text("Student Name:", 12, 60);
    doc.text("Admission Number:", 12, 66);
    doc.text("Father's Name:", 12, 72);
    doc.text("Phone Number:", 12, 78);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(result.studentName, 58, 60);
    doc.text(result.admissionNumber, 58, 66);
    doc.text(loadedStudent?.father_name || '', 58, 72);
    doc.text(loadedStudent?.phone || '', 58, 78);

    // Column 2
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Class & Section:", 125, 60);
    doc.text("Overall Grade / GPA:", 125, 66);
    doc.text("Class Rank:", 125, 72);
    doc.text("Attendance Percentage:", 125, 78);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(`${result.class} - ${result.section}`, 168, 60);
    doc.text(`${result.overallGrade} / ${result.gpa.toFixed(1)} GP`, 168, 66);
    doc.text(`${result.rank} / ${result.subjectResults[0] ? 'Class Topper' : 'Student'}`, 168, 72);
    doc.text(`${result.attendance.percentage}% (${result.attendance.presentDays}/${result.attendance.workingDays} Days)`, 168, 78);

    // Subject Performance Table Header
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text("I. ACADEMIC EVALUATION REGISTER (SUBJECTWISE)", 8, 93);

    // Build table rows
    const tableBody = result.subjectResults.map(sub => [
      sub.subjectName,
      sub.marks.fa1 != null ? sub.marks.fa1 : '-',
      sub.marks.fa2 != null ? sub.marks.fa2 : '-',
      sub.marks.fa3 != null ? sub.marks.fa3 : '-',
      sub.marks.fa4 != null ? sub.marks.fa4 : '-',
      sub.marks.sa1 != null ? sub.marks.sa1 : '-',
      sub.marks.sa2 != null ? sub.marks.sa2 : '-',
      sub.total,
      sub.maxTotal,
      sub.grade
    ]);

    // Add aggregate total row
    tableBody.push([
      "GRAND TOTAL",
      "", "", "", "", "", "",
      result.totalMarksObtained.toString(),
      result.totalMaxMarks.toString(),
      result.overallGrade
    ]);

    autoTable(doc, {
      startY: 96,
      head: [['Subject Name', 'FA1\n(20)', 'FA2\n(20)', 'FA3\n(20)', 'FA4\n(20)', 'SA1\n(100)', 'SA2\n(100)', 'Marks\nObt.', 'Max\nMarks', 'Grade']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center', fontStyle: 'bold' },
        8: { halign: 'center' },
        9: { halign: 'center', fontStyle: 'bold' }
      },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      didParseCell: (data: any) => {
        // Highlight bottom row
        if (data.row.index === tableBody.length - 1) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;

    // Co-Curricular & Remarks Section
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text("II. CO-CURRICULAR ACTIVITIES & REMARKS", 8, finalY);

    doc.setFillColor(250, 250, 250);
    doc.rect(8, finalY + 3, 194, 38, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(8, finalY + 3, 194, 38);

    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Health & Physical Ed:", 12, finalY + 9);
    doc.text("Art & Cultural Ed:", 12, finalY + 15);
    doc.text("Teacher Remarks:", 90, finalY + 9);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(`${result.cocurricular.sports || 'A1'}`, 48, finalY + 9);
    doc.text(`${result.cocurricular.participation || 'A1'}`, 48, finalY + 15);

    // Remarks paragraph wrapping
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const remarkLines = doc.splitTextToSize(
      `${result.remarks.strengths} ${result.remarks.improvements} ${sc.footer_text}`,
      105
    );
    doc.text(remarkLines, 90, finalY + 14);

    // Signatures
    const sigY = finalY + 54;
    doc.setDrawColor(203, 213, 225);
    doc.line(15, sigY, 60, sigY);
    doc.line(85, sigY, 130, sigY);
    doc.line(150, sigY, 195, sigY);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Class Teacher Signature", 37, sigY + 4, { align: "center" });
    doc.text("Headmaster / Principal", 107, sigY + 4, { align: "center" });
    doc.text("Parent / Guardian", 172, sigY + 4, { align: "center" });

    doc.save(`ProgressCard_${result.admissionNumber}_${result.studentName.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading report card data...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">Error Loading Results</h3>
        <p className="text-sm text-slate-500">{error || "No student record loaded."}</p>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome & Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-550/10 text-emerald-650 text-[10px] font-extrabold uppercase tracking-wider rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Student Dashboard</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'te' ? `నమస్కారం, ${result.studentName}` : `Welcome back, ${result.studentName}`}
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            Class {result.class} (Section {result.section}) &bull; Admission Number {result.admissionNumber}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download Progress Card</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl transition cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="glass-card p-5 space-y-3">
          <div className="p-3 bg-blue-50 text-primary w-fit rounded-xl border border-blue-100/50">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Class Rank</span>
            <div className="text-2xl font-black text-slate-900 leading-none">
              #{result.rank}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Classroom Standings</span>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-xl border border-emerald-100/50">
            <Award className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Grade Points (GPA)</span>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {result.gpa.toFixed(1)} <span className="text-xs text-slate-400 font-bold">/ 10</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Based on Telangana SSC Scale</span>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="p-3 bg-purple-50 text-purple-600 w-fit rounded-xl border border-purple-100/50">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Overall Percentage</span>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {result.overallPercentage}%
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Aggregate score across subjects</span>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="p-3 bg-orange-50 text-orange-600 w-fit rounded-xl border border-orange-100/50">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Attendance</span>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {result.attendance.percentage}%
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              Present {result.attendance.presentDays} of {result.attendance.workingDays} days
            </span>
          </div>
        </div>

      </div>

      {/* Main Results Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Academic Subject Marks</span>
        </h3>
        
        <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-premium">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4.5 text-xs font-black text-slate-500 uppercase tracking-wider">Subject Name</th>
                  <th className="px-4 py-4.5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">FA1 (20)</th>
                  <th className="px-4 py-4.5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">FA2 (20)</th>
                  <th className="px-4 py-4.5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">FA3 (20)</th>
                  <th className="px-4 py-4.5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">FA4 (20)</th>
                  <th className="px-4 py-4.5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">SA1 (100)</th>
                  <th className="px-4 py-4.5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">SA2 (100)</th>
                  <th className="px-4 py-4.5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4.5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {result.subjectResults.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-900 font-bold">{sub.subjectName}</td>
                    <td className="px-4 py-4 text-center">{sub.marks.fa1 ?? '-'}</td>
                    <td className="px-4 py-4 text-center">{sub.marks.fa2 ?? '-'}</td>
                    <td className="px-4 py-4 text-center">{sub.marks.fa3 ?? '-'}</td>
                    <td className="px-4 py-4 text-center">{sub.marks.fa4 ?? '-'}</td>
                    <td className="px-4 py-4 text-center">{sub.marks.sa1 ?? '-'}</td>
                    <td className="px-4 py-4 text-center">{sub.marks.sa2 ?? '-'}</td>
                    <td className="px-4 py-4 text-center text-primary font-bold">{sub.total} / {sub.maxTotal}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-extrabold rounded-md border ${getGradeColor(sub.grade)}`}>
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {/* Grand Total Row */}
                <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                  <td className="px-6 py-5 text-primary">GRAND TOTAL</td>
                  <td colSpan={6} className="px-4 py-5"></td>
                  <td className="px-4 py-5 text-center text-primary font-black">
                    {result.totalMarksObtained} / {result.totalMaxMarks}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 text-xs font-black rounded-lg border ${getGradeColor(result.overallGrade)}`}>
                      {result.overallGrade}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Remarks & Co-Curricular */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Remarks Card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>Academic Performance Remarks</span>
          </h3>
          <div className="space-y-3.5 text-sm font-semibold text-slate-650">
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
              <strong className="text-emerald-700 block text-[10px] uppercase tracking-wider mb-1">Strengths:</strong>
              <p className="text-slate-700 font-medium leading-relaxed">{result.remarks.strengths}</p>
            </div>
            <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl">
              <strong className="text-amber-700 block text-[10px] uppercase tracking-wider mb-1">Areas for Improvement:</strong>
              <p className="text-slate-700 font-medium leading-relaxed">{result.remarks.improvements}</p>
            </div>
            <div className="p-3.5 bg-blue-50/30 border border-blue-100/50 rounded-2xl">
              <strong className="text-blue-700 block text-[10px] uppercase tracking-wider mb-1">Suggestions:</strong>
              <p className="text-slate-700 font-medium leading-relaxed">{result.remarks.suggestions}</p>
            </div>
          </div>
        </div>

        {/* Co-Curricular & School info */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            <span>Co-Curricular Grades</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Health & Physical Ed</span>
              <div className="text-xl font-black text-slate-800">{result.cocurricular.sports || 'A1'}</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Art & Cultural Ed</span>
              <div className="text-xl font-black text-slate-800">{result.cocurricular.participation || 'A1'}</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Discipline</span>
              <div className="text-xl font-black text-slate-800">{result.cocurricular.discipline || 'A1'}</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Leadership & Service</span>
              <div className="text-xl font-black text-slate-800">{result.cocurricular.leadership || 'A1'}</div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 text-xs font-semibold text-slate-400 flex gap-2">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-slate-650">Academic Note:</p>
              <p className="font-medium mt-0.5 leading-normal">{school?.footer_text}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
