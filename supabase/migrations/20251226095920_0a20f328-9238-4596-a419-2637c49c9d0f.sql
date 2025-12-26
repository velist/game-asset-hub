-- 创建增加浏览量的函数
CREATE OR REPLACE FUNCTION public.increment_view_count(game_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.games
  SET view_count = view_count + 1
  WHERE id = game_id;
END;
$$;