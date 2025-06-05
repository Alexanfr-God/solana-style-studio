
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image, Webhook, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { analyzeImageWithBlueprint, type StyleBlueprint } from '@/services/styleBlueprintService';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const ImageUploadSection = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<StyleBlueprint | null>(null);

  const { applyStyleFromBlueprint } = useWalletCustomizationStore();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
        toast.success('Image uploaded');
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Error uploading image');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error processing file');
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    toast.info('Image removed');
  };

  const handleAnalyzeImage = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeImageWithBlueprint(
        uploadedImage,
        additionalContext || undefined,
        undefined, // wallet blueprint - можно добавить позже
        webhookUrl || undefined
      );

      setAnalysisResult(result.styleBlueprint);
      
      toast.success(`StyleBlueprint created: ${result.styleBlueprint.meta.title}`, {
        description: `Theme: ${result.styleBlueprint.meta.theme} | Confidence: ${result.styleBlueprint.meta.confidenceScore}`
      });

      if (webhookUrl) {
        toast.info('Webhook sent to n8n workflow');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToWallet = () => {
    if (!analysisResult) {
      toast.error('No analysis result to apply');
      return;
    }

    try {
      applyStyleFromBlueprint(analysisResult);
      toast.success('StyleBlueprint applied to wallet!', {
        description: `Applied ${analysisResult.meta.theme} theme`
      });
    } catch (error) {
      toast.error('Failed to apply style to wallet');
    }
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              AI StyleBlueprint v2 Generator
            </h2>
            <p className="text-gray-400 text-sm">
              Advanced AI analysis for Web3 wallet customization
            </p>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-4">
            {!uploadedImage ? (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  ) : (
                    <Upload className="w-12 h-12 text-white/60" />
                  )}
                  <div className="text-white/80">
                    <p className="font-medium">
                      {isUploading ? 'Uploading...' : 'Upload Image for Analysis'}
                    </p>
                    <p className="text-sm text-white/60 mt-1">
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                  <Image className="w-3 h-3 inline mr-1" />
                  Ready for StyleBlueprint analysis
                </div>
              </div>
            )}
          </div>

          {/* Additional Context Input */}
          <div className="space-y-2">
            <Label htmlFor="context" className="text-white text-sm">
              Additional Context (Optional)
            </Label>
            <Input
              id="context"
              placeholder="e.g., Target audience: DeFi traders, Style preference: minimalist..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>

          {/* Webhook URL for n8n */}
          <div className="space-y-2">
            <Label htmlFor="webhook" className="text-white text-sm flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              n8n Webhook URL (Optional)
            </Label>
            <Input
              id="webhook"
              placeholder="https://your-n8n-instance.com/webhook/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>

          {/* Analysis Button */}
          <Button
            onClick={handleAnalyzeImage}
            disabled={!uploadedImage || isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analyzing with GPT-4o Vision...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate StyleBlueprint v2
              </>
            )}
          </Button>

          {/* Analysis Result */}
          {analysisResult && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-2">
                ✅ StyleBlueprint Generated
              </h4>
              <div className="text-green-200 text-sm space-y-1 mb-4">
                <p><strong>Title:</strong> {analysisResult.meta.title}</p>
                <p><strong>Theme:</strong> {analysisResult.meta.theme}</p>
                <p><strong>Vibe:</strong> {analysisResult.mood.vibe}</p>
                <p><strong>Confidence:</strong> {Math.round(analysisResult.meta.confidenceScore * 100)}%</p>
                <p><strong>Colors:</strong> {analysisResult.colorSystem.primary}, {analysisResult.colorSystem.accent.join(', ')}</p>
              </div>
              <Button
                onClick={handleApplyToWallet}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Apply to Wallet
              </Button>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <h4 className="text-blue-300 font-medium mb-2 text-sm">
              🚀 StyleBlueprint v2 Features
            </h4>
            <div className="text-blue-200 text-xs space-y-1">
              <p>• Advanced GPT-4o Vision analysis</p>
              <p>• Multi-agent architecture ready</p>
              <p>• n8n workflow integration</p>
              <p>• Web3 wallet optimization</p>
              <p>• Professional design metrics</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
