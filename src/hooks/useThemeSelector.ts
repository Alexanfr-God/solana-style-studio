
import { useState, useEffect } from 'react';
import { useThemeStore } from '@/state/themeStore';
import { usePresetsLoader, type PresetItem } from './usePresetsLoader';
import { applyPatch, type Operation } from 'fast-json-patch';

// Keep old interface for compatibility
export interface ThemeItem {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  coverUrl: string;
  themeData?: any;
  // New fields for presets
  patch?: any[];
  sampleContext?: string;
}

export const useThemeSelector = () => {
  const { presets: loadedPresets, isLoading: presetsLoading, source } = usePresetsLoader();
  const [themes, setThemes] = useState<ThemeItem[]>([]);

  // Get unified theme store state and actions - SINGLE SOURCE OF TRUTH
  const activeThemeId = useThemeStore(state => state.activeThemeId);
  const setActiveThemeId = useThemeStore(state => state.setActiveThemeId);
  const setTheme = useThemeStore(state => state.setTheme);
  const applyPreviewPatch = useThemeStore(state => state.applyPreviewPatch);
  const commitPreview = useThemeStore(state => state.commitPreview);
  const getDisplayTheme = useThemeStore(state => state.getDisplayTheme);

  // Convert presets to themes format
  useEffect(() => {
    if (loadedPresets.length === 0) return;
    
    console.log(`[TS] Converting ${loadedPresets.length} presets to themes (source: ${source})`);
    
    const convertedThemes: ThemeItem[] = loadedPresets.map((preset: PresetItem) => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      previewImage: preset.previewImage,
      coverUrl: preset.coverUrl,
      themeData: (preset as any).themeData, // Include loaded theme data
      patch: preset.patch,
      sampleContext: preset.sampleContext
    }));
    
    setThemes(convertedThemes);
    
    // Set first theme as active if no active theme
    if (!activeThemeId && convertedThemes.length > 0) {
      const defaultTheme = convertedThemes.find(t => t.id === 'luxuryTheme') || convertedThemes[0];
      console.log('[TS] setActiveThemeId (default):', defaultTheme.id);
      setActiveThemeId(defaultTheme.id);
      console.log('[TS] Set default active theme:', defaultTheme.id);
    }
  }, [loadedPresets, source, activeThemeId, setActiveThemeId]);

  // Apply preview patch for theme (temporary preview)
  const applyThemePreview = (selectedTheme: ThemeItem) => {
    console.log(`[TS] 👁️ Applying theme preview: ${selectedTheme.name}`);
    
    if (selectedTheme.patch && selectedTheme.patch.length > 0) {
      // This is a preset from Supabase - apply patch as preview
      try {
        applyPreviewPatch(selectedTheme.patch as Operation[]);
        console.log('[TS] 👁️ Applied preset patch as preview:', selectedTheme.name);
      } catch (error) {
        console.error('[TS] 💥 Error applying preset preview:', error);
      }
    } else if (selectedTheme.themeData) {
      // This is a regular theme - apply themeData as preview through setTheme
      try {
        console.log('[TS] setTheme (preview)', typeof selectedTheme.themeData, selectedTheme.themeData && Object.keys(selectedTheme.themeData));
        setTheme(selectedTheme.themeData);
        console.log('[TS] 👁️ Applied theme data directly:', selectedTheme.name);
      } catch (error) {
        console.error('[TS] 💥 Error applying theme preview:', error);
      }
    } else {
      console.warn('[TS] ⚠️ Cannot preview theme without data or patch:', selectedTheme.name);
    }
  };

  // FIXED: Improved applyTheme with better validation and loading
  const applyTheme = async (selectedTheme: ThemeItem) => {
    console.log(`[TS] 🎨 APPLY THEME CLICKED: ${selectedTheme.name}`);
    console.log('[TS] Theme data available:', {
      hasThemeData: !!selectedTheme.themeData,
      hasPatch: !!(selectedTheme.patch && selectedTheme.patch.length > 0),
      themeDataKeys: selectedTheme.themeData ? Object.keys(selectedTheme.themeData) : []
    });
    
    // Priority 1: Direct theme data (JSON themes)
    if (selectedTheme.themeData) {
      console.log('[TS] ✅ Applying JSON theme data directly');
      setTheme(selectedTheme.themeData);
      setActiveThemeId(selectedTheme.id);
      console.log('[TS] ✅ JSON theme applied:', selectedTheme.name);
      return;
    }
    
    // Priority 2: Load theme data from file if not available
    if (source === 'files' && !selectedTheme.themeData) {
      console.log('[TS] 🔄 Loading theme data from file...');
      try {
        const response = await fetch(`/themes/${selectedTheme.id}.json`);
        if (response.ok) {
          const themeData = await response.json();
          console.log('[TS] ✅ Loaded theme data from file:', Object.keys(themeData));
          setTheme(themeData);
          setActiveThemeId(selectedTheme.id);
          console.log('[TS] ✅ File theme applied:', selectedTheme.name);
          return;
        }
      } catch (error) {
        console.error('[TS] 💥 Error loading theme file:', error);
      }
    }
    
    // Priority 3: Supabase presets with patches
    if (selectedTheme.patch && selectedTheme.patch.length > 0) {
      console.log('[TS] ✅ Applying Supabase preset patch');
      const currentTheme = getDisplayTheme();
      
      try {
        const newTheme = applyPatch(currentTheme, selectedTheme.patch as Operation[], false, false).newDocument;
        setTheme(newTheme);
        setActiveThemeId(selectedTheme.id);
        console.log('[TS] ✅ Preset patch applied:', selectedTheme.name);
        return;
      } catch (error) {
        console.error('[TS] 💥 Error applying preset patch:', error);
      }
    }
    
    console.error('[TS] 💥 Cannot apply theme - no valid data source:', selectedTheme.name);
  };

  // Commit current preview to main theme
  const commitCurrentPreview = () => {
    console.log('[TS] ✅ COMMITTING PREVIEW to main theme');
    commitPreview();
    console.log('[TS] ✅ Preview committed to main theme');
  };

  // EXPLICIT theme selection - applies theme immediately
  const selectTheme = async (themeId: string) => {
    console.log('[TS] 👆 Theme selection (with auto-apply):', themeId);
    
    const selectedTheme = themes.find(t => t.id === themeId);
    if (!selectedTheme) {
      console.error('[TS] 🚫 Theme not found:', themeId);
      return;
    }
    
    // Apply the theme
    await applyTheme(selectedTheme);
    console.log('[TS] ✅ Theme selected and applied:', themeId);
  };

  /**
   * @deprecated Use useThemeStore().getDisplayTheme() directly instead
   * Legacy compatibility for components still using this method
   */
  const getActiveTheme = () => {
    if (import.meta.env.DEV) {
      console.warn('[TS] ⚠️ DEPRECATED: useThemeSelector.getActiveTheme() is deprecated, use useWalletTheme() hook instead');
    }
    
    if (!activeThemeId) return null;
    return themes.find(t => t.id === activeThemeId);
  };

  const applyThemeById = async (themeId: string) => {
    const selectedTheme = themes.find(t => t.id === themeId);
    if (selectedTheme) {
      await applyTheme(selectedTheme);
    }
  };

  return {
    themes,
    activeThemeId,
    isLoading: presetsLoading,
    selectTheme,
    getActiveTheme,
    applyTheme,
    applyThemePreview,
    commitCurrentPreview,
    applyThemeById,
    source
  };
};
