
import React, { useRef, useState } from 'react';
import { useCustomizationStore, WalletStyle, LayerType } from '../../stores/customizationStore';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import MintNftButton from './ExportToIpfsButton';
import WalletNftCard from './WalletNftCard';
import ImageFeedbackWrapper from '@/components/feedback/ImageFeedbackWrapper';

// Render Login Screen UI
const LoginScreen = ({ style }: { style: WalletStyle }) => {
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: style.textColor,
        fontFamily: style.fontFamily,
        boxShadow: style.boxShadow,
      }}
    >
      {/* Header */}
      <div className="flex justify-center p-6 pt-10">
        <div 
          className="h-14 w-14 rounded-full bg-opacity-20" 
          style={{ backgroundColor: style.accentColor }}
        >
          <div className="flex h-full items-center justify-center">
            <span className="font-bold text-2xl">S</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to Solana</h2>
        <p className="text-sm opacity-80 text-center mb-8">Log in to access your crypto wallet and assets.</p>
        
        {/* Input fields */}
        <div className="w-full max-w-xs space-y-4 mb-6">
          <div 
            className="h-12 rounded-lg px-4 flex items-center"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: style.borderRadius,
            }}
          >
            <span className="opacity-60">Email</span>
          </div>
          <div 
            className="h-12 rounded-lg px-4 flex items-center"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: style.borderRadius,
            }}
          >
            <span className="opacity-60">Password</span>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="w-full max-w-xs space-y-3">
          <button 
            className="w-full h-12 font-medium"
            style={{ 
              backgroundColor: style.buttonColor,
              color: style.buttonTextColor,
              borderRadius: style.borderRadius,
            }}
          >
            Login
          </button>
          <div className="flex justify-center mt-4">
            <span className="text-sm opacity-70">New user? <span style={{ color: style.accentColor }}>Create account</span></span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-6 text-center">
        <span className="text-xs opacity-50">v1.0.0</span>
      </div>
    </div>
  );
};

// Render Wallet Screen UI
const WalletScreen = ({ style }: { style: WalletStyle }) => {
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: style.textColor,
        fontFamily: style.fontFamily,
        boxShadow: style.boxShadow,
      }}
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div 
            className="h-10 w-10 rounded-full bg-opacity-20" 
            style={{ backgroundColor: style.accentColor }}
          >
            <div className="flex h-full items-center justify-center">
              <span className="font-bold">S</span>
            </div>
          </div>
          <span className="font-medium">Solana Wallet</span>
        </div>
        <div 
          className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <span>👤</span>
        </div>
      </div>
      
      {/* Balance */}
      <div className="px-6 py-4">
        <div className="text-sm opacity-70">Total Balance</div>
        <div className="text-3xl font-bold">12.45 SOL</div>
        <div className="text-sm" style={{ color: style.accentColor }}>$236.55 USD</div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-around px-6 py-4">
        <div className="flex flex-col items-center">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: style.buttonColor }}
          >
            <span style={{ color: style.buttonTextColor }}>↑</span>
          </div>
          <span className="text-xs">Send</span>
        </div>
        <div className="flex flex-col items-center">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: style.buttonColor }}
          >
            <span style={{ color: style.buttonTextColor }}>↓</span>
          </div>
          <span className="text-xs">Receive</span>
        </div>
        <div className="flex flex-col items-center">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: style.buttonColor }}
          >
            <span style={{ color: style.buttonTextColor }}>↔</span>
          </div>
          <span className="text-xs">Swap</span>
        </div>
      </div>
      
      {/* Assets List */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Recent Transactions</span>
          <span className="text-sm opacity-70">See all</span>
        </div>
        
        {/* Transaction Item */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: style.borderRadius,
          }}
        >
          <div className="flex items-center">
            <div className="mr-3">
              <div className="font-medium">Received SOL</div>
              <div className="text-xs opacity-70">2 hours ago</div>
            </div>
          </div>
          <div className="text-right text-green-400">
            +2.4 SOL
          </div>
        </div>
        
        {/* Transaction Item */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: style.borderRadius,
          }}
        >
          <div className="flex items-center">
            <div className="mr-3">
              <div className="font-medium">Sent to @friend</div>
              <div className="text-xs opacity-70">1 day ago</div>
            </div>
          </div>
          <div className="text-right">
            -0.5 SOL
          </div>
        </div>
        
        {/* Transaction Item */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: style.borderRadius,
          }}
        >
          <div className="flex items-center">
            <div className="mr-3">
              <div className="font-medium">NFT Purchase</div>
              <div className="text-xs opacity-70">3 days ago</div>
            </div>
          </div>
          <div className="text-right">
            -0.8 SOL
          </div>
        </div>
      </div>
    </div>
  );
};

const WalletPreview = () => {
  const { activeLayer, loginStyle, walletStyle } = useCustomizationStore();
  const { connected, publicKey } = useWallet();
  const currentStyle = activeLayer === 'login' ? loginStyle : walletStyle;
  const walletPreviewRef = useRef<HTMLDivElement>(null);
  const [nftData, setNftData] = useState<{ ipfsUrl: string, imageUrl: string } | null>(null);

  // For feedback purposes
  const previewImageUrl = "/placeholder.svg"; // This would ideally be the actual rendered image
  const previewPrompt = activeLayer === 'login' ? 
    "Login screen with custom styling" : 
    "Wallet screen with custom styling";

  const getShortenedAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = () => {
    if (!publicKey) return;
    
    navigator.clipboard.writeText(publicKey.toString())
      .then(() => toast.success('Address copied to clipboard'))
      .catch(err => console.error('Failed to copy address', err));
  };

  const handleExportSuccess = (ipfsUrl: string, imageUrl: string) => {
    setNftData({ ipfsUrl, imageUrl });
  };

  const closeNftCard = () => {
    setNftData(null);
  };

  return (
    <div className="flex items-center justify-center p-4 h-full w-full">
      <div className="relative max-w-[320px]">
        {nftData ? (
          <WalletNftCard 
            ipfsUrl={nftData.ipfsUrl} 
            imageUrl={nftData.imageUrl} 
            onClose={closeNftCard} 
          />
        ) : (
          <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
            <div ref={walletPreviewRef}>
              {activeLayer === 'login' ? (
                <LoginScreen style={currentStyle} />
              ) : (
                <WalletScreen style={currentStyle} />
              )}
            </div>
          </ImageFeedbackWrapper>
        )}
        
        <div className="absolute top-4 right-4 flex gap-2">
          <Button 
            size="sm" 
            variant={connected ? "default" : "secondary"} 
            className={connected ? "bg-green-700/80 text-white hover:bg-green-700" : "bg-black/30 backdrop-blur-sm text-white"}
          >
            <span className="flex items-center">
              {connected ? '✓ Connected' : '✗ Not Connected'}
            </span>
          </Button>
        </div>
        
        {connected && publicKey && (
          <div className="absolute top-20 left-4">
            <div className="bg-black/30 backdrop-blur-sm p-2 rounded-lg flex items-center gap-2">
              <div className="text-xs text-white">
                <div>Wallet address</div>
                <div className="flex items-center gap-1">
                  <span className="font-mono">{getShortenedAddress(publicKey.toString())}</span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 text-white"
                    onClick={handleCopyAddress}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!nftData && (
          <div className="absolute bottom-4 right-4">
            <div className="bg-black/30 backdrop-blur-sm p-2 rounded-lg">
              <MintNftButton targetRef={walletPreviewRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPreview;
