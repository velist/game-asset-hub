import { Link } from "react-router-dom";
import { useGames } from "@/hooks/useGames";
import GameCard from "./GameCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

const FeaturedGames = () => {
  const { data: games, isLoading } = useGames({ featured: true });

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">精选推荐</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">精选推荐</h2>
        {games.length > 4 && (
          <Link
            to="/games?featured=true"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            更多
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.slice(0, 4).map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedGames;
