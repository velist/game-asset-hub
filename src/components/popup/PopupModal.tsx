import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const POPUP_DISMISSED_KEY = "popup_dismissed_";

const PopupModal = () => {
  const [open, setOpen] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<{
    id: string;
    title: string;
    content: string | null;
    image_url: string | null;
    link_url: string | null;
    link_text: string | null;
    show_once: boolean;
    delay_seconds: number;
  } | null>(null);

  const { data: popups } = useQuery({
    queryKey: ["active-popups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!popups || popups.length === 0) return;

    // Find first popup that hasn't been dismissed (if show_once)
    const availablePopup = popups.find((popup) => {
      if (popup.show_once) {
        const dismissed = localStorage.getItem(POPUP_DISMISSED_KEY + popup.id);
        return !dismissed;
      }
      return true;
    });

    if (availablePopup) {
      const timer = setTimeout(() => {
        setCurrentPopup(availablePopup);
        setOpen(true);
      }, (availablePopup.delay_seconds || 0) * 1000);

      return () => clearTimeout(timer);
    }
  }, [popups]);

  const handleClose = () => {
    if (currentPopup?.show_once) {
      localStorage.setItem(POPUP_DISMISSED_KEY + currentPopup.id, "true");
    }
    setOpen(false);
  };

  const handleLinkClick = () => {
    if (currentPopup?.link_url) {
      window.open(currentPopup.link_url, "_blank");
    }
    handleClose();
  };

  if (!currentPopup) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentPopup.title}</DialogTitle>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4">
          {currentPopup.image_url && (
            <img
              src={currentPopup.image_url}
              alt={currentPopup.title}
              className="w-full rounded-lg object-cover max-h-64"
            />
          )}

          {currentPopup.content && (
            <p className="text-muted-foreground">{currentPopup.content}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              关闭
            </Button>
            {currentPopup.link_url && (
              <Button onClick={handleLinkClick}>
                {currentPopup.link_text || "查看详情"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupModal;
