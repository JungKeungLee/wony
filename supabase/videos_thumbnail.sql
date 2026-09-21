-- WONY 팬사이트 · videos.thumbnail_path + video-thumbnails Storage bucket
-- YouTube는 hqdefault.jpg 규칙으로 썸네일을 바로 계산할 수 있지만, SOOP는 그런
-- 공식 규칙이 없어 카드에 기본 재생 아이콘만 보였다. 등록 시점에 (가능하면) SOOP
-- 페이지의 og:image를 서버에서 가져와 이 Storage 버킷에 저장하고, 실패하면
-- 사용자가 직접 올린 이미지를 대신 쓴다. YouTube는 계속 기존 규칙을 쓰므로 보통
-- 이 컬럼을 채우지 않는다(null이면 화면에서 기존처럼 platform 기준 썸네일/기본
-- placeholder로 자연히 폴백한다).
-- Supabase SQL Editor에서 그대로 실행하면 된다.

alter table public.videos
  add column if not exists thumbnail_path text null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'video-thumbnails',
  'video-thumbnails',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 제작 기간 전용 정책: 누구나 조회/업로드 가능(다른 Storage 버킷과 동일한 정책).
-- 정식 공개 전 insert 정책은 제거하고 select만 남길 예정이다. 한 번 올라간
-- 썸네일을 수정/삭제하는 UI는 없으므로 update/delete 정책은 만들지 않는다.
drop policy if exists "video_thumbnails_storage_select" on storage.objects;
create policy "video_thumbnails_storage_select"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'video-thumbnails');

drop policy if exists "video_thumbnails_storage_insert" on storage.objects;
create policy "video_thumbnails_storage_insert"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'video-thumbnails');
