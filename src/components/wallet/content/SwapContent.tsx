
import React, { useState } from 'react';
import { ArrowUpDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const SwapContent = () => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const { getStyleForComponent } = useWalletCustomizationStore();

  const containersStyle = getStyleForComponent('containers');
  const cardsStyle = getStyleForComponent('cards');
  const buttonsStyle = getStyleForComponent('buttons');
  const inputsStyle = getStyleForComponent('inputs');

  return (
    <div 
      className="flex-1 p-4 space-y-6 overflow-y-auto"
      data-layer="swap"
      data-component="swap-content"
    >
      {/* Swap Container */}
      <div 
        className="p-6 rounded-2xl border"
        data-component="swap-container"
        style={{
          backgroundColor: containersStyle.backgroundColor || 'var(--wallet-bg-secondary, rgba(255, 255, 255, 0.05))',
          backdropFilter: containersStyle.backdropFilter || 'blur(16px)',
          borderRadius: containersStyle.borderRadius || '16px',
          border: containersStyle.border || '1px solid var(--wallet-color-secondary, rgba(255, 255, 255, 0.1))',
          boxShadow: containersStyle.boxShadow || '0 4px 20px rgba(153, 69, 255, 0.15)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
            Swap
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-white/10"
          >
            <Settings className="h-4 w-4" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }} />
          </Button>
        </div>

        {/* From Token */}
        <div 
          className="p-4 rounded-xl border mb-4"
          data-component="swap-from-token"
          style={{
            backgroundColor: cardsStyle.backgroundColor || 'var(--wallet-bg-secondary, rgba(255, 255, 255, 0.03))',
            borderRadius: cardsStyle.borderRadius || '12px',
            border: cardsStyle.border || '1px solid var(--wallet-color-primary, rgba(153, 69, 255, 0.3))',
            boxShadow: cardsStyle.boxShadow || '0 2px 8px rgba(153, 69, 255, 0.1)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-70" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
              From
            </span>
            <span className="text-sm opacity-70" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
              Balance: 12.345
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: 'var(--wallet-color-primary, #9945FF)20',
                color: 'var(--wallet-color-primary, #9945FF)'
              }}
            >
              ◎
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full bg-transparent text-xl font-semibold outline-none"
                style={{
                  color: 'var(--wallet-color-text, #FFFFFF)',
                  fontFamily: inputsStyle.fontFamily || 'var(--wallet-font-primary, Inter)'
                }}
              />
              <div className="text-sm opacity-70" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
                SOL
              </div>
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center mb-4">
          <button 
            className="p-2 rounded-full border transition-all duration-200 hover:scale-110"
            data-component="swap-arrow"
            style={{
              backgroundColor: 'var(--wallet-color-secondary, rgba(255, 255, 255, 0.1))',
              border: '1px solid var(--wallet-color-secondary, rgba(255, 255, 255, 0.2))'
            }}
          >
            <ArrowUpDown className="h-4 w-4" style={{ color: 'var(--wallet-color-accent, #14F195)' }} />
          </button>
        </div>

        {/* To Token */}
        <div 
          className="p-4 rounded-xl border mb-6"
          data-component="swap-to-token"
          style={{
            backgroundColor: cardsStyle.backgroundColor || 'var(--wallet-bg-secondary, rgba(255, 255, 255, 0.03))',
            borderRadius: cardsStyle.borderRadius || '12px',
            border: cardsStyle.border || '1px solid var(--wallet-color-accent, rgba(20, 241, 149, 0.3))',
            boxShadow: cardsStyle.boxShadow || '0 2px 8px rgba(20, 241, 149, 0.1)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-70" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
              To
            </span>
            <span className="text-sm opacity-70" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
              Balance: 0.000
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: 'var(--wallet-color-accent, #14F195)20',
                color: 'var(--wallet-color-accent, #14F195)'
              }}
            >
              Ξ
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="0.0"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="w-full bg-transparent text-xl font-semibold outline-none"
                style={{
                  color: 'var(--wallet-color-text, #FFFFFF)',
                  fontFamily: inputsStyle.fontFamily || 'var(--wallet-font-primary, Inter)'
                }}
              />
              <div className="text-sm opacity-70" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
                ETH
              </div>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <Button 
          className="w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
          data-component="swap-button"
          style={{
            backgroundColor: buttonsStyle.backgroundColor || buttonsStyle.gradient || 'var(--wallet-color-primary, #9945FF)',
            background: buttonsStyle.gradient || buttonsStyle.backgroundColor || 'linear-gradient(135deg, var(--wallet-color-primary, #9945FF), var(--wallet-color-accent, #14F195))',
            color: buttonsStyle.textColor || 'var(--wallet-color-text, #FFFFFF)',
            borderRadius: buttonsStyle.borderRadius || '12px',
            boxShadow: buttonsStyle.boxShadow || '0 4px 12px rgba(153, 69, 255, 0.3)',
            fontFamily: 'var(--wallet-font-primary, Inter)'
          }}
        >
          Swap Tokens
        </Button>

        {/* Swap Details */}
        <div className="mt-4 space-y-2 text-sm opacity-70" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
          <div className="flex justify-between">
            <span>Rate</span>
            <span>1 SOL = 0.0234 ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Fee</span>
            <span>0.3%</span>
          </div>
          <div className="flex justify-between">
            <span>Minimum received</span>
            <span>0.0232 ETH</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapContent;
