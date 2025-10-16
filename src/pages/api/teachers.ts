import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../db/supabase.client.ts";
import { createSuccessResponse, createErrorResponse, AUTH_ERRORS } from "../../lib/utils/auth-errors.ts";

export const prerender = false;

/**
 * Pobierz listę lektorów z podstawowymi informacjami.
 * Występujący błąd "Unexpected token '<', '<!DOCTYPE '..." sugeruje, że endpoint nie zwraca poprawnego JSON.
 * Powód: prawdopodobnie ścieżka, nagłówki lub konfiguracja w Astro/Supabase. Dodano dodatkowe logowanie i porządne JSON API.
 */
export const GET: APIRoute = async ({ cookies, request }) => {
  try {
    console.log('GET /api/teachers');
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Pobierz wszystkich nauczycieli z podstawowymi informacjami
    const { data: teachers, error } = await supabase
      .from("users")
      .select(`
        id,
        first_name,
        last_name,
        teachers (
          bio,
          description,
          lessons_completed
        )
      `)
      .eq("role", "tutor")
      .order("first_name");

    if (error) {
      console.error("Error fetching teachers:", error);
      return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR, "Nie udało się pobrać listy nauczycieli");
    }

    console.log('teachers', teachers);

    return createSuccessResponse({
      success: true,
      data: teachers ?? [],
    });
  } catch (error) {
    console.error("Teachers API error:", error);
    return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR, "Wystąpił błąd serwera");
  }
};
