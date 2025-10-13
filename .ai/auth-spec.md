# Specyfikacja Techniczna Systemu Autentykacji - Cup of Tea

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Struktura Stron i Komponentów

#### Strony Autentykacji (Astro)
- **`/src/pages/login.astro`** - Strona logowania (już istnieje)
  - Wykorzystuje istniejący layout `Layout.astro`
  - Renderuje komponent `AuthForm` w trybie "login"
  - Zawiera linki nawigacyjne do rejestracji
  - Konfiguracja: `export const prerender = false`

- **`/src/pages/register.astro`** - Strona rejestracji (już istnieje)
  - Analogiczna struktura do strony logowania
  - Renderuje komponent `AuthForm` w trybie "register"
  - Obsługuje rejestrację lektorów i uczniów przez linki zaproszeniowe

- **`/src/pages/forgot-password.astro`** - Nowa strona odzyskiwania hasła
  - Formularz z polem email
  - Integracja z Supabase Auth resetPassword
  - Komunikaty o wysłaniu linku resetującego

- **`/src/pages/reset-password.astro`** - Nowa strona resetowania hasła
  - Formularz z nowymi hasłami
  - Walidacja tokenu z URL
  - Integracja z Supabase Auth updateUser

#### Komponenty React

**`AuthForm.tsx` (już istnieje, wymaga rozszerzenia)**
- Tryby: "login", "register", "forgot-password", "reset-password"
- Wykorzystuje react-hook-form z zodResolver
- Integracja z Supabase Auth
- Obsługa stanów ładowania i błędów
- Walidacja w czasie rzeczywistym

**Nowe komponenty do utworzenia:**
- **`ProtectedRoute.tsx`** - Wrapper dla chronionych tras
- **`AuthGuard.tsx`** - Komponent sprawdzający stan autentykacji
- **`UserProfile.tsx`** - Komponent profilu użytkownika
- **`LogoutButton.tsx`** - Przycisk wylogowania

### 1.2 Rozdzielenie Odpowiedzialności

#### Strony Astro (Server-Side)
- Renderowanie struktury HTML
- Sprawdzanie stanu autentykacji na serwerze
- Przekierowania na podstawie stanu użytkownika
- Dostarczanie danych kontekstowych (np. lista lektorów)
- Obsługa middleware autentykacji

#### Komponenty React (Client-Side)
- Interaktywne formularze z walidacją
- Zarządzanie stanem lokalnym formularzy
- Komunikacja z API Supabase Auth
- Obsługa błędów i komunikatów użytkownika
- Nawigacja po udanej autentykacji

### 1.3 Walidacja i Komunikaty Błędów

#### Schematy Walidacji (rozszerzenie istniejących)
```typescript
// src/lib/validation/auth.schemas.ts
export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu e-mail." })
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są takie same.",
  path: ["confirmPassword"]
});
```

#### Komunikaty Błędów
- **Logowanie**: "Nieprawidłowy e-mail lub hasło", "Konto nie zostało potwierdzone"
- **Rejestracja**: "Adres e-mail jest już zajęty", "Hasło nie spełnia wymagań"
- **Reset hasła**: "Nie znaleziono konta z tym adresem e-mail"
- **Błędy sieciowe**: "Problem z połączeniem. Spróbuj ponownie."

### 1.4 Scenariusze Użycia

#### Rejestracja Lektora
1. Lektor wypełnia formularz rejestracyjny
2. System waliduje dane i tworzy konto w Supabase Auth
3. Wysyłany jest email potwierdzający
4. Po potwierdzeniu, tworzony jest profil w tabeli `users`
5. Przekierowanie do dashboardu

#### Rejestracja Ucznia przez Link
1. Uczeń klika link zaproszeniowy z `teacherId` w parametrach
2. Formularz automatycznie ustawia wybranego lektora
3. Proces rejestracji analogiczny do lektora
4. Powiązanie z lektorem w tabeli `users`

#### Logowanie
1. Użytkownik wprowadza dane logowania
2. Walidacja przez Supabase Auth
3. Sprawdzenie stanu potwierdzenia konta
4. Przekierowanie do odpowiedniej sekcji aplikacji

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura Endpointów API

#### Nowe endpointy autentykacji
```
POST /api/auth/register
POST /api/auth/login  
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/session
GET  /api/auth/user
```

#### Istniejące endpointy do zabezpieczenia
```
GET    /api/dates (wymaga autentykacji)
POST   /api/dates (wymaga autentykacji + rola lektora)
PUT    /api/dates/[id] (wymaga autentykacji + własność zasobu)
DELETE /api/dates/[id] (wymaga autentykacji + własność zasobu)
```

### 2.2 Modele Danych

#### Rozszerzenie istniejących typów
```typescript
// src/types.ts - dodanie nowych typów
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  emailConfirmed: boolean;
  lastLoginAt?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface InvitationLink {
  teacherId: string;
  token: string;
  expiresAt: string;
}
```

### 2.3 Walidacja Danych Wejściowych

#### Middleware walidacji
```typescript
// src/middleware/auth.middleware.ts
export const authMiddleware = defineMiddleware(async (context, next) => {
  const { supabase } = context.locals;
  
  // Sprawdzenie sesji użytkownika
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Pobranie profilu użytkownika z bazy danych
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    context.locals.user = userProfile;
    context.locals.session = session;
  }
  
  return next();
});
```

### 2.4 Obsługa Wyjątków

