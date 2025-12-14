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
          role: role,
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

    // TYMCZASOWO WYŁĄCZONE AUTOMATYCZNE LOGOWANIE - powoduje pętlę przekierowań
    // Sprawdź czy jesteśmy w środowisku dev lub czy email confirmation jest wyłączone
    // const isDevelopment = import.meta.env.NODE_ENV === "development" || import.meta.env.NODE_ENV === "dev";
    // const skipEmailConfirmation = import.meta.env.SKIP_EMAIL_CONFIRMATION === "true";
    // const shouldAutoLogin = isDevelopment || skipEmailConfirmation;

    const shouldAutoLogin = true; // Tymczasowo wyłączone
    const signInError: any = null;

    // Profil użytkownika zostanie utworzony automatycznie przez trigger w bazie danych
    // ale sprawdzimy czy się udało
    const { data: userProfile } = await supabase.from("users").select("*").eq("id", data.user.id).single();

    // Jeśli użytkownik ma rolę tutor, dodaj go do tabeli teachers
    if (role === "tutor") {
      const { error: teacherError } = await supabase.from("teachers").insert({
        teacher_id: data.user.id,
        bio: null,
        description: null,
        lessons_completed: 0,
        lessons_planned: 0,
      });

      if (teacherError) {
        console.error("Error creating teacher profile:", teacherError);
        // Nie przerywamy procesu rejestracji, ale logujemy błąd
      }
    }

    // Jeśli użytkownik ma rolę student i podał teacherId, dodaj relację
    if (role === "student" && teacherId) {
      const { error: relationError } = await supabase.from("teacher_students").insert({
        teacher_id: teacherId,
        student_id: data.user.id,
        lessons_completed: 0,
        lessons_reserved: 0,
      });

      if (relationError) {
        console.error("Error creating teacher-student relation:", relationError);
        // Nie przerywamy procesu rejestracji, ale logujemy błąd
      }
    }

    // Sprawdź czy automatyczne logowanie się udało
    const isAutoLoggedIn = shouldAutoLogin && !signInError;

    return createSuccessResponse(
      {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: role,
          firstName: firstName,
          lastName: lastName,
          emailConfirmed: data.user.email_confirmed_at !== null,
        },
        message: "Konto zostało utworzone pomyślnie. Możesz się teraz zalogować.",
        requiresEmailConfirmation: false, // Tymczasowo wyłączone dla dev
      },
      201
    );
  } catch (error) {
    console.error("Register API error:", error);
    return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR);
  }
};
