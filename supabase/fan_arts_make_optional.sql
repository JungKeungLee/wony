-- WONY 팬사이트 · fan_arts: nickname/title을 선택 입력으로 전환
-- 팬아트 등록을 "이미지 한 장만 업로드"로 단순화하면서, 더 이상 nickname/title을
-- 입력받지 않는다. 기존 CHECK 제약(char_length(...) between 1 and N)은 값이 NULL이면
-- Postgres가 자동으로 통과시키므로 그대로 둬도 되고, NOT NULL만 풀어주면 된다.
-- 기존 데이터는 그대로 유지되며(값이 있던 행은 계속 값을 가진다), 새로 등록되는
-- 행만 nickname/title/message가 모두 NULL로 저장된다.
-- Supabase SQL Editor에서 그대로 실행하면 된다.

alter table public.fan_arts alter column nickname drop not null;
alter table public.fan_arts alter column title drop not null;
-- message는 이미 nullable이라 변경할 것이 없다.
