import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad, Tags, Image, Eye } from "lucide-react";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [gamesRes, tagsRes, bannersRes] = await Promise.all([
        supabase.from("games").select("id, view_count"),
        supabase.from("tags").select("id"),
        supabase.from("banners").select("id"),
      ]);

      const totalViews =
        gamesRes.data?.reduce((sum, g) => sum + (g.view_count || 0), 0) || 0;

      return {
        games: gamesRes.data?.length || 0,
        tags: tagsRes.data?.length || 0,
        banners: bannersRes.data?.length || 0,
        totalViews,
      };
    },
  });

  const statCards = [
    {
      title: "游戏总数",
      value: stats?.games || 0,
      icon: Gamepad,
      color: "text-blue-500",
    },
    {
      title: "标签总数",
      value: stats?.tags || 0,
      icon: Tags,
      color: "text-green-500",
    },
    {
      title: "轮播图数量",
      value: stats?.banners || 0,
      icon: Image,
      color: "text-purple-500",
    },
    {
      title: "总浏览量",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">仪表盘</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">
            欢迎来到管理后台！您可以通过左侧菜单管理游戏资源、标签和轮播图。
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>游戏管理：添加、编辑、删除游戏资源</li>
            <li>标签管理：管理游戏分类标签</li>
            <li>轮播图管理：配置首页轮播展示内容</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
