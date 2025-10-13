import React, { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  role: "teacher" | "student";
  firstName: string;
  lastName: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "teacher" | "student";
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
  redirectTo = "/login",
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // TODO: Implementacja sprawdzania autentykacji przez Supabase Auth
      // const { data: { session } } = await supabase.auth.getSession();
      //
      // if (!session) {
      //   setUser(null);
      //   setLoading(false);
      //   return;
      // }
      //
      // // Pobranie profilu użytkownika
      // const { data: userProfile, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('id', session.user.id)
      //   .single();
      //
      // if (error || !userProfile) {
      //   setError('Nie można pobrać profilu użytkownika');
      //   setUser(null);
      // } else {
      //   setUser(userProfile);
      // }

      // Tymczasowe zachowanie dla demonstracji
      // Symulacja zalogowanego użytkownika
      setTimeout(() => {
        const mockUser: User = {
          id: "demo-user-id",
          email: "demo@example.com",
          role: "teacher",
          firstName: "Jan",
          lastName: "Kowalski",
        };
        setUser(mockUser);
        setLoading(false);
      }, 1000);
    } catch {
      // Auth check error handling
      setError("Wystąpił błąd podczas sprawdzania autentykacji");
      setUser(null);
    } finally {
      // setLoading(false); // Odkomentować po implementacji prawdziwej autentykacji
    }
  };

  // Komponent ładowania
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sprawdzanie autentykacji...</p>
        </div>
      </div>
    );
  }

  // Błąd autentykacji
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Błąd autentykacji</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={() => (window.location.href = redirectTo)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Przejdź do logowania
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Użytkownik nie jest zalogowany
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Przekierowanie do strony logowania
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Przekierowywanie do logowania...</p>
          <a href={redirectTo} className="text-blue-600 hover:text-blue-800 underline">
            Kliknij tutaj, jeśli przekierowanie nie działa
          </a>
        </div>
      </div>
    );
  }

  // Sprawdzenie wymaganej roli
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg
              className="h-12 w-12 text-yellow-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Brak uprawnień</h3>
            <p className="text-sm text-yellow-600 mb-4">
              Ta strona jest dostępna tylko dla użytkowników z rolą: {requiredRole === "teacher" ? "Lektor" : "Uczeń"}
            </p>
            <p className="text-xs text-yellow-600 mb-4">Twoja rola: {user.role === "teacher" ? "Lektor" : "Uczeń"}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Powrót
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Użytkownik ma odpowiednie uprawnienia - renderuj zawartość
  return <>{children}</>;
};
