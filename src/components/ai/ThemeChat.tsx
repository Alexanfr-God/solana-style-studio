
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Upload, AlertCircle, CheckCircle2, Wallet, Bot, Palette, Wand2 } from 'lucide-react';
import { useExtendedWallet } from '@/context/WalletContextProvider';
import { FileUploadService } from '@/services/fileUploadService';
import { LlmPatchService, type PatchRequest } from '@/services/llmPatchService';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletElements, type WalletElement } from '@/hooks/useWalletElements';
import { useSmartEditContext } from '@/hooks/useSmartEditContext';
import { useThemeStore } from '@/state/themeStore';
import { BG_TARGETS, type BgTarget } from '@/ai/constants/backgroundTargets';
import { buildExclusiveImageOps } from '@/ai/tools/patchBuilders';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  patchApplied?: boolean;
  uploadedImageUrl?: string; // For apply buttons
}

type ChatMode = 'general' | 'element';

const ThemeChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'wallet-connected' | 'authenticated' | 'disconnected'>('checking');
  const [chatMode, setChatMode] = useState<ChatMode>('general');
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, walletProfile, isAuthenticating } = useExtendedWallet();
  const { currentLayer } = useWalletCustomizationStore();
  const { elements } = useWalletElements();
  const { selectedElement, updateSelectedElement, isEditMode, setIsEditMode } = useSmartEditContext();
  const { theme, applyPatch } = useThemeStore();

  // Authentication check
  useEffect(() => {
    console.log('🔐 Wallet auth check:', { isAuthenticated, walletProfile: !!walletProfile, isAuthenticating });
    
    if (isAuthenticated && walletProfile) {
      setAuthStatus('authenticated');
      console.log('✅ Wallet authenticated:', walletProfile.wallet_address?.slice(0, 8) + '...');
    } else if (isAuthenticating) {
      setAuthStatus('wallet-connected');
      console.log('⚠️ Wallet connecting...');
    } else {
      setAuthStatus('disconnected');
      console.log('❌ Wallet not connected');
    }
  }, [isAuthenticated, walletProfile, isAuthenticating]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (content: string, type: 'user' | 'assistant' | 'system', imageUrl?: string, patchApplied?: boolean, uploadedImageUrl?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      imageUrl,
      patchApplied,
      uploadedImageUrl
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const applyJsonPatch = async (userPrompt: string, imageUrl?: string, targetElement?: WalletElement) => {
    try {
      console.log('🎨 Applying JSON patch for theme customization');
      
      let finalPrompt = userPrompt;
      if (imageUrl) {
        finalPrompt = `${userPrompt} Use this uploaded image: ${imageUrl}`;
      }
      if (targetElement) {
        finalPrompt = `${userPrompt} Target element: ${targetElement.name} (${targetElement.type}) on ${targetElement.screen} screen`;
      }

      const patchRequest: PatchRequest = {
        themeId: 'current-theme', // Use a default theme ID
        pageId: currentLayer || 'homeLayer',
        userPrompt: finalPrompt
      };

      const result = await LlmPatchService.applyPatch(patchRequest);
      
      if (result) {
        console.log('✅ Theme updated successfully');
        toast.success('🎯 Theme updated with AI suggestions!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to apply patch:', error);
      toast.error('Failed to update theme');
      return false;
    }
  };

  const onApply = async (targetId: BgTarget['id'], imageUrl: string) => {
    if (!theme) return;
    
    const ops = buildExclusiveImageOps(targetId, imageUrl, theme);
    if (!ops.length) return;

    const patchEntry = {
      id: `img-apply-${targetId}-${Date.now()}`,
      operations: ops,
      userPrompt: `Apply uploaded image to ${targetId}`,
      pageId: 'ai-chat',
      timestamp: new Date(),
      theme: theme
    };

    console.log(`[STORE] Applied ops: ${ops.length} (img exclusive)`, { targetId, operations: ops });
    
    try {
      await applyPatch(patchEntry);
      setApplied(prev => ({ ...prev, [targetId]: true }));
      toast.success(`✅ Image applied to ${targetId}`);
    } catch (error) {
      console.error('Failed to apply patch:', error);
      toast.error('Failed to apply image');
    }
  };

  const getElementSuggestions = (element: WalletElement) => {
    const elementType = element.type;
    const elementName = element.name;

    switch (elementType) {
      case 'button':
        return [
          `Add purple gradient to ${elementName}`,
          `Make ${elementName} glow on hover`,
          `Round corners of ${elementName}`,
          `Add shadow to ${elementName}`
        ];
      case 'text':
        return [
          `Make ${elementName} bold and larger`,
          `Add gradient effect to ${elementName}`,
          `Change ${elementName} to modern font`,
          `Center align ${elementName}`
        ];
      case 'icon':
        return [
          `Colorize ${elementName} with theme`,
          `Make ${elementName} larger`,
          `Add animation to ${elementName}`,
          `Apply gradient to ${elementName}`
        ];
      default:
        return [
          `Style ${elementName} with modern design`,
          `Add visual effects to ${elementName}`,
          `Make ${elementName} more prominent`,
          `Apply theme colors to ${elementName}`
        ];
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsProcessing(true);

    try {
      // Apply JSON patch for theme customization
      const patchApplied = await applyJsonPatch(userMessage, undefined, selectedElement);
      
      // Generate AI response
      let aiResponse = '';
      if (chatMode === 'element' && selectedElement) {
        aiResponse = patchApplied 
          ? `I've updated the "${selectedElement.name}" ${selectedElement.type} on the ${selectedElement.screen} screen according to your request. The changes should be visible in the preview.`
          : `I received your request for the "${selectedElement.name}" element. Try being more specific about the styling you want, like "make it purple" or "add shadow effect".`;
      } else {
        aiResponse = patchApplied 
          ? `I've analyzed your request and updated the wallet theme accordingly. The changes should be visible in the preview.`
          : `I received your message: "${userMessage}". I can help you customize your wallet theme. Try uploading an image or asking for specific styling changes.`;
      }
      
      addMessage(aiResponse, 'assistant', undefined, patchApplied);
      
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('Sorry, I encountered an error processing your request. Please try again.', 'assistant');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check wallet authentication
    if (authStatus !== 'authenticated' || !walletProfile) {
      toast.error('Please connect and authenticate your wallet first');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Please select an image under 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('📤 Starting image upload:', {
        fileName: file.name,
        size: file.size,
        walletProfileId: walletProfile.id
      });

      const result = await FileUploadService.uploadImageFromFile(
        file,
        walletProfile.id,
        'theme-chat-images'
      );

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('✅ Image uploaded successfully:', result.url);

      // Add image message to chat
      addMessage(`Uploaded image: ${file.name}`, 'user', result.url);

      toast.success('🎯 Image uploaded successfully!');

      // Add system message with apply buttons
      addMessage('', 'system', undefined, undefined, result.url);

    } catch (error) {
      console.error('💥 Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getAuthStatusDisplay = () => {
    switch (authStatus) {
      case 'checking':
        return { icon: AlertCircle, text: 'Checking...', color: 'text-yellow-500' };
      case 'wallet-connected':
        return { icon: AlertCircle, text: 'Wallet connecting...', color: 'text-yellow-500' };
      case 'authenticated':
        return { icon: CheckCircle2, text: 'Wallet authenticated', color: 'text-green-500' };
      case 'disconnected':
        return { icon: Wallet, text: 'Connect wallet to upload', color: 'text-red-500' };
    }
  };

  const statusDisplay = getAuthStatusDisplay();

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Theme Assistant</h3>
        </div>
        
        {/* Mode Selector */}
        <div className="flex gap-2 mb-2">
          <Button
            variant={chatMode === 'general' ? "default" : "ghost"}
            size="sm"
            onClick={() => setChatMode('general')}
            className="h-7 px-2 text-xs"
          >
            <Palette className="h-3 w-3 mr-1" />
            General Theme
          </Button>
          <Button
            variant={chatMode === 'element' ? "default" : "ghost"}
            size="sm"
            onClick={() => setChatMode('element')}
            className="h-7 px-2 text-xs"
          >
            <Wand2 className="h-3 w-3 mr-1" />
            Element Edit
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <statusDisplay.icon className={`h-4 w-4 ${statusDisplay.color}`} />
          <span className={`text-sm ${statusDisplay.color}`}>
            {statusDisplay.text}
          </span>
        </div>
        {walletProfile && (
          <div className="text-xs text-white/60 mt-1">
            {walletProfile.wallet_address?.slice(0, 8)}...{walletProfile.wallet_address?.slice(-6)}
          </div>
        )}
        <div className="text-xs text-purple-300 mt-1">
          Mode: {chatMode === 'general' ? 'General Theme Changes' : 'Element Editing'} | Layer: {currentLayer || 'homeLayer'}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/60 py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">AI Theme Assistant</p>
              <p className="text-sm mb-4">
                {chatMode === 'general' 
                  ? 'Upload images or describe changes to customize your wallet theme'
                  : 'Select elements and apply specific styling changes'
                }
              </p>
              <div className="text-xs text-white/40 space-y-1">
                {chatMode === 'general' ? (
                  <>
                    <p>• "Make the background darker"</p>
                    <p>• "Change button colors to blue"</p>
                    <p>• "Upload an image → Auto-apply as background"</p>
                  </>
                ) : (
                  <>
                    <p>• Click on wallet elements to select them</p>
                    <p>• "Add purple gradient to this button"</p>
                    <p>• "Make this text larger and bold"</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Element suggestions for element mode */}
          {chatMode === 'element' && selectedElement && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="p-3">
                <div className="text-xs text-purple-300 mb-2">
                  Selected: {selectedElement.name} ({selectedElement.type}) - {selectedElement.screen}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {getElementSuggestions(selectedElement).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="h-auto p-2 text-left justify-start text-xs text-white/80 hover:text-white border border-purple-500/20"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <CardContent className="p-3">
                  {message.imageUrl && (
                    <img 
                      src={message.imageUrl} 
                      alt="Uploaded" 
                      className="w-full max-w-sm rounded mb-2 object-cover"
                    />
                  )}
                  
                  {/* System message with apply buttons */}
                  {message.type === 'system' && message.uploadedImageUrl && (
                    <div className="rounded-lg border border-purple-500/30 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                      <div className="mb-2 text-sm text-white">Image uploaded. Choose where to apply:</div>
                      <div className="flex flex-wrap gap-2">
                        {BG_TARGETS.filter(t => t.id !== 'ALL').map(t => (
                          <Button
                            key={t.id}
                            onClick={() => onApply(t.id, message.uploadedImageUrl!)}
                            disabled={applied[t.id]}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs bg-white/5 border-white/20 hover:bg-white/10 disabled:opacity-50"
                          >
                            {applied[t.id] ? `Applied: ${t.label}` : `Apply: ${t.label}`}
                          </Button>
                        ))}
                        <Button
                          onClick={() => onApply('ALL', message.uploadedImageUrl!)}
                          disabled={applied['ALL']}
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 disabled:opacity-50 font-medium"
                        >
                          {applied['ALL'] ? 'Applied: ALL' : 'Apply: ALL'}
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-white/60">
                        Note: when an image is applied, backgroundColor is cleared ("").
                      </div>
                    </div>
                  )}
                  
                  {message.content && (
                    <p className="text-white text-sm">{message.content}</p>
                  )}
                  
                  {message.type !== 'system' && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-white/40 text-xs">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      {message.patchApplied && (
                        <div className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Applied to theme
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={authStatus === 'authenticated' ? "Ask me to customize your wallet..." : "Connect wallet first..."}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
              disabled={isProcessing || isAuthenticating}
            />
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || authStatus !== 'authenticated'}
            variant="outline"
            size="icon"
            className="bg-white/5 border-white/20 hover:bg-white/10 disabled:opacity-50"
            title="Upload image"
          >
            <Upload className={`h-4 w-4 ${isUploading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing || isAuthenticating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeChat;
