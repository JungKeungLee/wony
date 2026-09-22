import { NextResponse } from "next/server";
import { PREVIEW_COOKIE_NAME } from "@/lib/siteMode";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30일

/**
 * 운영 테스트 기간 전용 - <OperationTestSwitcher />의 [관리자]/[고객] 버튼이
 * 호출하는 라우트. 기존 Full Preview 쿠키(?previewFull=키 방식과 동일한 쿠키)를
 * 직접 켜고 끈다 - 별도의 판별/쿠키 체계를 새로 만들지 않고 기존 구조를 그대로
 * 재사용한다.
 *
 * 이 라우트는 (일반 회원 시스템이 아직 없는 지금 단계에 한해) 키 검증 없이
 * 누구나 호출할 수 있다 - 실제 11월 배포 전에 <OperationTestSwitcher />와 이
 * 파일을 통째로 삭제할 예정이므로, 그때까지만 존재하는 임시 테스트용 스위치다.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const enable = (body as { enable?: unknown } | null)?.enable === true;

  const response = NextResponse.json({ ok: true, enabled: enable });
  if (enable) {
    response.cookies.set(PREVIEW_COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
    });
  } else {
    response.cookies.set(PREVIEW_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}
