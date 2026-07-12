import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GoogleTagManager from "@/components/GoogleTagManager";
import AnalyticsRouteTracker from "@/components/AnalyticsRouteTracker";
import SiteVerification from "@/components/SiteVerification";
import RedirectToPlan from "@/components/RedirectToPlan";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import PlanBuilder from "./pages/PlanBuilder";
import Exercises from "./pages/Exercises";
import MyPlans from "./pages/MyPlans";
import PlanDetail from "./pages/PlanDetail";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GoogleTagManager />
          <SiteVerification />
          <AnalyticsRouteTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/plan" element={<PlanBuilder />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/plans" element={<MyPlans />} />
            <Route path="/plans/:id" element={<PlanDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<RedirectToPlan />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
