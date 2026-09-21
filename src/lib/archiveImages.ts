import { isSupabaseConfigured, supabase } from "./supabase";
import { SupabaseNotConfiguredError } from "./letters";
import type { ArchiveImage } from "./types";

export const ARCHIVE_IMAGE_BUCKET = "archive-images";

const ARCHIVE_IMAGE_COLUMNS = "id,archive_id,image_path,created_at,updated_at";

/** 등록된 모든 Archive 대표 이미지를 archive_id를 key로 하는 Map으로 한 번에 가져온다. */
export async function fetchArchiveImages(): Promise<Map<string, ArchiveImage>> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase.from("archive_images").select(ARCHIVE_IMAGE_COLUMNS);
  if (error) throw error;

  const map = new Map<string, ArchiveImage>();
  for (const row of (data ?? []) as unknown as ArchiveImage[]) {
    map.set(row.archive_id, row);
  }
  return map;
}

/** image_path로부터 Storage 공개 URL을 계산한다. */
export function getArchiveImageUrl(imagePath: string): string {
  return supabase.storage.from(ARCHIVE_IMAGE_BUCKET).getPublicUrl(imagePath).data.publicUrl;
}

/**
 * 특정 archive_id 하나의 대표 이미지만 가져온다("랜덤 추억 열기"처럼 방송 기록
 * 하나만 보여줄 때 전체 Map을 불러올 필요가 없다). 없으면 null.
 */
export async function fetchArchiveImageById(archiveId: string): Promise<ArchiveImage | null> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("archive_images")
    .select(ARCHIVE_IMAGE_COLUMNS)
    .eq("archive_id", archiveId)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as ArchiveImage) ?? null;
}

function buildArchiveImagePath(month: number): string {
  const monthFolder = String(month).padStart(2, "0");
  return `2026/${monthFolder}/${crypto.randomUUID()}.webp`;
}

interface UploadArchiveImageInput {
  archiveId: string;
  month: number;
  image: Blob;
}

/**
 * 아직 대표 이미지가 없는 방송 기록에 이미지를 새로 등록한다.
 * INSERT 결과 행이 없으면(RLS 등으로 조용히 0건 처리된 경우) 방금 올린 Storage 파일을
 * 정리하고 실패로 처리한다 ("성공처럼 보이는 실패"를 막기 위함).
 */
export async function uploadArchiveImage(input: UploadArchiveImageInput): Promise<ArchiveImage> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const path = buildArchiveImagePath(input.month);

  const { error: uploadError } = await supabase.storage
    .from(ARCHIVE_IMAGE_BUCKET)
    .upload(path, input.image, { contentType: "image/webp", upsert: false });
  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from("archive_images")
    .insert([{ archive_id: input.archiveId, image_path: path }])
    .select(ARCHIVE_IMAGE_COLUMNS)
    .single();

  if (insertError || !data) {
    await supabase.storage
      .from(ARCHIVE_IMAGE_BUCKET)
      .remove([path])
      .catch(() => {
        // 정리 실패는 조용히 무시한다. DB row가 없어 어디에도 노출되지 않는다.
      });
    throw insertError ?? new Error("이미지를 등록하지 못했습니다.");
  }

  return data as unknown as ArchiveImage;
}

interface ReplaceArchiveImageInput {
  existing: Pick<ArchiveImage, "archive_id" | "image_path">;
  month: number;
  image: Blob;
}

/**
 * 이미 대표 이미지가 있는 기록의 사진을 교체한다.
 * 새 이미지 업로드 -> DB의 image_path 변경 -> 기존 파일 정리 순서로 처리해서,
 * 중간에 실패해도 기존 대표 이미지가 사라지지 않게 한다.
 */
export async function replaceArchiveImage(input: ReplaceArchiveImageInput): Promise<ArchiveImage> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const newPath = buildArchiveImagePath(input.month);

  const { error: uploadError } = await supabase.storage
    .from(ARCHIVE_IMAGE_BUCKET)
    .upload(newPath, input.image, { contentType: "image/webp", upsert: false });
  if (uploadError) throw uploadError;

  const { data, error: updateError } = await supabase
    .from("archive_images")
    .update({ image_path: newPath, updated_at: new Date().toISOString() })
    .eq("archive_id", input.existing.archive_id)
    .select(ARCHIVE_IMAGE_COLUMNS)
    .single();

  if (updateError || !data) {
    await supabase.storage
      .from(ARCHIVE_IMAGE_BUCKET)
      .remove([newPath])
      .catch(() => {
        // 정리 실패는 조용히 무시한다. DB는 그대로라 기존 이미지가 계속 보인다.
      });
    throw updateError ?? new Error("이미지를 변경하지 못했습니다.");
  }

  await supabase.storage
    .from(ARCHIVE_IMAGE_BUCKET)
    .remove([input.existing.image_path])
    .catch(() => {
      // 기존 파일 정리 실패는 조용히 무시한다. 새 대표 이미지는 이미 정상 반영됐고,
      // 안 쓰는 옛 파일 하나가 Storage에 남는 정도라 사용자에게 영향이 없다.
    });

  return data as unknown as ArchiveImage;
}

/**
 * 대표 이미지를 삭제한다. Storage의 실제 파일을 먼저 지우고 그다음 DB row를 지워서,
 * 중간 실패 시 "row는 남았는데 이미지가 없는(깨진 썸네일)" 상태를 피한다.
 * DELETE 결과 행이 없으면(0건 삭제) 실패로 처리한다.
 */
export async function deleteArchiveImage(
  image: Pick<ArchiveImage, "archive_id" | "image_path">
): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { error: storageError } = await supabase.storage
    .from(ARCHIVE_IMAGE_BUCKET)
    .remove([image.image_path]);
  if (storageError) {
    throw new Error("이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  const { data, error: deleteError } = await supabase
    .from("archive_images")
    .delete()
    .eq("archive_id", image.archive_id)
    .select("id");

  if (deleteError) {
    throw new Error("이미지는 삭제됐지만 목록 정리에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
  if (!data || data.length === 0) {
    throw new Error("삭제되지 않았습니다.");
  }
}
