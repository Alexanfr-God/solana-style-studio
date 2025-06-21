
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { DemoIndexLoginScreenPreview } from './preview/DemoIndexLoginScreenPreview';
import { DemoIndexWalletScreenPreview } from './preview/DemoIndexWalletScreenPreview';

interface WalletScreenProps {
  style: WalletStyle;
  isIndexPage?: boolean;
}

export const LoginScreen = ({ style }: WalletScreenProps) => {
  return <DemoIndexLoginScreenPreview style={style} />;
};

export const WalletScreen = ({ style, isIndexPage = false }: WalletScreenProps) => {
  return <DemoIndexWalletScreenPreview style={style} isIndexPage={isIndexPage} />;
};
