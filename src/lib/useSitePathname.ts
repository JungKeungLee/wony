"use client";

import { usePathname } from "next/navigation";
import { stripModePrefix } from "@/lib/siteMode";

/**
 * usePathname() 대신 쓰는 훅 - 내부 mode 접두사(/contribute, /public)를 뗀 방문자 기준
 * 경로를 돌려준다. 정적 생성(서버)과 브라우저 양쪽에서 같은 값이 나오므로 hydration
 * 불일치 없이 "/surprise" 같은 원래 경로와 그대로 비교할 수 있다.
 */
export function useSitePathname(): string {
  return stripModePrefix(usePathname() ?? "/");
}
