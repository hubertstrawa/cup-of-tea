-- Migration: Add teacher_id column to users table
-- Purpose: Add teacher_id column to users table to support student-teacher relationships
-- This allows students to be linked to their teachers during registration

-- Add teacher_id column to users table (nullable, for students only)
ALTER TABLE public.users ADD COLUMN teacher_id uuid NULL;

-- Add foreign key constraint
ALTER TABLE public.users ADD CONSTRAINT fk_teacher_teacher_id 
    FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_teacher_id ON public.users(teacher_id);

-- Add comment to document the column
COMMENT ON COLUMN public.users.teacher_id IS 'For students: references the teacher (tutor) who invited them. NULL for tutors.';
