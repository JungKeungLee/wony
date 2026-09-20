import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** .env.local에 실제 Supabase 프로젝트 값이 채워졌는지 여부 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * anon key만 사용하는 브라우저용 Supabase client.
 * service_role key는 절대 이 프로젝트 코드에 포함하지 않는다.
 * 값이 비어 있어도 앱이 죽지 않도록 placeholder로 대체하고,
 * 실제 호출 여부는 isSupabaseConfigured로 먼저 확인한다.
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
