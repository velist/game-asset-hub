import { useParams, Link } from "react-router-dom";
import { useGame } from "@/hooks/useGames";
import Header from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Copy, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: game, isLoading } = useGame(id || "");
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const copyExtractCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "复制成功",
      description: "提取码已复制到剪贴板",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchValue={search} onSearchChange={setSearch} />
        <main className="container py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-40" />
            </div>
            <Skeleton className="h-60" />
          </div>
        </main>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchValue={search} onSearchChange={setSearch} />
        <main className="container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">游戏未找到</h1>
            <Button asChild>
              <Link to="/">返回首页</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchValue={search} onSearchChange={setSearch} />

      <main className="container py-8">
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
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
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
              <div className="space-y-2">
                <h3 className="font-semibold">游戏截图</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {game.screenshots.map((screenshot) => (
                    <div
                      key={screenshot.id}
                      className="aspect-video rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={screenshot.image_url}
                        alt="游戏截图"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 游戏介绍 */}
            <Card>
              <CardHeader>
                <CardTitle>游戏介绍</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {game.description ? (
                    <p className="whitespace-pre-wrap">{game.description}</p>
                  ) : (
                    <p className="text-muted-foreground">暂无介绍</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧信息栏 */}
          <div className="space-y-6">
            {/* 游戏信息卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{game.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 版本信息 */}
                {game.version_info && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      版本信息
                    </p>
                    <p className="font-medium">{game.version_info}</p>
                  </div>
                )}

                {/* 标签 */}
                {game.tags && game.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">标签</p>
                    <div className="flex flex-wrap gap-1">
                      {game.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          style={{
                            backgroundColor: tag.color,
                            color: "#fff",
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 统计信息 */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{game.view_count} 次浏览</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(game.created_at).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 下载链接卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  下载地址
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {game.download_links && game.download_links.length > 0 ? (
                  game.download_links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div>
                        <p className="font-medium">{link.platform_name}</p>
                        {link.extract_code && (
                          <p className="text-sm text-muted-foreground">
                            提取码: {link.extract_code}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {link.extract_code && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyExtractCode(link.extract_code!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" asChild>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            下载
                          </a>
                        </Button>
                      </div>
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
    </div>
  );
};

export default GameDetail;
