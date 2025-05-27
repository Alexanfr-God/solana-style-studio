
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, RefreshCw, Brain, AlertTriangle, CheckCircle } from 'lucide-react';

interface TestControlsProps {
  testPrompt: string;
  setTestPrompt: (prompt: string) => void;
  testStyle: 'cartoon' | 'realistic' | 'fantasy' | 'modern' | 'minimalist';
  setTestStyle: (style: 'cartoon' | 'realistic' | 'fantasy' | 'modern' | 'minimalist') => void;
  zonePreference: 'top' | 'bottom' | 'left' | 'right' | 'all';
  setZonePreference: (zone: 'top' | 'bottom' | 'left' | 'right' | 'all') => void;
  isGenerating: boolean;
  isAnalyzing: boolean;
  walletAnalysis: any;
  onRunTest: () => void;
  onRunAnalysis: () => void;
}

const TestControls = ({
  testPrompt,
  setTestPrompt,
  testStyle,
  setTestStyle,
  zonePreference,
  setZonePreference,
  isGenerating,
  isAnalyzing,
  walletAnalysis,
  onRunTest,
  onRunAnalysis
}: TestControlsProps) => {
  const getStatusInfo = () => {
    if (isGenerating) return { status: 'Generating...', color: 'bg-blue-500', icon: RefreshCw };
    if (isAnalyzing) return { status: 'Analyzing...', color: 'bg-purple-500', icon: Brain };
    if (walletAnalysis) return { status: 'Ready to Test', color: 'bg-green-500', icon: CheckCircle };
    return { status: 'Analysis Required', color: 'bg-yellow-500', icon: AlertTriangle };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="bg-black/30 backdrop-blur border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`${statusInfo.color}/10 border-${statusInfo.color.replace('bg-', '')}/30 text-white`}>
              <statusInfo.icon className="h-4 w-4 mr-2" />
              {statusInfo.status}
            </Badge>
            <Button 
              onClick={onRunAnalysis} 
              disabled={isAnalyzing} 
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-3 w-3" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generation Controls */}
      <Card className="bg-black/30 backdrop-blur border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Test Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-white/70 mb-2 block">Prompt</label>
            <Textarea 
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Describe the character interaction..."
              className="bg-black/20 border-white/10 text-white min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-sm text-white/70 mb-2 block">Style</label>
              <Select value={testStyle} onValueChange={(value: any) => setTestStyle(value)}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Position</label>
              <Select value={zonePreference} onValueChange={(value: any) => setZonePreference(value)}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Around</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={onRunTest}
            disabled={isGenerating || !testPrompt}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestControls;
