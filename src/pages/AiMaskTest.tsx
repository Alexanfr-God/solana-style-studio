
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  TestTube,
  Download,
  Bug,
  Monitor,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useCustomizationStore } from '@/stores/customizationStore';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { supabase } from '@/integrations/supabase/client';
import TestMaskPreview from '@/components/test/TestMaskPreview';
import TestControls from '@/components/test/TestControls';
import QuickTests from '@/components/test/QuickTests';

interface TestLog {
  timestamp: string;
  level: 'info' | 'error' | 'warning';
  message: string;
  data?: any;
}

interface TestResult {
  id: string;
  prompt: string;
  imageUrl: string;
  analysisUsed: boolean;
  timestamp: string;
  success: boolean;
  executionTime: number;
}

const AiMaskTest = () => {
  const [testPrompt, setTestPrompt] = useState("cute anime character touching the unlock button");
  const [testStyle, setTestStyle] = useState<'cartoon' | 'realistic' | 'fantasy' | 'modern' | 'minimalist'>('cartoon');
  const [zonePreference, setZonePreference] = useState<'top' | 'bottom' | 'left' | 'right' | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);

  const { 
    walletAnalysis, 
    analyzeCurrentWallet, 
    isAnalyzing 
  } = useCustomizationStore();

  const { setExternalMask } = useMaskEditorStore();

  const addLog = (level: TestLog['level'], message: string, data?: any) => {
    const newLog: TestLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const runTest = async (prompt?: string, style?: typeof testStyle) => {
    const finalPrompt = prompt || testPrompt;
    const finalStyle = style || testStyle;
    
    setIsGenerating(true);
    setProgress(0);
    const startTime = Date.now();
    
    addLog('info', `🚀 Starting test generation`, {
      prompt: finalPrompt,
      style: finalStyle,
      zonePreference,
      analysisAvailable: !!walletAnalysis
    });

    try {
      setProgress(20);
      const { data: { user } } = await supabase.auth.getUser();
      
      const requestPayload = {
        prompt: finalPrompt,
        reference_image_url: null,
        style: finalStyle,
        user_id: user?.id,
        zone_preference: zonePreference,
        wallet_analysis: walletAnalysis
      };

      addLog('info', '📤 Sending request to Edge Function', requestPayload);
      setProgress(40);

      const { data, error } = await supabase.functions.invoke('generate-wallet-mask-v3', {
        body: requestPayload
      });

      setProgress(80);
      const executionTime = Date.now() - startTime;

      if (error) {
        addLog('error', `❌ Edge Function error: ${error.message}`, error);
        throw error;
      }

      setProgress(100);
      addLog('info', '✅ Generation successful', {
        imageUrl: data.image_url,
        layoutJson: data.layout_json,
        executionTime: `${executionTime}ms`
      });

      const testResult: TestResult = {
        id: Date.now().toString(),
        prompt: finalPrompt,
        imageUrl: data.image_url,
        analysisUsed: !!walletAnalysis,
        timestamp: new Date().toISOString(),
        success: true,
        executionTime
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
      setExternalMask(data.image_url);
      
      toast.success(`✅ Test completed in ${executionTime}ms`);

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      addLog('error', `💥 Test failed: ${error.message}`, error);
      
      const testResult: TestResult = {
        id: Date.now().toString(),
        prompt: finalPrompt,
        imageUrl: '',
        analysisUsed: !!walletAnalysis,
        timestamp: new Date().toISOString(),
        success: false,
        executionTime
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
      toast.error(`❌ Test failed after ${executionTime}ms`);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const runAnalysis = async () => {
    addLog('info', '🧠 Starting wallet analysis');
    try {
      await analyzeCurrentWallet();
      addLog('info', '✅ Analysis completed successfully');
      toast.success("Analysis completed!");
    } catch (error: any) {
      addLog('error', `❌ Analysis failed: ${error.message}`);
      toast.error("Analysis failed");
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', '🧹 Logs cleared');
  };

  const exportResults = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      testResults,
      logs: logs.slice(0, 20),
      walletAnalysis
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-mask-test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('info', '📥 Test results exported');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900/20 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <TestTube className="h-8 w-8 text-purple-400" />
              AI Mask Testing Lab
            </h1>
            <p className="text-white/60 mt-2">Layout-aware generation testing environment</p>
          </div>
          
          <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-300">
            🔬 Internal Testing
          </Badge>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="mb-6">
            <Progress value={progress} className="h-2 bg-black/30" />
            <p className="text-white/60 text-sm mt-2">Generating mask... {progress}%</p>
          </div>
        )}

        {/* Main Layout - Simple Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
          {/* Left Panel - Controls (1 column) */}
          <div className="xl:col-span-1 space-y-4">
            <TestControls
              testPrompt={testPrompt}
              setTestPrompt={setTestPrompt}
              testStyle={testStyle}
              setTestStyle={setTestStyle}
              zonePreference={zonePreference}
              setZonePreference={setZonePreference}
              isGenerating={isGenerating}
              isAnalyzing={isAnalyzing}
              walletAnalysis={walletAnalysis}
              onRunTest={() => runTest()}
              onRunAnalysis={runAnalysis}
            />
            
            <QuickTests 
              onRunQuickTest={runTest}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right Panel - Preview (3 columns) */}
          <div className="xl:col-span-3">
            <Card className="bg-black/30 backdrop-blur border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-green-400" />
                  Test Preview Canvas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-8">
                <TestMaskPreview />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Panel - Logs and Results */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Debug Logs */}
          <Card className="bg-black/30 backdrop-blur border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Bug className="h-5 w-5 text-red-400" />
                  Debug Logs ({logs.length})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clearLogs}>
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="p-2 bg-black/20 rounded text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={
                          log.level === 'error' ? "bg-red-500/10 border-red-500/30 text-red-300" :
                          log.level === 'warning' ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300" :
                          "bg-blue-500/10 border-blue-500/30 text-blue-300"
                        }>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-white/50 text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white/80">{log.message}</p>
                    </div>
                  ))}
                  
                  {logs.length === 0 && (
                    <div className="text-center py-8 text-white/50">
                      <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No logs yet. Run a test to see debug info.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="bg-black/30 backdrop-blur border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-green-400" />
                  Test Results ({testResults.length})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <div key={result.id} className="p-3 bg-black/20 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={
                          result.success ? "bg-green-500/10 border-green-500/30 text-green-300" 
                          : "bg-red-500/10 border-red-500/30 text-red-300"
                        }>
                          {result.success ? "✅ Success" : "❌ Failed"}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Clock className="h-3 w-3" />
                          <span>{result.executionTime}ms</span>
                        </div>
                      </div>
                      
                      <p className="text-white/80 text-xs mb-2 p-2 bg-black/30 rounded">
                        "{result.prompt}"
                      </p>
                      
                      <div className="text-xs text-white/60">
                        Analysis: {result.analysisUsed ? "✅" : "❌"} • {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}

                  {testResults.length === 0 && (
                    <div className="text-center py-8 text-white/50">
                      <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No results yet. Run tests to see results.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AiMaskTest;
