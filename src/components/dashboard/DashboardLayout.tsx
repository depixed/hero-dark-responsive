import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items with path and icon
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutGrid size={20} /> },
    { path: '/dashboard/chat', label: 'AI Chat', icon: <MessageSquare size={20} /> },
    { path: '/dashboard/services', label: 'Services', icon: <FileText size={20} /> },
    { path: '/dashboard/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col md:flex-row">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between bg-[#0F0F0F] border-b border-[#2F2F2F] px-4 py-3">
        <div className="flex items-center">
          <button onClick={toggleMobileMenu} className="text-white mr-3">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] bg-clip-text text-transparent">
            Incorpify
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#3B00EC] flex items-center justify-center text-white text-sm font-medium">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu}>
          <div className="absolute top-0 left-0 h-full w-64 bg-[#0F0F0F] border-r border-[#2F2F2F] p-4" 
               onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] bg-clip-text text-transparent">
                  Incorpify
                </h1>
              </div>

              <nav className="flex-1">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isCurrentPath(item.path)
                            ? 'bg-[#3B00EC]/20 text-white'
                            : 'text-gray-400 hover:bg-[#1F1F1F] hover:text-white'
                        }`}
                        onClick={toggleMobileMenu}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-auto pt-4 border-t border-[#2F2F2F]">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <LogOut size={20} className="mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F0F0F] border-r border-[#2F2F2F] p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] bg-clip-text text-transparent">
            Incorpify
          </h1>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCurrentPath(item.path)
                      ? 'bg-[#3B00EC]/20 text-white'
                      : 'text-gray-400 hover:bg-[#1F1F1F] hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-4 border-t border-[#2F2F2F]">
          <div className="flex items-center px-4 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#3B00EC] flex items-center justify-center text-white text-sm font-medium mr-3">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 