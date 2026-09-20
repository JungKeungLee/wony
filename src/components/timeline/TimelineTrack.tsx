"use client";

import { useState } from "react";
import type { TimelineMonthData } from "@/lib/types";
import TimelineMonth from "./TimelineMonth";
import ImageModal, { type ImageModalState } from "./ImageModal";

export default function TimelineTrack({ months }: { months: TimelineMonthData[] }) {
  const [modal, setModal] = useState<ImageModalState | null>(null);

  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.16)_6%,rgba(255,255,255,0.16)_94%,transparent_100%)] md:block"
      />

      <div className="flex flex-col gap-20 md:gap-28">
        {months.map((data, i) => (
          <TimelineMonth
            key={data.month}
            data={data}
            align={i % 2 === 0 ? "left" : "right"}
            onOpenImage={(images, index, alt) => setModal({ images, index, alt })}
          />
        ))}
      </div>

      <ImageModal
        state={modal}
        onClose={() => setModal(null)}
        onNavigate={(index) => setModal((prev) => (prev ? { ...prev, index } : prev))}
      />
    </section>
  );
}
