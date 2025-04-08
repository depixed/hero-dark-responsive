import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CreditCard, User, Bell, Lock, Plus, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Wait for auth to initialize and then set form data
  useEffect(() => {
    // Don't do anything until auth has finished loading
    if (authLoading) {
      return;
    }
    
    // If we have a user, initialize the form
    if (user) {
      setFormState({
        fullName: profile?.full_name || '',
        email: user.email || '',
        phone: profile?.phone || '',
      });
    } else {
      // If no user is found after auth has loaded, redirect to login
      navigate('/login');
    }
    
    // Loading is complete
    setIsLoading(false);
  }, [user, profile, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      // Here you would update the profile in the database
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            Account Settings
          </h1>
          <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Wrap tabs in an error boundary or conditional rendering to prevent null reference errors */}
        {user && (
          <Tabs defaultValue="profile" className="w-full">
            {/* Add key prop and skip rendering if no theme is defined */}
            {theme && (
              <TabsList 
                key="settings-tabs-list"
                className={`grid grid-cols-3 w-full max-w-md ${theme === 'light' ? 'bg-gray-100' : 'bg-[#1A1A1A] border border-[#2F2F2F]'}`}
              >
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User size={16} /> Profile
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex items-center gap-2">
                  <CreditCard size={16} /> Payment
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell size={16} /> Notifications
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="profile" className="space-y-4 mt-4">
              <Card className={theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-[#2F2F2F]'}>
                <CardHeader>
                  <CardTitle className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
                    Personal Information
                  </CardTitle>
                  <CardDescription className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formState.fullName}
                      onChange={handleChange}
                      className={theme === 'light' ? 'bg-white border-gray-300' : 'bg-[#252525] border-[#3A3A3A] text-white'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      disabled
                      className={theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-[#252525] border-[#3A3A3A] text-white/70 opacity-70'}
                    />
                    <p className="text-xs text-gray-500">To change your email, please contact support.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formState.phone}
                      onChange={handleChange}
                      className={theme === 'light' ? 'bg-white border-gray-300' : 'bg-[#252525] border-[#3A3A3A] text-white'}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5]"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>

              <Card className={theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-[#2F2F2F]'}>
                <CardHeader>
                  <CardTitle className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
                    Password & Security
                  </CardTitle>
                  <CardDescription className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className={`w-full flex items-center justify-center gap-2 ${theme === 'light' ? 'border-gray-300 text-gray-700' : 'border-[#3A3A3A] text-white'}`}
                    >
                      <Lock size={16} /> Change Password
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`w-full flex items-center justify-center gap-2 ${theme === 'light' ? 'border-gray-300 text-gray-700' : 'border-[#3A3A3A] text-white'}`}
                    >
                      <AlertCircle size={16} /> Enable Two-Factor Authentication
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-4">
              <Card className={theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-[#2F2F2F]'}>
                <CardHeader>
                  <CardTitle className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
                    Payment Methods
                  </CardTitle>
                  <CardDescription className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                    Manage your payment methods and billing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-lg border ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-[#2F2F2F] bg-[#252525]'}`}>
                    <div className="flex items-center space-x-4">
                      <CreditCard className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'} />
                      <div>
                        <p className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          No payment methods added
                        </p>
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                          Add a card to enable automatic billing
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5]">
                    <Plus size={16} /> Add Payment Method
                  </Button>
                </CardContent>
              </Card>

              <Card className={theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-[#2F2F2F]'}>
                <CardHeader>
                  <CardTitle className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
                    Billing History
                  </CardTitle>
                  <CardDescription className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                    Review your past invoices and payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`p-8 text-center rounded-lg border ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-[#2F2F2F] bg-[#252525]'}`}>
                    <p className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>
                      No billing history available yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-4">
              <Card className={theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-[#2F2F2F]'}>
                <CardHeader>
                  <CardTitle className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          Email Notifications
                        </h4>
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator className={theme === 'light' ? 'bg-gray-200' : 'bg-[#2F2F2F]'} />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          Service Updates
                        </h4>
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                          Receive updates about your requested services
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator className={theme === 'light' ? 'bg-gray-200' : 'bg-[#2F2F2F]'} />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          Marketing Communications
                        </h4>
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                          Receive promotional offers and updates
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5]"
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage; 