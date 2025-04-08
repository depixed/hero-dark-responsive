import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Incorporation from "./pages/Incorporation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AiChatPage from "./pages/AiChatPage";
import ServicesPage from "./pages/ServicesPage";
import SettingsPage from "./pages/SettingsPage";
import AdminLogin from "./pages/AdminLogin";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import UsersPage from "./pages/UsersPage";
import ProposalPage from "./pages/ProposalPage";
import ProposalEditor from "./components/proposal/ProposalEditor";
import PublicProposalPreview from "./pages/PublicProposalPreview";
import AiSettingsPage from "./pages/AiSettingsPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import PublicRoute from "./components/auth/PublicRoute";
import AdminRoute from "./components/auth/AdminRoute";

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
