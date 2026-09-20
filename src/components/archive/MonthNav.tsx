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
  );
}
