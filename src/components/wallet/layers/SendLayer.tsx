import React, { useState } from 'react';
import { ArrowLeft, Search, QrCode, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';

interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  initials?: string;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Alice Smith',
    address: '0x1234...5678',
    initials: 'AS'
  },
  {
    id: '2',
    name: 'Bob Johnson',
    address: '0xabcd...efgh',
    initials: 'BJ'
  },
  {
    id: '3',
    name: 'Charlie Brown',
    address: '0x9999...1111',
    initials: 'CB'
  }
];

const SendLayer = () => {
  const { setCurrentLayer } = useWalletCustomizationStore();
  const { getSendLayer, getGlobalSearchInput, getTransition } = useWalletTheme();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Get send layer theme styles and global search input
  const sendLayerStyle = getSendLayer();
  const globalSearchInput = getGlobalSearchInput();

  const handleClose = () => {
    setCurrentLayer('home');
  };

  const handleQrScan = () => {
    console.log('QR scan clicked');
  };

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll-lock handlers
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
      <div className="absolute bottom-0 left-0 right-0 z-50 max-h-[85vh] flex flex-col animate-slide-in-bottom send-layer" data-element-id="send-layer">
        
        {/* Header */}
        <div 
          className="p-4 flex items-center justify-between send-header"
          data-element-id="send-header"
          style={{
            backgroundColor: sendLayerStyle.headerContainer?.backgroundColor || 'transparent',
            backgroundImage: sendLayerStyle.headerContainer?.backgroundImage ? `url(${sendLayerStyle.headerContainer.backgroundImage})` : undefined,
          }}
        >
          <button
            onClick={handleClose}
            className="flex items-center space-x-2 send-back-button"
            data-element-id="send-back-button"
          >
            <ArrowLeft 
              className="w-6 h-6 send-back-icon" 
              data-element-id="send-back-icon"
              style={{ color: sendLayerStyle.header?.backIcon?.color || '#ad7e26' }}
            />
          </button>
          
          <h1 
            className="text-xl font-bold send-title"
            data-element-id="send-title"
            style={{
              color: sendLayerStyle.header?.title?.textColor || '#643800',
              fontFamily: sendLayerStyle.header?.title?.fontFamily || 'Inter',
              fontWeight: sendLayerStyle.header?.title?.fontWeight || 'bold',
              fontSize: sendLayerStyle.header?.title?.fontSize || '23px',
            }}
          >
            Send
          </h1>
          
          <button
            onClick={handleQrScan}
            className="send-qr-button"
            data-element-id="send-qr-button"
          >
            <QrCode 
              className="w-6 h-6 send-qr-icon" 
              data-element-id="send-qr-icon"
              style={{ color: sendLayerStyle.header?.qrIcon?.color || '#ad7e26' }}
            />
          </button>
        </div>

        {/* Search Input - Now using global styles */}
        <div className="px-4 mb-4 send-search-section" data-element-id="send-search-section">
          <div className="relative send-search-input-container" data-element-id="send-search-input-container">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 send-search-icon" 
              data-element-id="send-search-icon"
              style={{ color: globalSearchInput.iconSearch?.color || '#fff' }}
            />
            <input
              type="text"
              placeholder="Search contacts or paste address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 focus:outline-none transition-colors send-search-input"
              data-element-id="send-search-input"
              style={{
                backgroundColor: globalSearchInput.backgroundColor || '#181818',
                border: globalSearchInput.border || 'none',
                borderRadius: globalSearchInput.borderRadius || '12px',
                fontFamily: globalSearchInput.fontFamily || 'Inter',
                fontSize: globalSearchInput.fontSize || '16px',
                color: globalSearchInput.textColor || '#fff',
                transition: getTransition('default'),
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto send-content invisible-scroll"
          data-element-id="send-content"
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
          style={{
            backgroundColor: sendLayerStyle.centerContainer?.backgroundColor || '#232323',
            backgroundImage: sendLayerStyle.centerContainer?.backgroundImage ? `url(${sendLayerStyle.centerContainer.backgroundImage})` : undefined,
            borderTopLeftRadius: sendLayerStyle.centerContainer?.borderRadius || '18px',
            borderTopRightRadius: sendLayerStyle.centerContainer?.borderRadius || '18px',
          }}
        >
          <div className="p-4">
            <h2 
              className="text-lg font-bold mb-2 send-contacts-title"
              data-element-id="send-contacts-title"
              style={{
                color: sendLayerStyle.selectNetworkLabel?.textColor || '#ad7e26',
                fontFamily: sendLayerStyle.selectNetworkLabel?.fontFamily || 'Inter',
                fontWeight: sendLayerStyle.selectNetworkLabel?.fontWeight || 'bold',
                fontSize: sendLayerStyle.selectNetworkLabel?.fontSize || '19px',
              }}
            >
              Recent Contacts
            </h2>
            <p 
              className="text-sm mb-4 send-contacts-description"
              data-element-id="send-contacts-description"
              style={{
                color: sendLayerStyle.selectNetworkDescription?.textColor || '#aaa',
                fontFamily: sendLayerStyle.selectNetworkDescription?.fontFamily || 'Inter',
                fontSize: sendLayerStyle.selectNetworkDescription?.fontSize || '15px',
              }}
            >
              Select a contact or enter a wallet address
            </p>

            {/* Contacts List */}
            <div className="space-y-3 send-contacts-list" data-element-id="send-contacts-list">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact, index) => (
                  <div
                    key={contact.id}
                    className="flex items-center p-3 hover:bg-white/5 transition-colors cursor-pointer send-contact-item"
                    data-element-id={`send-contact-item-${index}`}
                    style={{
                      borderRadius: '12px',
                      transition: getTransition('default'),
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mr-3 send-contact-avatar"
                      data-element-id={`send-contact-avatar-${index}`}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <span 
                        className="text-sm font-bold send-contact-initials"
                        data-element-id={`send-contact-initials-${index}`}
                        style={{ color: '#fff' }}
                      >
                        {contact.initials}
                      </span>
                    </div>
                    <div className="flex-1 send-contact-info" data-element-id={`send-contact-info-${index}`}>
                      <div 
                        className="font-medium send-contact-name"
                        data-element-id={`send-contact-name-${index}`}
                        style={{ color: '#fff' }}
                      >
                        {contact.name}
                      </div>
                      <div 
                        className="text-sm send-contact-address"
                        data-element-id={`send-contact-address-${index}`}
                        style={{ 
                          color: sendLayerStyle.selectNetworkDescription?.textColor || '#aaa' 
                        }}
                      >
                        {contact.address}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 send-empty-state" data-element-id="send-empty-state">
                  <p 
                    className="send-empty-message"
                    data-element-id="send-empty-message"
                    style={{
                      color: sendLayerStyle.emptyState?.textColor || '#fff',
                      fontFamily: sendLayerStyle.emptyState?.fontFamily || 'Inter',
                      fontSize: sendLayerStyle.emptyState?.fontSize || '15px',
                    }}
                  >
                    {searchQuery ? `No contacts found for "${searchQuery}"` : 'No recent contacts'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-4 send-footer"
          data-element-id="send-footer"
          style={{
            backgroundColor: sendLayerStyle.footerContainer?.backgroundColor || '#181818',
            backgroundImage: sendLayerStyle.footerContainer?.backgroundImage ? `url(${sendLayerStyle.footerContainer.backgroundImage})` : undefined,
          }}
        >
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 transition-colors flex items-center justify-center space-x-2 send-close-button"
            data-element-id="send-close-button"
            style={{
              backgroundColor: sendLayerStyle.footer?.closeButton?.backgroundColor || '#432818',
              borderRadius: sendLayerStyle.footer?.closeButton?.borderRadius || '16px',
              transition: getTransition('default'),
              color: sendLayerStyle.footer?.closeButton?.textColor || '#181818',
              fontFamily: sendLayerStyle.footer?.closeButton?.fontFamily || 'Inter',
              fontWeight: sendLayerStyle.footer?.closeButton?.fontWeight || 'bold',
              fontSize: sendLayerStyle.footer?.closeButton?.fontSize || '19px',
            }}
          >
            <X 
              className="w-5 h-5 send-close-icon" 
              data-element-id="send-close-icon"
              style={{ color: sendLayerStyle.footer?.closeButton?.icon?.color || '#ad7e26' }}
            />
            <span className="send-close-text" data-element-id="send-close-text">Close</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SendLayer;
