
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import WalletAlivePlayground from '@/pages/WalletAlivePlayground';
import Documentation from '@/pages/Documentation';
import NotFound from '@/pages/NotFound';
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
          <Router>
            <Routes>
              <Route path="/" element={<WalletAlivePlayground />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </EffectsProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
