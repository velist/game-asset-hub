import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useTags } from "@/hooks/useGames";
import { useGameMutations, type GameFormData } from "@/hooks/useGameMutations";
import { Upload, X, Plus, Loader2, Image as ImageIcon } from "lucide-react";
import type { Game, Tag } from "@/types/game";

interface GameFormProps {
  game?: Game | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const GameForm = ({ game, onSuccess, onCancel }: GameFormProps) => {
  const { toast } = useToast();
  const { data: allTags } = useTags();
  const { uploadImage, createGame, updateGame } = useGameMutations();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<GameFormData>({
    title: game?.title || "",
    summary: game?.summary || "",
    description: game?.description || "",
    version_info: game?.version_info || "",
    is_featured: game?.is_featured || false,
    cover_url: game?.cover_url || null,
    tagIds: game?.tags?.map((t) => t.id) || [],
    screenshots: game?.screenshots?.map((s) => ({ image_url: s.image_url, sort_order: s.sort_order })) || [],
    download_links: game?.download_links?.map((l) => ({
      platform_name: l.platform_name,
      url: l.url,
      extract_code: l.extract_code || "",
      sort_order: l.sort_order,
    })) || [],
  });

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file, "covers");
      setFormData((prev) => ({ ...prev, cover_url: url }));
      toast({ title: "封面上传成功" });
    } catch (error: any) {
      toast({ title: "上传失败", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newScreenshots = [...formData.screenshots];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i], "screenshots");
        newScreenshots.push({ image_url: url, sort_order: newScreenshots.length });
      }
      setFormData((prev) => ({ ...prev, screenshots: newScreenshots }));
      toast({ title: "截图上传成功" });
    } catch (error: any) {
      toast({ title: "上传失败", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const removeScreenshot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }));
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const addDownloadLink = () => {
    setFormData((prev) => ({
      ...prev,
      download_links: [...prev.download_links, { platform_name: "", url: "", extract_code: "", sort_order: prev.download_links.length }],
    }));
  };

  const updateDownloadLink = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      download_links: prev.download_links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const removeDownloadLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      download_links: prev.download_links.filter((_, i) => i !== index),
    }));
  };

  // 自动识别网盘名称
  const detectPlatformName = (url: string): string => {
    const patterns: { pattern: RegExp; name: string }[] = [
      { pattern: /pan\.baidu\.com|yun\.baidu\.com/, name: "百度网盘" },
      { pattern: /www\.123pan\.com|123pan\.com/, name: "123云盘" },
      { pattern: /pan\.quark\.cn|quark\.cn/, name: "夸克网盘" },
      { pattern: /www\.aliyundrive\.com|aliyundrive\.com|alipan\.com/, name: "阿里云盘" },
      { pattern: /cloud\.189\.cn|189\.cn/, name: "天翼云盘" },
      { pattern: /pan\.xunlei\.com|xunlei\.com/, name: "迅雷云盘" },
      { pattern: /weiyun\.com/, name: "腾讯微云" },
      { pattern: /drive\.google\.com/, name: "Google Drive" },
      { pattern: /mega\.nz|mega\.co\.nz/, name: "MEGA" },
      { pattern: /mediafire\.com/, name: "MediaFire" },
      { pattern: /1drv\.ms|onedrive\.live\.com/, name: "OneDrive" },
      { pattern: /dropbox\.com/, name: "Dropbox" },
      { pattern: /lanzou[a-z]*\.com/, name: "蓝奏云" },
      { pattern: /ctfile\.com/, name: "城通网盘" },
    ];
    
    for (const { pattern, name } of patterns) {
      if (pattern.test(url)) {
        return name;
      }
    }
    return "";
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: "请输入游戏名称", variant: "destructive" });
      return;
    }

    // 验证下载链接必填字段
    for (const link of formData.download_links) {
      if (!link.url.trim()) {
        toast({ title: "请填写下载链接", variant: "destructive" });
        return;
      }
      if (!link.platform_name.trim()) {
        toast({ title: "请填写网盘名称", variant: "destructive" });
        return;
      }
    }

    if (game) {
      await updateGame.mutateAsync({ id: game.id, data: formData });
    } else {
      await createGame.mutateAsync(formData);
    }
    onSuccess();
  };

  const isPending = createGame.isPending || updateGame.isPending;

  return (
    <ScrollArea className="h-[70vh]">
      <div className="space-y-6 p-1">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">游戏名称 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="请输入游戏名称"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">版本信息</Label>
            <Input
              id="version"
              value={formData.version_info}
              onChange={(e) => setFormData((prev) => ({ ...prev, version_info: e.target.value }))}
              placeholder="如：v1.0 官方中文版"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">简短介绍</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="一句话描述游戏亮点（显示在列表）"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">详细介绍</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="请输入游戏详细介绍..."
              rows={5}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: checked }))}
            />
            <Label htmlFor="featured">设为精选推荐</Label>
          </div>
        </div>

        {/* Cover Image */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">封面图片</CardTitle>
          </CardHeader>
          <CardContent>
            <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} className="hidden" />
            {formData.cover_url ? (
              <div className="relative w-48 aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => setFormData((prev) => ({ ...prev, cover_url: null }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => coverInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                上传封面
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Screenshots */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">游戏截图</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input type="file" ref={screenshotInputRef} accept="image/*" multiple onChange={handleScreenshotUpload} className="hidden" />
            <div className="grid grid-cols-3 gap-3">
              {formData.screenshots.map((s, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={s.image_url} alt="Screenshot" className="w-full h-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5"
                    onClick={() => removeScreenshot(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="aspect-video flex flex-col gap-1"
                onClick={() => screenshotInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                <span className="text-xs">添加截图</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">标签</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allTags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={formData.tagIds.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={formData.tagIds.includes(tag.id) ? { backgroundColor: tag.color } : {}}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
              {(!allTags || allTags.length === 0) && (
                <p className="text-sm text-muted-foreground">暂无标签，请先在标签管理中添加</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Download Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">下载链接</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.download_links.map((link, i) => (
              <div key={i} className="flex gap-2 items-start p-3 rounded-lg border">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="下载链接 *"
                    value={link.url}
                    onChange={(e) => {
                      const url = e.target.value;
                      updateDownloadLink(i, "url", url);
                      // 自动识别网盘名称
                      const detectedName = detectPlatformName(url);
                      if (detectedName && !link.platform_name) {
                        updateDownloadLink(i, "platform_name", detectedName);
                      }
                    }}
                  />
                  <Input
                    placeholder="网盘名称（自动识别）"
                    value={link.platform_name}
                    onChange={(e) => updateDownloadLink(i, "platform_name", e.target.value)}
                  />
                  <Input
                    placeholder="提取码（选填）"
                    value={link.extract_code}
                    onChange={(e) => updateDownloadLink(i, "extract_code", e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeDownloadLink(i)}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addDownloadLink} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              添加下载链接
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || isUploading}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {game ? "保存修改" : "添加游戏"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default GameForm;
