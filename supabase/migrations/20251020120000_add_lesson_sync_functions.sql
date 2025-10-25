-- Migration: Add RPC functions for lesson status synchronization
-- Purpose: Create functions to synchronize teacher_students table when lesson statuses change
-- File: supabase/migrations/20251020120000_add_lesson_sync_functions.sql

-- Function to synchronize teacher_students table when lesson status changes
CREATE OR REPLACE FUNCTION public.sync_teacher_students_on_lesson_status_change(
    p_teacher_id uuid,
    p_student_id uuid,
    p_old_status text,
    p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Ensure the teacher_students relationship exists
    INSERT INTO public.teacher_students (teacher_id, student_id, lessons_completed, lessons_reserved)
    VALUES (p_teacher_id, p_student_id, 0, 0)
    ON CONFLICT (teacher_id, student_id) DO NOTHING;
    
    -- Handle status transitions
    IF p_old_status IS DISTINCT FROM p_new_status THEN
        -- New lesson (p_old_status is null)
        IF p_old_status IS NULL THEN
            IF p_new_status = 'planned' THEN
                UPDATE public.teacher_students
                SET lessons_reserved = lessons_reserved + 1
                WHERE teacher_id = p_teacher_id AND student_id = p_student_id;
            ELSIF p_new_status = 'completed' THEN
                UPDATE public.teacher_students
                SET lessons_completed = lessons_completed + 1
                WHERE teacher_id = p_teacher_id AND student_id = p_student_id;
            END IF;
            
        -- From any status to completed
        ELSIF p_new_status = 'completed' AND p_old_status != 'completed' THEN
            UPDATE public.teacher_students
            SET 
                lessons_completed = lessons_completed + 1,
                lessons_reserved = GREATEST(0, lessons_reserved - 1)
            WHERE teacher_id = p_teacher_id AND student_id = p_student_id;
            
        -- From completed to any other status
        ELSIF p_old_status = 'completed' AND p_new_status != 'completed' THEN
            UPDATE public.teacher_students
            SET 
                lessons_completed = GREATEST(0, lessons_completed - 1),
                lessons_reserved = CASE 
                    WHEN p_new_status != 'canceled' THEN lessons_reserved + 1
                    ELSE lessons_reserved
                END
            WHERE teacher_id = p_teacher_id AND student_id = p_student_id;
            
        -- From planned to canceled (not through completed)
        ELSIF p_old_status = 'planned' AND p_new_status = 'canceled' THEN
            UPDATE public.teacher_students
            SET lessons_reserved = GREATEST(0, lessons_reserved - 1)
            WHERE teacher_id = p_teacher_id AND student_id = p_student_id;
            
        -- From canceled to planned (reactivating lesson)
        ELSIF p_old_status = 'canceled' AND p_new_status = 'planned' THEN
            UPDATE public.teacher_students
            SET lessons_reserved = lessons_reserved + 1
            WHERE teacher_id = p_teacher_id AND student_id = p_student_id;
            
        -- Lesson is being deleted (p_new_status is NULL)
        ELSIF p_new_status IS NULL THEN
            IF p_old_status = 'completed' THEN
                UPDATE public.teacher_students
                SET lessons_completed = GREATEST(0, lessons_completed - 1)
                WHERE teacher_id = p_teacher_id AND student_id = p_student_id;
            ELSIF p_old_status = 'planned' THEN
                UPDATE public.teacher_students
                SET lessons_reserved = GREATEST(0, lessons_reserved - 1)
                WHERE teacher_id = p_teacher_id AND student_id = p_student_id;
            END IF;
        END IF;
    END IF;
END;
$$;

-- Function to recalculate teacher_students statistics from lessons table
-- Useful for data consistency checks and repairs
CREATE OR REPLACE FUNCTION public.recalculate_teacher_students_stats(
    p_teacher_id uuid,
    p_student_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    lesson_stats RECORD;
BEGIN
    -- If specific student provided, recalculate for that pair only
    IF p_student_id IS NOT NULL THEN
        SELECT 
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
            COUNT(CASE WHEN status IN ('planned') THEN 1 END) as reserved_count
        INTO lesson_stats
        FROM public.lessons
        WHERE teacher_id = p_teacher_id AND student_id = p_student_id;
        
        -- Update or insert the teacher_students record
        INSERT INTO public.teacher_students (teacher_id, student_id, lessons_completed, lessons_reserved)
        VALUES (p_teacher_id, p_student_id, lesson_stats.completed_count, lesson_stats.reserved_count)
        ON CONFLICT (teacher_id, student_id)
        DO UPDATE SET
            lessons_completed = lesson_stats.completed_count,
            lessons_reserved = lesson_stats.reserved_count;
    ELSE
        -- Recalculate for all students of this teacher
        FOR lesson_stats IN
            SELECT 
                student_id,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN status IN ('planned') THEN 1 END) as reserved_count
            FROM public.lessons
            WHERE teacher_id = p_teacher_id
            GROUP BY student_id
        LOOP
            INSERT INTO public.teacher_students (teacher_id, student_id, lessons_completed, lessons_reserved)
            VALUES (p_teacher_id, lesson_stats.student_id, lesson_stats.completed_count, lesson_stats.reserved_count)
            ON CONFLICT (teacher_id, student_id)
            DO UPDATE SET
                lessons_completed = lesson_stats.completed_count,
                lessons_reserved = lesson_stats.reserved_count;
        END LOOP;
    END IF;
END;
$$;

-- Function to handle lesson deletion synchronization
CREATE OR REPLACE FUNCTION public.sync_teacher_students_on_lesson_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Synchronize teacher_students when a lesson is deleted
    PERFORM public.sync_teacher_students_on_lesson_status_change(
        OLD.teacher_id,
        OLD.student_id,
        OLD.status,
        NULL -- Lesson is being deleted
    );
    
    RETURN OLD;
END;
$$;

-- Create trigger to automatically sync when lessons are deleted
CREATE TRIGGER trigger_sync_teacher_students_on_lesson_delete
    BEFORE DELETE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_teacher_students_on_lesson_delete();

-- Add comments for documentation
COMMENT ON FUNCTION public.sync_teacher_students_on_lesson_status_change IS 'Synchronizes teacher_students table when lesson status changes';
COMMENT ON FUNCTION public.recalculate_teacher_students_stats IS 'Recalculates teacher_students statistics from lessons table for data consistency';
COMMENT ON FUNCTION public.sync_teacher_students_on_lesson_delete IS 'Trigger function to sync teacher_students when lessons are deleted';
COMMENT ON TRIGGER trigger_sync_teacher_students_on_lesson_delete ON public.lessons IS 'Automatically syncs teacher_students when lessons are deleted';
