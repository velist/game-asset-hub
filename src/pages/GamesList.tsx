import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameCard from "@/components/home/GameCard";
import SortSelect, { type SortOption } from "@/components/home/SortSelect";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Game, Tag } from "@/types/game";

const GAMES_PER_PAGE = 20;

const GamesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  
  const tagId = searchParams.get("tag");
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = (searchParams.get("sort") as SortOption) || "newest";

  // 获取标签信息
  const { data: tag } = useQuery({
    queryKey: ["tag", tagId],
    queryFn: async () => {
      if (!tagId) return null;
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("id", tagId)
        .maybeSingle();
      if (error) throw error;
      return data as Tag | null;
    },
    enabled: !!tagId,
  });

  // 获取游戏总数
  const { data: totalCount } = useQuery({
    queryKey: ["gamesCount", tagId],
    queryFn: async () => {
      if (tagId) {
        const { count, error } = await supabase
          .from("game_tags")
          .select("*", { count: "exact", head: true })
          .eq("tag_id", tagId);
        if (error) throw error;
        return count || 0;
      } else {
        const { count, error } = await supabase
          .from("games")
          .select("*", { count: "exact", head: true });
        if (error) throw error;
        return count || 0;
      }
    },
  });

  // 获取分页游戏
  const { data: games, isLoading } = useQuery({
    queryKey: ["gamesPaginated", tagId, currentPage, sortBy],
    queryFn: async () => {
      const from = (currentPage - 1) * GAMES_PER_PAGE;
      const to = from + GAMES_PER_PAGE - 1;

      if (tagId) {
        // 先获取该标签的游戏ID
        const { data: gameTagsData, error: tagsError } = await supabase
          .from("game_tags")
          .select("game_id")
          .eq("tag_id", tagId);
        
        if (tagsError) throw tagsError;
        const gameIds = gameTagsData.map((gt) => gt.game_id);
        
        if (gameIds.length === 0) return [];

        let query = supabase
          .from("games")
          .select(`*, game_tags(tag_id, tags(*))`)
          .in("id", gameIds);

        switch (sortBy) {
          case "oldest":
            query = query.order("created_at", { ascending: true });
            break;
          case "popular":
            query = query.order("view_count", { ascending: false });
            break;
          default:
            query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query.range(from, to);
        if (error) throw error;

        return (data || []).map((game: any) => ({
          ...game,
          tags: game.game_tags?.map((gt: any) => gt.tags).filter(Boolean) || [],
        })) as Game[];
      } else {
        let query = supabase
          .from("games")
          .select(`*, game_tags(tag_id, tags(*))`);

        switch (sortBy) {
          case "oldest":
            query = query.order("created_at", { ascending: true });
            break;
          case "popular":
            query = query.order("view_count", { ascending: false });
            break;
          default:
            query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query.range(from, to);
        if (error) throw error;

        return (data || []).map((game: any) => ({
          ...game,
          tags: game.game_tags?.map((gt: any) => gt.tags).filter(Boolean) || [],
        })) as Game[];
      }
    },
  });

  const totalPages = Math.ceil((totalCount || 0) / GAMES_PER_PAGE);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleSortChange = (newSort: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", newSort);
    params.set("page", "1");
    setSearchParams(params);
  };

  const pageTitle = tag ? tag.name : "全部游戏";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchValue={search} onSearchChange={setSearch} />

      <main className="container py-8 flex-1">
        {/* 返回按钮 */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </Button>

        <div className="space-y-6">
          {/* 标题和排序 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{pageTitle}</h1>
              {totalCount !== undefined && (
                <span className="text-muted-foreground">({totalCount} 个游戏)</span>
              )}
            </div>
            <SortSelect value={sortBy} onChange={handleSortChange} />
          </div>

          {/* 游戏列表 */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(GAMES_PER_PAGE)].map((_, i) => (
                <Skeleton key={i} className="h-[280px] rounded-lg" />
              ))}
            </div>
          ) : games && games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无游戏资源</p>
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-10"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GamesList;
