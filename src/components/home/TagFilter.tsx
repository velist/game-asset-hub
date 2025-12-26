import { useTags } from "@/hooks/useGames";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TagFilterProps {
  selectedTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
}

const TagFilter = ({ selectedTagId, onTagSelect }: TagFilterProps) => {
  const { data: tags, isLoading } = useTags();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={selectedTagId === null ? "default" : "outline"}
        className="cursor-pointer"
        onClick={() => onTagSelect(null)}
      >
        全部
      </Badge>
      {tags?.map((tag) => (
        <Badge
          key={tag.id}
          variant={selectedTagId === tag.id ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onTagSelect(tag.id)}
          style={
            selectedTagId === tag.id
              ? { backgroundColor: tag.color, borderColor: tag.color }
              : {}
          }
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
};

export default TagFilter;
