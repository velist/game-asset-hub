import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad, Tags, Image, Eye, Plus, TrendingUp, Clock } from "lucide-react";

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [gamesRes, tagsRes, bannersRes] = await Promise.all([
        supabase.from("games").select("id, view_count"),
        supabase.from("tags").select("id"),
        supabase.from("banners").select("id, is_active"),
      ]);

      const totalViews =
        gamesRes.data?.reduce((sum, g) => sum + (g.view_count || 0), 0) || 0;
      const activeBanners = bannersRes.data?.filter((b) => b.is_active).length || 0;

      return {
        games: gamesRes.data?.length || 0,
        tags: tagsRes.data?.length || 0,
        banners: bannersRes.data?.length || 0,
        activeBanners,
        totalViews,
      };
    },
  });

  const { data: recentGames, isLoading: gamesLoading } = useQuery({
    queryKey: ["admin-recent-games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, title, view_count, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: popularGames } = useQuery({
    queryKey: ["admin-popular-games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, title, view_count")
        .order("view_count", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const statCards = [
    {
      title: "游戏总数",
      value: stats?.games || 0,
      icon: Gamepad,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "标签总数",
      value: stats?.tags || 0,
      icon: Tags,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "活跃轮播图",
      value: `${stats?.activeBanners || 0} / ${stats?.banners || 0}`,
      icon: Image,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "总浏览量",
      value: stats?.totalViews?.toLocaleString() || 0,
      icon: Eye,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  const quickActions = [
    { title: "添加游戏", href: "/admin/games", icon: Gamepad },
    { title: "管理标签", href: "/admin/tags", icon: Tags },
    { title: "管理轮播图", href: "/admin/banners", icon: Image },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">仪表盘</h1>
        <Button asChild>
          <Link to="/admin/games">
            <Plus className="h-4 w-4 mr-2" />
            添加游戏
          </Link>
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading
          ? [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => (
              <Card key={stat.title} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近添加 */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>最近添加</CardTitle>
          </CardHeader>
          <CardContent>
            {gamesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentGames && recentGames.length > 0 ? (
              <div className="space-y-3">
                {recentGames.map((game) => (
                  <Link
                    key={game.id}
                    to={`/admin/games`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="font-medium truncate flex-1">{game.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(game.created_at).toLocaleDateString("zh-CN")}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">暂无游戏</p>
            )}
          </CardContent>
        </Card>

        {/* 热门游戏 */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle>热门游戏</CardTitle>
          </CardHeader>
          <CardContent>
            {popularGames && popularGames.length > 0 ? (
              <div className="space-y-3">
                {popularGames.map((game, index) => (
                  <div
                    key={game.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? "bg-yellow-500/20 text-yellow-600"
                          : index === 1
                          ? "bg-gray-300/20 text-gray-600"
                          : index === 2
                          ? "bg-orange-500/20 text-orange-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium truncate flex-1">{game.title}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {game.view_count.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">暂无数据</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                asChild
              >
                <Link to={action.href}>
                  <action.icon className="h-6 w-6" />
                  <span>{action.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
