import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin yetkisine sahip Supabase client (Service Role Key kullanır)
// Bu client RLS (Row Level Security) kurallarını bypass eder
const globalForSupabaseAdmin = globalThis as unknown as {
  supabaseAdmin: SupabaseClient | undefined;
};

export const supabaseAdmin =
  globalForSupabaseAdmin.supabaseAdmin ??
  createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabaseAdmin.supabaseAdmin = supabaseAdmin;
}
