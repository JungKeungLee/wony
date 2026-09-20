-- WONY 팬사이트 · 로그인 없이 사이트에서 직접 수정/삭제하는 방식으로 전환
-- letters.sql / fan_arts.sql / videos.sql을 이미 실행한 프로젝트에 적용하는 마이그레이션.
-- Supabase SQL Editor에서 한 번 실행하면 된다. (idempotent: 여러 번 실행해도 안전)
--
-- 전제: 이 사이트는 로그인/비밀번호가 없다. "본인 글만 수정/삭제" 같은 제한은
-- 구현할 방법이 없으므로, 이번 변경은 "누구나 수정/삭제할 수 있다"는 것을
-- 명확히 받아들인 상태에서 적용한다. 삭제는 반드시 클라이언트 쪽 확인창을
-- 한 번 거치도록 UI에서 처리하며, RLS 자체는 그 확인을 알지 못한다.

-- ------------------------------------------------------------------
-- 1) letters: UPDATE / DELETE 허용
-- ------------------------------------------------------------------

grant update, delete on public.letters to anon, authenticated;

drop policy if exists "letters_update_public" on public.letters;
create policy "letters_update_public"
  on public.letters
  for update
  using (true)
  -- is_approved는 수정 후에도 항상 true로만 남도록 강제한다.
  -- (숨김 처리는 여전히 관리자 Dashboard·service_role 전용)
  with check (is_approved = true);

drop policy if exists "letters_delete_public" on public.letters;
create policy "letters_delete_public"
  on public.letters
  for delete
  using (true);

-- ------------------------------------------------------------------
-- 2) fan_arts: DELETE 허용 (UPDATE는 계속 막아둔다)
-- ------------------------------------------------------------------

grant delete on public.fan_arts to anon, authenticated;

drop policy if exists "fan_arts_delete_public" on public.fan_arts;
create policy "fan_arts_delete_public"
  on public.fan_arts
  for delete
  using (true);

-- ------------------------------------------------------------------
-- 3) videos: DELETE 허용 (UPDATE는 계속 막아둔다 -> best_rank는
--    여전히 어떤 클라이언트 경로로도 손댈 수 없다)
-- ------------------------------------------------------------------

grant delete on public.videos to anon, authenticated;

drop policy if exists "videos_delete_public" on public.videos;
create policy "videos_delete_public"
  on public.videos
  for delete
  using (true);

-- ------------------------------------------------------------------
-- 4) fan-art Storage: "10분 이내 업로드만 삭제 가능" 정책을 해제하고
--    버킷 내 이미지를 언제든 삭제할 수 있도록 넓힌다.
-- ------------------------------------------------------------------

drop policy if exists "fan_art_storage_delete_recent" on storage.objects;

drop policy if exists "fan_art_storage_delete_public" on storage.objects;
create policy "fan_art_storage_delete_public"
  on storage.objects
  for delete
  to anon, authenticated
  using (bucket_id = 'fan-art');
