-- WONY 팬사이트 · 승인 절차 제거, 즉시 공개로 전환
-- letters.sql / fan_arts.sql을 이미 실행해 테이블이 있는 프로젝트에 적용하는 마이그레이션.
-- Supabase SQL Editor에서 한 번 실행하면 된다. (테이블/데이터는 그대로 유지되고 정책만 바뀐다)
--
-- 변경 내용
--   - is_approved 컬럼은 그대로 둔다 (true = 공개, false = 숨김).
--   - 앞으로 등록되는 글은 기본값부터 true(공개)로 저장된다.
--   - INSERT 시 is_approved는 true로만 허용한다 (승인 대기 상태로 등록하는 경로 자체를 없앤다).
--   - 문제 있는 글을 false로 내려 숨기는 것은 여전히 관리자가 Dashboard(service_role)에서만 가능하다.
--     (UPDATE 정책은 계속 만들지 않으므로 일반 사용자는 손댈 수 없다)

alter table public.letters alter column is_approved set default true;
alter table public.fan_arts alter column is_approved set default true;

drop policy if exists "letters_insert_public" on public.letters;
create policy "letters_insert_public"
  on public.letters
  for insert
  with check (is_approved = true);

drop policy if exists "fan_arts_insert_public" on public.fan_arts;
create policy "fan_arts_insert_public"
  on public.fan_arts
  for insert
  with check (is_approved = true);

-- select 정책(is_approved = true만 노출)과 update/delete 미허용은 변경하지 않는다.
