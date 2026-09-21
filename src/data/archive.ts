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
        description: "소통",
        tags: ["기념방송"],
      },
      {
        id: "2026-01-02-01-07",
        date: "01.02 ~ 01.07",
        title: "배그 멸망전",
        description: "배틀그라운드, 후팀",
        tags: ["배그", "대회"],
      },
      {
        id: "2026-01-09",
        date: "01.09",
        title: "25년 타임캡슐",
        description: "소통, 소라언니",
        tags: ["합방"],
      },
      {
        id: "2026-01-11",
        date: "01.11",
        title: "첫 커머스",
        description: "맛있는 녀석들",
        tags: ["커머스"],
      },
      {
        id: "2026-01-15",
        date: "01.15",
        title: "관광버스 / 배그 실험실",
        description: "마왕님 주최, VR Chat / 배틀그라운드",
        tags: ["풀트", "합방", "배그"],
      },
      {
        id: "2026-01-17",
        date: "01.17",
        title: "엔쥬배 친해지길 바래",
        description: "쥐스토랑",
        tags: ["합방", "꾸한성"],
      },
      {
        id: "2026-01-19",
        date: "01.19",
        title: "꾸스터콜 / 나너니의 배그교실",
        description: "VR Chat / 배틀그라운드",
        tags: ["꾸한성", "합방", "배그"],
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
        description: "배틀그라운드",
        tags: ["꾸한성", "합방"],
      },
      {
        id: "2026-01-24",
        date: "01.24",
        title: "꾸행평가",
        description: "VR Chat, 난워니 주최",
        tags: ["꾸한성", "합방"],
      },
      {
        id: "2026-01-27",
        date: "01.27",
        title: "얼렁뚠딴",
        description: "딴딴2당 주최, 배틀그라운드",
        tags: ["꾸한성", "배그", "합방", "대회"],
      },
      {
        id: "2026-01-28",
        date: "01.28",
        title: "개그배우기",
        description: "노잼미라클, 개그맨 이상호님",
        tags: ["합방"],
      },
      {
        id: "2026-01-29",
        date: "01.29",
        title: "뮤피아게임",
        description: "다뮤 주최, VR Chat",
        tags: ["꾸한성", "합방"],
      },
      {
        id: "2026-01-30",
        date: "01.30",
        title: "아이엠브랜드 vs 꾸한성",
        description: "로블록스",
        tags: ["꾸한성", "대회"],
      },
      {
        id: "2026-01-31",
        date: "01.31",
        title: "마지막 노잼 미라클",
        description: "VR Chat",
        tags: ["풀트", "합방"],
      },
      {
        id: "2026-01-31-02-01",
        date: "01.31 ~ 02.01",
        title: "셀보이드",
        description: "셀키님 주최, 좀보이드",
        tags: ["꾸한성", "서버"],
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
        description: "천양님 주최, 마인크래프트 다이아 서버",
        tags: ["마크", "서버"],
      },
      {
        id: "2026-02-05",
        date: "02.05",
        title: "DRX 서포터즈 선정",
        description: "소통, LOL",
        tags: ["기념방송"],
      },
      {
        id: "2026-02-07",
        date: "02.07",
        title: "꾸한성 노래컨텐츠 / 내수 킬내기",
        description: "VR Chat / 배틀그라운드",
        tags: ["꾸한성", "노래", "합방", "배그", "대결"],
      },
      {
        id: "2026-02-09",
        date: "02.09",
        title: "공포게임 업보청산",
        description: "Silent Breath / 미메시스",
        tags: ["벌칙", "종겜"],
      },
      {
        id: "2026-02-14-1",
        date: "02.14",
        title: "주식게임 도우미",
        description: "셀키 주최, VR Chat",
        tags: ["꾸한성", "합방"],
      },
      {
        id: "2026-02-14-2",
        date: "02.14",
        title: "CODE NAME C.A.T",
        description: "소통",
        tags: ["풀트", "기념방송"],
      },
      {
        id: "2026-02-15",
        date: "02.15",
        title: "KSL",
        description: "배틀그라운드",
        tags: ["배그", "대회"],
      },
      {
        id: "2026-02-18",
        date: "02.18",
        title: "KSL 24시간 방송 벌칙",
        description: "스캠라인, 소통",
        tags: ["종겜", "합방", "벌칙"],
      },
      {
        id: "2026-02-19",
        date: "02.19",
        title: "퍼드 방탈출",
        description: "마인크래프트 방탈출",
        tags: ["마크", "꾸한성", "합방"],
      },
      {
        id: "2026-02-20-02-21",
        date: "02.20 ~ 02.21",
        title: "마크 용잡기",
        description: "마인크래프트 점령전, 난워니 주최",
        tags: ["마크", "꾸한성", "합방", "대결"],
      },
      {
        id: "2026-02-22-03-02",
        date: "02.22 ~ 03.02",
        title: "릴동파 연습 및 대회기간",
        description: "VR Chat, 릴파 주최",
        tags: ["풀트", "아바타요", "대회"],
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
        description: "VR Chat, 난워니 주최 / Slay the Spire2, 타요 주최",
        tags: ["아바타요", "합방", "슬더스"],
      },
      {
        id: "2026-03-10",
        date: "03.10",
        title: "아바타요 익명카톡",
        description: "후열",
        tags: ["아바타요", "합방"],
      },
      {
        id: "2026-03-13",
        date: "03.13",
        title: "가야대회",
        description: "Slay the Spire 2, 릴파 주최",
        tags: ["슬더스", "대회"],
      },
      {
        id: "2026-03-14",
        date: "03.14",
        title: "꾸이즈원",
        description: "VR Chat, 소통",
        tags: ["꾸한성", "기념방송"],
      },
      {
        id: "2026-03-16",
        date: "03.16",
        title: "공포게임 업보청산",
        description: "그림자 복도",
        tags: ["종겜", "벌칙"],
      },
      {
        id: "2026-03-16-03-18",
        date: "03.16, 03.18",
        title: "ㄴㄴ워니 합방",
        description: "난워니 주최, 마인크래프트 방탈출, 덕몽어스",
        tags: ["아바타요", "합방", "마크", "구구덕"],
      },
      {
        id: "2026-03-21",
        date: "03.21",
        title: "처니랜드",
        description: "천양님 주최, 배틀그라운드, 성태님 vs 박사장",
        tags: ["배그", "대회"],
      },
      {
        id: "2026-03-24",
        date: "03.24",
        title: "피라미드 CK",
        description: "타요님 주최, PYRAMIDION, 떵규",
        tags: ["종겜", "대회"],
      },
      {
        id: "2026-03-25",
        date: "03.25",
        title: "너니 생일",
        description: "소통",
        tags: ["기념방송"],
      },
      {
        id: "2026-03-29-04-08",
        date: "03.29 ~ 04.08",
        title: "충동서버",
        description: "VR Chat, 감스트 주최, 마인크래프트 RPG 서버, 술먹방",
        tags: ["풀트", "꾸한성", "마크", "서버"],
      },
    ],
  },

  {
    month: 4,
    monthLabel: "APRIL",
    items: [
      {
        id: "2026-04-12",
        date: "04.10",
        title: "저울게임",
        description: "임하밍 주최, VR Chat",
        tags: ["대결"],
      },
      {
        id: "2026-04-20",
        date: "04.20",
        title: "디진다 돈까스빵 쥐스토랑 / 첫 옵치 CK",
        description: "소통, 쥐스토랑, 오버워치",
        tags: ["꾸한성", "대결", "대회", "옵치", "종겜"],
      },
      {
        id: "2026-04-23",
        date: "04.23",
        title: "난전워치",
        description: "오버워치, 난워니 주최",
        tags: ["꾸한성", "대결", "옵치"],
      },
      {
        id: "2026-04-24-04-25",
        date: "04.23 ~ 04.25",
        title: "금창서버",
        description: "좀보이드, 제갈금자 주최",
        tags: ["서버"],
      },
      {
        id: "2026-04-29",
        date: "04.29",
        title: "인생게임 CK",
        description: "인생게임",
        tags: ["닌텐도", "대결"],
      },
      {
        id: "2026-04-30",
        date: "04.30",
        title: "굿바이 철쑤",
        description: "소통",
        tags: ["꾸한성"],
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
        description: "마인크래프트 PVE 서버, 강만식 주최",
        tags: ["마크", "서버"],
      },
      {
        id: "2026-05-18",
        date: "05.18",
        title: "해리배 크루대전 / 버컴과 RPG 연습",
        description: "크레이지아케이드, 해리 주최 / 마인크래프트",
        tags: ["크아", "마크", "꾸한성", "대결"],
      },
      {
        id: "2026-05-21-05-28",
        date: "05.21 ~ 05.28",
        title: "고래시티",
        description: "GTA, 울산큰고래 주최 서버",
        tags: ["그타", "서버"],
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
        title: "감블러의 놀이터",
        description: "마인크래프트 선릿벨리 모드팩",
        tags: ["마크", "서버"],
        uncertain: true,
      },
      {
        id: "2026-06-13-06-18",
        date: "06.13 ~ 06.18",
        title: "중력의 놀이터",
        description: "마인크래프트 하드코어 용잡이, 배틀그라운드",
        tags: ["마크", "배그", "합방"],
      },
      {
        id: "2026-06-20",
        date: "06.20",
        title: "수장님 vs 크루원 벽킬내기",
        description: "배틀그라운드",
        tags: ["배그", "대결"],
      },
      {
        id: "2026-06-25",
        date: "06.25",
        title: "마크서든",
        description: "마인크래프트 기반 서든어택, 중력 주최",
        tags: ["마크", "대결"],
      },
      {
        id: "2026-06-27",
        date: "06.27",
        title: "풀트데이",
        description: "VR Chat, 소통",
        tags: ["풀트"],
      },
      {
        id: "2026-06-29-07-05",
        date: "06.29 ~ 07.05",
        title: "배그 멸망전",
        description: "배틀그라운드, 뽀린걸 팀",
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
        description: "메챠 카멜레온",
        tags: ["꾸한성", "종겜", "합방"],
      },
      {
        id: "2026-07-11-1",
        date: "07.11",
        title: "꾸한성 공모전 / 삼연서버",
        description: "소통, 마인크래프트",
        tags: ["공모전", "마크", "서버"],
      },
      {
        id: "2026-07-11-07-13",
        date: "07.11 ~ 07.13",
        title: "종겜핀볼",
        description: "Dave the Dive",
        tags: ["종겜", "데더다"],
      },
      {
        id: "2026-07-18-wonyland",
        date: "07.18",
        title: "워니랜드",
        description: "배틀그라운드, 난워니 주최",
        tags: ["배그", "대회"],
      },
      {
        id: "2026-07-25-smoora",
        date: "07.25",
        title: "스모오라",
        description: "배틀그라운드, 우왁굳 주최",
        tags: ["배그", "대회"],
      },
      {
        id: "2026-07-13-08-10",
        date: "07.13 ~ 08.10",
        title: "삼국지",
        description: "공부, 연습, VR Chat, 마인크래프트 RPG 서버, 후열 소통",
        tags: ["풀트", "마크", "서버"],
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
        title: "수장 vs 크루원 벽킬내기",
        description: "배틀그라운드, 수장님들 리벤지 매치",
        tags: ["배그", "대결"],
      },
      {
        id: "2026-08-12-2",
        date: "08.12",
        title: "공포게임 업보청산",
        description: "리틀나이트메어",
        tags: ["종겜", "벌칙"],
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
        title: "공포게임 업보청산",
        description: "고독방송 深",
        tags: ["종겜", "벌칙"],
      },
      {
        id: "2026-08-25-08-30",
        date: "08.25 ~ 08.30",
        title: "아르마 대회",
        description: "아르마, 연습, 우왁굳 주최, 대회 진행, 레드팀",
        tags: ["대회"],
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
        description: "배틀그라운드, 킴성태 주최 워크팀",
        tags: ["대회"],
      },
      {
        id: "2026-09-06-kkuhanseong-1st",
        date: "09.06",
        title: "꾸한성 1주년",
        description: "꾸한성과 함께한 1년",
        tags: ["꾸한성", "기념방송"],
      },
      {
        id: "2026-09-11",
        date: "09.11",
        title: "제초동 합류",
        description: "FC26 프로리그",
        tags: ["종겜", "합방"],
      },
      {
        id: "2026-09-13-vr",
        date: "09.13",
        title: "천타버스 VR 목욕탕 물푸기",
        description: "VR Chat",
        tags: ["풀트", "대결"],
      },
      {
        id: "2026-09-13-kusdong",
        date: "09.13",
        title: "첫 꾸스동",
        description: "Deep Blue Sushi",
        tags: ["꾸한성", "종겜"],
      },
      {
        id: "2026-09-16",
        date: "09.16",
        title: "경찰과 도둑",
        description: "마인크래프트",
        tags: ["합방", "꾸한성", "마크"],
      },
      {
        id: "2026-09-14-09-19",
        date: "09.14 ~ 09.19",
        title: "오성급 델타포스 대회",
        description: "델타포스, 연습, 오아팀, 킴성태 오아 주최",
        tags: ["종겜", "대회"],
      },
      {
        id: "2026-09-20",
        date: "09.20",
        title: "꾸스동",
        description: "WARDOGS FPS",
        tags: ["종겜"],
      },
      {
        id: "2026-09-20-captured2",
        date: "09.20",
        title: "공포게임 업보청산",
        description: "CAPTURED2",
        tags: ["종겜", "벌칙"],
      },
    ],
  },
];

export const archiveNotice =
  "본 기록은 SOOP 다시보기와 팬 기록을 기준으로 정리되었으며, 일부 날짜 및 내용에 차이가 있을 수 있습니다.";
