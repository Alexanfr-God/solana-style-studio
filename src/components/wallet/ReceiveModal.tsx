
import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletList from './WalletList';

const ReceiveModal = () => {
  const {
    showReceiveModal,
    setShowReceiveModal,
    walletStyle,
    triggerAiPetInteraction
  } = useWalletCustomizationStore();

  const handleClose = () => {
    setShowReceiveModal(false);
    triggerAiPetInteraction();
  };

  const handleAccountSelect = (accountId: string) => {
    console.log(`Selected account for receive: ${accountId}`);
    triggerAiPetInteraction();
    // Modal stays open to show the selected account's receive details
  };

  return (
    <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
      <DialogContent 
        className="bg-black/90 backdrop-blur-md border-white/10 text-white max-w-md"
        style={{ fontFamily: walletStyle.font || 'Inter' }}
      >
        <DialogHeader className="border-b border-white/10 pb-3">
          <DialogTitle className="text-lg font-medium text-white">
            Receive Crypto
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-1">
            Select an account to receive funds
          </p>
        </DialogHeader>
        
        {/* Wallet List */}
        <div className="py-2">
          <WalletList 
            context="popup" 
            onAccountSelect={handleAccountSelect}
            onClose={handleClose}
          />
        </div>
        
        {/* Footer */}
        <div className="border-t border-white/10 pt-3">
          <button 
            className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
            onClick={handleClose}
            data-shared-element-id="closeButton"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveModal;
