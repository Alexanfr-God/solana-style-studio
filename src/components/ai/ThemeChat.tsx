
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Upload, AlertCircle, CheckCircle2, Wallet, Bot, Palette, Wand2, RotateCcw, Loader2, Sparkles, Ghost } from 'lucide-react';
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
import { usePhantomThemeStore, type WCCOverlayV3 } from '@/stores/phantomThemeStore';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPhantomTheme, setIsGeneratingPhantomTheme] = useState(false);
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
  const { setPhantomTheme } = usePhantomThemeStore();

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
        const jsonPath = targetElement.json_path;
        
        if (jsonPath) {
      const finalPrompt = `${userPrompt}

CRITICAL INSTRUCTIONS:
- Target JSON path: ${jsonPath}
- Element: ${targetElement.name} (${targetElement.type})
- Screen: ${targetElement.screen}
- You MUST modify ONLY the value at path: ${jsonPath}
- Example: if user says "make it blue", change ${jsonPath} to "#3b82f6"
- DO NOT modify any other paths in the theme
- Generate EXACTLY ONE JSON Patch operation targeting ${jsonPath}

IMPORTANT: This is PRECISE MODE - you should ONLY change the specified json_path and nothing else!`;
        } else {
          // Fallback для элементов без json_path
          console.warn('[applyJsonPatch] ⚠️ Element has no json_path, using textual prompt');
          finalPrompt = `${userPrompt} Target element: ${targetElement.name} (${targetElement.type}) on ${targetElement.screen} screen. Please try to find and modify the appropriate theme properties for this element.`;
        }
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

  // Build a minimal WCCOverlayV3 with just an image background (no AI)
  const buildImagePhantomTheme = (imageUrl: string): WCCOverlayV3 => ({
    version: 3,
    wallet: 'phantom',
    theme_name: 'Custom Upload',
    generated_at: new Date().toISOString(),
    global: {
      background: { type: 'image', url: imageUrl, blur: 0, opacity: 0.9 },
      color_analysis: {
        dominant: ['#131217'],
        luminance: 'dark',
        forbidden: [],
        safe_text: '#ffffff',
        safe_accent: '#ab9ff2',
        safe_button_bg: '#ab9ff2',
        palette: { primary: '#ab9ff2', secondary: '#1a1a2e', neutral: '#888888', highlight: '#ab9ff2' },
      },
    },
    elements: {},
  });

  const onApply = async (targetId: BgTarget['id'], imageUrl: string) => {
    console.log('[onApply] imageUrl:', imageUrl?.slice(0, 100), 'targetId:', targetId);
    // Always update Phantom preview immediately — this is the JSON overlay
    setPhantomTheme(buildImagePhantomTheme(imageUrl));

    // Also patch the WCC theme store if theme is loaded
    if (theme) {
      const ops = buildExclusiveImageOps(targetId, imageUrl, theme);
      if (ops.length) {
        const patchEntry = {
          id: `img-apply-${targetId}-${Date.now()}`,
          operations: ops,
          userPrompt: `Apply uploaded image to ${targetId}`,
          pageId: 'ai-chat',
          timestamp: new Date(),
          theme: theme,
        };
        try {
          await applyPatch(patchEntry);
        } catch (error) {
          console.error('WCC patch failed (non-fatal):', error);
        }
      }
    }

    setApplied(prev => ({ ...prev, [targetId]: true }));
    toast.success(`✅ Image applied — switch to Phantom tab to preview`);
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

      // Convert AI Color Scheme to Palette format
      const palette = {
        bg: scheme.colors.background,
        fg: scheme.colors.text,
        primary: scheme.colors.accent,
        accent1: scheme.colors.secondary,
        accent2: scheme.colors.accent,
        neutral: scheme.colors.background // Use background as neutral
      };

      console.log('[AI-COLORS] Converted to palette:', palette);

      // Call llm-patch with vision-palette mode and pre-defined palette
      const supabase = (await import('@/integrations/supabase/client')).supabase;
      const { data: response, error } = await supabase.functions.invoke('llm-patch', {
        body: {
          mode: 'vision-palette',
          userId: walletProfile.wallet_address,
          palette: palette,
          safePrefixes: [
            '/lockLayer', '/homeLayer', '/sidebarLayer',
            '/receiveLayer', '/sendLayer', '/swapLayer',
            '/appsLayer', '/historyLayer', '/searchLayer',
            '/globalSearchInput', '/assetCard', '/global', '/inputs',
            '/sidebar', '/dropdownMenu', '/assetContainer', '/assetList'
          ],
          allowFontChange: false
        }
      });

      if (error) {
        console.error('[AI-COLORS] Error applying scheme:', error);
        toast.error(`Failed to apply scheme: ${error.message}`);
        return;
      }

      if (!response?.success) {
        console.warn('[AI-COLORS] No changes:', response?.message);
        toast.warning(response?.message || 'No color changes needed');
        return;
      }

      console.log('[AI-COLORS] ✅ Successfully applied scheme:', response);
      
      // Reload theme from database
      const { data: updatedTheme, error: themeError } = await supabase
        .from('user_themes')
        .select('theme_data')
        .eq('user_id', walletProfile.wallet_address)
        .single();
      
      if (themeError || !updatedTheme?.theme_data) {
        console.error('[AI-COLORS] ❌ Failed to reload theme');
        toast.error('Theme updated but failed to reload');
        return;
      }
      
      // Apply to UI via store
      setTheme(updatedTheme.theme_data);
      console.log('[AI-COLORS] ✅ Theme applied to UI');
      
      // Update applied state and show success
      setAppliedScheme(scheme.name);
      toast.success(`✅ Applied "${scheme.name}" scheme with ${response.applied} color changes!`);
      
      addMessage(
        `✅ Applied "${scheme.name}" to all wallet layers!\n\n` +
        `**Palette:**\n` +
        `• Background: \`${palette.bg}\`\n` +
        `• Text: \`${palette.fg}\`\n` +
        `• Primary: \`${palette.primary}\`\n` +
        `• Accent: \`${palette.accent1}\`\n\n` +
        `Applied **${response.applied}** color changes using smart color logic.`,
        'assistant', 
        undefined, 
        true
      );
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

  // Instantly preview uploaded image in Phantom layout (no AI — default colors)
  const handleApplyImageToPhantom = (imageUrl: string) => {
    setPhantomTheme(buildImagePhantomTheme(imageUrl));
    addMessage('👻 Image set as Phantom background. Switch to Phantom preview to see it.', 'assistant');
    toast.success('Image applied to Phantom preview!');
  };

  // Run full AI pipeline using uploaded image (skip generation, analyze colors + design elements)
  const handleAIStyleFromImage = async (imageUrl: string) => {
    if (!walletProfile?.wallet_address) {
      addMessage('⚠️ Please connect your wallet first', 'assistant');
      toast.error('Wallet not connected');
      return;
    }
    setIsGeneratingPhantomTheme(true);
    addMessage(
      '👻 Analyzing your image with AI...\n\nStep 1/2: Color analysis with GPT-4o Vision\nStep 2/2: Designing Phantom elements',
      'assistant'
    );
    try {
      const supabase = (await import('@/integrations/supabase/client')).supabase;
      const { data, error } = await supabase.functions.invoke('generate-theme', {
        body: {
          prompt: 'custom uploaded image',
          userId: walletProfile.wallet_address,
          wallet: 'phantom',
          background: { type: 'url', value: imageUrl },
        },
      });
      if (error || !data?.success || !data?.theme) {
        addMessage(`❌ AI styling failed: ${error?.message ?? data?.error ?? 'Unknown error'}`, 'assistant');
        toast.error('Failed to style from image');
        return;
      }
      const theme = data.theme as WCCOverlayV3;
      setPhantomTheme(theme);
      addMessage(
        `✅ **${theme.theme_name}** styled!\n\n` +
        `• Luminance: ${theme.global.color_analysis.luminance}\n` +
        `• Accent: ${theme.global.color_analysis.safe_accent}\n` +
        `• Elements: ${Object.keys(theme.elements).length} designed`,
        'assistant',
        imageUrl
      );
      toast.success('👻 Phantom theme styled from your image!');
    } catch (e) {
      addMessage(`❌ Error: ${e instanceof Error ? e.message : 'Unknown error'}`, 'assistant');
      toast.error('Failed to style from image');
    } finally {
      setIsGeneratingPhantomTheme(false);
    }
  };

  // Generate poster with AI
  const handleGeneratePoster = async (prompt: string) => {
    // Check wallet authentication
    if (!walletProfile?.wallet_address) {
      addMessage('⚠️ Please connect your wallet first to generate posters', 'assistant');
      toast.error('Wallet not connected');
      return;
    }
    
    setIsGenerating(true);
    addMessage(`🎨 Generating poster: "${prompt}"...`, 'assistant');

    try {
      const supabase = (await import('@/integrations/supabase/client')).supabase;
      const { data, error } = await supabase.functions.invoke('generate-poster', {
        body: { 
          prompt,
          userId: walletProfile?.wallet_address 
        }
      });

      if (error) {
        console.error('[generate-poster] Error:', error);
        addMessage(`❌ Generation failed: ${error.message}`, 'assistant');
        toast.error('Failed to generate poster');
        return;
      }

      if (!data?.success || !data?.imageUrl) {
        console.error('[generate-poster] No image:', data);
        addMessage(`❌ ${data?.error || 'Failed to generate image. Try a different prompt.'}`, 'assistant');
        toast.error(data?.error || 'Generation failed');
        return;
      }

      console.log('[generate-poster] ✅ Success:', data.imageUrl);
      
      // Add system message with apply buttons (same as uploaded images)
      addMessage('', 'system', undefined, undefined, data.imageUrl);
      addMessage(
        `✅ Poster generated! Click buttons above to apply it as background.`,
        'assistant',
        data.imageUrl
      );
      
      toast.success('🎨 Poster generated successfully!');

    } catch (error) {
      console.error('[generate-poster] Fatal error:', error);
      addMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'assistant');
      toast.error('Failed to generate poster');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate full Phantom theme via AI pipeline
  const handleGeneratePhantomTheme = async (prompt: string) => {
    if (!walletProfile?.wallet_address) {
      addMessage('⚠️ Please connect your wallet first to generate Phantom themes', 'assistant');
      toast.error('Wallet not connected');
      return;
    }

    setIsGeneratingPhantomTheme(true);
    addMessage(
      `👻 Generating Phantom theme: "${prompt}"…\n\n` +
      `Step 1/3: Creating background with DALL-E 3\nStep 2/3: Analyzing colors with GPT-4o Vision\nStep 3/3: Designing elements`,
      'assistant'
    );

    try {
      const supabase = (await import('@/integrations/supabase/client')).supabase;
      const { data, error } = await supabase.functions.invoke('generate-theme', {
        body: {
          prompt,
          userId: walletProfile.wallet_address,
          wallet: 'phantom',
        },
      });

      if (error) {
        console.error('[generate-theme] Error:', error);
        addMessage(`❌ Theme generation failed: ${error.message}`, 'assistant');
        toast.error('Failed to generate Phantom theme');
        return;
      }

      if (!data?.success || !data?.theme) {
        addMessage(`❌ ${data?.error || 'Theme generation failed. Try a different prompt.'}`, 'assistant');
        toast.error(data?.error || 'Generation failed');
        return;
      }

      const theme = data.theme;
      console.log('[generate-theme] ✅ Theme received:', theme.theme_name);

      // Apply theme to Phantom preview immediately
      setPhantomTheme(theme);

      const bgUrl = theme.global?.background?.url;
      addMessage(
        `✅ **${theme.theme_name}** generated!\n\n` +
        `• Background: ${theme.global.background.type}\n` +
        `• Luminance: ${theme.global.color_analysis.luminance}\n` +
        `• Accent color: ${theme.global.color_analysis.safe_accent}\n` +
        `• Elements designed: ${Object.keys(theme.elements).length}\n\n` +
        `The theme is ready to apply to your Phantom overlay.`,
        'assistant',
        bgUrl
      );

      toast.success(`👻 ${theme.theme_name} generated!`);

    } catch (error) {
      console.error('[generate-theme] Fatal error:', error);
      addMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'assistant');
      toast.error('Failed to generate Phantom theme');
    } finally {
      setIsGeneratingPhantomTheme(false);
    }
  };

  // Check if message is a phantom-theme command
  const isPhantomThemeCommand = (message: string): boolean => {
    const lowerMsg = message.toLowerCase().trim();
    return (
      lowerMsg === '/theme' ||
      lowerMsg.startsWith('/theme ') ||
      lowerMsg.startsWith('phantom theme') ||
      lowerMsg.startsWith('сделай тему') ||
      lowerMsg.startsWith('create phantom theme') ||
      lowerMsg.startsWith('generate phantom theme')
    );
  };

  const extractPhantomThemePrompt = (message: string): string => {
    const lowerMsg = message.toLowerCase().trim();
    if (lowerMsg.startsWith('/theme ')) return message.slice(7).trim();
    if (lowerMsg.startsWith('phantom theme')) return message.slice(13).trim();
    if (lowerMsg.startsWith('сделай тему')) return message.slice(11).trim();
    if (lowerMsg.startsWith('create phantom theme')) return message.slice(20).trim();
    if (lowerMsg.startsWith('generate phantom theme')) return message.slice(22).trim();
    return message;
  };

  // Check if message is a poster generation command
  const isGenerationCommand = (message: string): boolean => {
    const lowerMsg = message.toLowerCase().trim();
    return (
      lowerMsg === '/poster' ||
      lowerMsg.startsWith('/poster ') ||
      lowerMsg === '/generate' ||
      lowerMsg.startsWith('/generate ') ||
      lowerMsg.startsWith('generate poster') ||
      lowerMsg.startsWith('create poster') ||
      lowerMsg.startsWith('создай постер') ||
      lowerMsg.startsWith('сгенерируй') ||
      lowerMsg.includes('generate a poster') ||
      lowerMsg.includes('generate wallpaper') ||
      lowerMsg.includes('create a wallpaper')
    );
  };

  // Extract prompt from generation command
  const extractGenerationPrompt = (message: string): string => {
    const lowerMsg = message.toLowerCase().trim();
    if (lowerMsg.startsWith('/poster ')) return message.slice(8).trim();
    if (lowerMsg.startsWith('/generate ')) return message.slice(10).trim();
    if (lowerMsg.startsWith('generate poster')) return message.slice(15).trim();
    if (lowerMsg.startsWith('create poster')) return message.slice(13).trim();
    if (lowerMsg.startsWith('создай постер')) return message.slice(13).trim();
    if (lowerMsg.startsWith('сгенерируй')) return message.slice(10).trim();
    return message;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    setInputValue('');

    // Check if it's a phantom theme command
    if (isPhantomThemeCommand(userMessage)) {
      const prompt = extractPhantomThemePrompt(userMessage);
      if (!prompt.trim()) {
        addMessage(userMessage, 'user');
        addMessage('⚠️ Please describe the theme. Example: "/theme cyberpunk neon green"', 'assistant');
        return;
      }
      addMessage(userMessage, 'user');
      await handleGeneratePhantomTheme(prompt);
      return;
    }

    // Check if it's a poster generation command
    if (isGenerationCommand(userMessage)) {
      const prompt = extractGenerationPrompt(userMessage);
      
      // Validate prompt is not empty
      if (!prompt.trim()) {
        addMessage(userMessage, 'user');
        addMessage('⚠️ Please provide a description for the poster. Example: "/poster cyberpunk city with neon lights"', 'assistant');
        toast.warning('Enter a description after /poster');
        return;
      }
      
      addMessage(userMessage, 'user');
      await handleGeneratePoster(prompt);
      return;
    }

    addMessage(userMessage, 'user');
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
            data-ignore-dropdown-close="true"
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
            data-ignore-dropdown-close="true"
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
                    <p className="text-purple-400 font-medium mt-2">🎨 AI Poster Generation:</p>
                    <p>• "/poster cyberpunk city with neon lights"</p>
                    <p>• "/generate cosmic galaxy nebula"</p>
                    <p>• "create poster abstract blockchain network"</p>
                    <p className="text-violet-400 font-medium mt-2">👻 Phantom Theme Generation:</p>
                    <p>• "/theme cyberpunk neon green buttons"</p>
                    <p>• "/theme glassmorphism white minimal"</p>
                    <p>• "/theme bitcoin gold luxury"</p>
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
                      <div className="flex justify-center mt-3 gap-2 flex-wrap">
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

                      {/* Phantom preview buttons */}
                      <div className="mt-3 border-t border-violet-500/20 pt-3">
                        <div className="text-xs text-violet-300 mb-2 font-medium">👻 Phantom Preview</div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={() => handleApplyImageToPhantom(message.uploadedImageUrl!)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-violet-500/30 hover:from-violet-600/30 hover:to-purple-600/30 font-medium"
                          >
                            <Ghost className="h-3 w-3 mr-1 text-violet-400" />
                            Preview in Phantom
                          </Button>
                          <Button
                            onClick={() => handleAIStyleFromImage(message.uploadedImageUrl!)}
                            disabled={isGeneratingPhantomTheme}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs bg-gradient-to-r from-violet-600/30 to-pink-600/20 border-violet-500/40 hover:from-violet-600/40 hover:to-pink-600/30 disabled:opacity-50 font-medium"
                          >
                            {isGeneratingPhantomTheme ? (
                              <div className="flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Styling...</span>
                              </div>
                            ) : (
                              <>
                                <Ghost className="h-3 w-3 mr-1 text-violet-300" />
                                AI Style for Phantom
                              </>
                            )}
                          </Button>
                        </div>
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
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && !isGenerating && !isGeneratingPhantomTheme && handleSendMessage()}
              disabled={isProcessing || isGenerating || isGeneratingPhantomTheme || isAuthenticating}
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
            onClick={() => {
              if (inputValue.trim()) {
                setInputValue(`/theme ${inputValue.trim()}`);
              } else {
                setInputValue('/theme ');
              }
              setTimeout(() => {
                const input = document.querySelector('input[placeholder*="customize"]') as HTMLInputElement;
                if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
              }, 50);
            }}
            disabled={isGeneratingPhantomTheme || authStatus !== 'authenticated'}
            variant="outline"
            size="icon"
            className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:from-violet-500/30 hover:to-purple-500/30 disabled:opacity-50"
            title="Generate Phantom theme"
          >
            <Ghost className={`h-4 w-4 text-violet-400 ${isGeneratingPhantomTheme ? 'animate-pulse' : ''}`} />
          </Button>

          <Button
            onClick={() => {
              if (inputValue.trim()) {
                // If there's text, prepend /poster command
                setInputValue(`/poster ${inputValue.trim()}`);
              } else {
                // If empty, just add the command
                setInputValue('/poster ');
              }
              // Focus input after setting value
              setTimeout(() => {
                const input = document.querySelector('input[placeholder*="customize"]') as HTMLInputElement;
                if (input) {
                  input.focus();
                  input.setSelectionRange(input.value.length, input.value.length);
                }
              }, 50);
            }}
            disabled={isGenerating || authStatus !== 'authenticated'}
            variant="outline"
            size="icon"
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 disabled:opacity-50"
            title="Generate AI poster"
          >
            <Sparkles className={`h-4 w-4 text-purple-400 ${isGenerating ? 'animate-pulse' : ''}`} />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing || isGeneratingPhantomTheme || isAuthenticating}
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
