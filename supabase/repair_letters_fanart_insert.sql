-- WONY 팬사이트 · letters / fan_arts INSERT 정책 복구
--
-- 증상: /letters/write, /fan-art/write에서 등록 시
--   "new row violates row-level security policy for table ..."
-- 원인: update_approval_policy.sql이 두 테이블의 insert 정책을 drop 후 재생성하는
--   과정에서 (Supabase SQL Editor에서 부분 실행/재실행 등으로) 실제로는 정책이
--   남지 않은 상태가 된 것으로 보인다. videos 테이블은 정책을 재생성한 적이 없어
--   영향을 받지 않았다 (실제 INSERT 테스트로 정상 동작을 확인함).
--
-- 조치: 두 테이블의 모든 정책(select/insert/update/delete)을 지우고
--   현재 의도한 최종 상태로 다시 만든다. 여러 번 실행해도 안전하다.

-- ------------------------------------------------------------------
-- letters
-- ------------------------------------------------------------------

drop policy if exists "letters_select_approved" on public.letters;
create policy "letters_select_approved"
  on public.letters
  for select
  using (is_approved = true);

drop policy if exists "letters_insert_public" on public.letters;
create policy "letters_insert_public"
  on public.letters
  for insert
  with check (is_approved = true);

drop policy if exists "letters_update_public" on public.letters;
create policy "letters_update_public"
  on public.letters
  for update
  using (true)
  with check (is_approved = true);

drop policy if exists "letters_delete_public" on public.letters;
create policy "letters_delete_public"
  on public.letters
  for delete
  using (true);

grant select, insert, update, delete on public.letters to anon, authenticated;

-- ------------------------------------------------------------------
-- fan_arts
-- ------------------------------------------------------------------

drop policy if exists "fan_arts_select_approved" on public.fan_arts;
create policy "fan_arts_select_approved"
  on public.fan_arts
  for select
  using (is_approved = true);

drop policy if exists "fan_arts_insert_public" on public.fan_arts;
create policy "fan_arts_insert_public"
  on public.fan_arts
  for insert
  with check (is_approved = true);

drop policy if exists "fan_arts_delete_public" on public.fan_arts;
create policy "fan_arts_delete_public"
  on public.fan_arts
  for delete
  using (true);

grant select, insert, delete on public.fan_arts to anon, authenticated;
