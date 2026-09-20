-- WONY 팬사이트 · timeline_images 테이블 + Storage bucket
-- Timeline 각 월(src/data/timeline.ts, 정적 데이터)의 대표 이미지 1장을 관리한다.
-- 월별 텍스트 데이터 자체는 이 테이블로 옮기지 않고, month로 TimelineMonthData.month와
-- 연결만 한다. archive_images.sql과 동일한 구조/정책이다.
-- Supabase SQL Editor에서 그대로 실행하면 된다.
--
-- 현재는 제작 중이라 로그인 없이 누구나 등록/조회할 수 있다.
-- 정식 공개 전 INSERT/UPDATE/DELETE 권한은 제거할 예정이다.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------
-- 1. 테이블
-- ------------------------------------------------------------------

create table if not exists public.timeline_images (
  id uuid primary key default gen_random_uuid(),
  -- src/data/timeline.ts의 TimelineMonthData.month(1~12)와 연결된다. 한 달에 대표
  -- 이미지(is_cover = true) 1장 + 작은 이미지(is_cover = false) 최대 3장까지 저장한다.
  month integer not null check (month between 1 and 12),
  -- Storage 객체 경로만 저장한다. 공개 URL은
  -- {SUPABASE_URL}/storage/v1/object/public/timeline-images/{image_path}로 계산되므로
  -- URL 자체를 중복 저장하지 않는다.
  image_path text not null,
  is_cover boolean not null default true,
  -- 작은 이미지 슬롯 순서(1~3). 대표 이미지는 항상 null.
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timeline_images_sort_order_check check (
    (is_cover = true and sort_order is null)
    or (is_cover = false and sort_order between 1 and 3)
  )
);

-- 월당 대표 이미지는 최대 1장, 슬롯당 작은 이미지도 최대 1장으로 제한한다.
create unique index if not exists timeline_images_one_cover_per_month
  on public.timeline_images (month)
  where is_cover = true;

create unique index if not exists timeline_images_one_small_per_slot
  on public.timeline_images (month, sort_order)
  where is_cover = false;

alter table public.timeline_images enable row level security;

grant select, insert, update, delete on public.timeline_images to anon, authenticated;

-- 제작 기간 전용 정책: 누구나 조회/등록/교체/삭제 가능.
-- 정식 공개 전 insert/update/delete 정책은 제거하고 select만 남길 예정이다.
drop policy if exists "timeline_images_select_all" on public.timeline_images;
create policy "timeline_images_select_all"
  on public.timeline_images
  for select
  using (true);

drop policy if exists "timeline_images_insert_all" on public.timeline_images;
create policy "timeline_images_insert_all"
  on public.timeline_images
  for insert
  with check (true);

drop policy if exists "timeline_images_update_all" on public.timeline_images;
create policy "timeline_images_update_all"
  on public.timeline_images
  for update
  using (true)
  with check (true);

drop policy if exists "timeline_images_delete_all" on public.timeline_images;
create policy "timeline_images_delete_all"
  on public.timeline_images
  for delete
  using (true);

-- ------------------------------------------------------------------
-- 2. Storage bucket
-- ------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'timeline-images',
  'timeline-images',
  true,
  5242880, -- 5MB (실제로는 브라우저에서 4:3 WebP로 최적화되어 훨씬 작다)
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "timeline_images_storage_select" on storage.objects;
create policy "timeline_images_storage_select"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'timeline-images');

drop policy if exists "timeline_images_storage_insert" on storage.objects;
create policy "timeline_images_storage_insert"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'timeline-images');

drop policy if exists "timeline_images_storage_update" on storage.objects;
create policy "timeline_images_storage_update"
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id = 'timeline-images')
  with check (bucket_id = 'timeline-images');

drop policy if exists "timeline_images_storage_delete" on storage.objects;
create policy "timeline_images_storage_delete"
  on storage.objects
  for delete
  to anon, authenticated
  using (bucket_id = 'timeline-images');
