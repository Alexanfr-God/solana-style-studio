
import { useState, useEffect } from 'react';
import { useWalletTheme } from './useWalletTheme';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

export interface ThemeItem {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  coverUrl: string;
  themeData: any;
}

const availableThemes: ThemeItem[] = [
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
  }
];

// Helper function to convert theme JSON to WalletStyle format
const convertThemeToWalletStyle = (themeData: any) => {
  if (!themeData) return {};
  
  // Extract wallet-relevant styles from theme JSON
  return {
    backgroundColor: themeData.global?.backgroundColor || themeData.homeLayer?.backgroundColor || '#181818',
    backgroundImage: themeData.global?.backgroundImage || themeData.homeLayer?.backgroundImage,
    accentColor: themeData.global?.accentColor || themeData.assetCard?.title?.textColor || '#a390f5',
    textColor: themeData.global?.textColor || themeData.assetCard?.value?.textColor || '#FFFFFF',
    buttonColor: themeData.global?.buttonColor || themeData.assetCard?.backgroundColor || '#a390f5',
    buttonTextColor: themeData.global?.buttonTextColor || '#FFFFFF',
    borderRadius: themeData.global?.borderRadius || themeData.assetCard?.borderRadius || '12px',
    fontFamily: themeData.global?.fontFamily || themeData.assetCard?.title?.fontFamily || 'Inter, sans-serif',
    boxShadow: themeData.global?.boxShadow || '0px 4px 20px rgba(0, 0, 0, 0.5)',
    styleNotes: `Applied theme: ${themeData.themeName || 'Custom'}`
  };
};

// Function to load theme data for a specific theme
const loadThemeDataForTheme = async (theme: ThemeItem): Promise<ThemeItem> => {
  if (theme.themeData) return theme;
  
  console.log(`🎨 Attempting to load theme data for: ${theme.id}`);
  
  // Define possible file paths to try
  const possiblePaths = [
    `/themes/${theme.id}Theme.json`,
    `/themes/${theme.id}.json`
  ];
  
  for (const path of possiblePaths) {
    try {
      console.log(`📁 Trying to load: ${path}`);
      const response = await fetch(path);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        // Ensure we're getting JSON content
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
  const [themes, setThemes] = useState<ThemeItem[]>(availableThemes);
  const [activeThemeId, setActiveThemeId] = useState('pepe');
  const [isLoading, setIsLoading] = useState(false);
  const { setTheme } = useWalletTheme();

  // Load theme data
  useEffect(() => {
    const loadThemeData = async () => {
      setIsLoading(true);
      console.log('🔄 Starting theme data loading process');
      
      try {
        const updatedThemes = await Promise.all(
          themes.map(theme => loadThemeDataForTheme(theme))
        );
        
        console.log('📦 All themes processed:', updatedThemes.map(t => ({ 
          id: t.id, 
          hasData: !!t.themeData 
        })));
        
        setThemes(updatedThemes);
        
        // Apply the active theme if it now has data
        const activeTheme = updatedThemes.find(t => t.id === activeThemeId);
        if (activeTheme && activeTheme.themeData) {
          console.log('🎯 Auto-applying active theme:', activeTheme.name);
          applyTheme(activeTheme);
        }
        
      } catch (error) {
        console.error('💥 Error loading themes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeData();
  }, [activeThemeId]);

  // Helper function to apply theme
  const applyTheme = (selectedTheme: ThemeItem) => {
    if (!selectedTheme.themeData) {
      console.warn('⚠️ Cannot apply theme without data:', selectedTheme.name);
      return;
    }
    
    // Apply theme to useWalletTheme (for Coverflow)
    setTheme(selectedTheme.themeData);
    console.log('🎨 Theme applied to useWalletTheme:', selectedTheme.name);
    
    // Apply theme to walletCustomizationStore (for wallet components)
    const walletStyle = convertThemeToWalletStyle(selectedTheme.themeData);
    useWalletCustomizationStore.getState().setWalletStyle(walletStyle);
    console.log('🎨 Theme applied to walletCustomizationStore:', walletStyle);
  };

  const selectTheme = (themeId: string) => {
    console.log('👆 Theme selection requested:', themeId);
    
    const selectedTheme = themes.find(t => t.id === themeId);
    if (!selectedTheme) {
      console.error('🚫 Theme not found:', themeId);
      return;
    }
    
    setActiveThemeId(themeId);
    
    if (selectedTheme.themeData) {
      applyTheme(selectedTheme);
    } else {
      console.log('⏳ Theme data not loaded yet, will apply when available');
    }
  };

  const getActiveTheme = () => {
    return themes.find(t => t.id === activeThemeId);
  };

  return {
    themes,
    activeThemeId,
    isLoading,
    selectTheme,
    getActiveTheme
  };
};
