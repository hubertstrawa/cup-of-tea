import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { ForgotPasswordSchema } from "../../../lib/validation/auth.schemas.ts";
import {
  mapSupabaseError,
  createErrorResponse,
  createSuccessResponse,
  AUTH_ERRORS,
} from "../../../lib/utils/auth-errors.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parsowanie danych z formularza
    const body = await request.json();

    // Walidacja danych wejściowych
    const validationResult = ForgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        AUTH_ERRORS.VALIDATION_ERROR,
        validationResult.error.errors.map((e) => e.message).join(", ")
      );
    }

    const { email } = validationResult.data;

    // Utworzenie SSR Supabase instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Wysłanie linku do resetowania hasła
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
    });

    if (error) {
      const mappedError = mapSupabaseError(error.message);
      return createErrorResponse(mappedError);
    }

    // Zawsze zwracamy sukces dla bezpieczeństwa (nie ujawniamy czy email istnieje)
    return createSuccessResponse({
      message: "Jeśli adres e-mail istnieje w naszej bazie, wysłaliśmy link do resetowania hasła.",
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR);
  }
};
