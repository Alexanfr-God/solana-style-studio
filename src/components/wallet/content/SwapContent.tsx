import React, { useState } from 'react';
import { ArrowUpDown, Settings, Info } from 'lucide-react';
import { useWalletTheme } from '@/hooks/useWalletTheme';

const SwapContent = () => {
  const { getSwapLayer, getGlobal } = useWalletTheme();

  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('USDC');

  const swapStyle = getSwapLayer();
  const globalStyle = getGlobal();

  const handleSwap = () => {
    console.log('Swap initiated');
  };

  const handleFlipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Scroll-lock handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="flex-1 px-4 pb-20 overflow-auto invisible-scroll swap-content" 
      data-element-id="swap-content"
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
    >
      {/* Swap Container */}
      <div 
        className="mt-6 p-6 rounded-xl border hover:scale-[1.01] transition-transform duration-200 swap-container"
        data-element-id="swap-container"
        style={{
          backgroundColor: swapStyle.mainContainer?.backgroundColor || 'rgba(255, 255, 255, 0.05)',
          borderRadius: swapStyle.mainContainer?.borderRadius || '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundImage: swapStyle.mainContainer?.backgroundImage,
          transition: globalStyle.transition
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 swap-header" data-element-id="swap-header">
          <h2 
            className="text-xl font-semibold swap-title"
            data-element-id="swap-title"
            style={{
              color: swapStyle.swapTitle?.textColor || '#FFFFFF',
              fontFamily: swapStyle.swapTitle?.fontFamily || globalStyle.fontFamily,
              fontWeight: swapStyle.swapTitle?.fontWeight,
              fontSize: swapStyle.swapTitle?.fontSize
            }}
          >
            Swap
          </h2>
          <button 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors swap-settings"
            data-element-id="swap-settings"
            style={{
              borderRadius: '8px'
            }}
          >
            <Settings 
              className="w-5 h-5 swap-settings-icon" 
              data-element-id="swap-settings-icon"
              style={{ color: swapStyle.settingsIcon?.color || '#aaa' }}
            />
          </button>
        </div>

        {/* From Token Input */}
        <div 
          className="p-4 rounded-xl mb-2 swap-from-container"
          data-element-id="swap-from-container"
          style={{
            backgroundColor: swapStyle.fromContainer?.backgroundColor || 'rgba(255, 255, 255, 0.05)',
            borderRadius: swapStyle.fromContainer?.borderRadius || '12px',
            backgroundImage: swapStyle.fromContainer?.backgroundImage
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span 
              className="text-sm swap-from-label"
              data-element-id="swap-from-label"
              style={{ 
                color: swapStyle.fromLabel?.textColor || '#aaa',
                fontFamily: swapStyle.fromLabel?.fontFamily || globalStyle.fontFamily,
                fontSize: swapStyle.fromLabel?.fontSize
              }}
            >
              From
            </span>
            <span 
              className="text-sm swap-from-balance"
              data-element-id="swap-from-balance"
              style={{ 
                color: swapStyle.fromBalance?.textColor || '#aaa',
                fontFamily: swapStyle.fromBalance?.fontFamily || globalStyle.fontFamily,
                fontSize: swapStyle.fromBalance?.fontSize
              }}
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
              className="flex-1 bg-transparent text-2xl font-medium text-white placeholder-gray-500 focus:outline-none swap-from-input"
              data-element-id="swap-from-input"
              style={{
                fontFamily: globalStyle.fontFamily,
                color: '#FFFFFF'
              }}
            />
            <button 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors swap-from-token-button"
              data-element-id="swap-from-token-button"
              style={{
                backgroundColor: swapStyle.fromCoinTag?.backgroundColor || 'rgba(255, 255, 255, 0.1)',
                borderRadius: swapStyle.fromCoinTag?.borderRadius || '8px',
                transition: globalStyle.transition
              }}
            >
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center swap-from-token-icon" data-element-id="swap-from-token-icon">
                <span className="text-xs font-bold swap-from-token-symbol" data-element-id="swap-from-token-symbol">◎</span>
              </div>
              <span 
                className="font-medium swap-from-token-name"
                data-element-id="swap-from-token-name"
                style={{
                  color: swapStyle.fromCoinTag?.textColor || '#FFFFFF',
                  fontFamily: swapStyle.fromCoinTag?.fontFamily || globalStyle.fontFamily,
                  fontSize: swapStyle.fromCoinTag?.fontSize
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
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              transition: globalStyle.transition
            }}
          >
            <ArrowUpDown 
              className="w-5 h-5 swap-flip-icon" 
              data-element-id="swap-flip-icon"
              style={{ color: swapStyle.arrowIcon?.color || '#fff' }}
            />
          </button>
        </div>

        {/* To Token Input */}
        <div 
          className="p-4 rounded-xl mb-6 swap-to-container"
          data-element-id="swap-to-container"
          style={{
            backgroundColor: swapStyle.toContainer?.backgroundColor || 'rgba(255, 255, 255, 0.05)',
            borderRadius: swapStyle.toContainer?.borderRadius || '12px',
            backgroundImage: swapStyle.toContainer?.backgroundImage
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span 
              className="text-sm swap-to-label"
              data-element-id="swap-to-label"
              style={{ 
                color: swapStyle.toLabel?.textColor || '#aaa',
                fontFamily: swapStyle.toLabel?.fontFamily || globalStyle.fontFamily,
                fontSize: swapStyle.toLabel?.fontSize
              }}
            >
              To
            </span>
            <span 
              className="text-sm swap-to-balance"
              data-element-id="swap-to-balance"
              style={{ 
                color: swapStyle.toBalance?.textColor || '#aaa',
                fontFamily: swapStyle.toBalance?.fontFamily || globalStyle.fontFamily,
                fontSize: swapStyle.toBalance?.fontSize
              }}
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
              className="flex-1 bg-transparent text-2xl font-medium text-white placeholder-gray-500 focus:outline-none swap-to-input"
              data-element-id="swap-to-input"
              style={{
                fontFamily: globalStyle.fontFamily,
                color: '#FFFFFF'
              }}
            />
            <button 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors swap-to-token-button"
              data-element-id="swap-to-token-button"
              style={{
                backgroundColor: swapStyle.toCoinTag?.backgroundColor || 'rgba(255, 255, 255, 0.1)',
                borderRadius: swapStyle.toCoinTag?.borderRadius || '8px',
                transition: globalStyle.transition
              }}
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center swap-to-token-icon" data-element-id="swap-to-token-icon">
                <span className="text-xs font-bold swap-to-token-symbol" data-element-id="swap-to-token-symbol">$</span>
              </div>
              <span 
                className="font-medium swap-to-token-name"
                data-element-id="swap-to-token-name"
                style={{
                  color: swapStyle.toCoinTag?.textColor || '#FFFFFF',
                  fontFamily: swapStyle.toCoinTag?.fontFamily || globalStyle.fontFamily,
                  fontSize: swapStyle.toCoinTag?.fontSize
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
            backgroundColor: swapStyle.rateContainer?.backgroundColor || 'rgba(255, 255, 255, 0.03)',
            borderRadius: swapStyle.rateContainer?.borderRadius || '8px',
            backgroundImage: swapStyle.rateContainer?.backgroundImage
          }}
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Info 
                className="w-4 h-4 swap-info-icon" 
                data-element-id="swap-info-icon"
                style={{ color: swapStyle.infoIcon?.color || '#aaa' }}
              />
              <span 
                className="swap-rate-label"
                data-element-id="swap-rate-label"
                style={{
                  color: swapStyle.rateLabel?.textColor || '#aaa',
                  fontFamily: swapStyle.rateLabel?.fontFamily || globalStyle.fontFamily,
                  fontSize: swapStyle.rateLabel?.fontSize
                }}
              >
                Rate
              </span>
            </div>
            <span 
              className="swap-rate-value"
              data-element-id="swap-rate-value"
              style={{
                color: swapStyle.rateValue?.textColor || '#fff',
                fontFamily: swapStyle.rateValue?.fontFamily || globalStyle.fontFamily,
                fontSize: swapStyle.rateValue?.fontSize
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
            backgroundColor: '#9945FF',
            color: '#FFFFFF',
            borderRadius: '12px',
            fontFamily: globalStyle.fontFamily,
            transition: globalStyle.transition
          }}
        >
          Swap
        </button>
      </div>
    </div>
  );
};

export default SwapContent;
