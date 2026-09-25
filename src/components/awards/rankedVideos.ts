import type { VideoItem } from "@/lib/types";
import { AWARDS_TEST_MODE } from "@/data/awards";

export interface RankedVideos {
  third: VideoItem | null;
  second: VideoItem | null;
  first: VideoItem | null;
}

function findRank(videos: VideoItem[], rank: 1 | 2 | 3): VideoItem | null {
  return videos.find((v) => v.best_rank === rank) ?? null;
}

/**
 * AWARDS_TEST_MODE=true일 때만 쓰는 임시 데이터. videos.best_rank는 전혀
 * 보지 않고, 현재 등록된 영상 중 서로 다른 3개를 골라 3위/2위/1위 자리에
 * 각각 매핑한다 - 화면/연출 확인용이라 실제 Supabase 데이터는 손대지 않는다.
 */
function pickTestVideos(videos: VideoItem[]): RankedVideos {
  return {
    third: videos[0] ?? null,
    second: videos[1] ?? null,
    first: videos[2] ?? null,
  };
}

/**
 * BEST VIDEO 발표 연출(BestVideoAwardSequence)과 /videos의 발표 완료 후
 * TOP 3 결과 표시(BestClipsSection)가 반드시 같은 데이터를 봐야 해서 이 파일로
 * 분리했다 - 발표에서 본 영상과 이후 카드로 다시 보는 영상이 어긋나면 안 된다.
 * AWARDS_TEST_MODE=false면 실제 best_rank(3=3위, 2=2위, 1=WINNER)를 그대로 쓴다.
 */
export function pickRankedVideos(videos: VideoItem[]): RankedVideos {
  if (AWARDS_TEST_MODE) return pickTestVideos(videos);
  return {
    third: findRank(videos, 3),
    second: findRank(videos, 2),
    first: findRank(videos, 1),
  };
}
