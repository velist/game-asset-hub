import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  LayoutDashboard,
  Gamepad,
  Tags,
  Image,
  LogOut,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "仪表盘" },
  { to: "/admin/games", icon: Gamepad, label: "游戏管理" },
  { to: "/admin/tags", icon: Tags, label: "标签管理" },
  { to: "/admin/banners", icon: Image, label: "轮播图管理" },
  { to: "/admin/popups", icon: Image, label: "弹窗管理" },
  { to: "/admin/widgets", icon: Image, label: "悬浮组件" },
  { to: "/admin/announcements", icon: Image, label: "公告管理" },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 border-r bg-card min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <Link to="/admin" className="flex items-center gap-2 font-bold text-xl">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span>管理后台</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-secondary")}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            返回前台
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
