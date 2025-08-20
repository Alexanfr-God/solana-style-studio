
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
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

  // Функция применения темы к кошельку
  const applyThemeToWallet = useCallback((themeData: any) => {
    console.log('🎨 Applying theme to wallet:', themeData);
    
    try {
      const { loginStyle, walletStyle } = mapThemeToWalletStyle(themeData);
      
      // Применяем стили к обеим слоям
      setStyleForLayer('login', loginStyle);
      setStyleForLayer('wallet', walletStyle);
      
      console.log('✅ Theme applied successfully to wallet');
      
    } catch (error) {
      console.error('💥 Error applying theme:', error);
      toast.error('Failed to apply theme');
    }
  }, [setStyleForLayer]);

  // Применить активную тему при инициализации
  useEffect(() => {
    if (activeThemeId && themes.length > 0 && !isLoading) {
      const activeTheme = themes.find(t => t.id === activeThemeId);
      if (activeTheme) {
        console.log('🎯 Applying initial active theme:', activeTheme.name);
        
        // Проверяем есть ли данные темы или patch
        if (activeTheme.themeData) {
          applyThemeToWallet(activeTheme.themeData);
        } else if (activeTheme.patch) {
          console.log('⚠️ Active theme is a preset, will be handled by themeStore');
        }
      }
    }
  }, [activeThemeId, themes, isLoading, applyThemeToWallet]);

  // Проверка доступности темы для применения
  const isThemeReady = useCallback((theme: any) => {
    // Для Supabase пресетов всегда готов (используется patch)
    if (source === 'supabase' && theme.patch) {
      return true;
    }
    
    // Для файловых тем нужны загруженные данные
    if (source === 'files' && theme.themeData) {
      return true;
    }
    
    return false;
  }, [source]);

  // Обработка клика на тему (preview)
  const handleThemeClick = useCallback((theme: any) => {
    if (isProcessingRef.current) {
      console.log('🚫 Click ignored - already processing');
      return;
    }
    
    if (theme.id === activeThemeId) {
      console.log('🚫 Click ignored - theme already active');
      return;
    }
    
    console.log(`👆 Theme clicked for preview: ${theme.name}`);
    
    if (!isThemeReady(theme)) {
      toast.error('Theme is still loading, please wait...');
      return;
    }
    
    // Для preview - применяем тему к кошельку
    if (theme.themeData) {
      applyThemeToWallet(theme.themeData);
      setSelectedId(theme.id);
      toast.success(`👁️ Previewing: ${theme.name}`);
    } else if (theme.patch) {
      // Для пресетов вызываем applyTheme из useThemeSelector
      try {
        applyTheme(theme);
        setSelectedId(theme.id);
        toast.success(`👁️ Previewing: ${theme.name}`);
      } catch (error) {
        console.error('💥 Error applying preset preview:', error);
        toast.error('Failed to preview theme');
      }
    } else {
      console.warn('⚠️ No theme data available for:', theme.name);
      toast.error('Theme data not available');
    }
  }, [activeThemeId, isThemeReady, applyThemeToWallet, applyTheme]);

  // Обработка кнопки Apply (commit)
  const handleApplyClick = useCallback(() => {
    if (!selectedId) return;
    
    const selectedTheme = themes.find(t => t.id === selectedId);
    if (!selectedTheme) return;
    
    console.log('🎯 Apply button clicked:', selectedTheme.name);
    
    // Применяем тему через useThemeSelector (это обновит themeStore)
    applyTheme(selectedTheme);
    
    // Устанавливаем как активную тему
    selectTheme(selectedId);
    
    // Еще раз применяем к кошельку для уверенности
    if (selectedTheme.themeData) {
      applyThemeToWallet(selectedTheme.themeData);
    }
    
    // Сбрасываем выделение
    setSelectedId(null);
    
    toast.success(`✅ Theme applied: ${selectedTheme.name}`);
  }, [selectedId, themes, applyTheme, selectTheme, applyThemeToWallet]);

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
          Click to preview theme, then Apply to set as active
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
        
        {/* Apply button */}
        {selectedId && selectedId !== activeThemeId && (
          <Button
            onClick={handleApplyClick}
            className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-2 rounded-lg font-medium shadow-lg"
            disabled={isProcessingRef.current}
          >
            Apply Theme
          </Button>
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
              const isSelected = theme.id === selectedId;
              const isReady = isThemeReady(theme);
              
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
                            Preview
                          </div>
                        </div>
                      )}

                      {!isReady && (
                        <div className="absolute bottom-2 left-2 bg-yellow-500/80 text-black text-xs px-2 py-1 rounded-full">
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
        <div className="text-xs text-white/40 text-center space-y-1">
          <div>Active: {activeThemeId} | Selected: {selectedId}</div>
          <div>Source: {source} | Themes: {themes.length}</div>
          <div>Ready themes: {themes.filter(t => isThemeReady(t)).length}</div>
          <div>✅ Fixed theme loading and application system</div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelectorCoverflow;
