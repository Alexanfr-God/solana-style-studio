
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import WalletSidebar from './WalletSidebar';
import WalletHomeLayer from './layers/WalletHomeLayer';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const WalletWithSidebar = () => {
  const { currentLayer } = useWalletCustomizationStore();

  const renderCurrentLayer = () => {
    switch (currentLayer) {
      case 'home':
        return <WalletHomeLayer />;
      case 'apps':
        return <div className="p-6"><h2 className="text-xl font-bold text-white">Apps</h2></div>;
      case 'swap':
        return <div className="p-6"><h2 className="text-xl font-bold text-white">Swap</h2></div>;
      case 'history':
        return <div className="p-6"><h2 className="text-xl font-bold text-white">History</h2></div>;
      case 'search':
        return <div className="p-6"><h2 className="text-xl font-bold text-white">Search</h2></div>;
      default:
        return <WalletHomeLayer />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <WalletSidebar />
        <SidebarInset className="flex-1">
          {renderCurrentLayer()}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default WalletWithSidebar;
