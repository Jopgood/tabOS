import type { Database } from "@tabos/supabase/types";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createClient() {
  return createSupabaseClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}
