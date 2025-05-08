
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { DollarSign, ArrowRightLeft, Send, Download, Home, Grid2X2, Clock, Search } from 'lucide-react';

export const LoginScreen = ({ style }: { style: WalletStyle }) => {
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden w-full max-w-[280px]"
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
      <div className="p-5 flex justify-center">
        <div className="text-2xl font-medium text-gray-400">phantom</div>
      </div>
      
      {/* Ghost Logo */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-10">
        <div className="mb-8">
          <svg width="120" height="120" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M235.979 78.872C227.055 39.9227 184.481 1 125.009 1C60.3743 1 1 50.7818 1 132.457C1 175.602 19.3409 213.32 53.0853 241.976C55.9253 244.26 61.7537 246.544 65.7073 239.618C69.6609 232.692 65.0609 225.767 60.3743 224.198C31.8155 211.608 22.1814 174.106 22.1814 132.383C22.1814 84.599 52.0278 44.351 78.002 30.562C106.024 15.625 123.537 18.043 142.685 26.14C161.833 34.237 186.784 60.588 188.011 90.909C189.239 121.23 172.598 136.617 147.66 136.912C122.721 137.208 122.721 115.4 122.721 107.229C122.721 97.472 115.271 94.236 109.173 94.236C78.5866 94.236 57.0389 170.056 125.009 171.552C193.106 173.047 213.153 119.864 214.898 98.271C216.643 76.7518 211.352 69.909 235.979 78.872Z" fill="white"/>
          </svg>
        </div>
        
        <h2 className="text-3xl font-medium mb-8 text-white">Enter your password</h2>
        
        {/* Password field */}
        <div className="w-full max-w-xs mb-6">
          <div 
            className="h-14 rounded-lg px-4 flex items-center w-full"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: style.borderRadius || '12px',
            }}
          >
            <span className="opacity-50">Password</span>
          </div>
        </div>
        
        <div className="w-full max-w-xs mb-8">
          <div className="text-center">
            <span className="text-gray-400">Forgot password</span>
          </div>
        </div>
        
        {/* Button */}
        <div className="w-full max-w-xs mt-8">
          <button 
            className="w-full h-14 font-medium text-center"
            style={{ 
              backgroundColor: '#9b87f5',
              color: '#000',
              borderRadius: style.borderRadius || '100px',
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

export const WalletScreen = ({ style }: { style: WalletStyle }) => {
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden w-full max-w-[280px]"
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
            <span className="font-bold">A8</span>
          </div>
          <span className="font-medium">Account 8</span>
          <svg className="ml-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7H16M8 12H16M8 17H16" stroke="#8E9196" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex items-center space-x-3">
          <Search className="h-5 w-5 text-gray-400" />
          <div className="h-5 w-5 flex items-center justify-center border border-gray-600 rounded">
            <span className="text-xs text-gray-400"></span>
          </div>
        </div>
      </div>
      
      {/* Balance */}
      <div className="px-6 py-8">
        <div className="text-5xl font-bold mb-2">$807.73</div>
        <div className="flex items-center space-x-4">
          <span className="text-green-500 font-medium">+$74.96</span>
          <span className="bg-green-500 bg-opacity-20 px-2 rounded text-green-500">+10.23%</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between px-4 pt-0 pb-4">
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-2 bg-gray-800">
            <Download className="h-5 w-5 text-[#9b87f5]" />
          </div>
          <span className="text-xs text-gray-400">Receive</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-2 bg-gray-800">
            <Send className="h-5 w-5 text-[#9b87f5]" />
          </div>
          <span className="text-xs text-gray-400">Send</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-2 bg-gray-800">
            <ArrowRightLeft className="h-5 w-5 text-[#9b87f5]" />
          </div>
          <span className="text-xs text-gray-400">Swap</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-2 bg-gray-800">
            <DollarSign className="h-5 w-5 text-[#9b87f5]" />
          </div>
          <span className="text-xs text-gray-400">Buy</span>
        </div>
      </div>
      
      {/* Assets List */}
      <div className="flex-1 p-4 pt-2">
        {/* Solana Asset */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'rgba(40, 40, 40, 0.6)',
            borderRadius: style.borderRadius || '16px',
          }}
        >
          <div className="flex items-center">
            <div className="mr-3">
              <img src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgd2lkdGg9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Zz48cGF0aCBkPSJtMCAwaDE4OS4xMDhsLTQ2LjYwNCA0OC43ODloLTg5LjIzMnoiIHRyYW5zZm9ybT0ibWF0cml4KDAgMSAtMSAwIDQ4Ljc4OSAtLjAwMDAwMDAxKSIgZmlsbD0iIzAwZmZhMyIvPjxwYXRoIGQ9Im0wIDBoMTQyLjUwNGwtNDYuNjAzIDQ4Ljc4OWgtNDIuNjI4eiIgdHJhbnNmb3JtPSJtYXRyaXgoMCAxIC0xIDAgMjA3LjI5MyAxNTguNjAxKSIgZmlsbD0iIzAwZmZhMyIvPjxwYXRoIGQ9Im01My4yNzMgMTU4LjYwMWg0Mi42Mjh2LTQ4Ljc4OWg0Ni42MDN2NDguNzg5aDQyLjYyOGwtNjUuOTMgNjguOTYzeiIgZmlsbD0iI00yMDFFNUEiLz48cGF0aCBkPSJtMCAwaDQ2LjYwM2g0Mi42Mjh2NDguNzg5eiIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIC0xIDg5LjIzMSAxNTguNjAxKSIgZmlsbD0iI0M0QzRGRiIvPjxwYXRoIGQ9Im01My4yNzMgMTA5LjgxMmgwLTUzLjI3M2g5OS41MDR2NDguNzg5eiIgZmlsbD0iIzAwZmZhMyIvPjwvZz48L3N2Zz4=" 
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
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'rgba(40, 40, 40, 0.6)',
            borderRadius: style.borderRadius || '16px',
          }}
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
        
        {/* Another Ethereum Asset */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'rgba(40, 40, 40, 0.6)',
            borderRadius: style.borderRadius || '16px',
          }}
        >
          <div className="flex items-center">
            <div className="mr-3 relative">
              <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyOTMuOSAzMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5My45IDMwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM2N0MxRDM7fQoJLnN0MXtmaWxsOiM0QjlGQjE7fQoJLnN0MntmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTQ3LjEsMEMxMDcuMywwLDcxLjksMTcuOCw0Ni43LDQzLjFjLTI1LjIsMjUuMy00My4xLDYwLjgtNDMuMSwxMDAuN3MxNy44LDc1LjQsNDMuMSwxMDAuN3MxMDAuNyw0My4xLDE0MC42LDQzLjEKCWMzOS45LDAsNzUuNC0xNy44LDEwMC43LTQzLjFjMjUuMi0yNS4zLDQzLjEtNjAuOCw0My4xLTEwMC43YzAtMzkuOS0xNy44LTc1LjMtNDMuMS0xMDAuN1MyOTIuMywyMCwyMTIuMiwwSDE0Ny4xeiIvPgo8cGF0aCBjbGFzcz0ic3QyIiBkPSJNNzEuMywxMTcuOGwxMS42LDkuNWgxMzYuMmwtMTEuNi05LjVMNzEuMywxMTcuOHogTTk1LjcsMTk4bDU3LjQsNjguOWw0My4xLTU3LjRoLTExLjZMMTQxLjUsMjY3bC00NS44LTY5aDExLjZ6Ck0xNDcuMSwyMDkuNWMtMTguLTExLjYtMzYtMTUuOC02OC45LTM0LjhsMTEuNiwyMy4xbDExLjYsOS41YzExLjYsOS41LDE0LjYsMTksMTEuNiw0My4xYy0zLDE4LjUtOC45LDMzLjgtMjguNCw0Ni4ydjguMwoJbDExLjYtOC4zYzIwLjUtMTMuMSwyNi40LTMwLjIsMjguOS01MS41YzEuNC0xOS42LTEuOS0zMi43LTE2LTQ2LjJoMjMuMWMtMTEuNiwxMS42LTE5LjksMjMuMS0yMCw0My4xYzAsMTEuNiwzLjEsMjYuNywxMy4xLDQwaDkuNgoJYy0xNy0xNC44LTE5LjQtMjkuMS0xNy4zLTQzLjFjMi4zLTE1LjYsOS44LTI1LjcsMjEuOC0zMi43aC00MC40TDE0Ny4xLDIwOS41eiBNMTM1LjUsMTQxLjVoMjIuOHYtMjMuMUgxNDcsMTM1LjV2MjMuMXoiLz4KPC9zdmc+Cg==" 
                 alt="Ethereum" 
                 className="h-10 w-10" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-gray-700">
                <span className="text-[8px]">🔒</span>
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
      <div className="px-6 py-3 border-t border-gray-800 flex justify-between items-center">
        <div className="flex flex-col items-center">
          <Home className="h-6 w-6 text-[#9b87f5]" />
        </div>
        <div className="flex flex-col items-center">
          <Grid2X2 className="h-6 w-6 text-gray-500" />
        </div>
        <div className="flex flex-col items-center">
          <ArrowRightLeft className="h-6 w-6 text-gray-500" />
        </div>
        <div className="flex flex-col items-center">
          <Clock className="h-6 w-6 text-gray-500" />
        </div>
        <div className="flex flex-col items-center">
          <Search className="h-6 w-6 text-gray-500" />
        </div>
      </div>
    </div>
  );
};
