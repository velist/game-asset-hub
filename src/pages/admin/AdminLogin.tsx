import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({
          title: "注册成功",
          description: "账户已创建，请联系超级管理员授予管理权限",
        });
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        toast({
          title: "登录成功",
          description: "欢迎回来，管理员",
        });
      }
    } catch (error: any) {
      let message = error.message || "请检查邮箱和密码";
      if (error.message?.includes("User already registered")) {
        message = "该邮箱已注册";
      } else if (error.message?.includes("Invalid login credentials")) {
        message = "邮箱或密码错误";
      }
      toast({
        title: isSignUp ? "注册失败" : "登录失败",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">管理后台</CardTitle>
          <CardDescription>
            {isSignUp ? "创建管理员账户" : "请输入管理员账号登录"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "设置密码（至少6位）" : "请输入密码"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "注册中..." : "登录中..."}
                </>
              ) : (
                isSignUp ? "注册" : "登录"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp ? "已有账户？返回登录" : "没有账户？注册新账户"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
