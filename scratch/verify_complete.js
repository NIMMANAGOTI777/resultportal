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
  console.error("Could not parse VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY from .env");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim().replace(/['"]/g, '');
const supabaseAnonKey = keyMatch[1].trim().replace(/['"]/g, '');

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log("=== STARTING COMPLETE PRODUCTION VERIFICATION AUDIT ===\n");
  let allPassed = true;

  // 1. Verify connection and tables using anon client
  console.log("--- 1. Testing Table Accessibility (Anon Client) ---");
  const tables = ['schools', 'teachers', 'students', 'subjects', 'marks', 'audit_logs'];
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAnon.from(table).select('*').limit(1);
      if (error) {
        // For students, marks, teachers, audit_logs, a direct select as anon should either:
        // - Return empty array (if RLS is active and no policy allows it)
        // - Or return permission error (401/403)
        // Let's print out what happened
        console.log(`ℹ️ Table '${table}' direct SELECT returned error: ${error.message} (Code: ${error.code})`);
      } else {
        console.log(`✅ Table '${table}' direct SELECT succeeded. Returned ${data.length} row(s).`);
      }
    } catch (err) {
      console.error(`❌ Table '${table}' direct SELECT threw exception:`, err);
      allPassed = false;
    }
  }

  // 2. Verify Data Counts
  console.log("\n--- 2. Checking Data Counts via RPC ---");
  try {
    const { data: stats, error: statsError } = await supabaseAnon.rpc('get_portal_stats');
    if (statsError) {
      console.error("❌ get_portal_stats RPC failed:", statsError.message);
      allPassed = false;
    } else {
      console.log("Portal Stats:", stats);
      if (stats.studentsCount < 20) {
        console.warn(`⚠️ Warning: Expected at least 20 students, found ${stats.studentsCount}.`);
        allPassed = false;
      } else {
        console.log(`✅ Student count matches: ${stats.studentsCount} (Expected >= 20)`);
      }
      if (stats.classesCount === 0) {
        console.warn(`⚠️ Warning: Classes count is 0.`);
        allPassed = false;
      } else {
        console.log(`✅ Classes count: ${stats.classesCount}`);
      }
    }
  } catch (err) {
    console.error("❌ Exception during stats check:", err);
    allPassed = false;
  }

  // 3. Verify Security (RLS)
  console.log("\n--- 3. Verifying Security Policies (Direct SELECT Blocked) ---");
  
  // Test direct select on students
  const { data: studData, error: studErr } = await supabaseAnon.from('students').select('*');
  if (studErr) {
    console.log(`✅ Direct SELECT on students was rejected or returned error: ${studErr.message}`);
  } else if (studData && studData.length > 0) {
    console.error("❌ SECURITY FAILURE: Anonymous user was able to perform a direct SELECT and read student records!");
    allPassed = false;
  } else {
    console.log("✅ Direct SELECT on students returned 0 rows (RLS blocked).");
  }

  // Test direct select on marks
  const { data: marksData, error: marksErr } = await supabaseAnon.from('marks').select('*');
  if (marksErr) {
    console.log(`✅ Direct SELECT on marks was rejected or returned error: ${marksErr.message}`);
  } else if (marksData && marksData.length > 0) {
    console.error("❌ SECURITY FAILURE: Anonymous user was able to perform a direct SELECT and read marks records!");
    allPassed = false;
  } else {
    console.log("✅ Direct SELECT on marks returned 0 rows (RLS blocked).");
  }

  // 4. Verify RPC Functions
  console.log("\n--- 4. Checking RPC functions (get_student_result) ---");
  
  // Valid search
  const { data: validStudent, error: validError } = await supabaseAnon.rpc('get_student_result', {
    roll_num: '700',
    dob_val: '2012-06-01'
  });
  if (validError) {
    console.error("❌ get_student_result for Roll 700 / DOB 2012-06-01 failed:", validError.message);
    allPassed = false;
  } else if (!validStudent) {
    console.error("❌ get_student_result returned null for valid student Roll 700 / DOB 2012-06-01.");
    allPassed = false;
  } else {
    console.log("✅ get_student_result successfully retrieved student:");
    console.log(`   Name: ${validStudent.student.student_name}`);
    console.log(`   Class: ${validStudent.student.class} - ${validStudent.student.section}`);
    console.log(`   Subjects with Marks: ${Object.keys(validStudent.currentWithMarks.subjects).join(', ')}`);
  }

  // Invalid search
  const { data: invalidStudent, error: invalidError } = await supabaseAnon.rpc('get_student_result', {
    roll_num: '99999',
    dob_val: '2000-01-01'
  });
  if (invalidStudent !== null) {
    console.error("❌ SECURITY FAILURE: get_student_result returned data for invalid roll/dob!");
    allPassed = false;
  } else {
    console.log("✅ get_student_result returned null for invalid credentials (Privacy Check passed).");
  }

  // 5. Verify Authentication and Session Management
  console.log("\n--- 5. Testing Teacher Login and Profile Fetch ---");
  const accounts = [
    { email: 'admin@zphs.edu', password: 'Password123', expectedRole: 'admin' },
    { email: 'teacher@zphs.edu', password: 'Password123', expectedRole: 'teacher' }
  ];

  for (const acc of accounts) {
    console.log(`Logging in as ${acc.email}...`);
    try {
      const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
        email: acc.email,
        password: acc.password
      });

      if (authError) {
        console.error(`❌ Login failed for ${acc.email}:`, authError.message);
        allPassed = false;
      } else {
        console.log(`✅ Login successful. JWT token issued.`);
        // Establish authenticated client
        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
        await authClient.auth.setSession(authData.session);

        // Verify that authenticated user can perform CRUD (e.g. read teachers table)
        const { data: teacherProfile, error: profileErr } = await authClient
          .from('teachers')
          .select('*')
          .eq('email', acc.email)
          .single();

        if (profileErr) {
          console.error(`❌ Failed to read teacher profile for ${acc.email} after login:`, profileErr.message);
          allPassed = false;
        } else {
          console.log(`✅ Teacher profile retrieved. Name: ${teacherProfile.name}, Role: ${teacherProfile.role} (Expected: ${acc.expectedRole})`);
          if (teacherProfile.role !== acc.expectedRole) {
            console.error(`❌ Role mismatch: Found ${teacherProfile.role}, expected ${acc.expectedRole}`);
            allPassed = false;
          }
        }
        
        // Log out
        await authClient.auth.signOut();
      }
    } catch (err) {
      console.error(`❌ Exception during login for ${acc.email}:`, err);
      allPassed = false;
    }
  }

  console.log("\n=======================================================");
  if (allPassed) {
    console.log("⭐ ALL PROGRAMMATIC VERIFICATION AUDITS PASSED! ⭐");
    process.exit(0);
  } else {
    console.error("❌ SOME AUDIT CHECKS FAILED. Please review the errors above.");
    process.exit(1);
  }
}

runTests();
