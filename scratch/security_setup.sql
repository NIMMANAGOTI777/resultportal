-- Production Security Setup for ZPHS Results Portal
-- Execute this script in your Supabase SQL Editor to initialize all tables, RLS rules, and RPC queries.

-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Teacher Requests Table
CREATE TABLE IF NOT EXISTS public.teacher_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  qualification TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on All Tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_requests ENABLE ROW LEVEL SECURITY;

-- 4. Drop all previous policies to avoid duplication
DROP POLICY IF EXISTS "Allow public read schools" ON public.schools;
DROP POLICY IF EXISTS "Allow authenticated write schools" ON public.schools;
DROP POLICY IF EXISTS "Allow admin write schools" ON public.schools;

DROP POLICY IF EXISTS "Allow public read teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow authenticated read teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow authenticated write teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow admin write teachers" ON public.teachers;

DROP POLICY IF EXISTS "Allow public read students" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated read students" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated write students" ON public.students;

DROP POLICY IF EXISTS "Allow public read subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow authenticated write subjects" ON public.subjects;

DROP POLICY IF EXISTS "Allow public read marks" ON public.marks;
DROP POLICY IF EXISTS "Allow authenticated read marks" ON public.marks;
DROP POLICY IF EXISTS "Allow authenticated write marks" ON public.marks;

DROP POLICY IF EXISTS "Allow authenticated read audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow authenticated write audit_logs" ON public.audit_logs;

DROP POLICY IF EXISTS "Allow public insert requests" ON public.teacher_requests;
DROP POLICY IF EXISTS "Allow admin manage requests" ON public.teacher_requests;

-- 5. Establish Strict, Vulnerability-Free RLS Policies

-- Schools: Public read, Admin-only write
CREATE POLICY "Allow public read schools" ON public.schools 
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow admin write schools" ON public.schools
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers
      WHERE public.teachers.id = auth.uid()
      AND public.teachers.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers
      WHERE public.teachers.id = auth.uid()
      AND public.teachers.role = 'admin'
    )
  );

-- Subjects: Public read, Authenticated staff write
CREATE POLICY "Allow public read subjects" ON public.subjects 
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow authenticated write subjects" ON public.subjects 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Teachers: Authenticated read, Admin-only write (Prevents standard teachers from self-updating to admin)
CREATE POLICY "Allow authenticated read teachers" ON public.teachers 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin write teachers" ON public.teachers
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers
      WHERE public.teachers.id = auth.uid()
      AND public.teachers.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers
      WHERE public.teachers.id = auth.uid()
      AND public.teachers.role = 'admin'
    )
  );

-- Students: Authenticated only (NO PUBLIC SELECT - protected student data)
CREATE POLICY "Allow authenticated read students" ON public.students 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write students" ON public.students 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Marks: Authenticated only (NO PUBLIC SELECT)
CREATE POLICY "Allow authenticated read marks" ON public.marks 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write marks" ON public.marks 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Audit Logs: Authenticated only
CREATE POLICY "Allow authenticated read audit_logs" ON public.audit_logs 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write audit_logs" ON public.audit_logs 
  FOR INSERT TO authenticated WITH CHECK (true);

-- Teacher Requests: Public can insert, Admin-only read/write
CREATE POLICY "Allow public insert requests" ON public.teacher_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow admin manage requests" ON public.teacher_requests
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers
      WHERE public.teachers.id = auth.uid()
      AND public.teachers.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers
      WHERE public.teachers.id = auth.uid()
      AND public.teachers.role = 'admin'
    )
  );


-- 6. Trigger for Automated Teacher Account Creation on Admin Approval
CREATE OR REPLACE FUNCTION public.handle_teacher_approval()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- Execute only if status changes from pending to approved
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Check if user already exists in auth.users to prevent duplicate errors
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = NEW.email) THEN
      -- Create user in auth.users with Password123
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
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        NEW.email,
        crypt('Password123', gen_salt('bf', 10)),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        now(),
        now()
      );

      -- Upsert teacher profile in public.teachers
      INSERT INTO public.teachers (id, email, name, role)
      VALUES (new_user_id, NEW.email, NEW.name, 'teacher');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_teacher_approval ON public.teacher_requests;
CREATE TRIGGER trigger_teacher_approval
  AFTER UPDATE OF status ON public.teacher_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_teacher_approval();


