import { isSupabaseConfigured, supabase } from "./supabase";
import { SupabaseNotConfiguredError } from "./letters";
import type { TimelineImageRow } from "./types";

export const TIMELINE_IMAGE_BUCKET = "timeline-images";

/** 화면에 보이는 작은 이미지 칸 수. DB check 제약은 1~3을 허용하지만 화면은 1~2만 쓴다. */
export const TIMELINE_SMALL_IMAGE_SLOTS = 2;

/**
 * 작은 이미지 칸 배치의 유일한 기준. 배열 순서가 아니라 DB의 sort_order로 칸을 정한다
 * (index 0 = 1번 칸). 예전에는 배열 순서대로 채워서, 1번 칸을 지우면 2번 이미지가 1번
 * 칸으로 당겨 보이고 "비어 보이는" 2번 칸에 등록하면 unique 제약 오류가 났다.
 * 화면 칸, 모달 표시 순서, 모달 삭제 대상이 모두 이 함수 결과를 쓴다.
 */
export function getSmallImageSlots(rows: readonly TimelineImageRow[]): (TimelineImageRow | undefined)[] {
  return Array.from({ length: TIMELINE_SMALL_IMAGE_SLOTS }, (_, i) =>
    rows.find((row) => !row.is_cover && row.sort_order === i + 1)
  );
}

/** 화면에 실제로 보이는 작은 이미지(1번 칸 -> 2번 칸 순서). 모달 index 1부터 이 순서와 같다. */
export function getVisibleSmallImages(rows: readonly TimelineImageRow[]): TimelineImageRow[] {
  return getSmallImageSlots(rows).filter((row): row is TimelineImageRow => row !== undefined);
}

/** 이미 사진이 있는 칸에 등록하려 했을 때. 화면 목록을 다시 불러와 DB와 맞추는 신호로 쓴다. */
export class TimelineSlotOccupiedError extends Error {
  constructor() {
    super("이미 사진이 등록된 칸입니다. 최신 목록으로 다시 불러왔어요.");
    this.name = "TimelineSlotOccupiedError";
  }
}

const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && (error as { code?: unknown }).code === UNIQUE_VIOLATION);
}

/**
 * DB 행을 지운 "뒤"에 Storage 파일을 정리한다. 여기서 실패해도 화면/DB는 이미 정상이고
 * 안 쓰는 파일 하나가 남을 뿐이므로 사용자 흐름은 막지 않는다. 대신 경로와 후속 정리
 * 방법을 콘솔에 남긴다. (권한이 없으면 Storage는 에러 없이 0건 삭제로 끝나므로 결과
 * 건수까지 확인한다.)
 *
 * 후속 정리: Supabase 대시보드 > Storage > timeline-images 버킷에서 로그에 찍힌 경로의
 * 파일을 삭제한다. timeline_images.image_path에 없는 파일 목록은 아래 SQL로 찾을 수 있다.
 *   select o.name from storage.objects o
 *   where o.bucket_id = 'timeline-images'
 *     and not exists (select 1 from public.timeline_images t where t.image_path = o.name);
 */
async function cleanupTimelineStorageFile(path: string, context: string): Promise<void> {
  try {
    const { data, error } = await supabase.storage.from(TIMELINE_IMAGE_BUCKET).remove([path]);
    if (!error && data && data.length > 0) return;
    console.error(
      `[timeline] ${context}: DB가 참조하지 않는 Storage 파일이 삭제되지 않았습니다. ` +
        `bucket=${TIMELINE_IMAGE_BUCKET} path=${path} ` +
        `(Supabase Storage에서 이 파일을 직접 삭제하면 됩니다.)`,
      error ?? "삭제된 파일 0건"
    );
  } catch (err) {
    console.error(
      `[timeline] ${context}: Storage 파일 정리 중 오류. bucket=${TIMELINE_IMAGE_BUCKET} path=${path} ` +
        `(Supabase Storage에서 이 파일을 직접 삭제하면 됩니다.)`,
      err
    );
  }
}

const TIMELINE_IMAGE_COLUMNS = "id,month,image_path,is_cover,sort_order,created_at,updated_at";

/** 등록된 모든 Timeline 대표 이미지를 month를 key로 하는 Map으로 한 번에 가져온다. */
export async function fetchTimelineImages(): Promise<Map<number, TimelineImageRow>> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("timeline_images")
    .select(TIMELINE_IMAGE_COLUMNS)
    .eq("is_cover", true);
  if (error) throw error;

  const map = new Map<number, TimelineImageRow>();
  for (const row of (data ?? []) as unknown as TimelineImageRow[]) {
    map.set(row.month, row);
  }
  return map;
}

