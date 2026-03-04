import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Eggs from "./pages/Eggs";
import Hens from "./pages/Hens";
import Finance from "./pages/Finance";
import Statistics from "./pages/Statistics";
import Feed from "./pages/Feed";
import Reminders from "./pages/Reminders";
import Hatching from "./pages/Hatching";
import DailyTasks from "./pages/DailyTasks";
import SettingsPage from "./pages/Settings";
import Premium from "./pages/Premium";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground">Laddar...</span></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="eggs" element={<Eggs />} />
        <Route path="hens" element={<Hens />} />
        <Route path="feed" element={<Feed />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="hatching" element={<Hatching />} />
        <Route path="tasks" element={<DailyTasks />} />
        <Route path="finance" element={<Finance />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="premium" element={<Premium />} />
        <Route path="community" element={<Community />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
