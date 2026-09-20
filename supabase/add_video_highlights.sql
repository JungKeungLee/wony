-- WONY 팬사이트 · VIDEO 페이지를 "베스트 클립 전시관"으로 개편
-- videos.sql을 이미 실행해 테이블/데이터가 있는 프로젝트에 적용하는 마이그레이션.
-- Supabase SQL Editor에서 한 번 실행하면 된다. (기존 데이터는 그대로 유지되고 컬럼만 추가된다)

-- 1) 컬럼 추가 (일단 NULL 허용으로 추가해서 기존 행을 먼저 채운다)
alter table public.videos add column if not exists month integer;
alter table public.videos add column if not exists category text;

-- is_pick("워냥이 PICK")은 쓰지 않기로 했다. 혹시 이전에 추가된 적이 있다면 정리한다.
alter table public.videos drop column if exists is_pick;

-- 2) 기존 행 채우기
--    month: 이미 등록된 created_at 기준으로 몇 월 영상인지 채운다.
update public.videos
set month = extract(month from created_at)::integer
where month is null;

--    category: 새 분류 체계가 생기기 전 데이터라 우선 'legend'로 채워두고,
--              필요하면 관리자가 Dashboard에서 실제 카테고리로 조정한다.
update public.videos
set category = 'legend'
where category is null;

-- 3) 이제 필수값 + 허용값 제약을 건다.
alter table public.videos alter column month set not null;
alter table public.videos add constraint videos_month_check check (month between 1 and 12);

alter table public.videos alter column category set not null;
alter table public.videos alter column category set default 'legend';
alter table public.videos add constraint videos_category_check
  check (category in ('legend', 'funny', 'touching', 'collab', 'game', 'fan_pick'));

-- select/insert RLS 정책은 이 컬럼들과 무관하므로 변경하지 않는다.
