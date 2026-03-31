import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import CompanyLogin from "./pages/auth/CompanyLogin.tsx";
import CompanyRegister from "./pages/auth/CompanyRegister.tsx";
import UserLogin from "./pages/auth/UserLogin.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.tsx";
import CompanyDashboard from "./pages/dashboard/CompanyDashboard.tsx";
import UserDashboard from "./pages/dashboard/UserDashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login/company" element={<CompanyLogin />} />
            <Route path="/login/user" element={<UserLogin />} />
            <Route path="/register/company" element={<CompanyRegister />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
