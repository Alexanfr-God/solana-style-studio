
import { useState, useCallback } from 'react';
import { walletUIAPI, WalletAPISchema } from '@/api/walletUIAPI';
import { toast } from 'sonner';

export interface UseWalletUIAPIReturn {
  schema: WalletAPISchema | null;
  isLoading: boolean;
  error: string | null;
  analyzeWallet: (walletType?: string) => Promise<void>;
  applyStyles: (elementId: string, styles: Record<string, any>) => Promise<boolean>;
  exportToGitHub: (walletType?: string) => Promise<{ jsonString: string; filename: string } | null>;
  generateDocumentation: () => string | null;
}

export const useWalletUIAPI = (): UseWalletUIAPIReturn => {
  const [schema, setSchema] = useState<WalletAPISchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWallet = useCallback(async (walletType: string = 'phantom') => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting wallet analysis via API...');
      const walletSchema = await walletUIAPI.analyzeWallet(walletType);
      setSchema(walletSchema);
      
      toast.success(`Wallet analysis complete! Found ${walletSchema.totalElements} elements`);
      console.log('✅ Wallet analysis successful:', walletSchema);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze wallet';
      setError(errorMessage);
      toast.error(`Analysis failed: ${errorMessage}`);
      console.error('❌ Wallet analysis failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyStyles = useCallback(async (elementId: string, styles: Record<string, any>): Promise<boolean> => {
    if (!schema) {
      toast.error('No wallet schema loaded');
      return false;
    }

    try {
      console.log('🎨 Applying styles via API:', { elementId, styles });
      const result = await walletUIAPI.applyStyles(elementId, styles);
      
      if (result.success) {
        toast.success(`Styles applied to ${elementId}`);
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            toast.warning(warning);
          });
        }
        return true;
      } else {
        toast.error(`Failed to apply styles: ${result.warnings?.join(', ')}`);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply styles';
      toast.error(`Style application failed: ${errorMessage}`);
      console.error('❌ Style application failed:', err);
      return false;
    }
  }, [schema]);

  const exportToGitHub = useCallback(async (walletType: string = 'phantom') => {
    if (!schema && walletType !== schema?.walletType) {
      // Если схемы нет или тип не совпадает, анализируем заново
      await analyzeWallet(walletType);
    }

    try {
      console.log('📦 Exporting wallet schema to GitHub format...');
      const exportData = await walletUIAPI.exportToGitHub(walletType);
      
      toast.success(`Schema exported: ${exportData.filename}`);
      console.log('✅ Export successful:', exportData.filename);
      
      return {
        jsonString: exportData.jsonString,
        filename: exportData.filename
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export schema';
      toast.error(`Export failed: ${errorMessage}`);
      console.error('❌ Export failed:', err);
      return null;
    }
  }, [schema, analyzeWallet]);

  const generateDocumentation = useCallback((): string | null => {
    if (!schema) {
      toast.error('No wallet schema loaded');
      return null;
    }

    try {
      console.log('📝 Generating API documentation...');
      const documentation = walletUIAPI.generateAPIDocumentation(schema);
      toast.success('Documentation generated successfully');
      return documentation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate documentation';
      toast.error(`Documentation generation failed: ${errorMessage}`);
      console.error('❌ Documentation generation failed:', err);
      return null;
    }
  }, [schema]);

  return {
    schema,
    isLoading,
    error,
    analyzeWallet,
    applyStyles,
    exportToGitHub,
    generateDocumentation
  };
};
