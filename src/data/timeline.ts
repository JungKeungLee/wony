import type { TimelineMonthData } from "@/lib/types";

/**
 * 2026 Timeline 샘플 데이터.
 * 실제 사진이 준비되면 images 배열의 경로만 교체하면 된다.
 * (public/images/timeline/{월}/ 폴더에 파일을 넣고 경로를 맞추면 됨)
 * images[0]은 대표 이미지, 나머지는 추가 이미지로 사용된다.
 */
export const TIMELINE_DATA: TimelineMonthData[] = [
  {
    month: 1,
    monthLabel: "JANUARY",
    date: "2026.01",
    title: "2026년의 시작",
    description: "새로운 한 해가 시작되었습니다.",
    quote: "올해도 함께 좋은 추억을 만들어가요.",
    images: [
      "/images/timeline/01/01.webp",
      "/images/timeline/01/02.webp",
      "/images/timeline/01/03.webp",
    ],
  },
  {
    month: 2,
    monthLabel: "FEBRUARY",
    date: "2026.02",
    title: "짧지만 따뜻했던 겨울",
    description: "추운 날씨에도 마음만은 따뜻했던 시간이었어요.",
    quote: "함께라서 춥지 않았어요.",
    images: ["/images/timeline/02/01.webp", "/images/timeline/02/02.webp"],
  },
  {
    month: 3,
    monthLabel: "MARCH",
    date: "2026.03",
    title: "봄의 시작과 함께",
    description: "새 학기처럼 설레는 순간들이 있었습니다.",
    quote: "봄바람과 함께 찾아온 반가운 소식.",
    images: [
      "/images/timeline/03/01.webp",
      "/images/timeline/03/02.webp",
      "/images/timeline/03/03.webp",
    ],
  },
  {
    month: 4,
    monthLabel: "APRIL",
    date: "2026.04",
    title: "벚꽃과 함께한 순간",
    description: "만개한 벚꽃 아래에서 함께 걸었던 봄날.",
    quote: "이 계절이 오래도록 기억에 남기를.",
    images: ["/images/timeline/04/01.webp", "/images/timeline/04/02.webp"],
  },
  {
    month: 5,
    monthLabel: "MAY",
    date: "2026.05",
    title: "감사한 계절, 5월",
    description: "가정의 달을 맞아 더 따뜻해진 마음을 나눴습니다.",
    quote: "고마운 마음을 담아 전합니다.",
    images: [
      "/images/timeline/05/01.webp",
      "/images/timeline/05/02.webp",
      "/images/timeline/05/03.webp",
    ],
  },
  {
    month: 6,
    monthLabel: "JUNE",
    date: "2026.06",
    title: "여름을 준비하며",
    description: "무더위가 시작되기 전, 차분히 다음을 준비한 시간.",
    quote: "천천히, 그러나 꾸준히.",
    images: ["/images/timeline/06/01.webp", "/images/timeline/06/02.webp"],
  },
  {
    month: 7,
    monthLabel: "JULY",
    date: "2026.07",
    title: "뜨거운 여름의 한가운데",
    description: "무더운 여름, 그만큼 뜨거웠던 순간들.",
    quote: "여름보다 뜨거웠던 우리의 마음.",
    images: [
      "/images/timeline/07/01.webp",
      "/images/timeline/07/02.webp",
      "/images/timeline/07/03.webp",
    ],
  },
  {
    month: 8,
    monthLabel: "AUGUST",
    date: "2026.08",
    title: "한여름 밤의 기억",
    description: "무더위 속에서도 잊지 못할 밤들이 있었습니다.",
    quote: "이 여름을 오래도록 기억할게요.",
    images: ["/images/timeline/08/01.webp", "/images/timeline/08/02.webp"],
  },
  {
    month: 9,
    monthLabel: "SEPTEMBER",
    date: "2026.09",
    title: "선선해진 바람과 함께",
    description: "여름이 지나고 선선한 바람이 불어오기 시작했어요.",
    quote: "계절이 바뀌어도 마음은 그대로.",
    images: [
      "/images/timeline/09/01.webp",
      "/images/timeline/09/02.webp",
      "/images/timeline/09/03.webp",
    ],
  },
  {
    month: 10,
    monthLabel: "OCTOBER",
    date: "2026.10",
    title: "단풍처럼 물든 순간들",
    description: "가을 단풍처럼 알록달록했던 하루하루.",
    quote: "물들어가는 계절 속 우리의 이야기.",
    images: ["/images/timeline/10/01.webp", "/images/timeline/10/02.webp"],
  },
  {
    month: 11,
    monthLabel: "NOVEMBER",
    date: "2026.11",
    title: "한 해를 돌아보며",
    description: "어느새 한 해의 끝이 보이기 시작한 11월.",
    quote: "남은 시간도 함께 걸어가요.",
    images: [
      "/images/timeline/11/01.webp",
      "/images/timeline/11/02.webp",
      "/images/timeline/11/03.webp",
    ],
  },
  {
    month: 12,
    monthLabel: "DECEMBER",
    date: "2026.12",
    title: "2026년의 마지막 페이지",
    description: "올 한 해 함께해준 모든 순간에 감사드립니다.",
    quote: "내년에도, 그다음 해에도 계속 함께하길.",
    images: [
      "/images/timeline/12/01.webp",
      "/images/timeline/12/02.webp",
      "/images/timeline/12/03.webp",
      "/images/timeline/12/04.webp",
    ],
    featured: true,
  },
];
