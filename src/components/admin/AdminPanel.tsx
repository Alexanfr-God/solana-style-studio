
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateGuideImageButton from './CreateGuideImageButton';
import { ConvertTrainingDataButton } from './ConvertTrainingDataButton';
import { UniversalTrainingDataManager } from './UniversalTrainingDataManager';
import { AiDomScannerButton } from './AiDomScannerButton';

const AdminPanel = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
      
      <Card className="bg-black/30 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Mask Guide Image</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm mb-4">
            Create the reference guide image (mask-guide-v3.png) for V3 mask generation.
            This is a 1024×1024 white canvas with a black rectangle (320×569) at coordinates x=352, y=228.
          </p>
          <CreateGuideImageButton />
        </CardContent>
      </Card>

      <UniversalTrainingDataManager />

      <Card className="bg-black/30 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">AI Element Mapper</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm mb-4">
            AI automatically scans DOM structure and maps elements to JSON paths.
            Uses Gemini 2.5 Flash for intelligent element detection.
          </p>
          <div className="flex gap-2">
            <AiDomScannerButton screen="home" />
            <AiDomScannerButton screen="search" />
            <AiDomScannerButton screen="buy" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Legacy Background Converter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm mb-4">
            Устаревший конвертер только для фонов. Используйте универсальный конвертер выше.
          </p>
          <ConvertTrainingDataButton />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
