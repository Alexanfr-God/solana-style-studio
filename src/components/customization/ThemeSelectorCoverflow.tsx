
import React, { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import useEmblaCarousel from 'embla-carousel-react';
import { useThemeSelector } from '@/hooks/useThemeSelector';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThemeSelectorCoverflow: React.FC = () => {
  const { themes, activeThemeId, selectTheme, getActiveTheme, isLoading } = useThemeSelector();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const activeTheme = getActiveTheme();

  if (isLoading) {
    return (
      <div className="w-full py-8">
        <div className="text-center text-white/70">Loading themes...</div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 space-y-6">
      {/* Theme Info Section */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">
          Choose Your Theme
        </h3>
        {activeTheme && (
          <div className="space-y-1">
            <h4 className="text-lg font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {activeTheme.name}
            </h4>
            <p className="text-sm text-white/70 max-w-md mx-auto">
              {activeTheme.description}
            </p>
          </div>
        )}
      </div>

      {/* Coverflow Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/40"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/40"
          onClick={scrollNext}
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </Button>

        {/* Embla Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-4 px-16">
            {themes.map((theme, index) => {
              const isActive = theme.id === activeThemeId;
              
              return (
                <div
                  key={theme.id}
                  className={`flex-shrink-0 w-48 transition-all duration-500 ease-out cursor-pointer ${
                    isActive 
                      ? 'scale-110 z-10' 
                      : 'scale-90 opacity-60 hover:opacity-80 hover:scale-95'
                  }`}
                  onClick={() => selectTheme(theme.id)}
                  data-theme-id={theme.id}
                >
                  <Card className={`
                    relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                    border transition-all duration-300 group
                    ${isActive 
                      ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                      : 'border-white/10 hover:border-white/30'
                    }
                  `}>
                    <div className="aspect-[3/4] relative">
                      {/* Theme Cover Image */}
                      <div 
                        className="w-full h-full rounded-lg"
                        style={{
                          backgroundImage: `url(${theme.coverUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute inset-0 border-2 border-purple-400 rounded-lg animate-pulse">
                          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            Active
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Theme Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <h5 className="text-white font-medium text-sm truncate">
                        {theme.name}
                      </h5>
                      <p className="text-white/70 text-xs truncate">
                        {theme.description}
                      </p>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Theme Dots Indicator */}
      <div className="flex justify-center gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              theme.id === activeThemeId 
                ? 'bg-purple-400 w-6' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => selectTheme(theme.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeSelectorCoverflow;
