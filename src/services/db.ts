import { createClient } from '@supabase/supabase-js';

// Read env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wvwuibrrpmltahqotjfc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nPNFUylGbYhgu13U40SnIA_hnxB98be';
// New flag: if VITE_USE_LOCAL_DATA is true, force mock usage
const useLocalData = import.meta.env.VITE_USE_LOCAL_DATA === 'true';
export const isSupabaseConfigured = !useLocalData && !!supabaseUrl && !!supabaseKey;
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
console.log(isSupabaseConfigured ? "Supabase client initialized" : "Using localStorage mock database fallback");

// TypeScript Types
export interface School {
  id: string;
  school_name: string;
  school_code: string;
  logo_url: string;
  address: string;
  academic_year: string;
  footer_text: string;
}

export interface User {
  id: string;
  email?: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  admissionNumber?: string;
}

export interface Student {
  id: string;
  admission_number: string;
  student_name: string;
  father_name?: string;
  class: string;
  section?: string;
  phone?: string;
  school_id: string;
  caste?: string; // optional caste for 8th class
  pen_number?: string; // optional PEN for 9th & 10th classes
}

export interface TeacherRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Subject {
  id: string;
  subject_name: string;
}

export interface Mark {
  id: string;
  student_id: string;
  subject_id: string;
  fa1: number | null;
  fa2: number | null;
  fa3: number | null;
  fa4: number | null;
  sa1: number | null;
  sa2: number | null;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: string;
}

// ----------------------------------------------------
// DEFAULT MOCK DATA DEFINITIONS
// ----------------------------------------------------
const DEFAULT_SCHOOL: School = {
  id: "school-zphs-1",
  school_name: "ZPHS AGAMOTHKUR",
  school_code: "28160200501",
  logo_url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200",
  address: "Madugulapally Mandal, Nalgonda District, Telangana - 508228",
  academic_year: "2025-2026",
  footer_text: "Note: Regular attendance and home study are key to academic success. Keep learning!"
};

const DEFAULT_TEACHERS: User[] = [
  { id: "teacher-admin", email: "admin@zphs.edu", name: "M. Srinivasa Rao (Principal)", role: "admin" },
  { id: "teacher-maths", email: "teacher@zphs.edu", name: "K. Lalitha (Mathematics Teacher)", role: "teacher" }
];

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "sub-telugu", subject_name: "Telugu" },
  { id: "sub-hindi", subject_name: "Hindi" },
  { id: "sub-english", subject_name: "English" },
  { id: "sub-maths", subject_name: "Mathematics" },
  { id: "sub-phy-science", subject_name: "Physical Science" },
  { id: "sub-bio-science", subject_name: "Biological Science" },
  { id: "sub-social", subject_name: "Social Studies" }
];



const CLASS_8_STUDENTS: Student[] = [
  { id: 'stud-8-1', admission_number: '3855', student_name: 'B. Jyothika', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-2', admission_number: '3856', student_name: 'D. Sri Laxmi', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-3', admission_number: '3857', student_name: 'B. Gowthami', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-4', admission_number: '3859', student_name: 'Ch. Charitha', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-5', admission_number: '3862', student_name: 'B. Yogitha', caste: 'SC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-6', admission_number: '3886', student_name: 'B. Nandini', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-7', admission_number: '3886', student_name: 'N. Anusha', caste: 'SC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-8', admission_number: '3962', student_name: 'K. Sravani', caste: 'SC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-9', admission_number: '3894', student_name: 'O. Vaishnavi', caste: 'SC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-10', admission_number: '3955', student_name: 'J. Shindy', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-11', admission_number: '3965', student_name: 'Shahiya', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-12', admission_number: '3848', student_name: 'B. Vikas', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-13', admission_number: '3874', student_name: 'B. Abinav', caste: 'SC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-14', admission_number: '3877', student_name: 'N. Sai Reddy', caste: 'OC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-15', admission_number: '3851', student_name: 'N. Pranith', caste: 'SC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-16', admission_number: '3853', student_name: 'B. Shiva', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-17', admission_number: '3854', student_name: 'J. Charan Teja', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-18', admission_number: '3849', student_name: 'M. Ishaab', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-19', admission_number: '3887', student_name: 'G. Veneel', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-20', admission_number: '3875', student_name: 'P. Shashank', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-21', admission_number: '3888', student_name: 'D. Varun Teja', caste: 'SC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-22', admission_number: '3932', student_name: 'K. Lokesh', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-23', admission_number: '3954', student_name: 'V. Karthik', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-24', admission_number: '3956', student_name: 'N. Vignesh', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-25', admission_number: '3957', student_name: 'M. Mahidher', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-26', admission_number: '3959', student_name: 'N. Piyush', caste: 'SC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-27', admission_number: '3852', student_name: 'A. Ganesh', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-28', admission_number: '3858', student_name: 'M. Venkatesh', caste: 'BC', class: '8', school_id: 'school-zphs-1' },
  { id: 'stud-8-29', admission_number: '3888', student_name: 'A. Jaswanth', caste: 'BC', class: '8', school_id: 'school-zphs-1' }
];

