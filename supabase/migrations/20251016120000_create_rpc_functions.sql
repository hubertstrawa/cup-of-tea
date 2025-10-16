-- migration: create RPC functions for booking system
-- File: supabase/migrations/20251016120000_create_rpc_functions.sql

-- Purpose:
-- Create RPC functions to handle booking-related operations like incrementing lesson counts

-- Function to increment lessons_reserved count for a teacher-student pair
CREATE OR REPLACE FUNCTION public.increment_lessons_reserved(
    p_teacher_id uuid,
    p_student_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the lessons_reserved count, or insert if the relationship doesn't exist
    INSERT INTO public.teacher_students (teacher_id, student_id, lessons_completed, lessons_reserved)
    VALUES (p_teacher_id, p_student_id, 0, 1)
    ON CONFLICT (teacher_id, student_id)
    DO UPDATE SET lessons_reserved = teacher_students.lessons_reserved + 1;
END;
$$;

-- Function to increment lessons_completed count for a teacher-student pair
CREATE OR REPLACE FUNCTION public.increment_lessons_completed(
    p_teacher_id uuid,
    p_student_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the lessons_completed count
    UPDATE public.teacher_students
    SET lessons_completed = lessons_completed + 1
    WHERE teacher_id = p_teacher_id AND student_id = p_student_id;
    
    -- If no row was updated, insert a new one
    IF NOT FOUND THEN
        INSERT INTO public.teacher_students (teacher_id, student_id, lessons_completed, lessons_reserved)
        VALUES (p_teacher_id, p_student_id, 1, 0);
    END IF;
END;
$$;

-- Function to get teacher statistics
CREATE OR REPLACE FUNCTION public.get_teacher_stats(p_teacher_id uuid)
RETURNS TABLE (
    total_students bigint,
    total_lessons_completed bigint,
    total_lessons_reserved bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT student_id) as total_students,
        COALESCE(SUM(lessons_completed), 0) as total_lessons_completed,
        COALESCE(SUM(lessons_reserved), 0) as total_lessons_reserved
    FROM public.teacher_students
    WHERE teacher_id = p_teacher_id;
END;
$$;
