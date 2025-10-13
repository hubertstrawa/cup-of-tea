import type { Tables, TablesInsert, TablesUpdate, Enums } from "./db/database.types";

// Shared primitives
export type UUID = string;
export type TimestampString = string;

// Status and role enums (kept in sync with DB enums)
export type DateStatus = Enums<"date_status">;
export type ReservationStatus = Enums<"reservation_status">;
export type LessonStatus = Enums<"lesson_status">;
export type UserRole = Enums<"user_role">;

// Base entity aliases (DB Rows)
export type DateEntity = Tables<"dates">;
export type ReservationEntity = Tables<"reservations">;
export type LessonEntity = Tables<"lessons">;
export type NotificationEntity = Tables<"notifications">;
export type ErrorLogEntity = Tables<"error_logs">;
export type UserEntity = Tables<"users">;

// Pagination primitives
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationInfoDTO {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponseDTO<TItem> {
  data: TItem[];
  pagination: PaginationInfoDTO;
}

// Generic operation responses (per API plan examples)
export interface CreateEntityResponseDTO {
  message: string;
  id: UUID;
}

export interface UpdateEntityResponseDTO {
  message: string;
}

export interface DeleteEntityResponseDTO {
  message: string;
}

// Dates (Teacher Availability)
export type DateListItemDTO = Pick<
  DateEntity,
  "id" | "start_time" | "end_time" | "status" | "teacher_id" | "student_id"
>;

export interface DatesListQueryDTO extends PaginationParams {
  teacherId?: UUID;
  // Date-only filter; API plan refers to a single-day filter value
  date?: string;
  status?: DateStatus;
}

// Command models for Dates
// Teacher context (teacher_id) is derived from auth on the server;
// do not require it on the client command model.
export type CreateDateCommand = Pick<TablesInsert<"dates">, "start_time" | "end_time" | "status" | "additional_info">;

// Only allow mutable fields defined by the API plan
export type UpdateDateCommand = Pick<TablesUpdate<"dates">, "start_time" | "end_time" | "status" | "additional_info">;

// Reservations
export type ReservationListItemDTO = Pick<
  ReservationEntity,
  "id" | "term_id" | "student_id" | "reserved_at" | "status"
>;

export interface ReservationsListQueryDTO extends PaginationParams {
  studentId?: UUID;
  // Filter by teacher who owns the term (join on dates.teacher_id)
  teacherId?: UUID;
  status?: ReservationStatus;
}

export type CreateReservationCommand = Pick<TablesInsert<"reservations">, "term_id" | "notes">;

export type UpdateReservationCommand = Pick<TablesUpdate<"reservations">, "status" | "notes">;

// Notifications
export type NotificationListItemDTO = Pick<NotificationEntity, "id" | "content" | "is_read" | "created_at">;

export interface NotificationsListQueryDTO extends PaginationParams {
  is_read?: boolean;
}

// Mark notification as read; explicit literal form for clarity
export type MarkNotificationReadCommand = { is_read: true } & Pick<TablesUpdate<"notifications">, "is_read">;

// Lessons
export type LessonListItemDTO = Pick<
  LessonEntity,
  "id" | "reservation_id" | "scheduled_at" | "duration_minutes" | "status"
>;

export interface LessonsListQueryDTO extends PaginationParams {
  teacherId?: UUID;
  studentId?: UUID;
  status?: LessonStatus;
}

export type CreateLessonCommand = Pick<TablesInsert<"lessons">, "reservation_id" | "scheduled_at" | "duration_minutes">;

export type UpdateLessonCommand = Pick<TablesUpdate<"lessons">, "scheduled_at" | "duration_minutes" | "status">;

// Error Logs
export type ErrorLogDTO = Pick<
  ErrorLogEntity,
  "id" | "error_code" | "occurred_at" | "details" | "module" | "function_name"
>;

export interface ErrorLogsListQueryDTO extends PaginationParams {
  module?: string;
  error_code?: string;
}

// Users (profile)
export type UserProfileDTO = Pick<
  UserEntity,
  "id" | "first_name" | "last_name" | "role" | "profile_created_at" | "last_login_at" | "metadata"
>;
