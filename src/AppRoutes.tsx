import { Routes, Route } from "react-router-dom";
import RedirectToPlan from "@/components/RedirectToPlan";
import Index from "./pages/Index";
import PlanBuilder from "./pages/PlanBuilder";
import Exercises from "./pages/Exercises";
import MyPlans from "./pages/MyPlans";
import PlanDetail from "./pages/PlanDetail";
import Pro from "./pages/Pro";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Guides from "./pages/Guides";
import SeoLanding from "./pages/SeoLanding";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/plan" element={<PlanBuilder />} />
    <Route path="/exercises" element={<Exercises />} />
    <Route path="/guides" element={<Guides />} />
    <Route path="/guides/:slug" element={<SeoLanding />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/plans" element={<MyPlans />} />
    <Route path="/plans/:id" element={<PlanDetail />} />
    <Route path="/pro" element={<Pro />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/login" element={<Login />} />
    <Route path="/chat" element={<RedirectToPlan />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
