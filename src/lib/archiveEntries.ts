import { isSupabaseConfigured, supabase } from "./supabase";
import { SupabaseNotConfiguredError } from "./letters";
import type { ArchiveEntryInput, ArchiveEntryRow } from "./types";
import type { ArchiveItem } from "@/data/archive";

const ARCHIVE_ENTRY_COLUMNS =
  "id,archive_id,date,title,description,tags,created_at,updated_at,deleted_at";

/**
 * 삭제되지 않은 ARCHIVE 기록을 모두 가져온다. 월별 그룹핑/정렬은 호출하는 쪽에서 한다.
 * soft delete된(deleted_at이 채워진) 기록은 여기서 걸러지므로, 월 목록/랜덤 추억 등
 * 이 함수를 쓰는 모든 화면에서 자동으로 숨겨진다.
 */
export async function fetchArchiveEntries(): Promise<ArchiveEntryRow[]> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("archive_entries")
    .select(ARCHIVE_ENTRY_COLUMNS)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ArchiveEntryRow[];
}

/**
 * 새 기록의 archive_id를 자동 생성한다. 사용자가 직접 입력하지 않으며, 같은 날짜에
 * 여러 콘텐츠가 있어도 충돌하지 않도록 날짜 + 임의 문자열로 구성한다.
 * 예: "08.26" -> "2026-08-26-a1b2c3d4"
 */
function generateArchiveId(date: string): string {
  const m = date.trim().match(/(\d{1,2})\.(\d{1,2})/);
  const mm = (m ? m[1] : "00").padStart(2, "0");
  const dd = (m ? m[2] : "00").padStart(2, "0");
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `2026-${mm}-${dd}-${random}`;
}

/** 새 ARCHIVE 기록을 등록한다. archive_id는 여기서 자동 생성한다. */
export async function createArchiveEntry(input: ArchiveEntryInput): Promise<ArchiveEntryRow> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const archiveId = generateArchiveId(input.date);

  const { data, error } = await supabase
    .from("archive_entries")
    .insert([
      {
        archive_id: archiveId,
        date: input.date,
        title: input.title,
        description: input.description,
        tags: input.tags,
      },
    ])
    .select(ARCHIVE_ENTRY_COLUMNS)
    .single();

  if (error || !data) throw error ?? new Error("기록을 등록하지 못했습니다.");
  return data as unknown as ArchiveEntryRow;
}

/** 기존 기록의 date/title/description/tags만 수정한다. archive_id는 절대 바꾸지 않는다. */
export async function updateArchiveEntry(
  archiveId: string,
  input: ArchiveEntryInput
): Promise<ArchiveEntryRow> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("archive_entries")
    .update({
      date: input.date,
      title: input.title,
      description: input.description,
      tags: input.tags,
      updated_at: new Date().toISOString(),
    })
    .eq("archive_id", archiveId)
    .select(ARCHIVE_ENTRY_COLUMNS)
    .single();

  if (error || !data) throw error ?? new Error("기록을 수정하지 못했습니다.");
  return data as unknown as ArchiveEntryRow;
}

/**
 * 기록 한 건을 soft delete한다(deleted_at만 채움). archive_images/archive_comments/
 * Storage 파일은 전혀 건드리지 않는다 - 물리적으로 지우지 않으므로 실수로 삭제해도
 * DB에서 deleted_at을 다시 null로 되돌리면 복구된다. deleted_at이 이미 채워진 다른
 * archive_id는 조건에 안 맞아 절대 영향받지 않는다.
 * RLS가 조건에 안 맞는 행을 조용히 0건 처리할 수 있으므로, 실제로 갱신된 행이
 * 있는지(.select())로 성공 여부를 판단한다.
 */
export async function deleteArchiveEntry(archiveId: string): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("archive_entries")
    .update({ deleted_at: new Date().toISOString() })
    .eq("archive_id", archiveId)
    .is("deleted_at", null)
    .select("id");

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("삭제되지 않았습니다.");
  }
}

/** Supabase 행을 화면(ArchiveCard 등)에서 쓰는 ArchiveItem 모양으로 변환한다. */
export function archiveEntryToItem(row: ArchiveEntryRow): ArchiveItem {
  return {
    id: row.archive_id,
    date: row.date,
    title: row.title,
    description: row.description ?? undefined,
    tags: row.tags.length > 0 ? row.tags : undefined,
  };
}
