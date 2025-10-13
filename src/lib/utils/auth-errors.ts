// Zunifikowany system komunikatów błędów dla autentykacji
// Używany zarówno po stronie server-side (Astro) jak i client-side (React)

export interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}

export const AUTH_ERRORS = {
  // Błędy logowania
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "Nieprawidłowy e-mail lub hasło.",
    statusCode: 401,
  },
  EMAIL_NOT_CONFIRMED: {
    code: "EMAIL_NOT_CONFIRMED",
    message: "Potwierdź swój adres e-mail przed zalogowaniem.",
    statusCode: 401,
  },
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "Nie znaleziono użytkownika z tym adresem e-mail.",
    statusCode: 404,
  },

  // Błędy rejestracji
  EMAIL_ALREADY_EXISTS: {
    code: "EMAIL_ALREADY_EXISTS",
    message: "Adres e-mail jest już zajęty.",
    statusCode: 409,
  },
  WEAK_PASSWORD: {
    code: "WEAK_PASSWORD",
    message: "Hasło nie spełnia wymagań bezpieczeństwa.",
    statusCode: 400,
  },
  INVALID_INVITATION_TOKEN: {
    code: "INVALID_INVITATION_TOKEN",
    message: "Link zaproszeniowy jest nieprawidłowy lub wygasł.",
    statusCode: 400,
  },

  // Błędy resetowania hasła
  PASSWORD_RESET_FAILED: {
    code: "PASSWORD_RESET_FAILED",
    message: "Nie udało się wysłać linku do resetowania hasła.",
    statusCode: 400,
  },
  INVALID_RESET_TOKEN: {
    code: "INVALID_RESET_TOKEN",
    message: "Link do resetowania hasła jest nieprawidłowy lub wygasł.",
    statusCode: 400,
  },

  // Błędy ogólne
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "Problem z połączeniem. Spróbuj ponownie.",
    statusCode: 500,
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Brak uprawnień do wykonania tej operacji.",
    statusCode: 401,
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "Dostęp zabroniony.",
    statusCode: 403,
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Wystąpił błąd serwera. Spróbuj ponownie później.",
    statusCode: 500,
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Dane formularza zawierają błędy.",
    statusCode: 400,
  },
} as const;

// Mapowanie błędów Supabase na nasze błędy
export const mapSupabaseError = (supabaseError: string): AuthError => {
  switch (supabaseError) {
    case "Invalid login credentials":
      return AUTH_ERRORS.INVALID_CREDENTIALS;
    case "Email not confirmed":
      return AUTH_ERRORS.EMAIL_NOT_CONFIRMED;
    case "User already registered":
      return AUTH_ERRORS.EMAIL_ALREADY_EXISTS;
    case "Password should be at least 6 characters":
      return AUTH_ERRORS.WEAK_PASSWORD;
    case "User not found":
      return AUTH_ERRORS.USER_NOT_FOUND;
    default:
      return AUTH_ERRORS.INTERNAL_ERROR;
  }
};

// Helper do tworzenia error response dla API
export const createErrorResponse = (error: AuthError, details?: string) => {
  return new Response(
    JSON.stringify({
      error: error.message,
      code: error.code,
      details: details || null,
    }),
    {
      status: error.statusCode,
      headers: { "Content-Type": "application/json" },
    }
  );
};

// Helper do tworzenia success response dla API
export const createSuccessResponse = (data: any, statusCode = 200) => {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
};
