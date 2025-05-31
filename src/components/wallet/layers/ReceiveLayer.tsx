
import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, QrCode, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useToast } from '@/hooks/use-toast';

interface CryptoNetwork {
  id: string;
  name: string;
  symbol: string;
  address: string;
  icon: string;
  color: string;
}

const cryptoNetworks: CryptoNetwork[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    address: '52Tm...mBCN',
    icon: '/lovable-uploads/72224164-59bd-4fc3-abf5-d57bbdbee278.png',
    color: '#9945FF'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0xa30b...4Ff4',
    icon: '/lovable-uploads/60caa821-2df9-4d5e-81f1-0e723c7b7193.png',
    color: '#627EEA'
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'BASE',
    address: '0xa30b...4Ff4',
    icon: '/lovable-uploads/a2d78101-8353-4107-915f-b3ee8481a1f7.png',
    color: '#0052FF'
  },
  {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    address: '0xd1d1...c8f9',
    icon: '/lovable-uploads/9dd9ce9c-2158-40cf-98ee-2e189bd56595.png',
    color: '#4CA2FF'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    address: '0xa30b...4Ff4',
    icon: '/lovable-uploads/a5f8972f-b18d-4f17-8799-eeb025813f3b.png',
    color: '#8247E5'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    address: 'bc1q...x7h2',
    icon: '/lovable-uploads/cd33fecf-bff4-4243-bd9d-3f3062e0ba37.png',
    color: '#F7931A'
  }
];

const ReceiveLayer = () => {
  const {
    getStyleForComponent,
    setCurrentLayer,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  // Get component-specific styles
  const overlayStyle = getStyleForComponent('overlays');
  const containerStyle = getStyleForComponent('containers');
  const buttonStyle = getStyleForComponent('buttons');
  const globalStyle = getStyleForComponent('global');

  const handleBack = () => {
    setCurrentLayer('home');
    triggerAiPetInteraction();
    setTemporaryEmotion('happy', 1500);
  };

  const handleClose = () => {
    setCurrentLayer('home');
    triggerAiPetInteraction();
  };

  const handleCopyAddress = (address: string, networkName: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    triggerAiPetInteraction();
    
    toast({
      title: "Address Copied",
      description: `${networkName} address copied to clipboard`,
    });
    
    setTimeout(() => {
      setCopiedAddress(null);
    }, 2000);
  };

  const handleQrCode = (networkName: string) => {
    console.log('QR Code clicked for:', networkName);
    triggerAiPetInteraction();
  };

  return (
    <div 
      className="absolute inset-0 animate-slide-in-bottom"
      style={{
        backgroundColor: overlayStyle.backgroundColor || 'rgba(24, 24, 24, 0.95)',
        backdropFilter: overlayStyle.backdropFilter || 'blur(20px)',
        fontFamily: globalStyle.fontFamily || 'Inter'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
          style={{
            borderRadius: buttonStyle.borderRadius || '8px',
            transition: buttonStyle.transition
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
          <span 
            className="text-white font-medium"
            style={{
              color: globalStyle.textColor,
              fontFamily: globalStyle.fontFamily
            }}
          >
            Back
          </span>
        </button>
        
        <h1 
          className="text-lg font-semibold text-white"
          style={{
            color: globalStyle.textColor,
            fontFamily: globalStyle.fontFamily
          }}
        >
          Receive Crypto
        </h1>
        
        <button
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => handleQrCode('All')}
          style={{
            borderRadius: buttonStyle.borderRadius || '8px',
            transition: buttonStyle.transition
          }}
        >
          <QrCode className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="mb-6">
          <h2 
            className="text-sm font-medium text-white mb-2"
            style={{
              color: globalStyle.textColor,
              fontFamily: globalStyle.fontFamily
            }}
          >
            Select Network
          </h2>
          <p 
            className="text-xs text-gray-400"
            style={{ fontFamily: globalStyle.fontFamily }}
          >
            Choose which network you want to receive crypto on
          </p>
        </div>

        {/* Crypto Networks List */}
        <div 
          className="rounded-xl border overflow-hidden mb-6"
          style={{
            backgroundColor: containerStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
            borderRadius: containerStyle.borderRadius || '16px',
            border: containerStyle.border || '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: containerStyle.backdropFilter
          }}
        >
          {cryptoNetworks.map((network) => (
            <div
              key={network.id}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
              style={{ transition: containerStyle.transition }}
            >
              <div className="flex items-center space-x-3">
                {/* Network Icon */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                  <img
                    src={network.icon}
                    alt={network.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                </div>
                
                {/* Network Info */}
                <div>
                  <div 
                    className="font-medium text-white text-sm"
                    style={{
                      color: globalStyle.textColor,
                      fontFamily: globalStyle.fontFamily
                    }}
                  >
                    {network.name}
                  </div>
                  <div 
                    className="text-xs text-gray-400"
                    style={{ fontFamily: globalStyle.fontFamily }}
                  >
                    {network.symbol}
                  </div>
                </div>
              </div>
              
              {/* Address and Actions */}
              <div className="flex items-center space-x-3">
                <span 
                  className="text-xs text-gray-300 font-mono"
                  style={{ fontFamily: 'monospace' }}
                >
                  {network.address}
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    onClick={() => handleQrCode(network.name)}
                    style={{
                      borderRadius: buttonStyle.borderRadius || '4px',
                      transition: buttonStyle.transition
                    }}
                  >
                    <QrCode className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                  
                  <button
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    onClick={() => handleCopyAddress(network.address, network.name)}
                    style={{
                      borderRadius: buttonStyle.borderRadius || '4px',
                      transition: buttonStyle.transition
                    }}
                  >
                    {copiedAddress === network.address ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Close Button */}
      <div className="p-4 border-t" style={{ borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)' }}>
        <button
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          style={{
            backgroundColor: buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)',
            borderRadius: buttonStyle.borderRadius || '12px',
            transition: buttonStyle.transition,
            color: buttonStyle.textColor || '#FFFFFF',
            fontFamily: globalStyle.fontFamily
          }}
        >
          <X className="w-5 h-5" />
          <span className="font-medium">Close</span>
        </button>
      </div>
    </div>
  );
};

export default ReceiveLayer;
