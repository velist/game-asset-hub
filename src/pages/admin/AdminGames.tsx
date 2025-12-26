import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminGames = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">游戏管理</h1>
      <Card>
        <CardHeader><CardTitle>游戏列表</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">游戏管理功能将在下一阶段完善，包括添加、编辑、删除游戏资源。</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGames;
