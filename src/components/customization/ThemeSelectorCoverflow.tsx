
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useThemeSelector } from '@/hooks/useThemeSelector';
import { useCustomizationStore } from '@/stores/customizationStore';
import { useThemeStore } from '@/state/themeStore';
import { mapThemeToWalletStyle } from '@/utils/themeMapper';
import { toast } from 'sonner';
import { withRenderGuard } from '@/utils/guard';

const ThemeSelectorCoverflow: React.FC = () => {
  const guard = withRenderGuard("ThemeSelectorCoverflow");
  guard();

  const { 
    themes, 
    activeThemeId, 
    isLoading, 
    selectTheme,
    source 
  } = useThemeSelector();
  
  const { setStyleForLayer } = useCustomizationStore();
  const { setTheme, setActiveThemeId } = useThemeStore();
  const [loadingThemes, setLoadingThemes] = useState<Set<string>>(new Set());
  
  const isProcessingRef = useRef(false);
  
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

  // Улучшенная загрузка JSON тем с валидацией
  const loadThemeData = useCallback(async (theme: any) => {
    console.log('[CF] loadThemeData START', { id: theme.id, hasThemeData: !!theme.themeData, source });
    
    if (theme.themeData || theme.patch) {
      console.log('[CF] theme already has data, returning as-is');
      return theme;
    }

    console.log(`[CF] Loading JSON theme data for: ${theme.name}`);
    
    const possiblePaths = [
      `/themes/${theme.id}.json`,
      `/themes/${theme.id}Theme.json`
    ];
    
    for (const path of possiblePaths) {
      try {
        console.log(`[CF] Trying to load: ${path}`);
        const response = await fetch(path);
        
        if (response.ok) {
          const themeData = await response.json();
          console.log(`[CF] Successfully loaded theme data from: ${path}`);
          console.log('[CF] loaded JSON keys:', themeData ? Object.keys(themeData) : []);
          
          // Валидация схемы JSON
          const hasLockLayer = !!themeData.lockLayer;
          const hasHomeLayer = !!themeData.homeLayer;
          console.log('[CF] Schema validation:', { hasLockLayer, hasHomeLayer });
          
          if (!hasLockLayer && !hasHomeLayer) {
            console.warn('[CF] Invalid theme schema - missing lockLayer and homeLayer');
          }
          
          return { ...theme, themeData };
        }
      } catch (error) {
        console.warn(`[CF] Error loading ${path}:`, error);
      }
    }
    
    throw new Error(`Failed to load theme data for ${theme.id}`);
  }, [source]);

  // ИСПРАВЛЕННАЯ функция применения JSON тем с правильным порядком
  const applyJsonTheme = useCallback((themeData: any, themeId: string) => {
    console.log('[CF] applyJsonTheme START', { themeId, hasData: !!themeData });
    console.log('[CF] themeData keys:', themeData ? Object.keys(themeData) : []);
    
    try {
      // 1. ГЛАВНОЕ: Сначала применить RAW данные в themeStore
      console.log('[CF] Step 1: setTheme(themeData) for themeStore');
      setTheme(themeData);
      console.log('[CF] themeStore updated with raw data');
      
      // 2. Установить activeThemeId
      console.log('[CF] Step 2: setActiveThemeId');
      setActiveThemeId(themeId);
      console.log('[CF] activeThemeId set to:', themeId);
      
      // 3. Применить в customizationStore для DualWalletPreview совместимости
      console.log('[CF] Step 3: apply to customizationStore');
      const { loginStyle, walletStyle } = mapThemeToWalletStyle(themeData);
      setStyleForLayer('login', loginStyle);
      setStyleForLayer('wallet', walletStyle);
      console.log('[CF] customizationStore updated');
      
      console.log('[CF] ✅ JSON Theme applied successfully to BOTH stores');
      console.log('[CF] Final state - themeStore has raw data, customizationStore has mapped styles');
      
    } catch (error) {
      console.error('[CF] 💥 Error applying JSON theme:', error);
      throw error;
    }
  }, [setStyleForLayer, setTheme, setActiveThemeId]);

  // Apply active theme when initialized
  useEffect(() => {
    if (activeThemeId && themes.length > 0 && !isLoading) {
      const activeTheme = themes.find(t => t.id === activeThemeId);
      if (activeTheme) {
        console.log('[CF] Applying initial active theme:', activeTheme.name);
        
        if (activeTheme.themeData) {
          applyJsonTheme(activeTheme.themeData, activeTheme.id);
        } else if (activeTheme.patch) {
          console.log('[CF] Active theme is a preset, handled by themeStore');
          // Для Supabase preset'ов используем selectTheme из useThemeSelector
          selectTheme(activeTheme.id);
        } else if (source === 'files') {
          // Load theme data on demand for file-based themes
          setLoadingThemes(prev => new Set([...prev, activeTheme.id]));
          loadThemeData(activeTheme)
            .then(loadedTheme => {
              applyJsonTheme(loadedTheme.themeData, activeTheme.id);
              setLoadingThemes(prev => {
                const newSet = new Set(prev);
                newSet.delete(activeTheme.id);
                return newSet;
              });
            })
            .catch(error => {
              console.error('[CF] 💥 Error loading initial active theme:', error);
              setLoadingThemes(prev => {
                const newSet = new Set(prev);
                newSet.delete(activeTheme.id);
                return newSet;
              });
            });
        }
      }
    }
  }, [activeThemeId, themes, isLoading, applyJsonTheme, source, loadThemeData, selectTheme]);

  // ИСПРАВЛЕННАЯ обработка клика по теме
  const handleThemeClick = useCallback(async (theme: any) => {
    if (isProcessingRef.current) {
      console.log('[CF] 🚫 Click ignored - already processing');
      return;
    }
    
    if (theme.id === activeThemeId) {
      console.log('[CF] 🚫 Click ignored - theme already active');
      return;
    }
    
    console.log(`[CF] 🎯 THEME CLICK: ${theme.name}`, { id: theme.id, source });
    
    isProcessingRef.current = true;
    setLoadingThemes(prev => new Set([...prev, theme.id]));
    
    try {
      if (theme.themeData) {
        // Тема уже имеет JSON данные
        console.log('[CF] Theme has JSON data, applying directly');
        applyJsonTheme(theme.themeData, theme.id);
        toast.success(`✅ Applied: ${theme.name}`);
        
      } else if (theme.patch) {
        // Supabase preset - применить через useThemeSelector
        console.log('[CF] Theme is Supabase preset, using selectTheme');
        selectTheme(theme.id);
        toast.success(`✅ Applied: ${theme.name}`);
        
      } else if (source === 'files') {
        // File-based тема - загрузить JSON и применить
        console.log('[CF] Loading file-based theme JSON');
        const loaded = await loadThemeData(theme);
        console.log('[CF] loaded', { hasThemeData: !!loaded?.themeData, keys: loaded?.themeData ? Object.keys(loaded.themeData) : [] });
        
        // Применяем загруженную тему
        applyJsonTheme(loaded.themeData, theme.id);
        console.log('[CF] applied to stores', loaded.themeData?.lockLayer ? 'has lockLayer' : 'no lockLayer');
        
        toast.success(`✅ Applied: ${theme.name}`);
        
      } else {
        throw new Error('No theme data available');
      }
    } catch (error) {
      console.error('[CF] 💥 Error applying theme:', error);
      toast.error(`Failed to apply ${theme.name}`);
    } finally {
      setLoadingThemes(prev => {
        const newSet = new Set(prev);
        newSet.delete(theme.id);
        return newSet;
      });
      isProcessingRef.current = false;
    }
  }, [activeThemeId, applyJsonTheme, selectTheme, source, loadThemeData]);

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
              const isThemeLoading = loadingThemes.has(theme.id);
              
              return (
                <div
                  key={theme.id}
                  className={`flex-shrink-0 w-48 transition-all duration-500 ease-out cursor-pointer ${
                    isActive 
                      ? 'scale-110 z-10' 
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

                      {isThemeLoading && (
                        <div className="absolute bottom-2 left-2 bg-yellow-500/80 text-black text-xs px-2 py-1 rounded-full animate-pulse">
                          Loading...
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
                : 'bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => !isProcessingRef.current && handleThemeClick(theme)}
            disabled={isProcessingRef.current}
          />
        ))}
      </div>
      
      {import.meta.env.DEV && (
        <div className="text-xs text-white/40 text-center space-y-1">
          <div>Active: {activeThemeId}</div>
          <div>Source: {source} | Themes: {themes.length}</div>
          <div>Loading: {Array.from(loadingThemes).join(', ') || 'none'}</div>
          <div>🔧 ИСПРАВЛЕНО: Правильный порядок применения - themeStore → customizationStore</div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelectorCoverflow;
