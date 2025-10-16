-- Migration: Fix handle_new_user function to handle missing columns gracefully
-- Purpose: Fix the trigger function that creates user profiles to handle cases where columns don't exist yet
-- This prevents errors during user registration when database schema is in transition

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert a new profile record for the new auth user
  -- Handle the case where teacher_id column might not exist yet
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
      coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),
      now(),
      (new.raw_user_meta_data->>'teacher_id')::uuid
    );
  EXCEPTION
    WHEN undefined_column THEN
      -- If teacher_id column doesn't exist, insert without it
      INSERT INTO public.users (
        id,
        first_name,
        last_name,
        role,
        profile_created_at
      )
      VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'first_name', ''),
        coalesce(new.raw_user_meta_data->>'last_name', ''),
        coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),
        now()
      );
    WHEN invalid_text_representation THEN
      -- If role enum value is invalid, use default 'student'
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
        'student'::user_role,
        now(),
        (new.raw_user_meta_data->>'teacher_id')::uuid
      );
  END;
  
  RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add comment to document the fix
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile when new auth user is created - with error handling for schema transitions';
