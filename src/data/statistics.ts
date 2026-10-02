import type { StatisticsData } from "@/lib/types";

/**
 * STATISTICS 페이지에 쓰이는 정적 데이터.
 * Supabase 없이 직접 조사한 값을 여기서만 관리한다.
 * 숫자·문구를 바꾸고 싶으면 이 파일만 수정하면 된다.
 */
export const STATISTICS_DATA: StatisticsData = {
  // BY THE NUMBERS 카드(VODS/DAYS ON AIR/TOGETHER/AVERAGE)는 이제 실제 2026년
  // 집계 데이터인 src/data/broadcastStats.ts의 BROADCAST_STATS_2026에서
  // 직접 만든다(src/app/statistics/page.tsx 참고) - 여기 있던 자리표시용
  // 숫자(184/927h/5.0h)는 실제 데이터로 교체되어 더 이상 쓰지 않는다.
  // "가장 늦게 끝난 방송"(24시간 이상 방송이 여러 건이라 종료 시각만으로는
  // 기준이 애매해서 제거)과 "올해의 레전드 방송"(통계가 아니라 주관적 선정이라
  // STATISTICS 성격과 맞지 않아 제거) 대신, 실제 2026 VOD 데이터 기반 기록
  // 4개로 교체했다. 데이터는 2026년 10월 초까지 집계한 값이라 연말에 최종
  // 숫자가 나오면 이 배열만 바꾸면 된다.
  records: [
    {
      title: "가장 긴 방송",
      value: "48H 30M",
      detail: "2026.08.07",
      quote: "고생했어 촉나라\n고생했다 버컴 꾸한성 💛",
      description: "무려 이틀을 넘게 이어진 방송이었어요.",
      // 정확한 원본 값(화면에는 표시하지 않음): 48시간 30분 11초
      rawValue: "48시간 30분 11초",
    },
    {
      title: "가장 오래 함께한 달",
      badge: "8월",
      value: "351H 21M",
      description: "8월 한 달 동안 총 351시간 21분을 함께했어요.",
      // 정확한 원본 값(화면에는 표시하지 않음): 2026년 8월, VOD 31개, 총 방송시간 351시간 21분 40초
      rawValue: "351시간 21분 40초",
    },
    {
      title: "다시보기가 가장 많았던 달",
      badge: "5월",
      value: "38 VODS",
      description: "2026년 중 가장 많은 다시보기가 남은 달이에요.",
      // 정확한 원본 값(화면에는 표시하지 않음): 2026년 5월, VOD 38개, 총 방송시간 350시간 59분 8초
      rawValue: "VOD 38개, 350시간 59분 8초",
    },
    {
      title: "가장 짧은 방송",
      value: "8M 40S",
      detail: "2026.02.13",
      quote: "재활센터 없는데 혼자 출석함💛",
      description: "2026년 가장 짧게 남은 방송 기록",
      // 정확한 원본 값(화면에는 표시하지 않음): 8분 40초
      rawValue: "8분 40초",
    },
  ],

  topContents: [
    { rank: 1, name: "저챗토크", detail: "52회 방송" },
    { rank: 2, name: "게임 방송", detail: "48회 방송" },
    { rank: 3, name: "노래 방송", detail: "21회 방송" },
  ],

  topGames: [
    { rank: 1, name: "리그 오브 레전드", detail: "64시간 플레이" },
    { rank: 2, name: "마인크래프트", detail: "38시간 플레이" },
    { rank: 3, name: "발로란트", detail: "22시간 플레이" },
  ],

  quoteOfTheYear: {
    quote: "그래도 우리, 끝까지 함께 가보자.",
    date: "2026.09.21",
    description:
      "가장 힘들었던 순간에도 팬들과 함께하겠다는 마음을 전했던 한마디예요.",
  },

  // 12개월치. broadcasts 합계 184 / hours 합계 927로 위 하이라이트 숫자와 맞춰뒀다.
  monthly: [
    { month: 1, broadcasts: 10, hours: 50 },
    { month: 2, broadcasts: 9, hours: 45 },
    { month: 3, broadcasts: 12, hours: 60 },
    { month: 4, broadcasts: 13, hours: 66 },
    { month: 5, broadcasts: 12, hours: 60 },
    { month: 6, broadcasts: 16, hours: 81 },
    { month: 7, broadcasts: 18, hours: 91 },
    { month: 8, broadcasts: 24, hours: 121 },
    { month: 9, broadcasts: 15, hours: 76 },
    { month: 10, broadcasts: 14, hours: 71 },
    { month: 11, broadcasts: 19, hours: 96 },
    { month: 12, broadcasts: 22, hours: 110 },
  ],
};
