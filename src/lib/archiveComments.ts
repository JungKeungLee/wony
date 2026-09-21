import { isSupabaseConfigured, supabase } from "./supabase";
import { SupabaseNotConfiguredError } from "./letters";
import type { ArchiveComment } from "./types";

const ARCHIVE_COMMENT_COLUMNS = "id,archive_id,comment,created_at,updated_at";

/** 등록된 모든 "그날의 기록" 코멘트를 archive_id를 key로 하는 Map으로 한 번에 가져온다. */
export async function fetchArchiveComments(): Promise<Map<string, ArchiveComment>> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase.from("archive_comments").select(ARCHIVE_COMMENT_COLUMNS);
  if (error) throw error;

  const map = new Map<string, ArchiveComment>();
  for (const row of (data ?? []) as unknown as ArchiveComment[]) {
    map.set(row.archive_id, row);
  }
  return map;
}

/**
 * 특정 archive_id 하나의 "그날의 기록" 코멘트만 가져온다("랜덤 추억 열기"처럼 방송
 * 기록 하나만 보여줄 때 전체 Map을 불러올 필요가 없다). 없으면 null.
 */
export async function fetchArchiveCommentById(archiveId: string): Promise<ArchiveComment | null> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("archive_comments")
    .select(ARCHIVE_COMMENT_COLUMNS)
    .eq("archive_id", archiveId)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as ArchiveComment) ?? null;
}

/**
 * 아직 코멘트가 없는 방송 기록에 새로 등록한다. 항목당 1개만 있어야 하므로
 * archive_id에 unique 제약이 걸려 있고, 그 규칙이 여기서도 지켜진다.
 */
export async function createArchiveComment(
  archiveId: string,
  comment: string
): Promise<ArchiveComment> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("archive_comments")
    .insert([{ archive_id: archiveId, comment }])
    .select(ARCHIVE_COMMENT_COLUMNS)
    .single();

  if (error || !data) throw error ?? new Error("코멘트를 등록하지 못했습니다.");
  return data as unknown as ArchiveComment;
}

/** 기존 코멘트 내용을 수정한다. */
export async function updateArchiveComment(
  archiveId: string,
  comment: string
): Promise<ArchiveComment> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("archive_comments")
    .update({ comment, updated_at: new Date().toISOString() })
    .eq("archive_id", archiveId)
    .select(ARCHIVE_COMMENT_COLUMNS)
    .single();

  if (error || !data) throw error ?? new Error("코멘트를 수정하지 못했습니다.");
  return data as unknown as ArchiveComment;
}

/**
 * 코멘트를 삭제한다. RLS가 조건에 안 맞는 행을 조용히 0건 처리할 수 있으므로,
 * "에러 없음"이 아니라 실제로 삭제된 행이 있는지(.select())로 성공 여부를 판단한다.
 */
export async function deleteArchiveComment(archiveId: string): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("archive_comments")
    .delete()
    .eq("archive_id", archiveId)
    .select("id");

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("삭제되지 않았습니다.");
  }
}
