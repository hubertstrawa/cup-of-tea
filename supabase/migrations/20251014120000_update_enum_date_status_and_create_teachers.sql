-- migration: update enum date_status and create teachers table
-- File: supabase/migrations/20251014120000_update_enum_date_status_and_create_teachers.sql

-- Purpose:
-- 1. Update the enum type 'date_status' to add the new value 'other'.
-- 2. Create a new table 'teachers' that extends user information for tutors by storing additional details such as bio, description, lessons_completed and lessons_planned.
--  and enable row level security (RLS) with proper policies.

-- IMPORTANT: Before running this migration in production, ensure that no application tasks rely on the enum order.

-- Step 1: Alter enum date_status to add new value 'other'.
-- Note: This command may fail if the value already exists, so in some setups you might need to check first.
ALTER TYPE public.date_status ADD VALUE 'other';

-- Step 2: Create the teachers table.
-- This table extends the users table for tutor-specific information. The primary key (teacher_id) references users(id).
CREATE TABLE public.teachers (
    teacher_id uuid PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,
    bio text,
    description text,
    lessons_completed integer NOT NULL DEFAULT 0,
    lessons_planned integer NOT NULL DEFAULT 0
);

-- Enable Row Level Security on the teachers table.
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for SELECT for role anon.
CREATE POLICY teachers_select_anon ON public.teachers
    FOR SELECT
    TO anon
    USING (true);

-- Create RLS policy for SELECT for role authenticated.
CREATE POLICY teachers_select_auth ON public.teachers
    FOR SELECT
    TO authenticated
    USING (true);

-- Create RLS policy for INSERT for role authenticated.
CREATE POLICY teachers_insert_auth ON public.teachers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create RLS policy for UPDATE for role authenticated.
CREATE POLICY teachers_update_auth ON public.teachers
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create RLS policy for DELETE for role authenticated.
CREATE POLICY teachers_delete_auth ON public.teachers
    FOR DELETE
    TO authenticated
    USING (true);

-- Note: The teacher_students table is assumed to be managed separately and already exists or will be created in another migration if needed.

