import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Game } from "@/types/game";

export const useRelatedGames = (currentGameId: string, tagIds: string[]) => {
  return useQuery({
    queryKey: ["relatedGames", currentGameId, tagIds],
    queryFn: async () => {
      if (tagIds.length === 0) return [];

      // 查找有相同标签的游戏
      const { data: gameTagsData, error: tagsError } = await supabase
        .from("game_tags")
        .select("game_id")
        .in("tag_id", tagIds)
        .neq("game_id", currentGameId);

      if (tagsError) throw tagsError;

      // 获取相关游戏ID（去重）
      const relatedGameIds = [...new Set(gameTagsData.map((gt) => gt.game_id))];

      if (relatedGameIds.length === 0) return [];

      // 获取游戏详情，限制4个
      const { data: gamesData, error: gamesError } = await supabase
        .from("games")
        .select(`
          *,
          game_tags(tag_id, tags(*))
        `)
        .in("id", relatedGameIds.slice(0, 8))
        .order("view_count", { ascending: false })
        .limit(4);

      if (gamesError) throw gamesError;

      // 转换数据格式
      const games: Game[] = (gamesData || []).map((game: any) => ({
        ...game,
        tags: game.game_tags?.map((gt: any) => gt.tags).filter(Boolean) || [],
      }));

      return games;
    },
    enabled: !!currentGameId && tagIds.length > 0,
  });
};
