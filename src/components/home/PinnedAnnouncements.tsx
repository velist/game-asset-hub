import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const PinnedAnnouncements = () => {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["pinned-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .eq("is_pinned", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !announcements?.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Pin className="h-5 w-5 text-primary" />
          重要公告
        </h2>
        <Link
          to="/announcements"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          查看全部
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3">
        {announcements.map((announcement) => (
          <Link key={announcement.id} to={`/announcement/${announcement.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-3 px-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Badge variant="secondary" className="shrink-0">
                    置顶
                  </Badge>
                  <span className="font-medium truncate">
                    {announcement.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(announcement.created_at), "MM-dd")}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PinnedAnnouncements;
