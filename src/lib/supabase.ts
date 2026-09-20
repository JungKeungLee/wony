import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** 두 환경변수가 모두 채워졌는지 여부 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

/**
 * 어떤 환경변수가 비어 있는지 알려준다. 배포 환경에서 "Supabase가 아직
 * 설정되지 않았습니다" 메시지가 뜰 때, 대시보드에 값을 넣어뒀는데도 왜
 * 안 되는지 화면에서 바로 원인을 알 수 있도록 하기 위한 진단용이다.
 *
 * NEXT_PUBLIC_* 값은 next build 시점에 클라이언트 번들에 고정되므로,
 * 이 목록이 비어있지 않다면 (1) Vercel Dashboard의 값이 실제로는 비어있거나
 * 오타가 있거나, (2) 값을 추가/수정한 뒤 재배포하지 않아서 그 이전 빌드가
 * 아직도 서비스되고 있는 것이다. 로컬 .env.local과는 무관하다.
 */
export function getMissingSupabaseEnvVars(): string[] {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabasePublishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return missing;
}

/**
 * publishable key만 사용하는 브라우저용 Supabase client.
 * service_role(또는 secret) key는 절대 이 프로젝트 코드에 포함하지 않는다.
 * 값이 비어 있어도 앱이 죽지 않도록 placeholder로 대체하고,
 * 실제 호출 여부는 isSupabaseConfigured로 먼저 확인한다.
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabasePublishableKey || "placeholder-publishable-key"
);
