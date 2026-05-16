import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bidfpqesosupxghncabk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1DenLNx4T2AA-8yBj3DP2w_S9EZb3xV";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
