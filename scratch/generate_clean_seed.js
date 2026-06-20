import fs from 'fs';

const firstNames = [
  'Arjun', 'Sai', 'Karthik', 'Pranathi', 'Sravanthi',
  'Nikhil', 'Pooja', 'Lokesh', 'Vineeth', 'Siri',
  'Anusha', 'Charitha', 'Manikanta', 'Ganesh', 'Venkatesh',
  'Rishwik', 'Varun', 'Tejasri', 'Akshaya', 'Bhavana'
];

const lastNames = [
  'Konda', 'Madasu', 'Bantu', 'Dasari', 'Jujjuri',
  'Kommu', 'Nellutla', 'Allutla', 'Andem', 'Avirendla',
  'Kurella', 'Pandiri', 'Nakirekanti', 'Boddu', 'Bommakanti',
  'Kandlakunti', 'Nellore', 'Bairi', 'Chekka', 'Palla'
];

const subjects = [
  { id: 'sub-telugu', name: 'Telugu' },
  { id: 'sub-hindi', name: 'Hindi' },
  { id: 'sub-english', name: 'English' },
  { id: 'sub-maths', name: 'Mathematics' },
  { id: 'sub-phy-science', name: 'Physical Science' },
  { id: 'sub-bio-science', name: 'Biological Science' },
  { id: 'sub-social', name: 'Social Studies' }
];

const classes = ['8', '9', '10'];
const sections = ['A', 'B'];

let sql = `-- Clean Production Seed File for ZPHS Agamothkur Student Result Portal
-- Run this in your Supabase SQL Editor

-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Schema Migration: Align public.students with new Admission Number schema
-- Drop date_of_birth since student authentication now uses name + admission_number
DO $$
BEGIN
  -- If roll_number exists, rename to admission_number
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'roll_number'
  ) THEN
    ALTER TABLE public.students RENAME COLUMN roll_number TO admission_number;
  END IF;

  -- If date_of_birth exists, drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE public.students DROP COLUMN date_of_birth;
  END IF;

  -- Ensure unique constraint exists on admission_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' AND table_name = 'students' AND constraint_name = 'students_admission_number_key'
  ) THEN
    ALTER TABLE public.students ADD CONSTRAINT students_admission_number_key UNIQUE (admission_number);
  END IF;
END $$;

-- 3. Clean existing records to allow clean re-runs
DELETE FROM auth.users WHERE email IN ('admin@zphs.edu', 'teacher@zphs.edu');
DELETE FROM public.teachers WHERE email IN ('admin@zphs.edu', 'teacher@zphs.edu');
DELETE FROM public.students WHERE id LIKE 'stud-seeded-%';

-- 4. Seed school configuration
INSERT INTO public.schools (id, school_name, school_code, logo_url, address, academic_year, footer_text)
VALUES (
  'school-zphs-1',
  'ZPHS AGAMOTHKUR',
  '28160200501',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
  'Madugulapally Mandal, Nalgonda District, Telangana - 508228',
  '2025-2026',
  'Note: Regular attendance and home study are key to academic success. Keep learning!'
)
ON CONFLICT (id) DO UPDATE SET
  school_name = EXCLUDED.school_name,
  school_code = EXCLUDED.school_code,
  logo_url = EXCLUDED.logo_url,
  address = EXCLUDED.address,
  academic_year = EXCLUDED.academic_year,
  footer_text = EXCLUDED.footer_text;

-- 5. Seed teachers (Admin and standard Teacher accounts)
DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
  teacher_id UUID := gen_random_uuid();
BEGIN
  -- Insert Admin user into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    created_at,
    updated_at
  )
  VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@zphs.edu',
    crypt('Password123', gen_salt('bf', 10)),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    now(),
    now()
  );

  -- Insert Admin profile into public.teachers
  INSERT INTO public.teachers (id, email, name, role)
  VALUES (admin_id, 'admin@zphs.edu', 'M. Srinivasa Rao (Principal)', 'admin');

  -- Insert Teacher user into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    created_at,
    updated_at
  )
  VALUES (
    teacher_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'teacher@zphs.edu',
    crypt('Password123', gen_salt('bf', 10)),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    now(),
    now()
  );

  -- Insert Teacher profile into public.teachers
  INSERT INTO public.teachers (id, email, name, role)
  VALUES (teacher_id, 'teacher@zphs.edu', 'K. Lalitha (Mathematics Teacher)', 'teacher');
END $$;

-- 6. Seed subjects (Telangana board curriculum)
INSERT INTO public.subjects (id, subject_name) VALUES
  ('sub-telugu', 'Telugu'),
  ('sub-hindi', 'Hindi'),
  ('sub-english', 'English'),
  ('sub-maths', 'Mathematics'),
  ('sub-phy-science', 'Physical Science'),
  ('sub-bio-science', 'Biological Science'),
  ('sub-social', 'Social Studies')
ON CONFLICT (id) DO UPDATE SET subject_name = EXCLUDED.subject_name;

-- 7. Seed 20 Students (Admission Numbers 7001 to 7020)
`;

// Build student inserts
for (let i = 0; i < 20; i++) {
  const admissionNumber = (7001 + i).toString();
  const studentName = `${firstNames[i]} ${lastNames[i]}`;
  const fatherName = `${lastNames[i]} Sr.`;
  const classVal = classes[i % classes.length];
  const sectionVal = sections[i % sections.length];
  const studentId = `stud-seeded-${admissionNumber}`;

  sql += `INSERT INTO public.students (id, admission_number, student_name, father_name, class, section, phone, school_id) VALUES ('${studentId}', '${admissionNumber}', '${studentName}', '${fatherName}', '${classVal}', '${sectionVal}', '98765432${i.toString().padStart(2, '0')}', 'school-zphs-1') ON CONFLICT (admission_number) DO UPDATE SET student_name = EXCLUDED.student_name;\n`;
}

sql += `\n-- 8. Seed Marks for all students and subjects\n`;

// Build marks inserts
for (let i = 0; i < 20; i++) {
  const admissionNumber = (7001 + i).toString();
  const studentId = `stud-seeded-${admissionNumber}`;
  
  subjects.forEach((sub, subIdx) => {
    // Generate deterministic marks based on student index and subject index
    const seed = i * 7 + subIdx;
    const fa1 = 14 + (seed % 7); // 14 to 20
    const fa2 = 14 + ((seed + 2) % 7);
    const fa3 = 14 + ((seed + 4) % 7);
    const fa4 = 14 + ((seed + 6) % 7);
    const sa1 = 65 + ((seed * 3) % 31); // 65 to 95
    const sa2 = 65 + ((seed * 5) % 31);

    const markId = `m-seeded-${admissionNumber}-${sub.id}`;
    sql += `INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at) VALUES ('${markId}', '${studentId}', '${sub.id}', ${fa1}, ${fa2}, ${fa3}, ${fa4}, ${sa1}, ${sa2}, now()) ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;\n`;
  });
}

fs.writeFileSync('c:/Users/ADMIN/OneDrive/goal/Desktop/zphs/scratch/db_seed_full.sql', sql);
console.log("Successfully generated db_seed_full.sql!");
