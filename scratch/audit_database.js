import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = 'c:/Users/ADMIN/OneDrive/goal/Desktop/zphs/.env';
const envContent = fs.readFileSync(envPath, 'utf-8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*([^\r\n]+)/);

const url = urlMatch[1].trim().replace(/['"]/g, '');
const key = keyMatch[1].trim().replace(/['"]/g, '');

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function audit() {
  console.log("=== Auditing Database Client-Side ===");
  
  // 1. Authenticate as Admin
  console.log("Logging in as admin@zphs.edu...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@zphs.edu',
    password: 'Password123'
  });

  if (authError) {
    console.error("❌ Admin login failed:", authError.message);
    return;
  }
  console.log("✅ Admin login successful.");
  
  const authClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  await authClient.auth.setSession(authData.session);

  const tables = ['schools', 'teachers', 'students', 'subjects', 'marks', 'audit_logs'];
  
  for (const table of tables) {
    console.log(`\n--- Inspecting Table: ${table} ---`);
    // Get count
    const { count, error: countErr } = await authClient
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (countErr) {
      console.error(`❌ Failed to get count for ${table}:`, countErr.message);
    } else {
      console.log(`Rows: ${count}`);
    }

    // Fetch sample row
    const { data: sample, error: selectErr } = await authClient
      .from(table)
      .select('*')
      .limit(1);
    
    if (selectErr) {
      console.error(`❌ Failed to select from ${table}:`, selectErr.message);
    } else if (sample && sample.length > 0) {
      console.log(`Columns:`, Object.keys(sample[0]));
      console.log(`Sample Data:`, sample[0]);
    } else {
      console.log(`ℹ️ Table ${table} is empty. Cannot inspect columns directly via SELECT.`);
    }
  }

  // Check if we can execute get_portal_stats
  console.log("\n--- Checking get_portal_stats RPC ---");
  const { data: stats, error: statsError } = await authClient.rpc('get_portal_stats');
  if (statsError) {
    console.error("❌ get_portal_stats failed:", statsError.message);
  } else {
    console.log("✅ get_portal_stats returned:", stats);
  }

  // Check if we can execute get_student_result
  console.log("\n--- Checking get_student_result RPC ---");
  const { data: result, error: resultError } = await authClient.rpc('get_student_result', {
    roll_num: '700',
    dob_val: '2012-06-01'
  });
  if (resultError) {
    console.error("❌ get_student_result failed:", resultError.message);
  } else {
    console.log("✅ get_student_result for Roll 700 returned: (Status ok)");
  }
}

audit();
