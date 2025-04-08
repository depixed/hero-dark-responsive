import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  ChevronDown,
  Menu,
  X,
  FileText,
  BrainCircuit
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { getCurrentUser, signOutUser } from '../lib/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        
        // Admin check - either email is admin@incorpify.ai or user has admin role in metadata
        const isUserAdmin = user && (
          user.email === 'admin@incorpify.ai' || 
          (user.user_metadata && user.user_metadata.role === 'admin')
        );
        
        setIsAuthenticated(!!isUserAdmin);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Leads', path: '/admin/leads', icon: <Users className="h-5 w-5" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { name: 'Proposals', path: '/admin/proposals', icon: <FileText className="h-5 w-5" /> },
    { name: 'AI Settings', path: '/admin/ai-settings', icon: <BrainCircuit className="h-5 w-5" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
  ];
  
  if (isAuthenticated === null) {
    // Still loading, show nothing or a loading spinner
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated === false) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <div className="flex h-screen bg-gray-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-gray-900 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <Link to="/admin" className="flex items-center justify-center">
            <img 
              src="/incorpify-logo.png" 
              alt="Incorpify Logo" 
              className="h-12"
            />
          </Link>
        </div>
        
        <ScrollArea className="flex-1">
          <nav className="px-2 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </ScrollArea>
        
        <div className="p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start text-gray-400 hover:text-white"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Mobile Header and Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex justify-between items-center">
          <Link to="/admin" className="flex items-center">
            <img 
              src="/incorpify-logo.png" 
              alt="Incorpify Logo" 
              className="h-10"
            />
          </Link>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-900 border-r border-gray-800 p-0">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <Link to="/admin" className="flex items-center">
                  <img 
                    src="/incorpify-logo.png" 
                    alt="Incorpify Logo" 
                    className="h-10"
                  />
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                <nav className="px-2 py-4">
                  <ul className="space-y-1">
                    {navItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                            location.pathname === item.path
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.icon}
                          <span className="ml-3">{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </ScrollArea>
              
              <div className="p-4 border-t border-gray-800">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start text-gray-400 hover:text-white"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-950 pt-[80px] md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 