
import React, { useEffect, useState, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface V1ExperienceProps {
  inView: boolean;
}

const V1Experience: React.FC<V1ExperienceProps> = ({ inView }) => {
  // Core state
  const [autoplaySpeed] = useState(5000); // 5 seconds per slide
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();
  const [hasError, setHasError] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  
  // Collection of wallet screens
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
  
  // Carousel initialization with better error handling
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    containScroll: "trimSnaps",
  });

  // Preload all images before initializing carousel
  useEffect(() => {
    console.log('Starting image preloading');
    const preloadImages = async () => {
      try {
        const imagePromises = walletScreens.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              console.log(`Image loaded successfully: ${src}`);
              resolve(true);
            };
            img.onerror = (err) => {
              console.error(`Failed to load image: ${src}`, err);
              reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
          });
        });

        try {
          await Promise.all(imagePromises);
          console.log('All images preloaded successfully');
          setImagesLoaded(true);
        } catch (loadError) {
          console.error('Error loading images:', loadError);
          // Continue anyway after reporting errors
          setImagesLoaded(true);
        }
      } catch (error) {
        console.error('Error in image preloading:', error);
        setImagesLoaded(true); // Continue despite errors
      }
    };

    preloadImages();
  }, [walletScreens]);

  // Enhanced debug logging for component lifecycle
  useEffect(() => {
    console.log('V1Experience component mounted');
    console.log('V1Experience inView:', inView);
    console.log('V1Experience isMobile:', isMobile);
    console.log('Container dimensions:', {
      width: carouselContainerRef.current?.offsetWidth,
      height: carouselContainerRef.current?.offsetHeight,
    });
    
    // Log browser environment
    console.log('Browser info:', {
      userAgent: navigator.userAgent,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
    
    return () => {
      console.log('V1Experience component unmounting');
    };
  }, [inView, isMobile]);
  
  // Embla API monitoring and error recovery
  useEffect(() => {
    console.log('Embla API state:', { 
      initialized: !!emblaApi, 
      hasError, 
      initAttempts,
      imagesLoaded 
    });
    
    // Recovery mechanism - attempt to reinitialize if needed
    if (!emblaApi && imagesLoaded && initAttempts < 3) {
      const timer = setTimeout(() => {
        console.log(`Attempting to recover carousel (attempt ${initAttempts + 1})`);
        setInitAttempts(prev => prev + 1);
        // Force re-render to trigger reinit of carousel
      }, 500 * (initAttempts + 1)); // Increasing backoff
      
      return () => clearTimeout(timer);
    }
    
    // Set error state if all recovery attempts failed
    if (!emblaApi && initAttempts >= 3 && !hasError) {
      console.log('All recovery attempts failed, setting error state');
      setHasError(true);
    }
  }, [emblaApi, hasError, initAttempts, imagesLoaded]);

  // Handle slide selection and tracking
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    try {
      const newIndex = emblaApi.selectedScrollSnap();
      console.log('Carousel slide changed to:', newIndex);
      setCurrentIndex(newIndex);
    } catch (err) {
      console.error('Error in embla onSelect:', err);
      setHasError(true);
    }
  }, [emblaApi]);

  // Setup event listeners for the carousel
  useEffect(() => {
    if (!emblaApi) return;
    
    try {
      console.log('Setting up embla event listeners');
      emblaApi.on('select', onSelect);
      onSelect();
      
      // Test if scrolling works
      setTimeout(() => {
        try {
          emblaApi.scrollNext();
          console.log('Initial scroll test succeeded');
        } catch (e) {
          console.error('Initial scroll test failed:', e);
        }
      }, 100);
      
      return () => {
        console.log('Removing embla event listeners');
        emblaApi.off('select', onSelect);
      };
    } catch (err) {
      console.error('Error setting up embla event listeners:', err);
      setHasError(true);
      return undefined;
    }
  }, [emblaApi, onSelect]);
  
  // Autoplay functionality
  useEffect(() => {
    let interval: number | undefined;
    
    if (inView && emblaApi && !hasError) {
      console.log('Starting autoplay');
      interval = window.setInterval(() => {
        try {
          emblaApi.scrollNext();
        } catch (err) {
          console.error('Error in autoplay scroll:', err);
          clearInterval(interval);
          setHasError(true);
        }
      }, autoplaySpeed);
    }
    
    return () => {
      if (interval) {
        console.log('Stopping autoplay');
        clearInterval(interval);
      }
    };
  }, [inView, autoplaySpeed, emblaApi, hasError]);

  // Style classes with animations for buttons
  const buttonClass = "carousel-button flex items-center justify-center rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-30 animate-fadeIn";
  const desktopButtonClass = "h-10 w-10 bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.3)]";
  const mobileButtonClass = "h-8 w-8 bg-white/15 hover:bg-white/25 border border-white/15 text-white hover:shadow-[0_0_8px_rgba(255,255,255,0.25)]";
  
  // Helper functions for carousel navigation
  const scrollPrev = () => {
    try {
      emblaApi?.scrollPrev();
      console.log('Manual prev navigation');
    } catch (e) {
      console.error('Error in manual prev navigation:', e);
    }
  };
  
  const scrollNext = () => {
    try {
      emblaApi?.scrollNext();
      console.log('Manual next navigation');
    } catch (e) {
      console.error('Error in manual next navigation:', e);
    }
  };
  
  const scrollTo = (index: number) => {
    try {
      emblaApi?.scrollTo(index);
      console.log('Manual navigation to slide:', index);
    } catch (e) {
      console.error(`Error navigating to slide ${index}:`, e);
    }
  };
  
  // Fallback rendering in case of errors
  if (hasError) {
    // Enhanced fallback with more accessible controls
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-hidden relative">
            {walletScreens.slice(0, 6).map((screen, index) => (
              <div key={index} className="aspect-[9/16] relative overflow-hidden rounded-lg bg-black/30 border border-white/10 transition-all duration-300 hover:scale-105">
                <img 
                  src={screen} 
                  alt={`Wallet screen ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  onError={(e) => {
                    console.error(`Failed to load image in fallback: ${screen}`);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            ))}
            
            {/* Simple navigation in fallback mode */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <button 
                className={`${buttonClass} ${mobileButtonClass}`}
                aria-label="View more designs"
              >
                <span className="text-xs font-medium px-2">View all designs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main component rendering
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
        <div className="max-w-full relative" ref={carouselContainerRef}>
          {imagesLoaded ? (
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
                            loading="eager"
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
          ) : (
            // Loading state while images preload
            <div className="flex items-center justify-center py-16">
              <div className="animate-pulse flex space-x-4">
                <div className="h-48 w-32 bg-white/10 rounded-lg"></div>
                <div className="h-48 w-32 bg-white/20 rounded-lg"></div>
                <div className="h-48 w-32 bg-white/10 rounded-lg"></div>
              </div>
            </div>
          )}
          
          {/* Desktop navigation buttons with enhanced styling and animations */}
          {imagesLoaded && (
            <>
              <div className="absolute top-1/2 left-4 -translate-y-1/2 hidden md:block z-10">
                <button 
                  onClick={scrollPrev} 
                  className={`${buttonClass} ${desktopButtonClass} hover:animate-pulse`}
                  aria-label="Previous slide"
                  style={{animation: "buttonGlow 2s infinite"}}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              
              <div className="absolute top-1/2 right-4 -translate-y-1/2 hidden md:block z-10">
                <button 
                  onClick={scrollNext} 
                  className={`${buttonClass} ${desktopButtonClass} hover:animate-pulse`}
                  aria-label="Next slide"
                  style={{animation: "buttonGlow 2s infinite"}}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              {/* Mobile navigation buttons - shown at bottom for better mobile UX */}
              <div className="flex justify-between items-center mt-4 px-4 md:hidden">
                <button 
                  onClick={scrollPrev} 
                  className={`${buttonClass} ${mobileButtonClass} hover:animate-pulse`}
                  aria-label="Previous slide"
                  style={{animation: "buttonGlow 2s infinite"}}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex justify-center gap-1.5">
                  {walletScreens.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentIndex === index 
                          ? 'bg-purple-500 w-4 animate-dotPulse' 
                          : 'bg-white/30 w-2 hover:bg-white/50'
                      }`}
                      onClick={() => scrollTo(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                
                <button 
                  onClick={scrollNext} 
                  className={`${buttonClass} ${mobileButtonClass} hover:animate-pulse`}
                  aria-label="Next slide"
                  style={{animation: "buttonGlow 2s infinite"}}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              {/* Desktop indicator dots with animation */}
              <div className="hidden md:flex justify-center mt-4 gap-2">
                {walletScreens.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === index 
                        ? 'bg-purple-500 w-6 animate-dotPulse' 
                        : 'bg-white/30 w-2 hover:bg-white/50'
                    }`}
                    onClick={() => scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    style={currentIndex === index ? {animation: "dotPulse 1.5s infinite"} : {}}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default V1Experience;
