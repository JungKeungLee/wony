import { NextResponse, type NextRequest } from "next/server";
import {
  CONTRIBUTE_ALLOWED_PATHS,
  getBaseSiteMode,
  PREVIEW_COOKIE_NAME,
  PREVIEW_QUERY_KEY,
  type SiteMode,
} from "@/lib/siteMode";
import {
  createPreviewCookieValue,
  isValidPreviewKey,
  PREVIEW_COOKIE_MAX_AGE_SECONDS,
  verifyPreviewCookieValue,
} from "@/lib/previewAuth";

/**
 * WONY 팬사이트 · contribute(참여용 사전 공개) 모드에서 정식 공개용 URL을 직접
 * 입력해도 열리지 않도록 막는다. Navigation/Footer에서 메뉴를 숨기는 것만으로는
 * 부족하다는 요청에 따라, 모든 페이지 요청을 여기서 한 번 더 검사한다.
 *
 * Next.js 16부터 이 파일 규칙의 이름이 "middleware"에서 "proxy"로 바뀌었다
 * (node_modules/next/dist/docs/.../file-conventions/proxy.md 참고) - 동작은
 * middleware 시절과 동일하고, 파일명/함수명만 proxy로 바뀐 것이다.
 *
 * - public 모드(NEXT_PUBLIC_SITE_MODE=public)면 모든 요청을 public 정적 버전으로 연결한다.
 * - contribute 모드라도 FULL_PREVIEW_KEY와 일치하는 ?previewFull=값이 오면,
 *   이후 요청부터는 public처럼 보이도록 서명된 쿠키를 심어준다(개발자용 전체 미리보기).
 *   쿠키는 lib/previewAuth.ts의 HMAC 서명으로만 발급/검증한다 - 값을 임의로 넣어서는
 *   통과할 수 없다.
 * - 서명 쿠키가 유효하면 public 정적 버전, 아니면 CONTRIBUTE_ALLOWED_PATHS에 있는 경로만
 *   contribute 정적 버전으로 연결하고, 그 외 경로는 전부 "/"로 돌려보낸다.
 *
 * API 라우트(/api/*)는 페이지가 아니므로 모드와 무관하게 항상 통과시킨다 - VIDEO
 * 등록의 SOOP 썸네일 자동 추출 같은 기능은 contribute 모드에서도 정상 동작해야 한다.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const suppliedKey = request.nextUrl.searchParams.get(PREVIEW_QUERY_KEY);
  const signedCookieValue = isValidPreviewKey(suppliedKey) ? await createPreviewCookieValue() : null;

  if (signedCookieValue) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete(PREVIEW_QUERY_KEY);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(PREVIEW_COOKIE_NAME, signedCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PREVIEW_COOKIE_MAX_AGE_SECONDS,
    });
    return response;
  }

  if (getBaseSiteMode() === "public") {
    return rewriteToMode(request, "public");
  }

  const hasPreviewCookie = await verifyPreviewCookieValue(request.cookies.get(PREVIEW_COOKIE_NAME)?.value);
  if (hasPreviewCookie) {
    return rewriteToMode(request, "public");
  }

  if (CONTRIBUTE_ALLOWED_PATHS.includes(pathname)) {
    return rewriteToMode(request, "contribute");
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/";
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}

/**
 * 방문자 URL은 그대로 두고 내부적으로만 src/app/[mode]/ 아래의 정적 버전으로 연결한다
 * (/letters -> /contribute/letters). 모든 경로에 접두사를 붙이므로 방문자가
 * /public/archive처럼 내부 경로를 직접 입력해도 /…/public/archive가 되어 열리지 않는다.
 *
 * 같은 URL이 쿠키에 따라 다른 버전을 돌려주므로, 공유 캐시가 public 버전을 다른
 * 방문자에게 재사용하지 않도록 private + Vary: Cookie를 붙인다.
 */
function rewriteToMode(request: NextRequest, mode: SiteMode) {
  const url = request.nextUrl.clone();
  url.pathname = `/${mode}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;

  const response = NextResponse.rewrite(url);
  response.headers.set("Cache-Control", "private, no-cache");
  response.headers.set("Vary", "Cookie");
  return response;
}

export const config = {
  // _next 정적 자산과 확장자가 있는 파일(이미지/오디오/영상/favicon 등)은 검사 대상에서 뺀다.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
