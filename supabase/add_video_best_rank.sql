-- WONY 팬사이트 · VIDEO 페이지에 "2026 BEST CLIPS" TOP 3 추가
-- videos.sql(+ add_video_highlights.sql)을 이미 실행한 프로젝트에 적용하는 마이그레이션.
-- Supabase SQL Editor에서 한 번 실행하면 된다. (기존 데이터는 전부 best_rank = null로 시작)
-- 이미 한 번 실행했어도 다시 실행해도 안전하도록 작성했다(idempotent).

alter table public.videos add column if not exists best_rank integer;

alter table public.videos drop constraint if exists videos_best_rank_check;
alter table public.videos add constraint videos_best_rank_check
  check (best_rank is null or best_rank between 1 and 3);

-- BEST #1/#2/#3은 각각 한 영상에만 지정되도록 보장한다.
drop index if exists videos_best_rank_unique;
create unique index videos_best_rank_unique
  on public.videos (best_rank)
  where best_rank is not null;

-- 새 영상을 등록하는 게 아니라 1~12월에 이미 등록된 영상 중 골라
-- best_rank만 1/2/3으로 지정하면 된다. 예:
--   update public.videos set best_rank = 1 where id = '...';
-- select/insert RLS 정책은 이 컬럼과 무관하므로 변경하지 않는다.
