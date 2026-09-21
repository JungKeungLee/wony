import { isSupabaseConfigured, supabase } from "./supabase";
import { SupabaseNotConfiguredError } from "./letters";

export const VIDEO_THUMBNAIL_BUCKET = "video-thumbnails";

/** thumbnail_path로부터 Storage 공개 URL을 계산한다. */
export function getVideoThumbnailUrl(path: string): string {
  return supabase.storage.from(VIDEO_THUMBNAIL_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * 사용자가 직접 고른 썸네일(주로 SOOP 자동 추출이 실패했을 때 쓰는 fallback)을
 * Storage에 올리고 저장할 image_path를 돌려준다. 등록 자체를 막지 않도록 실패하면
 * 그대로 에러를 던지고, 호출하는 쪽(VideoForm)에서 thumbnail_path 없이 등록을
 * 계속 진행할지 판단한다.
 */
export async function uploadVideoThumbnail(image: Blob): Promise<string> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const path = `${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(VIDEO_THUMBNAIL_BUCKET)
    .upload(path, image, { contentType: "image/webp", upsert: false });
  if (error) throw error;

  return path;
}
