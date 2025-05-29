
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  User, 
  Settings, 
  LogOut, 
  Plus,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const WalletSidebar = () => {
  const {
    accounts,
    activeAccountId,
    setActiveAccount,
    walletStyle,
    triggerAiPetInteraction
  } = useWalletCustomizationStore();
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleAccountSelect = (accountId: string) => {
    setActiveAccount(accountId);
    triggerAiPetInteraction();
    console.log(`Switched to account: ${accountId}`);
  };

  const handleCopyAddress = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    triggerAiPetInteraction();
    
    setTimeout(() => {
      setCopiedAddress(null);
    }, 2000);
  };

  const handleAddAccount = () => {
    console.log('Add new account clicked');
    triggerAiPetInteraction();
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    triggerAiPetInteraction();
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    triggerAiPetInteraction();
  };

  return (
    <Sidebar className="w-80">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: walletStyle.primaryColor || '#9945FF' }}
          >
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Wallet Accounts</h2>
            <p className="text-sm text-gray-500">Manage your accounts</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your Accounts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accounts.map((account) => (
                <SidebarMenuItem key={account.id}>
                  <SidebarMenuButton
                    onClick={() => handleAccountSelect(account.id)}
                    isActive={account.id === activeAccountId}
                    className="w-full justify-between p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: account.id === activeAccountId 
                            ? walletStyle.primaryColor || '#9945FF' 
                            : '#6B7280' 
                        }}
                      >
                        <span className="text-white text-xs font-medium">
                          {account.name.slice(-1)}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{account.name}</div>
                        <div className="text-xs text-gray-500">{account.network}</div>
                        <div className="text-xs font-mono text-gray-400">
                          {account.address}
                        </div>
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            onClick={(e) => handleCopyAddress(account.address, e)}
                          >
                            {copiedAddress === account.address ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy address</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleAddAccount}
                  className="w-full justify-center p-4 border-2 border-dashed border-gray-300 hover:border-gray-400"
                >
                  <Plus className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Add New Account</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSettings} className="w-full">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default WalletSidebar;
