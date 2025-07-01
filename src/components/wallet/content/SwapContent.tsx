
import React, { useState } from 'react';
import { Settings, ArrowUpDown, Info } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const SwapContent = () => {
  const { walletStyle } = useWalletCustomizationStore();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  return (
    <div 
      className="h-full bg-gradient-to-b from-gray-900 to-gray-800 p-6 swap-container"
      data-element-id="swap-container"
      style={{ backgroundColor: walletStyle.backgroundColor || '#1a1a1a' }}
    >
      {/* Settings Icon */}
      <div className="flex justify-end mb-6">
        <button 
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors swap-settings-icon"
          data-element-id="swap-settings-icon"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* From Section */}
        <div 
          className="bg-gray-800 rounded-xl p-4 swap-from-container"
          data-element-id="swap-from-container"
        >
          <div className="flex justify-between items-center mb-2">
            <span 
              className="text-sm text-gray-400 swap-from-label"
              data-element-id="swap-from-label"
            >
              From
            </span>
            <span 
              className="text-sm text-gray-400 swap-from-balance"
              data-element-id="swap-from-balance"
            >
              Balance: 12.45 SOL
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none swap-from-input"
              data-element-id="swap-from-input"
            />
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
              <span className="text-lg">◎</span>
              <span className="font-medium">SOL</span>
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div 
          className="flex justify-center swap-arrow-container"
          data-element-id="swap-arrow-container"
        >
          <button 
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors swap-arrow-icon"
            data-element-id="swap-arrow-icon"
          >
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* To Section */}
        <div 
          className="bg-gray-800 rounded-xl p-4 swap-to-container"
          data-element-id="swap-to-container"
        >
          <div className="flex justify-between items-center mb-2">
            <span 
              className="text-sm text-gray-400 swap-to-label"
              data-element-id="swap-to-label"
            >
              To
            </span>
            <span 
              className="text-sm text-gray-400 swap-to-balance"
              data-element-id="swap-to-balance"
            >
              Balance: 1,250.00 USDC
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="0.0"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none swap-to-input"
              data-element-id="swap-to-input"
            />
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
              <span className="text-lg">$</span>
              <span className="font-medium">USDC</span>
            </div>
          </div>
        </div>

        {/* Rate Info */}
        <div 
          className="flex items-center justify-center space-x-2 text-sm text-gray-400 swap-rate-container"
          data-element-id="swap-rate-container"
        >
          <Info 
            className="w-4 h-4 swap-rate-icon"
            data-element-id="swap-rate-icon"
          />
          <span 
            className="swap-rate-text"
            data-element-id="swap-rate-text"
          >
            1 SOL = 224.7 USDC
          </span>
        </div>

        {/* Swap Button */}
        <button 
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-white transition-colors"
          style={{ backgroundColor: walletStyle.primaryColor || '#9945FF' }}
        >
          Swap
        </button>
      </div>
    </div>
  );
};

export default SwapContent;
