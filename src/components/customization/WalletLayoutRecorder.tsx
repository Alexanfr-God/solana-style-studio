
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletLayoutRecorder, WalletLayout, WalletLayoutLayer } from '@/services/walletLayoutRecorder';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { toast } from 'sonner';
import { Database, Eye, Save, Download, Layers, FileText } from 'lucide-react';

const WalletLayoutRecorderComponent = () => {
  const { selectedWallet } = useWalletCustomizationStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedLayout, setRecordedLayout] = useState<WalletLayout | null>(null);
  const [showLayoutViewer, setShowLayoutViewer] = useState(false);
  const [showLayersViewer, setShowLayersViewer] = useState(false);

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
        toast.success(`Layout recorded with ${layout?.layers?.length || 0} layers! ID: ${layoutId}`);
        console.log('🎯 Recorded Layout with Layers:', layout);
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
    link.download = `wallet-layout-${selectedWallet}-${recordedLayout.screen}-layered.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Layered layout exported successfully!');
  };

  const handleExportLayer = (layer: WalletLayoutLayer) => {
    const dataStr = JSON.stringify(layer, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `layer-${layer.layer_name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success(`Layer "${layer.layer_name}" exported successfully!`);
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
          Record UI elements with multi-layer structure for AI customization
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
            onClick={() => setShowLayersViewer(!showLayersViewer)}
            variant="outline"
            disabled={!recordedLayout?.layers}
          >
            <Layers className="h-4 w-4" />
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
              ✅ Multi-Layer Layout Recorded
            </div>
            <div className="text-green-200 text-xs space-y-1">
              <div>Screen: {recordedLayout.screen}</div>
              <div>Total Elements: {recordedLayout.elements.length}</div>
              <div>Layers: {recordedLayout.layers?.length || 0}</div>
              <div>Dimensions: {recordedLayout.dimensions.width}x{recordedLayout.dimensions.height}</div>
              <div>Wallet: {recordedLayout.walletType}</div>
            </div>
          </div>
        )}

        {showLayersViewer && recordedLayout?.layers && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 max-h-60 overflow-y-auto">
            <div className="text-purple-300 text-sm font-medium mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Layers ({recordedLayout.layers.length})
            </div>
            <div className="space-y-2 text-xs">
              {recordedLayout.layers.map((layer, index) => (
                <div key={index} className="bg-purple-500/10 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-purple-200 font-medium">
                      {layer.layer_name} (Order: {layer.layer_order})
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExportLayer(layer)}
                      className="h-6 w-6 p-0 text-purple-300 hover:text-purple-100"
                    >
                      <FileText className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-purple-300 text-xs">
                    Elements: {layer.elements.length}
                  </div>
                  <div className="text-purple-300 text-xs">
                    Types: {[...new Set(layer.elements.map(e => e.type))].join(', ')}
                  </div>
                </div>
              ))}
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
