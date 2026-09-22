"use client";

import { useState } from "react";
import { useSiteMode } from "@/context/SiteModeContext";

/**
 * 운영 테스트 기간 전용 화면 전환 패널. "관리자"는 지금까지 만든 전체 사이트를,
 * "고객"은 11월 사전 공개 때 일반 방문자가 볼 contribute 화면을 보여준다 -
 * 새로운 권한 체계가 아니라 기존 Full Preview 쿠키(wony_full_preview)를
 * /api/dev-preview로 켜고 끄는 것뿐이다(회원/로그인 시스템 아님).
 *
 * 11월 실제 배포 전에는 이 컴포넌트 파일과 layout.tsx의 사용처,
 * src/app/api/dev-preview/route.ts를 통째로 삭제할 예정이다 - 그래서 로직을
 * 사이트 곳곳에 흩어두지 않고 이 파일 하나로 독립시켰다.
 */
export default function OperationTestSwitcher() {
  const { isPreview } = useSiteMode();
  const [isSwitching, setIsSwitching] = useState(false);

  async function switchTo(enable: boolean) {
    if (isSwitching || enable === isPreview) return;
    setIsSwitching(true);
    try {
      await fetch("/api/dev-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable }),
      });
      // effectiveMode는 서버(RootLayout)가 쿠키를 읽어 계산하므로, 새 쿠키를
      // 반영하려면 서버 렌더를 다시 받아야 한다 - 이 패널은 임시 테스트용이라
      // 굳이 SPA 전환 없이 전체 새로고침으로 단순하게 처리한다.
      window.location.reload();
    } catch {
      setIsSwitching(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-center gap-1 border border-white/15 bg-black/75 px-2.5 py-2 text-center backdrop-blur-sm sm:bottom-5 sm:right-5 sm:px-3 sm:py-2.5">
      <span className="text-[8px] tracking-[0.15em] text-text-soft/60 sm:text-[9px]">
        운영 테스트
      </span>
      <div className="flex gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={() => switchTo(true)}
          disabled={isSwitching}
          aria-pressed={isPreview}
          className={`px-2 py-1 text-[9px] tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5 sm:text-[10px] ${
            isPreview
              ? "border border-star bg-star/20 text-star"
              : "border border-white/15 text-text-soft hover:text-star"
          }`}
        >
          관리자
        </button>
        <button
          type="button"
          onClick={() => switchTo(false)}
          disabled={isSwitching}
          aria-pressed={!isPreview}
          className={`px-2 py-1 text-[9px] tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5 sm:text-[10px] ${
            !isPreview
              ? "border border-pink bg-pink/20 text-pink"
              : "border border-white/15 text-text-soft hover:text-pink"
          }`}
        >
          고객
        </button>
      </div>
    </div>
  );
}
