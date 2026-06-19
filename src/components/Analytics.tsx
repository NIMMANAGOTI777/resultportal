import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import type { Student, Subject, Mark } from '../services/db';
import { calculateSubjectTotal, calculateSubjectMaxTotal, getGrade } from '../utils/calculations';
import { useTranslation } from '../locales/translations';
import type { Language } from '../locales/translations';
import { Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Award, Users, BookOpen, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsProps {
  language: Language;
}

export const Analytics: React.FC<AnalyticsProps> = ({ language }) => {
  const { t } = useTranslation(language);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const studList = await dbService.getStudents();
        const subList = await dbService.getSubjects();
        const markList = await dbService.getAllMarks();

        setStudents(studList);
        setSubjects(subList);
        setMarks(markList);
      } catch (error) {
        console.error("Error loading analytics data:", error);
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

  // --- FILTERED DATA SETS ---
  const filteredStudents = students.filter(s => {
    const classMatch = selectedClass === 'all' || s.class === selectedClass;
    const secMatch = selectedSection === 'all' || s.section === selectedSection;
    return classMatch && secMatch;
  });

  const studentIds = new Set(filteredStudents.map(s => s.id));
  const filteredMarks = marks.filter(m => studentIds.has(m.student_id));

  // --- CALCULATE ANALYTICS ---
  const totalStudents = filteredStudents.length;
  
  // Pass vs Fail Counts
  let passCount = 0;
  let failCount = 0;
  const gradeDistribution = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };

  filteredStudents.forEach(s => {
    const studentMarks = filteredMarks.filter(m => m.student_id === s.id);
    if (studentMarks.length > 0) {
      let obtained = 0;
      let max = 0;
      studentMarks.forEach(m => {
        obtained += calculateSubjectTotal(m);
        max += calculateSubjectMaxTotal(m);
      });
      const pct = max === 0 ? 0 : (obtained / max) * 100;
      const grade = getGrade(pct);
      gradeDistribution[grade as keyof typeof gradeDistribution]++;
      
      if (pct >= 50) {
        passCount++;
      } else {
        failCount++;
      }
    }
  });

  const resultsPublished = passCount + failCount;
  const passRate = resultsPublished === 0 ? 0 : Math.round((passCount / resultsPublished) * 100);

  // Subject Performance
  const subjectAverages = subjects.map(sub => {
    const subMarks = filteredMarks.filter(m => m.subject_id === sub.id);
    let totalObt = 0;
    let totalMax = 0;
    subMarks.forEach(m => {
      totalObt += calculateSubjectTotal(m);
      totalMax += calculateSubjectMaxTotal(m);
    });
    const pct = totalMax === 0 ? 0 : Math.round((totalObt / totalMax) * 100);
    return { name: sub.subject_name, value: pct };
  });

  // Unique Classes list
  const classesList = Array.from(new Set(students.map(s => s.class))).sort();
  const sectionsList = Array.from(new Set(students.map(s => s.section))).sort();

  // Class Performance
  const classAverages = classesList.map(cls => {
    const studentsInClass = students.filter(s => s.class === cls && (selectedSection === 'all' || s.section === selectedSection));
    let totalObt = 0;
    let totalMax = 0;
    studentsInClass.forEach(s => {
      const studentMarks = marks.filter(m => m.student_id === s.id);
      studentMarks.forEach(m => {
        totalObt += calculateSubjectTotal(m);
        totalMax += calculateSubjectMaxTotal(m);
      });
    });
    const pct = totalMax === 0 ? 0 : Math.round((totalObt / totalMax) * 100);
    return { className: cls, value: pct };
  });

  // --- CHARTS CONFIGS ---
  const barChartOptions = {
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
        boxPadding: 4,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } } },
      y: { min: 0, max: 100, grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', stepSize: 25, font: { family: 'Inter', size: 11 } } }
    }
  };

  const subjectChartData = {
    labels: subjectAverages.map(s => s.name),
    datasets: [{
      data: subjectAverages.map(s => s.value),
      backgroundColor: 'rgba(37, 99, 235, 0.85)',
      hoverBackgroundColor: '#2563eb',
      borderRadius: 8,
      barThickness: 24,
    }]
  };

  const classChartData = {
    labels: classAverages.map(c => `Class ${c.className}`),
    datasets: [{
      data: classAverages.map(c => c.value),
      backgroundColor: 'rgba(79, 70, 229, 0.85)',
      hoverBackgroundColor: '#4f46e5',
      borderRadius: 8,
      barThickness: 28,
    }]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { family: 'Inter', size: 11 },
          color: '#64748b',
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 12,
      }
    },
    cutout: '76%'
  };

  const passChartData = {
    labels: ['Passed (>=50%)', 'Failed (<50%)'],
    datasets: [{
      data: [passCount || 1, failCount || 0],
      backgroundColor: ['#22c55e', '#ef4444'],
      hoverBackgroundColor: ['#16a34a', '#dc2626'],
      borderWidth: 0,
    }]
  };

  const gradeChartData = {
    labels: Object.keys(gradeDistribution),
    datasets: [{
      data: Object.values(gradeDistribution),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',  // A+
        'rgba(16, 185, 129, 0.8)', // A
        'rgba(59, 130, 246, 0.8)', // B
        'rgba(234, 179, 8, 0.8)',  // C
        'rgba(249, 115, 22, 0.8)',  // D
        'rgba(239, 68, 68, 0.8)'   // F
      ],
      borderRadius: 6,
      barThickness: 20,
    }]
  };

  return (
    <div className="space-y-8">
      {/* Header & Filter Docks */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Interactive Analytics</h1>
          <p className="text-sm text-slate-400 font-medium">Explore academic trends, class performances, and grade distributions.</p>
        </div>

        {/* Filter dock */}
        <div className="flex flex-wrap gap-2.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/40">
          {/* Class Selector */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="all">All Classes</option>
            {classesList.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>

          {/* Section Selector */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="all">All Sections</option>
            {sectionsList.map(sec => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-primary rounded-xl"><Users className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Audited Students</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><BookOpen className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Published Result Cards</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{resultsPublished}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Award className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Pass Rate</p>
            <h3 className="text-xl font-black text-green-600 mt-0.5">{passRate}%</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Pending Marks Cards</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{totalStudents - resultsPublished}</h3>
          </div>
        </div>
      </div>

      {resultsPublished > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Performance */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Subject Wise Averages (%)</h3>
            </div>
            <div className="h-64">
              <Bar data={subjectChartData} options={barChartOptions} />
            </div>
          </motion.div>

          {/* Pass/Fail Doughnut */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Award className="h-5 w-5 text-green-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pass Ratio Overview</h3>
            </div>
            <div className="h-64 flex justify-center items-center relative">
              <div className="w-44 h-44">
                <Doughnut data={passChartData} options={doughnutChartOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
                  <span className="text-2xl font-black text-slate-850">{passRate}%</span>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Passed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Class Performance */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Class Wise Averages (%)</h3>
            </div>
            <div className="h-64">
              <Bar data={classChartData} options={barChartOptions} />
            </div>
          </motion.div>

          {/* Grade Distribution Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Award className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Grade Spread Analysis</h3>
            </div>
            <div className="h-64">
              <Bar data={gradeChartData} options={{ ...barChartOptions, scales: { ...barChartOptions.scales, y: { ...barChartOptions.scales.y, max: undefined, ticks: { ...barChartOptions.scales.y.ticks, stepSize: 2 } } } }} />
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="h-10 w-10 text-slate-300 stroke-1" />
          <h3 className="font-bold text-slate-800 text-lg">No Results Data Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm">Seeded student results are required before we can visualize class performance metrics.</p>
        </div>
      )}
    </div>
  );
};