#### Rozszerzenie ErrorHandler
```typescript
// src/lib/utils/error-handler.ts - dodanie metod autentykacji
export class AuthErrorHandler extends ErrorHandler {
  handleAuthError(error: AuthError): Response {
    switch (error.message) {
      case 'Invalid login credentials':
        return this.createErrorResponse(401, 'Nieprawidłowe dane logowania');
      case 'Email not confirmed':
        return this.createErrorResponse(401, 'Potwierdź swój adres e-mail');
      case 'User already registered':
        return this.createErrorResponse(409, 'Użytkownik już istnieje');
      default:
        return this.createErrorResponse(500, 'Błąd autentykacji');
    }
  }
}
```

### 2.5 Server-Side Rendering

#### Aktualizacja renderowania stron
```typescript
// Przykład zabezpieczenia strony dashboard
// src/pages/dashboard/index.astro
---
import { redirect } from 'astro:response';

const { supabase } = Astro.locals;
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  return redirect('/login');
}

const { data: userProfile } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.user.id)
  .single();

if (!userProfile) {
  return redirect('/login');
}
---
```

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja z Supabase Auth

#### Konfiguracja klienta
```typescript
// src/lib/auth/supabase-auth.service.ts
export class SupabaseAuthService {
  constructor(private supabase: SupabaseClient) {}

  async signUp(userData: RegisterViewModel): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          teacher_id: userData.teacherId
        }
      }
    });
    
    if (error) throw new AuthError(error.message);
    
    // Utworzenie profilu w tabeli users
    if (data.user) {
      await this.createUserProfile(data.user, userData);
    }
    
    return { user: data.user, session: data.session };
  }

  async signIn(credentials: LoginViewModel): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    
    if (error) throw new AuthError(error.message);
    return { user: data.user, session: data.session };
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new AuthError(error.message);
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw new AuthError(error.message);
  }
}
```

### 3.2 Zarządzanie Sesjami

#### Session Provider
```typescript
// src/lib/auth/session-provider.tsx
export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pobieranie aktualnej sesji
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Nasłuchiwanie zmian stanu autentykacji
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
};
```

### 3.3 Middleware Autentykacji

#### Rozszerzenie istniejącego middleware
```typescript
// src/middleware/index.ts - aktualizacja
import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;
  
  // Sprawdzenie sesji użytkownika
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (session) {
    // Pobranie profilu użytkownika
    const { data: userProfile } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    context.locals.user = userProfile;
    context.locals.session = session;
  }
  
  // Sprawdzenie czy strona wymaga autentykacji
  const protectedRoutes = ['/dashboard', '/api/dates'];
  const isProtectedRoute = protectedRoutes.some(route => 
    context.url.pathname.startsWith(route)
  );
  
  if (isProtectedRoute && !session) {
    return context.redirect('/login');
  }
  
  return next();
});
```

### 3.4 Generowanie Linków Zaproszeniowych

#### Serwis linków zaproszeniowych
```typescript
// src/lib/services/invitation.service.ts
export class InvitationService {
  constructor(private supabase: SupabaseClient) {}

  async generateInvitationLink(teacherId: string): Promise<string> {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dni ważności

    // Zapisanie tokenu w bazie danych
    await this.supabase
      .from('invitation_tokens')
      .insert({
        teacher_id: teacherId,
        token,
        expires_at: expiresAt.toISOString()
      });

    return `${process.env.SITE_URL}/register?token=${token}`;
  }

  async validateInvitationToken(token: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('invitation_tokens')
      .select('teacher_id, expires_at')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (!data || new Date(data.expires_at) < new Date()) {
      return null;
    }

    return data.teacher_id;
  }
}
```

### 3.5 Zabezpieczenie API

#### Guard dla endpointów API
```typescript
// src/lib/auth/api-guards.ts
export const requireAuth = (handler: APIRoute): APIRoute => {
  return async (context) => {
    const { session } = context.locals;
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return handler(context);
  };
};

export const requireRole = (role: UserRole) => (handler: APIRoute): APIRoute => {
  return async (context) => {
    const { user } = context.locals;
    
    if (!user || user.role !== role) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return handler(context);
  };
};
```

## 4. KLUCZOWE KOMPONENTY I MODUŁY

### 4.1 Serwisy
- **`SupabaseAuthService`** - Główny serwis autentykacji
- **`InvitationService`** - Zarządzanie linkami zaproszeniowymi  
- **`UserProfileService`** - Zarządzanie profilami użytkowników
- **`SessionService`** - Zarządzanie sesjami użytkowników

### 4.2 Middleware
- **`authMiddleware`** - Sprawdzanie stanu autentykacji
- **`roleMiddleware`** - Kontrola dostępu na podstawie ról
- **`sessionMiddleware`** - Zarządzanie sesjami

### 4.3 Komponenty UI
- **`AuthForm`** - Uniwersalny formularz autentykacji
- **`ProtectedRoute`** - Wrapper dla chronionych tras
- **`SessionProvider`** - Provider kontekstu sesji
- **`UserMenu`** - Menu użytkownika z opcjami profilu

### 4.4 Kontrakty API
- **`AuthResult`** - Wynik operacji autentykacji
- **`UserProfile`** - Profil użytkownika
- **`SessionData`** - Dane sesji użytkownika
- **`InvitationToken`** - Token zaproszeniowy

Ta specyfikacja zapewnia kompleksowy system autentykacji zgodny z wymaganiami PRD, wykorzystujący Supabase Auth w połączeniu z Astro i React, zachowując spójność z istniejącą architekturą aplikacji.
