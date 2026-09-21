-- WONY 팬사이트 · archive_comments 테이블
-- Archive 방송 기록(src/data/archive.ts, 정적 데이터)별 "그날의 기록 / MEMORY NOTE"
-- 코멘트 1개를 관리한다. 방송 데이터(date/title/description/tags) 자체는 계속
-- archive.ts에 남고, 이 테이블은 archive_id로 ArchiveItem.id와 연결만 한다.
-- Supabase SQL Editor에서 그대로 실행하면 된다.
--
-- 현재는 제작 중이라 로그인 없이 누구나 등록/조회/수정/삭제할 수 있다.
-- 정식 공개 전 INSERT/UPDATE/DELETE 권한은 제거하고 SELECT만 남길 예정이다.

create extension if not exists pgcrypto;

create table if not exists public.archive_comments (
  id uuid primary key default gen_random_uuid(),
  -- src/data/archive.ts의 ArchiveItem.id와 1:1로 연결된다. 같은 날짜에 여러 콘텐츠가
  -- 있을 수 있으므로 date가 아니라 반드시 이 안정적인 id로 연결한다.
  archive_id text not null unique,
  comment text not null check (char_length(comment) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.archive_comments enable row level security;

grant select, insert, update, delete on public.archive_comments to anon, authenticated;

-- 제작 기간 전용 정책: 누구나 조회/등록/수정/삭제 가능.
-- 정식 공개 전 insert/update/delete 정책은 제거하고 select만 남길 예정이다.
drop policy if exists "archive_comments_select_all" on public.archive_comments;
create policy "archive_comments_select_all"
  on public.archive_comments
  for select
  using (true);

drop policy if exists "archive_comments_insert_all" on public.archive_comments;
create policy "archive_comments_insert_all"
  on public.archive_comments
  for insert
  with check (true);

drop policy if exists "archive_comments_update_all" on public.archive_comments;
create policy "archive_comments_update_all"
  on public.archive_comments
  for update
  using (true)
  with check (true);

drop policy if exists "archive_comments_delete_all" on public.archive_comments;
create policy "archive_comments_delete_all"
  on public.archive_comments
  for delete
  using (true);
