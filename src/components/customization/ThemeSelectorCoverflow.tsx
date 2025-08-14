
import React, { useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useEmblaCarousel from 'embla-carousel-react';
import { useThemeSelector } from '@/hooks/useThemeSelector';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { callPatch } from '@/lib/api/client';
import { useThemeActions } from '@/state/themeStore';
import { toast } from 'sonner';

const ThemeSelectorCoverflow: React.FC = () => {
  // Add safety check for React
  if (!React || !React.useState) {
    console.error('React is not properly loaded');
    return <div className="text-white">Loading...</div>;
  }

  const { themes, activeThemeId, selectTheme, getActiveTheme, isLoading } = useThemeSelector();
  const [mode, setMode] = useState<"apply" | "inspire">("apply");
  const [isProcessing, setIsProcessing] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false
  });

  const { applyPatch } = useThemeActions();

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleThemeClick = useCallback(async (theme: any) => {
    // Prevent multiple simultaneous processing
    if (isProcessing) return;
    
    // Don't reprocess if same theme is already active and we're not switching modes
    if (theme.id === activeThemeId && mode === "apply") return;
    
    setIsProcessing(true);
    
    try {
      if (mode === "apply") {
        // Apply mode - direct preset application
        if (!theme.sample_patch || theme.sample_patch.length === 0) {
          toast.error('У пресета нет прямого патча. Используй режим "Inspire AI".');
          return;
        }
        
        // Apply the sample patch directly
        const patchEntry = {
          id: `preset-${theme.id}`,
          operations: theme.sample_patch,
          userPrompt: `Applied preset: ${theme.name}`,
          pageId: 'global',
          presetId: theme.id,
          timestamp: new Date(),
          theme: null // Will be computed by applyPatch
        };
        
        applyPatch(patchEntry);
        toast.success(`🎨 Applied preset: ${theme.name}`);
        
      } else {
        // Inspire AI mode - use preset as style reference
        try {
          const response = await callPatch({
            themeId: activeThemeId || 'default',
            pageId: 'home', // Default to home page
            presetId: theme.id,
            userPrompt: `Apply the style inspiration from ${theme.name} preset`
          });

          if (response.success) {
            const patchEntry = {
              id: `inspire-${theme.id}`,
              operations: response.patch,
              userPrompt: `Inspired by preset: ${theme.name}`,
              pageId: 'home',
              presetId: theme.id,
              timestamp: new Date(),
              theme: response.theme
            };
            
            applyPatch(patchEntry);
            toast.success(`✨ Applied inspiration from: ${theme.name}`);
          } else {
            toast.error(`Failed to apply inspiration: ${response.error}`);
          }
        } catch (error) {
          toast.error(`Error applying inspiration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      toast.error(`Error processing theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [mode, activeThemeId, applyPatch, isProcessing]);

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
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-white">
          Choose Your Theme
        </h3>
        
        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Label htmlFor="mode-toggle" className="text-white/80">
            Apply preset
          </Label>
          <Switch
            id="mode-toggle"
            checked={mode === "inspire"}
            onCheckedChange={(checked) => setMode(checked ? "inspire" : "apply")}
          />
          <Label htmlFor="mode-toggle" className="text-white/80">
            Inspire AI
          </Label>
        </div>
        
        <p className="text-sm text-white/60 max-w-md mx-auto">
          {mode === "apply" 
            ? "Directly apply preset styles (requires sample_patch)" 
            : "Use preset as style inspiration for AI generation"
          }
        </p>
        
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
          disabled={isProcessing}
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/40"
          onClick={scrollNext}
          disabled={isProcessing}
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </Button>

        {/* Embla Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-4 px-16">
            {themes.map((theme) => {
              const isActive = theme.id === activeThemeId;
              
              return (
                <div
                  key={theme.id}
                  className={`flex-shrink-0 w-48 transition-all duration-500 ease-out cursor-pointer ${
                    isActive 
                      ? 'scale-110 z-10' 
                      : 'scale-90 opacity-60 hover:opacity-80 hover:scale-95'
                  } ${isProcessing ? 'pointer-events-none' : ''}`}
                  onClick={() => handleThemeClick(theme)}
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

                      {/* Mode Indicator */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {mode === "apply" ? "Apply" : "Inspire"}
                      </div>

                      {/* Processing Indicator */}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent"></div>
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
            onClick={() => !isProcessing && handleThemeClick(theme)}
            disabled={isProcessing}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeSelectorCoverflow;
