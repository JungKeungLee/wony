"use client";

import StatCard from "./StatCard";
import { BROADCAST_STATS_2026 } from "@/data/broadcastStats";
import type { HighlightStat } from "@/lib/types";

/**
 * BY THE NUMBERS 카드 4개 - 실제 2026년 집계 데이터(BROADCAST_STATS_2026)에서
 * 직접 계산한다. 숫자를 여기 두 번 적지 않도록, 원본 값은 전부
 * src/data/broadcastStats.ts 한 곳에서만 관리한다.
 *
 * "use client" 컴포넌트로 따로 뺀 이유: format 함수를 Server Component인
 * page.tsx에서 직접 만들어 StatCard(Client Component)에 prop으로 넘기면
 * "함수는 Client Component에 직접 전달할 수 없다"는 RSC 직렬화 오류가 난다.
 */
const BY_THE_NUMBERS: HighlightStat[] = [
  {
    value: BROADCAST_STATS_2026.vodCount,
    label: "VODS",
    description: "2026년 방송 다시보기",
  },
  {
    value: BROADCAST_STATS_2026.broadcastDays,
    label: "DAYS ON AIR",
    description: "워니가 방송을 켠 날",
  },
  {
    value: BROADCAST_STATS_2026.totalHours,
    label: "TOGETHER",
    description: "함께한 총 방송시간",
    format: (v) => `${Math.round(v).toLocaleString("en-US")}H`,
  },
  {
    value: BROADCAST_STATS_2026.averageHours,
    secondaryValue: BROADCAST_STATS_2026.averageMinutes,
    label: "AVERAGE",
    description: "방송을 켜면 평균 이만큼",
    format: (h, m) => `${Math.round(h)}H ${Math.round(m)}M`,
    // "9H 52M"은 공백에서 자연스럽게 두 줄(9H / 52M)로 꺾여도 괜찮다 -
    // 평균이 10시간을 넘어가도(예: "10H 15M") 한 줄을 억지로 유지하지 않는다.
    allowWrap: true,
  },
];

export default function ByTheNumbersSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-16">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {BY_THE_NUMBERS.map((highlight, i) => (
          <StatCard key={highlight.label} {...highlight} delay={i * 0.1} />
        ))}
      </div>
    </section>
  );
}
