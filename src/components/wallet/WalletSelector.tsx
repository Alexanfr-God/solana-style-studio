import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// This component is deprecated in favor of MultichainWalletButton with AppKit
const WalletSelector: React.FC = () => {
  const handleClick = () => {
    toast.error('This component is deprecated. Use MultichainWalletButton instead.');
  };

  return (
    <div className="p-4 text-center">
      <p className="text-muted-foreground mb-2">
        This component has been replaced with MultichainWalletButton using AppKit.
      </p>
      <Button onClick={handleClick} variant="outline" size="sm">
        Deprecated Component
      </Button>
    </div>
  );
};

export default WalletSelector;