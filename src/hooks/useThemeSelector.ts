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
    
    console.log(`🔄 Converting ${loadedPresets.length} presets to themes (source: ${source})`);
    
    const convertedThemes: ThemeItem[] = loadedPresets.map((preset: PresetItem) => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      previewImage: preset.previewImage,
      coverUrl: preset.coverUrl,
      // Don't set themeData initially - load on demand for file-based themes
      themeData: undefined,
      patch: preset.patch,
      sampleContext: preset.sampleContext
    }));
    
    setThemes(convertedThemes);
    
    // Set first theme as active if no active theme
    if (!activeThemeId && convertedThemes.length > 0) {
      const defaultTheme = convertedThemes.find(t => t.id === 'luxuryTheme') || convertedThemes[0];
      setActiveThemeId(defaultTheme.id);
      console.log('🎯 Set default active theme:', defaultTheme.id);
    }
  }, [loadedPresets, source, activeThemeId, setActiveThemeId]);

  // Apply preview patch for theme (temporary preview)
  const applyThemePreview = (selectedTheme: ThemeItem) => {
    console.log(`👁️ Applying theme preview: ${selectedTheme.name}`);
    
    if (selectedTheme.patch && selectedTheme.patch.length > 0) {
      // This is a preset from Supabase - apply patch as preview
      try {
        applyPreviewPatch(selectedTheme.patch as Operation[]);
        console.log('👁️ Applied preset patch as preview:', selectedTheme.name);
      } catch (error) {
        console.error('💥 Error applying preset preview:', error);
      }
    } else if (selectedTheme.themeData) {
      // This is a regular theme - apply themeData as preview through setTheme
      try {
        setTheme(selectedTheme.themeData);
        console.log('👁️ Applied theme data directly:', selectedTheme.name);
      } catch (error) {
        console.error('💥 Error applying theme preview:', error);
      }
    } else {
      console.warn('⚠️ Cannot preview theme without data or patch:', selectedTheme.name);
    }
  };

  // EXPLICIT theme application - commits preview to main theme
  const applyTheme = (selectedTheme: ThemeItem) => {
    console.log(`🎨 APPLY THEME CLICKED: ${selectedTheme.name}`);
    console.log('🎨 Theme data:', selectedTheme);
    
    // For presets use patch, for regular themes use themeData
    if (selectedTheme.patch && selectedTheme.patch.length > 0) {
      // This is a preset from Supabase - apply patch locally
      const currentTheme = getDisplayTheme();
      console.log('🎨 Current theme before patch:', currentTheme);
      
      try {
        // Apply patch to current theme
        const newTheme = applyPatch(currentTheme, selectedTheme.patch as Operation[], false, false).newDocument;
        console.log('🎨 New theme after patch:', newTheme);
        setTheme(newTheme);
        setActiveThemeId(selectedTheme.id);
        console.log('✅ Applied preset patch locally:', selectedTheme.name);
      } catch (error) {
        console.error('💥 Error applying preset patch:', error);
      }
    } else if (selectedTheme.themeData) {
      // This is a regular theme - apply themeData
      console.log('🎨 Applying theme data:', selectedTheme.themeData);
      setTheme(selectedTheme.themeData);
      setActiveThemeId(selectedTheme.id);
      console.log('✅ Applied theme data:', selectedTheme.name);
    } else {
      console.warn('⚠️ Cannot apply theme without data or patch:', selectedTheme.name);
    }
  };

  // Commit current preview to main theme
  const commitCurrentPreview = () => {
    console.log('✅ COMMITTING PREVIEW to main theme');
    commitPreview();
    console.log('✅ Preview committed to main theme');
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

  /**
   * @deprecated Use useThemeStore().getDisplayTheme() directly instead
   * Legacy compatibility for components still using this method
   */
  const getActiveTheme = () => {
    if (import.meta.env.DEV) {
      console.warn('⚠️ DEPRECATED: useThemeSelector.getActiveTheme() is deprecated, use useWalletTheme() hook instead');
    }
    
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
    activeThemeId, // Now reads from unified themeStore
    isLoading: presetsLoading, // Removed the blocking loading state
    selectTheme,
    getActiveTheme, // Deprecated but kept for compatibility
    applyTheme,
    applyThemePreview,
    commitCurrentPreview,
    applyThemeById,
    source // Add data source for debugging
  };
};
