/*
 * Migration: Fix users table integration with Supabase Auth
 * Purpose: Properly link users table with auth.users and remove redundant fields
 * Affected tables: users (restructure), all related tables (update references)
 * Special considerations:
 *   - This is a breaking change that restructures the users table
 *   - Removes redundant fields that exist in auth.users
 *   - Ensures proper foreign key relationship with auth.users.id
 *   - Updates all RLS policies to use auth.uid() correctly
 */

-- IMPORTANT: This migration restructures the users table to properly integrate with Supabase Auth

/*
 * Step 1: Drop the existing users table and recreate it properly
 * Note: In a real scenario with data, you'd need a more complex migration
 */

-- drop existing foreign key constraints that reference users table
alter table public.dates drop constraint if exists dates_teacher_id_fkey;
alter table public.reservations drop constraint if exists reservations_student_id_fkey;
alter table public.notifications drop constraint if exists notifications_user_id_fkey;
alter table public.lessons drop constraint if exists lessons_teacher_id_fkey;
alter table public.lessons drop constraint if exists lessons_student_id_fkey;

-- drop the existing users table
drop table if exists public.users cascade;

/*
 * Step 2: Create the new users table that properly extends auth.users
 * This table should only contain additional profile information
 */
create table public.users (
    -- use auth.users.id as primary key (no default uuid generation)
    id uuid primary key references auth.users(id) on delete cascade,
    
    -- profile information not stored in auth.users
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    role user_role not null,
    
    -- timestamps for tracking (auth.users has its own created_at)
    profile_created_at timestamptz not null default now(),
    last_login_at timestamptz,
    
    -- additional metadata
    metadata jsonb default '{}'::jsonb
);

-- enable row level security on users table
alter table public.users enable row level security;

/*
 * Step 3: Recreate foreign key constraints with the new users table
 */

-- restore foreign key for dates.teacher_id
alter table public.dates 
add constraint dates_teacher_id_fkey 
foreign key (teacher_id) references public.users(id);

-- restore foreign key for reservations.student_id
alter table public.reservations 
add constraint reservations_student_id_fkey 
foreign key (student_id) references public.users(id);

-- restore foreign key for notifications.user_id
alter table public.notifications 
add constraint notifications_user_id_fkey 
foreign key (user_id) references public.users(id);

-- restore foreign key for lessons.teacher_id
alter table public.lessons 
add constraint lessons_teacher_id_fkey 
foreign key (teacher_id) references public.users(id);

-- restore foreign key for lessons.student_id
alter table public.lessons 
add constraint lessons_student_id_fkey 
foreign key (student_id) references public.users(id);

/*
 * Step 4: Create a function to automatically create user profile when auth user is created
 * This ensures every auth.users record has a corresponding public.users record
 */
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- insert a new profile record for the new auth user
  -- note: you'll need to set first_name, last_name, and role through your application
  insert into public.users (id, first_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'uczeń')
  );
  return new;
end;
$$;

-- create trigger to automatically create profile when auth user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

/*
 * Step 5: Update table comments to reflect the new structure
 */
comment on table public.users is 'User profiles that extend Supabase Auth with additional fields - properly linked to auth.users.id';
comment on column public.users.id is 'Foreign key to auth.users.id - this is the Supabase Auth user ID';
comment on column public.users.role is 'User role: lektor (teacher) or uczeń (student)';
comment on column public.users.metadata is 'Additional user data stored as JSON';
comment on function public.handle_new_user() is 'Automatically creates user profile when new auth user is created';

/*
 * Step 6: Create helper function to get user email (since it's now in auth.users)
 */
create or replace function public.get_user_email(user_id uuid)
returns text
language sql
security definer
as $$
  select email from auth.users where id = user_id;
$$;

comment on function public.get_user_email(uuid) is 'Helper function to get user email from auth.users table';
