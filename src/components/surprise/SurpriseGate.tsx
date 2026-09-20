"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHasMounted } from "@/lib/useHasMounted";
import { readSurpriseUnlocked } from "@/lib/surpriseAccess";
import SurpriseExperience from "./SurpriseExperience";

type AccessStatus = "checking" | "allowed" | "denied";

/**
 * /surprise는 별 7개를 모두 모아야("surpriseUnlocked") 볼 수 있다. 개발 환경에서는
 * 테스트 편의를 위해 우회를 허용하지만, 이 값은 빌드 시점에 고정되는
 * process.env.NODE_ENV라서 프로덕션 빌드에서는 절대 true가 될 수 없다.
 */
const DEV_BYPASS = process.env.NODE_ENV !== "production";

export default function SurpriseGate() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const [status, setStatus] = useState<AccessStatus>("checking");

  // localStorage는 클라이언트에서만 읽을 수 있어 서버 렌더와 다를 수 있다. 마운트 이후
  // 첫 렌더에서(effect가 아니라 렌더 도중 직접) 실제 값을 한 번만 반영한다.
  if (hasMounted && status === "checking") {
    setStatus(DEV_BYPASS || readSurpriseUnlocked() ? "allowed" : "denied");
  }

  useEffect(() => {
    if (status !== "denied") return;
    const timer = setTimeout(() => router.replace("/"), 1800);
    return () => clearTimeout(timer);
  }, [status, router]);

  if (status === "checking") return null;

  if (status === "denied") {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
        <span aria-hidden className="text-xl text-star">
          ✦
        </span>
        <p className="font-serif-kr text-text-soft">아직 마지막 페이지를 찾지 못했어요 ✦</p>
      </main>
    );
  }

  return <SurpriseExperience />;
}
