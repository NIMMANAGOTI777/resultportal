-- Full Supabase Seeding Script
-- Run this in your Supabase SQL Editor

-- 1. Create pgcrypto extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Ensure default school exists
INSERT INTO public.schools (id, school_name, school_code, logo_url, address, academic_year, footer_text)
VALUES (
  'school-zphs-1',
  'ZPHS AGAMOTHKUR',
  '28160200501',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
  'Madugulapally Mandal, Nalgonda District, Telangana - 508228',
  '2025-2026',
  'Note: Regular attendance and home study are key to academic success. Keep learning!'
) ON CONFLICT (id) DO UPDATE SET school_name = EXCLUDED.school_name;

-- 3. Setup Admin User (admin@zphs.edu / Password123)
DO $$
DECLARE
  admin_user_id UUID;
  teacher_user_id UUID;
BEGIN
  -- Clean up existing data to allow re-runs
  DELETE FROM auth.users WHERE email IN ('admin@zphs.edu', 'teacher@zphs.edu');
  DELETE FROM public.teachers WHERE email IN ('admin@zphs.edu', 'teacher@zphs.edu');

  -- Insert admin@zphs.edu into auth.users
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@zphs.edu',
    crypt('Password123', gen_salt('bf', 10)), -- 10 rounds for GoTrue compatibility
    now(),
    now(), -- confirmed_at is required by GoTrue
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    now(),
    now()
  )
  RETURNING id INTO admin_user_id;

  -- Insert admin@zphs.edu into public.teachers
  INSERT INTO public.teachers (id, email, name, role)
  VALUES (admin_user_id, 'admin@zphs.edu', 'M. Srinivasa Rao (Principal)', 'admin');

  -- Insert teacher@zphs.edu into auth.users
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
    gen_random_uuid(),
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
  )
  RETURNING id INTO teacher_user_id;

  -- Insert teacher@zphs.edu into public.teachers
  INSERT INTO public.teachers (id, email, name, role)
  VALUES (teacher_user_id, 'teacher@zphs.edu', 'K. Lalitha (Mathematics Teacher)', 'teacher');

END $$;

-- 4. Ensure default subjects exist
INSERT INTO public.subjects (id, subject_name) VALUES
  ('sub-telugu', 'Telugu'),
  ('sub-hindi', 'Hindi'),
  ('sub-english', 'English'),
  ('sub-maths', 'Mathematics'),
  ('sub-phy-science', 'Physical Science'),
  ('sub-bio-science', 'Biological Science'),
  ('sub-social', 'Social Studies')
ON CONFLICT (id) DO UPDATE SET subject_name = EXCLUDED.subject_name;

-- 5. Clean existing seeded students and marks to allow clean slate
DELETE FROM public.students WHERE id LIKE 'stud-seeded-%';

