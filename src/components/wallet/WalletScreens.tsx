import React, { useState } from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { 
  DollarSign, 
  ArrowRightLeft, 
  Send, 
  Download, 
  Home, 
  LayoutGrid, 
  Clock, 
  Search, 
  Copy,
  HelpCircle, 
  ChevronDown,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LoginScreen = ({ style }: { style: WalletStyle }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleUnlock = () => {
    toast({
      title: "Authentication",
      description: "This is a demo wallet. No actual login is performed.",
    });
  };

  const handleForgotPassword = () => {
    toast({
      description: "Password recovery would be initiated here",
    });
  };
  
  // Apply background styles with more advanced effects based on style
  const getBackgroundStyle = () => {
    if (style.backgroundImage) {
      return {
        backgroundImage: style.backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    // Create a more sophisticated background if no image
    return {
      background: `linear-gradient(135deg, ${style.backgroundColor || '#131313'} 0%, ${style.accentColor || '#9945FF'}33 100%)`,
    };
  };

  // Get custom text shadow based on theme
  const getTextShadow = () => {
    const isDark = style.backgroundColor?.includes('#13') || style.backgroundColor?.includes('rgb(19');
    return isDark ? '0 0 10px rgba(255,255,255,0.3)' : '0 0 10px rgba(0,0,0,0.2)';
  };
  
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden w-full max-w-[320px] relative"
      style={{
        ...getBackgroundStyle(),
        color: style.textColor || '#FFFFFF',
        fontFamily: style.fontFamily,
        boxShadow: style.boxShadow || '0 10px 25px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Animated overlay for extra visual effect */}
      <div 
        className="absolute inset-0 z-0 opacity-20" 
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23${style.accentColor?.replace('#', '') || '9945FF'}\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Header with branding and help icon */}
      <div className="p-5 flex justify-between items-center relative z-10">
        <div 
          className="text-lg font-medium" 
          style={{ 
            background: `linear-gradient(to right, ${style.textColor || '#FFFFFF'}, ${style.accentColor || '#9945FF'})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            letterSpacing: '1px',
            textTransform: 'lowercase'
          }}
        >
          phantom
        </div>
        <HelpCircle 
          className="h-5 w-5 cursor-pointer transition-transform hover:scale-110 hover:rotate-12" 
          style={{ 
            color: style.accentColor || '#9945FF', 
            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' 
          }} 
        />
      </div>
      
      {/* Logo and Content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-8 relative z-10">
        {/* Animated Ghost Logo */}
        <div className="mb-8 relative transition-transform hover:scale-105" style={{ filter: 'drop-shadow(0 0 8px ' + style.accentColor + '50)' }}>
          <img 
            src="/lovable-uploads/f2da1dab-e2e7-4a42-bcb5-8a24a140d4fc.png" 
            alt="Phantom Ghost Logo" 
            width="100" 
            height="100" 
            className="max-w-[100px] animate-pulse-slow"
            style={{
              filter: style.accentColor ? `hue-rotate(${getHueRotate(style.accentColor)}deg) saturate(1.2)` : 'none'
            }}
          />
          <div className="absolute inset-0 bg-transparent rounded-full animate-ping opacity-30" 
            style={{ border: `2px solid ${style.accentColor || '#9945FF'}` }}
          />
        </div>
        
        {/* Login Title */}
        <h2 
          className="text-2xl font-medium mb-8" 
          style={{ 
            color: style.textColor || '#FFFFFF', 
            textShadow: getTextShadow(),
            letterSpacing: '0.5px'
          }}
        >
          Enter your password
        </h2>
        
        {/* Password field with enhanced styling */}
        <div className="w-full max-w-xs mb-6">
          <div 
            className="h-12 px-4 flex items-center w-full relative overflow-hidden backdrop-blur-sm group transition-all"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              borderRadius: style.borderRadius || '100px',
              border: `1px solid ${style.accentColor}40`,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-white transition-colors"
              placeholder="Password"
              style={{
                caretColor: style.accentColor || '#9945FF',
              }}
            />
            {password.length > 0 && (
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                style={{ color: style.accentColor || '#9945FF' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
            
            {/* Line animation for focus effect */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform"
              style={{ backgroundColor: style.accentColor || '#9945FF' }}
            />
          </div>
        </div>
        
        {/* Forgot password link */}
        <div 
          className="w-full max-w-xs mb-8 text-center"
          onClick={handleForgotPassword}
        >
          <span 
            className="text-gray-400 text-sm cursor-pointer hover:text-gray-300 relative group"
            style={{ transition: 'all 0.3s ease' }}
          >
            Forgot password?
            <span 
              className="absolute left-0 right-0 bottom-0 h-[1px] transform scale-x-0 group-hover:scale-x-100 transition-transform" 
              style={{ backgroundColor: style.accentColor || '#9945FF' }}
            />
          </span>
        </div>
        
        {/* Enhanced Unlock Button */}
        <div className="w-full max-w-xs mt-4">
          <button 
            onClick={handleUnlock}
            className="w-full h-12 font-medium text-center transition-all relative overflow-hidden group hover:shadow-lg active:scale-[0.98]"
            style={{ 
              backgroundColor: style.buttonColor || '#9b87f5',
              color: style.buttonTextColor || '#000000',
              borderRadius: style.borderRadius || '100px',
              boxShadow: `0 4px 10px ${style.buttonColor}80 || rgba(155, 135, 245, 0.5)`,
            }}
          >
            {/* Button shine effect */}
            <span 
              className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(45deg, transparent 25%, ${style.accentColor || '#9b87f5'}40 50%, transparent 75%)`,
                backgroundSize: '200% 200%',
                animation: 'shine 1.5s infinite linear'
              }}
            />
            
            <span className="relative z-10">Unlock</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate hue rotation based on accent color
const getHueRotate = (color: string): number => {
  // Extract RGB components from hex or rgb string
  let r = 0, g = 0, b = 0;
  
  if (color.startsWith('#')) {
    // Handle hex format
    const hex = color.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    // Handle rgb format
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      r = parseInt(match[0]);
      g = parseInt(match[1]);
      b = parseInt(match[2]);
    }
  }
  
  // Calculate hue (simplified)
  const baseHue = 280; // Purple hue for #9945FF (phantom's default)
  const targetHue = ((r * 0.3) + (g * 0.6) + (b * 0.1)) % 360;
  
  return targetHue - baseHue;
};

export const WalletScreen = ({ style }: { style: WalletStyle }) => {
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
      <div className="grid grid-cols-4 gap-2 px-4 pt-0 pb-4">
        <div className="flex flex-col items-center">
          <button 
            className="h-14 w-14 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}
            onClick={() => handleAction("Receive")}
          >
            <Download className="h-5 w-5" style={{ color: style.accentColor || '#9b87f5' }} />
          </button>
          <span className="text-xs text-gray-400">Receive</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button 
            className="h-14 w-14 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}
            onClick={() => handleAction("Send")}
          >
            <Send className="h-5 w-5" style={{ color: style.accentColor || '#9b87f5' }} />
          </button>
          <span className="text-xs text-gray-400">Send</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button 
            className="h-14 w-14 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}
            onClick={() => handleAction("Swap")}
          >
            <ArrowRightLeft className="h-5 w-5" style={{ color: style.accentColor || '#9b87f5' }} />
          </button>
          <span className="text-xs text-gray-400">Swap</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button 
            className="h-14 w-14 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}
            onClick={() => handleAction("Buy")}
          >
            <DollarSign className="h-5 w-5" style={{ color: style.accentColor || '#9b87f5' }} />
          </button>
          <span className="text-xs text-gray-400">Buy</span>
        </div>
      </div>
      
      {/* Assets List */}
      <div className="flex-1 overflow-auto px-4 pt-2 pb-4">
        {/* Solana Asset */}
        <div 
          className="mb-3 p-4 rounded-xl flex justify-between items-center cursor-pointer active:bg-opacity-80"
          style={{ 
            backgroundColor: 'rgba(40, 40, 40, 0.6)',
            borderRadius: style.borderRadius || '16px',
          }}
          onClick={() => handleAction("View Solana")}
        >
          <div className="flex items-center">
            <div className="mr-3">
              <img src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgd2lkdGg9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Zz48cGF0aCBkPSJtMCAwaDQwLjc3M3YxNDIuNjkzaC00MC43NzN6IiB0cmFuc2Zvcm09Im1hdHJpeCgwIDEgLTEgMCA0NDguNzg5IDI3MikiIGZpbGw9IiM5OTQ1ZmYiLz48cGF0aCBkPSJtNDA3LjIyNyAwaDQwLjc3M3YxNDIuNjkzaC00MC43NzN6IiB0cmFuc2Zvcm09Im1hdHJpeCgwIDEgLTEgMCA1OTEuNDgxIDI3MikiIGZpbGw9IiNmYjVyNWIiLz48cGF0aCBkPSJtMCAxNjkuMzA3aDQwLjc3M3YxNDIuNjkzaC00MC43NzN6IiB0cmFuc2Zvcm09Im1hdHJpeCgwIDEgLTEgMCA0NDguNzg5IDY3Ny43NjcpIiBmaWxsPSIjMTRmMTk1Ii8+PC9nPjwvc3ZnPg==" 
                 alt="Solana" 
                 className="h-10 w-10" />
            </div>
            <div>
              <div className="font-medium">Solana</div>
              <div className="text-xs text-gray-400">5.03737 SOL</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">$807.73</div>
            <div className="text-xs text-green-400">+$74.96</div>
          </div>
        </div>
        
        {/* Ethereum Asset */}
        <div 
          className="mb-3 p-4 rounded-xl flex justify-between items-center cursor-pointer active:bg-opacity-80"
          style={{ 
            backgroundColor: 'rgba(40, 40, 40, 0.6)',
            borderRadius: style.borderRadius || '16px',
          }}
          onClick={() => handleAction("View Ethereum")}
        >
          <div className="flex items-center">
            <div className="mr-3">
              <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyOTMuOSAzMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5My45IDMwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM2N0MxRDM7fQoJLnN0MXtmaWxsOiM0QjlGQjE7fQoJLnN0MntmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTQ3LjEsMEMxMDcuMywwLDcxLjksMTcuOCw0Ni43LDQzLjFjLTI1LjIsMjUuMy00My4xLDYwLjgtNDMuMSwxMDAuN3MxNy44LDc1LjQsNDMuMSwxMDAuN3MxMDAuNyw0My4xLDE0MC42LDQzLjEKCWMzOS45LDAsNzUuNC0xNy44LDEwMC43LTQzLjFjMjUuMi0yNS4zLDQzLjEtNjAuOCw0My4xLTEwMC43YzAtMzkuOS0xNy44LTc1LjMtNDMuMS0xMDAuN1MyOTIuMywyMCwyMTIuMiwwSDE0Ny4xeiIvPgo8cGF0aCBjbGFzcz0ic3QyIiBkPSJNNzEuMywxMTcuOGwxMS42LDkuNWgxMzYuMmwtMTEuNi05LjVMNzEuMywxMTcuOHogTTk1LjcsMTk4bDU3LjQsNjguOWw0My4xLTU3LjRoLTExLjZMMTQxLjUsMjY3bC00NS44LTY5aDExLjZ6Ck0xNDcuMSwyMDkuNWMtMTguLTExLjYtMzYtMTUuOC02OC45LTM0LjhsMTEuNiwyMy4xbDExLjYsOS41YzExLjYsOS41LDE0LjYsMTksMTEuNiw0My4xYy0zLDE4LjUtOC45LDMzLjgtMjguNCw0Ni4ydjguMwoJbDExLjYtOC4zYzIwLjUtMTMuMSwyNi40LTMwLjIsMjguOS01MS41YzEuNC0xOS42LTEuOS0zMi43LTE2LTQ2LjJoMjMuMWMtMTEuNiwxMS42LTE5LjksMjMuMS0yMCw0My4xYzAsMTEuNiwzLjEsMjYuNywxMy4xLDQwaDkuNgoJYy0xNy0xNC44LTE5LjQtMjkuMS0xNy4zLTQzLjFjMi4zLTE1LjYsOS44LTI1LjcsMjEuOC0zMi43aC00MC40TDE0Ny4xLDIwOS41eiBNMTM1LjUsMTQxLjVoMjIuOHYtMjMuMUgxNDcsMTM1LjV2MjMuMXoiLz4KPC9zdmc+Cg==" 
                 alt="Ethereum" 
                 className="h-10 w-10" />
            </div>
            <div>
              <div className="font-medium">Ethereum</div>
              <div className="text-xs text-gray-400">0 ETH</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">$0.00</div>
            <div className="text-xs text-gray-400">+$0.00</div>
          </div>
        </div>
        
        {/* Another Ethereum Asset with locked icon */}
        <div 
          className="mb-3 p-4 rounded-xl flex justify-between items-center cursor-pointer active:bg-opacity-80"
          style={{ 
            backgroundColor: 'rgba(40, 40, 40, 0.6)',
            borderRadius: style.borderRadius || '16px',
          }}
          onClick={() => handleAction("View Locked Ethereum")}
        >
          <div className="flex items-center">
            <div className="mr-3 relative">
              <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyOTMuOSAzMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5My45IDMwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM2N0MxRDM7fQoJLnN0MXtmaWxsOiM0QjlGQjE7fQoJLnN0MntmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTQ3LjEsMEMxMDcuMywwLDcxLjksMTcuOCw0Ni43LDQzLjFjLTI1LjIsMjUuMy00My4xLDYwLjgtNDMuMSwxMDAuN3MxNy44LDc1LjQsNDMuMSwxMDAuN3MxMDAuNyw0My4xLDE0MC42LDQzLjEKCWMzOS45LDAsNzUuNC0xNy44LDEwMC43LTQzLjFjMjUuMi0yNS4zLDQzLjEtNjAuOCw0My4xLTEwMC43YzAtMzkuOS0xNy44LTc1LjMtNDMuMS0xMDAuN1MyOTIuMywyMCwyMTIuMiwwSDE0Ny4xeiIvPgo8cGF0aCBjbGFzcz0ic3QyIiBkPSJNNzEuMywxMTcuOGwxMS42LDkuNWgxMzYuMmwtMTEuNi05LjVMNzEuMywxMTcuOHogTTk1LjcsMTk4bDU3LjQsNjguOWw0My4xLTU3LjRoLTExLjZMMTQxLjUsMjY3bC00NS44LTY5aDExLjZ6Ck0xNDcuMSwyMDkuNWMtMTguLTExLjYtMzYtMTUuOC02OC45LTM0LjhsMTEuNiwyMy4xbDExLjYsOS41YzExLjYsOS41LDE0LjYsMTksMTEuNiw0My4xYy0zLDE4LjUtOC45LDMzLjgtMjguNCw0Ni4ydjguMwoJbDExLjYtOC4zYzIwLjUtMTMuMSwyNi40LTMwLjIsMjguOS01MS41YzEuNC0xOS42LTEuOS0zMi43LTE2LTQ2LjJoMjMuMWMtMTEuNiwxMS42LTE5LjksMjMuMS0yMCw0My4xYzAsMTEuNiwzLjEsMjYuNywxMy4xLDQwaDkuNgoJYy0xNy0xNC44LTE5LjQtMjkuMS0xNy4zLTQzLjFjMi4zLTE1LjYsOS44LTI1LjcsMjEuOC0zMi43aC00MC40TDE0Ny4xLDIwOS41eiBNMTM1LjUsMTQxLjVoMjIuOHYtMjMuMUgxNDcsMTM1LjV2MjMuMXoiLz4KPC9zdmc+Cg==" 
                 alt="Ethereum" 
                 className="h-10 w-10" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-gray-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
            <div>
              <div className="font-medium">Ethereum</div>
              <div className="text-xs text-gray-400">0 ETH</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">$0.00</div>
            <div className="text-xs text-gray-400">+$0.00</div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="px-6 py-3 border-t border-gray-800 grid grid-cols-5 items-center">
        <button 
          className={`flex flex-col items-center justify-center ${activeTab === 'home' ? 'opacity-100' : 'opacity-50'}`}
          onClick={() => setActiveTab('home')}
        >
          <Home className={`h-6 w-6 ${activeTab === 'home' ? 'text-[#9b87f5]' : 'text-gray-500'}`} />
        </button>
        <button 
          className={`flex flex-col items-center justify-center ${activeTab === 'apps' ? 'opacity-100' : 'opacity-50'}`}
          onClick={() => setActiveTab('apps')}
        >
          <LayoutGrid className={`h-6 w-6 ${activeTab === 'apps' ? 'text-[#9b87f5]' : 'text-gray-500'}`} />
        </button>
        <button 
          className={`flex flex-col items-center justify-center ${activeTab === 'swap' ? 'opacity-100' : 'opacity-50'}`}
          onClick={() => setActiveTab('swap')}
        >
          <ArrowRightLeft className={`h-6 w-6 ${activeTab === 'swap' ? 'text-[#9b87f5]' : 'text-gray-500'}`} />
        </button>
        <button 
          className={`flex flex-col items-center justify-center ${activeTab === 'history' ? 'opacity-100' : 'opacity-50'}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock className={`h-6 w-6 ${activeTab === 'history' ? 'text-[#9b87f5]' : 'text-gray-500'}`} />
        </button>
        <button 
          className={`flex flex-col items-center justify-center ${activeTab === 'search' ? 'opacity-100' : 'opacity-50'}`}
          onClick={() => setActiveTab('search')}
        >
          <Search className={`h-6 w-6 ${activeTab === 'search' ? 'text-[#9b87f5]' : 'text-gray-500'}`} />
        </button>
      </div>
    </div>
  );
};
