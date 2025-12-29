import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGame } from "@/hooks/useGames";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ImageLightbox from "@/components/game/ImageLightbox";
import RelatedGames from "@/components/game/RelatedGames";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Copy, Eye, Calendar, ExternalLink, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: game, isLoading } = useGame(id || "");
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Increment view count
  useEffect(() => {
    const incrementView = async () => {
      if (id) {
        await supabase.rpc("increment_view_count", { game_id: id });
      }
    };
    incrementView();
  }, [id]);

  const copyExtractCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "复制成功",
      description: "提取码已复制到剪贴板",
    });
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handleNextImage = () => {
    if (game?.screenshots) {
      setCurrentImageIndex((prev) =>
        prev === game.screenshots!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePreviousImage = () => {
    if (game?.screenshots) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? game.screenshots!.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header searchValue={search} onSearchChange={setSearch} />
        <main className="container py-8 flex-1">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-40" />
            </div>
            <Skeleton className="h-60" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header searchValue={search} onSearchChange={setSearch} />
        <main className="container py-8 flex-1">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">游戏未找到</h1>
            <Button asChild>
              <Link to="/">返回首页</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 封面图 */}
            <div className="aspect-video rounded-xl overflow-hidden bg-muted shadow-lg">
              {game.cover_url ? (
                <img
                  src={game.cover_url}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  暂无封面
                </div>
              )}
            </div>

            {/* 游戏截图 */}
            {game.screenshots && game.screenshots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    游戏截图
                    <span className="text-sm font-normal text-muted-foreground">
                      (点击放大)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {game.screenshots.map((screenshot, index) => (
                      <div
                        key={screenshot.id}
                        className="aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group relative hover:ring-2 ring-primary transition-all"
                        onClick={() => openLightbox(index)}
                      >
                        <img
                          src={screenshot.image_url}
                          alt={`游戏截图 ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="h-8 w-8 text-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 游戏介绍 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">游戏介绍</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {game.description ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{game.description}</p>
                  ) : (
                    <p className="text-muted-foreground">暂无介绍</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 相关游戏推荐 */}
            {game.tags && game.tags.length > 0 && (
              <RelatedGames currentGameId={game.id} tags={game.tags} />
            )}
          </div>

          {/* 右侧信息栏 */}
          <div className="space-y-6">
            {/* 游戏信息卡片 */}
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl leading-tight">{game.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 版本信息 */}
                {game.version_info && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">版本信息</p>
                    <p className="font-medium">{game.version_info}</p>
                  </div>
                )}

                {/* 标签 */}
                {game.tags && game.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">游戏标签</p>
                    <div className="flex flex-wrap gap-1.5">
                      {game.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          style={{ backgroundColor: tag.color, color: "#fff" }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 统计信息 */}
                <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground border-t">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{game.view_count} 次浏览</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(game.created_at).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 下载链接卡片 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5" />
                  下载地址
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {game.download_links && game.download_links.length > 0 ? (
                  game.download_links.map((link) => (
                    <div
                      key={link.id}
                      className="p-4 rounded-lg bg-muted space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{link.platform_name}</span>
                        <Button size="sm" asChild>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1.5" />
                            前往下载
                          </a>
                        </Button>
                      </div>
                      {link.extract_code && (
                        <div className="flex items-center justify-between p-2 rounded bg-background">
                          <span className="text-sm">
                            提取码: <code className="font-mono font-bold">{link.extract_code}</code>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyExtractCode(link.extract_code!)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            复制
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    暂无下载链接
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* 截图放大预览 */}
      {game.screenshots && (
        <ImageLightbox
          images={game.screenshots}
          currentIndex={currentImageIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
        />
      )}
    </div>
  );
};

export default GameDetail;
