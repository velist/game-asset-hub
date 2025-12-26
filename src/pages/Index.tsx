import { useState } from "react";
import Header from "@/components/layout/Header";
import BannerCarousel from "@/components/home/BannerCarousel";
import FeaturedGames from "@/components/home/FeaturedGames";
import TagFilter from "@/components/home/TagFilter";
import SortSelect, { type SortOption } from "@/components/home/SortSelect";
import GameList from "@/components/home/GameList";

const Index = () => {
  const [search, setSearch] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  return (
    <div className="min-h-screen bg-background">
      <Header searchValue={search} onSearchChange={setSearch} />

      <main className="container py-8 space-y-8">
        {/* 轮播图 */}
        <BannerCarousel />

        {/* 精选推荐 */}
        <FeaturedGames />

        {/* 游戏列表区域 */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">全部游戏</h2>
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>

          {/* 标签筛选 */}
          <TagFilter
            selectedTagId={selectedTagId}
            onTagSelect={setSelectedTagId}
          />

          {/* 游戏列表 */}
          <GameList search={search} tagId={selectedTagId} sortBy={sortBy} />
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t bg-muted/50">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 游戏资源站. 仅供学习交流使用，请支持正版游戏。</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
