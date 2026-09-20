-- WONY 팬사이트 · archive_images 테이블 + Storage bucket
-- Archive 방송 기록(src/data/archive.ts, 정적 데이터)별 대표 이미지 1장을 관리한다.
-- 방송 데이터 자체는 이 테이블로 옮기지 않고, archive_id로 ArchiveItem.id와 연결만 한다.
-- Supabase SQL Editor에서 그대로 실행하면 된다.
--
-- 현재는 제작 중이라 로그인 없이 누구나 등록/조회/교체/삭제할 수 있다.
-- 정식 공개 전 INSERT/UPDATE/DELETE 권한은 제거할 예정이다.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------
-- 1. 테이블
-- ------------------------------------------------------------------

create table if not exists public.archive_images (
  id uuid primary key default gen_random_uuid(),
  -- src/data/archive.ts의 ArchiveItem.id와 1:1로 연결된다. 날짜만으로 연결하면
  -- 같은 날짜에 여러 콘텐츠가 있을 때 꼬이므로 반드시 안정적인 id를 쓴다.
  archive_id text not null unique,
  -- Storage 객체 경로만 저장한다. 공개 URL은
  -- {SUPABASE_URL}/storage/v1/object/public/archive-images/{image_path}로 계산되므로
  -- URL 자체를 중복 저장하지 않는다.
  image_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.archive_images enable row level security;

grant select, insert, update, delete on public.archive_images to anon, authenticated;

-- 제작 기간 전용 정책: 누구나 조회/등록/교체/삭제 가능.
-- 정식 공개 전 insert/update/delete 정책은 제거하고 select만 남길 예정이다.
drop policy if exists "archive_images_select_all" on public.archive_images;
create policy "archive_images_select_all"
  on public.archive_images
  for select
  using (true);

drop policy if exists "archive_images_insert_all" on public.archive_images;
create policy "archive_images_insert_all"
  on public.archive_images
  for insert
  with check (true);

drop policy if exists "archive_images_update_all" on public.archive_images;
create policy "archive_images_update_all"
  on public.archive_images
  for update
  using (true)
  with check (true);

drop policy if exists "archive_images_delete_all" on public.archive_images;
create policy "archive_images_delete_all"
  on public.archive_images
  for delete
  using (true);

-- ------------------------------------------------------------------
-- 2. Storage bucket
-- ------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'archive-images',
  'archive-images',
  true,
  5242880, -- 5MB (실제로는 브라우저에서 640x360 WebP로 최적화되어 훨씬 작다)
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "archive_images_storage_select" on storage.objects;
create policy "archive_images_storage_select"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'archive-images');

drop policy if exists "archive_images_storage_insert" on storage.objects;
create policy "archive_images_storage_insert"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'archive-images');

drop policy if exists "archive_images_storage_update" on storage.objects;
create policy "archive_images_storage_update"
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id = 'archive-images')
  with check (bucket_id = 'archive-images');

drop policy if exists "archive_images_storage_delete" on storage.objects;
create policy "archive_images_storage_delete"
  on storage.objects
  for delete
  to anon, authenticated
  using (bucket_id = 'archive-images');
