import HiddenStar from "@/components/effects/HiddenStar";

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export default function MonthNav() {
  return (
    <>
      <nav
        aria-label="월 바로가기"
        className="sticky top-16 z-30 border-y border-white/10 bg-bg/85 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 py-3 sm:justify-center sm:gap-2 sm:px-6">
          {MONTH_LABELS.map((label, i) => (
            <a
              key={label}
              href={`#month-${i + 1}`}
              className="shrink-0 px-3 py-1.5 text-xs tracking-[0.15em] text-text-soft transition-colors hover:text-pink"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
      {/* 스크롤 가능한 월 탭 줄 위에 다이아를 겹치면 탭 클릭을 방해할 수 있어, nav
          바로 아래(다음 섹션이 시작되기 전 여백)에 살짝 걸치도록 배치한다. */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <HiddenStar id="archive" variant="archive-month-tabs" className="absolute right-2 top-1" />
      </div>
    </>
  );
}
