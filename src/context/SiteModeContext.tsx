"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { SiteMode } from "@/lib/siteMode";

interface SiteModeContextValue {
  /** true면 참여용 사전 공개 모드다 - LETTER/FAN ART/VIDEO 외의 기능은 화면에서
   * 렌더링 자체를 하지 않아야 한다(숨김이 아니라 애초에 그리지 않음). */
  isContributeMode: boolean;
  /** effectiveMode === "public"과 동일. Full Preview로 들어온 경우도 true다. */
  isPublicMode: boolean;
  /** true면 지금 이 방문자가 Full Preview로 인증된 상태다(참고용 - 렌더 분기는
   * isContributeMode/isPublicMode만으로 충분하다). */
  isPreview: boolean;
}

const SiteModeContext = createContext<SiteModeContextValue | null>(null);

interface SiteModeProviderProps {
  /** 이 요청의 "실제 적용" 모드 - 기본 모드에 Full Preview 여부까지 반영된 최종 값.
   * RootLayout(서버 컴포넌트)이 쿠키를 읽어 계산해서 내려준다. */
  effectiveMode: SiteMode;
  isPreview: boolean;
  children: ReactNode;
}

/** 사이트 전체에서 contribute/public 여부를 판단하는 단일 기준. 이 Provider보다
 * 아래에 있는 컴포넌트는 어디서든 useSiteMode()로 같은 값을 읽는다. */
export function SiteModeProvider({ effectiveMode, isPreview, children }: SiteModeProviderProps) {
  const value = useMemo<SiteModeContextValue>(
    () => ({
      isContributeMode: effectiveMode === "contribute",
      isPublicMode: effectiveMode === "public",
      isPreview,
    }),
    [effectiveMode, isPreview]
  );

  return <SiteModeContext.Provider value={value}>{children}</SiteModeContext.Provider>;
}

export function useSiteMode() {
  const ctx = useContext(SiteModeContext);
  if (!ctx) {
    throw new Error("useSiteMode는 SiteModeProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
