import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = 'c:/Users/ADMIN/OneDrive/goal/Desktop/zphs/.env';
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
  console.error("Error reading .env file:", e.message);
  process.exit(1);
}

const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*([^\r\n]+)/);

const supabaseUrl = urlMatch[1].trim().replace(/['"]/g, '');
const supabaseAnonKey = keyMatch[1].trim().replace(/['"]/g, '');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("=== FINAL DATABASE INTEGRATION CHECK ===");
  
  // 1. Check Supabase connection & RPC stats
  let stats = null;
  try {
    console.log("Querying get_portal_stats RPC...");
    const { data, error } = await supabase.rpc('get_portal_stats');
    if (error) {
      console.error("❌ Failed to query get_portal_stats:", error.message);
      process.exit(1);
    }
    stats = data;
    console.log("✅ get_portal_stats RPC succeeded. Stats:", stats);
  } catch (err) {
    console.error("❌ Exception during connection check:", err);
    process.exit(1);
  }

  // 2. Check if seeding is needed
  if (stats && stats.studentsCount === 0) {
    console.log("\nNo students found in the database. Seeding 20 students and marks...");
    
    // Login as admin to get auth session for writes
    console.log("Logging in as admin@zphs.edu...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@zphs.edu',
      password: 'Password123'
    });

    if (authError) {
      console.error("❌ Admin login failed:", authError.message);
      process.exit(1);
    }
    console.log("✅ Login successful. Authenticated Session established.");

    // Seed subjects
    const subjects = [
      { id: 'sub-telugu', subject_name: 'Telugu' },
      { id: 'sub-english', subject_name: 'English' },
      { id: 'sub-maths', subject_name: 'Mathematics' },
      { id: 'sub-science', subject_name: 'Science' },
      { id: 'sub-social', subject_name: 'Social Studies' }
    ];
    console.log("Upserting subjects...");
    const { error: subError } = await supabase.from('subjects').upsert(subjects);
    if (subError) {
      console.error("❌ Subjects upsert failed:", subError.message);
      process.exit(1);
    }

    // Seed 20 Students
    const firstNames = ['Arjun', 'Sai', 'Karthik', 'Pranathi', 'Sravanthi', 'Nikhil', 'Pooja', 'Lokesh', 'Vineeth', 'Siri', 'Anusha', 'Charitha', 'Manikanta', 'Ganesh', 'Venkatesh', 'Rishwik', 'Varun', 'Tejasri', 'Akshaya', 'Bhavana'];
    const lastNames = ['Konda', 'Madasu', 'Bantu', 'Dasari', 'Jujjuri', 'Kommu', 'Nellutla', 'Allutla', 'Andem', 'Avirendla', 'Kurella', 'Pandiri', 'Nakirekanti', 'Boddu', 'Bommakanti', 'Kandlakunti', 'Nellore', 'Bairi', 'Chekka', 'Palla'];
    const classes = ['8', '9', '10'];
    const sections = ['A', 'B'];

    const studentsList = [];
    for (let i = 0; i < 20; i++) {
      const rollNumber = (700 + i).toString();
      const studentName = `${firstNames[i]} ${lastNames[i]}`;
      const fatherName = `${lastNames[i]} Sr.`;
      const classVal = classes[i % classes.length];
      const sectionVal = sections[i % sections.length];
      let dob = '2012-06-01';
      if (classVal === '9') dob = '2011-06-01';
      if (classVal === '10') dob = '2010-06-01';

      studentsList.push({
        id: `stud-seeded-${rollNumber}`,
        roll_number: rollNumber,
        student_name: studentName,
        father_name: fatherName,
        date_of_birth: dob,
        class: classVal,
        section: sectionVal,
        phone: '98765432' + i.toString().padStart(2, '0'),
        school_id: 'school-zphs-1'
      });
    }

    console.log("Upserting 20 students...");
    const { error: studError } = await supabase.from('students').upsert(studentsList);
    if (studError) {
      console.error("❌ Students upsert failed:", studError.message);
      process.exit(1);
    }
    console.log("✅ Seeded 20 students.");

    // Seed Marks
    const marksList = [];
    for (const student of studentsList) {
      for (const sub of subjects) {
        const fa1 = Math.floor(Math.random() * 6) + 15;
        const fa2 = Math.floor(Math.random() * 6) + 15;
        const fa3 = Math.floor(Math.random() * 6) + 15;
        const fa4 = Math.floor(Math.random() * 6) + 15;
        const sa1 = Math.floor(Math.random() * 31) + 65;
        const sa2 = Math.floor(Math.random() * 31) + 65;

        marksList.push({
          id: `m-seeded-${student.roll_number}-${sub.id}`,
          student_id: student.id,
          subject_id: sub.id,
          fa1,
          fa2,
          fa3,
          fa4,
          sa1,
          sa2,
          updated_at: new Date().toISOString()
        });
      }
    }

    console.log("Upserting marks...");
    const { error: marksError } = await supabase.from('marks').upsert(marksList);
    if (marksError) {
      console.error("❌ Marks upsert failed:", marksError.message);
      process.exit(1);
    }
    console.log("✅ Seeded marks.");

    // Re-fetch stats
    const { data: newStats } = await supabase.rpc('get_portal_stats');
    stats = newStats;
  } else {
    console.log("\n✅ Database already contains student records. Skipping seeding.");
  }

  // 3. Verify get_student_result RPC
  console.log("\n=== 2. Testing get_student_result RPC ===");
  const testRoll = '700';
  const testDob = '2012-06-01'; // Arjun Konda, Class 8

  const { data: lookupResult, error: lookupError } = await supabase.rpc('get_student_result', {
    roll_num: testRoll,
    dob_val: testDob
  });

  if (lookupError || !lookupResult) {
    console.error("❌ get_student_result RPC failed to locate seeded student:", lookupError?.message || "No data returned");
    process.exit(1);
  }

  console.log("✅ get_student_result RPC check passed.");
  console.log("Seeded Student Name:", lookupResult.student.student_name);
  console.log("Class:", lookupResult.student.class, "Section:", lookupResult.student.section);
  console.log("Subjects Found:", Object.keys(lookupResult.currentWithMarks.subjects).join(", "));
  
  // 4. Verify negative lookup search (invalid credentials)
  console.log("\n=== 3. Testing Negative lookup search (privacy check) ===");
  const { data: badResult } = await supabase.rpc('get_student_result', {
    roll_num: '99999',
    dob_val: '2000-01-01'
  });
  if (badResult !== null) {
    console.error("❌ Security failure: get_student_result returned data for invalid roll/dob!");
    process.exit(1);
  }
  console.log("✅ Privacy checks passed. get_student_result returns null for invalid roll/dob.");

  console.log("\n⭐️ ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! ⭐️");
}

run();
