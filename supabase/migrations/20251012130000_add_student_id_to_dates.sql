-- Migration: Add student_id column to dates table

-- This migration adds an optional student_id column to the dates table. When adding a date, you can optionally assign a student to it. Then, when a student reserves a new term, the student_id will be automatically associated with the date.

ALTER TABLE public.dates ADD COLUMN student_id uuid NULL REFERENCES public.users(id);
