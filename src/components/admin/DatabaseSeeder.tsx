import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const DatabaseSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [status, setStatus] = useState<string>('');

  const seedDatabase = async () => {
    setIsSeeding(true);
    setStatus('Starting database seeding...');

    try {
      // Step 1: Seed presets
      setStatus('Seeding presets table (18 themes)...');
      const { data: presetsData, error: presetsError } = await supabase.functions.invoke('seed_presets', {
        method: 'POST'
      });

      if (presetsError) {
        throw new Error(`Presets seeding failed: ${presetsError.message}`);
      }

      console.log('Presets seeded:', presetsData);
      toast.success('✅ Presets table filled (18 themes)');

      // Step 2: Seed schema_versions
      setStatus('Seeding schema_versions table...');
      const { data: schemaData, error: schemaError } = await supabase.functions.invoke('seed-schema', {
        method: 'POST'
      });

      if (schemaError) {
        throw new Error(`Schema seeding failed: ${schemaError.message}`);
      }

      console.log('Schema seeded:', schemaData);
      toast.success('✅ Schema_versions table filled');

      // Step 3: Verify results
      setStatus('Verifying data...');
      const { count: presetsCount, error: countError1 } = await supabase
        .from('presets')
        .select('*', { count: 'exact', head: true });

      const { count: schemaCount, error: countError2 } = await supabase
        .from('schema_versions')
        .select('*', { count: 'exact', head: true });

      if (countError1 || countError2) {
        throw new Error('Failed to verify counts');
      }

      setStatus(`✅ Complete! Presets: ${presetsCount}, Schema versions: ${schemaCount}`);
      toast.success(`Database seeded successfully!\nPresets: ${presetsCount}, Schema: ${schemaCount}`);

    } catch (error) {
      console.error('Seeding error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Error: ${errorMessage}`);
      toast.error(`Failed to seed database: ${errorMessage}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={seedDatabase}
        disabled={isSeeding}
        className="w-full"
        variant="default"
      >
        {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSeeding ? 'Seeding Database...' : 'Seed Database (One-time)'}
      </Button>
      
      {status && (
        <div className="text-sm text-white/70 p-3 bg-black/20 rounded-md">
          {status}
        </div>
      )}
      
      <div className="text-xs text-white/50 space-y-1">
        <p>• Fills presets table with 18 preset themes</p>
        <p>• Creates schema_versions entry with current schema</p>
        <p>• Required for llm-patch context and ThemeChat functionality</p>
      </div>
    </div>
  );
};
