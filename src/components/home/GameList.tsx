import { useGames } from "@/hooks/useGames";
import GameCard from "./GameCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { SortOption } from "./SortSelect";

interface GameListProps {
  search: string;
  tagId: string | null;
  sortBy: SortOption;
}

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};

export default GameList;
