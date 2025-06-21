
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { LoginScreenPreview } from './preview/LoginScreenPreview';
import { WalletScreenPreview } from './preview/WalletScreenPreview';
import { PlaygroundLoginPreview } from './preview/PlaygroundLoginPreview';
import { PlaygroundWalletPreview } from './preview/PlaygroundWalletPreview';

export const LoginScreen = ({ style }: { style: WalletStyle }) => {
  return <LoginScreenPreview style={style} />;
};

export const WalletScreen = ({ style }: { style: WalletStyle }) => {
  return <WalletScreenPreview style={style} />;
};

// New components for WalletAlivePlayground
export const PlaygroundLoginScreen = () => {
  return <PlaygroundLoginPreview />;
};

export const PlaygroundWalletScreen = () => {
  return <PlaygroundWalletPreview />;
};
