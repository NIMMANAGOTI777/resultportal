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

if (!urlMatch || !keyMatch) {
  console.error("Supabase config not found in .env file.");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim().replace(/['"]/g, '');
const supabaseAnonKey = keyMatch[1].trim().replace(/['"]/g, '');

console.log("Supabase URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("\n=== STARTING STUDENT AUTH & TEACHER REQUESTS VERIFICATION ===\n");

  // 1. Verify get_student_result RPC with correct credentials
  console.log("Testing get_student_result RPC with valid credentials (7001 / Arjun Konda)...");
  const { data: validResult, error: validError } = await supabase.rpc('get_student_result', {
    admission_num: '7001',
    name_val: 'Arjun Konda'
  });

  if (validError) {
    console.error("❌ RPC get_student_result failed:", validError.message);
  } else if (!validResult) {
    console.warn("⚠️ No student returned for 7001 / Arjun Konda (DB might need seeding).");
  } else {
    console.log("✅ get_student_result RPC lookup succeeded.");
    console.log("Student Name:", validResult.student.student_name);
    console.log("Admission Number:", validResult.student.admission_number);
    console.log("Class:", validResult.student.class, "Section:", validResult.student.section);
    console.log("Subject-wise marks count:", Object.keys(validResult.subjectsMap || {}).length);
  }

  // 2. Verify negative lookup search (invalid credentials)
  console.log("\nTesting get_student_result RPC with invalid credentials (9999 / Bad Student)...");
  const { data: badResult, error: badError } = await supabase.rpc('get_student_result', {
    admission_num: '9999',
    name_val: 'Bad Student'
  });

  if (badError) {
    console.error("❌ RPC get_student_result negative test error:", badError.message);
  } else if (badResult !== null) {
    console.error("❌ SECURITY FAILURE: get_student_result returned data for invalid admission number/name!");
    process.exit(1);
  } else {
    console.log("✅ Privacy check passed: returns null for invalid credentials.");
  }

  // 3. Test Teacher Request submissions
  console.log("\nTesting teacher request submission...");
  const tempEmail = `test.teacher.${Date.now()}@zphs.edu`;
  const { data: reqData, error: reqError } = await supabase
    .from('teacher_requests')
    .insert([{
      name: 'Test Teacher',
      email: tempEmail,
      phone: '9999999999',
      subject: 'Computer Science',
      qualification: 'M.Tech, Ph.D',
      status: 'pending'
    }])
    .select()
    .single();

  if (reqError) {
    console.error("❌ Teacher request insertion failed:", reqError.message);
  } else {
    console.log("✅ Teacher request submitted successfully.");
    console.log("Submitted Request Email:", reqData.email);
    console.log("Status:", reqData.status);
  }

  // 4. Verify RLS constraints on students table
  console.log("\nTesting RLS on students table (anonymous read)...");
  const { data: anonStudents, error: anonStudError } = await supabase
    .from('students')
    .select('*')
    .limit(1);

  if (anonStudError) {
    console.log("✅ RLS blocked anonymous select on students table as expected:", anonStudError.message);
  } else if (anonStudents && anonStudents.length > 0) {
    console.warn("⚠️ Warning: Anonymous select returned data (check RLS policies on students table).");
  } else {
    console.log("✅ No records returned (students list is empty or protected).");
  }

  console.log("\n=== VERIFICATION RUN COMPLETE ===");
}

run().catch(err => {
  console.error("Exception during verification run:", err);
  process.exit(1);
});
