
import React from 'react';
import { Home, ArrowRightLeft, Clock, Search, LayoutGrid } from 'lucide-react';

interface WalletNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  accentColor: string;
}

const WalletNavigation: React.FC<WalletNavigationProps> = ({
  activeTab,
  onTabChange,
  accentColor
}) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'apps', icon: LayoutGrid, label: 'Apps' },
    { id: 'swap', icon: ArrowRightLeft, label: 'Swap' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'search', icon: Search, label: 'Search' }
  ];
  
  return (
    <div className="px-6 py-3 border-t border-gray-800 grid grid-cols-5 items-center">
      {navItems.map(item => (
        <button 
          key={item.id}
          className={`flex flex-col items-center justify-center ${activeTab === item.id ? 'opacity-100' : 'opacity-50'}`}
          onClick={() => onTabChange(item.id)}
        >
          <item.icon 
            className={`h-6 w-6 ${
              activeTab === item.id 
                ? 'text-[' + (accentColor || '#9b87f5') + ']' 
                : 'text-gray-500'
            }`} 
          />
        </button>
      ))}
    </div>
  );
};

export default WalletNavigation;
