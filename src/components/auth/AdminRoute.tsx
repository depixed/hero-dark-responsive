import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../../lib/supabase';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = await getCurrentUser();
        
        // Admin check - either email is admin@incorpify.ai or user has admin role in metadata
        const isUserAdmin = user && (
          user.email === 'admin@incorpify.ai' || 
          (user.user_metadata && user.user_metadata.role === 'admin')
        );
        
        setIsAdmin(!!isUserAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    // Show loading state while checking
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Redirect to login if not admin
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render children if user is admin
  return <>{children}</>;
};

export default AdminRoute; 