import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import type { School } from '../services/db';
import { useTranslation } from '../locales/translations';
import type { Language } from '../locales/translations';
import { 
  calculateStudentSummary, 
  getGradeColor, 
  calculateSubjectTotal, 
  calculateSubjectMaxTotal, 
  getGrade
} from '../utils/calculations';
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
  TrendingUp,
  Trophy,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Activity,
  UserCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

interface PublicResultPortalProps {
  language: Language;
}

export const PublicResultPortal: React.FC<PublicResultPortalProps> = ({ language }) => {
  const { t } = useTranslation(language);
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [school, setSchool] = useState<School | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searched, setSearched] = useState(false);
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<StudentResultSummary | null>(null);

  // Expanded subject card states
  const [expandedSubjects, setExpandedSubjects] = useState<{ [key: string]: boolean }>({});

  // Active view tab in results view
  const [currentTab, setCurrentTab] = useState<'report-card' | 'analytics'>('report-card');

  // Simulated AI loading steps
  const [loadingStep, setLoadingStep] = useState(0);

  // Landing page stats & toppers
  const [stats, setStats] = useState({
    studentsCount: 0,
    classesCount: 0,
    publishedCount: 0,
    avgPercent: 80
  });
  const [toppers, setToppers] = useState<any[]>([]);

  useEffect(() => {
    async function loadSchoolAndStats() {
      try {
        const data = await dbService.getSchoolSettings();
        setSchool(data);

        const statsData = await dbService.getPortalStats();
        setStats(statsData);

        // Fetch students & marks to calculate dynamic toppers spotlight
        const studList = await dbService.getStudents();
        const markList = await dbService.getAllMarks();
        await dbService.getSubjects();

        if (studList.length > 0 && markList.length > 0) {
          const studentRankList = studList.map(s => {
            const studentMarks = markList.filter(m => m.student_id === s.id);
            let obt = 0;
            let max = 0;
            studentMarks.forEach(m => {
              obt += calculateSubjectTotal(m);
              max += calculateSubjectMaxTotal(m);
            });
            const percentage = max === 0 ? 0 : Math.round((obt / max) * 100);
            return {
              name: s.student_name,
              class: s.class,
              section: s.section,
              percentage,
              grade: getGrade(percentage)
            };
          })
          .filter(item => item.percentage > 0)
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 3);
          setToppers(studentRankList);
        }
      } catch (err) {
        console.error("Failed to load school settings, stats or toppers:", err);
      }
    }
    loadSchoolAndStats();

    const params = new URLSearchParams(window.location.search);
    const urlAdmission = params.get('admission');
    if (urlAdmission) {
      setAdmissionNumber(urlAdmission);
      handleSearchDirect(urlAdmission);
    }
  }, []);

  const handleSearchDirect = async (admissionNum: string) => {
    setLoading(true);
    setErrorMsg('');
    setSearched(true);
    setResult(null);
    setLoadingStep(1);

    try {
      // Step 1: Connecting
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingStep(2);
      
      // Step 2: Querying student by admission number
      const student = await dbService.findStudentByAdmission(admissionNum);
      const allMarks = await dbService.getAllMarks();
      const subjects = await dbService.getSubjects();

      if (student) {
        // Build marks map for the current student
        const studentMarksMap: { [subjectName: string]: any } = {};
        subjects.forEach(sub => {
          studentMarksMap[sub.subject_name] = { fa1: null, fa2: null, fa3: null, fa4: null, sa1: null, sa2: null };
        });
        const studentMarksList = allMarks.filter(m => m.student_id === student.id);
        studentMarksList.forEach(m => {
          const sub = subjects.find(s => s.id === m.subject_id);
          if (sub) {
            studentMarksMap[sub.subject_name] = {
              fa1: m.fa1,
              fa2: m.fa2,
              fa3: m.fa3,
              fa4: m.fa4,
              sa1: m.sa1,
              sa2: m.sa2
            };
          }
        });
        // Build class students with marks for ranking
        const students = await dbService.getStudents();
        const classStudents = students.filter(s => s.class === student.class);
        const classStudentsWithMarks: any[] = [];
        for (const cs of classStudents) {
          const csMarksMap: { [subjectName: string]: any } = {};
          subjects.forEach(sub => {
            csMarksMap[sub.subject_name] = { fa1: null, fa2: null, fa3: null, fa4: null, sa1: null, sa2: null };
          });
          const csMarksList = allMarks.filter(m => m.student_id === cs.id);
          csMarksList.forEach(m => {
            const sub = subjects.find(s => s.id === m.subject_id);
            if (sub) {
              csMarksMap[sub.subject_name] = {
                fa1: m.fa1,
                fa2: m.fa2,
                fa3: m.fa3,
                fa4: m.fa4,
                sa1: m.sa1,
                sa2: m.sa2
              };
            }
          });
          classStudentsWithMarks.push({
            studentId: cs.id,
            studentName: cs.student_name,
            admissionNumber: cs.admission_number,
            class: cs.class,
            section: cs.section,
            subjects: csMarksMap
          });
        }
        const currentWithMarks = {
          studentId: student.id,
          studentName: student.student_name,
          admissionNumber: student.admission_number,
          class: student.class,
          section: student.section,
          subjects: studentMarksMap
        };
        // Step 3: AI Synthesis (simulated)
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingStep(3);
        const summary = calculateStudentSummary(currentWithMarks, classStudentsWithMarks);
        await new Promise(resolve => setTimeout(resolve, 400));
        setLoadingStep(4);
        setResult(summary);
      } else {
        setErrorMsg(t('searchError') || "Student not found. Please verify the Admission Number.");
        setSearched(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred during lookup. Please try again.");
      setSearched(false);
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNumber) {
      setErrorMsg("Please enter the Admission Number.");
      return;
    }
    handleSearchDirect(admissionNumber);
  };

  const handleReset = () => {
    setAdmissionNumber('');
    setSearched(false);
    setResult(null);
    setErrorMsg('');
    setCurrentTab('report-card');
    setExpandedSubjects({});
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const toggleSubjectExpand = (subName: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subName]: !prev[subName]
    }));
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
    doc.text(t('admissionNumber') + ':', 10, 76);
    doc.text("Class & Section:", 10, 81);
    doc.text("Academic Year:", 10, 86);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(result.studentName, 38, 71);
    doc.text(result.admissionNumber, 38, 76);
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

    // Main Marks Register Table (TS School Mark sheet format)
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
    doc.text(`Total Marks Obtained: ${result.totalMarksObtained} / ${result.totalMaxMarks} (${result.overallPercentage}%)`, 15, finalY + 7);
    doc.text(`Grade Point Average (GPA): ${result.gpa.toFixed(2)}`, 15, finalY + 13);
    doc.text(`Overall Grade: ${result.overallGrade}`, 120, finalY + 7);
    doc.text(`Cumulative GPA (CGPA): ${result.cgpa.toFixed(2)}`, 120, finalY + 13);

    // Attendance & Co-curricular tables side by side
    const secondaryY = finalY + 22;
    
    // Attendance Table
    autoTable(doc, {
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
    autoTable(doc, {
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
    const shareUrl = `${window.location.origin}${window.location.pathname}?admission=${result.admissionNumber}`;
    const textMsg = `*${school ? school.school_name : 'ZPHS AGAMOTHKUR'} - Exam Results*\n\n` +
      `Student Name: *${result.studentName}*\n` +
      `Admission Number: *${result.admissionNumber}*\n` +
      `Class & Section: *${result.class} - ${result.section}*\n\n` +
      `*Academic Summary:*\n` +
      `- Total Score: *${result.totalMarksObtained} / ${result.totalMaxMarks}*\n` +
      `- Percentage: *${result.overallPercentage}%*\n` +
      `- Overall Grade: *${result.overallGrade}*\n` +
      `- Rank: *#${result.rank}*\n\n` +
      `View detailed subject-wise marks card and AI academic insights here:\n${shareUrl}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`, '_blank');
  };

  // Helper to draw circular progress ring SVG
  const renderCircularProgress = (percentage: number, label: string, colorClass: string, size = 110, strokeWidth = 10, maxVal = 100) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(percentage, maxVal) / maxVal) * circumference;

    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-slate-100 fill-none"
              strokeWidth={strokeWidth}
            />
            {/* Foreground Progress Circle */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className={`fill-none ${colorClass}`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          {/* Centered label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-black text-slate-850 tracking-tight">
              {percentage % 1 === 0 ? percentage : percentage.toFixed(2)}
            </span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">
              {label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Helper for mini SVG line chart
  const renderMiniLineChart = (subResult: any) => {
    const dataPoints = [
      { label: 'FA1', val: (subResult.marks.fa1 ?? 0) * 5 }, // scale FAs (out of 20) to percentage
      { label: 'FA2', val: (subResult.marks.fa2 ?? 0) * 5 },
      { label: 'FA3', val: (subResult.marks.fa3 ?? 0) * 5 },
      { label: 'FA4', val: (subResult.marks.fa4 ?? 0) * 5 },
      { label: 'SA1', val: (subResult.marks.sa1 ?? 0) }, // SAs are out of 100
      { label: 'SA2', val: (subResult.marks.sa2 ?? 0) }
    ];

    const width = 140;
    const height = 40;
    const padding = 4;

    const pointsStr = dataPoints.map((p, idx) => {
      const x = padding + (idx / 5) * (width - padding * 2);
      const y = height - padding - (p.val / 100) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="flex flex-col items-end space-y-1">
        <svg width={width} height={height} className="overflow-visible">
          {/* Sparkline gradient fill */}
          <defs>
            <linearGradient id={`grad-${subResult.subjectName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area under the sparkline */}
          <path
            d={`M ${padding},${height - padding} L ${pointsStr} L ${width - padding},${height - padding} Z`}
            fill={`url(#grad-${subResult.subjectName})`}
          />

          {/* Sparkline path */}
          <motion.path
            d={`M ${pointsStr}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="1.8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Nodes */}
          {dataPoints.map((p, idx) => {
            const x = padding + (idx / 5) * (width - padding * 2);
            const y = height - padding - (p.val / 100) * (height - padding * 2);
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="2.5"
                className="fill-white stroke-blue-650 stroke-[1.5] cursor-pointer hover:r-4 transition-all"
              >
                <title>{p.label}: {p.val}%</title>
              </circle>
            );
          })}
        </svg>
        <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest">
          Trend (FA1 → SA2)
        </span>
      </div>
    );
  };

  // Helper for overall aggregate score trend SVG Line chart
  const renderOverallTrendChart = () => {
    if (!result) return null;
    
    // Calculate total score percentage for each assessment period across all subjects
    // FAs are out of 20, SAs are out of 100
    // Total FAs max = 20 * 7 = 140
    // Total SAs max = 100 * 7 = 700
    let fa1Obt = 0, fa2Obt = 0, fa3Obt = 0, fa4Obt = 0, sa1Obt = 0, sa2Obt = 0;
    
    result.subjectResults.forEach(sub => {
      fa1Obt += sub.marks.fa1 ?? 0;
      fa2Obt += sub.marks.fa2 ?? 0;
      fa3Obt += sub.marks.fa3 ?? 0;
      fa4Obt += sub.marks.fa4 ?? 0;
      sa1Obt += sub.marks.sa1 ?? 0;
      sa2Obt += sub.marks.sa2 ?? 0;
    });

    const activeSubjects = result.subjectResults.length || 7;
    const faMaxTotal = 20 * activeSubjects;
    const saMaxTotal = 100 * activeSubjects;

    const dataPoints = [
      { label: 'FA1', pct: faMaxTotal === 0 ? 0 : Math.round((fa1Obt / faMaxTotal) * 100) },
      { label: 'FA2', pct: faMaxTotal === 0 ? 0 : Math.round((fa2Obt / faMaxTotal) * 100) },
      { label: 'FA3', pct: faMaxTotal === 0 ? 0 : Math.round((fa3Obt / faMaxTotal) * 100) },
      { label: 'FA4', pct: faMaxTotal === 0 ? 0 : Math.round((fa4Obt / faMaxTotal) * 100) },
      { label: 'SA1', pct: saMaxTotal === 0 ? 0 : Math.round((sa1Obt / saMaxTotal) * 100) },
      { label: 'SA2', pct: saMaxTotal === 0 ? 0 : Math.round((sa2Obt / saMaxTotal) * 100) }
    ];

    const width = 600;
    const height = 150;
    const paddingX = 40;
    const paddingY = 20;

    const pointsStr = dataPoints.map((p, idx) => {
      const x = paddingX + (idx / 5) * (width - paddingX * 2);
      const y = height - paddingY - (p.pct / 100) * (height - paddingY * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
              Aggregate Academic Performance Trend
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">
            Formative vs. Summative Progression
          </span>
        </div>

        <div className="relative overflow-x-auto">
          <div className="min-w-[600px] h-[160px] flex justify-center items-center py-2">
            <svg width={width} height={height} className="overflow-visible mx-auto">
              <defs>
                <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0, 25, 50, 75, 100].map((gridLineVal) => {
                const y = height - paddingY - (gridLineVal / 100) * (height - paddingY * 2);
                return (
                  <g key={gridLineVal}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      className="stroke-slate-100"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      className="fill-slate-400 font-semibold text-[8px] text-right"
                      textAnchor="end"
                    >
                      {gridLineVal}%
                    </text>
                  </g>
                );
              })}

              {/* Area graph */}
              <path
                d={`M ${paddingX},${height - paddingY} L ${pointsStr} L ${width - paddingX},${height - paddingY} Z`}
                fill="url(#overallGrad)"
              />

              {/* Line path */}
              <motion.path
                d={`M ${pointsStr}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
              />

              {/* Points */}
              {dataPoints.map((p, idx) => {
                const x = paddingX + (idx / 5) * (width - paddingX * 2);
                const y = height - paddingY - (p.pct / 100) * (height - paddingY * 2);
                return (
                  <g key={idx} className="group">
                    <circle
                      cx={x}
                      cy={y}
                      r="4.5"
                      className="fill-white stroke-blue-500 stroke-[2] cursor-pointer"
                    />
                    <text
                      x={x}
                      y={y - 10}
                      className="fill-slate-700 font-black text-[9px] text-center"
                      textAnchor="middle"
                    >
                      {p.pct}%
                    </text>
                    <text
                      x={x}
                      y={height - paddingY + 15}
                      className="fill-slate-400 font-extrabold text-[8px] tracking-wider text-center"
                      textAnchor="middle"
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Helper to generate personalized AI recommendation recommendations
  const getPersonalizedRecommendation = () => {
    if (!result) return null;
    
    // Find strongest and weakest subjects
    const sorted = [...result.subjectResults].sort((a, b) => b.percentage - a.percentage);
    const strong = sorted[0];
    const weak = sorted[sorted.length - 1];

    let adviceText = '';
    if (weak.percentage < 45) {
      adviceText = `Needs focused attention and structured home revisions. We recommend setting up parent-teacher checks, dedicating 30 minutes daily to clarifying concepts, and completing remedial sheets for ${weak.subjectName}.`;
    } else if (weak.percentage < 70) {
      adviceText = `Strong progress, but has minor conceptual gaps. Focused practice on past worksheets and revision tests in ${weak.subjectName} will easily boost their grade to distinction levels.`;
    } else {
      adviceText = `Outstanding academic results across all domains! Suggest keeping up the consistency, exploring advanced reading materials, and mentoring peers in subjects like ${weak.subjectName}.`;
    }

    return {
      strongSubject: strong.subjectName,
      strongGrade: strong.grade,
      weakSubject: weak.subjectName,
      weakGrade: weak.grade,
      advice: adviceText
    };
  };

  // --- CHARTS DATA FOR TABS ---
  const subjectAveragesData = result ? {
    labels: result.subjectResults.map(s => s.subjectName),
    datasets: [{
      data: result.subjectResults.map(s => s.percentage),
      backgroundColor: 'rgba(37, 99, 235, 0.85)',
      hoverBackgroundColor: '#2563eb',
      borderRadius: 8,
      barThickness: 24,
    }]
  } : null;

  const faAveragesList = result ? result.subjectResults.map(s => {
    let faSum = 0;
    let faCount = 0;
    if (s.marks.fa1 != null) { faSum += s.marks.fa1; faCount += 20; }
    if (s.marks.fa2 != null) { faSum += s.marks.fa2; faCount += 20; }
    if (s.marks.fa3 != null) { faSum += s.marks.fa3; faCount += 20; }
    if (s.marks.fa4 != null) { faSum += s.marks.fa4; faCount += 20; }
    return faCount === 0 ? 0 : Math.round((faSum / faCount) * 100);
  }) : [];

  const saAveragesList = result ? result.subjectResults.map(s => {
    let saSum = 0;
    let saCount = 0;
    if (s.marks.sa1 != null) { saSum += s.marks.sa1; saCount += 100; }
    if (s.marks.sa2 != null) { saSum += s.marks.sa2; saCount += 100; }
    return saCount === 0 ? 0 : Math.round((saSum / saCount) * 100);
  }) : [];

  const favsSaComparisonData = result ? {
    labels: result.subjectResults.map(s => s.subjectName),
    datasets: [
      {
        label: 'Formative (FA) %',
        data: faAveragesList,
        backgroundColor: 'rgba(34, 197, 94, 0.85)',
        borderRadius: 6,
        barThickness: 10,
      },
      {
        label: 'Summative (SA) %',
        data: saAveragesList,
        backgroundColor: 'rgba(37, 99, 235, 0.85)',
        borderRadius: 6,
        barThickness: 10,
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 12,
        titleFont: { family: 'Inter', size: 12, weight: 'bold' as const },
        bodyFont: { family: 'Inter', size: 12 },
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } } },
      y: { min: 0, max: 100, grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } } }
    }
  };

  const adviceObj = result ? getPersonalizedRecommendation() : null;

  return (
    <div className="space-y-12">
      <AnimatePresence mode="wait">
        
        {/* ----------------------------------------------------
            LOADING SCREEN (Vercel-like Skeleton & AI Synthesis)
           ---------------------------------------------------- */}
        {loading && (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-8 max-w-lg mx-auto"
          >
            {/* Spinning AI Orb */}
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
              <Sparkles className="absolute h-8 w-8 text-primary animate-pulse-glow" />
              <div className="absolute w-24 h-24 rounded-full border border-blue-500/10 animate-ping opacity-75" />
            </div>
            
            <div className="w-full space-y-5 text-center">
              <div className="space-y-1.5">
                <h3 className="font-black text-slate-800 text-xl tracking-tight">AI Transcript Synthesis Engine</h3>
                <p className="text-slate-400 text-xs font-semibold">Retrieving official Telangana Board registers & computing ranks...</p>
              </div>
              
              {/* Rotating Status Step Indicator */}
              <div className="space-y-2.5 text-left bg-white/70 border border-slate-200/50 p-6 rounded-[24px] text-xs font-bold text-slate-450 shadow-premium">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${loadingStep >= 1 ? 'bg-green-500 shadow-glow' : 'bg-slate-200'}`} />
                  <span className={loadingStep === 1 ? 'text-slate-850 font-black' : loadingStep > 1 ? 'text-slate-500 line-through' : ''}>
                    Establishing secure tunnel to Agamothkur registers...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${loadingStep >= 2 ? 'bg-green-500 shadow-glow' : 'bg-slate-200'}`} />
                  <span className={loadingStep === 2 ? 'text-slate-850 font-black' : loadingStep > 2 ? 'text-slate-500 line-through' : ''}>
                    Retrieving student transcript record ledger...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${loadingStep >= 3 ? 'bg-green-500 shadow-glow' : 'bg-slate-200'}`} />
                  <span className={loadingStep === 3 ? 'text-slate-850 font-black' : loadingStep > 3 ? 'text-slate-500 line-through' : ''}>
                    Running rank algorithms & grade distributions...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${loadingStep >= 4 ? 'bg-green-500 shadow-glow' : 'bg-slate-200'}`} />
                  <span className={loadingStep === 4 ? 'text-slate-850 font-black animate-pulse' : ''}>
                    Generating AI insights & remedial curriculum tips...
                  </span>
                </div>
              </div>

              {/* Vercel-like Skeleton Box */}
              <div className="w-full bg-slate-50/50 border border-slate-100 p-5 rounded-2xl animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 rounded-full w-12" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ----------------------------------------------------
            LANDING SEARCH PORTAL (AI SaaS Inspired)
           ---------------------------------------------------- */}
        {!searched && !loading && (
          <motion.div 
            key="search-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-16"
          >
            {/* Glowing Backdrop gradients */}
            <div className="absolute top-[-10%] left-[20%] right-[20%] h-[300px] bg-glow-gradient opacity-80 pointer-events-none z-0" />

            {/* Title & Headline */}
            <div className="text-center space-y-4 max-w-3xl mx-auto pt-6 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50/70 border border-blue-100 text-primary font-black rounded-full text-[10px] uppercase tracking-wider shadow-inner">
                <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse-glow" />
                {school ? school.school_name : 'ZPHS AGAMOTHKUR'}
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none">
                {t('portalTitle') || 'Student Marks Portal'}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                Query TS State Board cumulative registers, download official marks card PDFs, and explore interactive subject statistics.
              </p>
            </div>

            {/* Glowing Search Box Capsule */}
            <div className="max-w-md mx-auto relative z-10">
              <div className="absolute -inset-6 bg-gradient-to-tr from-blue-600/10 to-indigo-500/5 blur-3xl opacity-60 rounded-[32px] pointer-events-none" />
              
              <div className="relative bg-white/80 backdrop-blur-xl rounded-[28px] border border-slate-200/50 p-6 sm:p-8 shadow-premium">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="h-4.5 w-4.5 text-primary" />
                    Query Transcript Registry
                  </span>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>

                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-2.5 text-xs font-semibold mb-5"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSearch} className="space-y-5">
                  {/* Admission Number Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="admissionNumber" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {t('admissionNumber') || 'Admission Number'}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                      <input
                        id="admissionNumber"
                        name="admissionNumber"
                        type="text"
                        required
                        placeholder={t('admissionNumberPlaceholder') || 'Enter Admission Number'}
                        value={admissionNumber}
                        onChange={(e) => setAdmissionNumber(e.target.value)}
                        className="pl-11.5 pr-4 py-3.5 w-full border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition bg-slate-50/30 hover:bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* DOB Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="dob" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {t('dob')}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                      <input
                        id="dob"
                        name="dob"
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="pl-11.5 pr-4 py-3.5 w-full border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-slate-800 text-sm font-semibold transition bg-slate-50/30 hover:bg-slate-50/50 focus:bg-white cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-black rounded-2xl shadow-lg shadow-blue-500/15 transition flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm"
                  >
                    <Sparkles className="h-4.5 w-4.5 text-blue-200" />
                    Synthesize Academic Records
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {/* Demo Hints Capsule */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2 text-[10px] text-slate-450 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Demo Hint</span>
                    <span>Use roll details below to try:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-650 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150/40">
                    <div>
                      <strong className="text-slate-800">Supabase DB:</strong>
                      <div className="font-semibold">Roll: <code>700</code></div>
                      <div className="font-semibold">DOB: <code>2012-06-01</code></div>
                    </div>
                    <div>
                      <strong className="text-slate-800">Local Fallback:</strong>
                      <div className="font-semibold">Roll: <code>801</code></div>
                      <div className="font-semibold">DOB: <code>2012-06-01</code></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Toppers Spotlight Widget (Topper Cards) */}
            {toppers.length > 0 && (
              <div className="max-w-4xl mx-auto space-y-5 relative z-10">
                <div className="text-center space-y-1">
                  <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Class Toppers Spotlight
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Honoring top performing students in recent assessments</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                  {toppers.map((top, idx) => {
                    const colors = [
                      { bg: 'from-amber-500/5 to-yellow-500/5 border-amber-500/20', text: 'text-amber-600', icon: 'text-amber-500', rank: 'Gold Topper' },
                      { bg: 'from-slate-500/5 to-slate-400/5 border-slate-400/20', text: 'text-slate-600', icon: 'text-slate-400', rank: 'Silver Topper' },
                      { bg: 'from-orange-500/5 to-amber-700/5 border-orange-500/20', text: 'text-orange-700', icon: 'text-orange-500', rank: 'Bronze Topper' }
                    ];
                    const design = colors[idx] || colors[2];
                    
                    return (
                      <div 
                        key={idx}
                        className={`bg-gradient-to-tr ${design.bg} p-5 rounded-2xl border flex items-center justify-between shadow-sm`}
                      >
                        <div className="space-y-1.5">
                          <span className={`inline-flex px-2 py-0.5 bg-white border border-slate-200/50 rounded-lg text-[9px] font-black ${design.text} uppercase tracking-wider`}>
                            {design.rank}
                          </span>
                          <div>
                            <h4 className="font-black text-slate-800 text-sm">{top.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Class {top.class} - Section {top.section}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">{top.percentage}%</span>
                          <span className="block text-[9.5px] text-slate-400 font-bold">Aggregate</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Statistics Portal Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4.5 max-w-4xl mx-auto pt-6 relative z-10">
              <div className="bg-white/70 backdrop-blur-md p-5.5 rounded-2xl border border-slate-200/40 shadow-sm flex items-center space-x-4 hover:-translate-y-0.5 transition duration-300">
                <div className="p-3 bg-blue-50/70 text-primary rounded-2xl"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalStudents')}</p>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.studentsCount}</h3>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-5.5 rounded-2xl border border-slate-200/40 shadow-sm flex items-center space-x-4 hover:-translate-y-0.5 transition duration-300">
                <div className="p-3 bg-purple-50/70 text-purple-650 rounded-2xl"><BookOpen className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalClasses')}</p>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.classesCount}</h3>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-5.5 rounded-2xl border border-slate-200/40 shadow-sm flex items-center space-x-4 hover:-translate-y-0.5 transition duration-300">
                <div className="p-3 bg-green-50/70 text-green-600 rounded-2xl"><CheckCircle className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('resultsPublished')}</p>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.publishedCount}</h3>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-5.5 rounded-2xl border border-slate-200/40 shadow-sm flex items-center space-x-4 hover:-translate-y-0.5 transition duration-300">
                <div className="p-3 bg-amber-50/70 text-amber-600 rounded-2xl"><Award className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('avgPercentage')}</p>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.avgPercent}%</h3>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ----------------------------------------------------
            STUDENT DASHBOARD PAGE (Stripe/Linear Inspired)
           ---------------------------------------------------- */}
        {searched && !loading && result && (
          <motion.div 
            key="result-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8 pb-12"
          >
            {/* Header action menu */}
            <div className="flex justify-between items-center bg-white p-4.5 rounded-2xl shadow-sm border border-slate-200/60">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 hover:bg-slate-50 text-slate-650 hover:text-slate-900 rounded-xl transition text-xs sm:text-sm font-bold border border-slate-200 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Query Again
              </button>

              {/* View Tabs */}
              <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl border border-slate-200/30">
                <button
                  onClick={() => setCurrentTab('report-card')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${currentTab === 'report-card' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-450 hover:text-slate-800'}`}
                >
                  Report Card
                </button>
                <button
                  onClick={() => setCurrentTab('analytics')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${currentTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-450 hover:text-slate-800'}`}
                >
                  Performance Analytics
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl transition font-black shadow-sm cursor-pointer text-xs sm:text-sm"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden md:inline">{t('shareWhatsApp')}</span>
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl transition font-black shadow-sm cursor-pointer text-xs sm:text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>{t('downloadPDF') || 'Download PDF'}</span>
                </button>
              </div>
            </div>

            {/* Mobile View Tab Switcher */}
            <div className="flex sm:hidden bg-slate-100 p-1 rounded-xl border border-slate-200/30 w-full justify-between">
              <button
                onClick={() => setCurrentTab('report-card')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-black transition ${currentTab === 'report-card' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-450'}`}
              >
                Report Card
              </button>
              <button
                onClick={() => setCurrentTab('analytics')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-black transition ${currentTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-450'}`}
              >
                Analytics
              </button>
            </div>

            {/* Student Profile Card Header */}
            <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/40 flex flex-col lg:flex-row gap-6 justify-between items-stretch">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img 
                  src={school?.logo_url || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200"}
                  alt="School Logo"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-white"
                />
                
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-0.5 bg-blue-50 text-primary border border-blue-100 font-extrabold rounded-full text-[9px] tracking-wide uppercase">
                      {school ? school.school_name : 'ZPHS AGAMOTHKUR'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[9px] font-bold">
                      Academic Session: {school?.academic_year || '2025-2026'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2.5xl font-black text-slate-900 leading-tight">{result.studentName}</h2>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-1.5 text-slate-500 text-xs font-semibold justify-center sm:justify-start">
                    <span>Admission Number: <strong className="text-slate-800">{result.admissionNumber}</strong></span>
                    <span>Class & Section: <strong className="text-slate-800">Class {result.class} - {result.section}</strong></span>
                    <span>DOB: <strong className="text-slate-800">{new Date(dob).toLocaleDateString()}</strong></span>
                    <span>Father: <strong className="text-slate-800">{result.studentId ? (result.remarks && (result as any).father_name || "Parent Name") : "Parent Name"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Digital Seal stamp */}
              <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-slate-100 pt-5 lg:border-t-0 lg:pt-0">
                <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-200/50">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1.5">
                    <QrCode className="h-full w-full text-slate-800" />
                  </div>
                  <div className="text-left leading-normal">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Verification QR</span>
                    <span className="text-[10px] font-black text-slate-700 block">Telangana Board</span>
                    <span className="inline-flex px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[7.5px] font-bold">Digital Sealed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: REPORT CARD */}
            {currentTab === 'report-card' && (
              <div className="space-y-8">
                
                {/* 1. Academic Circular Progress Rings Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2.5">
                    {renderCircularProgress(result.gpa, 'GPA', 'stroke-primary', 100, 8, 10)}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">Grade Point Average</h4>
                      <p className="text-[9.5px] text-slate-400 font-bold">10-Point TS Scale</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2.5">
                    {renderCircularProgress(result.cgpa, 'CGPA', 'stroke-indigo-500', 100, 8, 10)}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">Cumulative GPA</h4>
                      <p className="text-[9.5px] text-slate-400 font-bold">Final Grade Standard</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2.5">
                    {renderCircularProgress(result.overallPercentage, 'PERCENT', 'stroke-blue-500', 100, 8, 100)}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">Aggregate Percentage</h4>
                      <p className="text-[9.5px] text-slate-400 font-bold">{result.totalMarksObtained} / {result.totalMaxMarks} Marks</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2.5">
                    {renderCircularProgress(result.attendance.percentage, 'ATTEND', 'stroke-emerald-500', 100, 8, 100)}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">Attendance Ratio</h4>
                      <p className="text-[9.5px] text-slate-400 font-bold">{result.attendance.presentDays} / {result.attendance.workingDays} Days</p>
                    </div>
                  </div>
                </div>

                {/* 2. Class Rank & Performance Trend Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Class Rank Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                          Class Rank Status
                        </h3>
                        <Trophy className="h-4.5 w-4.5 text-amber-500" />
                      </div>
                      
                      <div className="py-4 space-y-3.5 text-center">
                        <div className="text-5xl font-black text-slate-900">
                          #{result.rank}
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Position in Class Section
                        </p>
                        
                        {/* Progress Bar of Standings */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                            <span>Top Rank</span>
                            <span># {result.rank} / {stats.studentsCount || 20}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full" 
                              style={{ width: `${Math.max(100 - (result.rank / (stats.studentsCount || 20)) * 100, 10)}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] bg-slate-50 p-2.5 rounded-xl border border-slate-150/40 text-slate-500 leading-normal font-semibold">
                      💡 Ranked relative to all students in Class {result.class} - {result.section} based on overall percentage aggregates.
                    </div>
                  </div>

                  {/* Trend chart card */}
                  <div className="lg:col-span-2">
                    {renderOverallTrendChart()}
                  </div>
                </div>

                {/* 3. Subject wise marks ledger cards */}
                <div className="space-y-4.5">
                  <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">
                    Subject Assessment Ledger (Click to expand marks)
                  </h3>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4.5">
                    {result.subjectResults.map((sub, idx) => {
                      const isExpanded = !!expandedSubjects[sub.subjectName];
                      const theme = getGradeColor(sub.grade);
                      
                      // Calculate badge text
                      let badgeText = 'Passed';
                      if (sub.grade === 'A1' || sub.grade === 'A2') badgeText = 'Outstanding';
                      else if (sub.grade === 'B1' || sub.grade === 'B2') badgeText = 'Strong';
                      else if (sub.grade === 'C1' || sub.grade === 'C2') badgeText = 'Average';
                      else if (sub.grade === 'F') badgeText = 'Needs Remedial';

                      return (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm space-y-4 hover:border-slate-350 transition cursor-pointer flex flex-col justify-between"
                          onClick={() => toggleSubjectExpand(sub.subjectName)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-slate-900 text-base">{sub.subjectName}</h4>
                                <span className={`inline-flex px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded text-[8px] font-black uppercase tracking-wider`}>
                                  {badgeText}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                                SSC Assessment Standards
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${theme}`}>
                                {sub.grade}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-650 font-bold rounded-lg text-[9.5px]">
                                {sub.gradePoints} GP
                              </span>
                            </div>
                          </div>

                          {/* Progress bar and Trend line in row */}
                          <div className="flex items-center justify-between gap-6 py-1">
                            <div className="flex-1 space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-400">Agg Score:</span>
                                <span className="text-slate-850">
                                  {sub.total} <span className="text-[9.5px] font-normal text-slate-400">/ {sub.maxTotal} ({sub.percentage}%)</span>
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                                <div 
                                  className="h-full rounded-full bg-primary" 
                                  style={{ width: `${sub.percentage}%` }} 
                                />
                              </div>
                            </div>
                            
                            {/* Sparkline trend */}
                            {renderMiniLineChart(sub)}
                          </div>

                          {/* Expanded Marks Breakdown Table */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-slate-100 pt-3 mt-3 space-y-3"
                                onClick={(e) => e.stopPropagation()} // stop toggle on clicking detail content
                              >
                                <div className="grid grid-cols-2 gap-3">
                                  {/* Formative assessment card */}
                                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150/40 space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-450 uppercase tracking-widest border-b border-slate-150 pb-1">
                                      <span>Formative (FA)</span>
                                      <span className="text-slate-700 font-black">
                                        {((sub.marks.fa1||0)+(sub.marks.fa2||0)+(sub.marks.fa3||0)+(sub.marks.fa4||0))} / 80
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1 text-center text-xs">
                                      <div className="bg-white p-1 rounded border border-slate-200/50">
                                        <span className="block text-[7.5px] text-slate-450 font-bold">FA1</span>
                                        <strong className="text-slate-700">{sub.marks.fa1 ?? '-'}</strong>
                                      </div>
                                      <div className="bg-white p-1 rounded border border-slate-200/50">
                                        <span className="block text-[7.5px] text-slate-450 font-bold">FA2</span>
                                        <strong className="text-slate-700">{sub.marks.fa2 ?? '-'}</strong>
                                      </div>
                                      <div className="bg-white p-1 rounded border border-slate-200/50">
                                        <span className="block text-[7.5px] text-slate-450 font-bold">FA3</span>
                                        <strong className="text-slate-700">{sub.marks.fa3 ?? '-'}</strong>
                                      </div>
                                      <div className="bg-white p-1 rounded border border-slate-200/50">
                                        <span className="block text-[7.5px] text-slate-450 font-bold">FA4</span>
                                        <strong className="text-slate-700">{sub.marks.fa4 ?? '-'}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Summative assessment card */}
                                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150/40 space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-450 uppercase tracking-widest border-b border-slate-150 pb-1">
                                      <span>Summative (SA)</span>
                                      <span className="text-slate-700 font-black">
                                        {((sub.marks.sa1||0)+(sub.marks.sa2||0))} / 200
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 text-center text-xs">
                                      <div className="bg-white p-1.5 rounded border border-slate-200/50">
                                        <span className="block text-[7.5px] text-slate-450 font-bold">SA1 (100)</span>
                                        <strong className="text-slate-700">{sub.marks.sa1 ?? '-'}</strong>
                                      </div>
                                      <div className="bg-white p-1.5 rounded border border-slate-200/50">
                                        <span className="block text-[7.5px] text-slate-450 font-bold">SA2 (100)</span>
                                        <strong className="text-slate-700">{sub.marks.sa2 ?? '-'}</strong>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          <div className="flex justify-center text-[8.5px] text-slate-400 font-bold uppercase tracking-wider mt-2.5">
                            {isExpanded ? (
                              <span className="flex items-center gap-0.5">Click to collapse <ChevronUp className="h-3 w-3" /></span>
                            ) : (
                              <span className="flex items-center gap-0.5">Click for marks detail <ChevronDown className="h-3 w-3" /></span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Teacher Recommendation & Action Plan Card */}
                {adviceObj && (
                  <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-150 rounded-3xl p-6 sm:p-7.5 shadow-sm space-y-5">
                    <div className="flex justify-between items-center border-b border-blue-100/50 pb-3.5">
                      <h3 className="font-black text-blue-900 flex items-center gap-2.5 text-xs uppercase tracking-widest">
                        <Sparkles className="h-4.5 w-4.5 text-blue-600 animate-pulse-glow" />
                        AI academic assessment & teacher suggestions
                      </h3>
                      <span className="px-2.5 py-0.5 bg-blue-100/80 text-blue-800 rounded-full text-[9px] font-black">
                        PERSONALIZED PLAN
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5.5">
                      <div className="bg-white/80 backdrop-blur-sm p-4.5 rounded-2xl border border-white">
                        <span className="text-[9.5px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Strong Subject Spotlight</span>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-slate-900 text-sm">{adviceObj.strongSubject}</span>
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 rounded">{adviceObj.strongGrade}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          Exceptional comprehension and quick learning in this subject domain. Suggest taking advanced challenges.
                        </p>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm p-4.5 rounded-2xl border border-white">
                        <span className="text-[9.5px] font-black text-amber-600 uppercase tracking-widest block mb-2">Subject Focus Area</span>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-slate-900 text-sm">{adviceObj.weakSubject}</span>
                          <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 rounded">{adviceObj.weakGrade}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          Conceptual gaps or practice gaps observed. Conducting focused worksheets will easily boost grades.
                        </p>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm p-4.5 rounded-2xl border border-white">
                        <span className="text-[9.5px] font-black text-blue-650 uppercase tracking-widest block mb-2">Teacher Action Plan</span>
                        <p className="text-xs text-slate-650 font-bold leading-relaxed">
                          {adviceObj.advice}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Co-curricular & Attendance Registry Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attendance Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest">Attendance register data</h3>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="relative w-18 h-18 flex-shrink-0 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full">
                        <span className="font-black text-slate-850 text-sm">{result.attendance.percentage}%</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 w-full text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150/40">
                          <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Working Days</span>
                          <strong className="text-slate-800 font-bold">{result.attendance.workingDays} Days</strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150/40">
                          <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Present Days</span>
                          <strong className="text-emerald-700 font-bold">{result.attendance.presentDays} Days</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Co-Curricular Rating Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                      <Award className="h-5 w-5 text-purple-600" />
                      <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest">Co-Curricular Domain Assessment</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150/40">
                        <span className="text-slate-500 font-semibold">Sports & Games</span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg font-black">{result.cocurricular.sports}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150/40">
                        <span className="text-slate-500 font-semibold">Discipline & Morals</span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg font-black">{result.cocurricular.discipline}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150/40">
                        <span className="text-slate-500 font-semibold">Leadership Qualities</span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg font-black">{result.cocurricular.leadership}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150/40">
                        <span className="text-slate-500 font-semibold">Participation</span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg font-black">{result.cocurricular.participation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Official Signature & Stamp Lines */}
                <div className="grid grid-cols-3 gap-4 border-t border-slate-200/50 pt-8 text-center text-xs text-slate-400 font-semibold">
                  <div className="space-y-3">
                    <div className="h-10 flex items-end justify-center"><span className="text-[10px] text-slate-350 border-b border-dashed border-slate-300 w-2/3 pb-1">Awaiting Signature</span></div>
                    <div>Parent Acknowledgement</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-10 flex items-end justify-center font-black text-slate-800 text-[10px]"><span className="border-b border-slate-300 w-2/3 pb-1 text-emerald-600 uppercase tracking-widest">VERIFIED DIGITAL</span></div>
                    <div>Class Teacher Signature</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-10 flex items-end justify-center font-bold text-slate-850 text-[10px]"><span className="border-b border-slate-300 w-2/3 pb-1 text-blue-600">M.S. Rao (Principal)</span></div>
                    <div>Headmaster Signature & Stamp</div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: PERFORMANCE ANALYTICS */}
            {currentTab === 'analytics' && subjectAveragesData && favsSaComparisonData && (
              <div className="space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Subject wise percentages bar chart */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                      <TrendingUp className="h-4.5 w-4.5 text-primary" />
                      <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                        Subject Performance Averages (%)
                      </h3>
                    </div>
                    <div className="h-64">
                      <Bar data={subjectAveragesData} options={chartOptions} />
                    </div>
                  </div>

                  {/* Pass/Fail Doughnut */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                        <Award className="h-4.5 w-4.5 text-green-600" />
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                          Passing Status Ratio
                        </h3>
                      </div>
                      <div className="h-44 flex justify-center items-center relative my-4">
                        <div className="w-36 h-36">
                          <Doughnut 
                            data={{
                              labels: ['Passed (GPA >= 4.0)', 'Failed (GPA < 4.0)'],
                              datasets: [{
                                data: [result.overallGrade !== 'F' ? 1 : 0, result.overallGrade === 'F' ? 1 : 0],
                                backgroundColor: ['#22c55e', '#ef4444'],
                                borderWidth: 0,
                              }]
                            }} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { display: false } },
                              cutout: '78%'
                            }} 
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-5px]">
                            <span className="text-xl font-black text-slate-850">
                              {result.overallGrade !== 'F' ? 'PASSED' : 'REMEDIAL'}
                            </span>
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                              Overall
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold text-center leading-normal">
                      Required score of 35% in SA assessments is mandatory to clear each subject.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* FA vs SA side by side bar chart */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                      <Activity className="h-4.5 w-4.5 text-emerald-600" />
                      <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                        Formative (FA) vs Summative (SA) Comparison
                      </h3>
                    </div>
                    <div className="h-64">
                      <Bar 
                        data={favsSaComparisonData} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: { display: true, position: 'top', labels: { font: { family: 'Inter', size: 9 } } }
                          }
                        }} 
                      />
                    </div>
                  </div>

                  {/* Strengths & Focus Area Spotlight cards */}
                  {adviceObj && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                        <Target className="h-4.5 w-4.5 text-indigo-600" />
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                          Domain Spotlight
                        </h3>
                      </div>

                      <div className="space-y-3.5 py-1">
                        <div className="flex items-center gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/70">
                          <Trophy className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                          <div>
                            <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Strongest Subject</span>
                            <strong className="text-slate-850 text-sm font-black">{adviceObj.strongSubject}</strong>
                            <span className="block text-[9.5px] text-emerald-700 font-bold">Grade Obtained: {adviceObj.strongGrade}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-red-50/50 p-3 rounded-2xl border border-red-150/40">
                          <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                          <div>
                            <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Weakest Subject</span>
                            <strong className="text-slate-850 text-sm font-black">{adviceObj.weakSubject}</strong>
                            <span className="block text-[9.5px] text-red-650 font-bold">Grade Obtained: {adviceObj.weakGrade}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[9.5px] text-slate-400 leading-normal font-semibold border-t border-slate-100 pt-3">
                        💡 <em>Tip: Suggest using peer teaching worksheets to share strengths and remedial tutorials to resolve focus weaknesses.</em>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
