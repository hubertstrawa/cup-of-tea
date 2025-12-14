import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { createSuccessResponse, createErrorResponse, AUTH_ERRORS } from "../../../lib/utils/auth-errors.ts";

export const prerender = false;

/**
 * Pobierz informacje o pojedynczym nauczycielu
 */
export const GET: APIRoute = async ({ params, cookies, request }) => {
  try {
    const { teacherId } = params;

    if (!teacherId) {
      return createErrorResponse(AUTH_ERRORS.VALIDATION_ERROR, "ID nauczyciela jest wymagane");
    }

    console.log(`GET /api/teachers/${teacherId}`);
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Pobierz nauczyciela z podstawowymi informacjami
    const { data: teacher, error } = await supabase
      .from("users")
      .select(
        `
        id,
        first_name,
        last_name,
        teachers (
          bio,
          description,
          lessons_completed
        )
      `
      )
      .eq("id", teacherId)
      .eq("role", "tutor")
      .single();

    if (error) {
      console.error("Error fetching teacher:", error);
      if (error.code === "PGRST116") {
        return createErrorResponse(AUTH_ERRORS.USER_NOT_FOUND, "Nauczyciel nie został znaleziony");
      }
      return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR, "Nie udało się pobrać informacji o nauczycielu");
    }

    if (!teacher) {
      return createErrorResponse(AUTH_ERRORS.USER_NOT_FOUND, "Nauczyciel nie został znaleziony");
    }

    console.log("teacher", teacher);

    return createSuccessResponse({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Teacher API error:", error);
    return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR, "Wystąpił błąd serwera");
  }
};
