import { isSupabaseConfigured, supabase } from "./supabase";
import type { Letter, LetterInput } from "./types";

const LETTER_COLUMNS = "id,nickname,content,message_2027,is_anonymous,created_at";

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase가 아직 설정되지 않았습니다.");
    this.name = "SupabaseNotConfiguredError";
  }
}

/** 승인된(is_approved = true) 편지만 최신순으로 가져온다. */
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

/** 편지를 등록한다. is_approved/id/created_at은 보내지 않고 DB 기본값을 따른다. */
export async function submitLetter(input: LetterInput): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { error } = await supabase.from("letters").insert([input]);
  if (error) throw error;
}
