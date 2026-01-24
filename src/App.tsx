import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import { TelegramProvider } from './components/TelegramProvider';
import { MainAuth } from './components/Auth/MainAuth';

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    console.log('=== App: handleSplashFinish called ===');
    setShowSplash(false);
    console.log('showSplash set to false');
  };

  console.log('App render - showSplash:', showSplash);

  return (
    <TelegramProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {showSplash ? (
                <>
                  <SplashScreen onFinish={handleSplashFinish} />
                  <div style={{display: 'none'}}>Content hidden while splash is showing</div>
                </>
              ) : (
                <>
                  <div style={{background: '#fef08a', padding: '10px', textAlign: 'center', fontSize: '12px'}}>
                    ✅ SPLASH FINISHED - SHOWING MAIN APP
                  </div>
                  <Routes>
                    <Route path="/auth" element={<MainAuth />} />
                    <Route path="/" element={<Index />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </>
              )}
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </TelegramProvider>
  );
};

export default App;
