import type { StatisticsData } from "@/lib/types";

/**
 * STATISTICS 페이지에 쓰이는 정적 데이터.
 * Supabase 없이 직접 조사한 값을 여기서만 관리한다.
 * 숫자·문구를 바꾸고 싶으면 이 파일만 수정하면 된다.
 */
export const STATISTICS_DATA: StatisticsData = {
  highlights: [
    {
      value: 184,
      label: "BROADCASTS",
      description: "올해 방송 횟수",
      featured: true,
    },
    {
      value: 927,
      suffix: "h",
      label: "STREAMING TIME",
      description: "총 방송 시간",
      featured: true,
    },
    {
      value: 5,
      decimals: 1,
      suffix: "h",
      label: "AVERAGE LENGTH",
      description: "평균 방송 시간",
    },
  ],

  records: [
    {
      title: "가장 오래 방송한 날",
      value: "2026.08.15",
      description: "12시간 47분 동안 쉬지 않고 함께했어요.",
    },
    {
      title: "가장 많이 방송한 달",
      value: "8월",
      description: "한 달 동안 24회, 121시간 방송했어요.",
    },
    {
      title: "가장 늦게 끝난 방송",
      value: "새벽 6시 12분",
      description: "2026.11.02 방송에서.",
    },
    {
      title: "올해의 레전드 방송",
      value: "12.24 크리스마스 이브 특별 방송",
      description: "역대 최다 동시 시청자를 기록한 특별한 밤이었어요.",
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