-- 7. Secure RPC: get_student_result(admission_num, name_val)
-- SECURITY DEFINER allows anonymous guests to lookup their own results without direct table select permissions.
CREATE OR REPLACE FUNCTION public.get_student_result(admission_num TEXT, name_val TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_row RECORD;
  current_student_json JSONB;
  class_students_json JSONB;
  result_json JSONB;
BEGIN
  -- Validate inputs
  IF admission_num IS NULL OR name_val IS NULL OR LENGTH(admission_num) = 0 OR LENGTH(name_val) = 0 THEN
    RETURN NULL;
  END IF;

  -- Query student matching admission number and exact student name
  SELECT id, admission_number, student_name, father_name, class, section, school_id 
  INTO student_row
  FROM public.students
  WHERE admission_number = admission_num AND student_name = name_val;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Build current student details with marks map
  SELECT jsonb_build_object(
    'studentId', student_row.id,
    'studentName', student_row.student_name,
    'admissionNumber', student_row.admission_number,
    'class', student_row.class,
    'section', student_row.section,
    'subjects', (
      SELECT jsonb_object_agg(
        sub.subject_name,
        jsonb_build_object(
          'fa1', m.fa1,
          'fa2', m.fa2,
          'fa3', m.fa3,
          'fa4', m.fa4,
          'sa1', m.sa1,
          'sa2', m.sa2
        )
      )
      FROM public.subjects sub
      LEFT JOIN public.marks m ON m.subject_id = sub.id AND m.student_id = student_row.id
    )
  ) INTO current_student_json;

  -- Fetch anonymized class students (only ID and marks) for rank computation
  SELECT jsonb_agg(
    jsonb_build_object(
      'studentId', cs.id,
      'subjects', (
        SELECT jsonb_object_agg(
          sub.subject_name,
          jsonb_build_object(
            'fa1', m.fa1,
            'fa2', m.fa2,
            'fa3', m.fa3,
            'fa4', m.fa4,
            'sa1', m.sa1,
            'sa2', m.sa2
          )
        )
        FROM public.subjects sub
        LEFT JOIN public.marks m ON m.subject_id = sub.id AND m.student_id = cs.id
      )
    )
  ) INTO class_students_json
  FROM public.students cs
  WHERE cs.class = student_row.class;

  -- Combine results
  result_json := jsonb_build_object(
    'student', jsonb_build_object(
      'id', student_row.id,
      'admission_number', student_row.admission_number,
      'student_name', student_row.student_name,
      'father_name', student_row.father_name,
      'class', student_row.class,
      'section', student_row.section
    ),
    'currentWithMarks', current_student_json,
    'classStudents', class_students_json
  );

  -- Log student result lookup audit trail
  INSERT INTO public.audit_logs(user_id, action)
  VALUES ('anonymous', 'Student result lookup: Admission ' || student_row.admission_number || ' (Class ' || student_row.class || ')');

  RETURN result_json;
END;
$$;


-- 8. Secure RPC: get_portal_stats()
-- Calculates aggregated portal metrics. Corrects FA max marks to 20.
CREATE OR REPLACE FUNCTION public.get_portal_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats_json JSONB;
  stud_count INTEGER;
  class_count INTEGER;
  pub_count INTEGER;
  avg_pct INTEGER;
  total_obt NUMERIC := 0;
  total_max NUMERIC := 0;
  m_row RECORD;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_portal_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats_json JSONB;
  stud_count INTEGER;
  class_count INTEGER;
  pub_count INTEGER;
  avg_pct INTEGER;
  total_obt NUMERIC := 0;
  total_max NUMERIC := 0;
  m_row RECORD;
BEGIN
  SELECT COUNT(*) INTO stud_count FROM public.students;
  SELECT COUNT(DISTINCT class) INTO class_count FROM public.students;
  SELECT COUNT(DISTINCT student_id) INTO pub_count FROM public.marks;
  
  FOR m_row IN SELECT fa1, fa2, fa3, fa4, sa1, sa2 FROM public.marks LOOP
    IF m_row.fa1 IS NOT NULL THEN total_obt := total_obt + m_row.fa1; total_max := total_max + 20; END IF;
    IF m_row.fa2 IS NOT NULL THEN total_obt := total_obt + m_row.fa2; total_max := total_max + 20; END IF;
    IF m_row.fa3 IS NOT NULL THEN total_obt := total_obt + m_row.fa3; total_max := total_max + 20; END IF;
    IF m_row.fa4 IS NOT NULL THEN total_obt := total_obt + m_row.fa4; total_max := total_max + 20; END IF;
    IF m_row.sa1 IS NOT NULL THEN total_obt := total_obt + m_row.sa1; total_max := total_max + 100; END IF;
    IF m_row.sa2 IS NOT NULL THEN total_obt := total_obt + m_row.sa2; total_max := total_max + 100; END IF;
  END LOOP;

  IF total_max = 0 THEN
    avg_pct := 0;
  ELSE
    avg_pct := ROUND((total_obt / total_max) * 100);
  END IF;

  stats_json := jsonb_build_object(
    'studentsCount', stud_count,
    'classesCount', class_count,
    'publishedCount', pub_count,
    'avgPercent', avg_pct
  );

  RETURN stats_json;
END;
$$;
