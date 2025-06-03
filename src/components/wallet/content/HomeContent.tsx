
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const HomeContent = () => {
  const { tokens, totalBalance, totalChange, isBalancePositive, getStyleForComponent } = useWalletCustomizationStore();
  
  const panelsStyle = getStyleForComponent('panels');
  const cardsStyle = getStyleForComponent('cards');

  return (
    <div className="flex-1 p-4 space-y-6 overflow-y-auto" data-component="home-content">
      {/* Balance Section */}
      <div 
        className="p-6 rounded-2xl border"
        data-component="balance-section"
        style={{
          backgroundColor: panelsStyle.backgroundColor || 'var(--wallet-bg-secondary, rgba(255, 255, 255, 0.05))',
          backdropFilter: panelsStyle.backdropFilter || 'blur(10px)',
          borderRadius: panelsStyle.borderRadius || '16px',
          border: panelsStyle.border || '1px solid var(--wallet-color-secondary, rgba(255, 255, 255, 0.1))',
          boxShadow: panelsStyle.boxShadow || '0 2px 16px rgba(153, 69, 255, 0.15)'
        }}
      >
        <div className="text-center">
          <p className="text-sm opacity-70 mb-2">Total Balance</p>
          <h2 className="text-3xl font-bold mb-1" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
            {totalBalance}
          </h2>
          <p 
            className={`text-sm ${isBalancePositive ? 'text-green-400' : 'text-red-400'}`}
            style={{ color: isBalancePositive ? '#10B981' : 'var(--wallet-color-accent, #EF4444)' }}
          >
            {totalChange}
          </p>
        </div>
      </div>

      {/* Assets Section */}
      <div 
        className="space-y-3"
        data-component="assets-container"
        style={{
          backgroundColor: 'transparent'
        }}
      >
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
            Assets
          </h3>
          <button 
            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--wallet-color-accent, #9945FF)' }}
          >
            See all
          </button>
        </div>
        
        <div className="space-y-2">
          {tokens.map((token) => (
            <div 
              key={token.id}
              className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
              data-component="asset-item"
              style={{
                backgroundColor: cardsStyle.backgroundColor || 'var(--wallet-bg-secondary, rgba(255, 255, 255, 0.05))',
                borderRadius: cardsStyle.borderRadius || '12px',
                border: cardsStyle.border || '1px solid var(--wallet-color-secondary, rgba(255, 255, 255, 0.1))',
                boxShadow: cardsStyle.boxShadow || '0 2px 8px rgba(153, 69, 255, 0.1)'
              }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                  data-component="asset-icon"
                  style={{
                    backgroundColor: 'var(--wallet-color-primary, #9945FF)20',
                    color: 'var(--wallet-color-primary, #9945FF)'
                  }}
                >
                  {token.icon}
                </div>
                <div>
                  <div 
                    className="font-medium"
                    data-component="asset-name"
                    style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}
                  >
                    {token.name}
                  </div>
                  <div 
                    className="text-sm opacity-70"
                    data-component="asset-balance"
                    style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}
                  >
                    {token.amount} {token.symbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div 
                  className="font-medium"
                  data-component="asset-value"
                  style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}
                >
                  {token.value}
                </div>
                <div 
                  className={`text-sm ${token.isPositive ? 'text-green-400' : 'text-red-400'}`}
                >
                  {token.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div 
        className="space-y-3"
        data-component="transactions-container"
      >
        <h3 className="text-lg font-semibold px-2" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
          Recent Transactions
        </h3>
        
        <div className="space-y-2">
          {[
            { type: 'Received', amount: '+2.4 SOL', time: '2 hours ago', positive: true },
            { type: 'Sent to @friend', amount: '-0.5 SOL', time: '1 day ago', positive: false },
            { type: 'NFT Purchase', amount: '-0.8 SOL', time: '3 days ago', positive: false }
          ].map((tx, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 rounded-xl border"
              data-component="transaction-item"
              style={{
                backgroundColor: cardsStyle.backgroundColor || 'var(--wallet-bg-secondary, rgba(255, 255, 255, 0.05))',
                borderRadius: cardsStyle.borderRadius || '12px',
                border: cardsStyle.border || '1px solid var(--wallet-color-secondary, rgba(255, 255, 255, 0.1))',
                boxShadow: cardsStyle.boxShadow || '0 2px 8px rgba(153, 69, 255, 0.1)'
              }}
            >
              <div>
                <div 
                  className="font-medium"
                  style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}
                >
                  {tx.type}
                </div>
                <div 
                  className="text-sm opacity-70"
                  style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}
                >
                  {tx.time}
                </div>
              </div>
              <div 
                className={`font-medium ${tx.positive ? 'text-green-400' : ''}`}
                style={{ 
                  color: tx.positive ? '#10B981' : 'var(--wallet-color-text, #FFFFFF)'
                }}
              >
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
