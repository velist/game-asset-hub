import { useBanners } from "@/hooks/useGames";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

const BannerCarousel = () => {
  const { data: banners, isLoading } = useBanners();

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="w-full h-[300px] md:h-[400px] rounded-xl" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[400px] rounded-xl bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">暂无轮播图</p>
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            {banner.game_id ? (
              <Link to={`/game/${banner.game_id}`}>
                <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                  <img
                    src={banner.image_url}
                    alt={banner.title || "Banner"}
                    className="w-full h-full object-cover"
                  />
                  {banner.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-6">
                      <h2 className="text-2xl font-bold text-foreground">
                        {banner.title}
                      </h2>
                    </div>
                  )}
                </div>
              </Link>
            ) : banner.link_url ? (
              <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                  <img
                    src={banner.image_url}
                    alt={banner.title || "Banner"}
                    className="w-full h-full object-cover"
                  />
                  {banner.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-6">
                      <h2 className="text-2xl font-bold text-foreground">
                        {banner.title}
                      </h2>
                    </div>
                  )}
                </div>
              </a>
            ) : (
              <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                <img
                  src={banner.image_url}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover"
                />
                {banner.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      {banner.title}
                    </h2>
                  </div>
                )}
              </div>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
};

export default BannerCarousel;
