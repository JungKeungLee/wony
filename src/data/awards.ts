export interface AwardWinner {
  /** 수상작 제목(대괄호는 화면에서 컴포넌트가 붙인다). */
  title: string;
  /** 수상 이유를 짧게 설명하는 한두 줄. */
  description: string;
}

interface AwardsData {
  bestContent: AwardWinner;
  bestGame: AwardWinner;
  bestCollab: AwardWinner;
  legendaryMoment: AwardWinner;
}

/**
 * WONY AWARDS 2026 프로토타입 전용 placeholder 데이터.
 * 실제 수상작이 정해지면 이 값들만 바꾸면 된다 - 새 Supabase 테이블/스키마는
 * 만들지 않았다.
 *
 * BEST VIDEO OF THE YEAR는 여기서 관리하지 않는다 - 기존 videos 테이블의
 * best_rank(1~3)를 그대로 재사용한다(src/components/awards/BestVideoAward.tsx).
 */
export const AWARDS_DATA: AwardsData = {
  bestContent: {
    title: "콘텐츠 제목",
    description: "2026년,\n워냥이들과 함께 가장 많이 웃었던 순간.",
  },
  bestGame: {
    title: "게임명",
    description: "짧은 설명 한 줄.",
  },
  bestCollab: {
    title: "합방 제목",
    description: "함께해서 더 즐거웠던 순간.",
  },
  legendaryMoment: {
    title: "2026년의 특별한 장면",
    description: "2026년을 이야기할 때\n빼놓을 수 없는 한 장면.",
  },
};
