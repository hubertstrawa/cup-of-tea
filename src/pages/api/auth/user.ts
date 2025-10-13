import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client.ts';
import { createErrorResponse, createSuccessResponse, AUTH_ERRORS } from '../../../lib/utils/auth-errors.ts';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Utworzenie SSR Supabase instance
    const supabase = createSupabaseServerInstance({ 
      cookies, 
      headers: request.headers 
    });

    // Pobranie aktualnego użytkownika
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return createErrorResponse(AUTH_ERRORS.UNAUTHORIZED);
    }

    // Pobranie pełnego profilu użytkownika
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return createErrorResponse(AUTH_ERRORS.USER_NOT_FOUND);
    }

    // Dla lektorów - pobranie liczby uczniów
    let studentsCount = 0;
    if (userProfile.role === 'lektor') {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'uczeń');
      
      studentsCount = count || 0;
    }

    // Pobranie statystyk lekcji
    const { count: lessonsCount } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .or(
        userProfile.role === 'lektor' 
          ? `teacher_id.eq.${user.id}` 
          : `student_id.eq.${user.id}`
      );

    return createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        role: userProfile.role === 'lektor' ? 'teacher' : 'student',
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        emailConfirmed: user.email_confirmed_at !== null,
        lastLoginAt: userProfile.last_login_at,
        profileCreatedAt: userProfile.profile_created_at,
      },
      stats: {
        lessonsCount: lessonsCount || 0,
        studentsCount: studentsCount,
      },
      metadata: userProfile.metadata || {}
    });

  } catch (error) {
    console.error('User API error:', error);
    return createErrorResponse(AUTH_ERRORS.INTERNAL_ERROR);
  }
};
