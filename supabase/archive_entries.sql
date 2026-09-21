-- WONY 팬사이트 · archive_entries 테이블
-- ARCHIVE의 기본 데이터(date/title/description/tags)를 src/data/archive.ts의 정적
-- 배열 대신 Supabase에서 실시간으로 등록/수정/삭제할 수 있게 한다.
-- archive_id는 기존 src/data/archive.ts의 ArchiveItem.id와 동일한 값을 쓰며,
-- archive_images.archive_id / archive_comments.archive_id와 같은 값으로 계속 연결된다.
-- Supabase SQL Editor에서 그대로 실행하면 된다.
--
-- 기존 데이터 이전은 이 파일이 아니라 scripts/migrate-archive-entries.mjs로 한다
-- (Korean 텍스트를 SQL 리터럴로 손으로 옮기다 생기는 실수를 피하기 위해, 실제
-- src/data/archive.ts를 그대로 읽어서 REST API로 올리는 스크립트를 쓴다).
--
-- 현재는 제작 중이라 로그인 없이 누구나 등록/조회/수정/삭제할 수 있다.
-- 정식 공개 전 INSERT/UPDATE/DELETE 권한은 제거하고 SELECT만 남길 예정이다.

create extension if not exists pgcrypto;

create table if not exists public.archive_entries (
  id uuid primary key default gen_random_uuid(),
  -- src/data/archive.ts의 ArchiveItem.id와 1:1로 연결된다. 같은 날짜에 콘텐츠가
  -- 여러 개 있을 수 있으므로 date가 아니라 이 안정적인 값으로 archive_images/
  -- archive_comments와 계속 연결한다. 절대 직접 바꾸지 않는다(수정은 다른 컬럼만).
  archive_id text not null unique,
  -- 표시용 날짜 문자열. "01.15", "03.29 ~ 04.08"처럼 기존과 같은 자유 형식을 그대로 쓴다.
  date text not null,
  title text not null,
  description text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists archive_entries_archive_id_idx
  on public.archive_entries (archive_id);

alter table public.archive_entries enable row level security;

grant select, insert, update, delete on public.archive_entries to anon, authenticated;

-- 제작 기간 전용 정책: 누구나 조회/등록/수정/삭제 가능.
-- 정식 공개 전 insert/update/delete 정책은 제거하고 select만 남길 예정이다.
drop policy if exists "archive_entries_select_all" on public.archive_entries;
create policy "archive_entries_select_all"
  on public.archive_entries
  for select
  using (true);

drop policy if exists "archive_entries_insert_all" on public.archive_entries;
create policy "archive_entries_insert_all"
  on public.archive_entries
  for insert
  with check (true);

drop policy if exists "archive_entries_update_all" on public.archive_entries;
create policy "archive_entries_update_all"
  on public.archive_entries
  for update
  using (true)
  with check (true);

drop policy if exists "archive_entries_delete_all" on public.archive_entries;
create policy "archive_entries_delete_all"
  on public.archive_entries
  for delete
  using (true);
