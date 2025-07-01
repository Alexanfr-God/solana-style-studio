
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';
import ModeSelectionModal from './ModeSelectionModal';
import { EnhancedSmartEditAssistant } from './EnhancedSmartEditAssistant';
import { ElementContextDisplay } from './ElementContextDisplay';
import { useChatStore } from '@/stores/chatStore';
import { useSmartEditContext } from '@/hooks/useSmartEditContext';
import { useWalletElements, WalletElement } from '@/hooks/useWalletElements';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  walletElement?: string;
  isGenerated?: boolean;
  autoApplied?: boolean;
}

interface ChatInterfaceProps {
  selectedElementFromPreview?: string;
  onElementChange?: (element: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  selectedElementFromPreview,
  onElementChange
}) => {
  const { 
    messages, 
    isLoading, 
    chatMode,
    sessionId,
    sendMessage, 
    sendImageGenerationMessage,
    sendStyleAnalysis
  } = useChatStore();
  
  const [selectedElement, setSelectedElement] = useState<string>('');
  const { elements } = useWalletElements();
  
  const {
    selectedElement: smartEditElement,
    isEditMode,
    updateSelectedElement,
    setIsEditMode,
    getSmartSuggestions,
    contextualPrompt,
    elementHistory
  } = useSmartEditContext();

  // Update selectedElement when element is selected from preview
  React.useEffect(() => {
    if (selectedElementFromPreview) {
      setSelectedElement(selectedElementFromPreview);
      
      // Find the corresponding WalletElement for smart edit context
      const foundElement = elements.find(el => 
        el.selector === `.${selectedElementFromPreview}` || 
        el.selector === selectedElementFromPreview ||
        el.id === selectedElementFromPreview
      );
      
      if (foundElement) {
        updateSelectedElement(foundElement);
        setIsEditMode(true);
        console.log('🎯 Smart Edit context activated for:', foundElement.name);
      }
      
      console.log('🎯 Element auto-populated from preview:', selectedElementFromPreview);
    }
  }, [selectedElementFromPreview, elements, updateSelectedElement, setIsEditMode]);

  // Notify parent when element changes
  const handleElementSelect = (element: string) => {
    setSelectedElement(element);
    if (onElementChange) {
      onElementChange(element);
    }
  };

  const handleSmartSuggestionClick = (suggestion: string) => {
    console.log('🤖 Enhanced Smart suggestion clicked:', suggestion);
    
    // Create enhanced prompt with element context
    const enhancedPrompt = smartEditElement 
      ? `${suggestion}\n\nElement Context:\n${contextualPrompt}`
      : suggestion;

    // Send message based on current mode
    switch (chatMode) {
      case 'analysis':
        sendStyleAnalysis({ 
          content: enhancedPrompt, 
          analysisDepth: 'comprehensive' 
        });
        break;
      case 'leonardo':
        sendImageGenerationMessage({ content: suggestion, mode: 'leonardo' });
        break;
      case 'replicate':
        sendImageGenerationMessage({ content: suggestion, mode: 'replicate' });
        break;
      default:
        sendMessage({ 
          content: enhancedPrompt,
          walletElement: smartEditElement?.selector || selectedElement
        });
    }
  };

  const handleStarterClick = (message: string) => {
    console.log('🎯 Handling starter click for mode:', chatMode);
    
    // Enhanced message with element context if available
    const enhancedMessage = smartEditElement && chatMode === 'analysis'
      ? `${message}\n\nSelected Element: ${smartEditElement.name} (${smartEditElement.type})\n${contextualPrompt}`
      : message;
    
    switch (chatMode) {
      case 'analysis':
        sendStyleAnalysis({ content: enhancedMessage, analysisDepth: 'comprehensive' });
        break;
      case 'leonardo':
        sendImageGenerationMessage({ content: message, mode: 'leonardo' });
        break;
      case 'replicate':
        sendImageGenerationMessage({ content: message, mode: 'replicate' });
        break;
      default:
        sendMessage({ content: enhancedMessage });
    }
  };

  const getModeTitle = () => {
    const titles = {
      'analysis': 'Smart Style Analysis',
      'leonardo': 'Leonardo AI Background Generator',
      'replicate': 'Replicate Art Background Generator'
    };
    return titles[chatMode] || 'AI Assistant';
  };

  const getModeDescription = () => {
    const descriptions = {
      'analysis': smartEditElement 
        ? `Analyzing "${smartEditElement.name}" element. I'll provide contextual styling suggestions while preserving your design.`
        : "Analyze your current wallet style and apply smart improvements. I'll preserve your background while enhancing colors, typography, and effects.",
      'leonardo': "Generate stunning artistic backgrounds with Leonardo.ai. Your new background will be automatically applied to both lock and unlock screens.",
      'replicate': "Create unique art backgrounds with Replicate. Perfect for creative and meme-style designs that will transform your wallet's appearance."
    };
    return descriptions[chatMode] || "AI-powered wallet customization assistant";
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10 h-[835px] flex flex-col">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Compact Header */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {getModeTitle()}
              </h3>
              <p className="text-sm text-white/70">
                {getModeDescription()}
              </p>
            </div>
            <ModeSelectionModal />
          </div>
          
          {/* Enhanced Session Info */}
          <div className="text-xs text-white/40 mb-2">
            Session: {sessionId.split('_')[1]} | Mode: {chatMode} | Language: Auto-detect
            {smartEditElement && (
              <span className="text-purple-400 ml-2">
                | Smart Edit: Active ({elementHistory.length} history)
              </span>
            )}
          </div>
        </div>

        {/* Element Context Display */}
        <div className="flex-shrink-0 mb-3">
          <ElementContextDisplay 
            element={smartEditElement} 
            isVisible={isEditMode && !!smartEditElement} 
          />
        </div>

        {/* Enhanced Smart Edit Assistant */}
        <div className="flex-shrink-0 mb-3">
          <EnhancedSmartEditAssistant
            selectedElement={smartEditElement}
            isEditMode={isEditMode && chatMode === 'analysis'}
            onSuggestionClick={handleSmartSuggestionClick}
            elementHistory={elementHistory}
          />
        </div>
        
        {/* Expanded Message Area */}
        <div className="flex-1 min-h-0 mb-4">
          <MessageHistory 
            messages={messages} 
            isLoading={isLoading}
            onStarterClick={handleStarterClick}
            currentMode={chatMode}
          />
        </div>
        
        {/* Fixed Input Area */}
        <div className="flex-shrink-0">
          <MessageInput 
            selectedElement={selectedElement}
            onElementSelect={handleElementSelect}
            currentMode={chatMode}
          />
          
          {selectedElement && chatMode === 'analysis' && (
            <div className="mt-2 p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <p className="text-sm text-purple-300">
                Selected element: <span className="font-medium">{selectedElement}</span>
                {smartEditElement && (
                  <span className="text-green-400 ml-2">
                    ✨ Smart Edit Active | Use ↑↓ for history
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
