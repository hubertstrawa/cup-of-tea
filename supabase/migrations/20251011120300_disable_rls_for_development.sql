/*
 * Migration: Disable RLS policies for development
 * Purpose: Temporarily disable Row Level Security for easier development and testing
 * Affected tables: users, dates, reservations, notifications, lessons, error_logs
 * Special considerations:
 *   - This is for DEVELOPMENT ONLY - re-enable before production
 *   - Policies are not dropped, just disabled - can be re-enabled easily
 *   - All tables will be accessible without restrictions during development
 */

-- IMPORTANT: This migration disables security for development purposes only
-- DO NOT use this in production environment

/*
 * Disable RLS on all tables
 * Note: This disables the enforcement but keeps the policies intact
 */

-- disable rls on users table
alter table public.users disable row level security;

-- disable rls on dates table  
alter table public.dates disable row level security;

-- disable rls on reservations table
alter table public.reservations disable row level security;

-- disable rls on notifications table
alter table public.notifications disable row level security;

-- disable rls on lessons table
alter table public.lessons disable row level security;

-- disable rls on error_logs table
alter table public.error_logs disable row level security;

-- add comments to document this is temporary
comment on table public.users is 'User profiles extending Supabase Auth functionality - RLS DISABLED FOR DEVELOPMENT';
comment on table public.dates is 'Available time slots created by teachers - RLS DISABLED FOR DEVELOPMENT';
comment on table public.reservations is 'Student reservations for time slots - RLS DISABLED FOR DEVELOPMENT';
comment on table public.notifications is 'System notifications for users - RLS DISABLED FOR DEVELOPMENT';
comment on table public.lessons is 'Completed or scheduled lesson records - RLS DISABLED FOR DEVELOPMENT';
comment on table public.error_logs is 'System error logs for debugging - RLS DISABLED FOR DEVELOPMENT';

/*
 * NOTE: To re-enable RLS for production, create a new migration with:
 * 
 * alter table public.users enable row level security;
 * alter table public.dates enable row level security;
 * alter table public.reservations enable row level security;
 * alter table public.notifications enable row level security;
 * alter table public.lessons enable row level security;
 * alter table public.error_logs enable row level security;
 * 
 * All the policies from 20251011120100_setup_rls_policies.sql will still be there
 * and will become active again once RLS is re-enabled.
 */
