
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickTest {
  prompt: string;
  style: 'cartoon' | 'realistic' | 'fantasy' | 'modern' | 'minimalist';
}

interface QuickTestsProps {
  onRunQuickTest: (prompt: string, style: 'cartoon' | 'realistic' | 'fantasy' | 'modern' | 'minimalist') => void;
  isGenerating: boolean;
}

const QuickTests = ({ onRunQuickTest, isGenerating }: QuickTestsProps) => {
  const quickTests: QuickTest[] = [
    { prompt: "cute anime character touching the unlock button", style: 'cartoon' },
    { prompt: "cyberpunk hacker pointing at the balance display", style: 'modern' },
    { prompt: "magical fairy embracing the wallet interface", style: 'fantasy' },
    { prompt: "realistic businessman protecting the login screen", style: 'realistic' },
    { prompt: "minimalist robot sitting next to the send button", style: 'minimalist' }
  ];

  return (
    <Card className="bg-black/30 backdrop-blur border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm">Quick Test Scenarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {quickTests.map((test, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onRunQuickTest(test.prompt, test.style)}
              disabled={isGenerating}
              className="w-full text-left justify-start border-white/10 text-white/80 hover:text-white text-xs h-auto py-3 px-3"
            >
              <div className="text-left w-full">
                <div className="font-medium text-purple-300 capitalize mb-1">{test.style}</div>
                <div className="text-xs text-white/60 leading-relaxed">{test.prompt}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickTests;
