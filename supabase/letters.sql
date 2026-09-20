-- WONY 팬사이트 · letters 테이블
-- Supabase SQL Editor에서 그대로 실행하면 된다.

create extension if not exists pgcrypto;

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 1 and 30),
  content text not null check (char_length(content) between 1 and 2000),
  message_2027 text not null check (char_length(message_2027) between 1 and 300),
  is_anonymous boolean not null default false,
  -- true = 공개, false = 숨김. 별도 승인 절차 없이 기본값부터 공개 상태로 저장된다.
  -- 컬럼 자체는 계속 유지해서, 문제가 있는 편지를 관리자가 false로 내려 숨기는 용도로 쓴다.
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

-- 공개(is_approved = true) 편지를 최신순으로 조회할 때 쓰는 부분 색인
create index if not exists letters_approved_created_at_idx
  on public.letters (created_at desc)
  where is_approved = true;

alter table public.letters enable row level security;

-- 익명 사용자를 포함해 누구나 테이블에 접근할 수 있도록 기본 권한을 부여한다.
-- 실제 허용 범위는 아래 RLS 정책이 결정한다.
grant select, insert on public.letters to anon, authenticated;

-- 공개(is_approved = true) 편지만 누구나 조회 가능
create policy "letters_select_approved"
  on public.letters
  for select
  using (is_approved = true);

-- 누구나(익명 포함) 편지를 등록할 수 있으며, is_approved는 항상 true로만 저장 가능
-- (즉시 공개 -- 승인 대기 상태로 등록하는 경로 자체가 없다)
create policy "letters_insert_public"
  on public.letters
  for insert
  with check (is_approved = true);

-- update / delete 정책은 의도적으로 만들지 않는다.
-- RLS가 켜진 테이블은 허용 정책이 없는 작업은 전면 차단되므로,
-- 어떤 사용자도 자신 또는 타인의 편지를 수정·삭제할 수 없다.
-- 문제가 있는 편지를 숨기는 것(is_approved를 false로 변경)은
-- 관리자가 Supabase Dashboard(service_role 권한)에서만 처리한다.
