-- 创建管理员角色枚举
CREATE TYPE public.app_role AS ENUM ('admin');

-- 创建用户角色表
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 创建角色检查函数
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 用户角色表 RLS 策略
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 创建标签表
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- 标签表 RLS：所有人可读，管理员可写
CREATE POLICY "Anyone can view tags"
ON public.tags
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage tags"
ON public.tags
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 创建游戏表
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    cover_url TEXT,
    description TEXT,
    version_info TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- 游戏表 RLS：所有人可读，管理员可写
CREATE POLICY "Anyone can view games"
ON public.games
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage games"
ON public.games
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 创建游戏截图表
CREATE TABLE public.game_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.game_screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view screenshots"
ON public.game_screenshots
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage screenshots"
ON public.game_screenshots
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 创建游戏-标签关联表
CREATE TABLE public.game_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    UNIQUE (game_id, tag_id)
);

ALTER TABLE public.game_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game_tags"
ON public.game_tags
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage game_tags"
ON public.game_tags
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 创建下载链接表
CREATE TABLE public.download_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    platform_name TEXT NOT NULL,
    url TEXT NOT NULL,
    extract_code TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.download_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view download_links"
ON public.download_links
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage download_links"
ON public.download_links
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 创建轮播图表
CREATE TABLE public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
ON public.banners
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all banners"
ON public.banners
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage banners"
ON public.banners
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 游戏表更新时间触发器
CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON public.games
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 创建存储桶用于图片上传
INSERT INTO storage.buckets (id, name, public) VALUES ('game-images', 'game-images', true);

-- 存储桶 RLS 策略
CREATE POLICY "Anyone can view game images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'game-images');

CREATE POLICY "Admins can upload game images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'game-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update game images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'game-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete game images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'game-images' AND public.has_role(auth.uid(), 'admin'));