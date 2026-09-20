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
