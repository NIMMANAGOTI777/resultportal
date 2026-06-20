import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import type { Student, Subject, Mark, ActivityLog } from '../services/db';
import { calculateSubjectTotal, calculateSubjectMaxTotal, getGrade } from '../utils/calculations';
import { useTranslation } from '../locales/translations';
import type { Language } from '../locales/translations';
import { Users, BookOpen, CheckCircle, Award, ListTodo, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  language: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ language }) => {
  const { t } = useTranslation(language);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const studList = await dbService.getStudents();
        const subList = await dbService.getSubjects();
        const markList = await dbService.getAllMarks();
        const actList = await dbService.getRecentActivities();

        setStudents(studList);
        setSubjects(subList);
        setMarks(markList);
        setActivities(actList);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
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

  // --- STATS CALCULATIONS ---
  const totalStudents = students.length;
  
  // Total Classes
  const uniqueClasses = Array.from(new Set(students.map(s => s.class)));
  const totalClasses = uniqueClasses.length;

  // Results Published (students who have at least one marks record)
  const studentsWithMarks = Array.from(new Set(marks.map(m => m.student_id)));
  const resultsPublished = studentsWithMarks.length;

  // Overall Average Percentage
  let totalOverallObtained = 0;
  let totalOverallMax = 0;
  
  // Calculate averages
  students.forEach(s => {
    const studentMarks = marks.filter(m => m.student_id === s.id);
    if (studentMarks.length > 0) {
      studentMarks.forEach(m => {
        totalOverallObtained += calculateSubjectTotal(m);
        totalOverallMax += calculateSubjectMaxTotal(m);
      });
    }
  });
  
  const avgPercentage = totalOverallMax === 0 ? 0 : Math.round((totalOverallObtained / totalOverallMax) * 100);

  // --- 1. DYNAMIC TOP PERFORMERS (Highest overall average %) ---
  const studentRankList = students.map(s => {
    const studentMarks = marks.filter(m => m.student_id === s.id);
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
  .slice(0, 3); // top 3

  // --- 2. DYNAMIC PENDING RESULTS ---
  const pendingStudents = students.filter(s => {
    const studentMarks = marks.filter(m => m.student_id === s.id);
    return studentMarks.length < subjects.length; // has missing subjects
  });

  // Container motion presets
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, Teacher 👋
          </h1>
          <p className="text-sm text-slate-400 font-medium">ZPHS Agamothkur Academic Portal Dashboard</p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {/* Card 1: Total Students */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">{t('totalStudents')}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{totalStudents}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-primary rounded-2xl group-hover:scale-105 transition-transform duration-300">
            <Users className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Card 2: Total Classes */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">{t('totalClasses')}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{totalClasses}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Card 3: Results Published */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">{t('resultsPublished')}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {resultsPublished} <span className="text-xs font-semibold text-slate-400">/ {totalStudents}</span>
            </h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:scale-105 transition-transform duration-300">
            <CheckCircle className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Card 4: Average Percentage */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">{t('avgPercentage')}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{avgPercentage}%</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-105 transition-transform duration-300">
            <Award className="h-5 w-5" />
          </div>
        </motion.div>
      </motion.div>

      {/* Modern Dashboard Widgets (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Performers Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/75 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-4.5 w-4.5 text-amber-500" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Top Performers</h3>
          </div>

          <div className="flex-1 space-y-3.5 py-2">
            {studentRankList.length > 0 ? (
              studentRankList.map((ranker, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{ranker.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Class {ranker.class} - {ranker.section}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-850 block">{ranker.percentage}%</span>
                    <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 rounded px-1">{ranker.grade}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center py-10 text-slate-400 text-xs">
                No marks data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Pending Results Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/75 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Pending Results</h3>
          </div>

          <div className="flex-1 space-y-3.5 py-2">
            <div className="flex items-center justify-between p-3.5 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-800">
              <span className="font-bold">Missing Marks Profiles:</span>
              <span className="font-black text-sm bg-red-100 px-2 py-0.5 rounded-lg">{pendingStudents.length} Students</span>
            </div>
            
            <div className="max-h-24 overflow-y-auto pr-1 space-y-1.5 text-xs text-slate-500 font-semibold">
              {pendingStudents.length > 0 ? (
                pendingStudents.slice(0, 4).map((stud, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="truncate">{stud.student_name}</span>
                    <span className="text-[9px] bg-slate-100 rounded px-1 font-bold">Adm {stud.admission_number}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-[10px] text-green-600 font-bold py-6">
                  🎉 All student marks cards are fully complete!
                </div>
              )}
              {pendingStudents.length > 4 && (
                <p className="text-center text-[9px] text-slate-400 font-bold">and {pendingStudents.length - 4} others</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/75 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ListTodo className="h-4.5 w-4.5 text-slate-500" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">System Audit Trail</h3>
          </div>

          <div className="flex-1 min-h-[120px] max-h-[160px] overflow-y-auto pr-1 space-y-3.5 py-1">
            {activities.length > 0 ? (
              activities.map(act => (
                <div key={act.id} className="text-xs space-y-0.5 leading-snug">
                  <p className="font-bold text-slate-700">{act.text}</p>
                  <span className="text-[9px] text-slate-400 font-bold">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-6 text-center text-slate-400 text-xs">
                No recent activity logs
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
