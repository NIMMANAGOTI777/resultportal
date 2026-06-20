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
  console.error("Could not parse Supabase URL or Anon key.");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim().replace(/['"]/g, '');
const supabaseAnonKey = keyMatch[1].trim().replace(/['"]/g, '');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("=== Checking Supabase Marks Table Columns & Counts ===");

  // 1. Fetch 1 row from marks to inspect columns
  const { data: marksSample, error: sampleError } = await supabase
    .from('marks')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.error("❌ Failed to query 'marks' table:", sampleError.message);
  } else if (marksSample && marksSample.length > 0) {
    console.log("✅ Query succeeded. Columns found in marks table:", Object.keys(marksSample[0]));
  } else {
    console.log("ℹ️ marks table is currently empty, fetching table definition from REST API if possible...");
    // Let's do a select of columns or just inspect empty data columns
    // We can query a non-existent row to see if it still returns keys (it doesn't in postgrest when empty)
  }

  // 2. Fetch count of marks
  const { count, error: countError } = await supabase
    .from('marks')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error("❌ Failed to query marks count:", countError.message);
  } else {
    console.log(`✅ Current rows in public.marks: ${count}`);
  }
}

run();
