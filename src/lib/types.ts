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

/** VIDEO(WONY CINEMA) 클립 카테고리. 새 카테고리를 추가할 때 이 유니온에만 추가하면 된다. */
export type VideoCategory = "legend" | "funny" | "touching" | "collab" | "game" | "fan_pick";

/** Supabase videos 테이블 한 행 */
export interface VideoItem {
  id: string;
  nickname: string;
  title: string;
  platform: VideoPlatform;
  video_url: string;
  video_id: string;
  message: string | null;
  /** 1~12. 어느 달의 하이라이트 클립인지 */
  month: number;
  category: VideoCategory;
  /** null = 일반 클립, 1~3 = 2026 BEST #1~#3. 관리자가 Dashboard에서만 설정한다. */
  best_rank: number | null;
  is_approved: boolean;
  created_at: string;
}

/** 영상 등록 시 클라이언트가 채우는 값 (best_rank는 폼에 노출하지 않고 관리자가 별도로 설정) */
export type VideoInput = Pick<
  VideoItem,
  "nickname" | "title" | "platform" | "video_url" | "video_id" | "message" | "month" | "category"
>;

/** Supabase archive_images 테이블 한 행. src/data/archive.ts의 ArchiveItem.id와 archive_id로 연결된다. */
export interface ArchiveImage {
  id: string;
  archive_id: string;
  /** Storage 객체 경로. 공개 URL은 getArchiveImageUrl()로 계산한다. */
  image_path: string;
  created_at: string;
  updated_at: string;
}

/** Footer 등에서 쓰는 링크. href가 없으면(null) 클릭 불가능한 placeholder로 표시한다. */
export interface FooterLink {
  label: string;
  href: string | null;
}

/** STATISTICS 페이지의 큰 숫자 카드 (Count Up 애니메이션 대상) */
export interface HighlightStat {
  /** Count Up 목표 숫자 */
  value: number;
  /** 숫자 뒤에 붙는 단위, 예: "h" */
  suffix?: string;
  /** 소수점 자리수 (기본 0) */
  decimals?: number;
  /** 카드 상단 영문 라벨, 예: "BROADCASTS" */
  label: string;
  /** 짧은 한글 설명 */
  description: string;
  /** true면 더 크게 강조해서 보여준다 */
  featured?: boolean;
}

/** 숫자가 아닌 기록/에피소드성 항목 (가장 오래 방송한 날 등) */
export interface RecordStat {
  title: string;
  value: string;
  description?: string;
}

export interface TopContentItem {
  rank: number;
  name: string;
  detail: string;
}

export interface QuoteOfTheYearData {
  quote: string;
  date: string;
  description: string;
}

export interface MonthlyStat {
  /** 1~12 */
  month: number;
  broadcasts: number;
  hours: number;
}

/** STATISTICS 페이지 전체 데이터. src/data/statistics.ts에서 채운다. */
export interface StatisticsData {
  highlights: HighlightStat[];
  records: RecordStat[];
  topContents: TopContentItem[];
  topGames: TopContentItem[];
  quoteOfTheYear: QuoteOfTheYearData;
  monthly: MonthlyStat[];
}
