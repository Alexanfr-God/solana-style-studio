
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ElementSelectorProps {
  onSelect: (element: string) => void;
  onClose: () => void;
}

const walletElements = [
  { id: 'header', name: 'Header Bar', description: 'Top navigation and wallet name' },
  { id: 'balance', name: 'Balance Display', description: 'Main balance and portfolio value' },
  { id: 'login-screen', name: 'Login Screen', description: 'Password input and unlock button' },
  { id: 'action-buttons', name: 'Action Buttons', description: 'Send, Receive, Swap buttons' },
  { id: 'asset-list', name: 'Asset List', description: 'Token balances and prices' },
  { id: 'navigation', name: 'Bottom Navigation', description: 'Tab navigation bar' },
  { id: 'background', name: 'Background', description: 'Overall wallet background' },
  { id: 'colors', name: 'Color Scheme', description: 'Primary and accent colors' },
  { id: 'typography', name: 'Typography', description: 'Fonts and text styling' },
  { id: 'icons', name: 'Icons', description: 'Wallet and UI icons' },
];

const ElementSelector = ({ onSelect, onClose }: ElementSelectorProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-black/90 border-white/20 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Select Wallet Element</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {walletElements.map((element) => (
            <Button
              key={element.id}
              variant="outline"
              className="h-auto p-4 border-white/20 text-left hover:bg-white/10"
              onClick={() => onSelect(element.name)}
            >
              <div>
                <div className="font-medium text-white">{element.name}</div>
                <div className="text-sm text-white/60 mt-1">{element.description}</div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ElementSelector;
