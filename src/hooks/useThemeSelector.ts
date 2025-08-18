
import { useState, useEffect } from 'react';
import { useThemeStore } from '@/state/themeStore';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { THEME_SOT_IS_ZUSTAND } from '@/config/flags';

export interface ThemeItem {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  coverUrl: string;
  themeData: any;
}

const loadThemeManifest = async (): Promise<ThemeItem[]> => {
  try {
    console.log('📋 Loading theme manifest...');
    const response = await fetch('/themes/manifest.json');
    
    if (response.ok) {
      const manifest = await response.json();
      console.log('✅ Theme manifest loaded:', manifest);
      
      return manifest.map((item: any) => ({
        ...item,
        previewImage: item.coverUrl,
        themeData: null
      }));
    } else {
      console.warn('⚠️ Failed to load manifest, falling back to default themes');
      throw new Error('Manifest not found');
    }
  } catch (error) {
    console.error('💥 Error loading theme manifest:', error);
    
    return [
      {
        id: 'luxury',
        name: 'Luxury Gold',
        description: 'Premium golden wallet interface',
        previewImage: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_1/image_1.png',
        coverUrl: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_1/image_1.png',
        themeData: null
      },
      {
        id: 'wif',
        name: 'WIF',
        description: 'WIF themed wallet design',
        previewImage: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_2/image_2.png',
        coverUrl: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_2/image_2.png',
        themeData: null
      },
      {
        id: 'pepe',
        name: 'Pepe Theme',
        description: 'Pepe themed wallet design',
        previewImage: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_3/image_3.png',
        coverUrl: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_3/image_3.png',
        themeData: null
      },
      {
        id: 'elonmusk',
        name: 'Elon Musk',
        description: 'Elon Musk themed wallet design',
        previewImage: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_4/image_4.png',
        coverUrl: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_4/image_4.png',
        themeData: null
      },
      {
        id: 'trump',
        name: 'TRUMP',
        description: 'Bold patriotic theme with red, white and blue American styling',
        previewImage: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_8/image_8.png',
        coverUrl: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_8/image_8.png',
        themeData: null
      }
    ];
  }
};

const loadThemeDataForTheme = async (theme: ThemeItem): Promise<ThemeItem> => {
  if (theme.themeData) return theme;
  
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
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  // Убираем хардкод и делаем начальное значение null
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load themes from manifest on mount ONLY
  useEffect(() => {
    const initializeThemes = async () => {
      setIsLoading(true);
      console.log('🚀 Initializing themes from manifest');
      
      try {
        const manifestThemes = await loadThemeManifest();
        setThemes(manifestThemes);
        
        // Устанавливаем первую тему как активную по умолчанию, если activeThemeId не задан
        if (!activeThemeId && manifestThemes.length > 0) {
          const defaultTheme = manifestThemes.find(t => t.id === 'luxury') || manifestThemes[0];
          setActiveThemeId(defaultTheme.id);
          console.log('🎯 Set default active theme:', defaultTheme.id);
        }
        
        console.log('📦 Themes initialized from manifest:', manifestThemes.length);
      } catch (error) {
        console.error('💥 Error initializing themes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeThemes();
  }, []); // Only load once on mount

  // Load theme data when themes are first loaded - NO auto-apply
  useEffect(() => {
    if (themes.length === 0) return;
    
    const needsDataLoad = themes.some(theme => !theme.themeData);
    if (!needsDataLoad) return;
    
    const loadThemeData = async () => {
      setIsLoading(true);
      console.log('🔄 Loading theme data (NO AUTO-APPLY)');
      
      try {
        const updatedThemes = await Promise.all(
          themes.map(theme => loadThemeDataForTheme(theme))
        );
        
        console.log('📦 All themes processed:', updatedThemes.map(t => ({ 
          id: t.id, 
          hasData: !!t.themeData 
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
  }, [themes.length]); // Only when themes count changes

  // EXPLICIT theme application - only called by user action
  const applyTheme = (selectedTheme: ThemeItem) => {
    if (!selectedTheme.themeData) {
      console.warn('⚠️ Cannot apply theme without data:', selectedTheme.name);
      return;
    }
    
    // Use only useThemeStore as single source of truth
    const setTheme = useThemeStore.getState().setTheme;
    const next = selectedTheme.themeData;
    
    // Simple protection against "same theme overwrite"
    const curr = useThemeStore.getState().theme;
    try {
      if (JSON.stringify(curr) === JSON.stringify(next)) {
        console.log('🔄 Theme already applied, skipping:', selectedTheme.name);
        return;
      }
    } catch (error) {
      console.warn('Theme comparison failed, proceeding with apply');
    }
    
    setTheme(next);
    console.log('🎨 Theme applied to useThemeStore (SoT):', selectedTheme.name);
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
    if (selectedTheme && selectedTheme.themeData) {
      applyTheme(selectedTheme);
    }
  };

  return {
    themes,
    activeThemeId,
    isLoading,
    selectTheme,
    getActiveTheme,
    applyTheme,
    applyThemeById
  };
};
