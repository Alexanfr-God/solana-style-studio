import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletLayoutRecorder, WalletLayout, WalletLayoutLayer } from '@/services/walletLayoutRecorder';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { toast } from 'sonner';
import { Database, Eye, Save, Download, Layers, FileText, Home, Zap } from 'lucide-react';

const WalletLayoutRecorderComponent = () => {
  const { selectedWallet, currentLayer } = useWalletCustomizationStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedLayout, setRecordedLayout] = useState<WalletLayout | null>(null);
  const [showLayoutViewer, setShowLayoutViewer] = useState(false);
  const [showLayersViewer, setShowLayersViewer] = useState(false);
  const [autoRecordEnabled, setAutoRecordEnabled] = useState(true);

  // Auto-record when layer changes to specific layers
  useEffect(() => {
    if (autoRecordEnabled && (currentLayer === 'apps' || currentLayer === 'swap' || currentLayer === 'history' || currentLayer === 'search' || currentLayer === 'send' || currentLayer === 'buy') && !isRecording) {
      console.log(`🎯 Auto-recording ${currentLayer} layer layout...`);
      if (currentLayer === 'apps') {
        handleAutoRecordAppsLayout();
      } else if (currentLayer === 'swap') {
        handleAutoRecordSwapLayout();
      } else if (currentLayer === 'history') {
        handleAutoRecordHistoryLayout();
      } else if (currentLayer === 'search') {
        handleAutoRecordSearchLayout();
      } else if (currentLayer === 'send') {
        handleAutoRecordSendLayout();
      } else if (currentLayer === 'buy') {
        handleAutoRecordBuyLayout();
      }
    }
  }, [currentLayer, autoRecordEnabled]);

  const handleAutoRecordBuyLayout = async () => {
    setIsRecording(true);
    try {
      const walletId = `${selectedWallet}-buy-${Date.now()}`;
      
      const layoutId = await WalletLayoutRecorder.recordAndSaveLayout(
        walletId, 
        'buy', 
        selectedWallet
      );
      
      if (layoutId) {
        const layout = await WalletLayoutRecorder.getLayoutFromDatabase(walletId, 'buy');
        setRecordedLayout(layout);
        
        toast.success(`💰 Buy screen layout auto-recorded! ${layout?.layers?.length || 0} layers detected. ID: ${layoutId}`);
        console.log('🎯 Auto-recorded Buy Layout:', layout);
      } else {
        console.warn('Auto-recording failed for Buy layer');
      }
    } catch (error) {
      console.error('Auto-recording buy error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleAutoRecordSendLayout = async () => {
    setIsRecording(true);
    try {
      const walletId = `${selectedWallet}-send-${Date.now()}`;
      
      const layoutId = await WalletLayoutRecorder.recordAndSaveLayout(
        walletId, 
        'send', 
        selectedWallet
      );
      
      if (layoutId) {
        const layout = await WalletLayoutRecorder.getLayoutFromDatabase(walletId, 'send');
        setRecordedLayout(layout);
        
        toast.success(`📤 Send screen layout auto-recorded! ${layout?.layers?.length || 0} layers detected. ID: ${layoutId}`);
        console.log('🎯 Auto-recorded Send Layout:', layout);
      } else {
        console.warn('Auto-recording failed for Send layer');
      }
    } catch (error) {
      console.error('Auto-recording send error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleAutoRecordAppsLayout = async () => {
    setIsRecording(true);
    try {
      const walletId = `${selectedWallet}-apps-${Date.now()}`;
      
      const layoutId = await WalletLayoutRecorder.recordAndSaveLayout(
        walletId, 
        'apps', 
        selectedWallet
      );
      
      if (layoutId) {
        const layout = await WalletLayoutRecorder.getLayoutFromDatabase(walletId, 'apps');
        setRecordedLayout(layout);
        
        toast.success(`🎨 Apps screen layout auto-recorded! ${layout?.layers?.length || 0} layers detected. ID: ${layoutId}`);
        console.log('🎯 Auto-recorded Apps Layout:', layout);
      } else {
        console.warn('Auto-recording failed for Apps layer');
      }
    } catch (error) {
      console.error('Auto-recording error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleAutoRecordSwapLayout = async () => {
    setIsRecording(true);
    try {
      const walletId = `${selectedWallet}-swap-${Date.now()}`;
      
      const layoutId = await WalletLayoutRecorder.recordAndSaveLayout(
        walletId, 
        'swap', 
        selectedWallet
      );
      
      if (layoutId) {
        const layout = await WalletLayoutRecorder.getLayoutFromDatabase(walletId, 'swap');
        setRecordedLayout(layout);
        
        toast.success(`🔄 Swap screen layout auto-recorded! ${layout?.layers?.length || 0} layers detected. ID: ${layoutId}`);
        console.log('🎯 Auto-recorded Swap Layout:', layout);
      } else {
        console.warn('Auto-recording failed for Swap layer');
      }
    } catch (error) {
      console.error('Auto-recording swap error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleAutoRecordHistoryLayout = async () => {
    setIsRecording(true);
    try {
      const walletId = `${selectedWallet}-history-${Date.now()}`;
      
      const layoutId = await WalletLayoutRecorder.recordAndSaveLayout(
        walletId, 
        'history', 
        selectedWallet
      );
      
      if (layoutId) {
        const layout = await WalletLayoutRecorder.getLayoutFromDatabase(walletId, 'history');
        setRecordedLayout(layout);
        
        toast.success(`📋 History screen layout auto-recorded! ${layout?.layers?.length || 0} layers detected. ID: ${layoutId}`);
        console.log('🎯 Auto-recorded History Layout:', layout);
      } else {
        console.warn('Auto-recording failed for History layer');
      }
    } catch (error) {
      console.error('Auto-recording history error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleAutoRecordSearchLayout = async () => {
    setIsRecording(true);
    try {
      const walletId = `${selectedWallet}-search-${Date.now()}`;
      
      const layoutId = await WalletLayoutRecorder.recordAndSaveLayout(
        walletId, 
        'search', 
        selectedWallet
      );
      
      if (layoutId) {
        const layout = await WalletLayoutRecorder.getLayoutFromDatabase(walletId, 'search');
        setRecordedLayout(layout);
        
        toast.success(`🔍 Search screen layout auto-recorded! ${layout?.layers?.length || 0} layers detected. ID: ${layoutId}`);
        console.log('🎯 Auto-recorded Search Layout:', layout);
      } else {
        console.warn('Auto-recording failed for Search layer');
      }
    } catch (error) {
      console.error('Auto-recording search error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleRecordLayout = async () => {
    setIsRecording(true);
    try {
      const walletId = `${selectedWallet}-demo-${Date.now()}`;
      let screenType: ScreenType = 'login';
      
      // Map current layer to screen type
      if (currentLayer === 'home') {
        screenType = 'wallet';
      } else if (currentLayer === 'apps') {
        screenType = 'apps';
      } else if (currentLayer === 'swap') {
        screenType = 'swap';
      } else if (currentLayer === 'history') {
        screenType = 'history'; // Using 'history' as fallback since 'search' not in ScreenType
      } else if (currentLayer === 'send') {
        screenType = 'receive'; // Using 'receive' as fallback since 'send' not in ScreenType
      } else if (currentLayer === 'buy') {
        screenType = 'buy';
      }
      
      const layoutId = await WalletLayoutRecorder.recordAndSaveLayout(
        walletId, 
        screenType, 
        selectedWallet
      );
      
      if (layoutId) {
        const layout = await WalletLayoutRecorder.getLayoutFromDatabase(walletId, screenType);
        setRecordedLayout(layout);
        
        const screenName = screenType === 'wallet' ? 'Home screen' : 
                          screenType === 'apps' ? 'Apps screen' : 
                          screenType === 'swap' ? 'Swap Interface' : 
                          screenType === 'history' ? 'Transaction History' :
                          screenType === 'buy' ? 'Buy Interface' : 'Login screen';
        
        toast.success(`${screenName} layout recorded with ${layout?.layers?.length || 0} enhanced layers! ID: ${layoutId}`);
        console.log('🎯 Recorded Layout with Enhanced Layers:', layout);
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
    link.download = `wallet-layout-${selectedWallet}-${recordedLayout.screen}-enhanced.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Enhanced layered layout exported successfully!');
  };

  const handleExportLayer = (layer: WalletLayoutLayer) => {
    const dataStr = JSON.stringify(layer, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `layer-${layer.layer_name.toLowerCase().replace(/\s+/g, '-')}-enhanced.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success(`Enhanced layer "${layer.layer_name}" exported successfully!`);
  };

  const getLayerPurpose = (layer: WalletLayoutLayer) => {
    return layer.metadata?.purpose || 'No purpose defined';
  };

  const getLayerInteractionType = (layer: WalletLayoutLayer) => {
    return layer.metadata?.interactionType || 'unknown';
  };

  const getLayerLayoutType = (layer: WalletLayoutLayer) => {
    return layer.metadata?.layoutType || 'unknown';
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="h-5 w-5" />
          Enhanced Layout Recorder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          Record UI elements with enhanced layer classification for targeted AI customization
        </div>

        {/* Auto-record toggle */}
        <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Auto-record Apps, Swap, History, Search, Send & Buy layers</span>
          </div>
          <Button
            size="sm"
            variant={autoRecordEnabled ? "default" : "outline"}
            onClick={() => setAutoRecordEnabled(!autoRecordEnabled)}
          >
            {autoRecordEnabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-300 text-sm font-medium mb-1 flex items-center gap-2">
            <Home className="h-4 w-4" />
            Current Screen: {currentLayer === 'home' ? 'Wallet Home' : 
                           currentLayer === 'apps' ? 'Apps/Collectibles' : 
                           currentLayer === 'swap' ? 'Swap Interface' : 
                           currentLayer === 'history' ? 'Transaction History' :
                           currentLayer === 'search' ? 'Search Interface' : 
                           currentLayer === 'send' ? 'Send Interface' : 
                           currentLayer === 'buy' ? 'Buy Interface' : 'Login'}
          </div>
          <div className="text-blue-200 text-xs">
            Recording will use {currentLayer === 'home' ? 'enhanced home screen' : 
                               currentLayer === 'apps' ? 'apps screen' : 
                               currentLayer === 'swap' ? 'swap screen' : 
                               currentLayer === 'history' ? 'history screen' :
                               currentLayer === 'search' ? 'search screen' : 
                               currentLayer === 'send' ? 'send screen' : 
                               currentLayer === 'buy' ? 'buy screen' : 'login screen'} classification
          </div>
          {(currentLayer === 'apps' || currentLayer === 'swap' || currentLayer === 'history' || currentLayer === 'search' || currentLayer === 'send' || currentLayer === 'buy') && isRecording && (
            <div className="text-green-300 text-xs mt-1 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Auto-recording {currentLayer} layer...
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRecordLayout}
            disabled={isRecording}
            className="flex-1"
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            {isRecording ? 'Recording...' : `Record ${currentLayer === 'home' ? 'Home' : 
                                                    currentLayer === 'apps' ? 'Apps' : 
                                                    currentLayer === 'swap' ? 'Swap Interface' : 
                                                    currentLayer === 'history' ? 'History' :
                                                    currentLayer === 'search' ? 'Search Interface' : 
                                                    currentLayer === 'send' ? 'Send Interface' : 
                                                    currentLayer === 'buy' ? 'Buy Interface' : 'Login'} Layout`}
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
              ✅ Enhanced Multi-Layer Layout Recorded
            </div>
            <div className="text-green-200 text-xs space-y-1">
              <div>Screen: {recordedLayout.screen} ({recordedLayout.screen === 'wallet' ? 'Home' : 
                                                    recordedLayout.screen === 'apps' ? 'Apps/Collectibles' : 
                                                    recordedLayout.screen === 'swap' ? 'Swap Interface' : 
                                                    recordedLayout.screen === 'buy' ? 'Buy Interface' : 'Login'})</div>
              <div>Total Elements: {recordedLayout.elements.length}</div>
              <div>Enhanced Layers: {recordedLayout.layers?.length || 0}</div>
              <div>Dimensions: {recordedLayout.dimensions.width}x{recordedLayout.dimensions.height}</div>
              <div>Wallet: {recordedLayout.walletType}</div>
              <div>Version: {recordedLayout.metadata?.version || '1.0.0'}</div>
            </div>
          </div>
        )}

        {showLayersViewer && recordedLayout?.layers && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 max-h-60 overflow-y-auto">
            <div className="text-purple-300 text-sm font-medium mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Enhanced Layers ({recordedLayout.layers.length})
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
                  <div className="text-purple-300 text-xs space-y-1">
                    <div>Elements: {layer.elements.length}</div>
                    <div>Purpose: {getLayerPurpose(layer)}</div>
                    <div>Interaction: {getLayerInteractionType(layer)}</div>
                    <div>Layout: {getLayerLayoutType(layer)}</div>
                    <div>Types: {[...new Set(layer.elements.map(e => e.type))].join(', ')}</div>
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
