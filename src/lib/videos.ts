import { isSupabaseConfigured, supabase } from "./supabase";
import { SupabaseNotConfiguredError } from "./letters";
import type { VideoInput, VideoItem } from "./types";

const VIDEO_COLUMNS =
  "id,nickname,title,platform,video_url,video_id,message,month,category,best_rank,created_at";

/** 공개(is_approved = true) 상태인 영상만 최신순으로 가져온다. 관리자가 false로 내리면 여기서 제외된다. */
export async function fetchApprovedVideos(): Promise<VideoItem[]> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_COLUMNS)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as VideoItem[];
}

/**
 * 영상을 등록한다. 별도 승인 절차 없이 is_approved = true로 저장해 즉시 공개하며,
 * 문제가 있는 영상은 관리자가 Supabase Dashboard에서 is_approved를 false로 내려 숨긴다.
 */
export async function submitVideo(input: VideoInput): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { error } = await supabase.from("videos").insert([{ ...input, is_approved: true }]);
  if (error) throw error;
}

/**
 * 영상을 삭제한다. 삭제 전 확인은 호출하는 쪽(UI)에서 처리한다.
 * RLS 정책에 막혀 0개 행이 삭제된 경우 Supabase는 에러 없이 빈 결과를 반환하므로,
 * 삭제된 행이 실제로 있는지 select("id")로 직접 확인해 "성공처럼 보이는 실패"를 막는다.
 */
export async function deleteVideo(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { data, error } = await supabase.from("videos").delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("삭제되지 않았습니다.");
  }
}
