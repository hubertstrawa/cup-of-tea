# REST API Plan

## 1. Resources
- **Users**: Maps to the `users` table. Contains teacher and student profiles, including fields like `first_name`, `last_name`, `role`, and metadata. Extends Supabase Auth.
- **Dates**: Maps to the `dates` table. Represents teacher availability with `start_time`, `end_time`, `status`, and associated `teacher_id`. Includes validation ensuring `end_time > start_time`.
- **Reservations**: Maps to the `reservations` table. Represents student bookings for available dates, ensuring uniqueness per time slot. Includes fields like `term_id`, `student_id`, and booking `status`.
- **Notifications**: Maps to the `notifications` table. Contains user notifications, including `content`, `is_read`, and timestamp `created_at`.
- **Lessons**: Maps to the `lessons` table. Logs details of lessons associated with reservations and both teacher and student information. Includes fields like `scheduled_at`, `duration_minutes`, and `status`.
- **Error Logs**: Maps to the `error_logs` table. Stores error records for backend monitoring with fields such as `error_code`, `details`, and `module`.

## 2. Endpoints

<!-- ### Users
#### Registration & Login
- **POST /api/users/register**
  - Registers a new teacher account. (Student registration will be via invitation link.)
  - Request JSON:
    ```json
    {
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "password": "string",
      "role": "lektor"
    }
    ```
  - Response JSON:
    ```json
    { "message": "User registered successfully", "userId": "UUID" }
    ```
  - Success: 201; Errors: 400, 409

- **POST /api/users/login**
  - Logs in an existing user using Supabase Auth with email confirmation.
  - Request JSON:
    ```json
    { "email": "string", "password": "string" }
    ```
  - Response JSON:
    ```json
    { "token": "JWT", "user": { /* profile info */ } }
    ```
  - Success: 200; Errors: 401

- **GET /api/users/profile**
  - Retrieves the authenticated user’s profile, integrating extended info from the `users` table.
  - Response JSON:
    ```json
    { "id": "UUID", "first_name": "string", "last_name": "string", "role": "string", "profile_created_at": "timestamp", "last_login_at": "timestamp", "metadata": {} }
    ```
  - Success: 200; Errors: 401, 404 -->

### Dates (Teacher Availability)

- **GET /api/dates**
  - Lists available slots with filtering (e.g., teacher, date, status) and supports pagination.
  - Query Params: `page`, `limit`, `teacherId` (optional), `date` (optional), `status` (optional)
  - Response JSON:
    ```json
    { "data": [{ "id": "UUID", "start_time": "timestamp", "end_time": "timestamp", "status": "string", "teacher_id": "UUID" }], "pagination": { "page": 1, "limit": 10, "total": 100 } }
    ```
  - Success: 200; Errors: 400

- **POST /api/dates**
  - Creates a new availability slot for a teacher.
  - Request JSON:
    ```json
    { "start_time": "timestamp", "end_time": "timestamp", "status": "dostępny", "additional_info": {} }
    ```
  - Validation: Ensures `end_time` > `start_time`.
  - Response JSON:
    ```json
    { "message": "Date created successfully", "id": "UUID" }
    ```
  - Success: 201; Errors: 400, 409

- **PUT /api/dates/{id}**
  - Updates an existing availability slot. Authorization ensures only the owning teacher can update.
  - Request: Fields to update (e.g., `start_time`, `end_time`, `status`)
  - Response JSON:
    ```json
    { "message": "Date updated successfully" }
    ```
  - Success: 200; Errors: 400, 403, 404

- **DELETE /api/dates/{id}**
  - Deletes an availability slot. Only the teacher who owns the slot can perform this action.
  - Response JSON:
    ```json
    { "message": "Date deleted successfully" }
    ```
  - Success: 200; Errors: 403, 404

### Reservations

- **GET /api/reservations**
  - Lists reservations with filtering (by student, teacher, or status) and pagination support.
  - Query Params: `page`, `limit`, `studentId`, `teacherId`, `status`
  - Response JSON:
    ```json
    { "data": [{ "id": "UUID", "term_id": "UUID", "student_id": "UUID", "reserved_at": "timestamp", "status": "string" }], "pagination": { /* details */ } }
    ```
  - Success: 200; Errors: 400

