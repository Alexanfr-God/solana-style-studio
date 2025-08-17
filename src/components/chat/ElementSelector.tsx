
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface WalletElement {
  id: string;
  name: string;
  description: string;
  category?: string;
}

interface ElementSelectorProps {
  selectedElement: string;
  onElementSelect: (element: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  elements: WalletElement[];
}

const ElementSelector: React.FC<ElementSelectorProps> = ({
  selectedElement,
  onElementSelect,
  isOpen,
  onToggle,
  elements
}) => {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="w-full justify-between border-white/20 text-white/80 hover:text-white"
      >
        <span>
          {selectedElement || 'Select wallet element...'}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <Card className="bg-black/50 border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Wallet Elements</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {elements.map((element) => (
              <Button
                key={element.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  onElementSelect(element.name);
                  onToggle();
                }}
                className="justify-start text-left h-auto p-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <div>
                  <div className="font-medium text-xs">{element.name}</div>
                  <div className="text-xs text-white/60 mt-1">{element.description}</div>
                  {element.category && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {element.category}
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ElementSelector;
