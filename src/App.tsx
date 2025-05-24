
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';
import FeedbackAnalytics from './pages/FeedbackAnalytics';
import { WalletContextProvider } from './context/WalletContextProvider';
import CustomizationStudio from './components/CustomizationStudio';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <WalletContextProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/feedback-analytics" element={<FeedbackAnalytics />} />
            <Route path="/customizer" element={<CustomizationStudio />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </WalletContextProvider>
      </div>
    </Router>
  );
}

export default App;
