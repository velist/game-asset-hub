import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GameFormData {
  title: string;
  summary: string;
  description: string;
  version_info: string;
  is_featured: boolean;
  cover_url: string | null;
  tagIds: string[];
  screenshots: { image_url: string; sort_order: number }[];
  download_links: { platform_name: string; url: string; extract_code: string; sort_order: number }[];
}

export const useGameMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("game-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("game-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const createGame = useMutation({
    mutationFn: async (data: GameFormData) => {
      // Create game
      const { data: game, error: gameError } = await supabase
        .from("games")
        .insert({
          title: data.title,
          summary: data.summary || null,
          description: data.description || null,
          version_info: data.version_info || null,
          is_featured: data.is_featured,
          cover_url: data.cover_url,
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Add tags
      if (data.tagIds.length > 0) {
        const tagInserts = data.tagIds.map((tagId) => ({
          game_id: game.id,
          tag_id: tagId,
        }));
        const { error: tagError } = await supabase.from("game_tags").insert(tagInserts);
        if (tagError) throw tagError;
      }

      // Add screenshots
      if (data.screenshots.length > 0) {
        const screenshotInserts = data.screenshots.map((s, i) => ({
          game_id: game.id,
          image_url: s.image_url,
          sort_order: i,
        }));
        const { error: ssError } = await supabase.from("game_screenshots").insert(screenshotInserts);
        if (ssError) throw ssError;
      }

      // Add download links
      if (data.download_links.length > 0) {
        const linkInserts = data.download_links.map((l, i) => ({
          game_id: game.id,
          platform_name: l.platform_name,
          url: l.url,
          extract_code: l.extract_code || null,
          sort_order: i,
        }));
        const { error: linkError } = await supabase.from("download_links").insert(linkInserts);
        if (linkError) throw linkError;
      }

      return game;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({ title: "游戏添加成功" });
    },
    onError: (error: any) => {
      toast({ title: "添加失败", description: error.message, variant: "destructive" });
    },
  });

  const updateGame = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GameFormData }) => {
      // Update game
      const { error: gameError } = await supabase
        .from("games")
        .update({
          title: data.title,
          summary: data.summary || null,
          description: data.description || null,
          version_info: data.version_info || null,
          is_featured: data.is_featured,
          cover_url: data.cover_url,
        })
        .eq("id", id);

      if (gameError) throw gameError;

      // Update tags - delete old and insert new
      await supabase.from("game_tags").delete().eq("game_id", id);
      if (data.tagIds.length > 0) {
        const tagInserts = data.tagIds.map((tagId) => ({
          game_id: id,
          tag_id: tagId,
        }));
        await supabase.from("game_tags").insert(tagInserts);
      }

      // Update screenshots - delete old and insert new
      await supabase.from("game_screenshots").delete().eq("game_id", id);
      if (data.screenshots.length > 0) {
        const screenshotInserts = data.screenshots.map((s, i) => ({
          game_id: id,
          image_url: s.image_url,
          sort_order: i,
        }));
        await supabase.from("game_screenshots").insert(screenshotInserts);
      }

      // Update download links - delete old and insert new
      await supabase.from("download_links").delete().eq("game_id", id);
      if (data.download_links.length > 0) {
        const linkInserts = data.download_links.map((l, i) => ({
          game_id: id,
          platform_name: l.platform_name,
          url: l.url,
          extract_code: l.extract_code || null,
          sort_order: i,
        }));
        await supabase.from("download_links").insert(linkInserts);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
      toast({ title: "游戏更新成功" });
    },
    onError: (error: any) => {
      toast({ title: "更新失败", description: error.message, variant: "destructive" });
    },
  });

  const deleteGame = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("games").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({ title: "游戏已删除" });
    },
    onError: (error: any) => {
      toast({ title: "删除失败", description: error.message, variant: "destructive" });
    },
  });

  return { uploadImage, createGame, updateGame, deleteGame };
};
