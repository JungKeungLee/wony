/**
 * ARCHIVE의 date 문자열("01.15", "03.29 ~ 04.08", "03.16, 03.18",
 * "06.03 ~ 06.18?", "2025.12.31 ~ 2026.01.01" 등)에서 월/정렬 순서를 뽑아낸다.
 * archive_entries 테이블에는 month 컬럼이 없으므로(date만 저장), 화면에 뿌릴 때
 * 항상 이 함수들로 다시 계산한다.
 */

interface MonthDay {
  month: number;
  day: number;
}

function clampMonth(month: number): number {
  return month >= 1 && month <= 12 ? month : 1;
}

/** "01.15" -> {month:1, day:15}, "2026.01.01" -> {month:1, day:1} */
function extractMonthDay(token: string): MonthDay | null {
  const trimmed = token.trim();
  // 4자리 연도 + . + MM + . + DD (예: 2026.01.01) - 반드시 이 패턴을 먼저 시도해야
  // 아래의 느슨한 MM.DD 패턴이 연도 뒷부분을 잘못 집는 것을 막을 수 있다.
  let m = trimmed.match(/^\d{4}\.(\d{1,2})\.(\d{1,2})/);
  if (m) return { month: parseInt(m[1], 10), day: parseInt(m[2], 10) };

  m = trimmed.match(/^(\d{1,2})\.(\d{1,2})/);
  if (m) return { month: parseInt(m[1], 10), day: parseInt(m[2], 10) };

  return null;
}

/** date 문자열의 첫 유효 토큰 하나를 뽑는다("~"/","로 나뉜 표기 모두 대응). */
function firstToken(date: string): string {
  return date.trim().split("~")[0].split(",")[0].trim();
}

/**
 * date 문자열이 속하는 월(1~12)을 계산한다. "2025.12.31 ~ 2026.01.01"처럼 4자리
 * 연도로 시작하는 연말 표기는 "~" 뒤(다음 해) 날짜의 월을 기준으로 삼는다 -
 * 기존 archive.ts에서도 이 항목이 JANUARY 섹션 맨 앞에 있었던 것과 같은 규칙이다.
 */
export function parseArchiveMonth(date: string): number {
  const trimmed = date.trim();
  if (/^\d{4}\./.test(trimmed)) {
    const parts = trimmed.split("~");
    const target = parts.length > 1 ? parts[1] : parts[0];
    const parsed = extractMonthDay(target);
    return clampMonth(parsed?.month ?? 1);
  }
  const parsed = extractMonthDay(firstToken(trimmed));
  return clampMonth(parsed?.month ?? 1);
}

/**
 * 같은 월 안에서의 정렬 키. 연말 특수 표기(4자리 연도로 시작)는 해당 월의 맨 앞에
 * 오도록 -1을 반환하고, 그 외에는 시작일(day)을 그대로 쓴다.
 */
export function parseArchiveSortKey(date: string): number {
  const trimmed = date.trim();
  if (/^\d{4}\./.test(trimmed)) return -1;
  const parsed = extractMonthDay(firstToken(trimmed));
  return parsed?.day ?? 0;
}
