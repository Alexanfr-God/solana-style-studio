
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { LoginScreenPreview } from './preview/LoginScreenPreview';
import { WalletScreenPreview } from './preview/WalletScreenPreview';

export const LoginScreen = ({ style }: { style: WalletStyle }) => {
  return <LoginScreenPreview style={style} />;
};

export const WalletScreen = ({ style }: { style: WalletStyle }) => {
  return <WalletScreenPreview style={style} />;
};
