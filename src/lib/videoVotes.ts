import { isSupabaseConfigured, supabase } from "./supabase";
import { SupabaseNotConfiguredError } from "./letters";

/**
 * 영상에 투표 1건을 추가한다. 이 파일(또는 다른 어디서도) video_votes를 절대
 * SELECT하지 않는다 - RLS도 anon에게 INSERT 권한만 주고 있어(video_votes.sql
 * 참고) 애초에 조회가 불가능하다. 투표 결과는 운영자만 Supabase SQL Editor에서
 * 직접 확인한다.
 *
 * 중복 투표를 의도적으로 막지 않으므로, 같은 videoId로 여러 번 호출해도 전부
 * 성공한다 - 연타/중복 INSERT 방지는 호출하는 쪽(VoteButton)의 cooldown으로 처리한다.
 */
export async function submitVideoVote(videoId: string): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  const { error } = await supabase.from("video_votes").insert([{ video_id: videoId }]);
  if (error) throw error;
}
