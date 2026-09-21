-- WONY 팬사이트 · archive_entries Soft Delete
-- ARCHIVE 기록을 완전히 지우는 대신 deleted_at만 채워서 "삭제된 것처럼" 숨긴다.
-- 실수로 기록을 삭제해도 archive_images/archive_comments/Storage 파일이 전혀
-- 건드려지지 않으므로, 필요하면 DB에서 deleted_at을 다시 null로 되돌려 복구할 수 있다.
-- Supabase SQL Editor에서 그대로 실행하면 된다 (기존 archive_entries.sql을 먼저 실행한
-- 뒤에 이 파일을 실행한다).

alter table public.archive_entries
  add column if not exists deleted_at timestamptz null;

-- 일반 조회(월별 목록, 랜덤 추억 등)는 항상 삭제되지 않은 기록만 봐야 하므로,
-- deleted_at이 null인 행만 빠르게 찾을 수 있도록 부분 인덱스를 둔다.
create index if not exists archive_entries_not_deleted_idx
  on public.archive_entries (archive_id)
  where deleted_at is null;
