/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types.ts";

// Typy dla użytkownika z auth
export interface AuthUser {
  id: string;
  email: string;
  role: "tutor" | "student";
  firstName: string;
  lastName: string;
  emailConfirmed: boolean;
  lastLoginAt?: string;
}

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: AuthUser;
      session?: any;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
