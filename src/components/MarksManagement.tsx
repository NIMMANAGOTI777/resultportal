import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import type { Student, Subject, Mark } from '../services/db';
import { useTranslation } from '../locales/translations';
import type { Language } from '../locales/translations';
import { calculateSubjectTotal, calculateSubjectMaxTotal, calculateSubjectPercentage, getGrade } from '../utils/calculations';
import { BookOpen, GraduationCap, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface MarksManagementProps {
  language: Language;
}

export const MarksManagement: React.FC<MarksManagementProps> = ({ language }) => {
  const { t } = useTranslation(language);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('8');
  const [selectedSubject, setSelectedSubject] = useState('sub-telugu');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state for grid inputs: studentId -> Mark fields
  const [inputMarks, setInputMarks] = useState<{ [studentId: string]: Partial<Mark> }>({});
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const subList = await dbService.getSubjects();
        setSubjects(subList);
        if (subList.length > 0) {
          setSelectedSubject(subList[0].id);
        }
        
        const studList = await dbService.getStudents();
        setStudents(studList);

        const markList = await dbService.getAllMarks();
        setMarks(markList);
      } catch (err) {
        console.error("Error loading marks initial data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Reload grid values when selection changes
  useEffect(() => {
    if (loading) return;
    
    const classStudents = students.filter(s => s.class === selectedClass);
    const initialInputs: { [studentId: string]: Partial<Mark> } = {};
    
    classStudents.forEach(student => {
      const existing = marks.find(m => m.student_id === student.id && m.subject_id === selectedSubject);
      initialInputs[student.id] = existing ? {
        fa1: existing.fa1,
        fa2: existing.fa2,
        fa3: existing.fa3,
        fa4: existing.fa4,
        sa1: existing.sa1,
        sa2: existing.sa2
      } : {
        fa1: null,
        fa2: null,
        fa3: null,
        fa4: null,
        sa1: null,
        sa2: null
      };
    });
    
    setInputMarks(initialInputs);
    setErrorMsg('');
    setSuccessMsg('');
  }, [selectedClass, selectedSubject, marks, students, loading]);

  const handleMarkChange = (studentId: string, field: keyof Mark, value: string) => {
    setErrorMsg('');
    setSuccessMsg('');

    const val = value.trim() === '' ? null : Number(value);
    
    // Bounds validation
    const maxVal = field.startsWith('fa') ? 50 : 100;
    if (val !== null && (isNaN(val) || val < 0 || val > maxVal)) {
      setErrorMsg(`Marks for ${field.toUpperCase()} must be between 0 and ${maxVal}.`);
      return;
    }

    setInputMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val
      }
    }));
  };

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const classStudents = students.filter(s => s.class === selectedClass);
      
      // Save all student marks concurrently using the saveMarks API
      await Promise.all(classStudents.map(async (student) => {
        const studentInputs = inputMarks[student.id] || {};
        const marksData = {
          fa1: studentInputs.fa1 ?? null,
          fa2: studentInputs.fa2 ?? null,
          fa3: studentInputs.fa3 ?? null,
          fa4: studentInputs.fa4 ?? null,
          sa1: studentInputs.sa1 ?? null,
          sa2: studentInputs.sa2 ?? null
        };
        await dbService.saveMarks(student.id, selectedSubject, marksData);
      }));
      
      // Reload marks from source
      const updatedMarks = await dbService.getAllMarks();
      setMarks(updatedMarks);

      setSuccessMsg(t('marksSavedMsg'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save marks records.');
    } finally {
      setSaving(false);
    }
  };

  const classStudents = students.filter(s => s.class === selectedClass);
  const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort();

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('marksManagement')}</h1>
          <p className="text-sm text-slate-400 font-medium">Record and update student assessment sheets directly in the database.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving || classStudents.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-slate-200 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 transition-custom cursor-pointer"
        >
          <Save className="h-4.5 w-4.5" />
          {saving ? t('saving') : t('saveMarks')}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center gap-2.5 text-sm font-semibold">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        {/* Class Selector */}
        <div className="flex-1 space-y-1.5">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {t('selectClass')}
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="pl-10.5 pr-4 py-2.5 w-full border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-sm font-bold text-slate-700 bg-white cursor-pointer"
            >
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{t('class')} {cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject Selector */}
        <div className="flex-1 space-y-1.5">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {t('selectSubject')}
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="pl-10.5 pr-4 py-2.5 w-full border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary text-sm font-bold text-slate-700 bg-white cursor-pointer"
            >
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.subject_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Marks Input Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : classStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                  <th className="py-4.5 px-6 text-left w-20">Roll</th>
                  <th className="py-4.5 px-6 text-left w-52">Student Name</th>
                  <th className="py-4.5 px-2">FA1 (50)</th>
                  <th className="py-4.5 px-2">FA2 (50)</th>
                  <th className="py-4.5 px-2">FA3 (50)</th>
                  <th className="py-4.5 px-2">FA4 (50)</th>
                  <th className="py-4.5 px-2">SA1 (100)</th>
                  <th className="py-4.5 px-2">SA2 (100)</th>
                  <th className="py-4.5 px-4 w-24">Total (400)</th>
                  <th className="py-4.5 px-4 w-16">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                {classStudents.map(student => {
                  const currentValues = inputMarks[student.id] || {};
                  
                  // Compute live totals
                  const computedTotal = calculateSubjectTotal(currentValues);
                  const computedMax = calculateSubjectMaxTotal(currentValues);
                  const computedPercent = calculateSubjectPercentage(currentValues);
                  const computedGrade = computedMax > 0 ? getGrade(computedPercent) : '—';

                  const makeInput = (field: keyof Mark) => (
                    <input
                      type="number"
                      min="0"
                      max={field.startsWith('fa') ? 50 : 100}
                      value={currentValues[field] ?? ''}
                      placeholder="—"
                      onChange={(e) => handleMarkChange(student.id, field, e.target.value)}
                      className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-semibold focus:border-primary focus:ring-2 focus:ring-blue-500/10 outline-none text-xs"
                    />
                  );

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">{student.roll_number}</td>
                      <td className="py-3.5 px-6 font-bold text-slate-900">{student.student_name}</td>
                      <td className="py-3.5 px-2 text-center">{makeInput('fa1')}</td>
                      <td className="py-3.5 px-2 text-center">{makeInput('fa2')}</td>
                      <td className="py-3.5 px-2 text-center">{makeInput('fa3')}</td>
                      <td className="py-3.5 px-2 text-center">{makeInput('fa4')}</td>
                      <td className="py-3.5 px-2 text-center">{makeInput('sa1')}</td>
                      <td className="py-3.5 px-2 text-center">{makeInput('sa2')}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {computedTotal} <span className="text-[10px] font-normal text-slate-400">/{computedMax}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-black text-xs ${
                          computedGrade === 'F' ? 'text-red-700 bg-red-50' : 
                          computedGrade === '—' ? 'text-slate-400 bg-slate-50' :
                          'text-primary bg-blue-50'
                        }`}>
                          {computedGrade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <p className="text-slate-400 text-sm font-semibold">No students registered in Class {selectedClass}</p>
          </div>
        )}
      </div>

    </div>
  );
};
