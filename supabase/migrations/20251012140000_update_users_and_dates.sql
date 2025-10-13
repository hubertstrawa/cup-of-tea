-- 20251012140000_update_users_and_dates.sql
BEGIN;

ALTER TABLE dates ADD COLUMN student_id uuid;
ALTER TABLE dates ADD CONSTRAINT fk_dates_student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE dates ADD COLUMN title TEXT;
ALTER TABLE dates ADD COLUMN description TEXT;

COMMIT;