import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = 'c:/Users/ADMIN/OneDrive/goal/Desktop/zphs/.env';
const envContent = fs.readFileSync(envPath, 'utf-8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*([^\r\n]+)/);

const url = urlMatch[1].trim().replace(/['"]/g, '');
const key = keyMatch[1].trim().replace(/['"]/g, '');

const supabase = createClient(url, key);

async function test() {
  console.log("Testing if schema metadata tables are accessible...");
  
  // Try querying information_schema.columns
  const { data: cols, error: colErr } = await supabase.from('information_schema.columns').select('*').limit(1);
  if (colErr) {
    console.log("❌ information_schema.columns error:", colErr.message);
  } else {
    console.log("✅ information_schema.columns success:", cols);
  }

  // Try querying pg_tables
  const { data: pgTables, error: pgErr } = await supabase.from('pg_tables').select('*').limit(1);
  if (pgErr) {
    console.log("❌ pg_tables error:", pgErr.message);
  } else {
    console.log("✅ pg_tables success:", pgTables);
  }
}

test();
