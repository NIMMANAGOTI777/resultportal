export interface SubjectMarks {
  fa1?: number | null;
  fa2?: number | null;
  fa3?: number | null;
  fa4?: number | null;
  sa1?: number | null;
  sa2?: number | null;
}

export const MAX_MARKS = {
  fa1: 20,
  fa2: 20,
  fa3: 20,
  fa4: 20,
  sa1: 100,
  sa2: 100
};

// Telangana State Board (SSC) Grading Scale
export function getGrade(percentage: number): string {
  if (percentage >= 91) return 'A1';
  if (percentage >= 81) return 'A2';
  if (percentage >= 71) return 'B1';
  if (percentage >= 61) return 'B2';
  if (percentage >= 51) return 'C1';
  if (percentage >= 41) return 'C2';
  if (percentage >= 35) return 'D';
  return 'F';
}

export function getGradePoints(grade: string): number {
  switch (grade) {
    case 'A1': return 10;
    case 'A2': return 9;
    case 'B1': return 8;
    case 'B2': return 7;
    case 'C1': return 6;
    case 'C2': return 5;
    case 'D': return 4;
    default: return 0;
  }
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A1': return 'text-emerald-700 bg-emerald-50 border-emerald-250';
    case 'A2': return 'text-emerald-600 bg-emerald-50/50 border-emerald-200';
    case 'B1': return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'B2': return 'text-blue-600 bg-blue-50/50 border-blue-150';
    case 'C1': return 'text-yellow-700 bg-yellow-50 border-yellow-250';
    case 'C2': return 'text-yellow-600 bg-yellow-50/50 border-yellow-200';
    case 'D': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'F': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-650 bg-gray-50 border-gray-200';
  }
}

export function calculateSubjectTotal(marks: SubjectMarks): number {
  let total = 0;
  if (marks.fa1 != null) total += marks.fa1;
  if (marks.fa2 != null) total += marks.fa2;
  if (marks.fa3 != null) total += marks.fa3;
  if (marks.fa4 != null) total += marks.fa4;
  if (marks.sa1 != null) total += marks.sa1;
  if (marks.sa2 != null) total += marks.sa2;
  return total;
}

export function calculateSubjectMaxTotal(marks: SubjectMarks): number {
  let maxTotal = 0;
  if (marks.fa1 != null) maxTotal += MAX_MARKS.fa1;
  if (marks.fa2 != null) maxTotal += MAX_MARKS.fa2;
  if (marks.fa3 != null) maxTotal += MAX_MARKS.fa3;
  if (marks.fa4 != null) maxTotal += MAX_MARKS.fa4;
  if (marks.sa1 != null) maxTotal += MAX_MARKS.sa1;
  if (marks.sa2 != null) maxTotal += MAX_MARKS.sa2;
  return maxTotal;
}

export function calculateSubjectPercentage(marks: SubjectMarks): number {
  const total = calculateSubjectTotal(marks);
  const maxTotal = calculateSubjectMaxTotal(marks);
  if (maxTotal === 0) return 0;
  return Math.round((total / maxTotal) * 100 * 10) / 10;
}

export interface StudentWithMarks {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  class: string;
  section: string;
  subjects: {
    [subjectName: string]: SubjectMarks;
  };
}

export interface StudentResultSummary {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  class: string;
  section: string;
  totalMarksObtained: number;
  totalMaxMarks: number;
  overallPercentage: number;
  overallGrade: string;
  gpa: number;
  cgpa: number;
  attendance: {
    workingDays: number;
    presentDays: number;
    absentDays: number;
    percentage: number;
  };
  cocurricular: {
    sports: string;
    discipline: string;
    leadership: string;
    participation: string;
  };
  remarks: {
    strengths: string;
    improvements: string;
    suggestions: string;
  };
  subjectResults: {
    subjectName: string;
    marks: SubjectMarks;
    total: number;
    maxTotal: number;
    percentage: number;
    grade: string;
    gradePoints: number;
  }[];
  rank: number;
}

// Pseudo-random deterministic number generator
function getDeterministicValue(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);
  return min + (positiveHash % (max - min + 1));
}

