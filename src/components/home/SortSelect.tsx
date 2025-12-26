import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "newest" | "oldest" | "popular";

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SortSelect = ({ value, onChange }: SortSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="排序方式" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">最新上传</SelectItem>
        <SelectItem value="oldest">最早上传</SelectItem>
        <SelectItem value="popular">最多浏览</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortSelect;
