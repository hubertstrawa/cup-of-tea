-- 20251012140000_update_users_and_dates.sql
BEGIN;

-- student_id column is already added in previous migration 20251012130000_add_student_id_to_dates.sql
-- ALTER TABLE dates ADD COLUMN student_id uuid;
-- ALTER TABLE dates ADD CONSTRAINT fk_dates_student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE dates ADD COLUMN title TEXT;
ALTER TABLE dates ADD COLUMN description TEXT;

COMMIT;