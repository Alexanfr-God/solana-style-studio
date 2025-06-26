
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import WalletAlivePlayground from "./pages/WalletAlivePlayground";
import { WalletContextProvider } from "./context/WalletContextProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletContextProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WalletAlivePlayground />} />
            <Route path="/documentation" element={<Documentation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WalletContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
