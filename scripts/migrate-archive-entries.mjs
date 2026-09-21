// WONY 팬사이트 · archive.ts -> Supabase archive_entries 마이그레이션 스크립트
//
// src/data/archive.ts의 기존 ARCHIVE 데이터(date/title/description/tags)를 그대로
// 읽어서 Supabase archive_entries 테이블로 옮긴다. 한글 텍스트를 SQL 문자열로 손으로
// 옮기다 생기는 실수를 피하려고, 실제 archive.ts를 그대로 import해서 REST API로
// 올린다. 기존 id를 archive_id로 그대로 사용하므로 archive_images/archive_comments
// 연결은 전혀 깨지지 않는다.
//
// 실행 전: supabase/archive_entries.sql을 먼저 Supabase SQL Editor에서 실행해서
// 테이블 + RLS를 만들어 둬야 한다.
//
// 실행 방법 (프로젝트 루트에서):
//   node --env-file=.env.local scripts/migrate-archive-entries.mjs
//
// 이미 옮겨진 archive_id는 건너뛰므로 여러 번 실행해도 안전하다.

import { archiveData } from "../src/data/archive.ts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 환경변수가 없습니다.\n" +
      "다음처럼 .env.local을 함께 불러와서 실행해주세요:\n" +
      "  node --env-file=.env.local scripts/migrate-archive-entries.mjs"
  );
  process.exit(1);
}

const items = archiveData.flatMap((month) => month.items);
console.log(`archive.ts에서 ${items.length}개 항목을 읽었습니다. archive_entries로 옮깁니다...`);

let migrated = 0;
let skipped = 0;
let failed = 0;

for (const item of items) {
  // 이미 같은 archive_id가 있으면 건너뛴다 - 재실행해도 중복 등록되지 않는다.
  const existingRes = await fetch(
    `${SUPABASE_URL}/rest/v1/archive_entries?archive_id=eq.${encodeURIComponent(item.id)}&select=id`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const existing = await existingRes.json();
  if (Array.isArray(existing) && existing.length > 0) {
    skipped++;
    continue;
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/archive_entries`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      archive_id: item.id,
      date: item.date,
      title: item.title,
      description: item.description ?? null,
      tags: item.tags ?? [],
    }),
  });

  if (res.ok) {
    migrated++;
  } else {
    failed++;
    const text = await res.text();
    console.error(`  실패: ${item.id} -> ${res.status} ${text}`);
  }
}

console.log(`완료. 신규 등록 ${migrated}건 / 이미 존재해서 건너뜀 ${skipped}건 / 실패 ${failed}건`);
if (failed > 0) process.exitCode = 1;
