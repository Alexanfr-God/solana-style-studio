import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useWalletTheme } from '@/state/themeStore';

export const LockLayer: React.FC = () => {
  const theme = useWalletTheme();
  const lockLayer = theme?.lockLayer || {};
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const containerStyle = {
    backgroundColor: lockLayer.backgroundColor || '#1a1a1a',
    backgroundImage: lockLayer.backgroundImage 
      ? `url(${lockLayer.backgroundImage})` 
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1.5rem'
  };

  const titleStyle = {
    color: lockLayer.title?.textColor || '#ffffff',
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: 0
  };

  const inputContainerStyle = {
    backgroundColor: lockLayer.passwordInput?.backgroundColor || '#2a2a2a',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    maxWidth: '300px'
  };

  const inputStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: lockLayer.passwordInput?.textColor || '#ffffff',
    flex: 1,
    fontSize: '1rem',
    ['--placeholder-color' as any]: lockLayer.passwordInput?.placeholderColor || '#9ca3af'
  };

  const eyeIconStyle = {
    color: lockLayer.passwordInput?.iconEyeColor || '#9945FF',
    cursor: 'pointer'
  };

  const forgotPasswordStyle = {
    color: lockLayer.forgotPassword?.textColor || '#9945FF',
    fontSize: '0.875rem',
    textDecoration: 'none',
    cursor: 'pointer'
  };

  const unlockButtonStyle = {
    backgroundColor: lockLayer.unlockButton?.backgroundColor || '#9945FF',
    color: lockLayer.unlockButton?.textColor || '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    maxWidth: '300px'
  };

  return (
    <div 
      data-element-id="unlock-screen-container"
      className="lock-layer"
      style={containerStyle}
    >
      <h1 
        data-element-id="lock-title-text"
        style={titleStyle}
      >
        Enter your password
      </h1>
      
      <div 
        data-element-id="lock-password-input-bg"
        style={inputContainerStyle}
      >
        <input
          data-element-id="lock-password-input-text"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <button
          data-element-id="lock-password-input-icon-eye"
          onClick={() => setShowPassword(!showPassword)}
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: 0,
            ...eyeIconStyle 
          }}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      
      <a 
        data-element-id="lock-forgot-password-text"
        href="#"
        style={forgotPasswordStyle}
      >
        Forgot password?
      </a>
      
      <button 
        data-element-id="lock-unlock-button-bg"
        style={unlockButtonStyle}
      >
        <span data-element-id="lock-unlock-button-text">
          Unlock
        </span>
      </button>
    </div>
  );
};
