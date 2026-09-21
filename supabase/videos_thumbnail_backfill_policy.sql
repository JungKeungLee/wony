-- WONY 팬사이트 · SOOP 썸네일 backfill용 임시 UPDATE 권한
-- videos 테이블은 "누구도 등록된 영상을 수정/삭제할 수 없다"는 원칙으로 설계돼 있어서
-- (videos.sql 참고) update 정책이 아예 없다. scripts/backfill-soop-thumbnails.mjs가
-- 기존 SOOP 영상들의 thumbnail_path만 채워 넣을 수 있도록, 그 스크립트를 실행하는
-- 동안만 잠깐 update를 열어준다.
--
-- 순서:
--   1) 이 파일의 STEP 1을 Supabase SQL Editor에서 실행한다.
--   2) node --env-file=.env.local scripts/backfill-soop-thumbnails.mjs 를 실행한다.
--   3) 스크립트가 끝나면 반드시 이 파일의 STEP 2를 실행해서 다시 잠근다.
--      (STEP 2를 건너뛰면 이후 누구나 videos 테이블 아무 행이나 수정할 수 있는
--      상태로 남으므로 반드시 실행해야 한다.)

-- ============================================================
-- STEP 1 — 지금 실행: 임시로 UPDATE를 연다
-- ============================================================
grant update on public.videos to anon, authenticated;

drop policy if exists "videos_update_thumbnail_backfill_temp" on public.videos;
create policy "videos_update_thumbnail_backfill_temp"
  on public.videos
  for update
  using (true)
  with check (true);

-- ============================================================
-- STEP 2 — 스크립트 실행이 끝난 뒤 실행: 다시 잠근다
-- ============================================================
-- drop policy if exists "videos_update_thumbnail_backfill_temp" on public.videos;
-- revoke update on public.videos from anon, authenticated;
