import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

/**
 * "하이드레이션이 끝났는가"를 안전하게 읽는다. useEffect(() => setState(true), [])로
 * 직접 구현하면 set-state-in-effect 린트 규칙에 걸리기도 하고, 근본적으로
 * useSyncExternalStore가 서버/클라이언트 스냅샷을 분리해서 다루도록 설계된 정확한
 * 도구다: 서버(및 최초 클라이언트 렌더)에서는 항상 false를 반환해 마크업이 일치하고,
 * 하이드레이션 이후에만 true로 넘어간다. localStorage 등 클라이언트에만 있는 값을
 * 읽어서 렌더링을 분기해야 할 때(예: 방문자의 별 수집 상태) 이 값으로 게이트한다.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}
