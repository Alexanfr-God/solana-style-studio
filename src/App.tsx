import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';

import WalletAlivePlayground from '@/pages/WalletAlivePlayground';
import Documentation from '@/pages/Documentation';
import NotFound from '@/pages/NotFound';
import AdminPanel from '@/components/admin/AdminPanel';
import AiVisionPage from '@/pages/AiVisionPage';
import AdminAiScannerPage from '@/pages/AdminAiScannerPage';
import NftDetailPage from '@/pages/NftDetailPage';
import { EffectsProvider } from '@/contexts/EffectsContext';
import AppBootstrap from '@/components/AppBootstrap';

function App() {
  const queryClient = new QueryClient();

  return (
    <>
      {/* Инициализация темы по умолчанию */}
      <AppBootstrap />
      
      {/* React Query and Effects Providers */}
      <QueryClientProvider client={queryClient}>
        <EffectsProvider>
          <Toaster />
          <ShadcnToaster />
          <Router>
            <Routes>
              <Route path="/" element={<WalletAlivePlayground />} />
              <Route path="/nft/:mintAddress" element={<NftDetailPage />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/ai-vision" element={<AiVisionPage />} />
              <Route path="/admin/ai-scanner" element={<AdminAiScannerPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </EffectsProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
