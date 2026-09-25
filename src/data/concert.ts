/**
 * GOOD BYE SUMMER · 난워니 미니콘서트(2026.09.30) 프로모션 페이지 전용 데이터.
 * 날짜/문구/셋리스트/갤러리/응원 메시지를 이 파일 하나에서만 관리한다 - 실제 곡명
 * 공개, 사진 추가, 응원 메시지 실데이터 연동 등은 모두 이 배열들만 바꾸면 된다.
 */

export type ConcertGalleryCategory = "poster" | "teaser" | "photo" | "video";

/** image가 null이면 아직 실제 파일이 없다는 뜻이라, 화면에서는 자리표시(placeholder) 카드로 보여준다. */
export interface ConcertGalleryItem {
  id: string;
  category: ConcertGalleryCategory;
  label: string;
  caption?: string;
  image: string | null;
}

/**
 * 이번 미니콘서트는 정확히 3곡만 부른다 - 배열 길이를 임의로 늘리지 않는다.
 * revealed가 false인 동안은 title 대신 항상 "??????"를 보여준다. 실제 곡이
 * 공개되면 title을 실제 제목으로 바꾸고 revealed를 true로만 바꾸면 된다.
 */
export interface ConcertSetListItem {
  number: string;
  title: string;
  revealed: boolean;
}

/** 응원 메시지는 아직 UI만 구현하며(운영 DB 구조에 영향 없도록) 아래 배열이 유일한 데이터 소스다. */
export interface ConcertCheerMessage {
  id: string;
  nickname: string;
  content: string;
  timeAgo: string;
  likes: number;
}

export const CONCERT_TITLE_LINE_1 = "GOOD BYE";
export const CONCERT_TITLE_LINE_2 = "SUMMER";
export const CONCERT_SUBTITLE_KO = "난워니 미니콘서트";
export const CONCERT_SUBTITLE_EN = "nanwony mini concert";
export const CONCERT_ARTIST = "워니";
export const CONCERT_ARTIST_EN = "NANWONY";

/** 콘서트 시작 시각. 실제 시간이 정해지면 이 값 하나만 바꾸면 카운트다운/문구가 모두 따라간다. */
export const CONCERT_DATE = new Date("2026-09-30T19:00:00+09:00");
export const CONCERT_DATE_LABEL = "2026.09.30 (수)";
export const CONCERT_DATE_SHORT = "2026.09.30";

export const CONCERT_HERO_EYEBROW = ["여름의 끝,", "그리고", "새로운 계절로"];
export const CONCERT_HERO_QUOTE = ["여름의 마지막 밤,", "우리 다시 만나요 ♡"];

export const CONCERT_MESSAGE_LINES = [
  "여름의 마지막 페이지를",
  "워니와 함께 장식합니다.",
  "",
  "뜨거웠던 여름이 지나고",
  "조금은 선선해진 어느 날,",
  "",
  "노래와 이야기로 함께하는",
  "특별한 시간에 초대합니다.",
];
export const CONCERT_MESSAGE_CLOSING = ["우리의 여름 마지막 밤에서", "다시 만나요 ♡"];

export const CONCERT_SET_LIST_TAGLINE = ["오늘 워니가 들려줄", "세 개의 노래는 무엇일까요? ♡"];

/** 정확히 3곡 - 늘리거나 줄이지 않는다. */
export const CONCERT_SET_LIST: ConcertSetListItem[] = [
  { number: "01", title: "??????", revealed: false },
  { number: "02", title: "??????", revealed: false },
  { number: "03", title: "??????", revealed: false },
];

/** 아직 실제 이미지가 없어 image는 전부 null(placeholder)로 둔다 - 나중에 경로만 채우면 된다. */
export const CONCERT_GALLERY_ITEMS: ConcertGalleryItem[] = [
  { id: "poster-01", category: "poster", label: "POSTER 01", caption: CONCERT_DATE_SHORT, image: null },
  { id: "teaser-d7", category: "teaser", label: "D-7", caption: "여름의 끝, 그리고", image: null },
  { id: "teaser-d3", category: "teaser", label: "D-3", caption: "조금만, 더 기다려줘", image: null },
  { id: "teaser-d1", category: "teaser", label: "D-1", caption: "다시, 만나요 ♡", image: null },
];

export const CONCERT_CHEER_MESSAGES: ConcertCheerMessage[] = [
  {
    id: "1",
    nickname: "여름바람",
    content: "워니의 노래는 언제나\n내 계절을 특별하게 만들어줘요.\n이번에도 함께할게요 ♡",
    timeAgo: "3시간 전",
    likes: 127,
  },
  {
    id: "2",
    nickname: "달빛냥이",
    content: "좋은 음악으로 다시 만나게 해줘서 고마워요.\n워니의 새로운 계절도 언제나 응원해요!",
    timeAgo: "5시간 전",
    likes: 89,
  },
  {
    id: "3",
    nickname: "워니만의별",
    content: "여름이 끝나도,\n워니와 함께라면 늘 좋은 계절일 거예요.\n기다리고 있어요! ♡",
    timeAgo: "9시간 전",
    likes: 156,
  },
];

export const CONCERT_ENDING_LINES = [
  "뜨거웠던 우리의 여름 끝에서",
  "",
  "그리고",
  "새로운 계절의 시작에서",
  "",
  "다시 만나요.",
];
