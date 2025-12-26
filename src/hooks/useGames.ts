import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Game, Tag } from "@/types/game";

export const useGames = (options?: {
  tagId?: string;
  search?: string;
  sortBy?: "newest" | "oldest" | "popular";
  featured?: boolean;
}) => {
  return useQuery({
    queryKey: ["games", options],
    queryFn: async () => {
      let query = supabase.from("games").select(`
        *,
        game_tags(tag_id, tags(*))
      `);

      if (options?.featured) {
        query = query.eq("is_featured", true);
      }

      if (options?.search) {
        query = query.ilike("title", `%${options.search}%`);
      }

      switch (options?.sortBy) {
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "popular":
          query = query.order("view_count", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include tags directly
      const games: Game[] = (data || []).map((game: any) => ({
        ...game,
        tags: game.game_tags?.map((gt: any) => gt.tags).filter(Boolean) || [],
      }));

      // Filter by tag if specified
      if (options?.tagId) {
        return games.filter((game) =>
          game.tags?.some((tag) => tag.id === options.tagId)
        );
      }

      return games;
    },
  });
};

export const useGame = (id: string) => {
  return useQuery({
    queryKey: ["game", id],
    queryFn: async () => {
      const { data: game, error } = await supabase
        .from("games")
        .select(`
          *,
          game_tags(tag_id, tags(*)),
          game_screenshots(*),
          download_links(*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!game) return null;

      return {
        ...game,
        tags: game.game_tags?.map((gt: any) => gt.tags).filter(Boolean) || [],
        screenshots: game.game_screenshots || [],
        download_links: game.download_links || [],
      } as Game;
    },
    enabled: !!id,
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Tag[];
    },
  });
};

export const useBanners = () => {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data;
    },
  });
};
