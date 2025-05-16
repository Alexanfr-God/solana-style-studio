
import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface V1ExperienceProps {
  inView: boolean;
}

const V1Experience: React.FC<V1ExperienceProps> = ({ inView }) => {
  const [autoplaySpeed] = useState(5000); // 5 seconds per slide
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();
  const [hasError, setHasError] = useState(false);
  
  // Add the new images to the existing collection
  const walletScreens = [
    // Original images
    '/lovable-uploads/dee86368-28b2-44f6-a28e-a13e40b49386.png',
    '/lovable-uploads/fc482f64-4257-45a3-8925-2e671d1b857c.png',
    '/lovable-uploads/a5f8972f-b18d-4f17-8799-eeb025813f3b.png',
    '/lovable-uploads/0fb2a458-666a-4325-b073-0a3140679290.png',
    '/lovable-uploads/3e3cef14-ab8b-4548-9d7f-dbf72b21f327.png',
    '/lovable-uploads/6646952f-a2b0-4eca-b1b0-69a84dea8fd8.png',
    '/lovable-uploads/6c5f6524-8f98-4e95-add5-5a11710f4d4e.png',
    '/lovable-uploads/54546cd9-bd65-488c-bdb0-f7944c4cafe5.png',
    '/lovable-uploads/e53d0d83-93dd-41e8-8644-9dce1599f998.png',
    // New images
    '/lovable-uploads/a8a0aa8b-cabe-4031-b6c4-c3fd3c4007cd.png',
    '/lovable-uploads/d4fc8532-6040-450a-a8cf-d1d459c42e46.png',
    '/lovable-uploads/7cbac3b4-b6e4-4b03-bd16-6d11f9a0a6fd.png',
    '/lovable-uploads/16a1428b-9786-4800-9d26-897ce3db78af.png',
    '/lovable-uploads/ac5b7bea-562a-4609-a80b-c37750039adc.png',
    '/lovable-uploads/9dd9ce9c-2158-40cf-98ee-2e189bd56595.png',
    '/lovable-uploads/f4b10743-aa1f-4567-ad24-07f80f14b668.png',
  ];
  
  // Add error handling to embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    containScroll: "trimSnaps",
  });

  // Debug logging for carousel
  useEffect(() => {
    console.log('V1Experience mounted, isMobile:', isMobile);
    console.log('V1Experience inView:', inView);
    console.log('Embla API initialized:', !!emblaApi);
    
    // Check if images are loading
    const imageLoadCheck = async () => {
      try {
        const results = await Promise.all(walletScreens.map(src => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
          });
        }));
        
        console.log('Image load results:', results);
      } catch (error) {
        console.error('Error checking images:', error);
      }
    };
    
    imageLoadCheck();
    
    // Error recovery mechanism
    if (!emblaApi && !hasError) {
      console.log('Attempting to recover from Embla initialization failure');
      setHasError(true);
    }
  }, [emblaApi, inView, isMobile, hasError, walletScreens]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    try {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    } catch (err) {
      console.error('Error in embla onSelect:', err);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    try {
      emblaApi.on('select', onSelect);
      onSelect();
      
      return () => {
        emblaApi.off('select', onSelect);
      };
    } catch (err) {
      console.error('Error setting up embla event listeners:', err);
    }
  }, [emblaApi, onSelect]);
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (inView && emblaApi) {
      interval = window.setInterval(() => {
        try {
          emblaApi.scrollNext();
        } catch (err) {
          console.error('Error in autoplay scroll:', err);
          clearInterval(interval);
        }
      }, autoplaySpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inView, autoplaySpeed, emblaApi]);

  // Style classes for buttons
  const buttonClass = "carousel-button flex items-center justify-center rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-30";
  const desktopButtonClass = "h-10 w-10 bg-white/10 hover:bg-white/20 border border-white/20 text-white";
  const mobileButtonClass = "h-8 w-8 bg-white/15 hover:bg-white/25 border border-white/15 text-white";
  
  // Fallback rendering in case of errors
  if (hasError) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
        <div className="lg:col-span-5 space-y-6 px-4 lg:px-0">
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
        
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {walletScreens.slice(0, 3).map((screen, index) => (
              <div key={index} className="aspect-[9/16] relative overflow-hidden rounded-lg bg-black/30 border border-white/10">
                <img 
                  src={screen} 
                  alt={`Wallet screen ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    console.error(`Failed to load image: ${screen}`);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
      <div className="lg:col-span-5 space-y-6 transition-all duration-1000 delay-200 px-4 lg:px-0 z-10">
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
      
      <div className="lg:col-span-7 transition-all duration-1000 delay-500 z-0">
        <div className="max-w-full relative">
          <div className="relative w-full" ref={emblaRef}>
            <div className="flex py-8">
              {walletScreens.map((screen, index) => {
                const isCenter = index === currentIndex;
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "relative min-w-0 transition-all duration-500 ease-in-out",
                      isMobile 
                        ? "flex-[0_0_80%] pl-4" 
                        : "flex-[0_0_40%] pl-4"
                    )}
                  >
                    <div 
                      className={cn(
                        "bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden rounded-lg transition-all duration-500 ease-in-out",
                        isCenter 
                          ? "scale-105 shadow-[0_0_25px_rgba(255,255,255,0.15)]" 
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
                          onError={(e) => {
                            console.error(`Failed to load image: ${screen}`);
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Desktop navigation buttons */}
          <div className="absolute top-1/2 left-4 -translate-y-1/2 hidden md:block z-10">
            <button 
              onClick={() => emblaApi?.scrollPrev()} 
              className={`${buttonClass} ${desktopButtonClass}`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          
          <div className="absolute top-1/2 right-4 -translate-y-1/2 hidden md:block z-10">
            <button 
              onClick={() => emblaApi?.scrollNext()} 
              className={`${buttonClass} ${desktopButtonClass}`}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          {/* Mobile navigation buttons - shown at bottom for better mobile UX */}
          <div className="flex justify-between items-center mt-4 px-4 md:hidden">
            <button 
              onClick={() => emblaApi?.scrollPrev()} 
              className={`${buttonClass} ${mobileButtonClass}`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex justify-center gap-1.5">
              {walletScreens.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index 
                      ? 'bg-purple-500 w-4' 
                      : 'bg-white/30 w-2'
                  }`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={() => emblaApi?.scrollNext()} 
              className={`${buttonClass} ${mobileButtonClass}`}
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          {/* Desktop indicator dots */}
          <div className="hidden md:flex justify-center mt-4 gap-2">
            {walletScreens.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-purple-500 w-6' 
                    : 'bg-white/30 w-2 hover:bg-white/50'
                }`}
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
