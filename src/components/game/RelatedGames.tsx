import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRelatedGames } from "@/hooks/useRelatedGames";
import type { Tag } from "@/types/game";

interface RelatedGamesProps {
  currentGameId: string;
  tags: Tag[];
}

const RelatedGames = ({ currentGameId, tags }: RelatedGamesProps) => {
  const tagIds = tags.map((t) => t.id);
  const { data: relatedGames, isLoading } = useRelatedGames(currentGameId, tagIds);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">相关游戏推荐</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!relatedGames || relatedGames.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">相关游戏推荐</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedGames.map((game) => (
            <Link
              key={game.id}
              to={`/game/${game.id}`}
              className="group block"
            >
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted mb-2">
                {game.cover_url ? (
                  <img
                    src={game.cover_url}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    暂无封面
                  </div>
                )}
              </div>
              <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {game.title}
              </h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {game.tags?.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs px-1.5 py-0"
                    style={{ backgroundColor: tag.color, color: "#fff" }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedGames;
