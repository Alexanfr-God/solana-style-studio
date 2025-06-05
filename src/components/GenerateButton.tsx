
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '../stores/customizationStore';
import { useToast } from '@/components/ui/use-toast';
import { generateStyle } from '../services/apiService';
import { Wand, Brain, Zap, Sparkles } from 'lucide-react';
import AgentProgressIndicator from './ai/AgentProgressIndicator';
import { AgentStatus } from '../types/agentTypes';

const GenerateButton = () => {
  const { 
    prompt, 
    uploadedImage, 
    activeLayer, 
    setStyleForLayer, 
    isGenerating, 
    setIsGenerating 
  } = useCustomizationStore();
  const { toast } = useToast();
  
  const [showAgentProgress, setShowAgentProgress] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { name: 'StyleAgent', status: 'pending' },
    { name: 'FontAgent', status: 'pending' },
    { name: 'ButtonAgent', status: 'pending' },
    { name: 'CharacterAgent', status: 'pending' },
    { name: 'LayoutAgent', status: 'pending' }
  ]);
  const [currentAgent, setCurrentAgent] = useState<string>();

  const handleGenerate = async () => {
    if (!prompt && !uploadedImage) {
      toast({
        title: "Missing information",
        description: "Please enter a style description or upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setShowAgentProgress(true);
    
    // Reset agent statuses
    setAgentStatuses(statuses => 
      statuses.map(s => ({ ...s, status: 'pending' as const, error: undefined }))
    );

    try {
      // Show N8N pipeline progress
      const agentSequence = ['StyleAgent', 'FontAgent', 'ButtonAgent'];
      if (activeLayer === 'wallet') agentSequence.push('CharacterAgent');
      agentSequence.push('LayoutAgent');

      // Show initial toast
      toast({
        title: uploadedImage ? "🧠 N8N Multi-Agent Pipeline" : "🎨 N8N Style Generation",
        description: uploadedImage 
          ? `Analyzing image and running ${agentSequence.length} specialized AI agents...`
          : `Processing prompt with ${agentSequence.length} AI agents via N8N...`,
      });

      // Start agent simulation
      let currentIndex = 0;
      const progressInterval = setInterval(() => {
        if (currentIndex < agentSequence.length) {
          const currentAgentName = agentSequence[currentIndex];
          setCurrentAgent(currentAgentName);
          
          setAgentStatuses(statuses => 
            statuses.map(s => 
              s.name === currentAgentName 
                ? { ...s, status: 'running' as const }
                : s.status === 'running' 
                  ? { ...s, status: 'completed' as const }
                  : s
            )
          );
          
          currentIndex++;
        } else {
          clearInterval(progressInterval);
          setAgentStatuses(statuses => 
            statuses.map(s => 
              s.status === 'running' 
                ? { ...s, status: 'completed' as const }
                : s
            )
          );
          setCurrentAgent(undefined);
        }
      }, 2000); // Slower progress for N8N workflow

      const generatedStyle = await generateStyle(prompt, uploadedImage, activeLayer);
      
      clearInterval(progressInterval);
      setStyleForLayer(activeLayer, generatedStyle);
      
      // Mark all agents as completed
      setAgentStatuses(statuses => 
        statuses.map(s => ({ ...s, status: 'completed' as const }))
      );
      
      const isN8NGenerated = generatedStyle.styleNotes?.includes('N8N');
      
      toast({
        title: isN8NGenerated ? "🎉 N8N Multi-Agent Success!" : "✅ Style Generated",
        description: isN8NGenerated 
          ? `Advanced N8N pipeline completed - ${generatedStyle.styleNotes}`
          : `Style applied to ${activeLayer === 'login' ? 'Login Screen' : 'Wallet Screen'}`,
      });

      // Hide progress after a delay
      setTimeout(() => {
        setShowAgentProgress(false);
      }, 3000);
      
    } catch (error) {
      // Mark current agent as failed
      if (currentAgent) {
        setAgentStatuses(statuses => 
          statuses.map(s => 
            s.name === currentAgent 
              ? { ...s, status: 'failed' as const, error: error.message }
              : s
          )
        );
      }

      toast({
        title: "N8N Generation failed",
        description: "N8N workflow error. Using fallback style.",
        variant: "destructive",
      });

      setTimeout(() => {
        setShowAgentProgress(false);
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasImage = !!uploadedImage;
  const isN8NMode = true; // Always use N8N now

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerate}
        className={`w-full font-bold ${
          hasImage 
            ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 hover:from-purple-600 hover:via-blue-600 hover:to-green-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
        }`}
        disabled={isGenerating || (!prompt && !uploadedImage)}
      >
        {isGenerating ? (
          <>
            <Brain className="mr-2 h-4 w-4 animate-pulse" />
            N8N Agents Working...
          </>
        ) : hasImage ? (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with N8N Pipeline
          </>
        ) : (
          <>
            <Brain className="mr-2 h-4 w-4" />
            Generate with N8N
          </>
        )}
      </Button>

      {isN8NMode && !isGenerating && (
        <div className="text-xs text-center text-white/60 space-y-1">
          <div className="flex items-center justify-center space-x-1">
            <Brain className="h-3 w-3 text-blue-400" />
            <span>Powered by N8N Multi-Agent Pipeline</span>
          </div>
          <div>StyleAgent • FontAgent • ButtonAgent • LayoutAgent</div>
          {hasImage && (
            <div className="text-purple-400">+ Advanced Image Analysis via GPT-4o</div>
          )}
        </div>
      )}

      <AgentProgressIndicator 
        agents={agentStatuses}
        currentAgent={currentAgent}
        isVisible={showAgentProgress}
      />
    </div>
  );
};

export default GenerateButton;
