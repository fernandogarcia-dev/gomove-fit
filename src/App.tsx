import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
import GoogleTagManager from "@/components/GoogleTagManager";
import AnalyticsRouteTracker from "@/components/AnalyticsRouteTracker";
import SiteVerification from "@/components/SiteVerification";
import ClientOnly from "@/components/ClientOnly";
import { AuthProvider } from "@/contexts/AuthContext";
import { captureReferralFromUrl } from "@/lib/referral";
import AppRoutes from "./AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

type AppProps = {
  /** When set, renders with StaticRouter for SSR/prerender. */
  url?: string;
};

const App = ({ url }: AppProps) => {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  const routes = <AppRoutes />;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {url !== undefined ? (
            <StaticRouter location={url}>{routes}</StaticRouter>
          ) : (
            <BrowserRouter>{routes}</BrowserRouter>
          )}
          <ClientOnly>
            <SpeedInsights />
            <GoogleTagManager />
            <SiteVerification />
            <AnalyticsRouteTracker />
          </ClientOnly>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
