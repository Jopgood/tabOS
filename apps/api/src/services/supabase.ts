import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@tabos/supabase/types";

export async function createClient() {
  return createSupabaseClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );
}
