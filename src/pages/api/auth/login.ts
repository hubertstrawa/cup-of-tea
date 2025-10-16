import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { LoginSchema } from "../../../lib/validation/auth.schemas.ts";
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
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        AUTH_ERRORS.VALIDATION_ERROR,
        validationResult.error.errors.map((e) => e.message).join(", ")
      );
    }

    const { email, password } = validationResult.data;

    // Utworzenie SSR Supabase instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Próba logowania
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const mappedError = mapSupabaseError(error.message);
      return createErrorResponse(mappedError);
    }

    if (!data.user) {
      return createErrorResponse(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Pobranie profilu użytkownika
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      // .single();

      console.log('userProfile', userProfile);

    if (profileError || !userProfile) {
      return createErrorResponse(AUTH_ERRORS.USER_NOT_FOUND);
    }

    // Aktualizacja last_login_at
    await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", data.user.id);

    // Zwrócenie danych użytkownika (bez wrażliwych informacji)
    return createSuccessResponse({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userProfile.role === "tutor" ? "tutor" : "student",
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        emailConfirmed: data.user.email_confirmed_at !== null,
      },
      message: "Logowanie zakończone sukcesem",
    });
  } catch (error) {
    console.error("Login API error:", error);
    return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR);
  }
};
