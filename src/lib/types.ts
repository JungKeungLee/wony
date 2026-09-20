export interface NavItem {
  label: string;
  href: string;
}

export interface PreviewItem {
  index: string;
  title: string;
  description: string;
  href: string;
}

export interface TimelineMonthData {
  /** 1~12 */
  month: number;
  /** 영문 월 이름, 예: "JANUARY" */
  monthLabel: string;
  /** 표시용 날짜, 예: "2026.01" */
  date: string;
  title: string;
  description: string;
  quote: string;
  /** 첫 번째 항목이 대표 이미지, 나머지는 추가 이미지 */
  images: string[];
  /** true면 해당 월을 시각적으로 강조 */
  featured?: boolean;
}

/** Supabase letters 테이블 한 행 */
export interface Letter {
  id: string;
  nickname: string;
  content: string;
  message_2027: string;
  is_anonymous: boolean;
  is_approved: boolean;
  created_at: string;
}

/** 편지 등록 시 클라이언트가 채우는 값 (id/is_approved/created_at은 DB 기본값 사용) */
export type LetterInput = Pick<
  Letter,
  "nickname" | "content" | "message_2027" | "is_anonymous"
>;

/** Supabase fan_arts 테이블 한 행 */
export interface FanArt {
  id: string;
  nickname: string;
  title: string;
  message: string | null;
  /** Storage 객체 경로. 공개 URL은 getFanArtImageUrl()로 계산한다. */
  image_path: string;
  is_approved: boolean;
  created_at: string;
}

/** 팬아트 등록 시 클라이언트가 채우는 값 */
export type FanArtInput = Pick<FanArt, "nickname" | "title" | "message" | "image_path">;

/** 지원하는 영상 플랫폼. 새 플랫폼을 추가할 때 이 유니온에만 추가하면 된다. */
export type VideoPlatform = "youtube" | "soop";

/** Supabase videos 테이블 한 행 */
export interface VideoItem {
  id: string;
  nickname: string;
  title: string;
  platform: VideoPlatform;
  video_url: string;
  video_id: string;
  message: string | null;
  is_approved: boolean;
  created_at: string;
}

/** 영상 등록 시 클라이언트가 채우는 값 */
export type VideoInput = Pick<
  VideoItem,
  "nickname" | "title" | "platform" | "video_url" | "video_id" | "message"
>;

/** Footer 등에서 쓰는 링크. href가 없으면(null) 클릭 불가능한 placeholder로 표시한다. */
export interface FooterLink {
  label: string;
  href: string | null;
}
