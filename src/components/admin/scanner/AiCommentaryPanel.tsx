import React, { useEffect, useState } from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AiCommentaryPanel = () => {
  const { currentElement, scanMode, isScanning } = useAiScannerStore();
  const [commentary, setCommentary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Generate contextual commentary based on scan mode
    if (isScanning) {
      switch (scanMode) {
        case 'vision':
          setCommentary('🟢 Analyzing DOM structure and identifying interactive elements using AI vision patterns...');
          break;
        case 'snapshot':
          setCommentary('🔵 Capturing computed styles and visual metrics from rendered elements in real-time...');
          break;
        case 'json-build':
          setCommentary('🟣 Mapping discovered elements to theme JSON paths using intelligent pattern matching...');
          break;
        case 'verify':
          setCommentary('✅ Validating all mappings against the theme schema to ensure accuracy...');
          break;
      }
    } else if (currentElement) {
      // Fetch AI commentary for the selected element
      fetchAiCommentary(currentElement);
    } else {
      setCommentary('Select an element or start a scan to see AI analysis...');
    }
  }, [scanMode, currentElement, isScanning]);
  
  const fetchAiCommentary = async (element: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-element-commentary', {
        body: { element }
      });
      
      if (error) throw error;
      
      setCommentary(data.commentary || 'AI analysis completed.');
    } catch (error) {
      console.error('[AiCommentary] Error fetching commentary:', error);
      // Fallback to simple commentary
      generateSimpleCommentary(element);
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateSimpleCommentary = (element: any) => {
    const { type, role, metrics } = element;
    
    if (type === 'button') {
      setCommentary(
        `This ${role} appears to be an interactive button. ` +
        (metrics?.radius !== '0px' && metrics?.radius !== 'none'
          ? `The rounded corners (${metrics.radius}) suggest modern UI design.`
          : 'Sharp corners indicate a more utilitarian design.')
      );
    } else if (type === 'input') {
      setCommentary(
        `Text input field detected. ` +
        (metrics?.bg 
          ? 'Background styling suggests this is a prominent input element.'
          : 'Transparent background indicates a minimalist approach.')
      );
    } else if (type === 'icon') {
      setCommentary(
        `Icon element identified. Icons enhance visual hierarchy and user understanding.`
      );
    } else {
      setCommentary(
        `Element type: ${type}. Role: ${role}. ` +
        (metrics ? `Dimensions: ${metrics.width}×${metrics.height}px.` : '')
      );
    }
  };
  
  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">AI Commentary</h4>
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>
      <div className="p-3 bg-muted/50 rounded-lg min-h-[80px] flex items-center">
        <p className="text-sm text-foreground/80 leading-relaxed">
          {commentary}
        </p>
      </div>
    </div>
  );
};
