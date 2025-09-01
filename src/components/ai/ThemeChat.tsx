
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Upload, Image, AlertCircle, CheckCircle2, Wallet, Bot } from 'lucide-react';
import { useExtendedWallet } from '@/context/WalletContextProvider';
import { FileUploadService } from '@/services/fileUploadService';
import { LlmPatchService, type PatchRequest } from '@/services/llmPatchService';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  patchApplied?: boolean;
}

const ThemeChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'wallet-connected' | 'authenticated' | 'disconnected'>('checking');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, walletProfile, isAuthenticating } = useExtendedWallet();
  const { selectedThemeId, currentLayer } = useWalletCustomizationStore();

  // Simplified authentication check - only use wallet profile
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

  const addMessage = (content: string, type: 'user' | 'assistant', imageUrl?: string, patchApplied?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      imageUrl,
      patchApplied
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const applyJsonPatch = async (userPrompt: string, imageUrl?: string) => {
    if (!selectedThemeId) {
      toast.error('No theme selected for editing');
      return false;
    }

    try {
      console.log('🎨 Applying JSON patch for theme customization');
      
      const patchRequest: PatchRequest = {
        themeId: selectedThemeId,
        pageId: currentLayer || 'homeLayer',
        userPrompt: imageUrl ? `${userPrompt} Use this uploaded image: ${imageUrl}` : userPrompt
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsProcessing(true);

    try {
      // Apply JSON patch for theme customization
      const patchApplied = await applyJsonPatch(userMessage);
      
      // Generate AI response
      const aiResponse = patchApplied 
        ? `I've analyzed your request and updated the wallet theme accordingly. The changes should be visible in the preview. ${userMessage.includes('background') ? 'Background styling has been applied.' : 'Theme styling has been updated.'}`
        : `I received your message: "${userMessage}". I can help you customize your wallet theme. Try uploading an image or asking for specific styling changes like "make the background darker" or "change button colors to blue".`;
      
      addMessage(aiResponse, 'assistant', undefined, patchApplied);
      
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('Sorry, I encountered an error processing your request. Please try again.', 'assistant');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check wallet authentication
    if (authStatus !== 'authenticated' || !walletProfile) {
      toast.error('Please connect and authenticate your wallet first');
      console.log('❌ Upload blocked - auth status:', authStatus, 'walletProfile:', !!walletProfile);
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
        walletProfileId: walletProfile.id,
        authStatus
      });

      // Use wallet profile ID for upload
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

      // Auto-apply as background with JSON patch
      const patchApplied = await applyJsonPatch(`Set this image as the wallet background`, result.url);
      
      // Generate AI response about the upload
      const aiResponse = patchApplied
        ? `Perfect! I've uploaded your image and set it as the wallet background. The image URL is: ${result.url}. You can now see the changes in the wallet preview.`
        : `Great! Your image has been uploaded successfully. The image URL is: ${result.url}. You can ask me to apply it as a background or use it in other ways for your wallet theme.`;
      
      addMessage(aiResponse, 'assistant', undefined, patchApplied);

    } catch (error) {
      console.error('💥 Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      // Clear the input
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
        {selectedThemeId && (
          <div className="text-xs text-purple-300 mt-1">
            Active Theme: {selectedThemeId.slice(0, 8)}... | Layer: {currentLayer || 'homeLayer'}
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/60 py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">AI Theme Assistant</p>
              <p className="text-sm mb-4">Upload images or describe changes to customize your wallet theme with AI</p>
              <div className="text-xs text-white/40 space-y-1">
                <p>• "Make the background darker"</p>
                <p>• "Change button colors to blue"</p>
                <p>• "Upload an image → Auto-apply as background"</p>
              </div>
              {authStatus !== 'authenticated' && (
                <p className="text-xs text-yellow-400 mt-4">
                  Connect and authenticate your wallet to start uploading images
                </p>
              )}
            </div>
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
                  <p className="text-white text-sm">{message.content}</p>
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
