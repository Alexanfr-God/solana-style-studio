
import { useState, useEffect } from 'react';
import { useWalletTheme } from './useWalletTheme';

export interface ThemeItem {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  coverUrl: string;
  filePath: string;
  themeData?: any;
}

interface ThemesManifest {
  themes: Omit<ThemeItem, 'themeData'>[];
}

export const useThemeSelector = () => {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [activeThemeId, setActiveThemeId] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme } = useWalletTheme();

  // Load themes from manifest and their data
  useEffect(() => {
    const loadThemes = async () => {
      setIsLoading(true);
      try {
        // Load themes manifest
        const manifestResponse = await fetch('/themes/themes.json');
        const manifest: ThemesManifest = await manifestResponse.json();
        
        // Load theme data for each theme
        const themesWithData = await Promise.all(
          manifest.themes.map(async (themeInfo) => {
            try {
              const response = await fetch(themeInfo.filePath);
              const themeData = await response.json();
              return { ...themeInfo, themeData };
            } catch (error) {
              console.warn(`Failed to load theme ${themeInfo.id}:`, error);
              return { ...themeInfo, themeData: null };
            }
          })
        );
        
        setThemes(themesWithData);
        
        // Auto-select default theme on load
        const defaultTheme = themesWithData.find(t => t.id === 'default');
        if (defaultTheme && defaultTheme.themeData) {
          setTheme(defaultTheme.themeData);
          console.log('🎨 Default theme loaded:', defaultTheme.name);
        }
      } catch (error) {
        console.error('Error loading themes manifest:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemes();
  }, [setTheme]);

  const selectTheme = (themeId: string) => {
    const selectedTheme = themes.find(t => t.id === themeId);
    if (selectedTheme && selectedTheme.themeData) {
      setActiveThemeId(themeId);
      setTheme(selectedTheme.themeData);
      console.log('🎨 Theme selected and applied via useWalletTheme:', selectedTheme.name);
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
