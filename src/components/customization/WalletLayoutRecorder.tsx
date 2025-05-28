
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletLayoutRecorder, WalletLayout } from '@/services/walletLayoutRecorder';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { toast } from 'sonner';
import { Database, Eye, Save, Download } from 'lucide-react';

const WalletLayoutRecorderComponent = () => {
  const { selectedWallet } = useWalletCustomizationStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedLayout, setRecordedLayout] = useState<WalletLayout | null>(null);
  const [showLayoutViewer, setShowLayoutViewer] = useState(false);

  const handleRecordLayout = async () => {
    setIsRecording(true);
    try {
      const walletId = `${selectedWallet}-demo-${Date.now()}`;
      const layoutId = await WalletLayoutRecorder.recordAndSaveLayout(
        walletId, 
        'login', 
        selectedWallet
      );
      
      if (layoutId) {
        const layout = await WalletLayoutRecorder.getLayoutFromDatabase(walletId, 'login');
        setRecordedLayout(layout);
        toast.success(`Layout recorded successfully! ID: ${layoutId}`);
        console.log('🎯 Recorded Layout:', layout);
      } else {
        toast.error('Failed to record layout');
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Layout recording failed');
    } finally {
      setIsRecording(false);
    }
  };

  const handleExportLayout = () => {
    if (!recordedLayout) return;
    
    const dataStr = JSON.stringify(recordedLayout, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `wallet-layout-${selectedWallet}-${recordedLayout.screen}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Layout exported successfully!');
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="h-5 w-5" />
          Layout Recorder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          Record UI element positions and styles for AI customization
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRecordLayout}
            disabled={isRecording}
            className="flex-1"
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            {isRecording ? 'Recording...' : 'Record Layout'}
          </Button>
          
          <Button
            onClick={() => setShowLayoutViewer(!showLayoutViewer)}
            variant="outline"
            disabled={!recordedLayout}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleExportLayout}
            variant="outline"
            disabled={!recordedLayout}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {recordedLayout && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="text-green-300 text-sm font-medium mb-1">
              ✅ Layout Recorded
            </div>
            <div className="text-green-200 text-xs space-y-1">
              <div>Screen: {recordedLayout.screen}</div>
              <div>Elements: {recordedLayout.elements.length}</div>
              <div>Dimensions: {recordedLayout.dimensions.width}x{recordedLayout.dimensions.height}</div>
              <div>Wallet: {recordedLayout.walletType}</div>
            </div>
          </div>
        )}

        {showLayoutViewer && recordedLayout && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 max-h-60 overflow-y-auto">
            <div className="text-blue-300 text-sm font-medium mb-2">
              Layout Elements ({recordedLayout.elements.length})
            </div>
            <div className="space-y-2 text-xs">
              {recordedLayout.elements.map((element, index) => (
                <div key={index} className="bg-blue-500/10 rounded p-2">
                  <div className="text-blue-200 font-medium">
                    {element.type}: {element.name}
                  </div>
                  <div className="text-blue-300 text-xs">
                    Position: ({element.position.x}, {element.position.y})
                  </div>
                  <div className="text-blue-300 text-xs">
                    Size: {element.size.width}x{element.size.height}
                  </div>
                  {element.content && (
                    <div className="text-blue-300 text-xs">
                      Content: "{element.content}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletLayoutRecorderComponent;
