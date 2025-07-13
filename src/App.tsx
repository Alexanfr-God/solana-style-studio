
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import WalletAlivePlayground from "./pages/WalletAlivePlayground";
import { WalletContextProvider } from "./context/WalletContextProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import { EffectsProvider } from "./contexts/EffectsContext";
import { SplashCursor } from "./components/effects";
import { useEffectsSettings } from "./hooks/useEffectsSettings";
import { Suspense, lazy } from "react";

const queryClient = new QueryClient();

// Lazy load SplashCursor for better performance
const LazyLoadedEffects = () => {
  const { splashCursor } = useEffectsSettings();
  
  if (!splashCursor.enabled) return null;
  
  return <SplashCursor />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <EffectsProvider>
          <WalletContextProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={null}>
              <LazyLoadedEffects />
            </Suspense>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<WalletAlivePlayground />} />
                <Route path="/documentation" element={<Documentation />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </WalletContextProvider>
        </EffectsProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
