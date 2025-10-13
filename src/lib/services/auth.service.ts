// Client-side serwis do komunikacji z API autentykacji
import type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "../validation/auth.schemas.ts";

export interface AuthResponse {
  user?: {
    id: string;
    email: string;
    role: "tutor" | "student";
    firstName: string;
    lastName: string;
    emailConfirmed: boolean;
  };
  message: string;
  requiresEmailConfirmation?: boolean;
}

export interface AuthError {
  error: string;
  code: string;
  details?: string;
}

class AuthService {
  private async makeRequest(endpoint: string, data: any): Promise<AuthResponse> {
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Wystąpił błąd");
    }

    return result;
  }

  async login(data: LoginFormData): Promise<AuthResponse> {
    return this.makeRequest("login", data);
  }

  async register(data: RegisterFormData): Promise<AuthResponse> {
    return this.makeRequest("register", data);
  }

  async logout(): Promise<{ message: string }> {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Wystąpił błąd podczas wylogowania");
    }

    return result;
  }

  async forgotPassword(data: ForgotPasswordFormData): Promise<{ message: string }> {
    return this.makeRequest("forgot-password", data);
  }

  async resetPassword(data: ResetPasswordFormData): Promise<{ message: string }> {
    return this.makeRequest("reset-password", data);
  }

  async getSession(): Promise<AuthResponse> {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Nie udało się pobrać sesji");
    }

    return result;
  }

  async getUser(): Promise<AuthResponse> {
    const response = await fetch("/api/auth/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Nie udało się pobrać danych użytkownika");
    }

    return result;
  }

  // Helper do przekierowania po udanym logowaniu
  redirectAfterLogin(userRole: "tutor" | "student") {
    // Zgodnie z user story US-001: lektor po logowaniu widzi pulpit zarządzania kalendarzem
    if (userRole === "tutor") {
      window.location.href = "/dashboard";
    } else {
      // Uczeń również idzie do dashboard, ale będzie miał inny widok
      window.location.href = "/dashboard";
    }
  }

  // Helper do przekierowania po udanej rejestracji
  redirectAfterRegister(requiresEmailConfirmation = false) {
    if (requiresEmailConfirmation) {
      // Przekierowanie do strony informującej o konieczności potwierdzenia email
      window.location.href = "/login?message=confirm-email";
    } else {
      window.location.href = "/dashboard";
    }
  }
}

export const authService = new AuthService();
