import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2 } from "lucide-react";

const AdminTags = () => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags, isLoading } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tags").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tags").insert({ name: newTagName, color: newTagColor });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      setNewTagName("");
      toast({ title: "标签创建成功" });
    },
    onError: (error: any) => {
      toast({ title: "创建失败", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast({ title: "标签已删除" });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">标签管理</h1>
      
      <Card>
        <CardHeader><CardTitle>添加标签</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="标签名称" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="max-w-xs" />
            <Input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="w-16" />
            <Button onClick={() => createMutation.mutate()} disabled={!newTagName || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              添加
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>标签列表</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <div key={tag.id} className="flex items-center gap-2 p-2 rounded-lg border">
                  <Badge style={{ backgroundColor: tag.color }}>{tag.name}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(tag.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {(!tags || tags.length === 0) && <p className="text-muted-foreground">暂无标签</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTags;
