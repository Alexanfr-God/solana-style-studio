
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
  console.log('📋 Loading presets from Supabase...');
  
  const { data, error } = await supabase
    .from('presets')
    .select('id, title, cover_url, tags, sample_patch, sample_context');

  if (error) {
    console.error('💥 Supabase error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ No presets found in database - table is empty');
    throw new Error('No presets found');
  }

  console.log(`✅ Loaded ${data.length} presets from Supabase`);

  return data.map((preset: SupabasePreset) => ({
    id: preset.id,
    slug: preset.id, // Use id as slug for Supabase presets
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
  console.log('📁 Loading presets from files (fallback mode)...');
  
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
      patch: [], // Will be loaded separately when needed from theme files
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
        console.log('🎯 Using Supabase presets (database source)');
      } catch (supabaseError) {
        console.warn('⚠️ Supabase failed, automatically falling back to files...');
        console.warn('   Reason:', supabaseError instanceof Error ? supabaseError.message : 'Unknown error');
        
        try {
          // Automatic fallback to files
          const filePresets = await loadPresetsFromFiles();
          if (filePresets.length > 0) {
            setPresets(filePresets);
            setSource('files');
            console.log('🎯 Using file fallback presets (manifest source)');
            console.log(`   Successfully loaded ${filePresets.length} themes from /themes/manifest.json`);
          } else {
            throw new Error('No presets available from files either');
          }
        } catch (fileError) {
          console.error('💥 Both sources failed - no presets available');
          console.error('   Supabase:', supabaseError instanceof Error ? supabaseError.message : 'Unknown');
          console.error('   Files:', fileError instanceof Error ? fileError.message : 'Unknown');
          setError('Failed to load presets from both database and files');
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
