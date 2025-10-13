import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { LockLayer } from './layers/LockLayer';
import { UnifiedWalletRenderer } from './UnifiedWalletRenderer';

interface WalletScreenProps {
  style: WalletStyle;
  isIndexPage?: boolean;
}

export const LoginScreen = ({ style }: WalletScreenProps) => {
  return <LockLayer />;
};

export const WalletScreen = ({ style, isIndexPage = false }: WalletScreenProps) => {
  return <UnifiedWalletRenderer style={style} type="wallet" renderMode="preview" />;
};
