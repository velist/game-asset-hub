import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  GripVertical,
  MessageCircle,
  ExternalLink,
  Users,
  Megaphone,
  Headphones,
} from "lucide-react";

interface WidgetFormData {
  type: "social" | "ad" | "custom";
  position: "left" | "right";
  title: string;
  icon: string;
  link_url: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

interface Widget {
  id: string;
  type: string;
  position: string;
  title: string | null;
  icon: string | null;
  link_url: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const initialFormData: WidgetFormData = {
  type: "social",
  position: "right",
  title: "",
  icon: "link",
  link_url: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
};

const typeLabels = {
  social: "社交/客服",
  ad: "推广广告",
  custom: "自定义",
};

const positionLabels = {
  left: "左侧（推广区）",
  right: "右侧（客服/社交）",
};

const iconOptions = [
  { value: "message", label: "消息", icon: MessageCircle },
  { value: "link", label: "链接", icon: ExternalLink },
  { value: "users", label: "社群", icon: Users },
  { value: "megaphone", label: "推广", icon: Megaphone },
  { value: "headphones", label: "客服", icon: Headphones },
];

// Sortable Widget Item Component
const SortableWidgetItem = ({
  widget,
  onEdit,
  onDelete,
}: {
  widget: Widget;
  onEdit: (widget: Widget) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIconComponent = (iconName: string | null) => {
    const option = iconOptions.find((o) => o.value === iconName);
    if (option) {
      const IconComp = option.icon;
      return <IconComp className="h-4 w-4" />;
    }
    return <ExternalLink className="h-4 w-4" />;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border rounded-lg"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      {widget.image_url ? (
        <img
          src={widget.image_url}
          alt={widget.title || ""}
          className="w-10 h-10 rounded object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
          {getIconComponent(widget.icon)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{widget.title || "未命名"}</p>
        <p className="text-sm text-muted-foreground">
          {typeLabels[widget.type as keyof typeof typeLabels]}
        </p>
      </div>

      <span
        className={`px-2 py-1 rounded text-xs ${
          widget.is_active
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {widget.is_active ? "启用" : "禁用"}
      </span>

      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(widget)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(widget.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

const AdminWidgets = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WidgetFormData>(initialFormData);
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: widgets, isLoading } = useQuery({
    queryKey: ["admin-widgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("floating_widgets")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Widget[];
    },
  });

  // Group widgets by position
  const leftWidgets = widgets?.filter((w) => w.position === "left") || [];
  const rightWidgets = widgets?.filter((w) => w.position === "right") || [];

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `widgets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("game-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("game-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: url }));
      toast({ title: "图片上传成功" });
    } catch (error) {
      toast({ title: "图片上传失败", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("floating_widgets")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-widgets"] });
      queryClient.invalidateQueries({ queryKey: ["active-widgets"] });
    },
    onError: () => {
      toast({ title: "排序更新失败", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: WidgetFormData) => {
      const { error } = await supabase.from("floating_widgets").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-widgets"] });
      queryClient.invalidateQueries({ queryKey: ["active-widgets"] });
      toast({ title: "组件创建成功" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "创建失败", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WidgetFormData }) => {
      const { error } = await supabase
        .from("floating_widgets")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-widgets"] });
      queryClient.invalidateQueries({ queryKey: ["active-widgets"] });
      toast({ title: "组件更新成功" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "更新失败", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("floating_widgets")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-widgets"] });
      queryClient.invalidateQueries({ queryKey: ["active-widgets"] });
      toast({ title: "组件删除成功" });
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: "删除失败", variant: "destructive" });
    },
  });

  const handleDragEnd = (event: DragEndEvent, position: "left" | "right") => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const items = position === "left" ? leftWidgets : rightWidgets;
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex);
      const updates = reordered.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));

      reorderMutation.mutate(updates);
    }
  };

  const handleEdit = (widget: Widget) => {
    setEditingId(widget.id);
    setFormData({
      type: widget.type as "social" | "ad" | "custom",
      position: widget.position as "left" | "right",
      title: widget.title || "",
      icon: widget.icon || "link",
      link_url: widget.link_url || "",
      image_url: widget.image_url || "",
      is_active: widget.is_active,
      sort_order: widget.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openAddDialog = (position: "left" | "right") => {
    setFormData({ ...initialFormData, position });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">悬浮组件管理</h1>
          <p className="text-muted-foreground">
            拖拽排序，分组管理左侧推广与右侧客服/社交组件
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side - Promotions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">左侧 - 推广区</CardTitle>
                <p className="text-sm text-muted-foreground">广告、活动推广</p>
              </div>
              <Button size="sm" onClick={() => openAddDialog("left")}>
                <Plus className="mr-1 h-4 w-4" />
                添加
              </Button>
            </CardHeader>
            <CardContent>
              {leftWidgets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  暂无左侧组件
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, "left")}
                >
                  <SortableContext
                    items={leftWidgets.map((w) => w.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {leftWidgets.map((widget) => (
                        <SortableWidgetItem
                          key={widget.id}
                          widget={widget}
                          onEdit={handleEdit}
                          onDelete={setDeletingId}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>

          {/* Right Side - Customer Service / Social */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">右侧 - 客服/社交</CardTitle>
                <p className="text-sm text-muted-foreground">
                  客服入口、社交链接、回到顶部
                </p>
              </div>
              <Button size="sm" onClick={() => openAddDialog("right")}>
                <Plus className="mr-1 h-4 w-4" />
                添加
              </Button>
            </CardHeader>
            <CardContent>
              {rightWidgets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  暂无右侧组件
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, "right")}
                >
                  <SortableContext
                    items={rightWidgets.map((w) => w.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {rightWidgets.map((widget) => (
                        <SortableWidgetItem
                          key={widget.id}
                          widget={widget}
                          onEdit={handleEdit}
                          onDelete={setDeletingId}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              <div className="mt-4 p-3 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                💡 回到顶部按钮为系统内置，滚动超过 300px 自动显示
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "编辑组件" : "添加组件"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>类型</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "social" | "ad" | "custom") =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">社交/客服</SelectItem>
                  <SelectItem value="ad">推广广告</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>位置</Label>
              <Select
                value={formData.position}
                onValueChange={(value: "left" | "right") =>
                  setFormData((prev) => ({ ...prev, position: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">左侧（推广区）</SelectItem>
                  <SelectItem value="right">右侧（客服/社交）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>标题</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="组件标题（悬浮提示）"
              />
            </div>

            <div className="space-y-2">
              <Label>图标</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, icon: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>链接URL</Label>
              <Input
                value={formData.link_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link_url: e.target.value }))
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>图片（可选，替代图标）</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      image_url: e.target.value,
                    }))
                  }
                  placeholder="图片URL"
                />
                <label>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="预览"
                  className="h-16 w-16 object-cover rounded"
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label>启用</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                取消
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingId ? "保存" : "创建"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个组件吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminWidgets;
