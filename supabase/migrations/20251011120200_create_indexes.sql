/*
 * Migration: Create database indexes for performance optimization
 * Purpose: Add indexes for frequently queried columns and foreign keys
 * Affected tables: users, dates, reservations, notifications, lessons, error_logs
 * Special considerations:
 *   - Indexes on foreign keys for join performance
 *   - Indexes on frequently filtered columns (email, start_time, etc.)
 *   - Composite indexes for common query patterns
 */

/*
 * Indexes for users table
 */

-- unique index on email (already created by unique constraint, but explicitly documented)
-- this index is automatically created by the unique constraint in the table definition
-- create unique index if not exists idx_users_email on public.users(email);

-- index on role for filtering users by type
create index if not exists idx_users_role on public.users(role);

-- index on created_at for sorting and filtering by registration date
create index if not exists idx_users_created_at on public.users(created_at);

-- index on last_login_at for activity tracking
create index if not exists idx_users_last_login_at on public.users(last_login_at);

/*
 * Indexes for dates table
 */

-- index on start_time for date/time filtering and sorting (as specified in db-plan.md)
create index if not exists idx_dates_start_time on public.dates(start_time);

-- index on end_time for time range queries
create index if not exists idx_dates_end_time on public.dates(end_time);

-- index on teacher_id (foreign key) for teacher-specific queries
create index if not exists idx_dates_teacher_id on public.dates(teacher_id);

-- index on status for filtering available/reserved dates
create index if not exists idx_dates_status on public.dates(status);

-- composite index for common query pattern: teacher's available dates in time range
create index if not exists idx_dates_teacher_status_time on public.dates(teacher_id, status, start_time);

-- composite index for date range queries
create index if not exists idx_dates_time_range on public.dates(start_time, end_time);

/*
 * Indexes for reservations table
 */

-- index on term_id (foreign key) for joining with dates
create index if not exists idx_reservations_term_id on public.reservations(term_id);

-- index on student_id (foreign key) for student-specific queries
create index if not exists idx_reservations_student_id on public.reservations(student_id);

-- index on reserved_at for sorting by reservation time
create index if not exists idx_reservations_reserved_at on public.reservations(reserved_at);

-- index on status for filtering by reservation status
create index if not exists idx_reservations_status on public.reservations(status);

-- composite index for student's reservations by status
create index if not exists idx_reservations_student_status on public.reservations(student_id, status);

/*
 * Indexes for notifications table
 */

-- index on user_id (foreign key) for user-specific notifications
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- index on created_at for sorting notifications by date
create index if not exists idx_notifications_created_at on public.notifications(created_at);

-- index on is_read for filtering read/unread notifications
create index if not exists idx_notifications_is_read on public.notifications(is_read);

-- composite index for user's unread notifications
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read) where is_read = false;

-- composite index for user's notifications by date
create index if not exists idx_notifications_user_created_at on public.notifications(user_id, created_at desc);

/*
 * Indexes for lessons table
 */

-- index on reservation_id (foreign key) for joining with reservations
create index if not exists idx_lessons_reservation_id on public.lessons(reservation_id);

-- index on teacher_id (foreign key) for teacher-specific queries
create index if not exists idx_lessons_teacher_id on public.lessons(teacher_id);

-- index on student_id (foreign key) for student-specific queries
create index if not exists idx_lessons_student_id on public.lessons(student_id);

-- index on scheduled_at for sorting and filtering by lesson time
create index if not exists idx_lessons_scheduled_at on public.lessons(scheduled_at);

-- index on status for filtering by lesson status
create index if not exists idx_lessons_status on public.lessons(status);

-- composite index for teacher's lessons by status and date
create index if not exists idx_lessons_teacher_status_scheduled on public.lessons(teacher_id, status, scheduled_at);

-- composite index for student's lessons by status and date
create index if not exists idx_lessons_student_status_scheduled on public.lessons(student_id, status, scheduled_at);

/*
 * Indexes for error_logs table
 */

-- index on occurred_at for time-based queries and cleanup
create index if not exists idx_error_logs_occurred_at on public.error_logs(occurred_at);

-- index on error_code for filtering by error type
create index if not exists idx_error_logs_error_code on public.error_logs(error_code);

-- index on module for filtering by system module
create index if not exists idx_error_logs_module on public.error_logs(module);

-- index on function_name for debugging specific functions
create index if not exists idx_error_logs_function_name on public.error_logs(function_name);

-- composite index for error analysis by module and time
create index if not exists idx_error_logs_module_occurred_at on public.error_logs(module, occurred_at desc);

-- composite index for error code analysis by time
create index if not exists idx_error_logs_error_code_occurred_at on public.error_logs(error_code, occurred_at desc);

-- add comments explaining the purpose of key indexes
comment on index idx_dates_start_time is 'Performance index for date/time filtering as specified in db-plan.md';
comment on index idx_dates_teacher_status_time is 'Composite index for finding available teacher dates in time range';
comment on index idx_notifications_user_unread is 'Partial index for efficiently finding unread notifications';
comment on index idx_lessons_teacher_status_scheduled is 'Composite index for teacher lesson management queries';
comment on index idx_error_logs_occurred_at is 'Index for time-based error log queries and cleanup operations';
