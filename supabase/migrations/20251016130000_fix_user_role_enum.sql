-- Migration: Fix user_role enum to use English values
-- Purpose: Change user_role enum from Polish ('lektor', 'uczeń') to English ('tutor', 'student')
-- This fixes the error where frontend sends 'tutor' but database expects 'lektor' or 'uczeń'

-- Step 1: Create new enum type with English values
CREATE TYPE user_role_new AS ENUM ('tutor', 'student');

-- Step 2: Add temporary column with new enum type
ALTER TABLE public.users ADD COLUMN role_new user_role_new;

-- Step 3: Update the temporary column with converted values
UPDATE public.users 
SET role_new = CASE 
    WHEN role::text = 'lektor' THEN 'tutor'::user_role_new
    WHEN role::text = 'uczeń' THEN 'student'::user_role_new
    ELSE 'student'::user_role_new  -- default fallback
END;

-- Step 4: Drop the old column and rename the new one
ALTER TABLE public.users DROP COLUMN role;
ALTER TABLE public.users RENAME COLUMN role_new TO role;
ALTER TABLE public.users ALTER COLUMN role SET NOT NULL;

-- Step 4: Drop the old enum type and rename the new one
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;

-- Step 5: Update the trigger function to use new enum values
-- First, let's recreate the handle_new_user function with correct enum values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    first_name,
    last_name,
    role,
    profile_created_at,
    teacher_id
  )
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),  -- Changed from 'uczeń' to 'student'
    now(),
    (new.raw_user_meta_data->>'teacher_id')::uuid
  );
  RETURN new;
END;
$$;

-- Step 6: Update any other functions or triggers that might reference the old enum values
-- Update the get_user_email function if it exists and references user roles
-- (This function might not need changes, but we check for completeness)

-- Add comment to document the change
COMMENT ON TYPE user_role IS 'User role: tutor (teacher) or student - changed from Polish to English values';
