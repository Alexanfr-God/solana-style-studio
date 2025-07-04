
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
    setCurrentLayer
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
  };

  const handleClose = () => {
    setCurrentLayer('home');
  };

  const handleCopyAddress = (address: string, networkName: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    
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
  };

  return (
    <div 
      className="absolute inset-0 animate-slide-in-bottom receive-layer"
      data-element-id="receive-layer"
      style={{
        backgroundColor: overlayStyle.backgroundColor || 'rgba(24, 24, 24, 0.95)',
        backdropFilter: overlayStyle.backdropFilter || 'blur(20px)',
        fontFamily: globalStyle.fontFamily || 'Inter'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b receive-header"
        data-element-id="receive-header"
        style={{
          borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors receive-back-button"
          data-element-id="receive-back-button"
          style={{
            borderRadius: buttonStyle.borderRadius || '8px',
            transition: buttonStyle.transition
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white receive-back-icon" data-element-id="receive-back-icon" />
          <span 
            className="text-white font-medium receive-back-text"
            data-element-id="receive-back-text"
            style={{
              color: globalStyle.textColor,
              fontFamily: globalStyle.fontFamily
            }}
          >
            Back
          </span>
        </button>
        
        <h1 
          className="text-lg font-semibold text-white receive-title"
          data-element-id="receive-title"
          style={{
            color: globalStyle.textColor,
            fontFamily: globalStyle.fontFamily
          }}
        >
          Receive Crypto
        </h1>
        
        <button
          className="p-2 rounded-lg hover:bg-white/10 transition-colors receive-qr-button"
          data-element-id="receive-qr-button"
          onClick={() => handleQrCode('All')}
          style={{
            borderRadius: buttonStyle.borderRadius || '8px',
            transition: buttonStyle.transition
          }}
        >
          <QrCode className="w-5 h-5 text-white receive-qr-icon" data-element-id="receive-qr-icon" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto receive-content" data-element-id="receive-content">
        <div className="mb-6 receive-instructions" data-element-id="receive-instructions">
          <h2 
            className="text-sm font-medium text-white mb-2 receive-instructions-title"
            data-element-id="receive-instructions-title"
            style={{
              color: globalStyle.textColor,
              fontFamily: globalStyle.fontFamily
            }}
          >
            Select Network
          </h2>
          <p 
            className="text-xs text-gray-400 receive-instructions-description"
            data-element-id="receive-instructions-description"
            style={{ fontFamily: globalStyle.fontFamily }}
          >
            Choose which network you want to receive crypto on
          </p>
        </div>

        {/* Crypto Networks List */}
        <div 
          className="rounded-xl border overflow-hidden mb-6 receive-networks-container"
          data-element-id="receive-networks-container"
          style={{
            backgroundColor: containerStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
            borderRadius: containerStyle.borderRadius || '16px',
            border: containerStyle.border || '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: containerStyle.backdropFilter
          }}
        >
          {cryptoNetworks.map((network, index) => (
            <div
              key={network.id}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 receive-network-item"
              data-element-id={`receive-network-item-${index}`}
              style={{ transition: containerStyle.transition }}
            >
              <div className="flex items-center space-x-3">
                {/* Network Icon */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center receive-network-icon-container" data-element-id={`receive-network-icon-container-${index}`}>
                  <img
                    src={network.icon}
                    alt={network.name}
                    className="w-8 h-8 object-cover rounded receive-network-icon"
                    data-element-id={`receive-network-icon-${index}`}
                  />
                </div>
                
                {/* Network Info */}
                <div className="receive-network-info" data-element-id={`receive-network-info-${index}`}>
                  <div 
                    className="font-medium text-white text-sm receive-network-name"
                    data-element-id={`receive-network-name-${index}`}
                    style={{
                      color: globalStyle.textColor,
                      fontFamily: globalStyle.fontFamily
                    }}
                  >
                    {network.name}
                  </div>
                  <div 
                    className="text-xs text-gray-400 receive-network-symbol"
                    data-element-id={`receive-network-symbol-${index}`}
                    style={{ fontFamily: globalStyle.fontFamily }}
                  >
                    {network.symbol}
                  </div>
                </div>
              </div>
              
              {/* Address and Actions */}
              <div className="flex items-center space-x-3 receive-network-actions" data-element-id={`receive-network-actions-${index}`}>
                <span 
                  className="text-xs text-gray-300 font-mono receive-network-address"
                  data-element-id={`receive-network-address-${index}`}
                  style={{ fontFamily: 'monospace' }}
                >
                  {network.address}
                </span>
                
                <div className="flex items-center space-x-2 receive-network-buttons" data-element-id={`receive-network-buttons-${index}`}>
                  <button
                    className="p-1.5 rounded hover:bg-white/10 transition-colors receive-network-qr-button"
                    data-element-id={`receive-network-qr-button-${index}`}
                    onClick={() => handleQrCode(network.name)}
                    style={{
                      borderRadius: buttonStyle.borderRadius || '4px',
                      transition: buttonStyle.transition
                    }}
                  >
                    <QrCode className="w-4 h-4 text-gray-400 hover:text-white receive-network-qr-icon" data-element-id={`receive-network-qr-icon-${index}`} />
                  </button>
                  
                  <button
                    className="p-1.5 rounded hover:bg-white/10 transition-colors receive-network-copy-button"
                    data-element-id={`receive-network-copy-button-${index}`}
                    onClick={() => handleCopyAddress(network.address, network.name)}
                    style={{
                      borderRadius: buttonStyle.borderRadius || '4px',
                      transition: buttonStyle.transition
                    }}
                  >
                    {copiedAddress === network.address ? (
                      <Check className="w-4 h-4 text-green-400 receive-network-copy-success-icon" data-element-id={`receive-network-copy-success-icon-${index}`} />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white receive-network-copy-icon" data-element-id={`receive-network-copy-icon-${index}`} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Close Button */}
      <div className="p-4 border-t receive-footer" data-element-id="receive-footer" style={{ borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)' }}>
        <button
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 receive-close-button"
          data-element-id="receive-close-button"
          style={{
            backgroundColor: buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)',
            borderRadius: buttonStyle.borderRadius || '12px',
            transition: buttonStyle.transition,
            color: buttonStyle.textColor || '#FFFFFF',
            fontFamily: globalStyle.fontFamily
          }}
        >
          <X className="w-5 h-5 receive-close-icon" data-element-id="receive-close-icon" />
          <span className="font-medium receive-close-text" data-element-id="receive-close-text">Close</span>
        </button>
      </div>
    </div>
  );
};

export default ReceiveLayer;
