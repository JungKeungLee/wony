import type { ConcertGalleryCategory } from "@/data/concert";

/** ALL 탭 + 카테고리 탭 순서. value가 null이면 ALL(전체)을 뜻한다. */
export const CATEGORY_TABS: { label: string; value: ConcertGalleryCategory | null }[] = [
  { label: "ALL", value: null },
  { label: "POSTER", value: "poster" },
  { label: "TEASER", value: "teaser" },
  { label: "PHOTO", value: "photo" },
  { label: "VIDEO", value: "video" },
];

/** 실제 이미지가 없는 항목(placeholder)에서 보여줄 카테고리별 아이콘 */
export const CATEGORY_ICON: Record<ConcertGalleryCategory, string> = {
  poster: "✦",
  teaser: "🎬",
  photo: "📷",
  video: "▶",
};
