
import { useState, useEffect } from 'react';
import { useWalletTheme } from './useWalletTheme';

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
    id: 'default',
    name: 'Classic Theme',
    description: 'Clean and modern wallet design',
    previewImage: '/themes/covers/default-cover.jpg',
    coverUrl: '/themes/covers/default-cover.jpg',
    themeData: null // Will be loaded from JSON
  },
  {
    id: 'neon',
    name: 'Neon Dream',
    description: 'Cyberpunk-inspired neon aesthetics',
    previewImage: '/themes/covers/neon-cover.jpg',
    coverUrl: '/themes/covers/neon-cover.jpg',
    themeData: null
  }
];

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
      setTheme(selectedTheme.themeData);
      console.log('🎨 Theme selected:', selectedTheme.name);
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
