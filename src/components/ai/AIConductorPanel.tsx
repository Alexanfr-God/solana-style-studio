
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Brain, 
  Sparkles, 
  Wand2, 
  Eye, 
  Palette, 
  Bot,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import AIConductorService, { type ConductorResponse } from '@/services/aiConductorService';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

interface AIConductorPanelProps {
  imageUrl?: string;
  onStyleGenerated?: (response: ConductorResponse) => void;
}

const AIConductorPanel: React.FC<AIConductorPanelProps> = ({ 
  imageUrl, 
  onStyleGenerated 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [response, setResponse] = useState<ConductorResponse | null>(null);
  const [preferences, setPreferences] = useState({
    style: 'modern',
    mood: 'professional',
    complexity: 'medium',
    aiPetPersonality: 'friendly'
  });

  const { setAiPetEmotion, setWalletStyle } = useWalletCustomizationStore();

  const processingSteps = [
    { icon: Brain, label: 'Strategic Planning', description: 'AI Conductor analyzing requirements' },
    { icon: Eye, label: 'Visual Analysis', description: 'Deep image and style analysis' },
    { icon: Palette, label: 'Style Generation', description: 'Creating wallet components style' },
    { icon: Bot, label: 'AI Pet Integration', description: 'Configuring AI Pet personality' },
    { icon: CheckCircle, label: 'Finalization', description: 'Assembling final result' }
  ];

  const handleRunConductor = async () => {
    if (!prompt && !imageUrl) {
      toast.error('Please provide either a prompt or upload an image');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(0);
    setResponse(null);

    try {
      // Симуляция пошагового прогресса
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < processingSteps.length - 1) {
            return prev + 1;
          }
          clearInterval(stepInterval);
          return prev;
        });
      }, 2000);

      const conductorResponse = await AIConductorService.runConductor({
        imageUrl,
        prompt: prompt || 'Create a modern wallet style',
        targetLayer: 'global',
        preferences,
        userId: 'current-user'
      });

      clearInterval(stepInterval);
      setCurrentStep(processingSteps.length - 1);
      setResponse(conductorResponse);

      if (conductorResponse.success) {
        // Применяем сгенерированный стиль
        if (conductorResponse.styleResult) {
          setWalletStyle(conductorResponse.styleResult);
        }

        // Настраиваем AI Pet
        const aiPetConfig = AIConductorService.createAIPetConfig(conductorResponse);
        setAiPetEmotion(aiPetConfig.emotion);

        toast.success('🎉 AI Conductor completed successfully!');
        onStyleGenerated?.(conductorResponse);
      } else {
        toast.error('AI Conductor failed: ' + conductorResponse.error);
      }

    } catch (error) {
      console.error('Error running AI Conductor:', error);
      toast.error('Failed to run AI Conductor');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="space-y-3">
      {processingSteps.map((step, index) => {
        const IconComponent = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep && isProcessing;

        return (
          <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg ${
            isActive ? 'bg-purple-500/20 border border-purple-500/30' : 
            isCompleted ? 'bg-green-500/20 border border-green-500/30' : 
            'bg-gray-500/10'
          }`}>
            <div className={`p-2 rounded-full ${
              isCompleted ? 'bg-green-500' :
              isActive ? 'bg-purple-500' : 'bg-gray-500'
            }`}>
              <IconComponent className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className={`font-medium ${
                isActive || isCompleted ? 'text-white' : 'text-gray-400'
              }`}>
                {step.label}
                {isCurrent && <Clock className="inline h-4 w-4 ml-2 animate-spin" />}
                {isCompleted && <CheckCircle className="inline h-4 w-4 ml-2 text-green-400" />}
              </div>
              <div className="text-xs text-gray-400">{step.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderResults = () => {
    if (!response) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold text-white">AI Conductor Results</h3>
        </div>

        {response.success ? (
          <div className="space-y-3">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              ✅ Successfully Generated
            </Badge>
            
            {response.nextSteps && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <h4 className="font-medium text-blue-300 mb-2">Next Steps:</h4>
                <ul className="space-y-1">
                  {response.nextSteps.map((step, index) => (
                    <li key={index} className="text-blue-200 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {response.recommendations && response.recommendations.styleImprovements && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <h4 className="font-medium text-purple-300 mb-2">AI Recommendations:</h4>
                <div className="text-purple-200 text-sm space-y-1">
                  {response.recommendations.styleImprovements.slice(0, 3).map((improvement: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Wand2 className="h-3 w-3" />
                      {improvement}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span>Error: {response.error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Conductor v1.0
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Advanced AI orchestrator for wallet style generation
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Настройки предпочтений */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Style</label>
            <select 
              value={preferences.style}
              onChange={(e) => setPreferences(prev => ({...prev, style: e.target.value}))}
              className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-white text-sm"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="futuristic">Futuristic</option>
              <option value="minimalist">Minimalist</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Mood</label>
            <select 
              value={preferences.mood}
              onChange={(e) => setPreferences(prev => ({...prev, mood: e.target.value}))}
              className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-white text-sm"
            >
              <option value="professional">Professional</option>
              <option value="playful">Playful</option>
              <option value="elegant">Elegant</option>
              <option value="energetic">Energetic</option>
            </select>
          </div>
        </div>

        {/* Промт для AI */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">
            Describe your vision (optional)
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the style you want for your wallet... (e.g., 'cyberpunk neon colors with dark theme' or 'elegant gold and black luxury design')"
            className="bg-black/40 border-white/20 text-white placeholder-gray-500"
            rows={3}
            disabled={isProcessing}
          />
        </div>

        {/* Статус изображения */}
        {imageUrl && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Image uploaded and ready for analysis</span>
            </div>
          </div>
        )}

        {/* Прогресс */}
        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400 animate-pulse" />
              <span className="text-purple-300 text-sm font-medium">AI Conductor is working...</span>
            </div>
            <Progress value={(currentStep / (processingSteps.length - 1)) * 100} className="h-2" />
            {renderStepIndicator()}
          </div>
        )}

        {/* Результаты */}
        {response && renderResults()}

        {/* Кнопка запуска */}
        <Button
          onClick={handleRunConductor}
          disabled={isProcessing || (!prompt && !imageUrl)}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {isProcessing ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-pulse" />
              AI Conductor Running...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Run AI Conductor
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIConductorPanel;
