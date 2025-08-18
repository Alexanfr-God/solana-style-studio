
import React, { useCallback, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useEmblaCarousel from 'embla-carousel-react';
import { useThemeSelector } from '@/hooks/useThemeSelector';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { callPatch } from '@/lib/api/client';
import { useThemeStore } from '@/state/themeStore';
import { toast } from 'sonner';
import { withRenderGuard, once } from '@/utils/guard';

const ThemeSelectorCoverflow: React.FC = () => {
  const guard = withRenderGuard("ThemeSelectorCoverflow");
  guard();

  if (import.meta.env.DEV) { 
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import("@/utils/reactDiag").then(m => m.logReactIdentity("Coverflow"));
  }

  const { themes, activeThemeId, getActiveTheme, isLoading, applyTheme, selectTheme } = useThemeSelector();
  const [mode, setMode] = useState<"apply" | "inspire">("apply");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const isProcessingRef = useRef(false);
  const lastClickTimeRef = useRef(0);
  const clickCountRef = useRef(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false
  });

  // Use only useThemeStore actions
  const applyPatch = useThemeStore(s => s.applyPatch);
  const setTheme = useThemeStore(s => s.setTheme);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Функция сброса выделения после успешного применения
  const resetSelection = useCallback(() => {
    setTimeout(() => {
      setSelectedId(null);
      console.log('🔄 Selection reset after successful apply');
    }, 1500);
  }, []);

  // Функция обработки успешного применения темы
  const handleSuccessfulApply = useCallback((themeId: string, themeName: string) => {
    console.log(`✅ Theme successfully applied: ${themeName} (${themeId})`);
    // В режиме "apply" делаем тему активной
    if (mode === "apply") {
      selectTheme(themeId);
      console.log(`🎯 Theme ${themeId} set as active`);
    }
    resetSelection();
  }, [mode, selectTheme, resetSelection]);

  const handleThemeClick = once(async (theme: any) => {
    const now = Date.now();
    
    if (now - lastClickTimeRef.current < 500) {
      console.log('🚫 Click ignored - rate limited');
      return;
    }
    
    lastClickTimeRef.current = now;
    
    if (isProcessingRef.current) {
      console.log('🚫 Click ignored - already processing');
      return;
    }
    
    // В режиме apply: не обрабатывать клик по уже активной теме
    if (theme.id === activeThemeId && mode === "apply") {
      console.log('🚫 Click ignored - theme already active in apply mode');
      return;
    }
    
    // В режиме inspire: можно кликать по любой теме
    if (theme.id === selectedId && mode === "inspire") {
      console.log('🚫 Click ignored - same theme already selected in inspire mode');
      return;
    }
    
    clickCountRef.current++;
    if (clickCountRef.current > 10) {
      console.error('🚨 Too many clicks detected, cooling down...');
      setTimeout(() => { clickCountRef.current = 0; }, 5000);
      return;
    }
    
    isProcessingRef.current = true;
    
    try {
      setSelectedId(theme.id);
      console.log(`👆 Theme click: ${theme.name} (mode: ${mode}) - attempt ${clickCountRef.current}`);
      
      if (mode === "apply") {
        if (!theme.themeData) {
          toast.error('Theme data not loaded. Try switching to "Inspire AI" mode.');
          return;
        }
        
        console.log('🎨 Applying theme via SoT:', theme.name);
        applyTheme(theme);
        toast.success(`🎨 Applied theme: ${theme.name}`);
        
        // Обработка успешного применения
        handleSuccessfulApply(theme.id, theme.name);
        
      } else {
        try {
          console.log('✨ Inspiring from theme:', theme.name);
          const response = await callPatch({
            themeId: activeThemeId || 'default',
            pageId: 'home',
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
            
            // В режиме inspiration сбрасываем выделение, но не меняем активную тему
            resetSelection();
          } else {
            toast.error(`Failed to apply inspiration: ${response.error}`);
          }
        } catch (error) {
          console.error('💥 Inspiration error:', error);
          toast.error(`Error applying inspiration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('💥 Theme processing error:', error);
      toast.error(`Error processing theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isProcessingRef.current = false;
      setTimeout(() => { clickCountRef.current = Math.max(0, clickCountRef.current - 1); }, 1000);
    }
  });

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
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-white">
          Choose Your Theme
        </h3>
        
        <div className="flex items-center justify-center gap-4">
          <Label htmlFor="mode-toggle" className="text-white/80">
            Apply preset
          </Label>
          <Switch
            id="mode-toggle"
            checked={mode === "inspire"}
            onCheckedChange={(checked) => {
              setMode(checked ? "inspire" : "apply");
              setSelectedId(null); // Сброс выделения при смене режима
            }}
          />
          <Label htmlFor="mode-toggle" className="text-white/80">
            Inspire AI
          </Label>
        </div>
        
        <p className="text-sm text-white/60 max-w-md mx-auto">
          {mode === "apply" 
            ? "Directly apply theme styles and set as active" 
            : "Use theme as style inspiration for AI generation"
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

      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/40"
          onClick={scrollPrev}
          disabled={isProcessingRef.current}
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/40"
          onClick={scrollNext}
          disabled={isProcessingRef.current}
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </Button>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-4 px-16">
            {themes.map((theme) => {
              const isActive = theme.id === activeThemeId;
              const isSelected = theme.id === selectedId;
              
              return (
                <div
                  key={theme.id}
                  className={`flex-shrink-0 w-48 transition-all duration-500 ease-out cursor-pointer ${
                    isActive 
                      ? 'scale-110 z-10' 
                      : isSelected
                      ? 'scale-105 z-5'
                      : 'scale-90 opacity-60 hover:opacity-80 hover:scale-95'
                  } ${isProcessingRef.current ? 'pointer-events-none' : ''}`}
                  onClick={() => handleThemeClick(theme)}
                  data-theme-id={theme.id}
                >
                  <Card className={`
                    relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                    border transition-all duration-300 group
                    ${isActive 
                      ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                      : isSelected
                      ? 'border-blue-500/50 shadow-lg shadow-blue-500/20'
                      : 'border-white/10 hover:border-white/30'
                    }
                  `}>
                    <div className="aspect-[3/4] relative">
                      <div 
                        className="w-full h-full rounded-lg"
                        style={{
                          backgroundImage: `url(${theme.coverUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />

                      {isActive && (
                        <div className="absolute inset-0 border-2 border-purple-400 rounded-lg animate-pulse">
                          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            Active
                          </div>
                        </div>
                      )}

                      {isSelected && !isActive && (
                        <div className="absolute inset-0 border-2 border-blue-400 rounded-lg">
                          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Selected
                          </div>
                        </div>
                      )}

                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {mode === "apply" ? "Apply" : "Inspire"}
                      </div>

                      {isProcessingRef.current && isSelected && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent"></div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

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

      <div className="flex justify-center gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              theme.id === activeThemeId 
                ? 'bg-purple-400 w-6' 
                : theme.id === selectedId
                ? 'bg-blue-400 w-4'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => !isProcessingRef.current && handleThemeClick(theme)}
            disabled={isProcessingRef.current}
          />
        ))}
      </div>
      
      {import.meta.env.DEV && (
        <div className="text-xs text-white/40 text-center">
          Active: {activeThemeId} | Selected: {selectedId} | Processing: {isProcessingRef.current ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
};

export default ThemeSelectorCoverflow;
