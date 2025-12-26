import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useGameMutations } from "@/hooks/useGameMutations";
import GameForm from "@/components/admin/GameForm";
import { Plus, Pencil, Trash2, Search, Star, Loader2 } from "lucide-react";
import type { Game } from "@/types/game";

const AdminGames = () => {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const { deleteGame } = useGameMutations();

  const { data: games, isLoading } = useQuery({
    queryKey: ["admin-games", search],
    queryFn: async () => {
      let query = supabase
        .from("games")
        .select(`
          *,
          game_tags(tag_id, tags(*)),
          game_screenshots(*),
          download_links(*)
        `)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((game: any) => ({
        ...game,
        tags: game.game_tags?.map((gt: any) => gt.tags).filter(Boolean) || [],
        screenshots: game.game_screenshots || [],
        download_links: game.download_links || [],
      })) as Game[];
    },
  });

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingGameId) return;
    await deleteGame.mutateAsync(deletingGameId);
    setDeletingGameId(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGame(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">游戏管理</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          添加游戏
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索游戏名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Games Table */}
      <Card>
        <CardHeader>
          <CardTitle>游戏列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : games && games.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">封面</TableHead>
                  <TableHead>游戏名称</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>标签</TableHead>
                  <TableHead className="w-20">下载链接</TableHead>
                  <TableHead className="w-20">浏览量</TableHead>
                  <TableHead className="w-28">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>
                      <div className="w-12 h-9 rounded overflow-hidden bg-muted">
                        {game.cover_url ? (
                          <img
                            src={game.cover_url}
                            alt={game.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            无
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{game.title}</span>
                        {game.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {game.version_info || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {game.tags?.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: tag.color, color: "#fff" }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {game.tags && game.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{game.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {game.download_links?.length || 0}
                    </TableCell>
                    <TableCell className="text-center">{game.view_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(game)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingGameId(game.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              暂无游戏数据
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingGame ? "编辑游戏" : "添加游戏"}</DialogTitle>
          </DialogHeader>
          <GameForm
            game={editingGame}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingGameId} onOpenChange={() => setDeletingGameId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个游戏吗？此操作不可撤销，游戏的所有截图和下载链接也将被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

export default AdminGames;
