
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { LoginScreenPreview } from './preview/LoginScreenPreview';
import { WalletScreenPreview } from './preview/WalletScreenPreview';

interface WalletScreenProps {
  style: WalletStyle;
  isIndexPage?: boolean;
}

export const LoginScreen = ({ style }: WalletScreenProps) => {
  return <LoginScreenPreview style={style} />;
};

export const WalletScreen = ({ style, isIndexPage = false }: WalletScreenProps) => {
  return <WalletScreenPreview style={style} isIndexPage={isIndexPage} />;
};
