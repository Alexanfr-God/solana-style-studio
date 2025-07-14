
import React, { useState } from 'react';
import { Copy, Check, QrCode, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
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
  const { setCurrentLayer } = useWalletCustomizationStore();
  const { getReceiveLayer, getAssetCard, getTransition } = useWalletTheme();
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  // Get receiveLayer and assetCard styles from theme
  const receiveLayerStyle = getReceiveLayer();
  const assetCard = getAssetCard();

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
      className="absolute inset-0 flex items-end justify-center bg-black bg-opacity-50 z-50"
      data-element-id="receive-layer-overlay"
    >
      <div 
        className="w-full max-w-md bg-gray-900 rounded-t-2xl animate-slide-in-bottom receive-layer-sheet"
        data-element-id="receive-layer-sheet"
        style={{
          maxHeight: '80vh',
          fontFamily: receiveLayerStyle.selectNetworkLabel?.fontFamily || 'Inter, sans-serif'
        }}
      >
        {/* Center Container - Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto receive-center-container"
          data-element-id="receive-center-container"
          style={{
            backgroundColor: receiveLayerStyle.centerContainer?.backgroundColor,
            backgroundImage: receiveLayerStyle.centerContainer?.backgroundImage ? `url(${receiveLayerStyle.centerContainer.backgroundImage})` : undefined,
            borderRadius: receiveLayerStyle.centerContainer?.borderRadius || '0px'
          }}
        >
          <div className="px-4 py-6 receive-content" data-element-id="receive-content">
            <div className="mb-6 receive-instructions" data-element-id="receive-instructions">
              <h2 
                className="text-sm font-medium mb-2 receive-instructions-title"
                data-element-id="receive-instructions-title"
                style={{
                  color: receiveLayerStyle.selectNetworkLabel?.textColor || '#FFFFFF',
                  fontFamily: receiveLayerStyle.selectNetworkLabel?.fontFamily || 'Inter, sans-serif',
                  fontWeight: receiveLayerStyle.selectNetworkLabel?.fontWeight || 'bold',
                  fontSize: receiveLayerStyle.selectNetworkLabel?.fontSize || '17px'
                }}
              >
                Select Network
              </h2>
              <p 
                className="text-xs receive-instructions-description"
                data-element-id="receive-instructions-description"
                style={{ 
                  color: receiveLayerStyle.selectNetworkDescription?.textColor || '#aaa',
                  fontFamily: receiveLayerStyle.selectNetworkDescription?.fontFamily || 'Inter, sans-serif',
                  fontSize: receiveLayerStyle.selectNetworkDescription?.fontSize || '15px'
                }}
              >
                Choose which network you want to receive crypto on
              </p>
            </div>

            {/* Crypto Networks List - Using assetCard */}
            <div className="space-y-3 mb-6 receive-networks-container" data-element-id="receive-networks-container">
              {cryptoNetworks.map((network, index) => (
                <div
                  key={network.id}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors receive-network-item"
                  data-element-id={`receive-network-item-${index}`}
                  style={{ 
                    transition: getTransition('default'),
                    backgroundColor: assetCard.backgroundColor,
                    borderRadius: assetCard.borderRadius
                  }}
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
                        className="font-medium text-sm receive-network-name"
                        data-element-id={`receive-network-name-${index}`}
                        style={{
                          color: assetCard.title?.textColor || '#FFFFFF',
                          fontFamily: assetCard.title?.fontFamily || 'Inter, sans-serif',
                          fontWeight: assetCard.title?.fontWeight || 'bold',
                          fontSize: assetCard.title?.fontSize || '16px'
                        }}
                      >
                        {network.name}
                      </div>
                      <div 
                        className="text-xs receive-network-symbol"
                        data-element-id={`receive-network-symbol-${index}`}
                        style={{ 
                          color: assetCard.description?.textColor || '#aaa',
                          fontFamily: assetCard.description?.fontFamily || 'Inter, sans-serif',
                          fontSize: assetCard.description?.fontSize || '14px'
                        }}
                      >
                        {network.symbol}
                      </div>
                    </div>
                  </div>
                  
                  {/* Address and Actions */}
                  <div className="flex items-center space-x-3 receive-network-actions" data-element-id={`receive-network-actions-${index}`}>
                    <span 
                      className="text-xs font-mono receive-network-address"
                      data-element-id={`receive-network-address-${index}`}
                      style={{ 
                        color: assetCard.value?.textColor || '#FFFFFF',
                        fontFamily: assetCard.value?.fontFamily || 'monospace',
                        fontSize: assetCard.value?.fontSize || '15px'
                      }}
                    >
                      {network.address}
                    </span>
                    
                    <div className="flex items-center space-x-2 receive-network-buttons" data-element-id={`receive-network-buttons-${index}`}>
                      <button
                        className="p-1.5 rounded hover:bg-white/10 transition-colors receive-network-qr-button"
                        data-element-id={`receive-network-qr-button-${index}`}
                        onClick={() => handleQrCode(network.name)}
                        style={{
                          borderRadius: '4px',
                          transition: getTransition('default')
                        }}
                      >
                        <QrCode 
                          className="w-4 h-4 hover:text-white receive-network-qr-icon" 
                          data-element-id={`receive-network-qr-icon-${index}`}
                          style={{ color: assetCard.icon?.color || '#FFFFFF' }}
                        />
                      </button>
                      
                      <button
                        className="p-1.5 rounded hover:bg-white/10 transition-colors receive-network-copy-button"
                        data-element-id={`receive-network-copy-button-${index}`}
                        onClick={() => handleCopyAddress(network.address, network.name)}
                        style={{
                          borderRadius: '4px',
                          transition: getTransition('default')
                        }}
                      >
                        {copiedAddress === network.address ? (
                          <Check className="w-4 h-4 text-green-400 receive-network-copy-success-icon" data-element-id={`receive-network-copy-success-icon-${index}`} />
                        ) : (
                          <Copy 
                            className="w-4 h-4 hover:text-white receive-network-copy-icon" 
                            data-element-id={`receive-network-copy-icon-${index}`}
                            style={{ color: assetCard.icon?.color || '#FFFFFF' }}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-4 receive-footer" 
          data-element-id="receive-footer" 
          style={{ 
            backgroundColor: receiveLayerStyle.footer?.backgroundColor,
            backgroundImage: receiveLayerStyle.footer?.backgroundImage ? `url(${receiveLayerStyle.footer.backgroundImage})` : undefined
          }}
        >
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 receive-close-button"
            data-element-id="receive-close-button"
            style={{
              backgroundColor: receiveLayerStyle.footer?.closeButton?.backgroundColor || '#FFD166',
              borderRadius: receiveLayerStyle.footer?.closeButton?.borderRadius || '12px',
              transition: getTransition('default'),
              color: receiveLayerStyle.footer?.closeButton?.textColor || '#181818',
              fontFamily: receiveLayerStyle.footer?.closeButton?.fontFamily || 'Inter, sans-serif',
              fontWeight: receiveLayerStyle.footer?.closeButton?.fontWeight || 'bold',
              fontSize: receiveLayerStyle.footer?.closeButton?.fontSize || '16px'
            }}
          >
            <X className="w-5 h-5 receive-close-icon" data-element-id="receive-close-icon" />
            <span className="font-medium receive-close-text" data-element-id="receive-close-text">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveLayer;
