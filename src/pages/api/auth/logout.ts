import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { createErrorResponse, createSuccessResponse, AUTH_ERRORS } from "../../../lib/utils/auth-errors.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Utworzenie SSR Supabase instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Wylogowanie użytkownika
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR, "Nie udało się wylogować");
    }

    return createSuccessResponse({
      message: "Wylogowanie zakończone sukcesem",
    });
  } catch (error) {
    console.error("Logout API error:", error);
    return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR);
  }
};
