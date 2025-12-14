import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
  role: "tutor" | "student";
  firstName: string;
  lastName: string;
  emailConfirmed: boolean;
  lastLoginAt?: string;
  profileCreatedAt?: string;
}

interface UserStats {
  lessonsCount: number;
  studentsCount: number;
}

interface UserResponse {
  user: User;
  stats: UserStats;
  metadata: Record<string, unknown>;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (isMounted = true) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/user", {
        method: "GET",
        credentials: "same-origin", // Zapewnia wysyłanie cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Przekierowanie do logowania przy braku autoryzacji
          window.location.href = "/login";
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UserResponse = await response.json();

      if (isMounted) {
        setUser(data.user);
        setStats(data.stats);
        setError(null);
      }
    } catch (err) {
      if (isMounted) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // Wyczyść dane przy błędzie autoryzacji
        setUser(null);
        setStats(null);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

  const refreshUser = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    let isMounted = true;

    fetchUser(isMounted);

    return () => {
      isMounted = false;
    };
  }, [fetchUser]);

  return {
    user,
    stats,
    loading,
    error,
    refreshUser,
  };
}
