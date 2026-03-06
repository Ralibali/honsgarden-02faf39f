import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import React, { Suspense } from "react";
import CookieConsent from "./components/CookieConsent";

// Eager: landing + login (critical path)
import Index from "./pages/Index";
import Login from "./pages/Login";

// Lazy: everything behind auth
const AppLayout = React.lazy(() => import("./components/AppLayout"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Eggs = React.lazy(() => import("./pages/Eggs"));
const Hens = React.lazy(() => import("./pages/Hens"));
const Finance = React.lazy(() => import("./pages/Finance"));
const Statistics = React.lazy(() => import("./pages/Statistics"));
const Feed = React.lazy(() => import("./pages/Feed"));
const Reminders = React.lazy(() => import("./pages/Reminders"));
const Hatching = React.lazy(() => import("./pages/Hatching"));
const DailyTasks = React.lazy(() => import("./pages/DailyTasks"));
const SettingsPage = React.lazy(() => import("./pages/Settings"));
const Premium = React.lazy(() => import("./pages/Premium"));
const Community = React.lazy(() => import("./pages/Community"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Admin = React.lazy(() => import("./pages/Admin"));
const Terms = React.lazy(() => import("./pages/Terms"));
const HenProfile = React.lazy(() => import("./pages/HenProfile"));
const WeeklyReport = React.lazy(() => import("./pages/WeeklyReport"));
const Guides = React.lazy(() => import("./pages/Guides"));
const GuideArticle = React.lazy(() => import("./pages/GuideArticle"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <span className="text-2xl">🥚</span>
      <span className="text-sm text-muted-foreground">Laddar...</span>
    </div>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Clear React Query cache when user changes to prevent data leakage
function CacheClearer() {
  const { user } = useAuth();
  const prevUserId = React.useRef<string | null>(user?.id ?? null);

  React.useEffect(() => {
    if (user?.id !== prevUserId.current) {
      queryClient.clear();
      prevUserId.current = user?.id ?? null;
    }
  }, [user?.id]);

  return null;
}

const AppRoutes = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
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
          <Route path="admin" element={<Admin />} />
          <Route path="hens/:henId" element={<HenProfile />} />
          <Route path="weekly-report" element={<WeeklyReport />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CacheClearer />
        <AppRoutes />
        <CookieConsent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
