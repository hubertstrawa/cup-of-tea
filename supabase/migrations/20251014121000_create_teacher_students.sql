-- migration: create teacher_students table
-- file: supabase/migrations/20251014121000_create_teacher_students.sql

-- Purpose:
-- 1. Create a teacher_students table to store a many-to-many relationship between teachers and students.
-- 2. Store additional details for each teacher-student pair such as lessons_completed and lessons_reserved, which can be edited by the teacher via the dashboard.

CREATE TABLE public.teacher_students (
    teacher_id uuid NOT NULL,
    student_id uuid NOT NULL,
    lessons_completed integer NOT NULL DEFAULT 0,
    lessons_reserved integer NOT NULL DEFAULT 0,
    CONSTRAINT pk_teacher_students PRIMARY KEY (teacher_id, student_id),
    CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security on the table
ALTER TABLE public.teacher_students ENABLE ROW LEVEL SECURITY;

-- RLS policy for SELECT for role anon
CREATE POLICY teacher_students_select_anon ON public.teacher_students
    FOR SELECT
    TO anon
    USING (true);

-- RLS policy for SELECT for role authenticated
CREATE POLICY teacher_students_select_auth ON public.teacher_students
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS policy for INSERT for role authenticated
CREATE POLICY teacher_students_insert_auth ON public.teacher_students
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS policy for UPDATE for role authenticated
CREATE POLICY teacher_students_update_auth ON public.teacher_students
    FOR UPDATE
    TO authenticated
    USING (true);

-- RLS policy for DELETE for role authenticated
CREATE POLICY teacher_students_delete_auth ON public.teacher_students
    FOR DELETE
    TO authenticated
    USING (true);

