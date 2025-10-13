import type { Database } from "./db/database.types";

// DTO i Command Model dla Dates

/**
 * Command model dla tworzenia nowego terminu dostępności.
 * Wykluczamy pola teacher_id oraz id, gdyż teacher_id ustawia kontekst, a id jest generowane automatycznie.
 */
export type CreateDateCommand = Omit<Database["public"]["Tables"]["dates"]["Insert"], "teacher_id" | "id">;

/**
 * Command model dla aktualizacji istniejącego terminu.
 * Zawiera identyfikator rekordu oraz opcjonalne pola do aktualizacji (bez pola teacher_id i id).
 */
export type UpdateDateCommand = { id: string } & Partial<
  Omit<Database["public"]["Tables"]["dates"]["Update"], "teacher_id" | "id">
>;

// DTO i Command Model dla Reservations

/**
 * Command model dla tworzenia rezerwacji.
 * Zawiera minimalnie wymagane pola: term_id oraz opcjonalne notes.
 * Pola student_id, reserved_at i status są ustawiane automatycznie lub kontekstowo.
 */
export type CreateReservationCommand = Pick<
  Database["public"]["Tables"]["reservations"]["Insert"],
  "term_id" | "notes"
>;

/**
 * Command model dla aktualizacji rezerwacji, np. anulowania.
 * Zawiera identyfikator rezerwacji oraz opcjonalne pola do zmian.
 */
export type UpdateReservationCommand = { id: string } & Partial<
  Pick<Database["public"]["Tables"]["reservations"]["Update"], "notes" | "status">
>;

// DTO i Command Model dla Lessons

/**
 * Command model dla tworzenia nowej lekcji.
 * Wykorzystuje pola: reservation_id, scheduled_at oraz duration_minutes.
 * Inne pola są zarządzane przez system.
 */
export type CreateLessonCommand = Pick<
  Database["public"]["Tables"]["lessons"]["Insert"],
  "reservation_id" | "scheduled_at" | "duration_minutes"
>;

/**
 * Command model dla aktualizacji lekcji.
 * Zawiera identyfikator lekcji oraz częściową aktualizację pól.
 */
export type UpdateLessonCommand = { id: string } & Partial<
  Pick<Database["public"]["Tables"]["lessons"]["Update"], "scheduled_at" | "duration_minutes" | "status">
>;

// DTO i Command Model dla Notifications

/**
 * Command model do oznaczenia powiadomienia jako przeczytanego.
 * Ustawia pole is_read na true.
 */
export interface MarkNotificationReadCommand {
  id: string;
  is_read: true;
}

// DTO do odczytu (GET) - bezpośrednie odwzorowanie rekordów z bazy danych

/**
 * DTO reprezentujące rekord terminu dostępności.
 */
export type DateDTO = Database["public"]["Tables"]["dates"]["Row"];

/**
 * DTO reprezentujące rekord rezerwacji.
 */
export type ReservationDTO = Database["public"]["Tables"]["reservations"]["Row"];

/**
 * DTO reprezentujące rekord lekcji.
 */
export type LessonDTO = Database["public"]["Tables"]["lessons"]["Row"];

/**
 * DTO reprezentujące rekord powiadomienia.
 */
export type NotificationDTO = Database["public"]["Tables"]["notifications"]["Row"];

/**
 * DTO dla logów błędów, wykorzystywane przy pobieraniu error logs.
 */
export type ErrorLogDTO = Database["public"]["Tables"]["error_logs"]["Row"];
