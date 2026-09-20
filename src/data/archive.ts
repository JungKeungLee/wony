export type ArchiveItem = {
  id: string;
  date: string;
  title: string;
  description?: string;
  tags?: string[];
  uncertain?: boolean;
};

export type ArchiveMonth = {
  month: number;
  monthLabel: string;
  items: ArchiveItem[];
};

export const archiveData: ArchiveMonth[] = [
  {
    month: 1,
    monthLabel: "JANUARY",
    items: [
      {
        id: "2025-12-31-2026-01-01",
        date: "2025.12.31 ~ 2026.01.01",
        title: "송년회 및 신년",
        tags: ["기념방송"],
      },
      {
        id: "2026-01-02-01-07",
        date: "01.02 ~ 01.07",
        title: "배그 멸망전",
        description: "후팀",
        tags: ["배그", "대회"],
      },
      {
        id: "2026-01-09",
        date: "01.09",
        title: "25년 타임캡슐",
        description: "소라언니",
        tags: ["합방"],
      },
      {
        id: "2026-01-11",
        date: "01.11",
        title: "첫 커머스",
        tags: ["커머스"],
      },
      {
        id: "2026-01-15",
        date: "01.15",
        title: "마왕님 풀트 컨텐츠",
        description: "관광버스 및 배그 실험실",
        tags: ["풀트", "배그"],
      },
      {
        id: "2026-01-17",
        date: "01.17",
        title: "엔쥬배 친해지길 바래",
        description: "쥐스토랑",
        tags: ["합방"],
      },
      {
        id: "2026-01-19",
        date: "01.19",
        title: "꾸스터콜 및 나너니의 배그교실",
        tags: ["배그"],
      },
      {
        id: "2026-01-21",
        date: "01.21",
        title: "종겜데이",
        description: "Quarantine Zone: The Last Check 좀비검열",
        tags: ["종겜"],
      },
      {
        id: "2026-01-23",
        date: "01.23",
        title: "꾸한성 벽킬내기",
        tags: ["합방"],
      },
      {
        id: "2026-01-24",
        date: "01.24",
        title: "꾸행평가",
        tags: ["컨텐츠"],
      },
      {
        id: "2026-01-27",
        date: "01.27",
        title: "얼렁뚠딴",
        tags: ["컨텐츠"],
      },
      {
        id: "2026-01-28",
        date: "01.28",
        title: "개그배우기",
        description: "w. 노잼 미라클, 개그맨 이상호님",
        tags: ["합방", "컨텐츠"],
      },
      {
        id: "2026-01-29",
        date: "01.29",
        title: "뮤피아게임",
        tags: ["게임"],
      },
      {
        id: "2026-01-30",
        date: "01.30",
        title: "아이엠브랜드 vs 꾸한성",
        description: "로블록스",
        tags: ["로블록스", "합방"],
      },
      {
        id: "2026-01-31",
        date: "01.31",
        title: "마지막 노잼 미라클",
        tags: ["합방"],
      },
      {
        id: "2026-01-31-02-01",
        date: "01.31 ~ 02.01",
        title: "셀보이드",
        tags: ["게임"],
      },
    ],
  },

  {
    month: 2,
    monthLabel: "FEBRUARY",
    items: [
      {
        id: "2026-02-04-02-05",
        date: "02.04 ~ 02.05",
        title: "천벌서버",
        tags: ["서버"],
      },
      {
        id: "2026-02-05",
        date: "02.05",
        title: "DRX 서포터즈 선정",
        tags: ["이벤트"],
      },
      {
        id: "2026-02-07",
        date: "02.07",
        title: "꾸한성 노래컨텐츠 및 내수 킬내기",
        tags: ["노래", "합방"],
      },
      {
        id: "2026-02-09",
        date: "02.09",
        title: "Silent Breath / 미메시스",
        description: "공겜",
        tags: ["공겜", "게임"],
      },
      {
        id: "2026-02-14-1",
        date: "02.14",
        title: "꾸한성 셀키배 주식게임 도우미",
        tags: ["게임", "합방"],
      },
      {
        id: "2026-02-14-2",
        date: "02.14",
        title: "CODE NAME C.A.T",
        tags: ["게임"],
      },
      {
        id: "2026-02-15",
        date: "02.15",
        title: "KSL",
        tags: ["대회"],
      },
      {
        id: "2026-02-18",
        date: "02.18",
        title: "KSL 24시간 방송 벌칙",
        tags: ["대회", "벌칙"],
      },
      {
        id: "2026-02-19",
        date: "02.19",
        title: "퍼드 방탈출",
        tags: ["방탈출"],
      },
      {
        id: "2026-02-20-02-21",
        date: "02.20 ~ 02.21",
        title: "마크 용잡기",
        tags: ["마크"],
      },
      {
        id: "2026-02-22-03-02",
        date: "02.22 ~ 03.02",
        title: "릴동파 연습 및 대회기간",
        tags: ["대회"],
      },
    ],
  },

  {
    month: 3,
    monthLabel: "MARCH",
    items: [
      {
        id: "2026-03-08-03-09",
        date: "03.08 ~ 03.09",
        title: "워니의 숲 / 가야대 입학",
        description:
          "아바타요편 및 스캠라인(ㄴㄴ타요, ㄴㄴ 비챤), 가야대 입학(슬더스)",
        tags: ["합방", "슬더스"],
      },
      {
        id: "2026-03-10",
        date: "03.10",
        title: "아바타요 익명카톡",
        tags: ["합방"],
      },
      {
        id: "2026-03-13",
        date: "03.13",
        title: "가야대회",
        description: "릴파님 슬더스 대회, 15만딜",
        tags: ["슬더스", "대회"],
      },
      {
        id: "2026-03-14",
        date: "03.14",
        title: "꾸이즈원",
        tags: ["컨텐츠"],
      },
      {
        id: "2026-03-16",
        date: "03.16",
        title: "그림자 복도",
        tags: ["공겜", "게임"],
      },
      {
        id: "2026-03-16-03-18",
        date: "03.16, 03.18",
        title: "ㄴㄴ워니 합방",
        description: "마크 방탈출, 덕몽어스",
        tags: ["합방", "마크", "덕몽어스"],
      },
      {
        id: "2026-03-21",
        date: "03.21",
        title: "처니랜드",
        tags: ["컨텐츠"],
      },
      {
        id: "2026-03-24",
        date: "03.24",
        title: "타요배 피라미드 CK",
        description: "w. 떵규",
        tags: ["CK", "합방"],
      },
      {
        id: "2026-03-25",
        date: "03.25",
        title: "너니 생일",
        tags: ["기념방송"],
      },
      {
        id: "2026-03-29-04-08",
        date: "03.29 ~ 04.08",
        title: "충동서버",
        description: "펀딩 공약 및 서버 진행, 후열 - 시그춤, 바이애슬론 룰렛",
        tags: ["서버"],
      },
    ],
  },

  {
    month: 4,
    monthLabel: "APRIL",
    items: [
      {
        id: "2026-04-12",
        date: "04.12",
        title: "임하밍배 저울게임",
        description: "컨텐츠 직전까지 방송 안켬",
        tags: ["게임"],
      },
      {
        id: "2026-04-20",
        date: "04.20",
        title: "디진다 돈까스빵 쥐스토랑 / 첫 옵치 CK",
        tags: ["쥐스토랑", "오버워치", "CK"],
      },
      {
        id: "2026-04-23",
        date: "04.23",
        title: "난전워치",
        description: "나너니배 오버워치 미니게임",
        tags: ["오버워치", "미니게임"],
      },
      {
        id: "2026-04-24-04-25",
        date: "04.24 ~ 04.25",
        title: "금창서버",
        description: "후열 인생게임",
        tags: ["서버", "인생게임"],
      },
      {
        id: "2026-04-29",
        date: "04.29",
        title: "인생게임 CK",
        tags: ["인생게임", "CK"],
      },
      {
        id: "2026-04-30",
        date: "04.30",
        title: "굿바이 철쑤",
        tags: ["컨텐츠"],
      },
    ],
  },

  {
    month: 5,
    monthLabel: "MAY",
    items: [
      {
        id: "2026-05-01-05-14",
        date: "05.01 ~ 05.14",
        title: "숲크타",
        tags: ["서버"],
      },
      {
        id: "2026-05-18",
        date: "05.18",
        title: "해리배 크아대전 및 버컴과 RPG 연습",
        tags: ["크아", "RPG"],
      },
      {
        id: "2026-05-21-05-28",
        date: "05.21 ~ 05.28",
        title: "고래시티",
        description: "울큰고배 GTA 섭",
        tags: ["GTA", "서버"],
      },
    ],
  },

  {
    month: 6,
    monthLabel: "JUNE",
    items: [
      {
        id: "2026-06-03-06-18",
        date: "06.03 ~ 06.18?",
        title: "감놀",
        description: "선릿벨리",
        tags: ["컨텐츠"],
        uncertain: true,
      },
      {
        id: "2026-06-13-06-18",
        date: "06.13 ~ 06.18",
        title: "중놀",
        description: "하드코어 용잡이 및 후열",
        tags: ["마크"],
      },
      {
        id: "2026-06-20",
        date: "06.20",
        title: "수장님 vs 크루원 벽킬내기",
        tags: ["합방"],
      },
      {
        id: "2026-06-25",
        date: "06.25",
        title: "마크서든",
        tags: ["마크"],
      },
      {
        id: "2026-06-27",
        date: "06.27",
        title: "풀트데이",
        tags: ["풀트"],
      },
      {
        id: "2026-06-29-07-05",
        date: "06.29 ~ 07.05",
        title: "배그 멸망전",
        description: "뽀린걸 팀",
        tags: ["배그", "대회"],
      },
    ],
  },

  {
    month: 7,
    monthLabel: "JULY",
    items: [
      {
        id: "2026-07-06",
        date: "07.06",
        title: "꾸한성 메챠 카멜레온 합방",
        tags: ["합방"],
      },
      {
        id: "2026-07-11-1",
        date: "07.11",
        title: "꾸한성 공모전 및 삼연서버",
        tags: ["공모전", "서버"],
      },
      {
        id: "2026-07-11-07-13",
        date: "07.11 ~ 07.13",
        title: "데더다",
        tags: ["게임"],
      },
      {
        id: "2026-07-18-wonyland",
        date: "07.18",
        title: "워니랜드",
        tags: ["컨텐츠"],
      },
      {
        id: "2026-07-13-08-10",
        date: "07.13 ~ 08.10",
        title: "삼국지",
        description: "공부 및 연습, 서버 진행, 후열",
        tags: ["삼국지", "서버"],
      },
    ],
  },

  {
    month: 8,
    monthLabel: "AUGUST",
    items: [
      {
        id: "2026-08-12",
        date: "08.12",
        title: "수장님 vs 크루원 벽킬내기",
        tags: ["합방"],
      },
      {
        id: "2026-08-12-2",
        date: "08.12",
        title: "리나메",
        tags: ["게임"],
      },
      {
        id: "2026-08-14-08-16",
        date: "08.14 ~ 08.16",
        title: "스탈존",
        description: "연습 및 대회 진행",
        tags: ["대회"],
      },
      {
        id: "2026-08-24",
        date: "08.24",
        title: "어흐 공겜",
        tags: ["공포게임"],
        uncertain: true,
      },
      {
        id: "2026-08-25-08-30",
        date: "08.25 ~ 08.30",
        title: "아르마",
        description: "연습 및 대회 진행, 레드팀",
        tags: ["아르마", "대회"],
        uncertain: true,
      },
    ],
  },

  {
    month: 9,
    monthLabel: "SEPTEMBER",
    items: [
      {
        id: "2026-09-03-09-06",
        date: "09.03 ~ 09.06",
        title: "코드컵",
        description: "워크팀",
        tags: ["대회"],
        uncertain: true,
      },
      {
        id: "2026-09-11",
        date: "09.11",
        title: "제초동 합류",
        tags: ["컨텐츠"],
        uncertain: true,
      },
      {
        id: "2026-09-13-vr",
        date: "09.13",
        title: "천타버스 VR 목욕탕 물푸기",
        tags: ["VR"],
        uncertain: true,
      },
      {
        id: "2026-09-13-kusdong",
        date: "09.13",
        title: "첫 꾸스동",
        description: "Deep Blue Sushi",
        tags: ["꾸스동", "게임"],
      },
      {
        id: "2026-09-16",
        date: "09.16",
        title: "경찰과 도둑",
        description: "꾸한성편",
        tags: ["합방", "컨텐츠"],
      },
      {
        id: "2026-09-14-09-19",
        date: "09.14 ~ 09.19",
        title: "오성급 델타포스",
        description: "연습 및 대회",
        tags: ["델타포스", "대회"],
        uncertain: true,
      },
      {
        id: "2026-09-20",
        date: "09.20",
        title: "꾸스동",
        description: "WARDOGS FPS",
        tags: ["꾸스동", "FPS"],
      },
      {
        id: "2026-09-20-captured2",
        date: "09.20",
        title: "CAPTURED2",
        description: "공겜",
        tags: ["공겜", "게임"],
      },
    ],
  },
];

export const archiveNotice =
  "본 기록은 SOOP 다시보기와 팬 기록을 기준으로 정리되었으며, 일부 날짜 및 내용에 차이가 있을 수 있습니다.";
