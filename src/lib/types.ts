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

/**
 * Supabase timeline_images 테이블 한 행. TimelineMonthData.month와 연결되는
 * "관리자가 직접 업로드한" 이미지로, 대표 이미지(is_cover = true, 월당 최대 1장)와
 * 작은 이미지(is_cover = false, sort_order 1~3, 월당 최대 3장) 둘 다를 나타낸다.
 * 대표 이미지가 없으면 기존처럼 TimelineMonthData.images[0](정적 fallback, 아직 실제
 * 파일이 없으면 Placeholder)이 보인다.
 */
export interface TimelineImageRow {
  id: string;
  month: number;
  /** Storage 객체 경로. 공개 URL은 getTimelineImageUrl()로 계산한다. */
  image_path: string;
  is_cover: boolean;
  /** 작은 이미지 슬롯 순서(1~3). 대표 이미지는 항상 null. */
  sort_order: number | null;
  created_at: string;
  updated_at: string;
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

/**
 * Supabase fan_arts 테이블 한 행. nickname/title/message는 더 이상 입력받지 않아 항상
 * null로 저장되지만(신규 등록 기준), 과거에 값이 있던 기존 데이터를 위해 타입은
 * nullable로 유지한다 - 화면에서는 어느 쪽이든 표시하지 않는다.
 */
export interface FanArt {
  id: string;
  nickname: string | null;
  title: string | null;
  message: string | null;
  /** Storage 객체 경로. 공개 URL은 getFanArtImageUrl()로 계산한다. */
  image_path: string;
  is_approved: boolean;
  created_at: string;
}

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

/**
 * 영상 등록 시 클라이언트가 채우는 값. nickname/message는 더 이상 화면에서 입력받지
 * 않으므로 여기 포함하지 않는다(실제 INSERT 시 lib/videos.ts가 내부적으로 채운다).
 * best_rank도 폼에 노출하지 않고 관리자가 별도로 설정한다.
 */
export type VideoInput = Pick<
  VideoItem,
  "title" | "platform" | "video_url" | "video_id" | "month" | "category"
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

/**
 * Supabase archive_comments 테이블 한 행 ("그날의 기록 / MEMORY NOTE").
 * src/data/archive.ts의 ArchiveItem.id와 archive_id로 1:1 연결된다(항목당 코멘트 1개).
 */
export interface ArchiveComment {
  id: string;
  archive_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase archive_entries 테이블 한 행. ARCHIVE의 기본 데이터(날짜/메인주제/서브주제/
 * 해시태그)를 담는다 - src/data/archive.ts의 정적 배열을 대체하는 실시간 소스다.
 * archive_id는 archive_images/archive_comments와 동일한 값으로 계속 연결되므로
 * 절대 바꾸지 않는다(수정 가능한 값은 date/title/description/tags뿐).
 */
export interface ArchiveEntryRow {
  id: string;
  archive_id: string;
  date: string;
  title: string;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  /** null이면 삭제되지 않은 기록. 값이 있으면 soft delete된 시각(화면에서는 숨겨진다). */
  deleted_at: string | null;
}

/** ARCHIVE 기록 등록/수정 시 클라이언트가 채우는 값. archive_id는 서버(클라이언트 코드)가 자동 생성한다. */
export interface ArchiveEntryInput {
  date: string;
  title: string;
  description: string | null;
  tags: string[];
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
