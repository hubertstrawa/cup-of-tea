/*
 * Migration: Setup Row Level Security (RLS) policies
 * Purpose: Implement security policies for all tables based on user roles and ownership
 * Affected tables: users, dates, reservations, notifications, lessons, error_logs
 * Special considerations:
 *   - Teachers can only manage their own dates and see related reservations/lessons
 *   - Students can only see/manage their own reservations and lessons
 *   - Users can only access their own profile and notifications
 *   - Error logs are restricted to system access only
 */

/*
 * RLS Policies for users table
 * Security model: Users can only access their own profile data
 */

-- policy for authenticated users to select their own profile
create policy "users_select_own_profile" on public.users
    for select
    to authenticated
    using (auth.uid()::text = id::text);

-- policy for authenticated users to update their own profile
create policy "users_update_own_profile" on public.users
    for update
    to authenticated
    using (auth.uid()::text = id::text)
    with check (auth.uid()::text = id::text);

-- policy for new user registration (insert)
create policy "users_insert_own_profile" on public.users
    for insert
    to authenticated
    with check (auth.uid()::text = id::text);

/*
 * RLS Policies for dates table
 * Security model: Teachers can manage their own dates, students can view available dates
 */

-- policy for authenticated users to select dates
-- teachers see their own dates, students see available dates
create policy "dates_select_policy" on public.dates
    for select
    to authenticated
    using (
        -- teachers can see their own dates
        (teacher_id = auth.uid()) or
        -- students can see available dates
        (status = 'dostępny' and exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'uczeń'
        ))
    );

-- policy for teachers to insert their own dates
create policy "dates_insert_teachers_only" on public.dates
    for insert
    to authenticated
    with check (
        teacher_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'lektor'
        )
    );

-- policy for teachers to update their own dates
create policy "dates_update_teachers_only" on public.dates
    for update
    to authenticated
    using (
        teacher_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'lektor'
        )
    )
    with check (
        teacher_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'lektor'
        )
    );

-- policy for teachers to delete their own dates
create policy "dates_delete_teachers_only" on public.dates
    for delete
    to authenticated
    using (
        teacher_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'lektor'
        )
    );

/*
 * RLS Policies for reservations table
 * Security model: Students can manage their own reservations, teachers can see reservations for their dates
 */

-- policy for selecting reservations
-- students see their own reservations, teachers see reservations for their dates
create policy "reservations_select_policy" on public.reservations
    for select
    to authenticated
    using (
        -- students can see their own reservations
        (student_id = auth.uid()) or
        -- teachers can see reservations for their dates
        exists (
            select 1 from public.dates d
            where d.id = term_id and d.teacher_id = auth.uid()
        )
    );

-- policy for students to insert reservations
create policy "reservations_insert_students_only" on public.reservations
    for insert
    to authenticated
    with check (
        student_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'uczeń'
        ) and
        -- can only reserve available dates
        exists (
            select 1 from public.dates 
            where id = term_id and status = 'dostępny'
        )
    );

-- policy for students to update their own reservations
create policy "reservations_update_students_only" on public.reservations
    for update
    to authenticated
    using (
        student_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'uczeń'
        )
    )
    with check (
        student_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'uczeń'
        )
    );

-- policy for students to delete their own reservations
create policy "reservations_delete_students_only" on public.reservations
    for delete
    to authenticated
    using (
        student_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'uczeń'
        )
    );

/*
 * RLS Policies for notifications table
 * Security model: Users can only access their own notifications
 */

-- policy for users to select their own notifications
create policy "notifications_select_own" on public.notifications
    for select
    to authenticated
    using (user_id = auth.uid());

-- policy for system to insert notifications (service role)
create policy "notifications_insert_system" on public.notifications
    for insert
    to service_role
    with check (true);

-- policy for users to update their own notifications (mark as read)
create policy "notifications_update_own" on public.notifications
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- policy for users to delete their own notifications
create policy "notifications_delete_own" on public.notifications
    for delete
    to authenticated
    using (user_id = auth.uid());

/*
 * RLS Policies for lessons table
 * Security model: Students and teachers can access lessons they are involved in
 */

-- policy for selecting lessons
-- students see their own lessons, teachers see lessons they teach
create policy "lessons_select_policy" on public.lessons
    for select
    to authenticated
    using (
        student_id = auth.uid() or teacher_id = auth.uid()
    );

-- policy for teachers to insert lessons
create policy "lessons_insert_teachers_only" on public.lessons
    for insert
    to authenticated
    with check (
        teacher_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'lektor'
        )
    );

-- policy for teachers to update lessons they teach
create policy "lessons_update_teachers_only" on public.lessons
    for update
    to authenticated
    using (
        teacher_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'lektor'
        )
    )
    with check (
        teacher_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'lektor'
        )
    );

-- policy for teachers to delete lessons they teach
create policy "lessons_delete_teachers_only" on public.lessons
    for delete
    to authenticated
    using (
        teacher_id = auth.uid() and
        exists (
            select 1 from public.users 
            where id = auth.uid() and role = 'lektor'
        )
    );

/*
 * RLS Policies for error_logs table
 * Security model: Only service role can access error logs for system monitoring
 */

-- policy for service role to select error logs
create policy "error_logs_select_service_role" on public.error_logs
    for select
    to service_role
    using (true);

-- policy for service role to insert error logs
create policy "error_logs_insert_service_role" on public.error_logs
    for insert
    to service_role
    with check (true);

-- policy for service role to update error logs
create policy "error_logs_update_service_role" on public.error_logs
    for update
    to service_role
    using (true)
    with check (true);

-- policy for service role to delete error logs (for cleanup)
create policy "error_logs_delete_service_role" on public.error_logs
    for delete
    to service_role
    using (true);

-- add comments explaining the security model
comment on policy "users_select_own_profile" on public.users is 'Users can only view their own profile data';
comment on policy "dates_select_policy" on public.dates is 'Teachers see their dates, students see available dates';
comment on policy "reservations_select_policy" on public.reservations is 'Students see own reservations, teachers see reservations for their dates';
comment on policy "notifications_select_own" on public.notifications is 'Users can only view their own notifications';
comment on policy "lessons_select_policy" on public.lessons is 'Users can only view lessons they are involved in';
comment on policy "error_logs_select_service_role" on public.error_logs is 'Only system can access error logs';
