
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Brain, 
  Zap, 
  Bug, 
  Monitor, 
  Layers, 
  TestTube,
  Play,
  RefreshCw,
  Download,
  Eye,
  Code,
  AlertTriangle
} from 'lucide-react';
import { useCustomizationStore } from '@/stores/customizationStore';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { supabase } from '@/integrations/supabase/client';
import V3MaskPreviewCanvas from '@/components/editor/mask/V3MaskPreviewCanvas';

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
  const [selectedTab, setSelectedTab] = useState('test');

  const { 
    walletAnalysis, 
    activeLayer, 
    analyzeCurrentWallet, 
    isAnalyzing 
  } = useCustomizationStore();

  const { setExternalMask } = useMaskEditorStore();

  // Quick test scenarios
  const quickTests = [
    { prompt: "cute anime character touching the unlock button", style: 'cartoon' as const },
    { prompt: "cyberpunk hacker pointing at the balance display", style: 'modern' as const },
    { prompt: "magical fairy embracing the wallet interface", style: 'fantasy' as const },
    { prompt: "realistic businessman protecting the login screen", style: 'realistic' as const },
    { prompt: "minimalist robot sitting next to the send button", style: 'minimalist' as const }
  ];

  const addLog = (level: TestLog['level'], message: string, data?: any) => {
    const newLog: TestLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const runTest = async (prompt?: string, style?: typeof testStyle) => {
    const finalPrompt = prompt || testPrompt;
    const finalStyle = style || testStyle;
    
    setIsGenerating(true);
    const startTime = Date.now();
    
    addLog('info', `🚀 Starting test generation`, {
      prompt: finalPrompt,
      style: finalStyle,
      zonePreference,
      analysisAvailable: !!walletAnalysis
    });

    try {
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

      const { data, error } = await supabase.functions.invoke('generate-wallet-mask-v3', {
        body: requestPayload
      });

      const executionTime = Date.now() - startTime;

      if (error) {
        addLog('error', `❌ Edge Function error: ${error.message}`, error);
        throw error;
      }

      addLog('info', '✅ Generation successful', {
        imageUrl: data.image_url,
        layoutJson: data.layout_json,
        executionTime: `${executionTime}ms`
      });

      // Store test result
      const testResult: TestResult = {
        id: Date.now().toString(),
        prompt: finalPrompt,
        imageUrl: data.image_url,
        analysisUsed: !!walletAnalysis,
        timestamp: new Date().toISOString(),
        success: true,
        executionTime
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
      setExternalMask(data.image_url);
      
      toast.success(`✅ Test completed in ${executionTime}ms`);

    } catch (error) {
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
    }
  };

  const runAnalysis = async () => {
    addLog('info', '🧠 Starting wallet analysis');
    try {
      await analyzeCurrentWallet();
      addLog('info', '✅ Analysis completed successfully');
      toast.success("Analysis completed!");
    } catch (error) {
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
      logs: logs.slice(0, 20), // Last 20 logs
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <TestTube className="h-8 w-8 text-purple-400" />
              AI Mask Testing Lab
            </h1>
            <p className="text-white/60 mt-2">Internal debugging environment for layout-aware generation</p>
          </div>
          <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-300">
            🔬 Internal Testing Only
          </Badge>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-black/30 border border-white/10">
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Test Generation
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Layout Analysis
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Logs
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Test Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/30 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-400" />
                    Generation Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Test Prompt</label>
                    <Textarea 
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                      placeholder="Describe the character interaction..."
                      className="bg-black/20 border-white/10 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => runTest()}
                      disabled={isGenerating || !testPrompt}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
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
                  </div>

                  <div>
                    <p className="text-xs text-white/70 mb-2">Quick Tests:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {quickTests.map((test, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => runTest(test.prompt, test.style)}
                          disabled={isGenerating}
                          className="text-left justify-start border-white/10 text-white/80 hover:text-white text-xs"
                        >
                          {test.prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-400" />
                    Preview Canvas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-4 bg-black/20 rounded-lg border border-white/10">
                    <V3MaskPreviewCanvas />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-black/30 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Wallet Layout Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button onClick={runAnalysis} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Run Analysis
                        </>
                      )}
                    </Button>
                    
                    <Badge variant="outline" className={
                      walletAnalysis ? "bg-green-500/10 border-green-500/30 text-green-300" 
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                    }>
                      {walletAnalysis ? "✅ Analysis Available" : "⚪ No Analysis"}
                    </Badge>
                  </div>

                  {walletAnalysis && (
                    <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
                      <pre className="text-xs text-white/80 overflow-auto max-h-96">
                        {JSON.stringify(walletAnalysis, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-black/30 backdrop-blur border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-400" />
                    Debug Logs ({logs.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={clearLogs}>
                    Clear Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div key={index} className="p-2 bg-black/20 rounded border border-white/10">
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className={
                            log.level === 'error' ? "bg-red-500/10 border-red-500/30 text-red-300" :
                            log.level === 'warning' ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300" :
                            "bg-blue-500/10 border-blue-500/30 text-blue-300"
                          }>
                            {log.level}
                          </Badge>
                          <span className="text-white/50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-white/80 mt-1 text-sm">{log.message}</p>
                        {log.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-white/60 cursor-pointer">Show data</summary>
                            <pre className="text-xs text-white/70 mt-1 p-2 bg-black/30 rounded overflow-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card className="bg-black/30 backdrop-blur border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-green-400" />
                    Test Results ({testResults.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={exportResults}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result) => (
                    <div key={result.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={
                          result.success ? "bg-green-500/10 border-green-500/30 text-green-300" 
                          : "bg-red-500/10 border-red-500/30 text-red-300"
                        }>
                          {result.success ? "✅ Success" : "❌ Failed"}
                        </Badge>
                        <span className="text-xs text-white/50">{result.executionTime}ms</span>
                      </div>
                      <p className="text-white/80 text-sm mb-2">{result.prompt}</p>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span>Analysis: {result.analysisUsed ? "✅" : "❌"}</span>
                        <span>{new Date(result.timestamp).toLocaleString()}</span>
                      </div>
                      {result.imageUrl && (
                        <img 
                          src={result.imageUrl} 
                          alt="Generated result" 
                          className="mt-2 max-w-32 h-auto rounded border border-white/10"
                        />
                      )}
                    </div>
                  ))}

                  {testResults.length === 0 && (
                    <div className="text-center py-8 text-white/50">
                      <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No test results yet. Run some tests to see results here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AiMaskTest;
