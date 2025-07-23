import React from 'react';
import { Search, X, ArrowLeft } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';

const BuyLayer = () => {
  const { setCurrentLayer } = useWalletCustomizationStore();
  const { getBuyLayer, getGlobal } = useWalletTheme();

  const buyLayerStyle = getBuyLayer();
  const globalStyle = getGlobal();

  const handleClose = () => {
    setCurrentLayer('home');
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleClose}
      />
      
      {/* Bottom sheet modal */}
      <div
        className="absolute bottom-0 left-0 right-0 z-50 max-h-[90vh] flex flex-col rounded-t-[24px] bg-white dark:bg-neutral-900 shadow-lg overflow-hidden animate-slide-in-bottom"
        data-element-id="buy-layer"
        style={{
          backgroundColor: buyLayerStyle.centerContainer?.backgroundColor || '#232323',
          backgroundImage: buyLayerStyle.centerContainer?.backgroundImage ? `url(${buyLayerStyle.centerContainer.backgroundImage})` : undefined,
          fontFamily: globalStyle.fontFamily || 'Inter'
        }}
      >
        {/* Header Section */}
        <div
          className="flex items-center justify-between p-4 border-b dark:border-neutral-700 buy-header-container"
          data-element-id="buy-header-container"
          style={{
            backgroundColor: buyLayerStyle.headerContainer?.backgroundColor || '#181818',
            backgroundImage: buyLayerStyle.headerContainer?.backgroundImage ? `url(${buyLayerStyle.headerContainer.backgroundImage})` : undefined,
            borderRadius: buyLayerStyle.headerContainer?.borderRadius || '0px'
          }}
        >
          <div className="flex items-center buy-header" data-element-id="buy-header">
            <button
              className="flex items-center justify-center rounded-[14px] buy-back-button"
              data-element-id="buy-back-button"
              onClick={handleClose}
              style={{
                backgroundColor: buyLayerStyle.header?.backButton?.backgroundColor || '#FFD166',
                borderRadius: buyLayerStyle.header?.backButton?.borderRadius || '14px',
                padding: '8px 12px'
              }}
            >
              <ArrowLeft
                className="w-5 h-5 mr-2 buy-back-icon"
                data-element-id="buy-back-icon"
                style={{
                  color: buyLayerStyle.header?.backButton?.icon?.color || '#181818'
                }}
              />
              <span
                className="text-sm font-bold buy-back-text"
                data-element-id="buy-back-text"
                style={{
                  color: buyLayerStyle.header?.backButton?.text?.textColor || '#181818',
                  fontFamily: buyLayerStyle.header?.backButton?.text?.fontFamily || globalStyle.fontFamily,
                  fontWeight: buyLayerStyle.header?.backButton?.text?.fontWeight || 'bold',
                  fontSize: buyLayerStyle.header?.backButton?.text?.fontSize || '17px'
                }}
              >
                Back
              </span>
            </button>
            <h2
              className="text-lg font-bold ml-4 buy-title"
              data-element-id="buy-title"
              style={{
                color: buyLayerStyle.header?.title?.textColor || '#FFD166',
                fontFamily: buyLayerStyle.header?.title?.fontFamily || globalStyle.fontFamily,
                fontWeight: buyLayerStyle.header?.title?.fontWeight || 'bold',
                fontSize: buyLayerStyle.header?.title?.fontSize || '26px'
              }}
            >
              Buy Crypto
            </h2>
          </div>
        </div>

        {/* Search Input */}
        <div
          className="relative mx-4 mt-4 buy-search-input-container"
          data-element-id="buy-search-input-container"
          style={{
            backgroundColor: buyLayerStyle.searchInputContainer?.backgroundColor || '#13e163',
            borderRadius: buyLayerStyle.searchInputContainer?.borderRadius || '14px'
          }}
        >
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white buy-search-icon"
            data-element-id="buy-search-icon"
            style={{
              color: buyLayerStyle.searchInput?.iconSearch?.color || '#fff'
            }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-3 focus:outline-none rounded-[14px] buy-search-input"
            data-element-id="buy-search-input"
            style={{
              backgroundColor: buyLayerStyle.searchInput?.backgroundColor || '#13e163',
              border: 'none',
              fontFamily: buyLayerStyle.searchInput?.fontFamily || globalStyle.fontFamily,
              fontSize: buyLayerStyle.searchInput?.fontSize || '16px',
              color: buyLayerStyle.searchInput?.textColor || '#fff',
              '::placeholder': {
                color: buyLayerStyle.searchInput?.placeholderColor || '#fff'
              }
            }}
          />
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 p-4 mt-2 overflow-y-auto buy-content"
          data-element-id="buy-content"
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
          style={{
            fontFamily: buyLayerStyle.centerContainer?.fontFamily || globalStyle.fontFamily
          }}
        >
          {/* Get Started Section */}
          <div className="mb-6 buy-get-started" data-element-id="buy-get-started">
            <h3
              className="text-lg font-bold mb-3 buy-get-started-title"
              data-element-id="buy-get-started-title"
              style={{
                color: buyLayerStyle.sectionLabel?.getStarted?.textColor || '#5f4025',
                fontFamily: buyLayerStyle.sectionLabel?.getStarted?.fontFamily || globalStyle.fontFamily,
                fontWeight: buyLayerStyle.sectionLabel?.getStarted?.fontWeight || 'bold',
                fontSize: buyLayerStyle.sectionLabel?.getStarted?.fontSize || '18px'
              }}
            >
              Get Started
            </h3>
            <div className="flex space-x-4">
              {/* Example Buy Buttons */}
              <button
                className="px-6 py-3 rounded-[14px] font-bold buy-button"
                data-element-id="buy-button-1"
                style={{
                  backgroundColor: buyLayerStyle.buyButton?.backgroundColor || '#FFD166',
                  color: buyLayerStyle.buyButton?.textColor || '#181818',
                  fontFamily: buyLayerStyle.buyButton?.fontFamily || globalStyle.fontFamily,
                  fontWeight: buyLayerStyle.buyButton?.fontWeight || 'bold',
                  fontSize: buyLayerStyle.buyButton?.fontSize || '18px',
                  borderRadius: buyLayerStyle.buyButton?.borderRadius || '14px'
                }}
              >
                Buy BTC
              </button>
              <button
                className="px-6 py-3 rounded-[14px] font-bold buy-button"
                data-element-id="buy-button-2"
                style={{
                  backgroundColor: buyLayerStyle.buyButton?.backgroundColor || '#FFD166',
                  color: buyLayerStyle.buyButton?.textColor || '#181818',
                  fontFamily: buyLayerStyle.buyButton?.fontFamily || globalStyle.fontFamily,
                  fontWeight: buyLayerStyle.buyButton?.fontWeight || 'bold',
                  fontSize: buyLayerStyle.buyButton?.fontSize || '18px',
                  borderRadius: buyLayerStyle.buyButton?.borderRadius || '14px'
                }}
              >
                Buy ETH
              </button>
            </div>
          </div>

          {/* Popular Section */}
          <div className="mb-6 buy-popular" data-element-id="buy-popular">
            <h3
              className="text-lg font-bold mb-3 buy-popular-title"
              data-element-id="buy-popular-title"
              style={{
                color: buyLayerStyle.sectionLabel?.popular?.textColor || '#5f4025',
                fontFamily: buyLayerStyle.sectionLabel?.popular?.fontFamily || globalStyle.fontFamily,
                fontWeight: buyLayerStyle.sectionLabel?.popular?.fontWeight || 'bold',
                fontSize: buyLayerStyle.sectionLabel?.popular?.fontSize || '18px'
              }}
            >
              Popular
            </h3>
            <div className="flex space-x-4">
              {/* Example Popular Buttons */}
              <button
                className="px-6 py-3 rounded-[14px] font-bold buy-button"
                data-element-id="buy-button-3"
                style={{
                  backgroundColor: buyLayerStyle.buyButton?.backgroundColor || '#FFD166',
                  color: buyLayerStyle.buyButton?.textColor || '#181818',
                  fontFamily: buyLayerStyle.buyButton?.fontFamily || globalStyle.fontFamily,
                  fontWeight: buyLayerStyle.buyButton?.fontWeight || 'bold',
                  fontSize: buyLayerStyle.buyButton?.fontSize || '18px',
                  borderRadius: buyLayerStyle.buyButton?.borderRadius || '14px'
                }}
              >
                Buy USDT
              </button>
              <button
                className="px-6 py-3 rounded-[14px] font-bold buy-button"
                data-element-id="buy-button-4"
                style={{
                  backgroundColor: buyLayerStyle.buyButton?.backgroundColor || '#FFD166',
                  color: buyLayerStyle.buyButton?.textColor || '#181818',
                  fontFamily: buyLayerStyle.buyButton?.fontFamily || globalStyle.fontFamily,
                  fontWeight: buyLayerStyle.buyButton?.fontWeight || 'bold',
                  fontSize: buyLayerStyle.buyButton?.fontSize || '18px',
                  borderRadius: buyLayerStyle.buyButton?.borderRadius || '14px'
                }}
              >
                Buy USDC
              </button>
            </div>
          </div>
        </div>

        {/* Close Button Footer */}
        <div 
          className="p-4 border-t buy-footer" 
          data-element-id="buy-footer"
          style={{ 
            backgroundColor: buyLayerStyle.footerContainer?.backgroundColor || '#181818',
            borderColor: 'rgba(255, 255, 255, 0.1)' 
          }}
        >
          <button
            onClick={handleClose}
            className="wallet-action-button buy-close-button"
            data-element-id="buy-close-button"
          >
            <X className="wallet-action-button-icon buy-close-icon" data-element-id="buy-close-icon" />
            <span className="buy-close-text" data-element-id="buy-close-text">Close</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default BuyLayer;
