import { getMissingSupabaseEnvVars, isSupabaseConfigured, supabase } from "./supabase";
import type { Letter, LetterInput } from "./types";

const LETTER_COLUMNS = "id,nickname,content,message_2027,is_anonymous,created_at";

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    const missing = getMissingSupabaseEnvVars();
    const detail = missing.length > 0 ? ` (누락: ${missing.join(", ")})` : "";
    super(`Supabase가 아직 설정되지 않았습니다.${detail}`);
    this.name = "SupabaseNotConfiguredError";
  }
}

/**
 * supabase-js는 실패 시 실제 `Error` 인스턴스 대신
 * { message, details, hint, code } 형태의 일반 객체를 던지는 경우가 있다.
 * `instanceof Error`만으로는 이 형태를 놓치므로 message 필드까지 함께 확인한다.
 */
export function toErrorMessage(err: unknown, fallback = "알 수 없는 오류가 발생했습니다."): string {
  if (err instanceof Error) return err.message;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return fallback;
}

/** 공개(is_approved = true) 상태인 편지만 최신순으로 가져온다. 관리자가 false로 내리면 여기서 제외된다. */
export async function fetchApprovedLetters(): Promise<Letter[]> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("letters")
    .select(LETTER_COLUMNS)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Letter[];
}

/**
 * 편지를 등록한다. 별도 승인 절차 없이 is_approved = true로 저장해 즉시 공개한다.
 * 문제가 있는 편지는 관리자가 Supabase Dashboard에서 is_approved를 false로 내려 숨긴다.
 */
export async function submitLetter(input: LetterInput): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { error } = await supabase.from("letters").insert([{ ...input, is_approved: true }]);
  if (error) throw error;
}
