-- WONY 팬사이트 · video_votes 테이블
-- VIDEO 페이지의 "☆ 이 영상에 한 표" 버튼으로 남기는 비공개 투표 기록이다.
-- 총 투표 수/순위 등 결과는 일반 사용자에게 절대 보여주지 않는다 - 운영자가
-- 나중에 Supabase SQL Editor(또는 Claude Code)에서 직접 조회해서 연말 BEST TOP 3
-- 선정에 "참고"만 한다(투표 수가 자동으로 best_rank가 되지 않는다).
-- 중복 투표를 막지 않는 게 의도된 동작이므로, 같은 영상에 여러 번 투표해도 전부
-- 그대로 쌓인다. Supabase SQL Editor에서 그대로 실행하면 된다.

create extension if not exists pgcrypto;

create table if not exists public.video_votes (
  id uuid primary key default gen_random_uuid(),
  -- 어느 영상에 대한 투표인지. 영상이 삭제되면(기존 제작용 삭제 기능) 그 영상에
  -- 딸린 투표 기록도 함께 정리되도록 cascade로 연결한다.
  video_id uuid not null references public.videos(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists video_votes_video_id_idx on public.video_votes (video_id);

alter table public.video_votes enable row level security;

-- anon/authenticated에게 INSERT 권한만 준다. SELECT/UPDATE/DELETE는 grant 자체를
-- 하지 않으므로, 프론트엔드 코드가 실수로 조회 쿼리를 넣어도 항상 거부된다
-- (RLS 정책을 아예 만들지 않은 것과 이중으로 막아두는 것).
grant insert on public.video_votes to anon, authenticated;

drop policy if exists "video_votes_insert_public" on public.video_votes;
create policy "video_votes_insert_public"
  on public.video_votes
  for insert
  to anon, authenticated
  with check (true);

-- ============================================================
-- 운영자 전용 조회 - 일반 사용자 화면에는 절대 노출하지 않는다.
-- Supabase SQL Editor에서 아래 SELECT문만 따로 복사해서 실행한다.
-- (anon 키로는 SELECT 권한이 없으므로 이 조회는 Supabase 대시보드/서비스 role에서만 가능하다.)
-- ============================================================
-- select
--   v.title,
--   v.month,
--   v.category,
--   count(vv.id) as total_votes
-- from public.videos v
-- left join public.video_votes vv on vv.video_id = v.id
-- group by v.id, v.title, v.month, v.category
-- order by total_votes desc;
