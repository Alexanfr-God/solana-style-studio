
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand, Loader2, AlertCircle, Settings, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface GenerateMaskButtonProps {
  disabled?: boolean;
}

const GenerateMaskButton = ({ disabled = false }: GenerateMaskButtonProps) => {
  const { 
    prompt, 
    referenceImage,
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
  const [zonePreference, setZonePreference] = useState<'top' | 'bottom' | 'left' | 'right' | 'all'>('all');

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a character description first");
      return;
    }

    setHasGenerationError(false);
    setIsGenerating(true);
    setShowProgress(true);
    setProgress(0);
    setSafeZoneVisible(true);
    setCurrentStep("Starting AI generation...");
    
    try {
      toast.info("🎨 Creating your wallet costume...");
      
      // Симуляция прогресса
      const steps = [
        "Analyzing your description...",
        "Selecting art style...", 
        "Generating character with AI...",
        "Positioning around wallet...",
        "Finalizing artwork..."
      ];
      
      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          setProgress((stepIndex + 1) * (80 / steps.length));
          stepIndex++;
        }
      }, 1000);
      
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      
      // Запрос к Edge Function
      const requestPayload = {
        prompt: prompt,
        reference_image_url: referenceImage || null,
        style: maskStyle,
        user_id: user?.id,
        zone_preference: zonePreference
      };
      
      console.log('📤 Sending generation request:', requestPayload);
      
      const { data, error } = await supabase.functions.invoke('generate-wallet-mask-v3', {
        body: requestPayload
      });
      
      clearInterval(progressInterval);
      setProgress(95);
      setCurrentStep("Applying to wallet...");
      
      console.log('🎉 Generation result:', data);
      
      if (error) {
        throw new Error(`Generation failed: ${error.message}`);
      }
      
      if (!data || !data.image_url) {
        throw new Error("Generation failed - no image URL returned");
      }
      
      setProgress(100);
      setCurrentStep("Complete!");
      
      setExternalMask(data.image_url);
      
      toast.success("🎉 Wallet costume created successfully!");
      
      if (data.storage_path) {
        console.log("💾 Costume saved to collection:", data.storage_path);
        toast.info("💾 Costume saved to your collection");
      }
      
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
        setCurrentStep("");
      }, 2000);
      
    } catch (error) {
      console.error("💥 Generation error:", error);
      setHasGenerationError(true);
      
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? `${(error as Error).message}`
          : "Generation failed. Please try again."
      );
      
      setShowProgress(false);
      setProgress(0);
      setCurrentStep("");
    } finally {
      setIsGenerating(false);
    }
  };

  const hasValidInput = !!prompt;

  return (
    <div className="space-y-3">
      {/* Zone Preference Selector */}
      <div className="space-y-2">
        <label className="text-xs text-white/70 flex items-center gap-1">
          <Settings className="h-3 w-3" />
          Character Position
        </label>
        <select 
          value={zonePreference} 
          onChange={(e) => setZonePreference(e.target.value as any)}
          disabled={isGenerating}
          className="w-full h-8 px-2 py-1 bg-black/20 border border-white/10 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
        >
          <option value="all">All Around Wallet</option>
          <option value="top">Above Wallet</option>
          <option value="bottom">Below Wallet</option>
          <option value="left">Left Side</option>
          <option value="right">Right Side</option>
        </select>
      </div>

      {/* Main Generation Button */}
      <Button
        onClick={handleGenerate}
        className="w-full bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600 text-black font-bold"
        disabled={isGenerating || !hasValidInput || disabled}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Costume...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Generate Wallet Costume
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
          Generation error. Please try again with a different description.
        </div>
      )}
      
      {!hasValidInput && (
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-xs text-yellow-300">
          💡 Enter a character description to start generating
        </div>
      )}
      
      {hasValidInput && !isGenerating && (
        <div className="text-xs text-white/60 text-center space-y-1">
          <div>🎨 Style: <span className="text-purple-300 font-medium">{maskStyle}</span></div>
          <div>📍 Position: <span className="text-blue-300 font-medium">{zonePreference}</span></div>
          <div>🖼️ Reference: {referenceImage ? "✅ Custom image" : "⚪ Default guide"}</div>
        </div>
      )}
    </div>
  );
};

export default GenerateMaskButton;
