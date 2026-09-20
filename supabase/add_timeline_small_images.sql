-- WONY 팬사이트 · timeline_images에 "작은 이미지 3칸" 슬롯 지원 추가
-- 지금까지 timeline_images는 월(month)당 대표 이미지 1장만 저장했다(month에 unique 제약).
-- 이제 같은 테이블에 월당 최대 3장의 작은 이미지도 함께 저장하도록 확장한다.
-- 대표 이미지 관련 기존 동작(등록/조회/교체/삭제)은 전혀 바뀌지 않는다 — is_cover가
-- true인 row만 대표 이미지로 취급하고, 기존 row는 전부 default true라 자동으로
-- 대표 이미지로 남는다.
--
-- Supabase SQL Editor에서 한 번 실행하면 된다. (idempotent)

-- 1) 컬럼 추가. is_cover 기본값이 true라서 이미 등록된 대표 이미지 row는
--    아무 변화 없이 계속 is_cover = true로 남는다.
alter table public.timeline_images
  add column if not exists is_cover boolean not null default true;

alter table public.timeline_images
  add column if not exists sort_order integer;

-- 2) 기존의 "월당 row 1개" 제약을 제거한다 (이제 월당 최대 4개: 대표 1 + 작은 3).
alter table public.timeline_images
  drop constraint if exists timeline_images_month_key;

-- 3) 새 제약: 월당 대표 이미지는 최대 1장, 슬롯(sort_order)당 작은 이미지도 최대 1장.
drop index if exists timeline_images_one_cover_per_month;
create unique index timeline_images_one_cover_per_month
  on public.timeline_images (month)
  where is_cover = true;

drop index if exists timeline_images_one_small_per_slot;
create unique index timeline_images_one_small_per_slot
  on public.timeline_images (month, sort_order)
  where is_cover = false;

alter table public.timeline_images
  drop constraint if exists timeline_images_sort_order_check;
alter table public.timeline_images
  add constraint timeline_images_sort_order_check
  check (
    (is_cover = true and sort_order is null)
    or (is_cover = false and sort_order between 1 and 3)
  );
