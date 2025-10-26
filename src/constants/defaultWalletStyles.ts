
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
