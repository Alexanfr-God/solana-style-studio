
import { useState, useEffect } from 'react';
import { useThemeStore } from '@/state/themeStore';
import { usePresetsLoader, type PresetItem } from './usePresetsLoader';

// Оставляем старый интерфейс для совместимости
export interface ThemeItem {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  coverUrl: string;
  themeData: any;
  // Новые поля для пресетов
  patch?: any[];
  sampleContext?: string;
}

const loadThemeDataForTheme = async (theme: ThemeItem): Promise<ThemeItem> => {
  if (theme.themeData || theme.patch) return theme;
  
  console.log(`🎨 Attempting to load theme data for: ${theme.id}`);
  
  const possiblePaths = [
    `/themes/${theme.id}.json`,
    `/themes/${theme.id}Theme.json`
  ];
  
  for (const path of possiblePaths) {
    try {
      console.log(`📁 Trying to load: ${path}`);
      const response = await fetch(path);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const themeData = await response.json();
          console.log(`✅ Successfully loaded theme data from: ${path}`, themeData);
          return { ...theme, themeData };
        } else {
          console.warn(`⚠️ Invalid content type for ${path}: ${contentType}`);
        }
      } else {
        console.warn(`❌ Failed to fetch ${path}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`💥 Error loading ${path}:`, error);
    }
  }
  
  console.error(`🚫 Failed to load theme data for ${theme.id} from any path`);
  return theme;
};

export const useThemeSelector = () => {
  const { presets: loadedPresets, isLoading: presetsLoading, source } = usePresetsLoader();
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Преобразуем пресеты в формат тем
  useEffect(() => {
    if (loadedPresets.length === 0) return;
    
    console.log(`🔄 Converting ${loadedPresets.length} presets to themes (source: ${source})`);
    
    const convertedThemes: ThemeItem[] = loadedPresets.map((preset: PresetItem) => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      previewImage: preset.previewImage,
      coverUrl: preset.coverUrl,
      themeData: source === 'supabase' ? 'preset' : null, // Marker for preset vs theme
      patch: preset.patch,
      sampleContext: preset.sampleContext
    }));
    
    setThemes(convertedThemes);
    
    // Устанавливаем первую тему как активную по умолчанию
    if (!activeThemeId && convertedThemes.length > 0) {
      const defaultTheme = convertedThemes.find(t => t.id === 'luxuryTheme') || convertedThemes[0];
      setActiveThemeId(defaultTheme.id);
      console.log('🎯 Set default active theme:', defaultTheme.id);
    }
  }, [loadedPresets, source, activeThemeId]);

  // Load theme data when themes are first loaded - NO auto-apply
  useEffect(() => {
    if (themes.length === 0 || source === 'supabase') return; // Skip for Supabase presets
    
    const needsDataLoad = themes.some(theme => !theme.themeData && !theme.patch);
    if (!needsDataLoad) return;
    
    const loadThemeData = async () => {
      setIsLoading(true);
      console.log('🔄 Loading theme data for file-based themes (NO AUTO-APPLY)');
      
      try {
        const updatedThemes = await Promise.all(
          themes.map(theme => loadThemeDataForTheme(theme))
        );
        
        console.log('📦 All themes processed:', updatedThemes.map(t => ({ 
          id: t.id, 
          hasData: !!(t.themeData || t.patch)
        })));
        
        setThemes(updatedThemes);
        console.log('🚫 Theme data loaded but NOT applied - awaiting explicit user action');
        
      } catch (error) {
        console.error('💥 Error loading themes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeData();
  }, [themes.length, source]);

  // EXPLICIT theme application - only called by user action
  const applyTheme = (selectedTheme: ThemeItem) => {
    console.log(`🎨 Applying theme: ${selectedTheme.name}`);
    
    // Для пресетов используем patch, для обычных тем - themeData
    if (selectedTheme.patch && selectedTheme.patch.length > 0) {
      // Это preset из Supabase - применяем patch локально
      const setTheme = useThemeStore.getState().setTheme;
      const currentTheme = useThemeStore.getState().theme;
      
      try {
        // Применяем patch к текущей теме
        const { applyPatch } = require('fast-json-patch');
        const newTheme = applyPatch(currentTheme, selectedTheme.patch, false, false).newDocument;
        setTheme(newTheme);
        console.log('🎨 Applied preset patch locally:', selectedTheme.name);
      } catch (error) {
        console.error('💥 Error applying preset patch:', error);
      }
    } else if (selectedTheme.themeData && selectedTheme.themeData !== 'preset') {
      // Это обычная тема - применяем themeData
      const setTheme = useThemeStore.getState().setTheme;
      setTheme(selectedTheme.themeData);
      console.log('🎨 Applied theme data:', selectedTheme.name);
    } else {
      console.warn('⚠️ Cannot apply theme without data or patch:', selectedTheme.name);
    }
  };

  // EXPLICIT theme selection - only sets active, does NOT auto-apply
  const selectTheme = (themeId: string) => {
    console.log('👆 Theme selection (no auto-apply):', themeId);
    
    const selectedTheme = themes.find(t => t.id === themeId);
    if (!selectedTheme) {
      console.error('🚫 Theme not found:', themeId);
      return;
    }
    
    // ONLY set active - NO automatic application
    setActiveThemeId(themeId);
    console.log('✅ Theme selected as active:', themeId);
  };

  const getActiveTheme = () => {
    if (!activeThemeId) return null;
    return themes.find(t => t.id === activeThemeId);
  };

  const applyThemeById = (themeId: string) => {
    const selectedTheme = themes.find(t => t.id === themeId);
    if (selectedTheme) {
      applyTheme(selectedTheme);
    }
  };

  return {
    themes,
    activeThemeId,
    isLoading: presetsLoading || isLoading,
    selectTheme,
    getActiveTheme,
    applyTheme,
    applyThemeById,
    source // Добавляем источник данных для отладки
  };
};
