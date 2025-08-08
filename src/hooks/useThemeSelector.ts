
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
    id: 'default',
    name: 'Classic Theme',
    description: 'Clean and modern wallet design',
    previewImage: '/themes/covers/default-cover.jpg',
    coverUrl: '/themes/covers/default-cover.jpg',
    themeData: null // Will be loaded from JSON
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

export const useThemeSelector = () => {
  const [themes, setThemes] = useState<ThemeItem[]>(availableThemes);
  const [activeThemeId, setActiveThemeId] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const { setTheme } = useWalletTheme();

  // Load theme data
  useEffect(() => {
    const loadThemeData = async () => {
      setIsLoading(true);
      try {
        const updatedThemes = await Promise.all(
          themes.map(async (theme) => {
            if (theme.themeData) return theme;
            
            try {
              const response = await fetch(`/themes/${theme.id}Theme.json`);
              const themeData = await response.json();
              return { ...theme, themeData };
            } catch (error) {
              console.warn(`Failed to load theme ${theme.id}:`, error);
              return theme;
            }
          })
        );
        setThemes(updatedThemes);
      } catch (error) {
        console.error('Error loading themes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeData();
  }, []);

  const selectTheme = (themeId: string) => {
    const selectedTheme = themes.find(t => t.id === themeId);
    if (selectedTheme && selectedTheme.themeData) {
      setActiveThemeId(themeId);
      
      // Apply theme to useWalletTheme (for Coverflow)
      setTheme(selectedTheme.themeData);
      console.log('🎨 Theme selected in useWalletTheme:', selectedTheme.name);
      
      // Apply theme to walletCustomizationStore (for wallet components)
      const walletStyle = convertThemeToWalletStyle(selectedTheme.themeData);
      useWalletCustomizationStore.getState().setWalletStyle(walletStyle);
      console.log('🎨 Theme applied to walletCustomizationStore:', walletStyle);
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
