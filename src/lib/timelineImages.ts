import { isSupabaseConfigured, supabase } from "./supabase";
import { SupabaseNotConfiguredError } from "./letters";
import type { TimelineImageRow } from "./types";

export const TIMELINE_IMAGE_BUCKET = "timeline-images";

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
    await supabase.storage
      .from(TIMELINE_IMAGE_BUCKET)
      .remove([path])
      .catch(() => {
        // 정리 실패는 조용히 무시한다. DB row가 없어 어디에도 노출되지 않는다.
      });
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
    await supabase.storage
      .from(TIMELINE_IMAGE_BUCKET)
      .remove([newPath])
      .catch(() => {
        // 정리 실패는 조용히 무시한다. DB는 그대로라 기존 이미지가 계속 보인다.
      });
    throw updateError ?? new Error("이미지를 변경하지 못했습니다.");
  }

  await supabase.storage
    .from(TIMELINE_IMAGE_BUCKET)
    .remove([input.existing.image_path])
    .catch(() => {
      // 기존 파일 정리 실패는 조용히 무시한다. 새 대표 이미지는 이미 정상 반영됐고,
      // 안 쓰는 옛 파일 하나가 Storage에 남는 정도라 사용자에게 영향이 없다.
    });

  return data as unknown as TimelineImageRow;
}

/**
 * 대표 이미지를 삭제한다. Storage의 실제 파일을 먼저 지우고 그다음 DB row를 지워서,
 * 중간 실패 시 "row는 남았는데 이미지가 없는(깨진 썸네일)" 상태를 피한다.
 * is_cover = true 조건을 함께 걸어, 같은 달의 작은 이미지 row에는 절대 영향이 없다.
 * DELETE 결과 행이 없으면(0건 삭제) 성공으로 처리하지 않고 에러를 던진다.
 */
export async function deleteTimelineImage(
  image: Pick<TimelineImageRow, "month" | "image_path">
): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { error: storageError } = await supabase.storage
    .from(TIMELINE_IMAGE_BUCKET)
    .remove([image.image_path]);
  if (storageError) {
    throw new Error("이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  const { data, error: deleteError } = await supabase
    .from("timeline_images")
    .delete()
    .eq("month", image.month)
    .eq("is_cover", true)
    .select("id");

  if (deleteError) {
    throw new Error("이미지는 삭제됐지만 목록 정리에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
  if (!data || data.length === 0) {
    throw new Error("삭제되지 않았습니다.");
  }
}

interface UploadTimelineSmallImageInput {
  month: number;
  /** 슬롯 위치 1~2 */
  sortOrder: number;
  image: Blob;
}

/**
 * 비어 있는 작은 이미지 슬롯(1~2)에 사진을 새로 등록한다. is_cover = false로 저장하며,
 * (month, sort_order) 조합이 이미 있으면 DB의 unique index가 막아준다.
 */
export async function uploadTimelineSmallImage(
  input: UploadTimelineSmallImageInput
): Promise<TimelineImageRow> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

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
    await supabase.storage
      .from(TIMELINE_IMAGE_BUCKET)
      .remove([path])
      .catch(() => {
        // 정리 실패는 조용히 무시한다. DB row가 없어 어디에도 노출되지 않는다.
      });
    throw insertError ?? new Error("이미지를 등록하지 못했습니다.");
  }

  return data as unknown as TimelineImageRow;
}

/**
 * 작은 이미지 한 장을 삭제한다. 같은 달에 여러 장이 있을 수 있으므로 반드시 row의
 * 고유 id로 정확히 한 건만 지운다. Storage 파일을 먼저 지우고 DB row를 그다음 지운다.
 * DELETE 결과 행이 없으면(0건 삭제) 성공으로 처리하지 않고 에러를 던진다.
 */
export async function deleteTimelineSmallImage(
  image: Pick<TimelineImageRow, "id" | "image_path">
): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { error: storageError } = await supabase.storage
    .from(TIMELINE_IMAGE_BUCKET)
    .remove([image.image_path]);
  if (storageError) {
    throw new Error("이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  const { data, error: deleteError } = await supabase
    .from("timeline_images")
    .delete()
    .eq("id", image.id)
    .select("id");

  if (deleteError) {
    throw new Error("이미지는 삭제됐지만 목록 정리에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
  if (!data || data.length === 0) {
    throw new Error("삭제되지 않았습니다.");
  }
}
