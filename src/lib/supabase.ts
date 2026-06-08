import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pfojdqlvbvqthelrskse.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmb2pkcWx2YnZxdGhlbHJza3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzQ2MTEsImV4cCI6MjA5NjUxMDYxMX0.Sen4PkHDQCGxWkVk61re6bJJ1yITXpKLxAAxQ7A-seY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});