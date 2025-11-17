import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";

type Slide = {
  image: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  align?: "left" | "center" | "right";
};

interface HeroCarouselProps {
  slides: Slide[];
  className?: string;
  heightClass?: string; // ví dụ: "h-[360px] md:h-[480px]"
  loop?: boolean;
  autoplayMs?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  className = "",
  heightClass = "h-[360px] md:h-[480px]",
  loop = true,
  autoplayMs = 3000,
}) => {
  const autoplay = React.useRef(
    Autoplay({ delay: autoplayMs, stopOnMouseEnter: true, stopOnInteraction: false })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop }, [autoplay.current]);

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s, idx) => (
            <div className="relative min-w-0 flex-[0_0_100%]" key={idx}>
              <div className={`relative w-full ${heightClass}`}>
                {/* Ảnh nền */}
                <img
                  src={s.image}
                  alt={s.title}
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                />
                {/* Overlay gradient an toàn (không phụ thuộc custom bg-*) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
                {/* Nội dung */}
                <div
                  className={`relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center ${
                    s.align === "right"
                      ? "justify-end text-right"
                      : s.align === "center"
                      ? "justify-center text-center"
                      : "justify-start text-left"
                  }`}
                >
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {s.title}
                    </h1>
                    {s.subtitle && (
                      <p className="text-lg md:text-xl text-white/90 mb-6">
                        {s.subtitle}
                      </p>
                    )}
                    {/* {s.ctaText && s.ctaHref && (
                      <Button asChild size="lg" className="shadow-soft">
                        <Link to={s.ctaHref}>{s.ctaText}</Link>
                      </Button>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nút điều hướng */}
      <button
        aria-label="Previous slide"
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-4xl"
      >
        ‹
      </button>
      <button
        aria-label="Next slide"
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-4xl"
      >
        ›
      </button>
    </div>
  );
};

export default HeroCarousel;