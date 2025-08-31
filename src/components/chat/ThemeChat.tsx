import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Undo2, Redo2, Send, GitCompare, Wand2, History } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeStore, useWalletTheme, useThemeHistory, useThemeActions } from '@/state/themeStore';
import { callPatch, getPresets, type PatchRequest } from '@/lib/api/client';
import { v4 as uuidv4 } from 'uuid';
import { withRenderGuard, once } from '@/utils/guard';
import CompactImageUpload from './CompactImageUpload';

interface ThemeChatProps {
  themeId: string;
  initialTheme?: any;
}

const AVAILABLE_PAGES = [
  { id: 'home', name: 'Home', description: 'Main wallet screen' },
  { id: 'send', name: 'Send', description: 'Send transaction page' },
  { id: 'receive', name: 'Receive', description: 'Receive transaction page' },
  { id: 'swap', name: 'Swap', description: 'Token swap interface' },
  { id: 'history', name: 'History', description: 'Transaction history' },
  { id: 'apps', name: 'Apps', description: 'DApp browser' },
  { id: 'buy', name: 'Buy', description: 'Buy crypto page' },
  { id: 'global', name: 'Global', description: 'Global theme settings' }
];

// Language detection function
function detectLang(text: string): 'en' | 'ru' {
  if (/[а-яё]/i.test(text)) return 'ru';
  return 'en';
}

