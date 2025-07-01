
import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

interface ReceiveLayerProps {
  onBack: () => void;
}

const ReceiveLayer = ({ onBack }: ReceiveLayerProps) => {
  const { walletStyle } = useWalletCustomizationStore();
  const [selectedNetwork, setSelectedNetwork] = useState<'solana' | 'ethereum'>('solana');
  const [copied, setCopied] = useState(false);

  const walletAddresses = {
    solana: '3QLojKGjuW7hKXJGJKxFdGKqJKx2KxJGJKxFdGKqJKx2',
    ethereum: '0x742d35Cc6534C0532925a3b8D0521Cc7537648a9'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddresses[selectedNetwork]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col receive-header"
      data-element-id="receive-header"
      style={{ 
        backgroundColor: walletStyle.backgroundColor || '#1a1a1a',
        fontFamily: walletStyle.fontFamily || 'Inter'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors receive-back-button"
          data-element-id="receive-back-button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 
          className="text-lg font-semibold receive-title"
          data-element-id="receive-title"
        >
          Receive
        </h1>
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors receive-close-button"
          data-element-id="receive-close-button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Network Selection Tabs */}
      <div 
        className="flex border-b border-gray-700 receive-network-tabs"
        data-element-id="receive-network-tabs"
      >
        <button
          onClick={() => setSelectedNetwork('solana')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors receive-solana-tab ${
            selectedNetwork === 'solana'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          data-element-id="receive-solana-tab"
        >
          Solana
        </button>
        <button
          onClick={() => setSelectedNetwork('ethereum')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors receive-ethereum-tab ${
            selectedNetwork === 'ethereum'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          data-element-id="receive-ethereum-tab"
        >
          Ethereum
        </button>
      </div>

      {/* Address Display */}
      <div 
        className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 receive-address-container"
        data-element-id="receive-address-container"
      >
        {/* QR Code Placeholder */}
        <div 
          className="w-48 h-48 bg-white rounded-lg flex items-center justify-center receive-qr-code"
          data-element-id="receive-qr-code"
        >
          <div className="text-gray-800 text-center">
            <div className="text-sm font-medium">QR Code</div>
            <div className="text-xs mt-1">
              {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)} Address
            </div>
          </div>
        </div>

        {/* Address Text */}
        <div className="w-full max-w-sm space-y-3">
          <div 
            className="bg-gray-800 rounded-lg p-4 text-center receive-address-text"
            data-element-id="receive-address-text"
          >
            <div className="text-sm text-gray-400 mb-2">
              {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)} Address
            </div>
            <div className="font-mono text-sm break-all text-gray-200">
              {walletAddresses[selectedNetwork]}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 receive-copy-button"
            data-element-id="receive-copy-button"
            style={{ backgroundColor: walletStyle.primaryColor || '#9945FF' }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Address</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div 
        className="p-4 border-t border-gray-700 receive-instructions"
        data-element-id="receive-instructions"
      >
        <p 
          className="text-sm text-gray-400 text-center receive-warning-text"
          data-element-id="receive-warning-text"
        >
          Only send {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)} and {selectedNetwork === 'solana' ? 'SPL' : 'ERC-20'} tokens to this address.
        </p>
      </div>
    </div>
  );
};

export default ReceiveLayer;