/**
 * 등록된 모든 Timeline 작은 이미지를 month를 key로 하는 Map으로 한 번에 가져온다.
 * 각 배열은 sort_order 오름차순으로 정렬돼 있다. 화면에는 슬롯 1~2까지만 노출되지만,
 * DB의 sort_order check 제약은 그대로 1~3을 허용하므로(완화/삭제하지 않음) 과거에
 * 등록된 3번째 슬롯 데이터가 있다면 이 Map에는 여전히 포함될 수 있다.
 */
export async function fetchTimelineSmallImages(): Promise<Map<number, TimelineImageRow[]>> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("timeline_images")
    .select(TIMELINE_IMAGE_COLUMNS)
    .eq("is_cover", false)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const map = new Map<number, TimelineImageRow[]>();
  for (const row of (data ?? []) as unknown as TimelineImageRow[]) {
    const list = map.get(row.month) ?? [];
    list.push(row);
    map.set(row.month, list);
  }
  return map;
}

/**
 * data/timeline.ts의 정적 placeholder 경로(/images/timeline/...) 중 실제로 배포에 포함된
 * 파일 목록 - next.config.ts가 빌드 시점에 public/images/timeline/을 읽어 넣어준다.
 * 목록에 없는 경로는 요청해봐야 404이므로(Cloudflare에서는 Worker 호출까지 발생),
 * TimelineImage/ImageModal이 요청 없이 곧바로 기존 "IMAGE SOON" 자리표시를 보여주게 한다.
 */
const SHIPPED_LOCAL_TIMELINE_IMAGES: ReadonlySet<string> = new Set(
  JSON.parse(process.env.NEXT_PUBLIC_LOCAL_TIMELINE_IMAGES ?? "[]") as string[]
);

export function isMissingLocalTimelineImage(src: string): boolean {
  return src.startsWith("/images/timeline/") && !SHIPPED_LOCAL_TIMELINE_IMAGES.has(src);
}

/** image_path로부터 Storage 공개 URL을 계산한다. */
export function getTimelineImageUrl(imagePath: string): string {
  return supabase.storage.from(TIMELINE_IMAGE_BUCKET).getPublicUrl(imagePath).data.publicUrl;
}

function buildTimelineImagePath(month: number): string {
  const monthFolder = String(month).padStart(2, "0");
  return `${monthFolder}/${crypto.randomUUID()}.webp`;
}

interface UploadTimelineImageInput {
  month: number;
  image: Blob;
}

/**
 * 아직 대표 이미지가 없는 월에 이미지를 새로 등록한다. is_cover는 컬럼 기본값(true)을
 * 그대로 쓴다. INSERT 결과 행이 없으면(RLS 등으로 조용히 0건 처리된 경우) 방금 올린
 * Storage 파일을 정리하고 실패로 처리한다 ("성공처럼 보이는 실패"를 막기 위함).
 */
export async function uploadTimelineImage(input: UploadTimelineImageInput): Promise<TimelineImageRow> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const path = buildTimelineImagePath(input.month);

  const { error: uploadError } = await supabase.storage
    .from(TIMELINE_IMAGE_BUCKET)
    .upload(path, input.image, { contentType: "image/webp", upsert: false });
  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from("timeline_images")
    .insert([{ month: input.month, image_path: path }])
    .select(TIMELINE_IMAGE_COLUMNS)
    .single();

  if (insertError || !data) {
    // 방금 올린 파일은 DB row가 없어 어디에도 노출되지 않는다 - 정리하고 실패 처리.
    await cleanupTimelineStorageFile(path, "대표 이미지 등록 실패 후 업로드 파일 정리");
    throw insertError ?? new Error("이미지를 등록하지 못했습니다.");
  }

  return data as unknown as TimelineImageRow;
}

interface ReplaceTimelineImageInput {
  existing: Pick<TimelineImageRow, "month" | "image_path">;
  image: Blob;
}

/**
 * 이미 대표 이미지가 있는 월의 사진을 교체한다.
 * 새 이미지 업로드 -> DB의 image_path 변경 -> 기존 파일 정리 순서로 처리해서,
 * 중간에 실패해도 기존 대표 이미지가 사라지지 않게 한다.
 * is_cover = true 조건을 함께 걸어, 같은 달의 작은 이미지 row에는 절대 영향이 없다.
 */
