
import React from 'react';
import ImageUploadSection from '@/components/customization/ImageUploadSection';
import WalletPreviewContainer from '@/components/customization/WalletPreviewContainer';
import CustomizeWalletButton from '@/components/customization/CustomizeWalletButton';
import WalletLayoutRecorderComponent from '@/components/customization/WalletLayoutRecorder';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { RotateCcw, Lock } from 'lucide-react';

const WalletAlivePlayground = () => {
  const { resetWallet, lockWallet } = useWalletCustomizationStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Wallet UI Customization Studio
          </h1>
          <p className="text-gray-400 text-lg">
            AI-powered wallet interface customization with AI Pet circulation
          </p>
          <div className="mt-2 inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-3 py-1 rounded-full">
            🤖 AI Style Analysis + Pet Orbit Enabled
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Combined Image Upload & AI Style Analysis */}
            <ImageUploadSection />
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <CustomizeWalletButton />
              
              <Button 
                variant="outline" 
                onClick={lockWallet}
                className="w-full border-orange-500/50 text-orange-300 hover:bg-orange-500/10"
              >
                <Lock className="mr-2 h-4 w-4" />
                Lock Wallet (Go to Login)
              </Button>
              
              <Button 
                variant="outline" 
                onClick={resetWallet}
                className="w-full border-white/20 text-white/80 hover:text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
            </div>
            
            {/* Layout Recorder */}
            <WalletLayoutRecorderComponent />
            
            {/* Development Notes */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">🚀 AI Features Active</h4>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• ✅ AI Style Analysis & Component Styling</li>
                <li>• ✅ AI Pet Orbital Circulation (30% outside)</li>
                <li>• ✅ Style Library with Like System</li>
                <li>• ✅ Comprehensive Component Storage</li>
                <li>• 🔄 GPT-4 Vision Integration (Backend)</li>
                <li>• 🔄 Google Fonts API Integration</li>
                <li>• 🔄 DALL-E Icon Generation</li>
              </ul>
            </div>

            {/* AI Pet Status */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-purple-300 font-medium mb-2">🐾 AI Pet Status</h4>
              <div className="text-purple-200 text-sm space-y-1">
                <p>• Orbital circulation around wallet</p>
                <p>• Expands wallet boundaries by 30%</p>
                <p>• Reactive to user interactions</p>
                <p>• Smooth orbital animations</p>
              </div>
            </div>
          </div>
          
          {/* Right Column - Wallet Preview */}
          <div className="lg:col-span-2">
            <WalletPreviewContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAlivePlayground;
