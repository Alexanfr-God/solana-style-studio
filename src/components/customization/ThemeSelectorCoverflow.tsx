
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useThemeSelector } from '@/hooks/useThemeSelector';
import { useCustomizationStore } from '@/stores/customizationStore';
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
    applyTheme,
    source 
  } = useThemeSelector();
  
  const { setStyleForLayer } = useCustomizationStore();
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

  // Load theme data on demand
  const loadThemeData = useCallback(async (theme: any) => {
    if (theme.themeData || theme.patch) {
      return theme; // Already has data
    }

    console.log(`🔄 Loading theme data on demand for: ${theme.name}`);
    
    const possiblePaths = [
      `/themes/${theme.id}.json`,
      `/themes/${theme.id}Theme.json`
    ];
    
    for (const path of possiblePaths) {
      try {
        console.log(`📁 Trying to load: ${path}`);
        const response = await fetch(path);
        
        if (response.ok) {
          const themeData = await response.json();
          console.log(`✅ Successfully loaded theme data from: ${path}`);
          return { ...theme, themeData };
        }
      } catch (error) {
        console.warn(`💥 Error loading ${path}:`, error);
      }
    }
    
    throw new Error(`Failed to load theme data for ${theme.id}`);
  }, []);

  // Function to apply theme to wallet
  const applyThemeToWallet = useCallback((themeData: any) => {
    console.log('🎨 Applying theme to wallet:', themeData);
    
    try {
      const { loginStyle, walletStyle } = mapThemeToWalletStyle(themeData);
      
      // Apply styles to both layers
      setStyleForLayer('login', loginStyle);
      setStyleForLayer('wallet', walletStyle);
      
      console.log('✅ Theme applied successfully to wallet');
      
    } catch (error) {
      console.error('💥 Error applying theme:', error);
      toast.error('Failed to apply theme');
    }
  }, [setStyleForLayer]);

  // Apply active theme when initialized
  useEffect(() => {
    if (activeThemeId && themes.length > 0 && !isLoading) {
      const activeTheme = themes.find(t => t.id === activeThemeId);
      if (activeTheme) {
        console.log('🎯 Applying initial active theme:', activeTheme.name);
        
        if (activeTheme.themeData) {
          applyThemeToWallet(activeTheme.themeData);
        } else if (activeTheme.patch) {
          console.log('⚠️ Active theme is a preset, will be handled by themeStore');
        } else if (source === 'files') {
          // Load theme data on demand for file-based themes
          setLoadingThemes(prev => new Set([...prev, activeTheme.id]));
          loadThemeData(activeTheme)
            .then(loadedTheme => {
              applyThemeToWallet(loadedTheme.themeData);
              setLoadingThemes(prev => {
                const newSet = new Set(prev);
                newSet.delete(activeTheme.id);
                return newSet;
              });
            })
            .catch(error => {
              console.error('💥 Error loading active theme:', error);
              setLoadingThemes(prev => {
                const newSet = new Set(prev);
                newSet.delete(activeTheme.id);
                return newSet;
              });
            });
        }
      }
    }
  }, [activeThemeId, themes, isLoading, applyThemeToWallet, source, loadThemeData]);

  // SIMPLIFIED: Direct theme application (no preview/apply states)
  const handleThemeClick = useCallback(async (theme: any) => {
    if (isProcessingRef.current) {
      console.log('🚫 Click ignored - already processing');
      return;
    }
    
    if (theme.id === activeThemeId) {
      console.log('🚫 Click ignored - theme already active');
      return;
    }
    
    console.log(`🎯 DIRECT THEME APPLICATION: ${theme.name}`);
    
    isProcessingRef.current = true;
    setLoadingThemes(prev => new Set([...prev, theme.id]));
    
    try {
      if (theme.themeData) {
        // Theme already has data - apply directly
        applyThemeToWallet(theme.themeData);
        applyTheme(theme); // Update themeStore
        selectTheme(theme.id); // Set as active
        toast.success(`✅ Applied: ${theme.name}`);
      } else if (theme.patch) {
        // Supabase preset - apply through themeStore
        applyTheme(theme);
        selectTheme(theme.id);
        toast.success(`✅ Applied: ${theme.name}`);
      } else if (source === 'files') {
        // File-based theme - load and apply
        const loadedTheme = await loadThemeData(theme);
        applyThemeToWallet(loadedTheme.themeData);
        applyTheme(loadedTheme);
        selectTheme(theme.id);
        toast.success(`✅ Applied: ${theme.name}`);
      } else {
        throw new Error('No theme data available');
      }
    } catch (error) {
      console.error('💥 Error applying theme:', error);
      toast.error(`Failed to apply ${theme.name}`);
    } finally {
      setLoadingThemes(prev => {
        const newSet = new Set(prev);
        newSet.delete(theme.id);
        return newSet;
      });
      isProcessingRef.current = false;
    }
  }, [activeThemeId, applyThemeToWallet, applyTheme, selectTheme, source, loadThemeData]);

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
          <div>✅ SIMPLIFIED: Click to apply immediately</div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelectorCoverflow;
