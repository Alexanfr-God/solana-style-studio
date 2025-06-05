
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '../stores/customizationStore';
import { useToast } from '@/components/ui/use-toast';
import { generateStyle } from '../services/apiService';
import { Wand, Brain, Zap } from 'lucide-react';
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
    if (!prompt) {
      toast({
        title: "Missing description",
        description: "Please enter a style description first",
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
      // Simulate agent progress updates
      const agentSequence = ['StyleAgent', 'FontAgent', 'ButtonAgent'];
      if (activeLayer === 'wallet') agentSequence.push('CharacterAgent');
      agentSequence.push('LayoutAgent');

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
      }, 1500);

      const generatedStyle = await generateStyle(prompt, uploadedImage, activeLayer);
      
      clearInterval(progressInterval);
      setStyleForLayer(activeLayer, generatedStyle);
      
      // Mark all agents as completed
      setAgentStatuses(statuses => 
        statuses.map(s => ({ ...s, status: 'completed' as const }))
      );
      
      toast({
        title: "🎨 AI Multi-Agent Style Generated",
        description: `Enhanced style applied to ${activeLayer === 'login' ? 'Login Screen' : 'Wallet Screen'} using ${agentSequence.length} specialized agents`,
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
        title: "Generation failed",
        description: "Failed to generate style. Please try again.",
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
  const isEnhanced = hasImage; // Enhanced mode when image is provided

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerate}
        className={`w-full font-bold ${
          isEnhanced 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
        }`}
        disabled={isGenerating || !prompt}
      >
        {isGenerating ? (
          <>
            <Brain className="mr-2 h-4 w-4 animate-pulse" />
            AI Agents Working...
          </>
        ) : isEnhanced ? (
          <>
            <Brain className="mr-2 h-4 w-4" />
            Generate Enhanced Style
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Generate Style
          </>
        )}
      </Button>

      {isEnhanced && !isGenerating && (
        <div className="text-xs text-center text-white/60 space-y-1">
          <div className="flex items-center justify-center space-x-1">
            <Brain className="h-3 w-3 text-purple-400" />
            <span>Enhanced mode: Uses specialized AI agents</span>
          </div>
          <div>StyleAgent • FontAgent • ButtonAgent • LayoutAgent</div>
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
