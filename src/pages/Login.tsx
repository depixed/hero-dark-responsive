import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Loader2, ChevronLeft } from 'lucide-react';

const Login = () => {
  const { signIn, resetPasswordRequest, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetEmail = () => {
    if (!resetEmail.trim()) {
      setErrors({ resetEmail: 'Email is required' });
      return false;
    } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setErrors({ resetEmail: 'Please enter a valid email address' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await signIn(formData.email, formData.password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateResetEmail()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await resetPasswordRequest(resetEmail);
      setResetEmailSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] bg-clip-text text-transparent">
            {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-gray-400">
            {showForgotPassword 
              ? 'Enter your email to receive a password reset link' 
              : 'Sign in to your Incorpify account'}
          </p>
        </div>
        
        <div className="bg-[#1A1A1A] border border-[#2F2F2F] rounded-lg p-8 shadow-lg">
          {showForgotPassword ? (
            resetEmailSent ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100/10 mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-green-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white">Check Your Email</h3>
                <p className="text-gray-400">
                  We've sent a password reset link to <span className="text-white">{resetEmail}</span>
                </p>
                <Button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setResetEmail('');
                  }}
                  className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white h-12 rounded-lg font-medium mt-4"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="text-white">Email Address</Label>
                  <Input
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (errors.resetEmail) {
                        setErrors({});
                      }
                    }}
                    className={`bg-[#0F0F0F] border-[#2F2F2F] text-white h-12 rounded-lg px-4 ${
                      errors.resetEmail ? 'border-red-500' : 'focus:border-[#8e53e5]'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.resetEmail && <p className="text-sm text-red-500">{errors.resetEmail}</p>}
                </div>
                
                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white h-12 rounded-lg font-medium"
                  >
                    {isSubmitting || loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full bg-transparent border border-[#2F2F2F] text-white h-12 rounded-lg font-medium hover:bg-[#2F2F2F]/20"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`bg-[#0F0F0F] border-[#2F2F2F] text-white h-12 rounded-lg px-4 ${
                    errors.email ? 'border-red-500' : 'focus:border-[#8e53e5]'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#8e53e5] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`bg-[#0F0F0F] border-[#2F2F2F] text-white h-12 rounded-lg px-4 ${
                    errors.password ? 'border-red-500' : 'focus:border-[#8e53e5]'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white h-12 rounded-lg font-medium"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          )}
          
          {!showForgotPassword && (
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#8e53e5] hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 