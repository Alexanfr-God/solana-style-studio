
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { UnifiedWalletRenderer } from './UnifiedWalletRenderer';

interface WalletScreenProps {
  style: WalletStyle;
  isIndexPage?: boolean;
}

export const LoginScreen = ({ style }: WalletScreenProps) => {
  return <UnifiedWalletRenderer style={style} type="login" renderMode="preview" />;
};

export const WalletScreen = ({ style, isIndexPage = false }: WalletScreenProps) => {
  return <UnifiedWalletRenderer style={style} type="wallet" renderMode="preview" />;
};
