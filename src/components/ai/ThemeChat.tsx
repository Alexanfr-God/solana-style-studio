
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Upload, AlertCircle, CheckCircle2, Wallet, Bot, Palette, Wand2, RotateCcw, Loader2 } from 'lucide-react';
import { useExtendedWallet } from '@/context/WalletContextProvider';
import { FileUploadService } from '@/services/fileUploadService';
import { LlmPatchService, type PatchRequest } from '@/services/llmPatchService';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletElements, type WalletElement } from '@/hooks/useWalletElements';
import { useSmartEdit } from '@/contexts/SmartEditContext';
import { useThemeStore } from '@/state/themeStore';
import { BG_TARGETS, type BgTarget } from '@/ai/constants/backgroundTargets';
import { buildExclusiveImageOps } from '@/ai/tools/patchBuilders';
import { toast } from 'sonner';
import ColorSchemeCard from './ColorSchemeCard';
import { ThemeInitButton } from './ThemeInitButton';

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
  const [colorSchemes, setColorSchemes] = useState<Array<{
    name: string;
    description: string;
    colors: {
      background: string;
      text: string;
      accent: string;
      secondary: string;
    };
  }>>([]);
  const [isAnalyzingColors, setIsAnalyzingColors] = useState(false);
  const [appliedScheme, setAppliedScheme] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, walletProfile, isAuthenticating } = useExtendedWallet();
  const { currentLayer } = useWalletCustomizationStore();
  const { elements } = useWalletElements();
  const { selectedElement, updateSelectedElement, isEditMode, setIsEditMode } = useSmartEdit();
  const { theme, applyPatch, setTheme } = useThemeStore();

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

      const userId = walletProfile?.wallet_address || 'anonymous';
      
      const patchRequest: PatchRequest = {
        userId: userId,
        pageId: currentLayer || 'homeLayer',
        userPrompt: finalPrompt
      };

      const result = await LlmPatchService.applyPatch(patchRequest);
      
      if (result) {
        console.log('✅ Theme updated successfully in database');
        
        // Reload theme from database to see AI changes
        console.log('[ThemeChat] 🔄 Reloading theme from DB after AI update...');
        const { data: updatedTheme, error: themeError } = await (await import('@/integrations/supabase/client')).supabase
          .from('user_themes')
          .select('theme_data')
          .eq('user_id', userId)
          .single();
        
        if (themeError) {
          console.error('[ThemeChat] ❌ Failed to reload theme:', themeError);
          toast.error('Theme updated but failed to reload - please refresh');
        } else if (updatedTheme?.theme_data) {
          console.log('[ThemeChat] ✅ Theme reloaded from DB, applying to UI store...');
          setTheme(updatedTheme.theme_data);
          toast.success('🎯 Theme updated with AI suggestions!');
        }
        
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

  const onReset = async () => {
    // Определяем какие слои были применены
    const appliedTargets = Object.keys(applied).filter(key => applied[key]);
    
    if (appliedTargets.length > 0) {
      try {
        // Генерируем "обратный патч" для сброса изображений и восстановления фонов
        const resetOps = buildExclusiveImageOps('ALL', '', theme).concat(
          BG_TARGETS
            .filter(t => t.id !== 'ALL' && t.colorPtr)
            .map(t => {
              const defaultColors = {
                'lock': 'rgba(31, 41, 55, 0.8)',
                'home': 'rgba(31, 41, 55, 0.9)', 
                'receiveCenter': 'rgba(107, 114, 128, 0.1)',
                'sendCenter': 'rgba(107, 114, 128, 0.1)',
                'buyCenter': 'rgba(75, 85, 99, 0.8)'
              };
              const defaultColor = defaultColors[t.id as keyof typeof defaultColors] || '';
              return { op: 'replace' as const, path: t.colorPtr!, value: defaultColor };
            })
        );
        
        // Применяем патч для визуального сброса
        const resetPatch = {
          id: crypto.randomUUID(),
          operations: resetOps,
          userPrompt: 'Reset applied images and restore original backgrounds',
          pageId: 'home',
          theme: theme,
          timestamp: new Date()
        };
        await applyPatch(resetPatch);
        console.log('[APPLY] Applied reset patch to remove images and restore backgrounds');
      } catch (error) {
        console.error('Failed to apply reset patch:', error);
        toast.error('Failed to reset images');
      }
    }
    
    // Сбрасываем UI состояние
    setApplied({});
    console.log('[APPLY] Reset all applied states');
    toast.success('Reset completed - images removed and backgrounds restored');
  };

  const handleAnalyzeColors = async (imageUrl: string) => {
    try {
      setIsAnalyzingColors(true);
      setColorSchemes([]); // Clear previous schemes
      setAppliedScheme(null); // Clear applied status
      
      console.log('[AI-COLORS] Starting AI color analysis with Gemini Vision...');
      
      // Add loading message
      addMessage('🔍 Analyzing image colors with AI... This may take a few seconds.', 'assistant');
      
      // Call the new AI edge function
      const supabase = (await import('@/integrations/supabase/client')).supabase;
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-analyze-colors', {
        body: { imageBase64: imageUrl }
      });

      if (aiError) {
        console.error('[AI-COLORS] AI color analysis error:', aiError);
        addMessage(`❌ AI analysis failed: ${aiError.message}`, 'assistant');
        toast.error('Failed to analyze colors with AI');
        return;
      }

      const schemes = aiData?.schemes || [];
      
      if (schemes.length === 0) {
        addMessage("❌ The AI couldn't extract color schemes from this image. Try a different image with clearer colors.", 'assistant');
        toast.error('No color schemes generated');
        return;
      }

      console.log('[AI-COLORS] Received AI color schemes:', schemes);
      setColorSchemes(schemes);
      
      addMessage(`✨ AI analyzed your image and generated ${schemes.length} professional color schemes. Select one below to apply it to your wallet.`, 'assistant');
      
      toast.success(`Generated ${schemes.length} color scheme options!`);

    } catch (error) {
      console.error('[AI-COLORS] Color analysis error:', error);
      addMessage(`❌ Error analyzing colors: ${error instanceof Error ? error.message : 'Unknown error'}`, 'assistant');
      toast.error('Failed to analyze colors');
    } finally {
      setIsAnalyzingColors(false);
    }
  };

  const handleApplyPaletteFromImage = async (imageUrl: string) => {
    if (!walletProfile?.wallet_address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('[VISION-PALETTE] 🎨 Applying palette from image:', imageUrl);
      
      addMessage('🎨 Extracting color palette from your image...', 'assistant');
      
      // Call llm-patch with vision-palette mode
      const supabase = (await import('@/integrations/supabase/client')).supabase;
      const { data, error } = await supabase.functions.invoke('llm-patch', {
        body: {
          mode: 'vision-palette',
          userId: walletProfile.wallet_address,
          imageUrl: imageUrl,
          safePrefixes: [
            '/lockLayer', '/homeLayer', '/sidebarLayer',
            '/receiveLayer', '/sendLayer', '/swapLayer',
            '/appsLayer', '/historyLayer', '/searchLayer',
            '/globalSearchInput', '/assetCard', '/global', '/inputs'
          ],
          allowFontChange: false
        }
      });

      if (error) {
        console.error('[VISION-PALETTE] ❌ Error:', error);
        addMessage(`❌ Failed to apply palette: ${error.message}`, 'assistant');
        toast.error('Failed to apply palette');
        return;
      }

      if (!data.success) {
        console.warn('[VISION-PALETTE] ⚠️ No changes:', data.message);
        addMessage(`⚠️ ${data.message}`, 'assistant');
        toast.warning(data.message || 'No color changes needed');
        return;
      }

      console.log('[VISION-PALETTE] ✅ Success:', data);
      
      // Reload theme from database
      const { data: updatedTheme, error: themeError } = await supabase
        .from('user_themes')
        .select('theme_data')
        .eq('user_id', walletProfile.wallet_address)
        .single();
      
      if (themeError || !updatedTheme?.theme_data) {
        console.error('[VISION-PALETTE] ❌ Failed to reload theme');
        toast.error('Theme updated but failed to reload');
        return;
      }
      
      // Apply to UI via store
      setTheme(updatedTheme.theme_data);
      console.log('[VISION-PALETTE] ✅ Theme applied to UI');
      
      // Success message with palette details
      const palette = data.palette;
      addMessage(
        `✅ ${data.message}\n\n**Extracted Palette:**\n` +
        `• Background: \`${palette.bg}\`\n` +
        `• Text: \`${palette.fg}\`\n` +
        `• Primary: \`${palette.primary}\`\n` +
        `• Accent 1: \`${palette.accent1}\`\n` +
        `• Accent 2: \`${palette.accent2}\`\n` +
        `• Neutral: \`${palette.neutral}\`\n\n` +
        `Applied **${data.applied}** color changes across all layers.`,
        'assistant',
        undefined,
        true
      );
      
      toast.success(`Palette applied! ${data.applied} colors updated`);
      
    } catch (error) {
      console.error('[VISION-PALETTE] ❌ Fatal error:', error);
      addMessage(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'assistant'
      );
      toast.error('Failed to apply palette');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyColorScheme = async (scheme: typeof colorSchemes[0]) => {
    if (!theme) {
      toast.error('Theme not loaded');
      return;
    }

    // Check if user is authenticated
    if (!walletProfile?.wallet_address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('[AI-COLORS] Applying scheme:', scheme.name, 'for user:', walletProfile.wallet_address);

      // Define all layers to apply colors to
      const allLayers = [
        'lockLayer',
        'homeLayer', 
        'swapLayer',
        'historyLayer',
        'searchLayer',
        'buyLayer',
        'sendLayer',
        'receiveLayer'
      ];

      // Call the new ai-apply-colors edge function
      const supabase = (await import('@/integrations/supabase/client')).supabase;
      const { data: response, error } = await supabase.functions.invoke('ai-apply-colors', {
        body: {
          userId: walletProfile.wallet_address,
          scheme: scheme,
          layers: allLayers
        }
      });

      if (error) {
        console.error('[AI-COLORS] Error applying scheme:', error);
        toast.error(`Failed to apply scheme: ${error.message}`);
        return;
      }

      if (response?.success) {
        console.log(`[AI-COLORS] Successfully applied scheme:`, response);
        
        // Verify walletProfile exists
        if (!walletProfile?.wallet_address) {
          console.error('[AI-COLORS] No wallet address found in profile:', walletProfile);
          toast.error('Wallet not connected. Please connect your wallet first.');
          return;
        }

        // Wait for DB write to complete (500ms delay)
        console.log('[AI-COLORS] Waiting 500ms for DB write to complete...');
        await new Promise(resolve => setTimeout(resolve, 500));

        const fetchTheme = async (retryCount = 0): Promise<boolean> => {
          console.log(`[AI-COLORS] Fetching theme (attempt ${retryCount + 1}) for wallet:`, walletProfile.wallet_address);
          
          const { data: updatedTheme, error: themeError } = await supabase
            .from('user_themes')
            .select('theme_data, version, updated_at')
            .eq('user_id', walletProfile.wallet_address)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          console.log('[AI-COLORS] DB Query result:', { 
            found: !!updatedTheme, 
            error: themeError,
            wallet: walletProfile.wallet_address,
            version: updatedTheme?.version,
            updated_at: updatedTheme?.updated_at,
            has_theme_data: !!updatedTheme?.theme_data,
            theme_keys: updatedTheme?.theme_data ? Object.keys(updatedTheme.theme_data) : []
          });

          if (themeError) {
            console.error('[AI-COLORS] Failed to reload theme:', themeError);
            toast.error('Failed to reload theme from database');
            return false;
          }

          if (updatedTheme?.theme_data) {
            console.log('[AI-COLORS] ✅ Theme found! Applying to UI store...');
            console.log('[AI-COLORS] Theme data keys:', Object.keys(updatedTheme.theme_data));
            setTheme(updatedTheme.theme_data);
            console.log('[AI-COLORS] ✅ setTheme() called successfully!');
            toast.success('Color scheme applied successfully!');
            return true;
          }

          // Retry once after 1 second if theme not found
          if (retryCount === 0) {
            console.log('[AI-COLORS] ⚠️ Theme not found on first attempt, retrying in 1 second...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchTheme(1);
          }

          console.error('[AI-COLORS] ❌ Theme not found after applying scheme and retry');
          toast.error('Theme not found after applying scheme. Please try again.');
          return false;
        };

        const success = await fetchTheme();
        
        if (success) {
          addMessage(
            `✅ Applied "${scheme.name}" to all wallet layers!\n${response.message}`, 
            'assistant', 
            undefined, 
            true
          );
        }
        
        toast.success(`${scheme.name} applied to ${response.layers.length} layers!`);
        
        // Mark this scheme as applied
        setAppliedScheme(scheme.name);
      } else {
        toast.error('Failed to apply color scheme');
      }
    } catch (error) {
      console.error('[AI-COLORS] Apply scheme error:', error);
      toast.error(`Failed to apply scheme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
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
            onClick={() => {
              setChatMode('general');
              setIsEditMode(false);
            }}
            className="h-7 px-2 text-xs"
          >
            <Palette className="h-3 w-3 mr-1" />
            General Theme
          </Button>
          <Button
            variant={chatMode === 'element' ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setChatMode('element');
              setIsEditMode(true);
            }}
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
              
              {/* Theme initialization prompt */}
              <div className="mb-6 max-w-md mx-auto">
                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm text-white/80">
                      🎨 Initialize your theme to start customizing
                    </p>
                    <ThemeInitButton />
                  </CardContent>
                </Card>
              </div>
              
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
                      
                      {/* Apply Palette & Analyze Colors buttons */}
                      <div className="flex justify-center mt-3 gap-2">
                        <Button
                          onClick={() => handleApplyPaletteFromImage(message.uploadedImageUrl!)}
                          disabled={isProcessing || isUploading}
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 disabled:opacity-50 font-medium"
                        >
                          <Palette className="h-3 w-3 mr-1" />
                          Apply Palette
                        </Button>
                        
                        <Button
                          onClick={() => handleAnalyzeColors(message.uploadedImageUrl!)}
                          disabled={isAnalyzingColors}
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 disabled:opacity-50"
                        >
                          {isAnalyzingColors ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Analyzing...</span>
                            </div>
                          ) : (
                            'AI Color Schemes'
                          )}
                        </Button>
                        
                        {/* Reset button - show if any layers are applied */}
                        {Object.values(applied).some(Boolean) && (
                          <Button
                            onClick={onReset}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-300"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                          </Button>
                        )}
                      </div>
                      
                      {/* AI Color Schemes Display with new component */}
                      {colorSchemes.length > 0 && (
                        <div className="mt-4 space-y-3 animate-fade-in">
                          <div className="flex items-center gap-2 text-sm text-white font-medium">
                            <Palette className="h-4 w-4 text-purple-400" />
                            <span>AI Generated Color Schemes</span>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {colorSchemes.map((scheme, idx) => (
                              <ColorSchemeCard
                                key={idx}
                                scheme={scheme}
                                onApply={applyColorScheme}
                                isApplying={isProcessing}
                                isApplied={appliedScheme === scheme.name}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
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
