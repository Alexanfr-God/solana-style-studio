import React, { useEffect, useState } from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { Sparkles } from 'lucide-react';

export const AiCommentaryPanel = () => {
  const { currentElement, scanMode, isScanning } = useAiScannerStore();
  const [commentary, setCommentary] = useState<string>('');
  
  useEffect(() => {
    // Generate contextual commentary based on scan mode and current element
    if (isScanning) {
      switch (scanMode) {
        case 'vision':
          setCommentary('🟢 Analyzing DOM structure and identifying interactive elements...');
          break;
        case 'snapshot':
          setCommentary('🔵 Capturing computed styles and visual metrics from rendered elements...');
          break;
        case 'json-build':
          setCommentary('🟣 Mapping discovered elements to theme JSON paths using pattern matching...');
          break;
        case 'verify':
          setCommentary('✅ Validating all mappings against the theme schema...');
          break;
      }
    } else if (currentElement) {
      // Element-specific commentary
      const { type, role, metrics } = currentElement;
      
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
    } else {
      setCommentary('Select an element or start a scan to see AI analysis...');
    }
  }, [scanMode, currentElement, isScanning]);
  
  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">AI Commentary</h4>
      </div>
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm text-foreground/80 leading-relaxed">
          {commentary}
        </p>
      </div>
    </div>
  );
};
