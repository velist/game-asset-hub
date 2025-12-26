import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminBanners = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">轮播图管理</h1>
      <Card>
        <CardHeader><CardTitle>轮播图列表</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">轮播图管理功能将在下一阶段完善。</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBanners;
