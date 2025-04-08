import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Index from "@/pages/Index.tsx";
import NotFound from "@/pages/NotFound.tsx";
import Incorporation from "@/pages/Incorporation.tsx";
import Login from "@/pages/Login.tsx";
import Signup from "@/pages/Signup.tsx";
import UserDashboard from "@/pages/UserDashboard.tsx";
import AiChatPage from "@/pages/AiChatPage.tsx";
import ServicesPage from "@/pages/ServicesPage.tsx";
import SettingsPage from "@/pages/SettingsPage.tsx";
import AdminLogin from "@/pages/AdminLogin.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";
import LeadsPage from "@/pages/LeadsPage.tsx";
import UsersPage from "@/pages/UsersPage.tsx";
import ProposalPage from "@/pages/ProposalPage.tsx";
import ProposalEditor from "@/components/proposal/ProposalEditor.tsx";
import PublicProposalPreview from "@/pages/PublicProposalPreview.tsx";
import AiSettingsPage from "@/pages/AiSettingsPage.tsx";
import { AuthProvider } from "@/contexts/AuthContext.tsx";
import { ThemeProvider } from "@/contexts/ThemeContext.tsx";
import PrivateRoute from "@/components/auth/PrivateRoute.tsx";
import PublicRoute from "@/components/auth/PublicRoute.tsx";
import AdminRoute from "@/components/auth/AdminRoute.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/incorporation" element={<Incorporation />} />
            <Route path="/proposals/:id" element={<PublicProposalPreview />} />
            
            {/* Auth Routes - accessible only when not logged in */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            
            {/* User Dashboard Routes - protected */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            } />
            <Route path="/dashboard/chat" element={
              <PrivateRoute>
                <AiChatPage />
              </PrivateRoute>
            } />
            <Route path="/dashboard/services" element={
              <PrivateRoute>
                <ServicesPage />
              </PrivateRoute>
            } />
            <Route path="/dashboard/settings" element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            } />
            <Route path="/admin/leads" element={
              <AdminRoute>
                <LeadsPage />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            } />
            <Route path="/admin/proposals" element={
              <AdminRoute>
                <ProposalPage />
              </AdminRoute>
            } />
            <Route path="/admin/proposals/:id" element={
              <AdminRoute>
                <ProposalEditor />
              </AdminRoute>
            } />
            <Route path="/admin/proposals/view/:id" element={
              <AdminRoute>
                <ProposalEditor />
              </AdminRoute>
            } />

            {/* AI Settings Route */}
            <Route path="/admin/ai-settings" element={
              <AdminRoute>
                <AiSettingsPage />
              </AdminRoute>
            } />
            
            {/* Redirects */}
            <Route path="/auth/callback" element={<Navigate to="/dashboard" />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1F2937',
                color: '#fff',
                borderRadius: '8px',
                border: '1px solid #374151'
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff'
                }
              }
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
