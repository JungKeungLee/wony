import { notFound } from "next/navigation";

/**
 * 루트 레이아웃이 [mode] 아래에 있어서, 어떤 페이지에도 해당하지 않는 경로(public 모드의
 * 오타 URL 등)를 같은 레이아웃의 not-found.tsx로 보여주기 위한 catch-all. contribute
 * 모드에서는 proxy.ts가 허용 목록 밖의 경로를 먼저 "/"로 보내므로 여기까지 오지 않는다.
 */
export default function MissingPage() {
  notFound();
}
