import { createClient } from "@supabase/supabase-js";

// External Supabase project (publishable anon key — safe in frontend, protected by RLS).
// Configuration-only correction for the identified replication release.
// Original deployment configuration is preserved locally in the downloaded archive.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey);

export type Player = {
  id: string;
  email: string;
  name: string;
  score: number;
  current_level: string;
  current_session: string;
  completed_quiz_ids: string[];
  total_correct: number;
};
