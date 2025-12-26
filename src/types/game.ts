export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Game {
  id: string;
  title: string;
  cover_url: string | null;
  description: string | null;
  version_info: string | null;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  screenshots?: GameScreenshot[];
  download_links?: DownloadLink[];
}

export interface GameScreenshot {
  id: string;
  game_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface DownloadLink {
  id: string;
  game_id: string;
  platform_name: string;
  url: string;
  extract_code: string | null;
  sort_order: number;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  game_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface GameTag {
  id: string;
  game_id: string;
  tag_id: string;
}
