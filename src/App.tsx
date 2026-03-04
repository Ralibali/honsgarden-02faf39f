import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Eggs from "./pages/Eggs";
import Hens from "./pages/Hens";
import Finance from "./pages/Finance";
import Statistics from "./pages/Statistics";
import SettingsPage from "./pages/Settings";
import Premium from "./pages/Premium";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="eggs" element={<Eggs />} />
            <Route path="hens" element={<Hens />} />
            <Route path="finance" element={<Finance />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="premium" element={<Premium />} />
            <Route path="community" element={<Community />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