export function calculateStudentSummary(
  student: StudentWithMarks,
  allStudentsInClass: StudentWithMarks[]
): StudentResultSummary {
  const subjectResults = Object.entries(student.subjects).map(([subjectName, marks]) => {
    const total = calculateSubjectTotal(marks);
    const maxTotal = calculateSubjectMaxTotal(marks);
    const percentage = calculateSubjectPercentage(marks);
    const grade = getGrade(percentage);
    const gradePoints = getGradePoints(grade);

    return {
      subjectName,
      marks,
      total,
      maxTotal,
      percentage,
      grade,
      gradePoints
    };
  });

  let totalMarksObtained = 0;
  let totalMaxMarks = 0;
  let totalGradePoints = 0;
  let subjectsCount = 0;

  subjectResults.forEach(sub => {
    totalMarksObtained += sub.total;
    totalMaxMarks += sub.maxTotal;
    if (sub.maxTotal > 0) {
      totalGradePoints += sub.gradePoints;
      subjectsCount++;
    }
  });

  const overallPercentage = totalMaxMarks === 0 ? 0 : Math.round((totalMarksObtained / totalMaxMarks) * 100 * 10) / 10;
  
  // GPA and CGPA calculations based on TS SSC standard
  const gpa = subjectsCount === 0 ? 0 : Math.round((totalGradePoints / subjectsCount) * 100) / 100;
  const cgpa = gpa; // In SSC, CGPA aligns with GPA
  
  // Overall Grade by GPA
  let overallGrade = 'F';
  if (gpa >= 9.5) overallGrade = 'A1';
  else if (gpa >= 8.5) overallGrade = 'A2';
  else if (gpa >= 7.5) overallGrade = 'B1';
  else if (gpa >= 6.5) overallGrade = 'B2';
  else if (gpa >= 5.5) overallGrade = 'C1';
  else if (gpa >= 4.5) overallGrade = 'C2';
  else if (gpa >= 4.0) overallGrade = 'D';

  // Deterministic Attendance
  const workingDays = 220;
  const presentDays = getDeterministicValue(student.admissionNumber + student.studentName, 178, 218);
  const absentDays = workingDays - presentDays;
  const attendancePercentage = Math.round((presentDays / workingDays) * 100 * 10) / 10;

  // Deterministic Co-Curriculars
  const cocurricularGrades = ['A1', 'A2', 'B1', 'B2'];
  const sports = cocurricularGrades[getDeterministicValue(student.admissionNumber + '-sports', 0, 3)];
  const discipline = cocurricularGrades[getDeterministicValue(student.admissionNumber + '-disc', 0, 2)];
  const leadership = cocurricularGrades[getDeterministicValue(student.admissionNumber + '-lead', 0, 3)];
  const participation = cocurricularGrades[getDeterministicValue(student.admissionNumber + '-part', 0, 2)];

  // Deterministic Remarks
  const strengthsList = [
    "Displays keen analytical skills and promptness in submitting assignments.",
    "Shows strong logical reasoning and active interest in classroom discussions.",
    "Highly cooperative, expressive, and excellent at project work.",
    "Exhibits great comprehension capabilities and conceptual understanding."
  ];
  const improvementsList = [
    "Should focus more on spelling, grammar, and neatness in written answers.",
    "Needs to spend more time on self-study and clarifying conceptual doubts.",
    "Should participate more actively in peer group learning and activities.",
    "Needs improvement in mathematical steps and derivation presentation."
  ];
  const suggestionsList = [
    "Encouraged to read daily news and general science magazines for overall development.",
    "Regular practice and solving question papers will help achieve top grades.",
    "Maintain this enthusiasm and focus more on experimental science projects.",
    "Keep up the hard work and practice mock papers regularly."
  ];

  const remarks = {
    strengths: strengthsList[getDeterministicValue(student.admissionNumber + '-str', 0, strengthsList.length - 1)],
    improvements: improvementsList[getDeterministicValue(student.admissionNumber + '-imp', 0, improvementsList.length - 1)],
    suggestions: suggestionsList[getDeterministicValue(student.admissionNumber + '-sug', 0, suggestionsList.length - 1)]
  };

  // Calculate ranks
  const classPercentages = allStudentsInClass.map(s => {
    let obtained = 0;
    let max = 0;
    Object.values(s.subjects).forEach(marks => {
      obtained += calculateSubjectTotal(marks);
      max += calculateSubjectMaxTotal(marks);
    });
    return {
      id: s.studentId,
      percentage: max === 0 ? 0 : obtained / max
    };
  });

  // Sort descending by percentage
  classPercentages.sort((a, b) => b.percentage - a.percentage);

  // Find rank (1-indexed, handle ties)
  let rank = 1;
  for (let i = 0; i < classPercentages.length; i++) {
    if (classPercentages[i].id === student.studentId) {
      // Find the first index with the same percentage to handle ties
      const firstIndexWithSamePercentage = classPercentages.findIndex(
        item => item.percentage === classPercentages[i].percentage
      );
      rank = firstIndexWithSamePercentage + 1;
      break;
    }
  }

  return {
    studentId: student.studentId,
    studentName: student.studentName,
    admissionNumber: student.admissionNumber,
    class: student.class,
    section: student.section,
    totalMarksObtained,
    totalMaxMarks,
    overallPercentage,
    overallGrade,
    gpa,
    cgpa,
    attendance: {
      workingDays,
      presentDays,
      absentDays,
      percentage: attendancePercentage
    },
    cocurricular: {
      sports,
      discipline,
      leadership,
      participation
    },
    remarks,
    subjectResults,
    rank
  };
}
