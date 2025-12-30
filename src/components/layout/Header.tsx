import { Link } from "react-router-dom";
import { Search, Gamepad2, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const Header = ({ searchValue = "", onSearchChange }: HeaderProps = {}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span>游戏资源站</span>
        </Link>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索游戏..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/">首页</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/announcements" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              公告
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
