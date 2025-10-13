import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client.ts';
import { ResetPasswordSchema } from '../../../lib/validation/auth.schemas.ts';
import { mapSupabaseError, createErrorResponse, createSuccessResponse, AUTH_ERRORS } from '../../../lib/utils/auth-errors.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parsowanie danych z formularza
    const body = await request.json();
    
    // Walidacja danych wejściowych
    const validationResult = ResetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(AUTH_ERRORS.VALIDATION_ERROR, 
        validationResult.error.errors.map(e => e.message).join(', ')
      );
    }

    const { password } = validationResult.data;

    // Utworzenie SSR Supabase instance
    const supabase = createSupabaseServerInstance({ 
      cookies, 
      headers: request.headers 
    });

    // Sprawdzenie czy użytkownik jest zalogowany (ma ważny token resetowania)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return createErrorResponse(AUTH_ERRORS.INVALID_RESET_TOKEN);
    }

    // Aktualizacja hasła
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      const mappedError = mapSupabaseError(error.message);
      return createErrorResponse(mappedError);
    }

    return createSuccessResponse({
      message: 'Hasło zostało zmienione pomyślnie. Możesz się teraz zalogować.'
    });

  } catch (error) {
    console.error('Reset password API error:', error);
    return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR);
  }
};
