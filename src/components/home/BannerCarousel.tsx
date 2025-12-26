import { useBanners } from "@/hooks/useGames";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const BannerCarousel = () => {
  const { data: banners, isLoading } = useBanners();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // 自动轮播
  useEffect(() => {
    if (!api || count <= 1) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api, count]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="w-full h-[300px] md:h-[400px] rounded-xl" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const renderBannerContent = (banner: any) => (
    <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden group">
      <img
        src={banner.image_url}
        alt={banner.title || "Banner"}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      {banner.title && (
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">
            {banner.title}
          </h2>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              {banner.game_id ? (
                <Link to={`/game/${banner.game_id}`} className="block">
                  {renderBannerContent(banner)}
                </Link>
              ) : banner.link_url ? (
                <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block">
                  {renderBannerContent(banner)}
                </a>
              ) : (
                renderBannerContent(banner)
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Carousel>

      {/* 指示器 */}
      {count > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                current === index
                  ? "w-6 bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`跳转到第 ${index + 1} 张`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
