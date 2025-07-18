import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

export type Client = SupabaseClient<Database>;

export * from "./database.types";
