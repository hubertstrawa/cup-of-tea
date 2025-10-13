import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu e-mail." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." }),
});

export const RegisterSchema = z
  .object({
    email: z.string().email({ message: "Nieprawidłowy format adresu e-mail." }),
    password: z.string().min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
    confirmPassword: z.string(),
    firstName: z.string().min(2, { message: "Imię musi mieć co najmniej 2 znaki." }),
    lastName: z.string().min(2, { message: "Nazwisko musi mieć co najmniej 2 znaki." }),
    role: z.enum(["tutor", "student"], { message: "Wybierz rolę." }),
    teacherId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są takie same.",
    path: ["confirmPassword"],
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu e-mail." }),
});

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są takie same.",
    path: ["confirmPassword"],
  });

// Typy dla formularzy
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;
