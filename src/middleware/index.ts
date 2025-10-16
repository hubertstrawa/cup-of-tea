import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client.ts";
import type { AuthUser } from "../env.d.ts";

// Publiczne ścieżki - strony auth i API endpoints
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth-demo",
  '/booking',
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/session",
  "/api/auth/user",
  // Public API endpoints
  "/api/public",
  // Static assets
  "/favicon.png",
  "/_astro",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Utworzenie SSR-compatible Supabase instance
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Dodanie supabase do locals dla kompatybilności wstecznej
  locals.supabase = supabase;

  // Sprawdzenie czy ścieżka jest publiczna
  const isPublicPath = PUBLIC_PATHS.some((path) => url.pathname.startsWith(path));

  if (isPublicPath) {
    return next();
  }

  // WAŻNE: Zawsze pobierz sesję użytkownika przed innymi operacjami
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Pobranie profilu użytkownika z bazy danych
    const { data: userProfile, error } = await supabase.from("users").select("*").eq("id", user.id).single();

    console.log('Middleware - user:', user.id, 'userProfile:', userProfile, 'error:', error);

    if (userProfile && !error) {
      // Utworzenie obiektu AuthUser
      const authUser: AuthUser = {
        id: userProfile.id,
        email: user.email || "",
        role: userProfile.role === "tutor" ? "tutor" : "student",
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        emailConfirmed: user.email_confirmed_at !== null,
        lastLoginAt: userProfile.last_login_at || undefined,
      };

      locals.user = authUser;
      locals.session = { user };

      // Aktualizacja last_login_at
      await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
    } else {
      console.log('Middleware - No user profile found or error occurred, redirecting to login');
      return redirect("/login");
    }
  } else {
    console.log('Middleware - No authenticated user, redirecting to login');
    // Przekierowanie do logowania dla chronionych tras
    return redirect("/login");
  }

  return next();
});
