import type { BroadcastStats2026 } from "@/lib/types";

/**
 * 2026년 방송 기록 집계 데이터("BY THE NUMBERS" 이후 스토리텔링 섹션 전용).
 * 2025-12-31 방송은 2026년 집계에서 제외한 값이다.
 *
 * 12월에 최종 데이터가 확정되면 이 객체의 숫자만 바꾸면 된다 - 카운트업 숫자,
 * 순위, 포맷된 문구 전부 여기 숫자/문자열에서 그대로 가져다 쓴다.
 *
 * LONGEST CONTENT(contents)/MOST FEATURED GAMES(games)의 시간은 해당
 * 콘텐츠·게임의 "순수 플레이 시간"이 아니라, 그 콘텐츠가 진행된 기간(또는 VOD
 * 제목에 그 게임이 등장한 방송)의 방송시간을 기준으로 집계한 값이다 - 화면에도
 * 이 집계 기준을 작은 설명으로 반드시 함께 보여준다.
 */
export const BROADCAST_STATS_2026: BroadcastStats2026 = {
  vodCount: 280,
  broadcastDays: 233,
  totalHours: 2762,
  totalMinutes: 8,
  averageHours: 9,
  averageMinutes: 52,

  mostActiveMonth: {
    month: "AUGUST",
    hours: 351,
    descriptionKo: "가장 오래 함께했던 달",
  },

  contents: [
    { rank: 1, name: "삼국지 서버", hours: 319, detail: "07.13 — 08.10" },
    { rank: 2, name: "숲크타", hours: 200, detail: "05.01 — 05.14" },
    { rank: 3, name: "감놀 · 선릿벨리", hours: 171, detail: "06.03 — 06.18" },
  ],

  games: [
    { rank: 1, name: "MINECRAFT", hours: 405, detail: "41 VODS" },
    { rank: 2, name: "PUBG", hours: 376, detail: "38 VODS" },
    { rank: 3, name: "OVERWATCH", hours: 77, detail: "5 VODS" },
  ],

  marathonStreams: [
    { date: "02.18", title: "KSL 벌칙", duration: "24H 08M" },
    { date: "04.23", title: "난전워치 & 팰월드", duration: "25H 54M" },
    { date: "08.01", title: "삼국지", duration: "27H 31M" },
    { date: "08.02", title: "삼국지", duration: "27H 30M" },
    { date: "08.07", title: "삼국지", duration: "48H 30M" },
  ],

  longestStream: {
    duration: "48:30:11",
    date: "2026.08.07",
    quote: "고생했어 촉나라\n고생했다 버컴 꾸한성 💛",
  },

  over10HoursCount: 136,
  over12HoursCount: 80,
  under3HoursCount: 24,
  shortestMinutes: 8,
  shortestSeconds: 40,
};

/**
 * "9분 51초"/"9시간 51분" 형태로 포맷한다. 시간이 0이면 "8분 40초"처럼 시간
 * 단위를 생략한다. 값은 항상 정수로 반올림해서 보여준다(카운트업 애니메이션
 * 중간의 소수점 값이 들어와도 안전하다).
 */
export function formatDuration(hours: number, minutes: number, seconds?: number): string {
  const h = Math.round(hours);
  const m = Math.round(minutes);
  if (seconds === undefined) {
    return h > 0 ? `${h.toLocaleString("en-US")}시간 ${m}분` : `${m}분`;
  }
  const s = Math.round(seconds);
  if (h > 0) return `${h.toLocaleString("en-US")}시간 ${m}분 ${s}초`;
  return `${m}분 ${s}초`;
}
