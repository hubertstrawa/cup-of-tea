import React, { useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "./hooks/use-toast";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "outline",
  size = "default",
  className = "",
  children = "Wyloguj się",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Błąd podczas wylogowania");
      }

      toast({
        title: "Wylogowanie zakończone sukcesem",
        description: "Zostaniesz przekierowany do strony logowania",
      });

      // Przekierowanie po wylogowaniu
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      toast({
        title: "Błąd wylogowania",
        description: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Wylogowywanie..." : children}
    </Button>
  );
};
