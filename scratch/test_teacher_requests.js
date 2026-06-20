import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('c:/Users/ADMIN/OneDrive/goal/Desktop/zphs/.env', 'utf-8');
const url = envContent.match(/VITE_SUPABASE_URL\s*=\s*([^\r\n]+)/)[1].trim().replace(/['"]/g, '');
const key = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*([^\r\n]+)/)[1].trim().replace(/['"]/g, '');

const supabase = createClient(url, key);

async function testTeacherRequests() {
  console.log("Checking if teacher_requests table exists and querying data...");
  const { data, error } = await supabase.from('teacher_requests').select('*').limit(1);
  if (error) {
    console.error("Error from teacher_requests:", error.message);
  } else {
    console.log("Success! Data from teacher_requests:", data);
  }
}

testTeacherRequests();
