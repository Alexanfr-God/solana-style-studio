
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const AppsContent = () => {
  const { getStyleForComponent } = useWalletCustomizationStore();

  const cardsStyle = getStyleForComponent('cards');

  const apps = [
    { id: 1, name: 'DeFi Exchange', icon: '🔄', description: 'Trade tokens' },
    { id: 2, name: 'NFT Marketplace', icon: '🖼️', description: 'Buy & sell NFTs' },
    { id: 3, name: 'Staking Pool', icon: '💎', description: 'Earn rewards' },
    { id: 4, name: 'Governance', icon: '🗳️', description: 'Vote on proposals' },
    { id: 5, name: 'Lending', icon: '🏦', description: 'Borrow & lend' },
    { id: 6, name: 'Analytics', icon: '📊', description: 'Track portfolio' }
  ];

  return (
    <div 
      className="flex-1 p-4 space-y-6 overflow-y-auto"
      data-layer="apps"
      data-component="apps-content"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-bold px-2" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
          DApps
        </h2>
        
        <div 
          className="grid grid-cols-2 gap-4"
          data-component="apps-grid"
        >
          {apps.map((app) => (
            <div 
              key={app.id}
              className="p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              data-component="app-card"
              style={{
                backgroundColor: cardsStyle.backgroundColor || 'var(--wallet-bg-secondary, rgba(255, 255, 255, 0.05))',
                borderRadius: cardsStyle.borderRadius || '12px',
                border: cardsStyle.border || '1px solid var(--wallet-color-secondary, rgba(255, 255, 255, 0.1))',
                boxShadow: cardsStyle.boxShadow || '0 2px 8px rgba(153, 69, 255, 0.1)'
              }}
            >
              <div className="text-center space-y-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto"
                  data-component="app-icon"
                  style={{
                    backgroundColor: 'var(--wallet-color-primary, #9945FF)20',
                    color: 'var(--wallet-color-primary, #9945FF)'
                  }}
                >
                  {app.icon}
                </div>
                <div>
                  <div 
                    className="font-semibold text-sm"
                    data-component="app-name"
                    style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}
                  >
                    {app.name}
                  </div>
                  <div 
                    className="text-xs opacity-70 mt-1"
                    style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}
                  >
                    {app.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Apps Section */}
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-semibold px-2" style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}>
            Featured
          </h3>
          
          <div 
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: cardsStyle.backgroundColor || 'var(--wallet-bg-secondary, rgba(255, 255, 255, 0.05))',
              borderRadius: cardsStyle.borderRadius || '12px',
              border: cardsStyle.border || '1px solid var(--wallet-color-accent, rgba(20, 241, 149, 0.3))',
              boxShadow: cardsStyle.boxShadow || '0 4px 16px rgba(20, 241, 149, 0.1)'
            }}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                style={{
                  backgroundColor: 'var(--wallet-color-accent, #14F195)20',
                  color: 'var(--wallet-color-accent, #14F195)'
                }}
              >
                🚀
              </div>
              <div className="flex-1">
                <h4 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}
                >
                  Solana Summer
                </h4>
                <p 
                  className="text-sm opacity-70 mt-1"
                  style={{ color: 'var(--wallet-color-text, #FFFFFF)' }}
                >
                  Participate in the biggest DeFi event of the year
                </p>
                <button 
                  className="mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--wallet-color-accent, #14F195)',
                    color: 'var(--wallet-bg-primary, #000000)'
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppsContent;
