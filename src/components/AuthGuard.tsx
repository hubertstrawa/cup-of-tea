import React, { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  role: "tutor" | "student";
  firstName: string;
  lastName: string;
}

interface AuthGuardProps {
  children: (user: User | null, loading: boolean) => React.ReactNode;
  onAuthChange?: (user: User | null) => void;
}

/**
 * AuthGuard - komponent sprawdzający stan autentykacji i przekazujący go do children
 * Używany jako render prop pattern dla większej elastyczności
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, onAuthChange }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // TODO: Nasłuchiwanie zmian stanu autentykacji
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     if (session) {
    //       await loadUserProfile(session.user.id);
    //     } else {
    //       setUser(null);
    //       setLoading(false);
    //     }
    //   }
    // );

    // return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(user);
    }
  }, [user, onAuthChange]);

  const checkAuth = async () => {
    try {
      // TODO: Implementacja sprawdzania autentykacji przez Supabase Auth
      // const { data: { session } } = await supabase.auth.getSession();
      //
      // if (session) {
      //   await loadUserProfile(session.user.id);
      // } else {
      //   setUser(null);
      //   setLoading(false);
      // }

      // Tymczasowe zachowanie dla demonstracji
      setTimeout(() => {
        // Symulacja sprawdzenia sesji
        const hasSession = Math.random() > 0.3; // 70% szans na zalogowanego użytkownika

        if (hasSession) {
          const mockUser: User = {
            id: "demo-user-id",
            email: "demo@example.com",
            role: Math.random() > 0.5 ? "tutor" : "student",
            firstName: "Jan",
            lastName: "Kowalski",
          };
          setUser(mockUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // TODO: Implementacja pobierania profilu użytkownika
      // const { data: userProfile, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('id', userId)
      //   .single();
      //
      // if (error) {
      //   console.error('Error loading user profile:', error);
      //   setUser(null);
      // } else {
      //   setUser(userProfile);
      // }

      // Tymczasowe zachowanie
      const mockUser: User = {
        id: userId,
        email: "demo@example.com",
        role: "tutor",
        firstName: "Jan",
        lastName: "Kowalski",
      };
      setUser(mockUser);
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return <>{children(user, loading)}</>;
};
