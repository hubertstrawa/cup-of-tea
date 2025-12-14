import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from "../lib/validation/auth.schemas";
import { authService } from "../lib/services/auth.service";

type AuthMode = "login" | "register" | "forgot-password" | "reset-password";

interface BaseAuthFormProps {
  isLoading?: boolean;
  error?: string;
}

interface LoginFormProps extends BaseAuthFormProps {
  mode: "login";
  redirectUrl?: string;
}

interface RegisterFormProps extends BaseAuthFormProps {
  mode: "register";
  teacherId?: string;
}

interface ForgotPasswordFormProps extends BaseAuthFormProps {
  mode: "forgot-password";
}

interface ResetPasswordFormProps extends BaseAuthFormProps {
  mode: "reset-password";
}

type AuthFormProps = LoginFormProps | RegisterFormProps | ForgotPasswordFormProps | ResetPasswordFormProps;

const getFormConfig = (mode: AuthMode, teacherName?: string) => {
  switch (mode) {
    case "login":
      return {
        title: "Zaloguj się",
        description: "Wprowadź swoje dane aby się zalogować",
        submitText: "Zaloguj się",
      };
    case "register":
      return {
        title: "Utwórz konto",
        description: teacherName
          ? `Wypełnij formularz aby utworzyć nowe konto jako uczeń ${teacherName.toUpperCase()}`
          : "Wypełnij formularz aby utworzyć nowe konto jako lektor",
        submitText: "Utwórz konto",
      };
    case "forgot-password":
      return {
        title: "Odzyskaj hasło",
        description: "Wprowadź adres e-mail aby otrzymać link do resetowania hasła",
        submitText: "Wyślij link",
      };
    case "reset-password":
      return {
        title: "Ustaw nowe hasło",
        description: "Wprowadź nowe hasło dla swojego konta",
        submitText: "Zmień hasło",
      };
  }
};

// Komponent dla logowania
const LoginForm: React.FC<LoginFormProps> = ({ isLoading: externalLoading = false, error, redirectUrl }) => {
  const config = getFormConfig("login");
  const [submitError, setSubmitError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setSubmitError("");
      setIsLoading(true);

      const response = await authService.login(data);

      // Client-side redirect po udanym logowaniu
      if (response.user) {
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          authService.redirectAfterLogin(response.user.role);
        }
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || externalLoading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{config.title}</CardTitle>
        <CardDescription className="text-center">{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adres e-mail</Label>
            <Input id="email" type="email" placeholder="twoj@email.com" {...register("email")} disabled={loading} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} disabled={loading} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {(error || submitError) && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error || submitError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ładowanie..." : config.submitText}
          </Button>

          <div className="space-y-2 text-center text-sm">
            <div>
              <a href="/forgot-password" className="text-blue-600 hover:text-blue-800 hover:underline">
                Zapomniałeś hasła?
              </a>
            </div>
            <div>
              Nie masz konta?{" "}
              <a href="/register" className="text-blue-600 hover:text-blue-800 hover:underline">
                Zarejestruj się
              </a>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Komponent dla rejestracji
const RegisterForm: React.FC<RegisterFormProps> = ({ teacherId, isLoading: externalLoading = false, error }) => {
  const [teacher, setTeacher] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    teachers: { bio: string | null; description: string | null; lessons_completed: number }[];
  } | null>(null);

  const config = getFormConfig("register", teacher ? `${teacher.first_name} ${teacher.last_name}` : undefined);

  const [submitError, setSubmitError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      role: teacherId ? "student" : "tutor",
      ...(teacherId && { teacherId }),
    },
  });

  // Funkcja do pobierania pojedynczego nauczyciela
  const fetchTeacher = React.useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Expected JSON, got: ${contentType}. Response: ${text.substring(0, 100)}`);
      }

      const data = await res.json();

      if (data.success) {
        setTeacher(data.data);
      } else {
        setTeacher(null);
      }
    } catch {
      setTeacher(null);
    }
  }, []);

  // Pobierz informacje o nauczycielu gdy teacherId jest obecne
  React.useEffect(() => {
    if (teacherId) {
      fetchTeacher(teacherId);
    }
  }, [teacherId, fetchTeacher]);

  const handleFormSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitError("");
      setIsLoading(true);

      const response = await authService.register(data);

      // Client-side redirect po udanej rejestracji
      authService.redirectAfterRegister(response.requiresEmailConfirmation);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || externalLoading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{config.title}</CardTitle>
        <CardDescription className="text-center">{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adres e-mail</Label>
            <Input id="email" type="email" placeholder="twoj@email.com" {...register("email")} disabled={loading} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} disabled={loading} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              disabled={loading}
            />
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Imię</Label>
              <Input id="firstName" placeholder="Jan" {...register("firstName")} disabled={loading} />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input id="lastName" placeholder="Kowalski" {...register("lastName")} disabled={loading} />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          {teacherId && <input type="hidden" {...register("teacherId")} value={teacherId} />}

          {(error || submitError) && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error || submitError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ładowanie..." : config.submitText}
          </Button>

          <div className="space-y-2 text-center text-sm">
            <div>
              Masz już konto?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                Zaloguj się
              </a>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Komponent dla odzyskiwania hasła
const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ isLoading: externalLoading = false, error }) => {
  const config = getFormConfig("forgot-password");
  const [submitError, setSubmitError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setSubmitError("");
      setIsLoading(true);
      //const response =
      await authService.forgotPassword(data);
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || externalLoading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{config.title}</CardTitle>
        <CardDescription className="text-center">{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              Link do resetowania hasła został wysłany na Twój adres e-mail.
            </div>
            <div className="text-center">
              <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                Powrót do logowania
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adres e-mail</Label>
              <Input id="email" type="email" placeholder="twoj@email.com" {...register("email")} disabled={loading} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {(error || submitError) && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error || submitError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled /* ={loading}*/ name="forgot-password">
              {loading ? "Ładowanie..." : ` ${config.submitText} (niedostępne w MVP)`}
            </Button>

            <div className="space-y-2 text-center text-sm">
              <div>
                <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Powrót do logowania
                </a>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

// Komponent dla resetowania hasła
const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ isLoading: externalLoading = false, error }) => {
  const config = getFormConfig("reset-password");
  const [submitError, setSubmitError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    try {
      setSubmitError("");
      setIsLoading(true);

      // const response =
      await authService.resetPassword(data);
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || externalLoading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{config.title}</CardTitle>
        <CardDescription className="text-center">{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              Hasło zostało zmienione pomyślnie. Możesz się teraz zalogować.
            </div>
            <div className="text-center">
              <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                Przejdź do logowania
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nowe hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={loading}
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                disabled={loading}
              />
              {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {(error || submitError) && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error || submitError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ładowanie..." : config.submitText}
            </Button>

            <div className="space-y-2 text-center text-sm">
              <div>
                <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Powrót do logowania
                </a>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

// Główny komponent AuthForm
export const AuthForm: React.FC<AuthFormProps> = (props) => {
  switch (props.mode) {
    case "login":
      return <LoginForm {...props} />;
    case "register":
      return <RegisterForm {...props} />;
    case "forgot-password":
      return <ForgotPasswordForm {...props} />;
    case "reset-password":
      return <ResetPasswordForm {...props} />;
    default:
      return null;
  }
};
