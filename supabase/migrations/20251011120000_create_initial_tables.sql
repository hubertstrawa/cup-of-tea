/*
 * Migration: Create initial tables for Cup of Tea application
 * Purpose: Set up the core database schema including users, dates, reservations, lessons, notifications, and error_logs
 * Affected tables: users, dates, reservations, notifications, lessons, error_logs
 * Special considerations: 
 *   - Uses Supabase Auth for user management
 *   - Enables RLS on all tables for security
 *   - Includes proper foreign key relationships and constraints
 */

-- enable uuid extension for generating uuids
create extension if not exists "uuid-ossp";

-- create custom types for enum-like values
create type user_role as enum ('lektor', 'uczeń');
create type date_status as enum ('dostępny', 'zarezerwowany', 'anulowany');
create type reservation_status as enum ('potwierdzona', 'anulowana');
create type lesson_status as enum ('zaplanowana', 'zakończona', 'anulowana');

/*
 * Table: users
 * Purpose: Store user profiles and metadata (extends Supabase Auth)
 * Note: This table works alongside Supabase Auth's auth.users table
 */
create table public.users (
    id uuid primary key default uuid_generate_v4(),
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    email varchar(255) not null unique,
    encrypted_password varchar not null,
    role user_role not null,
    confirmed_at timestamptz,
    created_at timestamptz not null default now(),
    last_login_at timestamptz,
    metadata jsonb default '{}'::jsonb
);

-- enable row level security on users table
alter table public.users enable row level security;

/*
 * Table: dates
 * Purpose: Store available time slots created by teachers
 * Relationships: teacher_id references users(id)
 */
create table public.dates (
    id uuid primary key default uuid_generate_v4(),
    start_time timestamptz not null,
    end_time timestamptz not null,
    status date_status not null default 'dostępny',
    teacher_id uuid not null references public.users(id),
    additional_info jsonb default '{}'::jsonb,
    
    -- ensure end_time is after start_time
    constraint dates_time_order_check check (end_time > start_time)
);

-- enable row level security on dates table
alter table public.dates enable row level security;

/*
 * Table: reservations
 * Purpose: Store student reservations for available time slots
 * Relationships: 
 *   - term_id references dates(id) with cascade delete
 *   - student_id references users(id)
 */
create table public.reservations (
    id uuid primary key default uuid_generate_v4(),
    term_id uuid not null references public.dates(id) on delete cascade,
    student_id uuid not null references public.users(id),
    reserved_at timestamptz not null default now(),
    status reservation_status not null default 'potwierdzona',
    notes text,
    
    -- ensure one reservation per time slot
    unique(term_id)
);

-- enable row level security on reservations table
alter table public.reservations enable row level security;

/*
 * Table: notifications
 * Purpose: Store system notifications for users
 * Relationships: user_id references users(id)
 */
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id),
    content text not null,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

-- enable row level security on notifications table
alter table public.notifications enable row level security;

/*
 * Table: lessons
 * Purpose: Store completed or scheduled lesson details
 * Relationships:
 *   - reservation_id references reservations(id) with cascade delete
 *   - teacher_id references users(id)
 *   - student_id references users(id)
 */
create table public.lessons (
    id uuid primary key default uuid_generate_v4(),
    reservation_id uuid not null references public.reservations(id) on delete cascade,
    teacher_id uuid not null references public.users(id),
    student_id uuid not null references public.users(id),
    scheduled_at timestamptz not null,
    duration_minutes integer not null,
    status lesson_status not null default 'zaplanowana',
    
    -- ensure positive duration
    constraint lessons_duration_positive_check check (duration_minutes > 0)
);

-- enable row level security on lessons table
alter table public.lessons enable row level security;

/*
 * Table: error_logs
 * Purpose: Store system error logs for debugging and monitoring
 * Note: Uses bigserial for high-volume logging scenarios
 */
create table public.error_logs (
    id bigserial primary key,
    error_code varchar(100),
    occurred_at timestamptz not null default now(),
    details text,
    module varchar(100),
    function_name varchar(100)
);

-- enable row level security on error_logs table
alter table public.error_logs enable row level security;

-- add comments to tables for documentation
comment on table public.users is 'User profiles extending Supabase Auth functionality';
comment on table public.dates is 'Available time slots created by teachers';
comment on table public.reservations is 'Student reservations for time slots';
comment on table public.notifications is 'System notifications for users';
comment on table public.lessons is 'Completed or scheduled lesson records';
comment on table public.error_logs is 'System error logs for debugging';

-- add comments to important columns
comment on column public.users.role is 'User role: lektor (teacher) or uczeń (student)';
comment on column public.users.metadata is 'Additional user data stored as JSON';
comment on column public.dates.additional_info is 'Additional time slot information stored as JSON';
comment on column public.reservations.term_id is 'Reference to the reserved time slot';
comment on column public.lessons.duration_minutes is 'Lesson duration in minutes';
