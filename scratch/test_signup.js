import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('c:/Users/ADMIN/OneDrive/goal/Desktop/zphs/.env', 'utf-8');
const url = envContent.match(/VITE_SUPABASE_URL\s*=\s*([^\r\n]+)/)[1].trim().replace(/['"]/g, '');
const key = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*([^\r\n]+)/)[1].trim().replace(/['"]/g, '');

const supabase = createClient(url, key);

async function testSignup() {
  const email = `zphs.test.teacher.${Math.floor(Math.random() * 10000)}@gmail.com`;
  const password = 'Password123';
  console.log(`Attempting signup for ${email}...`);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error("Signup error:", error.message);
  } else {
    console.log("Signup success:", data.user ? "User created" : "No user returned");
    console.log("Session details:", data.session ? "Session established" : "No session (Email confirmation may be required)");
  }
}

testSignup();
