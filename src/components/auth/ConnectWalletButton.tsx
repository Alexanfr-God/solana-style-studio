import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// This component is deprecated in favor of MultichainWalletButton with AppKit
const ConnectWalletButton: React.FC = () => {
  const handleClick = () => {
    toast.error('This component is deprecated. Use MultichainWalletButton instead.');
  };

  return (
    <Button onClick={handleClick} variant="outline">
      Deprecated Component
    </Button>
  );
};

export default ConnectWalletButton;