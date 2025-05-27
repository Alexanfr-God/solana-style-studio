
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import WalletAlivePlayground from "./pages/WalletAlivePlayground";
import { WalletContextProvider } from "./context/WalletContextProvider";
import FeedbackAnalyticsPage from "./pages/FeedbackAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletContextProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/feedback-analytics" element={<FeedbackAnalyticsPage />} />
            <Route path="/wallet-alive-playground" element={<WalletAlivePlayground />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WalletContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
