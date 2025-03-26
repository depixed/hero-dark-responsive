import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { getLeads, Lead, getCurrentUser } from '../lib/supabase';

const StatCard = ({ title, value, description, icon, className }: { 
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  className?: string;
}) => (
  <Card className="bg-gray-900 border-gray-800">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
      <div className={`rounded-full p-2 ${className}`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
      <p className="text-xs text-gray-400">{description}</p>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate('/admin/login');
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/admin/login');
        return;
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchLeads = async () => {
      if (isAuthChecking) return;
      
      try {
        const data = await getLeads();
        setLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [isAuthChecking]);

  // Calculate dashboard metrics
  const totalLeads = leads.length;
  
  // Calculate leads this week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const leadsThisWeek = leads.filter(lead => {
    const leadDate = new Date(lead.created_at);
    return leadDate >= startOfWeek;
  }).length;
  
  // Calculate growth rate (mock data for demo)
  const growthRate = totalLeads > 0 ? `+${Math.floor(leadsThisWeek / totalLeads * 100)}%` : '+0%';
  
  // Get most recent lead
  const lastLeadDate = leads.length > 0 
    ? new Date(leads[0].created_at).toLocaleDateString() 
    : 'No leads yet';

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Created At'];
    const csvData = leads.map(lead => [
      lead.name,
      lead.email,
      lead.phone || '',
      lead.status,
      new Date(lead.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome to your incorporation service dashboard.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Leads"
                value={totalLeads}
                description="Total number of incorporation leads"
                icon={<Users className="h-4 w-4 text-blue-600" />}
                className="bg-blue-500/10"
              />
              <StatCard
                title="Leads This Week"
                value={leadsThisWeek}
                description="New leads in the current week"
                icon={<BarChart3 className="h-4 w-4 text-green-600" />}
                className="bg-green-500/10"
              />
              <StatCard
                title="Growth Rate"
                value={growthRate}
                description="Week-over-week growth"
                icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
                className="bg-purple-500/10"
              />
              <StatCard
                title="Last Lead"
                value={lastLeadDate}
                description="Date of most recent lead"
                icon={<Calendar className="h-4 w-4 text-orange-600" />}
                className="bg-orange-500/10"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">Recent leads and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {leads.length > 0 ? (
                    <div className="space-y-4">
                      {leads.slice(0, 5).map((lead) => (
                        <div key={lead.id} className="flex items-center border-b border-gray-800 pb-4">
                          <div className="rounded-full h-8 w-8 bg-purple-900/50 flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{lead.name}</p>
                            <p className="text-xs text-gray-400">
                              Submitted on {new Date(lead.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No leads available yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-400">Tools and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      onClick={() => navigate('/admin/leads')}
                      className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                      <h3 className="font-medium text-white">View Leads</h3>
                      <p className="text-sm text-gray-400">Access your full leads database</p>
                    </div>
                    <div 
                      onClick={handleExportCSV}
                      className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                      <h3 className="font-medium text-white">Export Data</h3>
                      <p className="text-sm text-gray-400">Download lead information as CSV</p>
                    </div>
                    <div 
                      onClick={() => navigate('/admin/settings')}
                      className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                      <h3 className="font-medium text-white">Account Settings</h3>
                      <p className="text-sm text-gray-400">Manage your administrator account</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default DashboardPage; 