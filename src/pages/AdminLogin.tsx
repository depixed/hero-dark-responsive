import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2 } from 'lucide-react';
import { signInAdmin, getCurrentUser } from '../lib/supabase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Only allow admin@incorpify.ai to login
    if (email !== 'admin@incorpify.ai') {
      setError('Access denied. This admin panel is restricted.');
      setIsLoading(false);
      return;
    }
    
    try {
      await signInAdmin(email, password);
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) {
    // Still loading
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Already logged in, redirect to admin
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36]">
            Admin Login
          </CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-[#3B00EC] to-[#965BE4] hover:from-[#3500D4] hover:to-[#8951CC]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-400 text-center w-full">
            Protected area for administrators only
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin; 