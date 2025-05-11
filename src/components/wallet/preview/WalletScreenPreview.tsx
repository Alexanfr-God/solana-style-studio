import React, { useState } from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Copy, Search } from 'lucide-react';
import WalletAssetItem from './WalletAssetItem';
import WalletActionButtons from './WalletActionButtons';
import WalletNavigation from './WalletNavigation';

export const WalletScreenPreview = ({ style }: { style: WalletStyle }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  
  const handleAction = (action: string) => {
    toast({ description: `${action} action triggered` });
  };
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText("A8...5Gh3");
    toast({ 
      title: "Address copied",
      description: "The wallet address has been copied to clipboard"
    });
  };

  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden w-full max-w-[320px]"
      style={{
        backgroundColor: style.backgroundColor || '#131313',
        backgroundImage: style.backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: style.textColor || '#FFFFFF',
        fontFamily: style.fontFamily,
        boxShadow: style.boxShadow,
      }}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center mr-3">
            <span className="font-medium">A8</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">Account 8</span>
            <div className="flex items-center">
              <span className="text-xs text-gray-400">A8...5Gh3</span>
              <Copy 
                className="h-3.5 w-3.5 text-gray-400 ml-1 cursor-pointer hover:text-gray-300" 
                onClick={handleCopyAddress}
              />
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 ml-2 cursor-pointer" />
        </div>
        <div className="flex items-center space-x-3">
          <Search className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-300" />
        </div>
      </div>
      
      {/* Balance */}
      <div className="px-6 py-6">
        <div className="text-4xl font-bold mb-2">$807.73</div>
        <div className="flex items-center space-x-2">
          <span className="text-green-500 font-medium">+$74.96</span>
          <span className="bg-green-500 bg-opacity-20 px-2 py-0.5 rounded text-green-500 text-xs">+10.23%</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <WalletActionButtons onAction={handleAction} style={style} />
      
      {/* Assets List */}
      <div className="flex-1 overflow-auto px-4 pt-2 pb-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Assets</span>
          <span className="bg-gray-400 cursor-pointer text-sm opacity-70">See all</span>
        </div>
        
        {/* Asset Items */}
        <WalletAssetItem
          image="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgd2lkdGg9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Zz48cGF0aCBkPSJtMCAwaDQwLjc3M3YxNDIuNjkzaC00MC43NzN6IiB0cmFuc2Zvcm09Im1hdHJpeCgwIDEgLTEgMCA0NDguNzg5IDI3MikiIGZpbGw9IiM5OTQ1ZmYiLz48cGF0aCBkPSJtNDA3LjIyNyAwaDQwLjc3M3YxNDIuNjkzaC00MC43NzN6IiB0cmFuc2Zvcm09Im1hdHJpeCgwIDEgLTEgMCA1OTEuNDgxIDI3MikiIGZpbGw9IiNmYjVyNWIiLz48cGF0aCBkPSJtMCAxNjkuMzA3aDQwLjc3M3YxNDIuNjkzaC00MC43NzN6IiB0cmFuc2Zvcm09Im1hdHJpeCgwIDEgLTEgMCA0NDguNzg5IDY3Ny43NjciIiBmaWxsPSIjMTRmMTk1Ii8+PC9nPjwvc3ZnPg=="
          name="Solana"
          ticker="SOL"
          amount="5.03737"
          value="$807.73"
          change="+$74.96"
          color="text-green-400"
          onClick={() => handleAction("View Solana")}
          style={style}
        />
        
        <WalletAssetItem
          image="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyOTMuOSAzMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5My45IDMwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM2N0MxRDM7fQoJLnN0MXtmaWxsOiM0QjlGQjE7fQoJLnN0MntmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTQ3LjEsMEMxMDcuMywwLDcxLjksMTcuOCw0Ni43LDQzLjFjLTI1LjIsMjUuMy00My4xLDYwLjgtNDMuMSwxMDAuN3MxNy44LDc1LjQsNDMuMSwxMDAuN3MxMDAuNyw0My4xLDE0MC42LDQzLjEKCWMzOS45LDAsNzUuNC0xNy44LDEwMC43LTQzLjFjMjUuMi0yNS4zLDQzLjEtNjAuOCw0My4xLTEwMC43YzAtMzkuOS0xNy44LTc1LjMtNDMuMS0xMDAuN1MyOTIuMywyMCwyMTIuMiwwSDE0Ny4xeiIvPgo8cGF0aCBjbGFzcz0ic3QyIiBkPSJNNzEuMywxMTcuOGwxMS42LDkuNWgxMzYuMmwtMTEuNi05LjVMNzEuMywxMTcuOHogTTk1LjcsMTk4bDU3LjQsNjguOWw0My4xLTU3LjRoLTExLjZMMTQxLjUsMjY3bC00NS44LTY5aDExLjZ6Ck0xNDcuMSwyMDkuNWMtMTguLTExLjYtMzYtMTUuOC02OC45LTM0LjhsMTEuNiwyMy4xbDExLjYsOS41YzExLjYsOS41LDE0LjYsMTksMTEuNiw0My4xYy0zLDE4LjUtOC45LDMzLjgtMjguNCw0Ni4ydjguMwoJbDExLjYtOC4zYzIwLjUtMTMuMSwyNi40LTMwLjIsMjguOS01MS41YzEuNC0xOS42LTEuOS0zMi43LTE2LTQ2LjJoMjMuMWMtMTEuNiwxMS42LTE5LjksMjMuMS0yMCw0My4xYzAsMTEuNiwzLjEsMjYuNywxMy4xLDQwaDkuNgoJYy0xNy0xNC44LTE5LjQtMjkuMS0xNy4zLTQzLjFjMi4zLTE1LjYsOS44LTI1LjcsMjEuOC0zMi43aC00MC40TDE0Ny4xLDIwOS41eiBNMTM1LjUsMTQxLjVoMjIuOHYtMjMuMUgxNDcsMTM1LjV2MjMuMXoiLz4KPC9zdmc+Cg=="
          name="Ethereum"
          ticker="ETH"
          amount="0"
          value="$0.00"
          change="+$0.00"
          onClick={() => handleAction("View Ethereum")}
          style={style}
        />
        
        <WalletAssetItem
          image="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyOTMuOSAzMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5My45IDMwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM2N0MxRDM7fQoJLnN0MXtmaWxsOiM0QjlGQjE7fQoJLnN0MntmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTQ3LjEsMEMxMDcuMywwLDcxLjksMTcuOCw0Ni43LDQzLjFjLTI1LjIsMjUuMy00My4xLDYwLjgtNDMuMSwxMDAuN3MxNy44LDc1LjQsNDMuMSwxMDAuN3MxMDAuNyw0My4xLDE0MC42LDQzLjEKCWMzOS45LDAsNzUuNC0xNy44LDEwMC43LTQzLjFjMjUuMi0yNS4zLDQzLjEtNjAuOCw0My4xLTEwMC43YzAtMzkuOS0xNy44LTc1LjMtNDMuMS0xMDAuN1MyOTIuMywyMCwyMTIuMiwwSDE0Ny4xeiIvPgo8cGF0aCBjbGFzcz0ic3QyIiBkPSJNNzEuMywxMTcuOGwxMS42LDkuNWgxMzYuMmwtMTEuNi05LjVMNzEuMywxMTcuOHogTTk1LjcsMTk4bDU3LjQsNjguOWw0My4xLTU3LjRoLTExLjZMMTQxLjUsMjY3bC00NS44LTY5aDExLjZ6Ck0xNDcuMSwyMDkuNWMtMTguLTExLjYtMzYtMTUuOC02OC45LTM0LjhsMTEuNiwyMy4xbDExLjYsOS41YzExLjYsOS41LDE0LjYsMTksMTEuNiw0My4xYy0zLDE4LjUtOC45LDMzLjgtMjguNCw0Ni4ydjguMwoJbDExLjYtOC4zYzIwLjUtMTMuMSwyNi40LTMwLjIsMjguOS01MS41YzEuNC0xOS42LTEuOS0zMi43LTE2LTQ2LjJoMjMuMWMtMTEuNiwxMS42LTE5LjksMjMuMS0yMCw0My4xYzAsMTEuNiwzLjEsMjYuNywxMy4xLDQwaDkuNgoJYy0xNy0xNC44LTE5LjQtMjkuMS0xNy4zLTQzLjFjMi4zLTE1LjYsOS44LTI1LjcsMjEuOC0zMi43aC00MC40TDE0Ny4xLDIwOS41eiBNMTM1LjUsMTQxLjVoMjIuOHYtMjMuMUgxNDcsMTM1LjV2MjMuMXoiLz4KPC9zdmc+Cg=="
          name="Ethereum"
          ticker="ETH"
          amount="0"
          value="$0.00"
          change="+$0.00"
          isLocked={true}
          onClick={() => handleAction("View Locked Ethereum")}
          style={style}
        />
      </div>
      
      {/* Navigation */}
      <WalletNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={style.accentColor || '#9b87f5'}
      />
    </div>
  );
};

export default WalletScreenPreview;