- **POST /api/reservations**
  - Creates a booking for an available slot. Enforces uniqueness (one reservation per time slot) and business rules (max two free lessons per student).
  - Request JSON:
    ```json
    { "term_id": "UUID", "notes": "Optional text" }
    ```
  - Response JSON:
    ```json
    { "message": "Reservation created successfully", "id": "UUID" }
    ```
  - Success: 201; Errors: 400, 409, 422

- **PUT /api/reservations/{id}**
  - Updates reservation details, such as cancellation (status set to "anulowana"). Only the student who made the reservation can update it.
  - Request: Fields to update
  - Response JSON:
    ```json
    { "message": "Reservation updated successfully" }
    ```
  - Success: 200; Errors: 403, 404

- **DELETE /api/reservations/{id}**
  - Cancels a reservation. May trigger cascading deletion of related lesson records.
  - Response JSON:
    ```json
    { "message": "Reservation deleted successfully" }
    ```
  - Success: 200; Errors: 403, 404

### Notifications

- **GET /api/notifications**
  - Retrieves notifications for the authenticated user. Supports filtering by read status and pagination.
  - Query Params: `page`, `limit`, `is_read` (optional)
  - Response JSON:
    ```json
    { "data": [{ "id": "UUID", "content": "string", "is_read": false, "created_at": "timestamp" }], "pagination": { /* details */ } }
    ```
  - Success: 200; Errors: 400

- **PUT /api/notifications/{id}/read**
  - Marks a notification as read.
  - Response JSON:
    ```json
    { "message": "Notification marked as read" }
    ```
  - Success: 200; Errors: 404

### Lessons

- **GET /api/lessons**
  - Lists lessons filtered by teacher, student, or status, with pagination.
  - Query Params: `page`, `limit`, `teacherId`, `studentId`, `status`
  - Response JSON:
    ```json
    { "data": [{ "id": "UUID", "reservation_id": "UUID", "scheduled_at": "timestamp", "duration_minutes": 60, "status": "string" }], "pagination": { /* details */ } }
    ```
  - Success: 200; Errors: 400

- **POST /api/lessons**
  - Creates a lesson record based on a confirmed reservation. Business logic validates reservation existence and proper duration.
  - Request JSON:
    ```json
    { "reservation_id": "UUID", "scheduled_at": "timestamp", "duration_minutes": 60 }
    ```
  - Response JSON:
    ```json
    { "message": "Lesson created successfully", "id": "UUID" }
    ```
  - Success: 201; Errors: 400, 409

- **PUT /api/lessons/{id}**
  - Updates lesson details such as marking it as completed or cancelled.
  - Request: Fields to update
  - Response JSON:
    ```json
    { "message": "Lesson updated successfully" }
    ```
  - Success: 200; Errors: 400, 403, 404

### Error Logs

- **GET /api/error-logs**
  - Retrieves system error logs, typically for admin users.
  - Query Params: `page`, `limit`, `module`, `error_code`
  - Response JSON:
    ```json
    { "data": [{ "id": "number", "error_code": "string", "occurred_at": "timestamp", "details": "string", "module": "string", "function_name": "string" }], "pagination": { /* details */ } }
    ```
  - Success: 200; Errors: 401, 403

## 3. Authentication and Authorization
- JWT-based authentication integrated with Supabase Auth. Endpoints expecting authentication require a Bearer token in the `Authorization` header.
- Role-based access control:
  - Users access and modify only their own profiles.
  - Teachers exclusively manage their own availability (Dates) and view related reservations.
  - Students are restricted to managing their own reservations and lessons.

## 4. Validation and Business Logic
- **Validation Rules**:
  - Users: Validate required fields; ensure email format and role (lektor or uczeń).
  - Dates: Validate `end_time` > `start_time`; only the teacher owner can modify.
  - Reservations: Enforce one reservation per date slot and limit free lessons per student.
  - Lessons: Validate that the associated reservation exists; lesson duration must be positive.

- **Business Logic Mapping**:
  - Registration: Teacher direct registration; student registration via invitation link.
  - Calendar Management: Teachers create, edit, and delete availability slots.
  - Booking: Students reserve available slots; uniqueness and business rules enforced in API layer.
  - Notifications: Automatically generated on booking or lesson status changes.
  - Lesson Scheduling: Lessons are scheduled based on confirmed reservations.

## 5. Performance and Security Considerations
- Pagination, filtering, and sorting support on list endpoints.
- Rate limiting to protect auth endpoints and request-heavy operations.
- Database indexes leveraged for performance on key fields (e.g., `start_time`, FK fields).
- Input sanitization and HTTPS enforced for secure communications.

