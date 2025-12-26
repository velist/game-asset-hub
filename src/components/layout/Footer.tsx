import { Gamepad2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">游戏资源站</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} 游戏资源站. 仅供学习交流使用，请支持正版游戏。
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">关于我们</a>
            <a href="#" className="hover:text-foreground transition-colors">联系方式</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
