import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import type { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  return (
    <Link to={`/game/${game.id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {game.cover_url ? (
            <img
              src={game.cover_url}
              alt={game.title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              暂无封面
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1 mb-2">
            {game.title}
          </h3>
          {game.version_info && (
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {game.version_info}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {game.tags?.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: tag.color, color: "#fff" }}
              >
                {tag.name}
              </Badge>
            ))}
            {game.tags && game.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{game.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{game.view_count}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default GameCard;
