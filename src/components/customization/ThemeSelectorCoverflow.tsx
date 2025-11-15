import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useThemeSelector } from '@/hooks/useThemeSelector';
import { useThemeStore, THEME_STORE_INSTANCE_ID } from '@/state/themeStore';
import { CUST_STORE_INSTANCE_ID } from '@/stores/customizationStore';
import { toast } from 'sonner';
import { withRenderGuard } from '@/utils/guard';

const ThemeSelectorCoverflow: React.FC = () => {
  const guard = withRenderGuard("ThemeSelectorCoverflow");
  guard();

  // Diagnostic logging for store instances
  console.log('[WHO_USES_THEME_STORE] ThemeSelectorCoverflow:', THEME_STORE_INSTANCE_ID);
  console.log('[WHO_USES_CUST_STORE] ThemeSelectorCoverflow:', CUST_STORE_INSTANCE_ID);

  // Диагностический маркер: no-touch mode
  useEffect(() => { 
    console.log('[CF] no-touch mode: Coverflow is read-only'); 
  }, []);

  const { 
    themes, 
    activeThemeId, 
    isLoading, 
    selectTheme,
    source 
  } = useThemeSelector();
  
  const { setTheme, setActiveThemeId } = useThemeStore();
  const [loadingThemes, setLoadingThemes] = useState<Set<string>>(new Set());
  
  const [isApplying, setIsApplying] = useState(false);
  
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

  // FIXED: Simplified theme application with proper error handling
  const applyJsonTheme = useCallback((themeData: any, themeId: string) => {
    console.log('[CF] 🎯 USER ACTION - Applying theme:', themeId);
    console.log('[CF] applyJsonTheme START', { themeId, hasData: !!themeData });
    
    if (!themeData || typeof themeData !== 'object') {
      console.error('[CF] 💥 Invalid theme data:', themeData);
      throw new Error('Invalid theme data');
    }
    
    console.log('[CF] themeData structure:', {
      keys: Object.keys(themeData),
      hasLockLayer: !!themeData.lockLayer,
      hasHomeLayer: !!themeData.homeLayer
    });
    console.log('[CF] Theme lockLayer bg:', themeData.lockLayer?.backgroundColor);
    console.log('[CF] Theme lockLayer bgImage:', themeData.lockLayer?.backgroundImage);
    
    try {
      // Apply to themeStore (single source of truth)
      setTheme(themeData);
      setActiveThemeId(themeId);
      
      console.log('[CF] ✅ Theme applied BY USER to themeStore');
      
    } catch (error) {
      console.error('[CF] 💥 Error applying theme:', error);
      throw error;
    }
  }, [setTheme, setActiveThemeId]);

  // Apply active theme when initialized
  useEffect(() => {
    if (activeThemeId && themes.length > 0 && !isLoading) {
      const activeTheme = themes.find(t => t.id === activeThemeId);
      if (activeTheme && activeTheme.themeData) {
        console.log('[CF] Applying initial active theme with data:', activeTheme.name);
        try {
          applyJsonTheme(activeTheme.themeData, activeTheme.id);
        } catch (error) {
          console.error('[CF] 💥 Error applying initial theme:', error);
        }
      }
    }
  }, [activeThemeId, themes, isLoading, applyJsonTheme]);

  // FIXED: Simplified click handler with race condition prevention
  const handleThemeClick = useCallback(async (theme: any) => {
    if (isApplying) {
      console.log('[CF] 🚫 Click ignored - already processing');
      return;
    }
    
    // Prevent clicking same theme
    if (String(theme.id) === String(activeThemeId)) {
      console.log('[CF] 🚫 Click ignored - theme already active');
      return;
    }
    
    console.log(`[CF] 🎯 THEME CLICK: ${theme.name}`, { 
      id: theme.id,
      hasThemeData: !!theme.themeData,
      source 
    });
    
    setIsApplying(true);
    setLoadingThemes(prev => new Set([...prev, theme.id]));
    
    try {
      // Use selectTheme from useThemeSelector which handles all cases
      await selectTheme(theme.id);
      toast.success(`✅ Applied: ${theme.name}`);
    } catch (error) {
      console.error('[CF] 💥 Error applying theme:', error);
      toast.error(`Failed to apply ${theme.name}`);
    } finally {
      setLoadingThemes(prev => {
        const newSet = new Set(prev);
        newSet.delete(theme.id);
        return newSet;
      });
      setIsApplying(false);
    }
  }, [activeThemeId, selectTheme, source, isApplying]);

  const activeTheme = themes.find(t => t.id === activeThemeId);

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
        
        <p className="text-sm text-white/60 max-w-md mx-auto">
          Click any theme to apply it immediately
        </p>
        
        {activeTheme && (
          <div className="space-y-1">
            <h4 className="text-lg font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Active: {activeTheme.name}
            </h4>
            <p className="text-sm text-white/70 max-w-md mx-auto">
              {activeTheme.description}
            </p>
          </div>
        )}
        
        {source && (
          <div className="text-xs text-white/40">
            Data source: {source === 'supabase' ? 'Database' : 'Files (fallback)'}
          </div>
        )}
      </div>

      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/40"
          onClick={scrollPrev}
          disabled={isApplying}
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/40"
          onClick={scrollNext}
          disabled={isApplying}
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </Button>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-4 px-16">
            {themes.map((theme) => {
              const isActive = String(theme.id) === String(activeThemeId);
              const isThemeLoading = loadingThemes.has(theme.id);
              
              console.log('[RENDER CoverflowItem]', { id: theme.id, isActive: isActive });
              
              return (
                <div
                  key={theme.id}
                  className={`flex-shrink-0 w-48 transition-all duration-500 ease-out cursor-pointer ${
                    isActive 
                      ? 'scale-110 z-10' 
                      : 'scale-90 opacity-60 hover:opacity-80 hover:scale-95'
                  } ${isApplying ? 'pointer-events-none' : ''}`}
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
              String(theme.id) === String(activeThemeId)
                ? 'bg-purple-400 w-6' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => !isApplying && handleThemeClick(theme)}
            disabled={isApplying}
          />
        ))}
      </div>
      
      {import.meta.env.DEV && (
        <div className="text-xs text-white/40 text-center space-y-1">
          <div>Active: {activeThemeId}</div>
          <div>Source: {source} | Themes: {themes.length}</div>
          <div>Loading: {Array.from(loadingThemes).join(', ') || 'none'}</div>
          <div>🔧 FIXED: Simplified theme application + validation</div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelectorCoverflow;
