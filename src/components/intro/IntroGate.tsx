"use client";

import { useEffect, useState } from "react";
import { useHasMounted } from "@/lib/useHasMounted";
import HomeExperience from "@/components/home/HomeExperience";
import IntroExperience from "./IntroExperience";

const SEEN_STORAGE_KEY = "wony_intro_seen";
const TEST_QUERY_KEY = "introTest";

function readIntroSeen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeIntroSeen() {
  try {
    window.sessionStorage.setItem(SEEN_STORAGE_KEY, "true");
  } catch {
    // 시크릿 모드 등에서 저장이 안 되더라도, 이번 세션 안에서는 계속 동작한다.
  }
}

type Status = "checking" | "intro" | "done";

/**
 * 사이트 첫 진입 오프닝(영상 → 스마트폰 → WONY 앱 클릭)을 보여줄지 결정한다. 같은
 * 세션에서 HOME으로 돌아올 때마다 반복되지 않도록 sessionStorage로 기억해두고,
 * 이미 본 상태라면 실제 HOME(HomeExperience)을 곧바로 렌더링한다. Hero 자체의
 * 시네마틱 오프닝이 Intro가 떠 있는 동안 미리 다 끝나버리지 않도록, HomeExperience는
 * Intro가 완전히 끝난 뒤에야 마운트한다.
 *
 * 개발용 테스트 모드: URL에 ?introTest=true가 있으면 sessionStorage 값을 무시하고
 * 항상 Intro를 다시 보여준다. 테스트 모드에서는 "봤음" 플래그를 읽지도 쓰지도 않아,
 * 반복 테스트가 실제 방문자의 1회성 연출 상태에 전혀 영향을 주지 않는다.
 */
export default function IntroGate() {
  const hasMounted = useHasMounted();
  const [hasLoadedSeen, setHasLoadedSeen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [hasLoadedTestMode, setHasLoadedTestMode] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [completed, setCompleted] = useState(false);

  // sessionStorage는 클라이언트에서만 읽을 수 있어 서버 렌더와 다를 수 있다. 마운트
  // 이후 첫 렌더에서(effect가 아니라 렌더 도중 직접) 실제 값을 한 번만 반영한다.
  if (hasMounted && !hasLoadedSeen) {
    setHasLoadedSeen(true);
    setSeen(readIntroSeen());
  }

  useEffect(() => {
    if (!hasMounted) return;
    // setTimeout으로 한 박자 늦춰서 호출한다 - effect 본문에서 곧장 setState하지 않고
    // 비동기 콜백 안에서만 하는, 이 프로젝트에서 자리잡은 패턴이다.
    const timer = setTimeout(() => {
      const testMode = new URLSearchParams(window.location.search).get(TEST_QUERY_KEY) === "true";
      setIsTestMode(testMode);
      setHasLoadedTestMode(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [hasMounted]);

  function handleIntroComplete() {
    if (!isTestMode) writeIntroSeen();
    setCompleted(true);
  }

  const status: Status =
    !hasLoadedSeen || !hasLoadedTestMode
      ? "checking"
      : completed || (seen && !isTestMode)
        ? "done"
        : "intro";

  if (status === "checking") return null;
  if (status === "intro") return <IntroExperience onComplete={handleIntroComplete} />;
  return <HomeExperience />;
}
