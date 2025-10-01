
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PresetItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  previewImage: string;
  coverUrl: string;
  tags: string[];
  patch: any[];
  sampleContext: string;
}

interface SupabasePreset {
  id: string;
  title: string;
  cover_url: string | null;
  tags: string[] | null;
  sample_patch: any;
  sample_context: any;
}

const loadPresetsFromSupabase = async (): Promise<PresetItem[]> => {
  console.log('[PL] Loading presets from Supabase...');
  
  const { data, error } = await supabase
    .from('presets')
    .select('id, title, cover_url, tags, sample_patch, sample_context');

  if (error) {
    console.error('[PL] 💥 Supabase error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn('[PL] ⚠️ No presets found in database - table is empty');
    throw new Error('No presets found');
  }

  console.log(`[PL] ✅ Loaded ${data.length} presets from Supabase`);

  return data.map((preset: SupabasePreset) => ({
    id: preset.id,
    slug: preset.id,
    name: preset.title,
    description: `Preset: ${preset.title}`,
    previewImage: preset.cover_url || '',
    coverUrl: preset.cover_url || '',
    tags: Array.isArray(preset.tags) ? preset.tags : (preset.tags ? [preset.tags] : []),
    patch: preset.sample_patch || [],
    sampleContext: preset.sample_context || `Style: ${preset.title}`
  }));
};

const loadPresetsFromFiles = async (): Promise<PresetItem[]> => {
  console.log('[PL] Loading presets from files (fallback mode)...');
  
  try {
    const response = await fetch('/themes/manifest.json');
    if (!response.ok) {
      throw new Error('Manifest not found');
    }
    
    const manifest = await response.json();
    console.log(`[PL] 📦 Loaded ${manifest.length} presets from manifest`);
    
    // Load actual theme data for each preset
    const presetsWithData = await Promise.all(
      manifest.map(async (item: any) => {
        try {
          // Try to load theme data from JSON file
          const themeResponse = await fetch(`/themes/${item.id}.json`);
          if (themeResponse.ok) {
            const themeData = await themeResponse.json();
            console.log(`[PL] ✅ Loaded theme data for ${item.id}`);
            
            return {
              id: item.id,
              slug: item.id,
              name: item.name,
              description: item.description || `Preset: ${item.name}`,
              previewImage: item.coverUrl || '',
              coverUrl: item.coverUrl || '',
              tags: item.tags || [],
              patch: [], // File-based themes use themeData, not patches
              sampleContext: `Style: ${item.name}`,
              themeData // Add the loaded theme data
            };
          } else {
            console.warn(`[PL] ⚠️ No theme file found for ${item.id}`);
            return {
              id: item.id,
              slug: item.id,
              name: item.name,
              description: item.description || `Preset: ${item.name}`,
              previewImage: item.coverUrl || '',
              coverUrl: item.coverUrl || '',
              tags: item.tags || [],
              patch: [],
              sampleContext: `Style: ${item.name}`
            };
          }
        } catch (error) {
          console.error(`[PL] 💥 Error loading theme ${item.id}:`, error);
          return {
            id: item.id,
            slug: item.id,
            name: item.name,
            description: item.description || `Preset: ${item.name}`,
            previewImage: item.coverUrl || '',
            coverUrl: item.coverUrl || '',
            tags: item.tags || [],
            patch: [],
            sampleContext: `Style: ${item.name}`
          };
        }
      })
    );
    
    console.log('[PL] 🎯 File presets loaded with theme data');
    return presetsWithData;
  } catch (error) {
    console.error('[PL] 💥 File fallback failed:', error);
    return [];
  }
};

export const usePresetsLoader = () => {
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'files' | null>(null);

  useEffect(() => {
    const loadPresets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // FORCE file-based loading (Supabase presets use patches, we need themeData)
        console.log('[PL] 🎯 Loading themes from /public/themes/ (forced file mode)');
        const filePresets = await loadPresetsFromFiles();
        if (filePresets.length > 0) {
          setPresets(filePresets);
          setSource('files');
          console.log('[PL] ✅ Using file-based themes (manifest source)');
          console.log(`[PL]   Successfully loaded ${filePresets.length} themes with data`);
        } else {
          throw new Error('No presets available from files');
        }
      } catch (fileError) {
        console.error('[PL] 💥 File loading failed - no presets available');
        console.error('[PL]   Error:', fileError instanceof Error ? fileError.message : 'Unknown');
        setError('Failed to load presets from theme files');
        setPresets([]);
        setSource(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPresets();
  }, []);

  return {
    presets,
    isLoading,
    error,
    source
  };
};
