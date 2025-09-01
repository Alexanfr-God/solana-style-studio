
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Upload, Image, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
import { useWalletChatContext } from '@/contexts/WalletChatContext';
import { useExtendedWallet } from '@/context/WalletContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadService } from '@/services/fileUploadService';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

const ThemeChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'wallet-connected' | 'authenticated' | 'disconnected'>('checking');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages: contextMessages, addMessage, isProcessing } = useWalletChatContext();
  const { isAuthenticated, userId, walletProfile, isAuthenticating } = useExtendedWallet();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('🔐 Supabase auth check:', { user: !!user, error, userId, isAuthenticated });
        
        if (user && userId && isAuthenticated) {
          setAuthStatus('authenticated');
          console.log('✅ Fully authenticated - Supabase + Wallet');
        } else if (isAuthenticated && walletProfile) {
          setAuthStatus('wallet-connected');
          console.log('⚠️ Wallet connected but no Supabase session');
        } else {
          setAuthStatus('disconnected');
          console.log('❌ Not authenticated');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthStatus('disconnected');
      }
    };

    checkAuth();
  }, [userId, isAuthenticated, walletProfile]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, contextMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    addMessage(inputValue, 'user');
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I received your message: "${inputValue}". AI theme generation is not fully implemented yet, but I can help you understand the current wallet customization system.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      addMessage(aiMessage.content, 'assistant');
    }, 1000);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check authentication before upload
    if (authStatus !== 'authenticated') {
      toast.error('Please connect and authenticate your wallet first');
      console.log('❌ Upload blocked - auth status:', authStatus);
      return;
    }

    if (!userId) {
      toast.error('No user ID available. Please reconnect your wallet.');
      console.log('❌ Upload blocked - no userId:', { userId, isAuthenticated });
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
        userId,
        authStatus
      });

      // Verify auth one more time before upload
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication expired. Please reconnect your wallet.');
      }

      const result = await FileUploadService.uploadImageFromFile(
        file,
        userId,
        'theme-chat-images'
      );

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('✅ Image uploaded successfully:', result.url);

      // Add image message to chat
      const imageMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `Uploaded image: ${file.name}`,
        timestamp: new Date(),
        imageUrl: result.url
      };

      setMessages(prev => [...prev, imageMessage]);
      addMessage(`Image uploaded: ${result.url}`, 'user');

      toast.success('🎯 Image uploaded successfully!');

      // Auto-suggest theme generation
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Great! I can see your uploaded image. You can now use this image URL in your wallet theme JSON: "${result.url}". Would you like me to help you create a custom theme based on this image?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        addMessage(aiResponse.content, 'assistant');
      }, 1000);

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
        return { icon: AlertCircle, text: 'Wallet connected, authenticating...', color: 'text-yellow-500' };
      case 'authenticated':
        return { icon: CheckCircle2, text: 'Fully authenticated', color: 'text-green-500' };
      case 'disconnected':
        return { icon: Wallet, text: 'Connect wallet to upload', color: 'text-red-500' };
    }
  };

  const statusDisplay = getAuthStatusDisplay();

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">AI Theme Assistant</h3>
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
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/60 py-8">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Welcome to AI Theme Assistant</p>
              <p className="text-sm">Upload an image or ask me to help customize your wallet theme</p>
              {authStatus !== 'authenticated' && (
                <p className="text-xs text-yellow-400 mt-2">
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
                  <p className="text-white/40 text-xs mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
            className="bg-white/5 border-white/20 hover:bg-white/10"
          >
            <Upload className={`h-4 w-4 ${isUploading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing || isAuthenticating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeChat;
