
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
  slug: string;
  title: string;
  cover_url: string | null;
  tags: any;
  payload: {
    patch: any[];
    sample_context: string;
  };
}

const loadPresetsFromSupabase = async (): Promise<PresetItem[]> => {
  console.log('📋 Loading presets from Supabase...');
  
  const { data, error } = await supabase
    .from('presets')
    .select('slug, title, cover_url, tags, payload');

  if (error) {
    console.error('💥 Supabase error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ No presets found in database');
    throw new Error('No presets found');
  }

  console.log(`✅ Loaded ${data.length} presets from Supabase`);

  return data.map((preset: any) => {
    // Ensure we have the correct structure
    const safePreset = preset as SupabasePreset;
    
    return {
      id: safePreset.slug,
      slug: safePreset.slug,
      name: safePreset.title,
      description: `Preset: ${safePreset.title}`,
      previewImage: safePreset.cover_url || '',
      coverUrl: safePreset.cover_url || '',
      tags: Array.isArray(safePreset.tags) ? safePreset.tags : (safePreset.tags ? [safePreset.tags] : []),
      patch: safePreset.payload?.patch || [],
      sampleContext: safePreset.payload?.sample_context || ''
    };
  });
};

const loadPresetsFromFiles = async (): Promise<PresetItem[]> => {
  console.log('📁 Loading presets from files (fallback)...');
  
  try {
    const response = await fetch('/themes/manifest.json');
    if (!response.ok) {
      throw new Error('Manifest not found');
    }
    
    const manifest = await response.json();
    console.log(`📦 Loaded ${manifest.length} presets from files`);
    
    return manifest.map((item: any) => ({
      id: item.id,
      slug: item.id,
      name: item.name,
      description: item.description || `Preset: ${item.name}`,
      previewImage: item.coverUrl || '',
      coverUrl: item.coverUrl || '',
      tags: item.tags || [],
      patch: [], // Will be loaded separately when needed
      sampleContext: `Style: ${item.name}`
    }));
  } catch (error) {
    console.error('💥 File fallback failed:', error);
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
        // Try loading from Supabase first
        const supabasePresets = await loadPresetsFromSupabase();
        setPresets(supabasePresets);
        setSource('supabase');
        console.log('🎯 Using Supabase presets');
      } catch (supabaseError) {
        console.warn('⚠️ Supabase failed, trying file fallback...');
        
        try {
          // Fallback to files
          const filePresets = await loadPresetsFromFiles();
          setPresets(filePresets);
          setSource('files');
          console.log('🎯 Using file fallback presets');
        } catch (fileError) {
          console.error('💥 Both sources failed');
          setError('Failed to load presets from both Supabase and files');
          setPresets([]);
          setSource(null);
        }
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
