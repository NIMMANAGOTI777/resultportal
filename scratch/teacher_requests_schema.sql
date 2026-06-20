-- ZPHS Teacher Requests Table & Security Schema
-- Run this in your Supabase SQL Editor to initialize the table, RLS, and triggers.

-- 1. Create Teacher Requests Table
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

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.teacher_requests ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public insert requests" ON public.teacher_requests;
DROP POLICY IF EXISTS "Allow admin manage requests" ON public.teacher_requests;

-- 4. Establish RLS Policies
-- Allow anyone (public anon/authenticated) to submit registration requests
CREATE POLICY "Allow public insert requests" ON public.teacher_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow admins only to read and write (approve/reject) requests
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

-- 5. Trigger for Automated Teacher Account Creation on Admin Approval
CREATE OR REPLACE FUNCTION public.handle_teacher_approval()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID := gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

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
