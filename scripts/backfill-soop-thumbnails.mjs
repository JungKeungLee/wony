// WONY 팬사이트 · SOOP 영상 썸네일 backfill 스크립트
//
// videos 테이블에서 platform = 'soop'이고 thumbnail_path가 비어 있는 기존 영상들을
// 찾아, 각 SOOP VOD 페이지에서 og:image를 가져와 video-thumbnails Storage 버킷에
// 저장하고 thumbnail_path를 채운다. 새로 등록하는 영상은
// src/app/api/soop-thumbnail/route.ts가 등록 시점에 자동으로 같은 일을 하므로,
// 이 스크립트는 그 기능이 생기기 전에 이미 등록돼 있던 영상들에 한 번만 소급
// 적용하는 용도다. 이미 thumbnail_path가 있는 행은 건드리지 않으므로 여러 번
// 실행해도 안전하다(재실행하면 아직 못 채운 것만 다시 시도한다).
//
// 실행 전 (반드시 이 순서로):
//   1. supabase/videos_thumbnail_backfill_policy.sql의 STEP 1을 Supabase SQL
//      Editor에서 실행한다 - videos 테이블은 원래 누구도 수정할 수 없게 설계돼
//      있어서, 이 스크립트가 thumbnail_path를 쓰려면 잠깐 열어둬야 한다.
//   2. 아래 명령으로 이 스크립트를 실행한다.
//   3. 끝나면 같은 SQL 파일의 STEP 2를 실행해서 반드시 다시 잠근다.
//
// 실행 방법 (프로젝트 루트에서):
//   node --env-file=.env.local scripts/backfill-soop-thumbnails.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 환경변수가 없습니다.\n" +
      "다음처럼 .env.local을 함께 불러와서 실행해주세요:\n" +
      "  node --env-file=.env.local scripts/backfill-soop-thumbnails.mjs"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VIDEO_THUMBNAIL_BUCKET = "video-thumbnails";
const FETCH_TIMEOUT_MS = 8000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
// SOOP 서버에 짧은 시간에 몰아치지 않도록 요청 사이에 약간의 간격을 둔다.
const DELAY_BETWEEN_REQUESTS_MS = 800;

// src/app/api/soop-thumbnail/route.ts와 동일한 추출 규칙을 쓴다(둘의 동작이
// 어긋나지 않도록 og:image 패턴/검증 기준을 그대로 맞춘다).
const OG_IMAGE_PATTERNS = [
  /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
];

function extractOgImage(html) {
  for (const pattern of OG_IMAGE_PATTERNS) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extensionFromContentType(contentType) {
  if (!contentType) return null;
  if (contentType.includes("image/jpeg")) return "jpg";
  if (contentType.includes("image/png")) return "png";
  if (contentType.includes("image/webp")) return "webp";
  return null;
}

async function fetchWithTimeout(url, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function backfillOne(video) {
  const pageUrl = `https://vod.sooplive.co.kr/player/${video.video_id}`;

  const pageRes = await fetchWithTimeout(pageUrl, {
    "User-Agent": BROWSER_USER_AGENT,
    Accept: "text/html",
  });
  if (!pageRes.ok) throw new Error(`page-fetch-failed-${pageRes.status}`);
  const html = await pageRes.text();

  const ogImageUrl = extractOgImage(html);
  if (!ogImageUrl) throw new Error("og-image-not-found");

  const imageRes = await fetchWithTimeout(ogImageUrl, { "User-Agent": BROWSER_USER_AGENT });
  if (!imageRes.ok) throw new Error(`image-fetch-failed-${imageRes.status}`);

  const contentType = imageRes.headers.get("content-type");
  const contentLength = Number(imageRes.headers.get("content-length") ?? "0");
  if (contentLength > MAX_IMAGE_BYTES) throw new Error("image-too-large");

  const imageBuffer = await imageRes.arrayBuffer();
  if (imageBuffer.byteLength > MAX_IMAGE_BYTES) throw new Error("image-too-large");

  const extension = extensionFromContentType(contentType);
  if (!extension) throw new Error("unsupported-image-type");

  const path = `soop-${video.video_id}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(VIDEO_THUMBNAIL_BUCKET)
    .upload(path, imageBuffer, { contentType, upsert: false });
  if (uploadError) throw new Error(`storage-upload-failed: ${uploadError.message}`);

  // 다른 프로세스가 그 사이 먼저 채워놨을 수도 있으니, 여전히 비어 있는 경우에만
  // 갱신한다(이미 채워진 행을 실수로 덮어쓰지 않기 위함).
  const { data: updated, error: updateError } = await supabase
    .from("videos")
    .update({ thumbnail_path: path })
    .eq("id", video.id)
    .is("thumbnail_path", null)
    .select("id");
  if (updateError) throw new Error(`db-update-failed: ${updateError.message}`);
  if (!updated || updated.length === 0) throw new Error("already-filled-by-another-run");

  return path;
}

const { data: videos, error } = await supabase
  .from("videos")
  .select("id,video_id,title")
  .eq("platform", "soop")
  .is("thumbnail_path", null);

if (error) {
  console.error("영상 목록을 불러오지 못했습니다:", error.message);
  console.error(
    "videos 테이블에 UPDATE 권한이 없다는 에러라면, 먼저 " +
      "supabase/videos_thumbnail_backfill_policy.sql의 STEP 1을 실행했는지 확인해주세요."
  );
  process.exit(1);
}

console.log(`thumbnail_path가 없는 SOOP 영상 ${videos.length}개를 처리합니다...`);

let succeeded = 0;
const failures = [];

for (const video of videos) {
  try {
    const path = await backfillOne(video);
    succeeded++;
    console.log(`  성공: ${video.title} (${video.video_id}) -> ${path}`);
  } catch (err) {
    failures.push({ video, reason: err.message });
    console.error(`  실패: ${video.title} (${video.video_id}) -> ${err.message}`);
  }
  await sleep(DELAY_BETWEEN_REQUESTS_MS);
}

console.log(`\n완료. 성공 ${succeeded}건 / 실패 ${failures.length}건`);
if (failures.length > 0) {
  console.log("실패 목록(이 영상들은 여전히 기본 재생 아이콘으로 보입니다):");
  for (const f of failures) console.log(`  - ${f.video.title} (${f.video.video_id}): ${f.reason}`);
}
console.log(
  "\n잊지 말고 supabase/videos_thumbnail_backfill_policy.sql의 STEP 2를 실행해서 " +
    "videos 테이블 UPDATE 권한을 다시 잠가주세요."
);
if (failures.length > 0) process.exitCode = 1;
