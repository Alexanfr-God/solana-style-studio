
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand, Loader2, AlertCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface GenerateMaskButtonProps {
  disabled?: boolean;
}

const GenerateMaskButton = ({ disabled = false }: GenerateMaskButtonProps) => {
  const { 
    prompt, 
    referenceImage,
    styleHintImage,
    maskStyle,
    setExternalMask,
    isGenerating, 
    setIsGenerating,
    setSafeZoneVisible
  } = useMaskEditorStore();
  
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [hasGenerationError, setHasGenerationError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt && !referenceImage) {
      toast.error("Please enter a description or upload a reference image first");
      return;
    }

    setHasGenerationError(false);
    setIsGenerating(true);
    setShowProgress(true);
    setProgress(10);
    setSafeZoneVisible(true);
    setDebugInfo(null);
    
    try {
      toast.info("🚀 Generating V3 Enhanced wallet costume...");
      
      setProgress(25);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress < 85 ? newProgress : prev;
        });
      }, 2000);
      
      // Get current user for storage
      const { data: { user } } = await supabase.auth.getUser();
      
      // V3 Enhanced request payload with proper coordinate mapping
      const requestPayload = {
        prompt: prompt || '',
        reference_image_url: referenceImage || null,
        style_hint_image_url: styleHintImage || null,
        style: maskStyle,
        user_id: user?.id,
        container_width: 480,
        container_height: 854,
        wallet_width: 320,
        wallet_height: 569,
        output_size: 1024,
        safe_zone_x: 80,
        safe_zone_y: 142,
        safe_zone_width: 320,
        safe_zone_height: 569
      };
      
      console.log('📤 V3 Enhanced request:', requestPayload);
      
      const { data, error } = await supabase.functions.invoke('generate-wallet-mask-v3', {
        body: requestPayload
      });
      
      clearInterval(progressInterval);
      setProgress(95);
      
      console.log('🎉 V3 Enhanced generation result:', data);
      
      if (error) {
        throw new Error(`V3 Enhanced generation failed: ${error.message}`);
      }
      
      if (!data || !data.image_url) {
        throw new Error("Failed to generate mask - no image URL returned");
      }
      
      setProgress(100);
      setExternalMask(data.image_url);
      
      // Enhanced debug information
      if (data.debug_info) {
        setDebugInfo({
          ...data.debug_info,
          generation_success: true,
          storage_success: !!data.storage_path,
          coordinate_mapping_applied: true
        });
        console.log('🔍 V3 Enhanced debug info:', data.debug_info);
      }
      
      toast.success("🎉 V3 Enhanced wallet costume generated successfully!");
      
      if (data.storage_path) {
        console.log("💾 V3 Enhanced image stored at:", data.storage_path);
        toast.info("💾 Enhanced costume saved to your collection");
      }
      
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
      }, 1500);
      
    } catch (error) {
      console.error("💥 V3 Enhanced generation error:", error);
      setHasGenerationError(true);
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? `V3 Enhanced Error: ${(error as Error).message}`
          : "V3 Enhanced generation failed. Using fallback mask."
      );
      
      // Enhanced fallbacks
      const fallbacks = {
        cartoon: '/external-masks/cats-mask.png',
        meme: '/external-masks/pepe-mask.png',
        luxury: '/external-masks/crypto-mask.png',
        modern: '/external-masks/abstract-mask.png',
        realistic: '/external-masks/abstract-mask.png',
        fantasy: '/external-masks/abstract-mask.png',
        minimalist: '/external-masks/clean Example.png'
      };
      
      setExternalMask(fallbacks[maskStyle] || '/external-masks/abstract-mask.png');
      
      setShowProgress(false);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasValidInput = !!prompt || !!referenceImage;

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGenerate}
        className="w-full bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600 text-black font-bold"
        disabled={isGenerating || !hasValidInput || disabled}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating V3 Enhanced...
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Generate V3 Enhanced Costume
          </>
        )}
      </Button>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-white/50 text-center">
            {progress < 25 ? "🔍 V3: Analyzing layout and coordinates..." : 
             progress < 50 ? "🧠 V3: GPT-4o processing with enhanced prompts..." :
             progress < 75 ? "🎨 V3: DALL-E 3 generating with optimized specs..." : 
             progress < 90 ? "✨ V3: Applying coordinate mapping and validation..." : 
             progress < 95 ? "💾 V3: Storing in Supabase with enhanced logging..." : "🎉 V3: Finalizing enhanced result!"}
          </p>
        </div>
      )}
      
      {hasGenerationError && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md flex items-center text-xs text-red-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          V3 Enhanced generation error. Using fallback. Check console for details.
        </div>
      )}
      
      {!hasValidInput && (
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-xs text-yellow-300">
          💡 Upload a reference image or enter a description to start V3 Enhanced generation
        </div>
      )}
      
      {hasValidInput && !isGenerating && (
        <div className="text-xs text-white/60 text-center">
          🚀 V3 Enhanced Style: <span className="text-purple-300 font-medium">{maskStyle}</span> | 
          🖼️ Images: {referenceImage ? "✅" : "✗"} {styleHintImage ? "+ Style" : ""} | 
          📐 Coordinates: Container(480×854) → Output(1024×1024)
        </div>
      )}

      {debugInfo && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
          <div className="flex items-center text-xs text-blue-300 mb-2">
            <Info className="h-3 w-3 mr-1" />
            V3 Enhanced Debug Information
          </div>
          <div className="text-xs text-white/70 space-y-1">
            <div>📐 Safe Zone: x={debugInfo.safeZone?.x}, y={debugInfo.safeZone?.y}, {debugInfo.safeZone?.width}×{debugInfo.safeZone?.height}px</div>
            <div>📱 Container: {debugInfo.containerDimensions?.width || '480'}×{debugInfo.containerDimensions?.height || '854'}px</div>
            <div>🖼️ Output: {debugInfo.outputImageSize || '1024x1024'}</div>
            <div>🔄 Coordinate Mapping: {debugInfo.coordinateMapping || 'Applied'}</div>
            <div>📸 Images: {debugInfo.hasReferenceImage ? "ref" : "no-ref"}, {debugInfo.hasStyleHint ? "style" : "no-style"}</div>
            <div>📝 Prompt: {debugInfo.promptLength || 0} chars</div>
            <div>✅ Generation: {debugInfo.generation_success ? "Success" : "Failed"}</div>
            <div>💾 Storage: {debugInfo.storage_success ? "Saved" : "Not saved"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateMaskButton;
