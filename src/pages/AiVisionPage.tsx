import React, { useState, useEffect, useCallback } from 'react';
import { useThemeProbeStore } from '@/stores/themeProbeStore';
import { ControlsPanel, ScreenType } from '@/components/inspector/ControlsPanel';
import { CoverageLegend } from '@/components/inspector/CoverageLegend';
import { SummaryTable } from '@/components/inspector/SummaryTable';
import { ThemeVisionOverlay } from '@/components/inspector/ThemeVisionOverlay';
import { waitForWalletRoot } from '@/utils/inspector/domDeep';
import { exportMappingJSON, exportMappingSummary } from '@/utils/inspector/exportMapping';
import { runThemeProbeInPreview } from '@/agents/mcp/ThemeProbeBridge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const AiVisionPage: React.FC = () => {
  const { toast } = useToast();
  const {
    result,
    overlayEnabled,
    activeFilters,
    setProbeResult,
    toggleOverlay,
    setOverlayEnabled,
    toggleFilter,
  } = useThemeProbeStore();

  const [screen, setScreen] = useState<ScreenType>('home');
  const [isProbing, setIsProbing] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // V hotkey for overlay toggle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'v' || e.key === 'V') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        toggleOverlay();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleOverlay]);

  const handleProbePaint = useCallback(async () => {
    setIsProbing(true);
    
    try {
      toast({
        title: 'Starting ThemeProbe',
        description: `Analyzing ${screen} screen...`,
      });

      // Wait for wallet root before probing
      try {
        await waitForWalletRoot(20, 300);
      } catch (error) {
        toast({
          title: 'Wallet not ready',
          description: 'Make sure the wallet preview is loaded and try again.',
          variant: 'destructive',
        });
        return;
      }

      // Map screen to supported scope (ThemeProbe supports 'home', 'lock', 'all')
      const scopeMap: Record<ScreenType, 'home' | 'lock' | 'all'> = {
        home: 'home',
        lock: 'lock',
        send: 'home',
        receive: 'home',
        buy: 'home',
        swap: 'home',
        apps: 'home',
        history: 'home',
        search: 'home',
        all: 'all',
      };
      
      const scope = scopeMap[screen];
      
      // Run probe via bridge
      const probeResult = await runThemeProbeInPreview(scope);
      
      // Store result
      setProbeResult({
        screen,
        items: probeResult.mapping || [],
      });

      // Auto-enable overlay if it's off
      if (!overlayEnabled) {
        setOverlayEnabled(true);
      }

      // Persist mappings to DB
      try {
        const validMappings = probeResult.mapping
          .filter(m => m.bestPath?.startsWith('/') && (m.confidence || 0) > 0.5)
          .map(m => ({ 
            id: m.id, 
            json_path: m.bestPath!, 
            confidence: m.confidence || 0 
          }));

        if (validMappings.length > 0) {
          const { data, error } = await supabase.functions.invoke('ai-vision-upsert-mappings', {
            body: { mappings: validMappings }
          });

          if (error) throw error;
          
          console.log(`[AiVision] Saved ${data.updated} mappings to DB`);
          
          toast({
            title: 'Mappings saved',
            description: `Updated ${data.updated} elements in database`,
          });
        }
      } catch (err) {
        console.error('[AiVision] Failed to persist mappings:', err);
        toast({
          title: 'Warning',
          description: 'Probe completed but failed to save mappings to DB',
          variant: 'destructive',
        });
      }

      toast({
        title: 'ThemeProbe complete',
        description: `Found ${probeResult.mapping?.length || 0} elements`,
      });
    } catch (error) {
      console.error('[AiVisionPage] Probe error:', error);
      toast({
        title: 'ThemeProbe failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProbing(false);
    }
  }, [screen, overlayEnabled, setProbeResult, setOverlayEnabled, toast]);

  const handleExport = useCallback(() => {
    if (!result) {
      toast({
        title: 'No results',
        description: 'Run "Probe & Paint" first to generate results.',
        variant: 'destructive',
      });
      return;
    }

    try {
      exportMappingJSON(result, screen);
      exportMappingSummary(result, screen);
      
      toast({
        title: 'Export complete',
        description: `mapping.${screen}.json and mapping.${screen}.summary.md downloaded`,
      });
    } catch (error) {
      console.error('[AiVisionPage] Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export mapping files',
        variant: 'destructive',
      });
    }
  }, [result, screen, toast]);

  const handleRowClick = useCallback((id: string) => {
    setHighlightedId(id);
    
    // Find element and scroll into view
    const element = document.querySelector(`[data-element-id="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Clear highlight after animation
    setTimeout(() => setHighlightedId(null), 1500);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex w-full h-screen">
        {/* Left Panel - Controls & Summary */}
        <div className="w-80 border-r overflow-y-auto sticky top-0 h-screen">
          <div className="p-6 space-y-6">
            <ControlsPanel
              screen={screen}
              onScreenChange={setScreen}
              overlayEnabled={overlayEnabled}
              onOverlayToggle={toggleOverlay}
              onProbePaint={handleProbePaint}
              onExport={handleExport}
              activeFilters={activeFilters}
              onFilterToggle={toggleFilter}
              isProbing={isProbing}
            />

            <CoverageLegend result={result} />
          </div>
        </div>

        {/* Right Panel - Preview & Summary Table */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="preview" className="h-full">
            <div className="border-b px-6 py-3">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="p-6 m-0">
              <div className="relative">
                <div className="text-sm text-muted-foreground mb-4">
                  Wallet preview with overlay visualization
                </div>
                
                {/* Wallet Preview Container */}
                <div 
                  data-wallet-container
                  className="relative bg-muted/20 rounded-lg min-h-[600px] flex items-center justify-center"
                >
                  <p className="text-muted-foreground">
                    Open wallet preview in separate window or iframe
                  </p>
                </div>

                {/* Overlay */}
                <ThemeVisionOverlay screen={screen} highlightedId={highlightedId} />
              </div>
            </TabsContent>

            <TabsContent value="summary" className="p-6 m-0">
              <SummaryTable
                result={result}
                activeFilters={activeFilters}
                onRowClick={handleRowClick}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AiVisionPage;
