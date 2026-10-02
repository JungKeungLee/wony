import type { BroadcastStats2026 } from "@/lib/types";

/**
 * 2026년 방송 기록 집계 데이터("2026 방송 기록" 섹션 전용).
 * 2025-12-31 방송은 2026년 집계에서 제외한 값이다.
 *
 * 12월에 최종 데이터가 확정되면 이 객체의 숫자만 바꾸면 된다 - 카운트업 숫자,
 * 총/평균/최장/최단 방송시간 문구(formatDuration으로 계산) 모두 여기 숫자에서
 * 파생되므로 다른 파일을 손댈 필요가 없다.
 */
export const BROADCAST_STATS_2026: BroadcastStats2026 = {
  vodCount: 280,
  broadcastDays: 233,
  totalHours: 2762,
  totalMinutes: 8,
  totalSeconds: 5,
  averageHours: 9,
  averageMinutes: 51,
  averageSeconds: 53,
  longestHours: 48,
  longestMinutes: 30,
  longestSeconds: 11,
  longestStreamDate: "2026.08.07",
  longestStreamQuote: "고생했어 촉나라 고생했다 버컴 꾸한성💛",
  shortestMinutes: 8,
  shortestSeconds: 40,
  over10HoursCount: 136,
  over12HoursCount: 80,
  under3HoursCount: 24,
};

/**
 * "9시간 51분 53초" 형태로 포맷한다. 시간이 0이면 "8분 40초"처럼 시간 단위를
 * 생략한다. 값은 항상 정수로 반올림해서 보여준다(카운트업 애니메이션 중간의
 * 소수점 값이 들어와도 안전하다).
 */
export function formatDuration(hours: number, minutes: number, seconds: number): string {
  const h = Math.round(hours);
  const m = Math.round(minutes);
  const s = Math.round(seconds);
  if (h > 0) return `${h.toLocaleString("en-US")}시간 ${m}분 ${s}초`;
  return `${m}분 ${s}초`;
}
