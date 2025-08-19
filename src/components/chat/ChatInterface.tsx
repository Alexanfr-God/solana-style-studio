import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, MessageSquare, Palette, Settings, Sparkles, Image, X, GitCompare } from 'lucide-react';
import { useChatStore, ChatMode } from '@/stores/chatStore';
import { WALLET_ELEMENTS_REGISTRY } from '@/components/wallet/WalletElementsRegistry';
import { FLAGS } from '@/config/featureFlags';
import MessageInput from './MessageInput';
import MessageHistory from './MessageHistory';
import ModeSelector from './ModeSelector';
import ElementSelector from './ElementSelector';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  isGenerated?: boolean;
  autoApplied?: boolean;
  walletElement?: string;
  isPatchPreview?: boolean;
  patchOperations?: any[];
}

interface ChatInterfaceProps {
  className?: string;
  // Theme patch specific props
  themeId?: string;
  pageId?: string;
  presetId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  className = '',
  themeId,
  pageId = 'global',
  presetId
}) => {
  const [selectedElement, setSelectedElement] = useState('');
  const [isElementSelectorOpen, setIsElementSelectorOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading, 
    chatMode, 
    setChatMode, 
    clearHistory,
    isPreviewMode,
    getChangedPaths
  } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleModeChange = (mode: ChatMode) => {
    setChatMode(mode);
    console.log('🎛️ Chat mode changed to:', mode);
  };

  const handleStarterClick = (message: string) => {
    // This will be handled by MessageInput when it's implemented
    console.log('Starter clicked:', message);
  };

  const getAvailableModes = (): { mode: ChatMode; label: string; icon: React.ReactNode; description: string }[] => {
    const baseModes = [
      {
        mode: 'analysis' as ChatMode,
        label: 'Style Analysis',
        icon: <Brain className="h-4 w-4" />,
        description: 'Analyze and improve wallet styling'
      }
    ];

    // Add theme-patch mode if themeId is provided
    if (themeId) {
      baseModes.push({
        mode: 'theme-patch' as ChatMode,
        label: 'Theme Patch',
        icon: <Palette className="h-4 w-4" />,
        description: 'Apply JSON patches to theme'
      });
    }

    // Add image generation modes based on feature flags
    if (FLAGS.ASSETS_ENABLED) {
      baseModes.push(
        {
          mode: 'leonardo' as ChatMode,
          label: 'Leonardo AI',
          icon: <Image className="h-4 w-4" />,
          description: 'Generate backgrounds with Leonardo.ai'
        },
        {
          mode: 'replicate' as ChatMode,
          label: 'Replicate',
          icon: <Sparkles className="h-4 w-4" />,
          description: 'Create artistic backgrounds with Replicate'
        }
      );
    }

    return baseModes;
  };

  const availableModes = getAvailableModes();
  const changedPaths = getChangedPaths();

  return (
    <Card className={`bg-black/20 backdrop-blur-md border-white/10 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            AI Assistant
            {isPreviewMode && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                Preview ({changedPaths.length} changes)
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Compare button for theme-patch mode */}
            {chatMode === 'theme-patch' && isPreviewMode && (
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white/80 hover:text-white"
                onClick={() => {
                  // TODO: Implement compare functionality
                  console.log('🔍 Compare changes:', changedPaths);
                }}
              >
                <GitCompare className="h-4 w-4 mr-1" />
                Compare
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="border-white/20 text-white/80 hover:text-white"
            >
              Clear
            </Button>
          </div>
        </div>

        <p className="text-sm text-white/70">
          {chatMode === 'theme-patch' 
            ? 'Send theme modification requests to generate JSON patches'
            : 'Get help with wallet styling, design, and customization'
          }
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mode Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Settings className="h-4 w-4" />
            Mode Selection:
          </div>
          <ModeSelector
            currentMode={chatMode}
            onModeChange={handleModeChange}
            availableModes={availableModes}
          />
        </div>

        <Separator className="bg-white/10" />

        {/* Element Selector - only show for non-theme-patch modes and when ICON_LIB_ENABLED */}
        {chatMode !== 'theme-patch' && FLAGS.ICON_LIB_ENABLED && (
          <>
            <ElementSelector
              selectedElement={selectedElement}
              onElementSelect={setSelectedElement}
              isOpen={isElementSelectorOpen}
              onToggle={() => setIsElementSelectorOpen(!isElementSelectorOpen)}
              elements={WALLET_ELEMENTS_REGISTRY}
            />
            <Separator className="bg-white/10" />
          </>
        )}

        {/* Message History */}
        <div className="h-64 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <MessageHistory 
            messages={messages} 
            isLoading={isLoading}
            onStarterClick={handleStarterClick}
          />
          <div ref={messagesEndRef} />
        </div>

        <Separator className="bg-white/10" />

        {/* Message Input */}
        <MessageInput
          selectedElement={selectedElement}
          onElementSelect={setSelectedElement}
          currentMode={chatMode}
          themeId={themeId}
          pageId={pageId}
          presetId={presetId}
        />
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
