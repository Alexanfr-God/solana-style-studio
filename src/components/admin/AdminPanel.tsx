import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreateGuideImageButton from './CreateGuideImageButton';
import { ConvertTrainingDataButton } from './ConvertTrainingDataButton';
import { UniversalTrainingDataManager } from './UniversalTrainingDataManager';
import { AiDomScannerButton } from './AiDomScannerButton';
import { DatabaseSeeder } from './DatabaseSeeder';
import { DiscoveryPanel } from './DiscoveryPanel';
import { Eye } from 'lucide-react';

const AdminPanel = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
      
      <Card className="bg-black/30 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Database Seeder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm mb-4">
            Fill empty tables (presets, schema_versions) with initial data.
            Run this once after database cleanup.
          </p>
          <DatabaseSeeder />
        </CardContent>
      </Card>

      <Card className="bg-black/30 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">AI-Vision: Theme Coverage Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm mb-4">
            Visual analysis of theme coverage with ThemeProbe. 
            Shows colored overlay on wallet elements based on mapping status (OK/AMBIGUOUS/UNMAPPED/NON_SCALAR).
          </p>
          <Link to="/admin/ai-vision">
            <Button className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              Open AI-Vision
            </Button>
          </Link>
        </CardContent>
      </Card>

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

      <DiscoveryPanel />

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
