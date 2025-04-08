import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCurrentUser, 
  signInUser, 
  signUpUser, 
  signOutUser, 
  resetPassword, 
  setupAuthListener,
  getUserProfile
} from '../lib/supabase';
import { User as CustomUser, UserProfile } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPasswordRequest: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const userProfile = await getUserProfile(currentUser.id);
            setProfile(userProfile);
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Set a default empty profile to prevent null references
            setProfile({
              id: '',
              user_id: currentUser.id,
              full_name: '',
              avatar_url: '',
              phone: '',
              created_at: new Date().toISOString()
            });
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        // Clear user and profile on error to prevent inconsistent state
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Set up auth change listener
    const { data: authListener } = setupAuthListener((user) => {
      setUser(user);
      if (user) {
        getUserProfile(user.id)
          .then(profile => {
            setProfile(profile || {
              id: '',
              user_id: user.id,
              full_name: '',
              avatar_url: '',
              phone: '',
              created_at: new Date().toISOString()
            });
          })
          .catch(error => {
            console.error('Error in auth listener when getting profile:', error);
            // Set default profile on error
            setProfile({
              id: '',
              user_id: user.id,
              full_name: '',
              avatar_url: '',
              phone: '',
              created_at: new Date().toISOString()
            });
          });
      } else {
        setProfile(null);
      }
    });

    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      await signUpUser(email, password, fullName);
      toast.success('Sign up successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user } = await signInUser(email, password);
      setUser(user);
      
      if (user) {
        const userProfile = await getUserProfile(user.id);
        setProfile(userProfile);
        toast.success('Signed in successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await signOutUser();
      setUser(null);
      setProfile(null);
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordRequest = async (email: string) => {
    try {
      setLoading(true);
      await resetPassword(email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      toast.error(error.message || 'Failed to send password reset email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      loading, 
      signUp, 
      signIn, 
      signOut,
      resetPasswordRequest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 