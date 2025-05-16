
import React, { useState, useEffect } from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { 
  Eye,
  EyeOff,
  HelpCircle,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomizationStore } from '@/stores/customizationStore';

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
const getOptimalTextStyle = (backgroundColor: string, accentColor: string, hasBackgroundImage: boolean) => {
  // Get basic contrast color
  const contrastColor = getTextContrast(backgroundColor);
  
  // Determine if we need a glow effect (especially useful for dark backgrounds with images)
  const needsGlow = hasBackgroundImage || backgroundColor.includes('#13') || backgroundColor.includes('rgb(19');
  
  // Determine if we should use a gradient or solid color
  const useGradient = !hasBackgroundImage || Math.random() > 0.5; // Randomize for some variety
  
  // Calculate a suitable glow color (opposite of text for maximum effect)
  const glowColor = contrastColor === '#000000' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';
  
  if (useGradient) {
    return {
      background: `linear-gradient(to right, ${contrastColor}, ${accentColor})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: needsGlow ? `0 0 8px ${glowColor}` : 'none',
      letterSpacing: '1px',
      textTransform: 'lowercase',
      fontSize: '1.25rem', // text-lg equivalent
      fontWeight: 'bold',
    };
  } else {
    // For better visibility on complex backgrounds, use solid color with optional glow
    return {
      color: contrastColor,
      textShadow: needsGlow ? `0 0 8px ${glowColor}, 0 0 12px ${accentColor}80` : 'none',
      letterSpacing: '1px',
      textTransform: 'lowercase',
      fontSize: '1.35rem', // slightly larger for better visibility
      fontWeight: 'bold',
    };
  }
};

export const LoginScreenPreview = ({ style }: { style: WalletStyle }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { isGenerating } = useCustomizationStore();
  const [textStyle, setTextStyle] = useState<React.CSSProperties>({});

  // Recalculate optimal text style whenever the background or accent color changes
  useEffect(() => {
    const hasBackgroundImage = Boolean(style.backgroundImage);
    setTextStyle(getOptimalTextStyle(
      style.backgroundColor || '#131313', 
      style.accentColor || '#9945FF',
      hasBackgroundImage
    ));
  }, [style.backgroundColor, style.accentColor, style.backgroundImage]);

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
  
  // Determine if we need a backdrop for better readability
  const needsBackdrop = () => {
    // If there's a background image, we likely need a backdrop
    if (style.backgroundImage) return true;
    
    // If background is very similar to text color, we need a backdrop
    // This is a simplified check for demonstration
    return false;
  };
  
  // Get appropriate phantom label color (with contrast)
  const getPhantomLabelColor = () => {
    const phantomColor = style.textColor || '#FFFFFF';
    
    // Check if we need to adjust contrast
    if (style.backgroundColor) {
      return getTextContrast(style.backgroundColor);
    }
    
    return phantomColor;
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
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23" + (style.accentColor?.replace('#', '') || '9945FF') + "' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Header with centered phantom branding */}
      <div className="p-5 flex justify-center items-center relative z-10">
        <div className="text-center" style={textStyle}>
          phantom
        </div>
        <HelpCircle 
          className="h-5 w-5 cursor-pointer transition-transform hover:scale-110 hover:rotate-12 absolute right-5" 
          style={{ 
            color: style.accentColor || '#9945FF', 
            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' 
          }} 
        />
      </div>
      
      {/* Logo and Content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-8 relative z-10">
        {/* Animated Ghost Logo - only displayed when NOT generating */}
        {!isGenerating && (
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
        )}
        
        {/* Semi-transparent backdrop for better readability if needed - made more subtle */}
        <div 
          className={`absolute inset-0 z-0 ${needsBackdrop() ? 'opacity-20' : 'opacity-0'}`} 
          style={{ 
            backgroundColor: '#000000',
            backdropFilter: 'blur(2px)',
          }}
        />
        
        {/* Content container with consistent spacing */}
        <div className="w-full flex flex-col items-center space-y-6 relative z-10">
          {/* Login Title */}
          <h2 
            className="text-2xl font-medium" 
            style={{ 
              color: style.textColor || '#FFFFFF', 
              textShadow: getTextShadow(),
              letterSpacing: '0.5px'
            }}
          >
            Enter your password
          </h2>
          
          {/* Password field with enhanced styling */}
          <div className="w-full max-w-xs">
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
            className="w-full max-w-xs text-center"
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
    </div>
  );
};

export default LoginScreenPreview;
