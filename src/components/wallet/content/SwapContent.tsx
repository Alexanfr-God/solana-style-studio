import React, { useState } from 'react';
import { ArrowUpDown, Settings, Info } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const SwapContent = () => {
  const {
    getStyleForComponent
  } = useWalletCustomizationStore();

  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('USDC');

  // Get component-specific styles
  const containerStyle = getStyleForComponent('containers');
  const inputStyle = getStyleForComponent('searchInputs');
  const buttonStyle = getStyleForComponent('buttons');
  const panelStyle = getStyleForComponent('panels');
  const globalStyle = getStyleForComponent('global');

  const handleSwap = () => {
    console.log('Swap initiated');
  };

  const handleFlipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="flex-1 px-4 pb-20 overflow-auto swap-content" data-element-id="swap-content">
      {/* Swap Container */}
      <div 
        className="mt-6 p-6 rounded-xl border hover:scale-[1.01] transition-transform duration-200 swap-container"
        data-element-id="swap-container"
        style={{
          backgroundColor: containerStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
          borderRadius: containerStyle.borderRadius || '16px',
          border: containerStyle.border || '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: containerStyle.boxShadow,
          backdropFilter: containerStyle.backdropFilter,
          transition: containerStyle.transition
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 swap-header" data-element-id="swap-header">
          <h2 
            className="text-xl font-semibold swap-title"
            data-element-id="swap-title"
            style={{
              color: globalStyle.textColor || '#FFFFFF',
              fontFamily: globalStyle.fontFamily
            }}
          >
            Swap
          </h2>
          <button 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors swap-settings"
            data-element-id="swap-settings"
            style={{
              borderRadius: buttonStyle.borderRadius || '8px'
            }}
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* From Token Input */}
        <div 
          className="p-4 rounded-xl mb-2 swap-from-container"
          data-element-id="swap-from-container"
          style={{
            backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
            borderRadius: panelStyle.borderRadius || '12px',
            border: panelStyle.border,
            backdropFilter: panelStyle.backdropFilter
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span 
              className="text-sm text-gray-400"
              style={{ fontFamily: globalStyle.fontFamily }}
            >
              From
            </span>
            <span 
              className="text-sm text-gray-400"
              style={{ fontFamily: globalStyle.fontFamily }}
            >
              Balance: 5.03737 SOL
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-medium text-white placeholder-gray-500 focus:outline-none"
              style={{
                fontFamily: globalStyle.fontFamily,
                color: globalStyle.textColor
              }}
            />
            <button 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{
                backgroundColor: buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)',
                borderRadius: buttonStyle.borderRadius || '8px',
                transition: buttonStyle.transition
              }}
            >
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">◎</span>
              </div>
              <span 
                className="font-medium"
                style={{
                  color: buttonStyle.textColor || '#FFFFFF',
                  fontFamily: globalStyle.fontFamily
                }}
              >
                {fromToken}
              </span>
            </button>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center my-4">
          <button
            onClick={handleFlipTokens}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-110 swap-flip-button"
            data-element-id="swap-flip-button"
            style={{
              backgroundColor: buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              transition: buttonStyle.transition
            }}
          >
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* To Token Input */}
        <div 
          className="p-4 rounded-xl mb-6 swap-to-container"
          data-element-id="swap-to-container"
          style={{
            backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
            borderRadius: panelStyle.borderRadius || '12px',
            border: panelStyle.border,
            backdropFilter: panelStyle.backdropFilter
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span 
              className="text-sm text-gray-400"
              style={{ fontFamily: globalStyle.fontFamily }}
            >
              To
            </span>
            <span 
              className="text-sm text-gray-400"
              style={{ fontFamily: globalStyle.fontFamily }}
            >
              Balance: 0 USDC
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="0.0"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-medium text-white placeholder-gray-500 focus:outline-none"
              style={{
                fontFamily: globalStyle.fontFamily,
                color: globalStyle.textColor
              }}
            />
            <button 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{
                backgroundColor: buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)',
                borderRadius: buttonStyle.borderRadius || '8px',
                transition: buttonStyle.transition
              }}
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">$</span>
              </div>
              <span 
                className="font-medium"
                style={{
                  color: buttonStyle.textColor || '#FFFFFF',
                  fontFamily: globalStyle.fontFamily
                }}
              >
                {toToken}
              </span>
            </button>
          </div>
        </div>

        {/* Swap Info */}
        <div 
          className="p-3 rounded-lg mb-6 swap-info"
          data-element-id="swap-info"
          style={{
            backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.03)',
            borderRadius: panelStyle.borderRadius || '8px'
          }}
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-gray-400" />
              <span 
                className="text-gray-400"
                style={{ fontFamily: globalStyle.fontFamily }}
              >
                Rate
              </span>
            </div>
            <span 
              className="text-white"
              style={{
                color: globalStyle.textColor,
                fontFamily: globalStyle.fontFamily
              }}
            >
              1 SOL ≈ 224.7 USDC
            </span>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="w-full py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 swap-button"
          data-element-id="swap-button"
          style={{
            backgroundColor: buttonStyle.backgroundColor || '#9945FF',
            background: buttonStyle.gradient || buttonStyle.backgroundColor,
            color: buttonStyle.textColor || '#FFFFFF',
            borderRadius: buttonStyle.borderRadius || '12px',
            boxShadow: buttonStyle.boxShadow,
            fontFamily: globalStyle.fontFamily,
            transition: buttonStyle.transition
          }}
        >
          Swap
        </button>
      </div>
    </div>
  );
};

export default SwapContent;