-- 6. Seed 20 Students
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-700', '700', 'Arjun Konda', 'Konda Sr.', '2012-06-01', '8', 'A', '9876543200', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-701', '701', 'Sai Madasu', 'Madasu Sr.', '2011-06-01', '9', 'B', '9876543201', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-702', '702', 'Karthik Bantu', 'Bantu Sr.', '2010-06-01', '10', 'A', '9876543202', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-703', '703', 'Pranathi Dasari', 'Dasari Sr.', '2012-06-01', '8', 'B', '9876543203', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-704', '704', 'Sravanthi Jujjuri', 'Jujjuri Sr.', '2011-06-01', '9', 'A', '9876543204', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-705', '705', 'Nikhil Kommu', 'Kommu Sr.', '2010-06-01', '10', 'B', '9876543205', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-706', '706', 'Pooja Nellutla', 'Nellutla Sr.', '2012-06-01', '8', 'A', '9876543206', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-707', '707', 'Lokesh Allutla', 'Allutla Sr.', '2011-06-01', '9', 'B', '9876543207', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-708', '708', 'Vineeth Andem', 'Andem Sr.', '2010-06-01', '10', 'A', '9876543208', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-709', '709', 'Siri Avirendla', 'Avirendla Sr.', '2012-06-01', '8', 'B', '9876543209', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-710', '710', 'Anusha Kurella', 'Kurella Sr.', '2011-06-01', '9', 'A', '9876543210', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-711', '711', 'Charitha Pandiri', 'Pandiri Sr.', '2010-06-01', '10', 'B', '9876543211', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-712', '712', 'Manikanta Nakirekanti', 'Nakirekanti Sr.', '2012-06-01', '8', 'A', '9876543212', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-713', '713', 'Ganesh Boddu', 'Boddu Sr.', '2011-06-01', '9', 'B', '9876543213', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-714', '714', 'Venkatesh Bommakanti', 'Bommakanti Sr.', '2010-06-01', '10', 'A', '9876543214', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-715', '715', 'Rishwik Kandlakunti', 'Kandlakunti Sr.', '2012-06-01', '8', 'B', '9876543215', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-716', '716', 'Varun Nellore', 'Nellore Sr.', '2011-06-01', '9', 'A', '9876543216', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-717', '717', 'Tejasri Bairi', 'Bairi Sr.', '2010-06-01', '10', 'B', '9876543217', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-718', '718', 'Akshaya Chekka', 'Chekka Sr.', '2012-06-01', '8', 'A', '9876543218', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;
INSERT INTO public.students (id, roll_number, student_name, father_name, date_of_birth, class, section, phone, school_id)
VALUES ('stud-seeded-719', '719', 'Bhavana Palla', 'Palla Sr.', '2011-06-01', '9', 'B', '9876543219', 'school-zphs-1')
ON CONFLICT (roll_number) DO UPDATE SET student_name = EXCLUDED.student_name;

