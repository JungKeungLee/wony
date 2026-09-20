-- WONY 팬사이트 · fan_arts 테이블 + Storage bucket
-- Supabase SQL Editor에서 그대로 실행하면 된다.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------
-- 1. 테이블
-- ------------------------------------------------------------------

create table if not exists public.fan_arts (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 1 and 30),
  title text not null check (char_length(title) between 1 and 100),
  message text check (message is null or char_length(message) <= 300),
  -- Storage 객체 경로만 저장한다. 공개 URL은 항상
  -- {SUPABASE_URL}/storage/v1/object/public/fan-art/{image_path} 로 결정적으로 계산되므로
  -- URL 자체를 중복 저장하지 않는다 (버킷/프로젝트 변경 시 마이그레이션 불필요).
  image_path text not null,
  -- true = 공개, false = 숨김. 별도 승인 절차 없이 기본값부터 공개 상태로 저장된다.
  -- 컬럼 자체는 계속 유지해서, 문제가 있는 작품을 관리자가 false로 내려 숨기는 용도로 쓴다.
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists fan_arts_approved_created_at_idx
  on public.fan_arts (created_at desc)
  where is_approved = true;

alter table public.fan_arts enable row level security;

grant select, insert on public.fan_arts to anon, authenticated;

-- 공개(is_approved = true) 팬아트만 누구나 조회 가능
create policy "fan_arts_select_approved"
  on public.fan_arts
  for select
  using (is_approved = true);

-- 누구나(익명 포함) 등록 가능하며, is_approved는 항상 true로만 저장 가능
-- (즉시 공개 -- 승인 대기 상태로 등록하는 경로 자체가 없다)
create policy "fan_arts_insert_public"
  on public.fan_arts
  for insert
  with check (is_approved = true);

-- update / delete 정책은 만들지 않는다.
-- RLS가 켜진 테이블은 허용 정책이 없는 작업은 전면 차단되므로,
-- 어떤 사용자도 팬아트를 수정·삭제할 수 없다.
-- 문제가 있는 작품을 숨기는 것(is_approved를 false로 변경)은
-- 관리자가 Supabase Dashboard(service_role 권한)에서만 처리한다.

-- ------------------------------------------------------------------
-- 2. Storage bucket
-- ------------------------------------------------------------------

-- public 버킷 + 서버 단(bucket) 레벨 파일 타입/용량 제한.
-- 클라이언트 검증을 우회해도 Storage가 자체적으로 거부한다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fan-art',
  'fan-art',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- storage.objects는 Supabase 프로젝트에서 기본적으로 RLS가 켜져 있다.

-- 누구나(익명 포함) fan-art 버킷에 업로드 가능
create policy "fan_art_storage_insert"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'fan-art');

-- 방금(10분 이내) 올라온 파일만 삭제 가능하도록 제한한다.
-- DB insert 실패 시 방금 업로드한 파일을 정리하는 용도이며,
-- 이미 승인되어 오래 게시된 파일은 어떤 사용자도 삭제할 수 없다.
-- (이 프로젝트는 로그인이 없어 "본인 파일만" 삭제로 제한할 방법이 없기 때문에
--  시간 창으로 절충했다. 더 엄격하게 하려면 실제 인증 도입이 필요하다.)
create policy "fan_art_storage_delete_recent"
  on storage.objects
  for delete
  to anon, authenticated
  using (bucket_id = 'fan-art' and created_at > now() - interval '10 minutes');

-- select(list) 정책은 의도적으로 만들지 않는다.
-- 버킷이 public이므로 정확한 경로를 아는 사람은 이미지를 직접 열람할 수 있지만,
-- RLS에 select 정책이 없어 버킷 내용 전체를 목록 조회(list)할 수는 없다.
-- 미승인 팬아트의 image_path는 fan_arts 테이블 select 정책(is_approved = true)에
-- 걸려 애초에 클라이언트에 노출되지 않는다.

-- update 정책은 만들지 않는다 -> 아무도 기존 파일을 덮어쓸 수 없다.
