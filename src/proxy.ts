import { NextResponse, type NextRequest } from "next/server";
import {
  CONTRIBUTE_ALLOWED_PATHS,
  getBaseSiteMode,
  PREVIEW_COOKIE_NAME,
  PREVIEW_QUERY_KEY,
} from "@/lib/siteMode";

const PREVIEW_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30일

/**
 * WONY 팬사이트 · contribute(참여용 사전 공개) 모드에서 정식 공개용 URL을 직접
 * 입력해도 열리지 않도록 막는다. Navigation/Footer에서 메뉴를 숨기는 것만으로는
 * 부족하다는 요청에 따라, 모든 페이지 요청을 여기서 한 번 더 검사한다.
 *
 * Next.js 16부터 이 파일 규칙의 이름이 "middleware"에서 "proxy"로 바뀌었다
 * (node_modules/next/dist/docs/.../file-conventions/proxy.md 참고) - 동작은
 * middleware 시절과 동일하고, 파일명/함수명만 proxy로 바뀐 것이다.
 *
 * - public 모드(NEXT_PUBLIC_SITE_MODE=public)면 아무 것도 하지 않는다.
 * - contribute 모드라도 FULL_PREVIEW_KEY와 일치하는 ?previewFull=값이 오면,
 *   이후 요청부터는 public처럼 보이도록 쿠키를 심어준다(개발자용 전체 미리보기).
 * - 그 외에는 CONTRIBUTE_ALLOWED_PATHS에 없는 경로를 전부 "/"로 돌려보낸다.
 *
 * API 라우트(/api/*)는 페이지가 아니므로 모드와 무관하게 항상 통과시킨다 - VIDEO
 * 등록의 SOOP 썸네일 자동 추출 같은 기능은 contribute 모드에서도 정상 동작해야 한다.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const previewKey = process.env.FULL_PREVIEW_KEY;
  const suppliedKey = request.nextUrl.searchParams.get(PREVIEW_QUERY_KEY);

  if (previewKey && suppliedKey && suppliedKey === previewKey) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete(PREVIEW_QUERY_KEY);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(PREVIEW_COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PREVIEW_COOKIE_MAX_AGE_SECONDS,
    });
    return response;
  }

  if (getBaseSiteMode() === "public") {
    return NextResponse.next();
  }

  const hasPreviewCookie = request.cookies.get(PREVIEW_COOKIE_NAME)?.value === "1";
  if (hasPreviewCookie) {
    return NextResponse.next();
  }

  if (CONTRIBUTE_ALLOWED_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/";
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  // _next 정적 자산과 확장자가 있는 파일(이미지/오디오/영상/favicon 등)은 검사 대상에서 뺀다.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
