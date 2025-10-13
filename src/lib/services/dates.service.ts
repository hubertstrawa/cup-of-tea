import type { SupabaseClient } from "../../db/supabase.client";
import type {
  DateListItemDTO,
  PaginatedResponseDTO,
  CreateDateCommand,
  UpdateDateCommand,
  CreateEntityResponseDTO,
  UpdateEntityResponseDTO,
  DeleteEntityResponseDTO,
  UUID,
} from "../../types2";
import type { DatesListQuery } from "../validation/dates.schemas";

export class DatesService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get paginated list of dates with optional filters
   */
  async getDates(query: DatesListQuery): Promise<PaginatedResponseDTO<DateListItemDTO>> {
    const { page, limit, teacherId, date, status } = query;
    const offset = (page - 1) * limit;

    let supabaseQuery = this.supabase
      .from("dates")
      .select("id, start_time, end_time, status, teacher_id, student_id, title, description", { count: "exact" });

    // Apply filters
    if (teacherId) {
      supabaseQuery = supabaseQuery.eq("teacher_id", teacherId);
    }

    if (date) {
      // Filter by date (start_time on the specified date)
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      supabaseQuery = supabaseQuery.gte("start_time", startOfDay).lte("start_time", endOfDay);
    }

    if (status) {
      supabaseQuery = supabaseQuery.eq("status", status);
    }

    // Apply pagination and ordering
    const { data, error, count } = await supabaseQuery
      .order("start_time", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch dates: ${error.message}`);
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  /**
   * Create a new date entry
   */
  async createDate(command: CreateDateCommand, teacherId: UUID): Promise<CreateEntityResponseDTO> {
    // Check for time conflicts with existing dates for the same teacher
    const conflictCheck = await this.supabase
      .from("dates")
      .select("id")
      .eq("teacher_id", teacherId)
      .neq("status", "canceled")
      .or(
        `and(start_time.lt.${command.start_time},end_time.gt.${command.start_time}),and(start_time.lt.${command.end_time},end_time.gt.${command.end_time}),and(start_time.gte.${command.start_time},end_time.lte.${command.end_time})`
      );

    if (conflictCheck.error) {
      throw new Error(`Failed to check for conflicts: ${conflictCheck.error.message}`);
    }

    if (conflictCheck.data && conflictCheck.data.length > 0) {
      throw new Error("Time slot conflicts with existing date", { cause: "CONFLICT" });
    }

    const { data, error } = await this.supabase
      .from("dates")
      .insert({
        ...command,
        teacher_id: teacherId,
        student_id: null,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to create date: ${error.message}`);
    }

    return {
      message: "Date created successfully",
      id: data.id,
    };
  }

  /**
   * Update an existing date entry
   */
  async updateDate(id: UUID, command: UpdateDateCommand, userId: UUID): Promise<UpdateEntityResponseDTO> {
    // First, verify ownership
    const ownershipCheck = await this.supabase.from("dates").select("teacher_id").eq("id", id).single();

    if (ownershipCheck.error) {
      if (ownershipCheck.error.code === "PGRST116") {
        throw new Error("Date not found", { cause: "NOT_FOUND" });
      }
      throw new Error(`Failed to verify ownership: ${ownershipCheck.error.message}`);
    }

    if (ownershipCheck.data.teacher_id !== userId) {
      throw new Error("Insufficient permissions to update this date", { cause: "FORBIDDEN" });
    }

    // Check for conflicts if time is being updated
    if (command.start_time || command.end_time) {
      // Get current date data to fill in missing time values
      const { data: currentDate, error: fetchError } = await this.supabase
        .from("dates")
        .select("start_time, end_time")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch current date: ${fetchError.message}`);
      }

      const newStartTime = command.start_time || currentDate.start_time;
      const newEndTime = command.end_time || currentDate.end_time;

      const conflictCheck = await this.supabase
        .from("dates")
        .select("id")
        .eq("teacher_id", userId)
        .neq("id", id)
        .neq("status", "canceled")
        .or(
          `and(start_time.lt.${newStartTime},end_time.gt.${newStartTime}),and(start_time.lt.${newEndTime},end_time.gt.${newEndTime}),and(start_time.gte.${newStartTime},end_time.lte.${newEndTime})`
        );

      if (conflictCheck.error) {
        throw new Error(`Failed to check for conflicts: ${conflictCheck.error.message}`);
      }

      if (conflictCheck.data && conflictCheck.data.length > 0) {
        throw new Error("Updated time slot conflicts with existing date", { cause: "CONFLICT" });
      }
    }

    const { error } = await this.supabase.from("dates").update(command).eq("id", id);

    if (error) {
      throw new Error(`Failed to update date: ${error.message}`);
    }

    return {
      message: "Date updated successfully",
    };
  }

  /**
   * Delete a date entry
   */
  async deleteDate(id: UUID, userId: UUID): Promise<DeleteEntityResponseDTO> {
    // First, verify ownership
    const ownershipCheck = await this.supabase.from("dates").select("teacher_id").eq("id", id).single();

    if (ownershipCheck.error) {
      if (ownershipCheck.error.code === "PGRST116") {
        throw new Error("Date not found", { cause: "NOT_FOUND" });
      }
      throw new Error(`Failed to verify ownership: ${ownershipCheck.error.message}`);
    }

    if (ownershipCheck.data.teacher_id !== userId) {
      throw new Error("Insufficient permissions to delete this date", { cause: "FORBIDDEN" });
    }

    // Check if there are any confirmed reservations for this date
    const reservationCheck = await this.supabase
      .from("reservations")
      .select("id")
      .eq("term_id", id)
      .eq("status", "confirmed");

    if (reservationCheck.error) {
      throw new Error(`Failed to check reservations: ${reservationCheck.error.message}`);
    }

    if (reservationCheck.data && reservationCheck.data.length > 0) {
      throw new Error("Cannot delete date with confirmed reservations", { cause: "CONFLICT" });
    }

    const { error } = await this.supabase.from("dates").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete date: ${error.message}`);
    }

    return {
      message: "Date deleted successfully",
    };
  }
}
