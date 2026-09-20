-- WONY 팬사이트 · videos DELETE 정책 복구
--
-- 증상: VIDEO 상세 Modal에서 삭제를 눌러 확인까지 마쳐도
--   "영상이 삭제되었습니다."는 뜨지만 실제로는 영상이 화면에 그대로 남는다.
-- 원인: DELETE 요청 자체는 Supabase에 정상적으로 도달했지만, videos 테이블에
--   RLS DELETE 정책이 없어(또는 유실되어) 0개 행이 삭제된 채로 성공 응답을
--   반환했다. Postgres RLS는 정책에 맞지 않는 행을 "에러"가 아니라 그냥
--   "대상에서 제외"로 처리하므로, 클라이언트 입장에서는 실패가 아니라
--   빈 결과의 성공으로 보인다 (letters/fan_arts는 curl로 직접 확인한 결과
--   정상 동작 중이며, 이번 문제는 videos 테이블에만 해당한다).
--
-- 조치: videos DELETE 정책을 지우고(있다면) 다시 만든다. 여러 번 실행해도 안전하다.
-- (제작 중에는 누구나 삭제 가능. 로그인 도입 전까지 이 전제를 유지한다.)

grant delete on public.videos to anon, authenticated;

drop policy if exists "videos_delete_public" on public.videos;
create policy "videos_delete_public"
  on public.videos
  for delete
  using (true);
