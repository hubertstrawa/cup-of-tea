-- Migration: Update all enum types from Polish to English
-- Purpose: Change enum values to English for better internationalization
-- Affected enums: date_status, lesson_status, reservation_status, user_role

-- Step 1: Create new enum types with English values
CREATE TYPE date_status_new AS ENUM ('available', 'booked', 'canceled', 'other');
CREATE TYPE lesson_status_new AS ENUM ('planned', 'completed', 'canceled');
CREATE TYPE reservation_status_new AS ENUM ('confirmed', 'canceled', 'completed');
CREATE TYPE user_role_new AS ENUM ('tutor', 'student');

-- Step 2: Update tables to use new enum types with data migration

-- Update dates table
ALTER TABLE public.dates 
ADD COLUMN status_new date_status_new;

UPDATE public.dates SET status_new = 
  CASE status::text
    WHEN 'dostępny' THEN 'available'::date_status_new
    WHEN 'zarezerwowany' THEN 'booked'::date_status_new
    WHEN 'anulowany' THEN 'canceled'::date_status_new
    WHEN 'other' THEN 'other'::date_status_new
    ELSE 'available'::date_status_new
  END;

ALTER TABLE public.dates DROP COLUMN status;
ALTER TABLE public.dates RENAME COLUMN status_new TO status;
ALTER TABLE public.dates ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.dates ALTER COLUMN status SET DEFAULT 'available';

-- Update lessons table
ALTER TABLE public.lessons 
ADD COLUMN status_new lesson_status_new;

UPDATE public.lessons SET status_new = 
  CASE status::text
    WHEN 'zaplanowana' THEN 'planned'::lesson_status_new
    WHEN 'zakończona' THEN 'completed'::lesson_status_new
    WHEN 'anulowana' THEN 'canceled'::lesson_status_new
    ELSE 'planned'::lesson_status_new
  END;

ALTER TABLE public.lessons DROP COLUMN status;
ALTER TABLE public.lessons RENAME COLUMN status_new TO status;
ALTER TABLE public.lessons ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.lessons ALTER COLUMN status SET DEFAULT 'planned';

-- Update reservations table
ALTER TABLE public.reservations 
ADD COLUMN status_new reservation_status_new;

UPDATE public.reservations SET status_new = 
  CASE status::text
    WHEN 'potwierdzona' THEN 'confirmed'::reservation_status_new
    WHEN 'anulowana' THEN 'canceled'::reservation_status_new
    ELSE 'confirmed'::reservation_status_new
  END;

ALTER TABLE public.reservations DROP COLUMN status;
ALTER TABLE public.reservations RENAME COLUMN status_new TO status;
ALTER TABLE public.reservations ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.reservations ALTER COLUMN status SET DEFAULT 'confirmed';

-- Update users table
ALTER TABLE public.users 
ADD COLUMN role_new user_role_new;

UPDATE public.users SET role_new = 
  CASE role::text
    WHEN 'lektor' THEN 'tutor'::user_role_new
    WHEN 'uczeń' THEN 'student'::user_role_new
    WHEN 'tutor' THEN 'tutor'::user_role_new
    WHEN 'student' THEN 'student'::user_role_new
    ELSE 'student'::user_role_new
  END;

ALTER TABLE public.users DROP COLUMN role;
ALTER TABLE public.users RENAME COLUMN role_new TO role;
ALTER TABLE public.users ALTER COLUMN role SET NOT NULL;

-- Step 3: Drop old enum types
DROP TYPE IF EXISTS date_status CASCADE;
DROP TYPE IF EXISTS lesson_status CASCADE;
DROP TYPE IF EXISTS reservation_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Step 4: Rename new enum types to original names
ALTER TYPE date_status_new RENAME TO date_status;
ALTER TYPE lesson_status_new RENAME TO lesson_status;
ALTER TYPE reservation_status_new RENAME TO reservation_status;
ALTER TYPE user_role_new RENAME TO user_role;

-- Update comments to reflect new English values
COMMENT ON COLUMN public.users.role IS 'User role: tutor (teacher) or student';
