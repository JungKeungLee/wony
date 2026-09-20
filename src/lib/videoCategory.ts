import type { VideoCategory } from "./types";

/** 등록 폼 select와 필터에 쓰는 고정 순서. 여기에만 추가하면 새 카테고리가 반영된다. */
export const VIDEO_CATEGORIES: VideoCategory[] = [
  "legend",
  "funny",
  "touching",
  "collab",
  "game",
  "fan_pick",
];

const CATEGORY_LABELS: Record<VideoCategory, string> = {
  legend: "레전드",
  funny: "웃긴 장면",
  touching: "감동",
  collab: "합방",
  game: "게임",
  fan_pick: "팬 추천",
};

export function getCategoryLabel(category: VideoCategory): string {
  return CATEGORY_LABELS[category];
}

export const MONTH_LABELS_EN = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export const MONTH_LABELS_FULL = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];
