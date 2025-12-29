import { Link } from "react-router-dom";
import { useGames } from "@/hooks/useGames";
import GameCard from "./GameCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import type { SortOption } from "./SortSelect";

interface GameListProps {
  search: string;
  tagId: string | null;
  sortBy: SortOption;
}

const DISPLAY_LIMIT = 8;

const GameList = ({ search, tagId, sortBy }: GameListProps) => {
  const { data: games, isLoading } = useGames({
    search: search || undefined,
    tagId: tagId || undefined,
    sortBy,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-[280px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无游戏资源</p>
      </div>
    );
  }

  const displayedGames = games.slice(0, DISPLAY_LIMIT);
  const hasMore = games.length > DISPLAY_LIMIT;

  // 构建"更多"链接
  const moreLink = tagId ? `/games?tag=${tagId}&sort=${sortBy}` : `/games?sort=${sortBy}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Link
            to={moreLink}
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors px-4 py-2 rounded-md hover:bg-muted"
          >
            查看更多 ({games.length} 个游戏)
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default GameList;
