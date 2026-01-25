import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import { TelegramProvider } from './components/TelegramProvider';
import { MainAuth } from './components/Auth/MainAuth';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
      <TelegramProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                {showSplash ? (
                  <SplashScreen onFinish={handleSplashFinish} />
                ) : (
                  <Routes>
                    <Route path="/auth" element={<MainAuth />} />
                    <Route path="/" element={<Index />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                )}
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </TelegramProvider>
    </ErrorBoundary>
  );
};

export default App;
