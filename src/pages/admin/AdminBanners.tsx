import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, Upload, Loader2, GripVertical } from "lucide-react";
import type { Banner, Game } from "@/types/game";

const AdminBanners = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    link_url: "",
    game_id: "",
    is_active: true,
    sort_order: 0,
  });

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Banner[];
    },
  });

  const { data: games } = useQuery({
    queryKey: ["admin-games-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data as Pick<Game, "id" | "title">[];
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `banners/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("game-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("game-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: url }));
      toast({ title: "图片上传成功" });
    } catch (error: any) {
      toast({ title: "上传失败", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("banners").insert({
        title: formData.title || null,
        image_url: formData.image_url,
        link_url: formData.link_url || null,
        game_id: formData.game_id || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "轮播图添加成功" });
      handleCloseForm();
    },
    onError: (error: any) => {
      toast({ title: "添加失败", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingBanner) return;
      const { error } = await supabase
        .from("banners")
        .update({
          title: formData.title || null,
          image_url: formData.image_url,
          link_url: formData.link_url || null,
          game_id: formData.game_id || null,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
        })
        .eq("id", editingBanner.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "轮播图更新成功" });
      handleCloseForm();
    },
    onError: (error: any) => {
      toast({ title: "更新失败", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "轮播图已删除" });
      setDeletingBannerId(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("banners")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      game_id: banner.game_id || "",
      is_active: banner.is_active,
      sort_order: banner.sort_order,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBanner(null);
    setFormData({
      title: "",
      image_url: "",
      link_url: "",
      game_id: "",
      is_active: true,
      sort_order: banners?.length || 0,
    });
  };

  const handleSubmit = () => {
    if (!formData.image_url) {
      toast({ title: "请上传轮播图片", variant: "destructive" });
      return;
    }
    if (editingBanner) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">轮播图管理</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          添加轮播图
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>轮播图列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : banners && banners.length > 0 ? (
            <div className="space-y-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title || "Banner"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {banner.title || "未命名轮播图"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {banner.game_id
                        ? `关联游戏: ${games?.find((g) => g.id === banner.game_id)?.title || "未知"}`
                        : banner.link_url
                        ? `链接: ${banner.link_url}`
                        : "无跳转链接"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      排序: {banner.sort_order}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: banner.id, is_active: checked })
                      }
                    />
                    <span className="text-sm text-muted-foreground w-10">
                      {banner.is_active ? "显示" : "隐藏"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingBannerId(banner.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              暂无轮播图
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "编辑轮播图" : "添加轮播图"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Image Preview/Upload */}
            <div className="space-y-2">
              <Label>轮播图片 *</Label>
              {formData.image_url ? (
                <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-muted">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    更换图片
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-32"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      上传图片
                    </>
                  )}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">建议尺寸: 1920x400 或 21:9 比例</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">标题（可选）</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="轮播图标题"
              />
            </div>

            <div className="space-y-2">
              <Label>关联游戏（可选）</Label>
              <Select
                value={formData.game_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, game_id: value === "none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择关联游戏" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不关联游戏</SelectItem>
                  {games?.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">外部链接（可选）</Label>
              <Input
                id="link"
                value={formData.link_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, link_url: e.target.value }))}
                placeholder="https://..."
                disabled={!!formData.game_id}
              />
              <p className="text-xs text-muted-foreground">关联游戏后外部链接将被忽略</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">排序</Label>
              <Input
                id="sort"
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))
                }
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">数值越小越靠前</p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <Label htmlFor="active">立即显示</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseForm}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={isPending || isUploading}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingBanner ? "保存" : "添加"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingBannerId} onOpenChange={() => setDeletingBannerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这个轮播图吗？此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBannerId && deleteMutation.mutate(deletingBannerId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBanners;