const ThemeChat: React.FC<ThemeChatProps> = ({ themeId, initialTheme }) => {
  const guard = withRenderGuard("ThemeChat");
  guard();

  if (import.meta.env.DEV) { 
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import("@/utils/reactDiag").then(m => m.logReactIdentity("ThemeChat"));
  }

  const [userPrompt, setUserPrompt] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('home');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('none');
  const [presets, setPresets] = useState<any[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  
  const { isLoading, error, setLoading, setError } = useThemeStore();
  const theme = useWalletTheme();
  const { history, currentIndex, canUndo, canRedo } = useThemeHistory();
  const { applyPatch, undo, redo, setTheme } = useThemeActions();

  // Load presets on mount only - no dependencies to prevent loops
  useEffect(() => {
    let mounted = true;
    
    const loadPresets = async () => {
      try {
        const presetsData = await getPresets();
        if (mounted) {
          setPresets(presetsData);
        }
      } catch (error) {
        console.error('Failed to load presets:', error);
      }
    };

    loadPresets();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - load once only

  // Set initial theme only once on mount - NO theme dependency to prevent loops
  useEffect(() => {
    if (initialTheme) {
      console.log('🎨 Setting initial theme in ThemeChat (one-time only)');
      setTheme(initialTheme);
    }
  }, [setTheme]); // Only depend on setTheme function, NOT on theme state

  const handleApplyPatch = once(async () => {
    if (!userPrompt.trim() || isProcessing) {
      if (!userPrompt.trim()) {
        toast.error('Please enter a theme modification request');
      }
      return;
    }

    const request: PatchRequest = {
      themeId,
      pageId: selectedPageId,
      presetId: selectedPresetId === 'none' ? undefined : selectedPresetId,
      userPrompt: userPrompt.trim(),
      uploadedImageUrl: uploadedImageUrl || undefined
    };

    setIsProcessing(true);
    setLoading(true);
    setError(null);

    try {
      const response = await callPatch(request);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate patch');
      }

      if (!response.patch || response.patch.length === 0) {
        toast.warning('No changes generated for this request');
        return;
      }

      const patchEntry = {
        id: uuidv4(),
        operations: response.patch,
        userPrompt: userPrompt.trim(),
        pageId: selectedPageId,
        presetId: selectedPresetId === 'none' ? undefined : selectedPresetId,
        timestamp: new Date(),
        theme: response.theme
      };

      console.log('[AGENT] apply uploaded image → layer=', selectedPageId, 'ops=', response.patch.length);
      applyPatch(patchEntry);
      toast.success('🎨 Theme updated successfully!');
      setUserPrompt('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to update theme: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  });

  const handleUndo = once(() => {
    if (isProcessing) return;
    
    const success = undo();
    if (success) {
      toast.success('↶ Changes undone');
    } else {
      toast.error('Nothing to undo');
    }
  });

  const handleRedo = once(() => {
    if (isProcessing) return;
    
    const success = redo();
    if (success) {
      toast.success('↷ Changes redone');
    } else {
      toast.error('Nothing to redo');
    }
  });

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isProcessing) {
      e.preventDefault();
      handleApplyPatch();
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    
    // Auto-suggest applying the image based on user language preference
    const lang = userPrompt ? detectLang(userPrompt) : 'en';
    const suggestion = lang === 'ru' 
      ? 'Изображение загружено. Применить как фон для home или lock слоя?'
      : 'Image uploaded. Apply as background for home or lock layer?';
    
    if (!userPrompt.trim()) {
      setUserPrompt(suggestion);
    }
    
    toast.success('🖼️ Image uploaded! You can now apply it as a background.');
  };

  const handleImageRemoved = () => {
    setUploadedImageUrl('');
  };

  const selectedPage = AVAILABLE_PAGES.find(p => p.id === selectedPageId);
  const selectedPreset = selectedPresetId !== 'none' ? presets.find(p => p.id === selectedPresetId) : null;

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-400" />
              WCC Maestro - Theme Editor
            </CardTitle>
            <p className="text-sm text-white/70 mt-1">
              AI-powered page-aware theme customization
            </p>
          </div>
          
          {history.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <History className="h-4 w-4" />
              <span>{currentIndex + 1}/{history.length}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-sm text-red-300">
            {error}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white text-sm">Target Page</Label>
            <Select value={selectedPageId} onValueChange={setSelectedPageId} disabled={isProcessing}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_PAGES.map(page => (
                  <SelectItem key={page.id} value={page.id}>
                    <div>
                      <div className="font-medium">{page.name}</div>
                      <div className="text-xs text-muted-foreground">{page.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPage && (
              <p className="text-xs text-white/60">{selectedPage.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Style Preset (Optional)</Label>
            <Select value={selectedPresetId} onValueChange={setSelectedPresetId} disabled={isProcessing}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Choose preset..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No preset</SelectItem>
                {presets.map(preset => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPreset && (
              <div className="flex flex-wrap gap-1">
                {selectedPreset.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-2">
          <Label className="text-white text-sm">Theme Modification Request</Label>
          <div className="flex gap-2">
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={uploadedImageUrl 
                ? "Describe how to apply the uploaded image (e.g., 'Apply as background for home layer', 'Use as lock screen background')" 
                : "Describe the changes you want to make (e.g., 'Make the background darker', 'Change button colors to blue', 'Add more padding to cards')"
              }
              className="flex-1 min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
              disabled={isLoading || isProcessing}
            />
            <div className="flex flex-col justify-between">
              <CompactImageUpload
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved}
                disabled={isLoading || isProcessing}
              />
              <Button
                onClick={handleApplyPatch}
                disabled={isLoading || isProcessing || !userPrompt.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {(isLoading || isProcessing) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" />
                Apply Changes
              </Button>
            </div>
          </div>
          <p className="text-xs text-white/50">
            Tip: Press Ctrl/Cmd + Enter to apply changes
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo || isLoading || isProcessing}
              className="border-white/20 text-white/80 hover:text-white"
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Undo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo || isLoading || isProcessing}
              className="border-white/20 text-white/80 hover:text-white"
            >
              <Redo2 className="h-4 w-4 mr-1" />
              Redo
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompareMode(!isCompareMode)}
              disabled={history.length === 0 || isProcessing}
              className="border-white/20 text-white/80 hover:text-white"
            >
              <GitCompare className="h-4 w-4 mr-1" />
              Compare
            </Button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded">
            <div className="text-sm text-purple-300">
              <strong>Last change:</strong> {history[currentIndex]?.userPrompt}
            </div>
            <div className="text-xs text-purple-300/70 mt-1">
              Page: {AVAILABLE_PAGES.find(p => p.id === history[currentIndex]?.pageId)?.name} • 
              {new Date(history[currentIndex]?.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThemeChat;