-- 7. Seed Marks for all students and subjects
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-700-sub-telugu', 'stud-seeded-700', 'sub-telugu', 19, 15, 16, 18, 81, 85, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-700-sub-hindi', 'stud-seeded-700', 'sub-hindi', 19, 15, 16, 19, 79, 81, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-700-sub-english', 'stud-seeded-700', 'sub-english', 16, 19, 17, 17, 65, 74, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-700-sub-maths', 'stud-seeded-700', 'sub-maths', 16, 20, 17, 15, 77, 72, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-700-sub-phy-science', 'stud-seeded-700', 'sub-phy-science', 15, 20, 20, 20, 73, 65, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-700-sub-bio-science', 'stud-seeded-700', 'sub-bio-science', 19, 15, 15, 18, 74, 84, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-700-sub-social', 'stud-seeded-700', 'sub-social', 16, 15, 18, 16, 70, 75, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-701-sub-telugu', 'stud-seeded-701', 'sub-telugu', 15, 18, 16, 17, 90, 78, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-701-sub-hindi', 'stud-seeded-701', 'sub-hindi', 18, 18, 17, 17, 71, 74, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-701-sub-english', 'stud-seeded-701', 'sub-english', 18, 17, 15, 19, 67, 92, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-701-sub-maths', 'stud-seeded-701', 'sub-maths', 20, 16, 18, 20, 74, 80, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-701-sub-phy-science', 'stud-seeded-701', 'sub-phy-science', 20, 19, 17, 19, 83, 75, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-701-sub-bio-science', 'stud-seeded-701', 'sub-bio-science', 19, 17, 18, 17, 94, 78, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-701-sub-social', 'stud-seeded-701', 'sub-social', 18, 17, 15, 17, 69, 77, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-702-sub-telugu', 'stud-seeded-702', 'sub-telugu', 18, 15, 20, 18, 81, 69, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-702-sub-hindi', 'stud-seeded-702', 'sub-hindi', 17, 17, 17, 19, 65, 83, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-702-sub-english', 'stud-seeded-702', 'sub-english', 19, 15, 18, 16, 94, 84, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-702-sub-maths', 'stud-seeded-702', 'sub-maths', 17, 17, 20, 18, 94, 78, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-702-sub-phy-science', 'stud-seeded-702', 'sub-phy-science', 18, 16, 20, 18, 78, 80, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-702-sub-bio-science', 'stud-seeded-702', 'sub-bio-science', 15, 19, 15, 19, 86, 88, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-702-sub-social', 'stud-seeded-702', 'sub-social', 20, 19, 19, 15, 66, 88, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-703-sub-telugu', 'stud-seeded-703', 'sub-telugu', 16, 20, 17, 20, 73, 87, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-703-sub-hindi', 'stud-seeded-703', 'sub-hindi', 15, 16, 17, 15, 82, 76, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-703-sub-english', 'stud-seeded-703', 'sub-english', 20, 19, 18, 17, 77, 93, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-703-sub-maths', 'stud-seeded-703', 'sub-maths', 18, 17, 16, 18, 79, 90, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-703-sub-phy-science', 'stud-seeded-703', 'sub-phy-science', 20, 19, 18, 20, 66, 70, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-703-sub-bio-science', 'stud-seeded-703', 'sub-bio-science', 16, 20, 16, 19, 75, 90, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-703-sub-social', 'stud-seeded-703', 'sub-social', 19, 19, 15, 15, 88, 65, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-704-sub-telugu', 'stud-seeded-704', 'sub-telugu', 18, 17, 20, 20, 94, 66, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-704-sub-hindi', 'stud-seeded-704', 'sub-hindi', 18, 19, 20, 19, 95, 71, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-704-sub-english', 'stud-seeded-704', 'sub-english', 15, 17, 17, 16, 67, 70, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-704-sub-maths', 'stud-seeded-704', 'sub-maths', 19, 16, 16, 17, 78, 93, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-704-sub-phy-science', 'stud-seeded-704', 'sub-phy-science', 17, 19, 17, 16, 85, 93, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-704-sub-bio-science', 'stud-seeded-704', 'sub-bio-science', 15, 16, 16, 20, 92, 76, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-704-sub-social', 'stud-seeded-704', 'sub-social', 18, 16, 16, 15, 78, 84, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-705-sub-telugu', 'stud-seeded-705', 'sub-telugu', 20, 17, 16, 15, 89, 78, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-705-sub-hindi', 'stud-seeded-705', 'sub-hindi', 18, 17, 19, 19, 95, 84, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-705-sub-english', 'stud-seeded-705', 'sub-english', 19, 16, 19, 17, 90, 65, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-705-sub-maths', 'stud-seeded-705', 'sub-maths', 20, 20, 20, 20, 76, 65, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-705-sub-phy-science', 'stud-seeded-705', 'sub-phy-science', 17, 19, 15, 19, 73, 70, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-705-sub-bio-science', 'stud-seeded-705', 'sub-bio-science', 19, 15, 19, 16, 78, 76, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-705-sub-social', 'stud-seeded-705', 'sub-social', 17, 19, 18, 19, 80, 93, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-706-sub-telugu', 'stud-seeded-706', 'sub-telugu', 19, 18, 16, 20, 82, 72, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-706-sub-hindi', 'stud-seeded-706', 'sub-hindi', 18, 15, 16, 19, 88, 88, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-706-sub-english', 'stud-seeded-706', 'sub-english', 18, 15, 17, 20, 75, 85, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-706-sub-maths', 'stud-seeded-706', 'sub-maths', 19, 15, 16, 16, 83, 81, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-706-sub-phy-science', 'stud-seeded-706', 'sub-phy-science', 16, 15, 18, 17, 81, 67, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-706-sub-bio-science', 'stud-seeded-706', 'sub-bio-science', 19, 16, 15, 20, 87, 91, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-706-sub-social', 'stud-seeded-706', 'sub-social', 18, 15, 15, 19, 70, 71, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-707-sub-telugu', 'stud-seeded-707', 'sub-telugu', 19, 19, 19, 17, 75, 73, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-707-sub-hindi', 'stud-seeded-707', 'sub-hindi', 19, 17, 17, 17, 81, 77, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-707-sub-english', 'stud-seeded-707', 'sub-english', 17, 18, 19, 18, 85, 85, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-707-sub-maths', 'stud-seeded-707', 'sub-maths', 18, 18, 20, 16, 79, 82, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-707-sub-phy-science', 'stud-seeded-707', 'sub-phy-science', 15, 20, 17, 15, 74, 72, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-707-sub-bio-science', 'stud-seeded-707', 'sub-bio-science', 19, 17, 16, 20, 90, 79, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-707-sub-social', 'stud-seeded-707', 'sub-social', 19, 19, 17, 17, 76, 70, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-708-sub-telugu', 'stud-seeded-708', 'sub-telugu', 16, 15, 18, 15, 70, 75, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-708-sub-hindi', 'stud-seeded-708', 'sub-hindi', 16, 18, 20, 17, 79, 79, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-708-sub-english', 'stud-seeded-708', 'sub-english', 17, 20, 18, 15, 88, 93, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-708-sub-maths', 'stud-seeded-708', 'sub-maths', 16, 17, 19, 16, 89, 70, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-708-sub-phy-science', 'stud-seeded-708', 'sub-phy-science', 15, 16, 16, 15, 77, 79, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-708-sub-bio-science', 'stud-seeded-708', 'sub-bio-science', 18, 15, 17, 19, 85, 89, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-708-sub-social', 'stud-seeded-708', 'sub-social', 16, 15, 19, 19, 65, 68, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-709-sub-telugu', 'stud-seeded-709', 'sub-telugu', 16, 16, 16, 20, 71, 95, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-709-sub-hindi', 'stud-seeded-709', 'sub-hindi', 17, 17, 20, 16, 86, 67, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-709-sub-english', 'stud-seeded-709', 'sub-english', 16, 18, 18, 19, 89, 65, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-709-sub-maths', 'stud-seeded-709', 'sub-maths', 18, 19, 19, 20, 93, 65, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-709-sub-phy-science', 'stud-seeded-709', 'sub-phy-science', 15, 20, 17, 18, 86, 86, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-709-sub-bio-science', 'stud-seeded-709', 'sub-bio-science', 16, 17, 16, 16, 70, 93, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-709-sub-social', 'stud-seeded-709', 'sub-social', 18, 17, 15, 18, 89, 89, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-710-sub-telugu', 'stud-seeded-710', 'sub-telugu', 15, 17, 15, 16, 70, 76, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-710-sub-hindi', 'stud-seeded-710', 'sub-hindi', 17, 20, 15, 20, 93, 72, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-710-sub-english', 'stud-seeded-710', 'sub-english', 17, 17, 19, 17, 86, 68, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-710-sub-maths', 'stud-seeded-710', 'sub-maths', 16, 19, 17, 15, 72, 91, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-710-sub-phy-science', 'stud-seeded-710', 'sub-phy-science', 17, 20, 19, 15, 79, 77, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-710-sub-bio-science', 'stud-seeded-710', 'sub-bio-science', 16, 15, 20, 18, 78, 72, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-710-sub-social', 'stud-seeded-710', 'sub-social', 18, 19, 15, 19, 84, 88, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-711-sub-telugu', 'stud-seeded-711', 'sub-telugu', 15, 15, 19, 19, 94, 73, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-711-sub-hindi', 'stud-seeded-711', 'sub-hindi', 16, 17, 20, 19, 84, 87, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-711-sub-english', 'stud-seeded-711', 'sub-english', 19, 19, 16, 20, 91, 92, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-711-sub-maths', 'stud-seeded-711', 'sub-maths', 16, 16, 20, 18, 86, 86, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-711-sub-phy-science', 'stud-seeded-711', 'sub-phy-science', 19, 15, 19, 19, 92, 76, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-711-sub-bio-science', 'stud-seeded-711', 'sub-bio-science', 20, 16, 19, 15, 84, 76, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-711-sub-social', 'stud-seeded-711', 'sub-social', 15, 20, 15, 15, 84, 71, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-712-sub-telugu', 'stud-seeded-712', 'sub-telugu', 15, 20, 17, 20, 95, 86, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-712-sub-hindi', 'stud-seeded-712', 'sub-hindi', 19, 18, 18, 20, 81, 87, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-712-sub-english', 'stud-seeded-712', 'sub-english', 20, 19, 15, 18, 80, 88, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-712-sub-maths', 'stud-seeded-712', 'sub-maths', 18, 16, 15, 16, 70, 70, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-712-sub-phy-science', 'stud-seeded-712', 'sub-phy-science', 16, 20, 16, 15, 79, 66, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-712-sub-bio-science', 'stud-seeded-712', 'sub-bio-science', 20, 15, 19, 17, 95, 68, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-712-sub-social', 'stud-seeded-712', 'sub-social', 19, 15, 17, 19, 78, 75, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-713-sub-telugu', 'stud-seeded-713', 'sub-telugu', 17, 19, 20, 20, 76, 95, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-713-sub-hindi', 'stud-seeded-713', 'sub-hindi', 17, 15, 16, 18, 76, 68, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-713-sub-english', 'stud-seeded-713', 'sub-english', 15, 17, 15, 20, 75, 80, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-713-sub-maths', 'stud-seeded-713', 'sub-maths', 15, 19, 20, 20, 70, 92, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-713-sub-phy-science', 'stud-seeded-713', 'sub-phy-science', 19, 15, 18, 15, 84, 77, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-713-sub-bio-science', 'stud-seeded-713', 'sub-bio-science', 15, 20, 17, 17, 73, 82, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-713-sub-social', 'stud-seeded-713', 'sub-social', 19, 18, 15, 18, 69, 86, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-714-sub-telugu', 'stud-seeded-714', 'sub-telugu', 16, 20, 15, 17, 91, 70, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-714-sub-hindi', 'stud-seeded-714', 'sub-hindi', 16, 15, 15, 17, 77, 80, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-714-sub-english', 'stud-seeded-714', 'sub-english', 17, 19, 16, 19, 75, 83, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-714-sub-maths', 'stud-seeded-714', 'sub-maths', 16, 20, 15, 18, 73, 85, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-714-sub-phy-science', 'stud-seeded-714', 'sub-phy-science', 16, 20, 18, 19, 66, 88, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-714-sub-bio-science', 'stud-seeded-714', 'sub-bio-science', 17, 19, 20, 19, 73, 68, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-714-sub-social', 'stud-seeded-714', 'sub-social', 19, 17, 19, 19, 85, 72, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-715-sub-telugu', 'stud-seeded-715', 'sub-telugu', 19, 20, 20, 18, 65, 68, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-715-sub-hindi', 'stud-seeded-715', 'sub-hindi', 20, 19, 15, 20, 85, 87, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-715-sub-english', 'stud-seeded-715', 'sub-english', 20, 20, 15, 17, 79, 88, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-715-sub-maths', 'stud-seeded-715', 'sub-maths', 17, 18, 15, 16, 67, 69, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-715-sub-phy-science', 'stud-seeded-715', 'sub-phy-science', 18, 16, 18, 15, 85, 95, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-715-sub-bio-science', 'stud-seeded-715', 'sub-bio-science', 19, 16, 17, 20, 67, 69, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-715-sub-social', 'stud-seeded-715', 'sub-social', 20, 19, 18, 19, 76, 66, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-716-sub-telugu', 'stud-seeded-716', 'sub-telugu', 20, 20, 16, 17, 69, 88, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-716-sub-hindi', 'stud-seeded-716', 'sub-hindi', 19, 19, 16, 19, 79, 75, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-716-sub-english', 'stud-seeded-716', 'sub-english', 20, 19, 16, 17, 87, 90, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-716-sub-maths', 'stud-seeded-716', 'sub-maths', 16, 20, 15, 18, 77, 74, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-716-sub-phy-science', 'stud-seeded-716', 'sub-phy-science', 20, 15, 16, 17, 68, 73, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-716-sub-bio-science', 'stud-seeded-716', 'sub-bio-science', 15, 19, 16, 18, 75, 94, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-716-sub-social', 'stud-seeded-716', 'sub-social', 15, 16, 19, 18, 68, 90, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-717-sub-telugu', 'stud-seeded-717', 'sub-telugu', 20, 15, 16, 18, 86, 71, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-717-sub-hindi', 'stud-seeded-717', 'sub-hindi', 16, 15, 18, 19, 79, 84, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-717-sub-english', 'stud-seeded-717', 'sub-english', 20, 17, 16, 18, 86, 80, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-717-sub-maths', 'stud-seeded-717', 'sub-maths', 18, 16, 15, 15, 91, 89, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-717-sub-phy-science', 'stud-seeded-717', 'sub-phy-science', 16, 20, 18, 18, 71, 74, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-717-sub-bio-science', 'stud-seeded-717', 'sub-bio-science', 15, 15, 15, 16, 88, 74, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-717-sub-social', 'stud-seeded-717', 'sub-social', 15, 18, 20, 15, 84, 66, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-718-sub-telugu', 'stud-seeded-718', 'sub-telugu', 19, 15, 18, 15, 95, 75, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-718-sub-hindi', 'stud-seeded-718', 'sub-hindi', 15, 18, 15, 19, 70, 80, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-718-sub-english', 'stud-seeded-718', 'sub-english', 15, 19, 20, 17, 72, 72, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-718-sub-maths', 'stud-seeded-718', 'sub-maths', 16, 20, 17, 15, 82, 73, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-718-sub-phy-science', 'stud-seeded-718', 'sub-phy-science', 18, 16, 20, 20, 70, 88, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-718-sub-bio-science', 'stud-seeded-718', 'sub-bio-science', 18, 20, 15, 16, 75, 77, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-718-sub-social', 'stud-seeded-718', 'sub-social', 19, 18, 18, 20, 80, 95, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-719-sub-telugu', 'stud-seeded-719', 'sub-telugu', 20, 15, 17, 15, 67, 73, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-719-sub-hindi', 'stud-seeded-719', 'sub-hindi', 19, 19, 19, 20, 66, 72, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-719-sub-english', 'stud-seeded-719', 'sub-english', 19, 18, 18, 16, 73, 68, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-719-sub-maths', 'stud-seeded-719', 'sub-maths', 17, 18, 15, 15, 86, 79, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-719-sub-phy-science', 'stud-seeded-719', 'sub-phy-science', 17, 15, 20, 17, 90, 77, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-719-sub-bio-science', 'stud-seeded-719', 'sub-bio-science', 18, 15, 16, 19, 83, 79, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
INSERT INTO public.marks (id, student_id, subject_id, fa1, fa2, fa3, fa4, sa1, sa2, updated_at)
VALUES ('m-seeded-719-sub-social', 'stud-seeded-719', 'sub-social', 17, 15, 19, 17, 81, 73, now())
ON CONFLICT (student_id, subject_id) DO UPDATE SET fa1 = EXCLUDED.fa1, fa2 = EXCLUDED.fa2, fa3 = EXCLUDED.fa3, fa4 = EXCLUDED.fa4, sa1 = EXCLUDED.sa1, sa2 = EXCLUDED.sa2;
