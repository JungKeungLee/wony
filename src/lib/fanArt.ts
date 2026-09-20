import { isSupabaseConfigured, supabase } from "./supabase";
import { SupabaseNotConfiguredError } from "./letters";
import type { FanArt } from "./types";

export const FAN_ART_BUCKET = "fan-art";

const FAN_ART_COLUMNS = "id,nickname,title,message,image_path,created_at";

/** 공개(is_approved = true) 상태인 팬아트만 최신순으로 가져온다. 관리자가 false로 내리면 여기서 제외된다. */
export async function fetchApprovedFanArt(): Promise<FanArt[]> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("fan_arts")
    .select(FAN_ART_COLUMNS)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as FanArt[];
}

/** image_path로부터 Storage 공개 URL을 계산한다. */
export function getFanArtImageUrl(imagePath: string): string {
  return supabase.storage.from(FAN_ART_BUCKET).getPublicUrl(imagePath).data.publicUrl;
}

interface UploadFanArtInput {
  nickname: string;
  title: string;
  message: string | null;
  image: Blob;
  imageExtension: string;
}

/**
 * 이미지를 Storage에 업로드한 뒤 fan_arts 테이블에 metadata를 저장한다.
 * 별도 승인 절차 없이 is_approved = true로 저장해 즉시 공개하며,
 * 문제가 있는 작품은 관리자가 Supabase Dashboard에서 is_approved를 false로 내려 숨긴다.
 * DB insert가 실패하면 방금 올린 이미지를 정리 시도한다(10분 이내 파일만 삭제 가능한 정책과 맞물림).
 */
export async function uploadFanArt(input: UploadFanArtInput): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${input.imageExtension}`;

  const { error: uploadError } = await supabase.storage
    .from(FAN_ART_BUCKET)
    .upload(path, input.image, {
      contentType: input.image.type || `image/${input.imageExtension}`,
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("fan_arts").insert([
    {
      nickname: input.nickname,
      title: input.title,
      message: input.message,
      image_path: path,
      is_approved: true,
    },
  ]);

  if (insertError) {
    await supabase.storage
      .from(FAN_ART_BUCKET)
      .remove([path])
      .catch(() => {
        // 정리 실패는 조용히 무시한다. DB row가 없어 어디에도 노출되지 않으며,
        // 10분이 지나면 관리자가 Dashboard에서 정리할 수 있다.
      });
    throw insertError;
  }
}

/**
 * 팬아트를 삭제한다. Storage의 실제 이미지를 먼저 지우고 그다음 DB row를 지워서,
 * 만에 하나 중간에 실패해도 "이미지는 남았는데 목록에 없는" 상태보다
 * "row는 남았는데 이미지가 없는(깨진 썸네일)" 상태를 피한다.
 * 삭제 전 확인은 호출하는 쪽(UI)에서 처리한다.
 */
export async function deleteFanArt(art: Pick<FanArt, "id" | "image_path">): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { error: storageError } = await supabase.storage
    .from(FAN_ART_BUCKET)
    .remove([art.image_path]);
  if (storageError) {
    throw new Error("이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  const { error: deleteError } = await supabase.from("fan_arts").delete().eq("id", art.id);
  if (deleteError) {
    throw new Error(
      "이미지는 삭제됐지만 목록 정리에 실패했습니다. 잠시 후 다시 시도해주세요."
    );
  }
}