const CLASS_9_STUDENTS: Student[] = [
  { id: 'stud-9-1', admission_number: '3888', student_name: 'ALLUTLA JASHWANTH', pen_number: '20043448231', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-2', admission_number: '3852', student_name: 'ANDEM GANESH', pen_number: '20009510862', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-3', admission_number: '3874', student_name: 'BANDI ABHINAV', pen_number: '20035943704', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-4', admission_number: '3857', student_name: 'BANTU GOUTHAMI', pen_number: '20284480027', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-5', admission_number: '3855', student_name: 'BANTU JYOTHIKA', pen_number: '20066437383', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-6', admission_number: '3862', student_name: 'BODDU NANDINI', pen_number: '20286840073', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-7', admission_number: '3853', student_name: 'BODDU SHIVA', pen_number: '20248214956', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-8', admission_number: '3848', student_name: 'BODDU VIKAS', pen_number: '20021149874', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-9', admission_number: '3859', student_name: 'BOLKONDA YOGITHA', pen_number: '20005827141', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-10', admission_number: '3858', student_name: 'CHITHALURI CHARITHA', pen_number: '20031236671', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-11', admission_number: '3856', student_name: 'DASARI SRILAKSHMI', pen_number: '20011214098', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-12', admission_number: '3894', student_name: 'DASARI VAISHNAVI', pen_number: '20030624669', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-13', admission_number: '3893', student_name: 'DASARI VARUN TEJ', pen_number: '20200733559', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-14', admission_number: '3887', student_name: 'GADDAMIDI VINEEL', pen_number: '20030121162', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-15', admission_number: '3955', student_name: 'JAKKALA SINDHU', pen_number: '20661586021', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-16', admission_number: '3854', student_name: 'JUJJURI CHARAN TEJA', pen_number: '20531158076', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-17', admission_number: '3932', student_name: 'KOKA LOKESH', pen_number: '20267445366', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-18', admission_number: '3962', student_name: 'KONDA SRAVANI', pen_number: '20624586182', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-19', admission_number: '3958', student_name: 'MADASU VENKATESH', pen_number: '20014304247', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-20', admission_number: '3849', student_name: 'MALLEBOINA ISSAK', pen_number: '20014106936', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-21', admission_number: '3957', student_name: 'MANDALA MAHIDHAR', pen_number: '20032994519', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-22', admission_number: '3886', student_name: 'NAKIREKANTI ANUSHA', pen_number: '20287847771', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-23', admission_number: '3851', student_name: 'NAKIREKANTI PRANITH', pen_number: '20022664030', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-24', admission_number: '3877', student_name: 'NAMIREDDY SAI REDDY', pen_number: '20215120374', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-25', admission_number: '3956', student_name: 'NELLUTLA VIGNESH', pen_number: '20402049366', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-26', admission_number: '3875', student_name: 'PALLA SHESHANK', pen_number: '20173926776', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-27', admission_number: '3965', student_name: 'SHAIK SHAHIN', pen_number: '20012250540', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-28', admission_number: '3954', student_name: 'VALLOJU KARTHIK', pen_number: '20071880822', class: '9', school_id: 'school-zphs-1' },
  { id: 'stud-9-29', admission_number: '3959', student_name: 'NUKAPANGA RISHWIK', pen_number: '20091654514', class: '9', school_id: 'school-zphs-1' }
];

const CLASS_10_STUDENTS: Student[] = [
  { id: 'stud-10-1', admission_number: '3827', student_name: 'AVIRENDLA BINDHUSRI', pen_number: '20341624129', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-2', admission_number: '3826', student_name: 'AVIRENDLA MAHALAKSHMI', pen_number: '20096736173', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-3', admission_number: '3961', student_name: 'BANTU MAHALAXMI', pen_number: '20012282664', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-4', admission_number: '3825', student_name: 'BANTU SHIRISHA', pen_number: '20082311105', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-5', admission_number: '3814', student_name: 'CHITHALURI BHAVANA', pen_number: '20102979903', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-6', admission_number: '3933', student_name: 'KATAM AKSHAYA', pen_number: '20056002391', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-7', admission_number: '3807', student_name: 'NAKKA NIHARIKA', pen_number: '20531661379', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-8', admission_number: '3917', student_name: 'NAMPALLY CHETHANA', pen_number: '20316867564', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-9', admission_number: '3821', student_name: 'PALLA POOJA', pen_number: '20004005510', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-10', admission_number: '3918', student_name: 'PATHANI SIRI', pen_number: '20667127504', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-11', admission_number: '3920', student_name: 'YALAGABOINA TEJASRI', pen_number: '20237083500', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-12', admission_number: '3816', student_name: 'BANTU JASHWANTH', pen_number: '20143271715', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-13', admission_number: '3815', student_name: 'BANTU KARTHIK', pen_number: '20039537121', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-14', admission_number: '3880', student_name: 'BANTU RISHI', pen_number: '20006215044', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-15', admission_number: '3818', student_name: 'BANTU SAIRAM', pen_number: '20207602801', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-16', admission_number: '3819', student_name: 'BODDU SHIVA', pen_number: '20009203847', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-17', admission_number: '3805', student_name: 'BOMMAKANTI MANIKANTA', pen_number: '20920763703', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-18', admission_number: '3916', student_name: 'KANDLAKUNTI RAMBABU', pen_number: '20009698082', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-19', admission_number: '3960', student_name: 'KOMMU LOKESH', pen_number: '20176486188', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-20', admission_number: '3915', student_name: 'KURELLA SHIVAMANI NAGABHUSHANAM', pen_number: '20521038904', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-21', admission_number: '3845', student_name: 'MANDALA SAIKUMAR', pen_number: '20007971283', class: '10', school_id: 'school-zphs-1' },
  { id: 'stud-10-22', admission_number: '3804', student_name: 'PANDIRI NIKHIL', pen_number: '20119791746', class: '10', school_id: 'school-zphs-1' }
];

const DEFAULT_STUDENTS: Student[] = [...CLASS_8_STUDENTS, ...CLASS_9_STUDENTS, ...CLASS_10_STUDENTS];

const DEFAULT_MARKS: Mark[] = [];
// Generate mock marks for each student‑subject pair using the same deterministic algorithm as before.
DEFAULT_STUDENTS.forEach((student, idx) => {
  DEFAULT_SUBJECTS.forEach((subject, subIdx) => {
    const seed = idx * 7 + subIdx;
    const fa1 = 13 + ((seed + 1) % 8);
    const fa2 = 13 + ((seed + 2) % 8);
    const fa3 = 13 + ((seed + 3) % 8);
    const fa4 = 13 + ((seed + 5) % 8);
    const sa1 = 60 + ((seed * 2) % 36); // 60‑95
    const sa2 = 60 + ((seed * 4) % 36);
    DEFAULT_MARKS.push({
      id: `m-${student.id}-${subject.id}`,
      student_id: student.id,
      subject_id: subject.id,
      fa1,
      fa2,
      fa3,
      fa4,
      sa1,
      sa2,
      updated_at: new Date().toISOString()
    });
  });
});

const DEFAULT_ACTIVITIES: ActivityLog[] = [
  { id: "act-1", text: "System initialized with Telugu & English language support", timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "act-2", text: "Imported Class 8, 9 & 10 registers (80 total students)", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "act-3", text: "Initialized all student marks to 0", timestamp: new Date().toISOString() }
];

// Helper to initialize local storage
function initLocalStorageMock() {
  const currentSchoolStr = localStorage.getItem('zphs_school');
  if (!currentSchoolStr || JSON.parse(currentSchoolStr).school_name.includes("Zilla Parishad")) {
    localStorage.setItem('zphs_school', JSON.stringify(DEFAULT_SCHOOL));
  }
  if (!localStorage.getItem('zphs_teachers')) {
    localStorage.setItem('zphs_teachers', JSON.stringify(DEFAULT_TEACHERS));
  }
  if (!localStorage.getItem('zphs_subjects')) {
    localStorage.setItem('zphs_subjects', JSON.stringify(DEFAULT_SUBJECTS));
  }
  
  // Force reset once to keep ONLY Class 8, 9 & 10 student data
  const migratedAllClasses = localStorage.getItem('zphs_migrated_all_classes_v4');
  if (!migratedAllClasses) {
    localStorage.setItem('zphs_students', JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem('zphs_marks', JSON.stringify(DEFAULT_MARKS));
    localStorage.setItem('zphs_migrated_all_classes_v4', 'true');
  } else {
    // If already migrated, make sure they are not empty
    if (!localStorage.getItem('zphs_students')) {
      localStorage.setItem('zphs_students', JSON.stringify(DEFAULT_STUDENTS));
    }
    if (!localStorage.getItem('zphs_marks')) {
      localStorage.setItem('zphs_marks', JSON.stringify(DEFAULT_MARKS));
    }
  }

  if (!localStorage.getItem('zphs_activities')) {
    localStorage.setItem('zphs_activities', JSON.stringify(DEFAULT_ACTIVITIES));
  }
}

// Call helper
if (!isSupabaseConfigured) {
  initLocalStorageMock();
}

// ----------------------------------------------------
// DATABASE SERVICE IMPLEMENTATION
// ----------------------------------------------------

export const dbService = {
  // Audit Logger
  async addAuditLog(action: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user ? user.id : 'anonymous';
      await supabase.from('audit_logs').insert([{ user_id: userId, action }]);
    } else {
      const logs = JSON.parse(localStorage.getItem('zphs_audit_logs') || '[]');
      logs.push({
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        user_id: 'local-user',
        action,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('zphs_audit_logs', JSON.stringify(logs));
    }
  },

  // Portal stats aggregate via secure RPC
  async getPortalStats(): Promise<{ studentsCount: number; classesCount: number; publishedCount: number; avgPercent: number }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('get_portal_stats');
      if (error) {
        console.error("Failed to fetch portal stats:", error.message);
        return { studentsCount: 0, classesCount: 0, publishedCount: 0, avgPercent: 0 };
      }
      return data;
    } else {
      const studList = await this.getStudents();
      const markList = await this.getAllMarks();
      const studentsCount = studList.length || 6;
      const classesCount = Array.from(new Set(studList.map(s => s.class))).length || 2;
      const publishedCount = Array.from(new Set(markList.map(m => m.student_id))).length || 3;
      
      let totalObt = 0;
      let totalMax = 0;
      studList.forEach(s => {
        const studentMarks = markList.filter(m => m.student_id === s.id);
        studentMarks.forEach(m => {
          let sObt = 0;
          let sMax = 0;
          if (m.fa1 != null) { sObt += m.fa1; sMax += 20; }
          if (m.fa2 != null) { sObt += m.fa2; sMax += 20; }
          if (m.fa3 != null) { sObt += m.fa3; sMax += 20; }
          if (m.fa4 != null) { sObt += m.fa4; sMax += 20; }
          if (m.sa1 != null) { sObt += m.sa1; sMax += 100; }
          if (m.sa2 != null) { sObt += m.sa2; sMax += 100; }
          totalObt += sObt;
          totalMax += sMax;
        });
      });
      
      const avgPercent = totalMax === 0 ? 80 : Math.round((totalObt / totalMax) * 100);
      return { studentsCount, classesCount, publishedCount, avgPercent };
    }
  },

  // School Settings
  async getSchoolSettings(): Promise<School> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('schools').select('*').limit(1).single();
      if (!error && data) return data;
      return DEFAULT_SCHOOL;
    } else {
      return JSON.parse(localStorage.getItem('zphs_school') || JSON.stringify(DEFAULT_SCHOOL));
    }
  },

  async updateSchoolSettings(settings: Partial<School>): Promise<School> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('schools')
        .update(settings)
        .eq('id', settings.id)
        .select()
        .single();
      if (error) throw error;
      await this.addAuditLog(`Updated school settings: ${data.school_name}`);
      return data;
    } else {
      const current = await this.getSchoolSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem('zphs_school', JSON.stringify(updated));
      await this.addActivity(`Updated school branding settings: ${updated.school_name}`);
      await this.addAuditLog(`Updated school settings (local): ${updated.school_name}`);
      return updated;
    }
  },

  // Auth Operations
  async login(email: string, password: string): Promise<User> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Get teacher profile
      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .single();
      
      const userObj: User = teacher || {
        id: data.user.id,
        email: data.user.email || email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'teacher'
      };
      
      await this.addAuditLog(`Teacher login: ${email}`);
      return userObj;
    } else {
      const teachers: User[] = JSON.parse(localStorage.getItem('zphs_teachers') || '[]');
      const user = teachers.find(t => t.email && t.email.toLowerCase() === email.toLowerCase());
      
      if (user && password === 'password') {
        sessionStorage.setItem('zphs_current_user', JSON.stringify(user));
        await this.addAuditLog(`Teacher login (local): ${email}`);
        return user;
      }
      throw new Error("Invalid email or password");
    }
  },

  async logout(): Promise<void> {
    const user = await this.getCurrentUser();
    if (user) {
      const email = user.email || 'student-' + user.id;
      await this.addAuditLog(`User logout: ${email}`);
    }
    
    sessionStorage.removeItem('zphs_student_session');
    
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      sessionStorage.removeItem('zphs_current_user');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const studentSession = sessionStorage.getItem('zphs_student_session');
    if (studentSession) {
      return JSON.parse(studentSession);
    }

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return null;
      const user = session.user;

      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (teacher) return teacher;
      return {
        id: user.id,
        email: user.email || '',
        name: user.email?.split('@')[0] || '',
        role: user.email?.includes('admin') ? 'admin' : 'teacher'
      };
    } else {
      const stored = sessionStorage.getItem('zphs_current_user');
      return stored ? JSON.parse(stored) : null;
    }
  },

  saveStudentSession(user: User): void {
    sessionStorage.setItem('zphs_student_session', JSON.stringify(user));
  },

  clearStudentSession(): void {
    sessionStorage.removeItem('zphs_student_session');
  },

  // Students CRUD
  async getStudents(): Promise<Student[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('students').select('*').order('student_name');
      if (error) throw error;
      return data || [];
    } else {
      return JSON.parse(localStorage.getItem('zphs_students') || '[]');
    }
  },

  async findStudentByAdmission(admissionNumber: string): Promise<Student | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('admission_number', admissionNumber)
        .maybeSingle();
      if (error) {
        console.error('Error fetching student by admission:', error);
        return null;
      }
      return data || null;
    } else {
      const students = await this.getStudents();
      return students.find(s => s.admission_number === admissionNumber) || null;
    }
  },

  async addStudent(student: Omit<Student, 'id' | 'school_id'>): Promise<Student> {
    const school = await this.getSchoolSettings();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('students')
        .insert([{ ...student, school_id: school.id }])
        .select()
        .single();
      if (error) throw error;
      await this.addAuditLog(`Created student: ${data.student_name} (Admission: ${data.admission_number})`);
      return data;
    } else {
      const students = await this.getStudents();
      
      if (students.some(s => s.admission_number.toLowerCase() === student.admission_number.toLowerCase())) {
        throw new Error(`Admission number ${student.admission_number} already exists!`);
      }

      const newStudent: Student = {
        ...student,
        id: 'stud-' + Math.random().toString(36).substr(2, 9),
        school_id: school.id
      };
      students.push(newStudent);
      localStorage.setItem('zphs_students', JSON.stringify(students));
      await this.addActivity(`Added student: ${newStudent.student_name} (Admission: ${newStudent.admission_number})`);
      await this.addAuditLog(`Created student (local): ${newStudent.student_name} (Admission: ${newStudent.admission_number})`);
      return newStudent;
    }
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await this.addAuditLog(`Updated student: ${data.student_name} (Admission: ${data.admission_number})`);
      return data;
    } else {
      const students = await this.getStudents();
      const idx = students.findIndex(s => s.id === id);
      if (idx === -1) throw new Error("Student not found");
      
      if (updates.admission_number && updates.admission_number !== students[idx].admission_number) {
        if (students.some(s => s.id !== id && s.admission_number.toLowerCase() === updates.admission_number?.toLowerCase())) {
          throw new Error(`Admission number ${updates.admission_number} already exists!`);
        }
      }

      const updated = { ...students[idx], ...updates };
      students[idx] = updated;
      localStorage.setItem('zphs_students', JSON.stringify(students));
      await this.addActivity(`Updated student details: ${updated.student_name}`);
      await this.addAuditLog(`Updated student (local): ${updated.student_name} (Admission: ${updated.admission_number})`);
      return updated;
    }
  },

  async deleteStudent(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { data: st } = await supabase.from('students').select('student_name, admission_number').eq('id', id).maybeSingle();
      const name = st ? st.student_name : id;
      const adm = st ? st.admission_number : '';
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      await this.addAuditLog(`Deleted student: ${name} (Admission: ${adm})`);
    } else {
      const students = await this.getStudents();
      const student = students.find(s => s.id === id);
      const filtered = students.filter(s => s.id !== id);
      localStorage.setItem('zphs_students', JSON.stringify(filtered));

      const marks = await this.getAllMarks();
      const filteredMarks = marks.filter(m => m.student_id !== id);
      localStorage.setItem('zphs_marks', JSON.stringify(filteredMarks));

      if (student) {
        await this.addActivity(`Deleted student: ${student.student_name}`);
        await this.addAuditLog(`Deleted student (local): ${student.student_name} (Admission: ${student.admission_number})`);
      }
    }
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('subjects').select('*').order('subject_name');
      if (error) throw error;
      return data || [];
    } else {
      return JSON.parse(localStorage.getItem('zphs_subjects') || '[]');
    }
  },

  // Marks Operations
  async getAllMarks(): Promise<Mark[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('marks').select('*');
      if (error) throw error;
      return data || [];
    } else {
      return JSON.parse(localStorage.getItem('zphs_marks') || '[]');
    }
  },

  async saveMarks(studentId: string, subjectId: string, marksData: Partial<Omit<Mark, 'id' | 'student_id' | 'subject_id' | 'updated_at'>>): Promise<Mark> {
    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from('marks')
        .select('id')
        .eq('student_id', studentId)
        .eq('subject_id', subjectId)
        .maybeSingle();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('marks')
          .update({ ...marksData, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('marks')
          .insert([{ student_id: studentId, subject_id: subjectId, ...marksData }])
          .select()
          .single();
        if (error) throw error;
        result = data;
      }
      
      const { data: st } = await supabase.from('students').select('student_name, admission_number').eq('id', studentId).maybeSingle();
      const { data: sub } = await supabase.from('subjects').select('subject_name').eq('id', subjectId).maybeSingle();
      await this.addAuditLog(`Updated marks for student ${st?.student_name || studentId} (Admission: ${st?.admission_number || ''}) in subject ${sub?.subject_name || subjectId}`);
      
      return result;
    } else {
      const marks = await this.getAllMarks();
      const idx = marks.findIndex(m => m.student_id === studentId && m.subject_id === subjectId);
      
      let updatedMark: Mark;
      if (idx !== -1) {
        updatedMark = {
          ...marks[idx],
          ...marksData,
          updated_at: new Date().toISOString()
        } as Mark;
        marks[idx] = updatedMark;
      } else {
        updatedMark = {
          id: 'm-' + Math.random().toString(36).substr(2, 9),
          student_id: studentId,
          subject_id: subjectId,
          fa1: marksData.fa1 !== undefined ? marksData.fa1 : null,
          fa2: marksData.fa2 !== undefined ? marksData.fa2 : null,
          fa3: marksData.fa3 !== undefined ? marksData.fa3 : null,
          fa4: marksData.fa4 !== undefined ? marksData.fa4 : null,
          sa1: marksData.sa1 !== undefined ? marksData.sa1 : null,
          sa2: marksData.sa2 !== undefined ? marksData.sa2 : null,
          updated_at: new Date().toISOString()
        };
        marks.push(updatedMark);
      }

      localStorage.setItem('zphs_marks', JSON.stringify(marks));
      
      const students = await this.getStudents();
      const student = students.find(s => s.id === studentId);
      const subjects = await this.getSubjects();
      const subject = subjects.find(s => s.id === subjectId);
      if (student && subject) {
        await this.addActivity(`Updated marks for ${student.student_name} in ${subject.subject_name}`);
        await this.addAuditLog(`Updated marks (local) for student: ${student.student_name} (Admission: ${student.admission_number}) in subject ${subject.subject_name}`);
      }

      return updatedMark;
    }
  },

  async bulkSaveMarks(entries: { admissionNumber: string; studentName: string; classVal: string; subjectName: string; marks: Partial<Omit<Mark, 'id' | 'student_id' | 'subject_id' | 'updated_at'>> }[]): Promise<{ success: number; failed: string[] }> {
    let successCount = 0;
    const failures: string[] = [];
    
    const students = await this.getStudents();
    const subjects = await this.getSubjects();
    
    for (const entry of entries) {
      try {
        let student = students.find(s => s.admission_number === entry.admissionNumber);
        
        if (!student) {
          student = await this.addStudent({
            admission_number: entry.admissionNumber,
            student_name: entry.studentName,
            father_name: "Parent",
            class: entry.classVal,
            section: "A",
            phone: ""
          });
          students.push(student);
        }

        let subject = subjects.find(s => s.subject_name.toLowerCase() === entry.subjectName.toLowerCase());
        if (!subject) {
          if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase
              .from('subjects')
              .insert([{ subject_name: entry.subjectName }])
              .select()
              .single();
            if (error) throw error;
            subject = data;
          } else {
            const localSubs = JSON.parse(localStorage.getItem('zphs_subjects') || '[]');
            subject = {
              id: 'sub-' + Math.random().toString(36).substr(2, 9),
              subject_name: entry.subjectName
            };
            localSubs.push(subject);
            localStorage.setItem('zphs_subjects', JSON.stringify(localSubs));
          }
          if (subject) {
            subjects.push(subject);
          }
        }

        if (!subject) {
          throw new Error(`Could not create subject: ${entry.subjectName}`);
        }

        await this.saveMarks(student.id, subject.id, entry.marks);
        successCount++;
      } catch (err: any) {
        failures.push(`Admission ${entry.admissionNumber} (${entry.subjectName}): ${err.message || 'Validation error'}`);
      }
    }

    if (successCount > 0) {
      await this.addActivity(`Imported marks spreadsheet with ${successCount} entries`);
      await this.addAuditLog(`Excel marks import: ${successCount} entries imported successfully`);
    }

    return {
      success: successCount,
      failed: failures
    };
  },

  // Student portal lookup via secure RPC to protect student records privacy
  async findStudentWithMarks(admissionNumber: string, studentName: string): Promise<any | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('get_student_result', {
        admission_num: admissionNumber,
        name_val: studentName
      });
      if (error) {
        console.error("RPC student lookup failed:", error.message);
        return null;
      }
      return data;
    } else {
      const students = await this.getStudents();
      const student = students.find(
        s => s.admission_number === admissionNumber && s.student_name.toLowerCase() === studentName.toLowerCase()
      );

      if (!student) return null;

      const allMarks = await this.getAllMarks();
      const subjects = await this.getSubjects();

      const studentMarksMap: { [subjectName: string]: any } = {};
      
      subjects.forEach(sub => {
        studentMarksMap[sub.subject_name] = {
          fa1: null,
          fa2: null,
          fa3: null,
          fa4: null,
          sa1: null,
          sa2: null
        };
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
          caste: cs.caste,
          penNumber: cs.pen_number,
          subjects: csMarksMap,
          attendance: { workingDays: 0, presentDays: 0 }
        });
      }

      const currentStudentWithMarks = {
        studentId: student.id,
        studentName: student.student_name,
        admissionNumber: student.admission_number,
        class: student.class,
        section: student.section,
        caste: student.caste,
        penNumber: student.pen_number,
        subjects: studentMarksMap,
        attendance: { workingDays: 0, presentDays: 0 }
      };

      return {
        student,
        subjectsMap: studentMarksMap,
        classStudents: classStudentsWithMarks,
        currentWithMarks: currentStudentWithMarks
      };
    }
  },

  // Activities
  async getRecentActivities(): Promise<ActivityLog[]> {
    if (isSupabaseConfigured && supabase) {
      // Fetch latest logs from audit_logs table
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) {
        console.error("Failed to fetch audit logs:", error.message);
        return [];
      }
      return (data || []).map(log => ({
        id: log.id,
        text: log.action,
        timestamp: log.created_at
      }));
    } else {
      const logs = JSON.parse(localStorage.getItem('zphs_activities') || '[]');
      return logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    }
  },

  async addActivity(text: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const logs = JSON.parse(localStorage.getItem('zphs_activities') || '[]');
      const newLog: ActivityLog = {
        id: 'act-' + Math.random().toString(36).substr(2, 9),
        text,
        timestamp: new Date().toISOString()
      };
      logs.push(newLog);
      localStorage.setItem('zphs_activities', JSON.stringify(logs));
    }
  },

  // Teacher Request Operations
  async submitTeacherRequest(request: Omit<TeacherRequest, 'id' | 'status' | 'created_at'>): Promise<TeacherRequest> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('teacher_requests')
        .insert([{ ...request, status: 'pending' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const requests = JSON.parse(localStorage.getItem('zphs_teacher_requests') || '[]');
      const newRequest: TeacherRequest = {
        ...request,
        id: 'req-' + Math.random().toString(36).substr(2, 9),
        status: 'pending',
        created_at: new Date().toISOString()
      };
      requests.push(newRequest);
      localStorage.setItem('zphs_teacher_requests', JSON.stringify(requests));
      return newRequest;
    }
  },

  async getTeacherRequests(): Promise<TeacherRequest[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('teacher_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return JSON.parse(localStorage.getItem('zphs_teacher_requests') || '[]');
    }
  },

  async updateTeacherRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<TeacherRequest> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('teacher_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const requests = await this.getTeacherRequests();
      const idx = requests.findIndex(r => r.id === id);
      if (idx === -1) throw new Error("Request not found");
      
      requests[idx].status = status;
      localStorage.setItem('zphs_teacher_requests', JSON.stringify(requests));

      // Mock account creation on approval
      if (status === 'approved') {
        const teachers: User[] = JSON.parse(localStorage.getItem('zphs_teachers') || '[]');
        const newTeacherEmail = requests[idx].email;
        if (!teachers.some(t => t.email === newTeacherEmail)) {
          teachers.push({
            id: 'mock-t-' + Math.random().toString(36).substr(2, 9),
            email: newTeacherEmail,
            name: requests[idx].name,
            role: 'teacher'
          });
          localStorage.setItem('zphs_teachers', JSON.stringify(teachers));
        }
      }

      return requests[idx];
    }
  }
};
