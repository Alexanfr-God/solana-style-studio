
import React, { useState, useEffect } from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { 
  Eye,
  EyeOff,
  HelpCircle,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

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

// Helper for contrast checking
const getTextContrast = (backgroundColor: string): string => {
  if (!backgroundColor) return '#FFFFFF';
  
  let r = 0, g = 0, b = 0;
  
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (backgroundColor.startsWith('rgb')) {
    const match = backgroundColor.match(/\d+/g);
    if (match && match.length >= 3) {
      r = parseInt(match[0]);
      g = parseInt(match[1]);
      b = parseInt(match[2]);
    }
  }
  
  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.6 ? "#000000" : "#FFFFFF";
};

// New helper function to determine optimal text styling based on background
const getOptimalTextStyle = (backgroundColor: string, accentColor: string, hasBackgroundImage: boolean): React.CSSProperties => {
  // Get basic contrast color
  const contrastColor = getTextContrast(backgroundColor);
  
  // Determine if we need a glow effect (especially useful for dark backgrounds with images)
  const needsGlow = hasBackgroundImage || backgroundColor.includes('#13') || backgroundColor.includes('rgb(19');
  
  // For better visibility and more reliable rendering, prioritize solid styling with optional effects
  return {
    color: needsGlow ? accentColor : contrastColor,
    textShadow: needsGlow ? `0 0 8px ${accentColor}80, 0 0 4px rgba(0,0,0,0.3)` : 'none',
    letterSpacing: '0.5px',
    textTransform: 'lowercase' as 'lowercase',
    fontSize: '1.35rem',
    fontWeight: 'bold',
    position: 'relative',
    zIndex: 10,
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    transition: 'all 0.3s ease',
    display: 'inline-block',
  };
};

export const PlaygroundLoginPreview = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { isGenerating, loginStyle } = useWalletCustomizationStore();
  const [textStyle, setTextStyle] = useState<React.CSSProperties>({});

  // Use the loginStyle from walletCustomizationStore
  const currentStyle = loginStyle;

  // Recalculate optimal text style whenever the background or accent color changes
  useEffect(() => {
    const hasBackgroundImage = Boolean(currentStyle.backgroundImage);
    setTextStyle(getOptimalTextStyle(
      currentStyle.backgroundColor || '#131313', 
      currentStyle.accentColor || '#9945FF',
      hasBackgroundImage
    ));
  }, [currentStyle.backgroundColor, currentStyle.accentColor, currentStyle.backgroundImage]);

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
    if (currentStyle.backgroundImage) {
      return {
        backgroundImage: currentStyle.backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    // Create a more sophisticated background if no image
    return {
      background: `linear-gradient(135deg, ${currentStyle.backgroundColor || '#131313'} 0%, ${currentStyle.accentColor || '#9945FF'}33 100%)`,
    };
  };

  // Get custom text shadow based on theme
  const getTextShadow = () => {
    const isDark = currentStyle.backgroundColor?.includes('#13') || currentStyle.backgroundColor?.includes('rgb(19');
    return isDark ? '0 0 10px rgba(255,255,255,0.3)' : '0 0 10px rgba(0,0,0,0.2)';
  };
  
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden w-full h-full relative"
      style={{
        ...getBackgroundStyle(),
        color: currentStyle.textColor || '#FFFFFF',
        fontFamily: currentStyle.fontFamily,
        boxShadow: currentStyle.boxShadow || '0 10px 25px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Animated overlay for extra visual effect */}
      <div 
        className="absolute inset-0 z-0 opacity-20" 
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.74 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23" + (currentStyle.accentColor?.replace('#', '') || '9945FF') + "' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Header with centered phantom branding */}
      <div className="p-3 flex justify-center items-center relative z-10">
        <div 
          className="text-center relative" 
          style={textStyle}
        >
          phantom
          <div 
            className="absolute bottom-0 left-0 w-full h-[2px] transform origin-left"
            style={{ 
              backgroundColor: currentStyle.accentColor || '#9945FF',
              animation: 'pulseWidth 3s infinite alternate',
              opacity: 0.6
            }}
          />
        </div>
        <HelpCircle 
          className="h-4 w-4 cursor-pointer transition-transform hover:scale-110 hover:rotate-12 absolute right-3" 
          style={{ 
            color: currentStyle.accentColor || '#9945FF', 
            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' 
          }} 
        />
      </div>
      
      {/* Main container with three zones */}
      <div className="flex-1 flex flex-col relative z-10">
        
        {/* Center Zone - Ghost Logo */}
        <div className="flex-1 flex items-center justify-center">
          {!isGenerating && (
            <div className="relative transition-transform hover:scale-105" style={{ filter: 'drop-shadow(0 0 8px ' + currentStyle.accentColor + '50)' }}>
              <img 
                src="/lovable-uploads/f2da1dab-e2e7-4a42-bcb5-8a24a140d4fc.png" 
                alt="Phantom Ghost Logo" 
                width="120" 
                height="120" 
                className="max-w-[120px] animate-pulse-slow"
                style={{
                  filter: currentStyle.accentColor ? `hue-rotate(${getHueRotate(currentStyle.accentColor)}deg) saturate(1.2)` : 'none'
                }}
              />
              <div className="absolute inset-0 bg-transparent rounded-full animate-ping opacity-30" 
                style={{ border: `2px solid ${currentStyle.accentColor || '#9945FF'}` }}
              />
            </div>
          )}
        </div>
        
        {/* Bottom Zone - Login Form */}
        <div className="pb-6 px-4 space-y-3">
          {/* Login Title */}
          <h2 
            className="text-lg font-medium text-center" 
            style={{ 
              color: currentStyle.textColor || '#FFFFFF', 
              textShadow: getTextShadow(),
              letterSpacing: '0.5px'
            }}
          >
            Enter your password
          </h2>
          
          {/* Password field */}
          <div className="w-full max-w-sm mx-auto">
            <div 
              className="h-10 px-4 flex items-center w-full relative overflow-hidden backdrop-blur-sm group transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                borderRadius: currentStyle.borderRadius || '100px',
                border: `1px solid ${currentStyle.accentColor}40`,
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white transition-colors text-sm"
                placeholder="Password"
                style={{
                  caretColor: currentStyle.accentColor || '#9945FF',
                }}
              />
              {password.length > 0 && (
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                  style={{ color: currentStyle.accentColor || '#9945FF' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
              
              <div className="absolute bottom-0 left-0 w-full h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform"
                style={{ backgroundColor: currentStyle.accentColor || '#9945FF' }}
              />
            </div>
          </div>
          
          {/* Forgot password link */}
          <div 
            className="w-full max-w-sm mx-auto text-center"
            onClick={handleForgotPassword}
          >
            <span 
              className="text-gray-400 text-xs cursor-pointer hover:text-gray-300 relative group"
              style={{ transition: 'all 0.3s ease' }}
            >
              Forgot password?
              <span 
                className="absolute left-0 right-0 bottom-0 h-[1px] transform scale-x-0 group-hover:scale-x-100 transition-transform" 
                style={{ backgroundColor: currentStyle.accentColor || '#9945FF' }}
              />
            </span>
          </div>
          
          {/* Unlock Button */}
          <div className="w-full max-w-sm mx-auto pt-2">
            <button 
              onClick={handleUnlock}
              className="w-full h-10 font-medium text-center transition-all relative overflow-hidden group hover:shadow-lg active:scale-[0.98] text-sm"
              style={{ 
                backgroundColor: currentStyle.buttonColor || '#9b87f5',
                color: currentStyle.buttonTextColor || '#000000',
                borderRadius: currentStyle.borderRadius || '100px',
                boxShadow: `0 4px 10px ${currentStyle.buttonColor}80 || rgba(155, 135, 245, 0.5)`,
              }}
            >
              <span 
                className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(45deg, transparent 25%, ${currentStyle.accentColor || '#9b87f5'}40 50%, transparent 75%)`,
                  backgroundSize: '200% 200%',
                  animation: 'shine 1.5s infinite linear'
                }}
              />
              
              <span className="relative z-10">Unlock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundLoginPreview;
