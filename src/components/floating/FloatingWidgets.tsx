import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowUp,
  MessageCircle,
  ExternalLink,
  Users,
  Megaphone,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FloatingWidgets = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { data: widgets } = useQuery({
    queryKey: ["active-widgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("floating_widgets")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case "message":
        return <MessageCircle className="h-5 w-5" />;
      case "link":
        return <ExternalLink className="h-5 w-5" />;
      case "users":
        return <Users className="h-5 w-5" />;
      case "megaphone":
        return <Megaphone className="h-5 w-5" />;
      case "headphones":
        return <Headphones className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const leftWidgets = widgets?.filter((w) => w.position === "left") || [];
  const rightWidgets = widgets?.filter((w) => w.position === "right") || [];

  return (
    <>
      {/* Left side widgets - Promotions */}
      {leftWidgets.length > 0 && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
          {leftWidgets.map((widget) => (
            <a
              key={widget.id}
              href={widget.link_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              title={widget.title || ""}
            >
              {widget.image_url ? (
                <img
                  src={widget.image_url}
                  alt={widget.title || ""}
                  className="w-16 h-16 rounded-lg shadow-lg hover:scale-105 transition-transform object-cover"
                />
              ) : (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg"
                >
                  {getIcon(widget.icon)}
                </Button>
              )}
            </a>
          ))}
        </div>
      )}

      {/* Right side widgets - Customer Service / Social */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {rightWidgets.map((widget) => (
          <a
            key={widget.id}
            href={widget.link_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            title={widget.title || ""}
          >
            {widget.image_url ? (
              <img
                src={widget.image_url}
                alt={widget.title || ""}
                className="w-16 h-16 rounded-lg shadow-lg hover:scale-105 transition-transform object-cover"
              />
            ) : (
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg"
              >
                {getIcon(widget.icon)}
              </Button>
            )}
          </a>
        ))}
      </div>

      {/* Back to top button - Fixed bottom right */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "fixed right-4 bottom-4 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300",
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        onClick={scrollToTop}
        title="回到顶部"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </>
  );
};

export default FloatingWidgets;
