import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/features/auth/context/AuthContext";
import { useEffect } from "react";
import { Icons } from "@/components/ui/icons";

// Import layouts
import MainLayout from "@/features/auth/components/MainLayout";

// Import pages
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import ProfilePage from "@/features/auth/pages/ProfilePage";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

// Create a query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

// Component to handle redirects after authentication
const AuthCallbackHandler = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // This effect will run after the component mounts
  }, []);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Icons.spinner className="h-8 w-8 animate-spin" />
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        !isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />
      } />
      <Route path="/register" element={
        !isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />
      } />
      <Route path="/forgot-password" element={
        !isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" replace />
      } />
      <Route path="/reset-password" element={
        !isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" replace />
      } />
      <Route path="/auth/callback" element={<AuthCallbackHandler />} />
      
      {/* Show loading state while auth is being checked */}
      {!isLoading && (
        <Route element={isAuthenticated ? <MainLayout><Outlet /></MainLayout> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      )}
      
      {/* Catch all other routes */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