export async function replaceTimelineImage(input: ReplaceTimelineImageInput): Promise<TimelineImageRow> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const newPath = buildTimelineImagePath(input.existing.month);

  const { error: uploadError } = await supabase.storage
    .from(TIMELINE_IMAGE_BUCKET)
    .upload(newPath, input.image, { contentType: "image/webp", upsert: false });
  if (uploadError) throw uploadError;

  const { data, error: updateError } = await supabase
    .from("timeline_images")
    .update({ image_path: newPath, updated_at: new Date().toISOString() })
    .eq("month", input.existing.month)
    .eq("is_cover", true)
    .select(TIMELINE_IMAGE_COLUMNS)
    .single();

  if (updateError || !data) {
    // DB는 그대로라 기존 이미지가 계속 보인다 - 새로 올린 파일만 정리하고 실패 처리.
    await cleanupTimelineStorageFile(newPath, "대표 이미지 교체 실패 후 업로드 파일 정리");
    throw updateError ?? new Error("이미지를 변경하지 못했습니다.");
  }

  // 기존 파일 정리 실패는 새 대표 이미지에 영향이 없으므로 기록만 남긴다.
  await cleanupTimelineStorageFile(input.existing.image_path, "대표 이미지 교체 후 옛 파일 정리");

  return data as unknown as TimelineImageRow;
}

/**
 * 대표 이미지를 삭제한다. DB row를 먼저 지우고, 실제로 1건 이상 지워졌을 때만 Storage
 * 파일을 정리한다 - DB 삭제가 실패하면 파일은 그대로 남아 화면도 그대로 정상이고,
 * Storage 정리가 실패해도 안 쓰는 파일 하나만 남는다("파일 없는 row"로 칸이 막히는
 * 상태를 만들지 않는다). is_cover = true 조건을 함께 걸어 작은 이미지 row에는 영향이 없다.
 */
export async function deleteTimelineImage(
  image: Pick<TimelineImageRow, "month" | "image_path">
): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error: deleteError } = await supabase
    .from("timeline_images")
    .delete()
    .eq("month", image.month)
    .eq("is_cover", true)
    .select("id");

  if (deleteError) {
    throw new Error("이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
  if (!data || data.length === 0) {
    throw new Error("삭제되지 않았습니다.");
  }

  await cleanupTimelineStorageFile(image.image_path, "대표 이미지 삭제 후 파일 정리");
}

interface UploadTimelineSmallImageInput {
  month: number;
  /** 슬롯 위치 1~2 */
  sortOrder: number;
  image: Blob;
}

/**
 * 비어 있는 작은 이미지 슬롯(1~2)에 사진을 새로 등록한다(INSERT만 - upsert로 다른 이미지를
 * 덮어쓰지 않는다). 업로드 전에 DB에서 그 칸이 실제로 비어 있는지 먼저 확인하고, 그 사이에
 * 누가 먼저 등록해 unique index(timeline_images_one_small_per_slot)에 걸려도
 * TimelineSlotOccupiedError로 바꿔 던진다 - 호출 쪽은 안내 후 목록을 다시 불러온다.
 */
export async function uploadTimelineSmallImage(
  input: UploadTimelineSmallImageInput
): Promise<TimelineImageRow> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data: occupied, error: checkError } = await supabase
    .from("timeline_images")
    .select("id")
    .eq("month", input.month)
    .eq("is_cover", false)
    .eq("sort_order", input.sortOrder)
    .limit(1);
  if (checkError) throw checkError;
  if (occupied && occupied.length > 0) throw new TimelineSlotOccupiedError();

  const path = buildTimelineImagePath(input.month);

  const { error: uploadError } = await supabase.storage
    .from(TIMELINE_IMAGE_BUCKET)
    .upload(path, input.image, { contentType: "image/webp", upsert: false });
  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from("timeline_images")
    .insert([{ month: input.month, image_path: path, is_cover: false, sort_order: input.sortOrder }])
    .select(TIMELINE_IMAGE_COLUMNS)
    .single();

  if (insertError || !data) {
    // 방금 올린 파일은 DB row가 없어 어디에도 노출되지 않는다 - 정리하고 실패 처리.
    await cleanupTimelineStorageFile(path, "작은 이미지 등록 실패 후 업로드 파일 정리");
    if (isUniqueViolation(insertError)) throw new TimelineSlotOccupiedError();
    throw insertError ?? new Error("이미지를 등록하지 못했습니다.");
  }

  return data as unknown as TimelineImageRow;
}

/**
 * 작은 이미지 한 장을 삭제한다. 같은 달에 여러 장이 있을 수 있으므로 반드시 row의
 * 고유 id로 정확히 한 건만 지운다. DB row를 먼저 지우고, 실제로 지워졌을 때만 Storage
 * 파일을 정리한다(deleteTimelineImage와 같은 이유). 0건 삭제는 실패로 처리한다.
 */
export async function deleteTimelineSmallImage(
  image: Pick<TimelineImageRow, "id" | "image_path">
): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error: deleteError } = await supabase
    .from("timeline_images")
    .delete()
    .eq("id", image.id)
    .select("id");

  if (deleteError) {
    throw new Error("이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
  if (!data || data.length === 0) {
    throw new Error("삭제되지 않았습니다.");
  }

  await cleanupTimelineStorageFile(image.image_path, "작은 이미지 삭제 후 파일 정리");
}
