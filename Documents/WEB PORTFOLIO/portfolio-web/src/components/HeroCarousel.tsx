import { useState, useEffect, useRef, useCallback } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface CarouselImage {
  src: string;
  alt: string;
  caption?: string;
}

interface HeroCarouselProps {
  images: CarouselImage[];
}

export function HeroCarousel({ images }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent((index + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    goTo(current + 1);
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo(current - 1);
  }, [current, goTo]);

  useEffect(() => {
    if (isHovered) return;
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % images.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div
      className="relative z-10 rounded-2xl overflow-hidden shadow-2xl h-[420px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
          }}
        >
          <ImageWithFallback
            src={img.src}
            alt={img.alt}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          
          {/* Caption */}
          {img.caption && (
            <div className="absolute bottom-14 left-5 right-5">
              <p 
                className="text-white text-[0.95rem] font-medium transition-all duration-700 delay-300"
                style={{
                  textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                  opacity: i === current ? 1 : 0,
                  transform: i === current ? 'translateY(0)' : 'translateY(8px)',
                }}
              >
                {img.caption}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Prev / Next arrows */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 border-none rounded-full w-9 h-9 flex items-center justify-center cursor-pointer color-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button
        onClick={goNext}
        aria-label="Next slide"
        className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 border-none rounded-full w-9 h-9 flex items-center justify-center cursor-pointer color-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); }}
            aria-label={`Go to slide ${i + 1}`}
            className="h-2 rounded-full border-none cursor-pointer transition-all duration-300 p-0"
            style={{
              width: i === current ? '24px' : '8px',
              background: i === current ? 'white' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!isHovered && (
        <div className="absolute bottom-0 left-0 h-[3px] bg-white/80 z-10 animate-hero-progress" />
      )}

      <style>{`
        @keyframes hero-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-hero-progress {
          animation: hero-progress 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
