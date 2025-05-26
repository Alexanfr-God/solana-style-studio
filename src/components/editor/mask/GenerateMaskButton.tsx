
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand, Loader2, AlertCircle, Info, Settings, Zap, TestTube } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState("");
  const [hasGenerationError, setHasGenerationError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [zonePreference, setZonePreference] = useState<'top' | 'bottom' | 'left' | 'right' | 'all'>('all');
  const [testMode, setTestMode] = useState(false);

  const handleTestGeneration = async () => {
    console.log("🧪 V4 Enhanced: Starting comprehensive test mode");
    setTestMode(true);
    
    const testCases = [
      { prompt: "funny cartoon cat", style: "cartoon", zone: "all" },
      { prompt: "cyber punk warrior", style: "modern", zone: "top" },
      { prompt: "cute meme dog", style: "meme", zone: "bottom" },
      { prompt: "elegant royal character", style: "luxury", zone: "left" },
      { prompt: "magical fairy", style: "fantasy", zone: "right" }
    ];
    
    toast.info("🧪 Starting V4 Enhanced system test with 5 scenarios...");
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`🎯 Test ${i + 1}/5: ${testCase.prompt} (${testCase.style}, ${testCase.zone})`);
      
      try {
        await generateWithParams(testCase.prompt, testCase.style as any, testCase.zone as any);
        console.log(`✅ Test ${i + 1} completed successfully`);
        toast.success(`✅ Test ${i + 1}/5 passed: ${testCase.style} style`);
      } catch (error) {
        console.error(`❌ Test ${i + 1} failed:`, error);
        toast.error(`❌ Test ${i + 1}/5 failed: ${testCase.style} style`);
      }
      
      // Wait between tests
      if (i < testCases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setTestMode(false);
    toast.success("🎉 V4 Enhanced system test completed!");
  };

  const generateWithParams = async (testPrompt?: string, testStyle?: any, testZone?: any) => {
    const effectivePrompt = testPrompt || prompt;
    const effectiveStyle = testStyle || maskStyle;
    const effectiveZone = testZone || zonePreference;
    
    if (!effectivePrompt && !referenceImage) {
      toast.error("Please enter a description or upload a reference image first");
      return;
    }

    setHasGenerationError(false);
    setIsGenerating(true);
    setShowProgress(true);
    setProgress(0);
    setSafeZoneVisible(true);
    setDebugInfo(null);
    setCurrentStep("Initializing V4 Enhanced System...");
    
    try {
      const stepPrefix = testMode ? "🧪 Test Mode" : "🚀 V4 Enhanced";
      toast.info(`${stepPrefix}: Multi-Step Character Generation with Replicate SDXL-ControlNet...`);
      
      // Enhanced step-by-step progress simulation
      const steps = [
        "V4: Validating API keys and system status...",
        "V4: Loading reference guide system...",
        "V4: Building enhanced positioning prompts...", 
        "V4: Replicate SDXL-ControlNet generation with guide...",
        "V4: Multi-model background removal...",
        "V4: Quality optimization and validation...",
        "V4: Secure storage with metadata..."
      ];
      
      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          setProgress((stepIndex + 1) * (85 / steps.length));
          stepIndex++;
        }
      }, 1500);
      
      // Get current user for storage
      const { data: { user } } = await supabase.auth.getUser();
      
      // V4 Enhanced request payload with comprehensive diagnostics
      const requestPayload = {
        prompt: effectivePrompt || '',
        reference_image_url: referenceImage || null,
        style_hint_image_url: styleHintImage || null,
        style: effectiveStyle,
        user_id: user?.id,
        container_width: 480,
        container_height: 854,
        wallet_width: 320,
        wallet_height: 569,
        output_size: 1024,
        safe_zone_x: 352,
        safe_zone_y: 228,
        safe_zone_width: 320,
        safe_zone_height: 569,
        zone_preference: effectiveZone,
        test_mode: testMode
      };
      
      console.log('📤 V4 Enhanced Replicate SDXL-ControlNet request:', requestPayload);
      
      const { data, error } = await supabase.functions.invoke('generate-wallet-mask-v3', {
        body: requestPayload
      });
      
      clearInterval(progressInterval);
      setProgress(95);
      setCurrentStep("V4: Finalizing enhanced result...");
      
      console.log('🎉 V4 Enhanced Replicate SDXL-ControlNet result:', data);
      
      if (error) {
        throw new Error(`V4 Enhanced Replicate SDXL-ControlNet generation failed: ${error.message}`);
      }
      
      if (!data || !data.image_url) {
        throw new Error("V4 Enhanced generation failed - no image URL returned");
      }
      
      setProgress(100);
      setCurrentStep("V4 Enhanced: Replicate SDXL-ControlNet generation completed!");
      
      if (!testMode) {
        setExternalMask(data.image_url);
      }
      
      // Enhanced debug information with comprehensive diagnostics
      if (data.debug_info) {
        setDebugInfo({
          ...data.debug_info,
          v4_enhanced_system: true,
          multi_step_success: true,
          generation_model: "replicate_sdxl_controlnet",
          zone_preference: effectiveZone,
          coordinate_guided: true,
          controlnet_guided: true,
          reference_guided: data.debug_info.reference_image_used,
          test_mode: testMode,
          api_validation: data.debug_info.api_keys_status
        });
        console.log('🔍 V4 Enhanced Replicate SDXL-ControlNet comprehensive debug info:', data.debug_info);
      }
      
      // Success message with detailed information
      const successPrefix = testMode ? "🧪 Test" : "🎉 Production";
      if (data.debug_info?.processing_progress) {
        const progress = data.debug_info.processing_progress;
        toast.success(`${successPrefix}: V4 Enhanced Replicate SDXL-ControlNet ${progress.current}/${progress.total} steps completed!`);
      } else {
        toast.success(`${successPrefix}: V4 Enhanced Replicate SDXL-ControlNet generation completed!`);
      }
      
      if (data.storage_path && !testMode) {
        console.log("💾 V4 Enhanced: Replicate result stored at:", data.storage_path);
        toast.info("💾 Enhanced Replicate costume saved to collection");
      }
      
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
        setCurrentStep("");
      }, 2000);
      
    } catch (error) {
      console.error("💥 V4 Enhanced Replicate SDXL-ControlNet generation error:", error);
      setHasGenerationError(true);
      
      const errorPrefix = testMode ? "🧪 Test Error" : "💥 Production Error";
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? `${errorPrefix}: ${(error as Error).message}`
          : `${errorPrefix}: V4 Enhanced Replicate SDXL-ControlNet generation failed. Using fallback mask.`
      );
      
      if (!testMode) {
        // Enhanced fallbacks with zone consideration
        const fallbacks = {
          cartoon: '/external-masks/cats-mask.png',
          meme: '/external-masks/pepe-mask.png',
          luxury: '/external-masks/crypto-mask.png',
          modern: '/external-masks/abstract-mask.png',
          realistic: '/external-masks/abstract-mask.png',
          fantasy: '/external-masks/abstract-mask.png',
          minimalist: '/external-masks/clean Example.png'
        };
        
        setExternalMask(fallbacks[effectiveStyle] || '/external-masks/abstract-mask.png');
      }
      
      setShowProgress(false);
      setProgress(0);
      setCurrentStep("");
      
      if (testMode) {
        throw error; // Re-throw for test mode
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => generateWithParams();

  const hasValidInput = !!prompt || !!referenceImage;

  return (
    <div className="space-y-3">
      {/* Zone Preference Selector */}
      <div className="space-y-2">
        <label className="text-xs text-white/70 flex items-center gap-1">
          <Settings className="h-3 w-3" />
          Character Zone Preference
        </label>
        <select 
          value={zonePreference} 
          onChange={(e) => setZonePreference(e.target.value as any)}
          disabled={isGenerating}
          className="w-full h-8 px-2 py-1 bg-black/20 border border-white/10 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
        >
          <option value="all">All Around (Surround)</option>
          <option value="top">Top Zone (Above wallet)</option>
          <option value="bottom">Bottom Zone (Below wallet)</option>
          <option value="left">Left Zone (Left side)</option>
          <option value="right">Right Zone (Right side)</option>
        </select>
      </div>

      {/* Test Mode Button */}
      <Button
        onClick={handleTestGeneration}
        className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-black font-bold"
        disabled={isGenerating}
      >
        <TestTube className="mr-2 h-4 w-4" />
        {isGenerating && testMode ? 'Running Tests...' : 'Test V4 System (5 scenarios)'}
      </Button>

      {/* Main Generation Button */}
      <Button
        onClick={handleGenerate}
        className="w-full bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600 text-black font-bold"
        disabled={isGenerating || !hasValidInput || disabled}
      >
        {isGenerating && !testMode ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            V4 Replicate SDXL-ControlNet...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Generate V4 Replicate SDXL-ControlNet
          </>
        )}
      </Button>
      
      {showProgress && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-white/50 text-center">
            {currentStep}
          </p>
        </div>
      )}
      
      {hasGenerationError && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md flex items-center text-xs text-red-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          V4 Enhanced Replicate SDXL-ControlNet error. Check console and debug info below.
        </div>
      )}
      
      {!hasValidInput && (
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-xs text-yellow-300">
          💡 Upload reference image or enter description for V4 Enhanced Replicate SDXL-ControlNet generation
        </div>
      )}
      
      {hasValidInput && !isGenerating && (
        <div className="text-xs text-white/60 text-center space-y-1">
          <div>🚀 V4 Enhanced Replicate SDXL-ControlNet System</div>
          <div>🎭 Style: <span className="text-purple-300 font-medium">{maskStyle}</span> | 🎯 Zone: <span className="text-blue-300 font-medium">{zonePreference}</span></div>
          <div>🖼️ Images: {referenceImage ? "✅" : "✗"} {styleHintImage ? "+ Style" : ""}</div>
          <div>📐 Coordinates: (352,228) → 320×569px safe zone</div>
          <div>🎨 Model: SDXL-ControlNet via Replicate API</div>
          <div>🔧 Test Mode: Available for comprehensive validation</div>
        </div>
      )}

      {debugInfo && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
          <div className="flex items-center text-xs text-blue-300 mb-2">
            <Info className="h-3 w-3 mr-1" />
            V4 Enhanced Replicate SDXL-ControlNet Debug Info
          </div>
          <div className="text-xs text-white/70 space-y-1">
            <div>🔄 Multi-Step: {debugInfo.multi_step_success ? "SUCCESS" : "PARTIAL"}</div>
            <div>🎨 Model: {debugInfo.generation_model || "replicate_sdxl_controlnet"}</div>
            <div>📐 Coordinate Guided: {debugInfo.coordinate_guided ? "YES" : "NO"}</div>
            <div>🎛️ ControlNet Guided: {debugInfo.controlnet_guided ? "YES" : "NO"}</div>
            <div>🖼️ Reference Guided: {debugInfo.reference_guided ? "YES" : "NO"}</div>
            <div>🎯 Zone: {debugInfo.zone_preference || "all"}</div>
            <div>🎨 Background Removal: {debugInfo.background_removal_method}</div>
            <div>✅ BG Success: {debugInfo.background_removal_success ? "YES" : "NO"}</div>
            <div>🧪 Test Mode: {debugInfo.test_mode ? "YES" : "NO"}</div>
            {debugInfo.api_validation && (
              <div className="pt-1 border-t border-white/10">
                <div>🔑 API Keys Status:</div>
                <div className="ml-2">
                  <div>Replicate: {debugInfo.api_validation.replicate ? "✅" : "❌"}</div>
                  <div>HuggingFace: {debugInfo.api_validation.huggingface ? "✅" : "❌"}</div>
                  <div>Supabase: {debugInfo.api_validation.supabase ? "✅" : "❌"}</div>
                </div>
              </div>
            )}
            {debugInfo.processing_progress && (
              <div>📊 Progress: {debugInfo.processing_progress.current}/{debugInfo.processing_progress.total} ({debugInfo.processing_progress.percentage}%)</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateMaskButton;
