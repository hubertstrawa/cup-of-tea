import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const DEFAULT_USER_ID = "f3c2294c-ff40-4a66-84e4-becf0cf5b623";

export type SupabaseClient = BaseSupabaseClient<Database>;
