
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MaskPromptInput from './MaskPromptInput';
import GenerateMaskButton from './GenerateMaskButton';
import SafeZoneToggle from './SafeZoneToggle';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

const V3MaskEditor = () => {
  return (
    <Card className="h-full bg-black/40 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-purple-400" />
            AI Costume Generator
          </CardTitle>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            V3
          </Badge>
        </div>
        <p className="text-sm text-white/60">
          Generate unique wallet costumes with AI that appear directly on your wallet
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* AI Prompt Input */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3 flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
            Describe Your Costume
          </h3>
          <MaskPromptInput />
        </div>

        <Separator className="bg-white/10" />

        {/* Generation Controls */}
        <div className="space-y-4">
          <GenerateMaskButton />
          
          {/* Safe Zone Toggle */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <div>
              <h4 className="text-sm font-medium text-white">UI Protection Zone</h4>
              <p className="text-xs text-white/60">Show protected wallet UI area</p>
            </div>
            <SafeZoneToggle />
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Instructions */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded-lg border border-purple-500/20">
          <h4 className="text-sm font-medium text-purple-300 mb-2">How it works:</h4>
          <div className="text-xs text-white/70 space-y-1">
            <div>• Describe the costume you want</div>
            <div>• Click generate and wait for AI creation</div>
            <div>• Your costume appears directly on the wallet →</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default V3MaskEditor;
