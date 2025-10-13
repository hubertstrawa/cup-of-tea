import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { RegisterSchema } from "../../../lib/validation/auth.schemas.ts";
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
    const validationResult = RegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        AUTH_ERRORS.VALIDATION_ERROR,
        validationResult.error.errors.map((e) => e.message).join(", ")
      );
    }

    const { email, password, firstName, lastName, role, teacherId } = validationResult.data;

    // Utworzenie SSR Supabase instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Walidacja tokenu zaproszeniowego dla uczniów
    if (teacherId) {
      const { data: teacher } = await supabase
        .from("users")
        .select("id")
        .eq("id", teacherId)
        .eq("role", "tutor")
        .single();

      if (!teacher) {
        return createErrorResponse(AUTH_ERRORS.INVALID_INVITATION_TOKEN);
      }
    }

    // Rejestracja użytkownika w Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role === "tutor" ? "tutor" : "student",
          teacher_id: teacherId || null,
        },
      },
    });

    if (error) {
      const mappedError = mapSupabaseError(error.message);
      return createErrorResponse(mappedError);
    }

    if (!data.user) {
      return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR, "Nie udało się utworzyć konta");
    }

    // Profil użytkownika zostanie utworzony automatycznie przez trigger w bazie danych
    // ale sprawdzimy czy się udało
    const { data: userProfile } = await supabase.from("users").select("*").eq("id", data.user.id).single();

    return createSuccessResponse(
      {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: role,
          firstName: firstName,
          lastName: lastName,
          emailConfirmed: false, // Nowy użytkownik musi potwierdzić email
        },
        message: "Konto zostało utworzone. Sprawdź swoją skrzynkę e-mail i potwierdź adres.",
        requiresEmailConfirmation: true,
      },
      201
    );
  } catch (error) {
    console.error("Register API error:", error);
    return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR);
  }
};
