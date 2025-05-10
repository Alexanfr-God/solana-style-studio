
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card } from '@/components/ui/card';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

interface V1ExperienceProps {
  inView: boolean;
}

const V1Experience: React.FC<V1ExperienceProps> = ({ inView }) => {
  const [autoplaySpeed] = useState(5000); // 5 seconds per slide
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const walletScreens = [
    '/lovable-uploads/dee86368-28b2-44f6-a28e-a13e40b49386.png',
    '/lovable-uploads/fc482f64-4257-45a3-8925-2e671d1b857c.png',
    '/lovable-uploads/a5f8972f-b18d-4f17-8799-eeb025813f3b.png',
    '/lovable-uploads/0fb2a458-666a-4325-b073-0a3140679290.png',
    '/lovable-uploads/3e3cef14-ab8b-4548-9d7f-dbf72b21f327.png',
    '/lovable-uploads/6646952f-a2b0-4eca-b1b0-69a84dea8fd8.png',
    '/lovable-uploads/6c5f6524-8f98-4e95-add5-5a11710f4d4e.png',
    '/lovable-uploads/54546cd9-bd65-488c-bdb0-f7944c4cafe5.png',
    '/lovable-uploads/e53d0d83-93dd-41e8-8644-9dce1599f998.png',
  ];
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (inView && emblaApi) {
      interval = window.setInterval(() => {
        emblaApi.scrollNext();
      }, autoplaySpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inView, autoplaySpeed, emblaApi]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className={`space-y-6 transition-all duration-1000 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-purple-500 mb-2">
            V1 Experience
          </h2>
          <h3 className="text-xl md:text-2xl font-medium text-white/90 mb-4">
            Minimal, Memetic, Instantly Customizable.
          </h3>
          <p className="text-white/70">
            For meme lovers and brand fans – instantly apply custom login screens. 
            Inspired by community creativity.
          </p>
        </div>
      </div>
      
      <div className={`transition-all duration-1000 delay-500 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        <div className="overflow-visible px-4 relative">
          <div className="relative w-full" ref={emblaRef}>
            <div className="flex py-8">
              {walletScreens.map((screen, index) => {
                const isCenter = index === currentIndex;
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "relative flex-[0_0_80%] md:flex-[0_0_60%] lg:flex-[0_0_40%] min-w-0 pl-4 transition-all duration-500 ease-in-out", 
                      isCenter ? "z-10" : "z-0"
                    )}
                  >
                    <div 
                      className={cn(
                        "bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden rounded-lg transition-all duration-500 ease-in-out",
                        isCenter 
                          ? "scale-110 shadow-[0_0_25px_rgba(255,255,255,0.15)]" 
                          : "scale-90 opacity-70"
                      )}
                    >
                      <div className="aspect-[9/16] relative overflow-hidden rounded-md">
                        <img 
                          src={screen} 
                          alt={`Wallet screen ${index + 1}`} 
                          className={cn(
                            "w-full h-full object-cover object-center transition-opacity duration-300",
                            inView ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 hidden md:block">
            <button 
              onClick={() => emblaApi?.scrollPrev()} 
              className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-all"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
          
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden md:block">
            <button 
              onClick={() => emblaApi?.scrollNext()} 
              className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-all"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          
          <div className="flex justify-center mt-4 gap-2">
            {walletScreens.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-purple-500 w-6' : 'bg-gray-600 w-2'}`}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default V1Experience;
