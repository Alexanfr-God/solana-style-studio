
import { WalletStyle } from '../stores/customizationStore';

export const defaultLoginStyle: WalletStyle = {
  backgroundColor: '#131313',
  accentColor: '#9945FF', // Phantom purple
  textColor: '#FFFFFF',
  buttonColor: '#9945FF', // Phantom purple for button
  buttonTextColor: '#000000', // Black text on purple button
  borderRadius: '100px', // Phantom uses more rounded corners for login components
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
};

export const defaultWalletStyle: WalletStyle = {
  backgroundColor: '#131313',
  accentColor: '#9945FF', // Phantom purple
  textColor: '#FFFFFF',
  buttonColor: 'rgba(40, 40, 40, 0.8)', // Dark gray for action buttons
  buttonTextColor: '#9945FF', // Purple text on dark buttons
  borderRadius: '16px', // Phantom uses rounded corners
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
};

export const defaultLockLayerStyle = {
  backgroundColor: '#181818',
  backgroundImage: '',
  title: {
    textColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    fontSize: '18px',
    fontWeight: '500'
  },
  passwordInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    textColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '12px',
    border: 'none',
    placeholderColor: '#9CA3AF',
    iconEyeColor: '#9CA3AF'
  },
  unlockButton: {
    backgroundColor: '#9945FF',
    textColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '600'
  },
  forgotPassword: {
    textColor: '#9CA3AF',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px'
  }
};
