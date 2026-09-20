-- WONY 팬사이트 · videos 테이블
-- YouTube/SOOP 등 여러 플랫폼을 공통 구조로 저장한다 (영상 파일 자체는 업로드하지 않음).
-- Supabase SQL Editor에서 그대로 실행하면 된다.

create extension if not exists pgcrypto;

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 1 and 30),
  title text not null check (char_length(title) between 1 and 100),
  -- 새 플랫폼을 지원하게 되면 이 체크에 값만 추가하면 된다.
  platform text not null check (platform in ('youtube', 'soop')),
  video_url text not null,
  video_id text not null,
  message text check (message is null or char_length(message) <= 300),
  -- true = 공개, false = 숨김. 별도 승인 절차 없이 기본값부터 공개 상태로 저장된다.
  -- (letters/fan_arts와 동일한 정책)
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists videos_approved_created_at_idx
  on public.videos (created_at desc)
  where is_approved = true;

alter table public.videos enable row level security;

grant select, insert on public.videos to anon, authenticated;

-- 공개(is_approved = true) 영상만 누구나 조회 가능
create policy "videos_select_approved"
  on public.videos
  for select
  using (is_approved = true);

-- 누구나(익명 포함) 등록 가능하며, is_approved는 항상 true로만 저장 가능
create policy "videos_insert_public"
  on public.videos
  for insert
  with check (is_approved = true);

-- update / delete 정책은 만들지 않는다.
-- RLS가 켜진 테이블은 허용 정책이 없는 작업은 전면 차단되므로,
-- 어떤 사용자도 등록된 영상을 수정·삭제할 수 없다.
-- 문제가 있는 영상을 숨기는 것(is_approved를 false로 변경)은
-- 관리자가 Supabase Dashboard(service_role 권한)에서만 처리한다.
