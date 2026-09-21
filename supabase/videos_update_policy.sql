-- WONY 팬사이트 · videos 테이블 수정(UPDATE) 허용 + best_rank 보호
--
-- 지금까지 videos는 "등록 후 누구도 수정할 수 없다"는 정책이었다(delete만 열려
-- 있었다 - enable_public_edit_delete.sql 참고). 이제 ARCHIVE처럼 영상도 제목/URL/
-- 월/카테고리/대표 썸네일을 화면에서 직접 고칠 수 있게 하기로 하면서 UPDATE를
-- 연다. thumbnail backfill 스크립트를 돌리려고 잠깐 열어뒀던 임시 정책
-- (videos_thumbnail_backfill_policy.sql)을 이 정식 정책으로 대체한다.
--
-- 중요: best_rank(2026 BEST #1~#3)는 계속 "어떤 클라이언트 경로로도 손댈 수 없어야
-- 한다"는 원래 설계를 그대로 지킨다. RLS 정책만으로는 "이 컬럼만 못 바꾸게" 막을
-- 수 없어서, BEFORE UPDATE 트리거로 anon/authenticated가 보낸 수정 요청에서는
-- best_rank를 항상 기존 값으로 되돌린다. Supabase SQL Editor/Table Editor는
-- postgres 역할로 실행되므로 이 트리거의 영향을 받지 않고, 관리자는 지금처럼
-- 그대로 Dashboard에서 best_rank를 설정할 수 있다.
--
-- 제작 기간 전용 정책이며, 정식 공개 전 insert/update/delete 정책은 제거하고
-- select만 남길 예정이다(다른 테이블과 동일한 패턴). Supabase SQL Editor에서
-- 그대로 실행하면 된다.

grant update on public.videos to anon, authenticated;

drop policy if exists "videos_update_thumbnail_backfill_temp" on public.videos;

drop policy if exists "videos_update_public" on public.videos;
create policy "videos_update_public"
  on public.videos
  for update
  using (true)
  -- is_approved은 letters와 동일하게 수정 후에도 항상 true로만 남도록 강제한다.
  with check (is_approved = true);

create or replace function public.protect_videos_best_rank()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('role', true) in ('anon', 'authenticated') then
    new.best_rank := old.best_rank;
  end if;
  return new;
end;
$$;

drop trigger if exists videos_protect_best_rank on public.videos;
create trigger videos_protect_best_rank
  before update on public.videos
  for each row
  execute function public.protect_videos_best_rank();
